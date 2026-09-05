//! pilote.rs — le pont natif (AR-P1(a), C.2-b). Rust pilote le processus du
//! CLI EMBARQUE via `std::process::Command` (le meme idiome que `sonder`
//! dans lib.rs — zero dependance neuve, zero permission neuve, CA-P12),
//! decoupe sa sortie LIGNE PAR LIGNE, et reemet CHAQUE LIGNE TELLE QUELLE au
//! front comme un evenement Tauri. Le Rust ne PARSE PAS le contenu metier
//! d'une ligne (une chaine brute transite) : c'est le front qui interprete
//! le contrat NDJSON, sinon on aurait deux lecteurs du contrat (§ 5 etape 2
//! de specs/instructions/pilotage-reel-facade-contrat-machine.md). Seule
//! exception, minimale et structurelle : l'ENVELOPPE (`evt`, `etape`) est
//! survolee pour correler une demande de feu vert a sa reponse (CA-P7) —
//! jamais les six champs metier d'une annonce, jamais une decision.
//!
//! `--root` est TOUJOURS epingle sur la racine de la ressource embarquee :
//! sans cette option, le moteur peut retomber sur un reservoir "vivant"
//! trouve par convention sur le poste (mesure a l'etape 0 du cadrage) — la
//! facade ne doit JAMAIS dependre de ce qui se trouve par ailleurs sur la
//! machine de l'utilisateur (AR-3).

use serde::Serialize;
use std::io::{BufRead, BufReader, Read, Write};
use std::path::{Path, PathBuf};
use std::process::{Child, ChildStdin, Command, Stdio};
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, State};

/// Le MEME nom de programme que celui sonde par `detect_prerequisites`
/// (lib.rs) — jamais un second chemin de resolution.
pub const NODE_BIN: &str = "node";

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ModeInstallation {
    Apercu,
    Reel,
}

impl ModeInstallation {
    pub fn depuis_str(s: &str) -> Result<Self, String> {
        match s {
            "apercu" => Ok(ModeInstallation::Apercu),
            "reel" => Ok(ModeInstallation::Reel),
            autre => Err(format!(
                "mode d'installation inconnu : \"{autre}\" (attendu \"apercu\" ou \"reel\")"
            )),
        }
    }
}

/// Les trois options d'isolement du bac a sable (AR-P4).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct OptionsBacASable {
    pub target_claude: PathBuf,
    pub apps_dir: PathBuf,
    pub backup_dir: PathBuf,
}

/// AR-P4(a) / CA-P14 — en mode developpement (tests inclus), la chaine
/// REFUSE de se lancer sans `IAKAINSTALL_SANDBOX` pointant un repertoire
/// HORS de `$HOME/.claude` et `$HOME/Applications`. En production, l'absence
/// de la variable laisse la chaine ecrire aux vrais chemins (c'est le
/// produit) — c'est alors le gate humain (§ 8 de l'instruction) qui recette.
pub fn resoudre_bac_a_sable(
    lire_env: impl Fn(&str) -> Option<String>,
    home: Option<PathBuf>,
    mode_developpement: bool,
) -> Result<Option<OptionsBacASable>, String> {
    if let Some(sbx) = lire_env("IAKAINSTALL_SANDBOX") {
        let base = PathBuf::from(&sbx);
        if let Some(home) = &home {
            let claude_dir = home.join(".claude");
            let apps_dir_utilisateur = home.join("Applications");
            if base.starts_with(&claude_dir) || base.starts_with(&apps_dir_utilisateur) {
                return Err(format!(
                    "IAKAINSTALL_SANDBOX (\"{}\") est sous {} ou {} — refuse (AR-P4)",
                    base.display(),
                    claude_dir.display(),
                    apps_dir_utilisateur.display()
                ));
            }
        }
        return Ok(Some(OptionsBacASable {
            target_claude: base.join("claude"),
            apps_dir: base.join("apps"),
            backup_dir: base.join("backups"),
        }));
    }
    if mode_developpement {
        return Err(
            "mode developpement : IAKAINSTALL_SANDBOX doit etre defini (bac a sable AR-P4, CA-P14)"
                .to_string(),
        );
    }
    Ok(None)
}

