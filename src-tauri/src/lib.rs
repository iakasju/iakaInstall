//! iakaInstall — backend Tauri 2 (coquille, lot C.2-a).
//!
//! Ce lot livre la FACADE, jamais une seconde implementation de la logique
//! d'installation (AR-3, cf. specs/instructions/
//! facade-installeur-tauri-ossature-release.md). Les deux commandes
//! ci-dessous sont de l'INFRASTRUCTURE (sonde d'environnement), pas du
//! metier : elles ne decident rien, n'ecrivent rien, ne telechargent rien.
//! Le pilotage reel de la chaine (etapes, feux verts, provenance, retour
//! arriere en cas d'echec) est C.2-b, et attend un prerequis cote CLI
//! (successeur nomme dans l'instruction de ce lot).

use serde::Serialize;
use std::process::Command;

#[derive(Serialize)]
pub struct PrerequisiteStatus {
    present: bool,
    version: Option<String>,
}

#[derive(Serialize)]
pub struct PrerequisitesReport {
    node: PrerequisiteStatus,
    npm: PrerequisiteStatus,
}

#[derive(Serialize)]
pub struct PlatformInfo {
    os: String,
    arch: String,
}

/// Commande de sante minimale — prouve le pont front<->back sans logique metier.
#[tauri::command]
fn ping() -> String {
    "pong".to_string()
}

fn sonder(programme: &str) -> PrerequisiteStatus {
    match Command::new(programme).arg("--version").output() {
        Ok(sortie) if sortie.status.success() => {
            let version = String::from_utf8_lossy(&sortie.stdout).trim().to_string();
            PrerequisiteStatus {
                present: true,
                version: if version.is_empty() {
                    None
                } else {
                    Some(version)
                },
            }
        }
        _ => PrerequisiteStatus {
            present: false,
            version: None,
        },
    }
}

/// Detecte Node et npm sur la machine — JAMAIS suppose (CA-I12, M-C7).
/// L'etape 1 du moteur appelle npm directement : ce prerequis est deja
/// inherent au moteur, cette commande ne fait que le DIRE.
#[tauri::command]
fn detect_prerequisites() -> PrerequisitesReport {
    PrerequisitesReport {
        node: sonder("node"),
        npm: sonder("npm"),
    }
}

/// OS/arch courants — pour que l'ecran affiche la couverture REELLE des
/// etapes 3/4 (CA-I10, M-C6), jamais simulee.
#[tauri::command]
fn platform_info() -> PlatformInfo {
    PlatformInfo {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            ping,
            detect_prerequisites,
            platform_info
        ])
        .run(tauri::generate_context!())
        .expect("erreur au lancement d'iakaInstall");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ping_repond_pong() {
        assert_eq!(ping(), "pong");
    }

    #[test]
    fn sonder_un_programme_inexistant_rend_absent() {
        let statut = sonder("un-programme-qui-n-existe-vraiment-pas-12345");
        assert!(!statut.present);
        assert!(statut.version.is_none());
    }

    #[test]
    fn sonder_node_present_sur_ce_poste_de_ci() {
        // Ce poste de dev a Node (measure a l'etape 1 du gate, M-fait) : la
        // detection doit le confirmer PRESENT, jamais un faux "absent".
        let statut = sonder("node");
        assert!(statut.present);
        assert!(statut.version.is_some());
    }

    #[test]
    fn platform_info_rend_l_os_reel_du_poste() {
        let info = platform_info();
        assert_eq!(info.os, std::env::consts::OS);
        assert_eq!(info.arch, std::env::consts::ARCH);
    }

    #[test]
    fn detect_prerequisites_sonde_node_et_npm_independamment() {
        let rapport = detect_prerequisites();
        // Sur ce poste (gate), les deux sont presents : verifie que la
        // commande ne fabrique jamais un refus fantome (CA-I12).
        assert!(rapport.node.present);
        assert!(rapport.npm.present);
    }
}