/// Construit l'argv de la chaine — EXACTEMENT les drapeaux du protocole
/// machine (CA-P8) : `install --events --feu-vert stdin --root <ressource>`,
/// jamais un drapeau de confirmation automatique du moteur.
pub fn construire_argv(
    racine_ressource: &Path,
    mode: ModeInstallation,
    bac_a_sable: Option<&OptionsBacASable>,
) -> Vec<String> {
    let index_js = racine_ressource.join("src").join("index.js");
    let mut argv = vec![
        index_js.to_string_lossy().to_string(),
        "install".to_string(),
        "--events".to_string(),
        "--feu-vert".to_string(),
        "stdin".to_string(),
        "--root".to_string(),
        racine_ressource.to_string_lossy().to_string(),
    ];
    if mode == ModeInstallation::Apercu {
        argv.push("--dry-run".to_string());
    }
    if let Some(bac) = bac_a_sable {
        argv.push("--target-claude".to_string());
        argv.push(bac.target_claude.to_string_lossy().to_string());
        argv.push("--apps-dir".to_string());
        argv.push(bac.apps_dir.to_string_lossy().to_string());
        argv.push("--backup-dir".to_string());
        argv.push(bac.backup_dir.to_string_lossy().to_string());
    }
    argv
}

/// Decoupage EN LIGNES d'un flux — `BufReader::lines()`, sans taille fixe
/// (CA-P3) : chaque ligne complete est transmise a `emettre`, TELLE QUELLE.
pub fn lire_lignes<R: Read>(source: R, mut emettre: impl FnMut(String)) {
    let reader = BufReader::new(source);
    for ligne in reader.lines() {
        match ligne {
            Ok(l) => emettre(l),
            Err(_) => break,
        }
    }
}

/// Une ligne de consentement — exactement une (CA-P7). `reponse` doit etre
/// "oui" ou "non" (vocabulaire ferme du protocole, evenements.js).
pub fn construire_ligne_consentement(etape: u32, reponse: &str) -> Result<String, String> {
    if reponse != "oui" && reponse != "non" {
        return Err(format!(
            "reponse invalide (ni \"oui\" ni \"non\") : \"{reponse}\""
        ));
    }
    Ok(format!("{{\"etape\":{etape},\"reponse\":\"{reponse}\"}}\n"))
}

/// Survole l'ENVELOPPE (`evt`, `etape`) d'une ligne NDJSON — jamais les
/// champs metier. Sert uniquement a correler une demande de feu vert.
fn survoler_enveloppe(ligne: &str) -> Option<(String, Option<u32>)> {
    let valeur: serde_json::Value = serde_json::from_str(ligne).ok()?;
    let evt = valeur.get("evt")?.as_str()?.to_string();
    let etape = valeur
        .get("etape")
        .and_then(|v| v.as_u64())
        .map(|n| n as u32);
    Some((evt, etape))
}

/// Etat partage du pilote — une installation a la fois.
#[derive(Default)]
pub struct PiloteEtat {
    enfant: Option<Child>,
    stdin: Option<ChildStdin>,
    /// L'etape sur laquelle porte la demande de feu vert EN COURS, s'il y en a une.
    pub demande_en_cours: Option<u32>,
}

/// Decide si une reponse peut etre honoree, et produit la ligne a ecrire —
/// fonction PURE sur l'etat protocolaire (CA-P7), separee de l'IO reelle
/// (ecrite par l'appelant, cf. commande `repondre_feu_vert`).
pub fn repondre(etat: &mut PiloteEtat, etape: u32, reponse: &str) -> Result<String, String> {
    match etat.demande_en_cours {
        Some(e) if e == etape => {}
        Some(e) => {
            return Err(format!(
                "refus : une demande de feu vert est en cours sur l'etape {e}, pas {etape}"
            ))
        }
        None => return Err("refus : aucune demande de feu vert en cours".to_string()),
    }
    let ligne = construire_ligne_consentement(etape, reponse)?;
    etat.demande_en_cours = None;
    Ok(ligne)
}

pub struct Pilote(pub Mutex<PiloteEtat>);

impl Default for Pilote {
    fn default() -> Self {
        Pilote(Mutex::new(PiloteEtat::default()))
    }
}

#[derive(Serialize, Clone)]
struct LigneTransport {
    ligne: String,
}

#[derive(Serialize, Clone)]
struct CodeSortieTransport {
    code: Option<i32>,
}

/// Resout la racine de la ressource embarquee (M-X6) : en bundle, via le
/// resolveur Tauri ; en dev (`tauri dev`), repli sur le chemin relatif au
/// crate (les ressources ne sont pas copiees hors bundle).
fn resoudre_racine_ressource(app: &AppHandle) -> Result<PathBuf, String> {
    if let Ok(chemin) = app
        .path()
        .resolve("cli", tauri::path::BaseDirectory::Resource)
    {
        if chemin.exists() {
            return Ok(chemin);
        }
    }
    let dev = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("resources")
        .join("cli");
    if dev.exists() {
        return Ok(dev);
    }
    Err(
        "ressource CLI introuvable (ni bundle, ni resources/cli en dev — lancer `npm run embarquer`)"
            .to_string(),
    )
}

#[tauri::command]
pub fn demarrer_installation(
    app: AppHandle,
    pilote: State<Pilote>,
    mode: String,
) -> Result<(), String> {
    let mode = ModeInstallation::depuis_str(&mode)?;
    let bac = resoudre_bac_a_sable(
        |k| std::env::var(k).ok(),
        std::env::var("HOME").ok().map(PathBuf::from),
        cfg!(debug_assertions),
    )?;
    let racine = resoudre_racine_ressource(&app)?;
    let argv = construire_argv(&racine, mode, bac.as_ref());

    let mut etat = pilote
        .0
        .lock()
        .map_err(|_| "etat du pilote inaccessible".to_string())?;
    if etat.enfant.is_some() {
        return Err("une installation est deja en cours".to_string());
    }

    let mut commande = Command::new(NODE_BIN);
    commande.args(&argv);
    commande.stdin(Stdio::piped());
    commande.stdout(Stdio::piped());
    commande.stderr(Stdio::piped());

    let mut enfant = commande
        .spawn()
        .map_err(|e| format!("lancement du CLI impossible ({NODE_BIN} introuvable ?) : {e}"))?;

    let stdout = enfant.stdout.take().ok_or("stdout indisponible")?;
    let stderr = enfant.stderr.take().ok_or("stderr indisponible")?;
    let stdin = enfant.stdin.take().ok_or("stdin indisponible")?;

    let app_stdout = app.clone();
    std::thread::spawn(move || {
        lire_lignes(stdout, |ligne| {
            if let Some((evt, etape)) = survoler_enveloppe(&ligne) {
                if evt == "demande-feu-vert" {
                    if let Ok(mut etat) = app_stdout.state::<Pilote>().0.lock() {
                        etat.demande_en_cours = etape;
                    }
                }
            }
            let _ = app_stdout.emit("pilote://evenement", LigneTransport { ligne });
        });
        // Flux termine : recuperer le code de sortie et le remonter comme
        // evenement de TRANSPORT distinct de `evt:"fin"` (evenement du moteur).
        let code = {
            let etat_pilote = app_stdout.state::<Pilote>();
            let mut verrou = etat_pilote.0.lock().ok();
            verrou
                .as_mut()
                .and_then(|e| e.enfant.as_mut())
                .and_then(|enfant| enfant.wait().ok())
                .and_then(|statut| statut.code())
        };
        let _ = app_stdout.emit("pilote://code-sortie", CodeSortieTransport { code });
        if let Ok(mut etat) = app_stdout.state::<Pilote>().0.lock() {
            etat.enfant = None;
            etat.stdin = None;
            etat.demande_en_cours = None;
        }
    });

    let app_stderr = app.clone();
    std::thread::spawn(move || {
        // Canal SEPARE et ETIQUETE — jamais dans le flux d'evenements (M-C10 :
        // le CLI y ecrit son diagnostic de double reseau).
        lire_lignes(stderr, |ligne| {
            let _ = app_stderr.emit("pilote://stderr", LigneTransport { ligne });
        });
    });

    etat.stdin = Some(stdin);
    etat.enfant = Some(enfant);
    etat.demande_en_cours = None;

    Ok(())
}

#[tauri::command]
pub fn repondre_feu_vert(pilote: State<Pilote>, etape: u32, reponse: String) -> Result<(), String> {
    let mut etat = pilote
        .0
        .lock()
        .map_err(|_| "etat du pilote inaccessible".to_string())?;
    let ligne = repondre(&mut etat, etape, &reponse)?;
    let stdin = etat
        .stdin
        .as_mut()
        .ok_or("stdin indisponible (processus termine ?)")?;
    stdin
        .write_all(ligne.as_bytes())
        .map_err(|e| format!("ecriture stdin impossible : {e}"))?;
    stdin
        .flush()
        .map_err(|e| format!("flush stdin impossible : {e}"))?;
    Ok(())
}

/// `kill`, DERNIER RECOURS explicitement nomme (R-P4) — court-circuite le
/// rollback du moteur (AR-5) ; l'ecran le dit (§ 5 etape 5.3).
#[tauri::command]
pub fn interrompre_installation(pilote: State<Pilote>) -> Result<(), String> {
    let mut etat = pilote
        .0
        .lock()
        .map_err(|_| "etat du pilote inaccessible".to_string())?;
    match etat.enfant.as_mut() {
        Some(enfant) => enfant.kill().map_err(|e| format!("kill impossible : {e}")),
        None => Err("aucune installation en cours".to_string()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn etat_avec_demande(etape: u32) -> PiloteEtat {
        PiloteEtat {
            demande_en_cours: Some(etape),
            ..Default::default()
        }
    }

    // --- CA-P3 : le transport ne perd, ne coupe et ne mele aucune ligne ---

    struct LectureMorceaux<'a> {
        data: &'a [u8],
        pos: usize,
        taille_bloc: usize,
    }

    impl<'a> Read for LectureMorceaux<'a> {
        fn read(&mut self, buf: &mut [u8]) -> std::io::Result<usize> {
            if self.pos >= self.data.len() {
                return Ok(0);
            }
            let restant = self.data.len() - self.pos;
            let n = self.taille_bloc.min(buf.len()).min(restant);
            buf[..n].copy_from_slice(&self.data[self.pos..self.pos + n]);
            self.pos += n;
            Ok(n)
        }
    }

    #[test]
    fn lire_lignes_ne_tronque_pas_une_ligne_de_plus_de_64ko() {
        let longue = "x".repeat(70_000);
        let entree = format!("{longue}\n");
        let source = LectureMorceaux {
            data: entree.as_bytes(),
            pos: 0,
            taille_bloc: 4096,
        };
        let mut recues = Vec::new();
        lire_lignes(source, |l| recues.push(l));
        assert_eq!(recues.len(), 1);
        assert_eq!(recues[0].len(), 70_000);
        assert_eq!(recues[0], longue);
    }

    #[test]
    fn lire_lignes_survit_a_une_lecture_coupee_au_milieu_d_une_ligne() {
        let entree = "ligne-un\nligne-deux\nligne-trois\n";
        // Lecture 1 octet a la fois : une ligne est forcement "coupee" entre
        // deux appels a `read()` sous-jacents.
        let source = LectureMorceaux {
            data: entree.as_bytes(),
            pos: 0,
            taille_bloc: 1,
        };
        let mut recues = Vec::new();
        lire_lignes(source, |l| recues.push(l));
        assert_eq!(recues, vec!["ligne-un", "ligne-deux", "ligne-trois"]);
    }

    #[test]
    fn un_r_echappe_dans_une_valeur_json_ne_casse_pas_le_decoupage() {
        // Le `\r` est ECHAPPE (deux caracteres litteraux backslash+r dans le
        // JSON), jamais un octet 0x0D brut (M-C9) : une seule ligne rendue.
        let entree = "{\"evt\":\"log-delegue\",\"ligne\":\"barre \\\\r progression\"}\n";
        let source = LectureMorceaux {
            data: entree.as_bytes(),
            pos: 0,
            taille_bloc: 8,
        };
        let mut recues = Vec::new();
        lire_lignes(source, |l| recues.push(l));
        assert_eq!(recues.len(), 1);
        assert!(recues[0].contains("\\\\r"));
    }

    #[test]
    fn stdout_et_stderr_sont_deux_flux_independants_jamais_meles() {
        let sortie = LectureMorceaux {
            data: b"stdout-1\nstdout-2\n",
            pos: 0,
            taille_bloc: 5,
        };
        let erreur = LectureMorceaux {
            data: b"stderr-1\n",
            pos: 0,
            taille_bloc: 5,
        };
        let mut lignes_stdout = Vec::new();
        let mut lignes_stderr = Vec::new();
        lire_lignes(sortie, |l| lignes_stdout.push(l));
        lire_lignes(erreur, |l| lignes_stderr.push(l));
        assert_eq!(lignes_stdout, vec!["stdout-1", "stdout-2"]);
        assert_eq!(lignes_stderr, vec!["stderr-1"]);
        assert!(lignes_stdout.iter().all(|l| !lignes_stderr.contains(l)));
    }

    // --- CA-P7 : une reponse = une ligne, apres la demande, jamais avant ---

    #[test]
    fn repondre_hors_demande_est_refuse() {
        let mut etat = PiloteEtat::default();
        let resultat = repondre(&mut etat, 2, "oui");
        assert!(resultat.is_err());
    }

    #[test]
    fn repondre_avec_demande_en_cours_produit_exactement_une_ligne_et_efface_la_demande() {
        let mut etat = etat_avec_demande(2);
        let ligne = repondre(&mut etat, 2, "oui").expect("devrait etre accepte");
        assert_eq!(ligne, "{\"etape\":2,\"reponse\":\"oui\"}\n");
        assert_eq!(etat.demande_en_cours, None);
    }

    #[test]
    fn repondre_sur_une_etape_differente_de_celle_en_cours_est_refuse() {
        let mut etat = etat_avec_demande(2);
        let resultat = repondre(&mut etat, 3, "oui");
        assert!(resultat.is_err());
        // La demande en cours n'est PAS effacee par un refus.
        assert_eq!(etat.demande_en_cours, Some(2));
    }

    #[test]
    fn repondre_avec_une_reponse_hors_vocabulaire_est_refuse() {
        let mut etat = etat_avec_demande(1);
        let resultat = repondre(&mut etat, 1, "peut-etre");
        assert!(resultat.is_err());
    }

    // --- CA-P8 : l'argv construit ne porte QUE les drapeaux attendus ---
    // (le drapeau de confirmation automatique du moteur est verifie ABSENT
    // par un grep direct au gate qualite, jamais par une chaine litterale
    // ecrite ici — meme discipline que CA-I11 en C.2-a : la chaine interdite
    // n'est ecrite NULLE PART dans src/, src-tauri/src/, scripts/.)

    #[test]
    fn argv_apercu_sans_bac_a_sable_est_exactement_les_drapeaux_attendus() {
        let racine = PathBuf::from("/tmp/ressource-test");
        let argv = construire_argv(&racine, ModeInstallation::Apercu, None);
        assert_eq!(
            argv,
            vec![
                "/tmp/ressource-test/src/index.js".to_string(),
                "install".to_string(),
                "--events".to_string(),
                "--feu-vert".to_string(),
                "stdin".to_string(),
                "--root".to_string(),
                "/tmp/ressource-test".to_string(),
                "--dry-run".to_string(),
            ]
        );
    }

    #[test]
    fn argv_reel_avec_bac_a_sable_est_exactement_les_drapeaux_attendus() {
        let racine = PathBuf::from("/tmp/ressource-test");
        let bac = OptionsBacASable {
            target_claude: racine.join("claude"),
            apps_dir: racine.join("apps"),
            backup_dir: racine.join("backups"),
        };
        let argv = construire_argv(&racine, ModeInstallation::Reel, Some(&bac));
        assert_eq!(
            argv,
            vec![
                "/tmp/ressource-test/src/index.js".to_string(),
                "install".to_string(),
                "--events".to_string(),
                "--feu-vert".to_string(),
                "stdin".to_string(),
                "--root".to_string(),
                "/tmp/ressource-test".to_string(),
                "--target-claude".to_string(),
                "/tmp/ressource-test/claude".to_string(),
                "--apps-dir".to_string(),
                "/tmp/ressource-test/apps".to_string(),
                "--backup-dir".to_string(),
                "/tmp/ressource-test/backups".to_string(),
            ]
        );
    }

    #[test]
    fn argv_epingle_toujours_root_sur_la_ressource() {
        let racine = PathBuf::from("/tmp/ressource-test");
        let argv = construire_argv(&racine, ModeInstallation::Reel, None);
        let idx = argv
            .iter()
            .position(|a| a == "--root")
            .expect("--root doit etre present");
        assert_eq!(argv[idx + 1], racine.to_string_lossy().to_string());
    }

    #[test]
    fn argv_apercu_porte_dry_run_argv_reel_non() {
        let racine = PathBuf::from("/tmp/ressource-test");
        let argv_apercu = construire_argv(&racine, ModeInstallation::Apercu, None);
        let argv_reel = construire_argv(&racine, ModeInstallation::Reel, None);
        assert!(argv_apercu.iter().any(|a| a == "--dry-run"));
        assert!(!argv_reel.iter().any(|a| a == "--dry-run"));
    }

    // --- CA-P14 : aucun test, aucun mode dev, n'ecrit hors du bac a sable ---

    #[test]
    fn bac_a_sable_refuse_un_chemin_sous_home_point_claude() {
        let home = PathBuf::from("/Users/test");
        let resultat = resoudre_bac_a_sable(
            |k| {
                if k == "IAKAINSTALL_SANDBOX" {
                    Some("/Users/test/.claude/sbx".to_string())
                } else {
                    None
                }
            },
            Some(home),
            true,
        );
        assert!(resultat.is_err());
    }

    #[test]
    fn bac_a_sable_refuse_un_chemin_sous_home_applications() {
        let home = PathBuf::from("/Users/test");
        let resultat = resoudre_bac_a_sable(
            |k| {
                if k == "IAKAINSTALL_SANDBOX" {
                    Some("/Users/test/Applications/sbx".to_string())
                } else {
                    None
                }
            },
            Some(home),
            true,
        );
        assert!(resultat.is_err());
    }

    #[test]
    fn bac_a_sable_accepte_un_repertoire_temporaire_hors_home() {
        let home = PathBuf::from("/Users/test");
        let resultat = resoudre_bac_a_sable(
            |k| {
                if k == "IAKAINSTALL_SANDBOX" {
                    Some("/tmp/iakainstall-test-xyz".to_string())
                } else {
                    None
                }
            },
            Some(home),
            true,
        )
        .expect("devrait etre accepte");
        assert!(resultat.is_some());
    }

    #[test]
    fn mode_developpement_sans_variable_est_refuse() {
        let resultat = resoudre_bac_a_sable(|_| None, Some(PathBuf::from("/Users/test")), true);
        assert!(resultat.is_err());
    }

    #[test]
    fn mode_production_sans_variable_est_accepte_sans_bac_a_sable() {
        let resultat = resoudre_bac_a_sable(|_| None, Some(PathBuf::from("/Users/test")), false)
            .expect("ne doit pas refuser en production");
        assert_eq!(resultat, None);
    }
}
