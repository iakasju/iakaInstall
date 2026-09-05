# Etat des lieux - iakaInstall

> Genere par iakaframe (CLI) le 2026-09-05 15:42 (motif: pause).
> A regenerer a chaque changement de version et a chaque pause/reprise.

## Etat courant

| Champ | Valeur |
|---|---|
| Version | v0.1.1 |
| Branche | main |
| Dernier commit | 13cf959 merge: LOT C.3 + B'-b — vitrine trois freres, README, absences de signature declarees (gate Legolas PASS) |
| Arbre | propre |
| Fichiers (suivis + non ignores) | 133 |
| Note | LOT C.3 + B'-b livre et fusionne : README ecrit, vitrine des 7 artefacts, absences de signature (notarisation macOS, SmartScreen Windows) declarees avec cliquet offline, etape CI de notarisation declarative sans env (un secret vide casse le bundler), face en ligne OK sur v0.1.1. Gate PASS 127 tests. LE LOT C EST ENTIEREMENT LIVRE (C.1, install.mjs, contrat machine, C.2-a, C.2-b, RELEASE-PARTIELLE, C.3). Reste au decideur : recette reelle dmg/msi/deb, run de preuve casser, secrets Apple/Windows, successeurs CONVERGENCE-TROIS-FRERES et UPDATER-DE-LA-FACADE. Limite signalee : cliquet de l aveu unidirectionnel. Push Forgejo EN ATTENTE. |

## Commits recents

| Hash | Date | Sujet |
|---|---|---|
| `13cf959` | 2026-09-05 | merge: LOT C.3 + B'-b — vitrine trois freres, README, absences de signature declarees (gate Legolas PASS) |
| `fc2905c` | 2026-09-05 | docs(qualite): gate lot C.3 + B'-b vitrine — PASS |
| `64baf72` | 2026-09-05 | docs(memoire): cocher C.3+B'-b, consigner les verdicts et les successeurs |
| `e776285` | 2026-09-05 | ci(release): etape de notarisation macOS declarative, sans cablage env (AR-V5=b) |
| `f0fe00b` | 2026-09-05 | test(vitrine): garde locale + garde de l'aveu + cliquet offline (CA-A1..CA-A9) |
| `646bf33` | 2026-09-05 | docs(readme): ecrire le README (il n'existait pas) — vitrine + ecart AR-C(a) |
| `f44003b` | 2026-09-05 | feat(vitrine): copier la convention des soeurs + declarer l'absence de signature |
| `ddf3d3d` | 2026-09-05 | chore(iakaframe): update etat des lieux + commit global (pause) |
| `7d1343a` | 2026-09-05 | docs(instruction): cadrage C.3 + B'-b — vitrine trois freres, 16 criteres, 6 arbitrages tranches comme recommande |
| `aa1634b` | 2026-09-05 | merge: RELEASE-PARTIELLE-PUBLIEE — brouillon jusqu a matrice verte, publication par id (gate Legolas PASS) |

## Reprise du travail (a completer par Cowork)

- **Ce qui vient d'etre fait** : lot de correction post-gate FAIL (Legolas,
  `docs/qualite/gate-facade-tauri-ossature-release.md`) sur le seul critere tombe,
  CA-I8a. La garde de vocabulaire etait un grep statique aveugle aux motifs
  reconstruits par interpolation au rendu (`[{etape.n}/{NB_ETAPES}]` rendant
  `[1/4]`, le format du moteur). Ajout d'une deuxieme jambe qui rend l'ecran
  (`@testing-library/react`) et balaie le texte RENDU (rouge->vert prouve, deux
  commits `fix(gardes)` puis `fix(front)`). Ecran corrige : "Etape n sur N" +
  compteur visuel, comptage AR-A (CA-I9) intact et verifie non capture par le
  registre. Tracabilite de l'etape 1 (M-C1..M-C4) rejouee et documentee
  (`docs/qualite/mesures-etape-1-lot-C2a.md`), avec un fait signale a Aragorn
  (hors perimetre) : l'arbre `iakaframe`, non commite, semble deja emettre du
  JSON structure sur `install --dry-run --json` — a confirmer une fois ce
  chantier concurrent commite.
- **En cours / a reprendre** : remise au gate qualite (Legolas) pour verdict sur
  ce correctif. Ce lot ne touche ni au prerequis `CONTRAT-MACHINE-DU-VERBE-INSTALL`
  (dependance externe, dépot `iakaframe`) ni a C.2-b.
- **Prochaine etape concrete** : attendre le verdict de Legolas sur la branche
  `feat/facade-tauri-ossature-release` (tete `a0a21bf` au moment de ce snapshot).
  Si PASS, la fusion en `main` et le passage public (AR-I4, decideur) restent des
  actes humains.
- **Pieges connus** : une garde de vocabulaire purement textuelle (grep sur
  source) est structurellement aveugle a tout motif reconstruit dynamiquement —
  toujours doubler d'une garde de rendu pour du texte affiche a l'utilisateur.
  L'arbre `iakaframe` est actuellement instable (chantier concurrent d'un autre
  agent) : ne pas fonder de decision de cadrage sur un etat non commite de ce
  depot.

## Journal (versions & pauses)

| Date | Motif | Version | Branche | Note |
|---|---|---|---|---|
| 2026-09-05 15:42 | pause | v0.1.1 | main | LOT C.3 + B'-b livre et fusionne : README ecrit, vitrine des 7 artefacts, absences de signature (notarisation macOS, SmartScreen Windows) declarees avec cliquet offline, etape CI de notarisation declarative sans env (un secret vide casse le bundler), face en ligne OK sur v0.1.1. Gate PASS 127 tests. LE LOT C EST ENTIEREMENT LIVRE (C.1, install.mjs, contrat machine, C.2-a, C.2-b, RELEASE-PARTIELLE, C.3). Reste au decideur : recette reelle dmg/msi/deb, run de preuve casser, secrets Apple/Windows, successeurs CONVERGENCE-TROIS-FRERES et UPDATER-DE-LA-FACADE. Limite signalee : cliquet de l aveu unidirectionnel. Push Forgejo EN ATTENTE. |
| 2026-09-05 15:05 | pause | v0.1.1 | main | RELEASE-PARTIELLE-PUBLIEE livre et fusionne (aa1634b, gate PASS 91 tests) : brouillon cree une fois dans prepare, releaseId passe a la matrice, job publier en needs [build] strict, latest derriere publier, entree casser inerte hors dispatch. Cadrage C.3 + B'-b commite (7d1343a, verdicts comme reco). Reste au decideur : run de preuve casser sur un tag de test (CA-R8), run nominal (CA-R9), successeurs soeurs. Prochain lot : C.3 vitrine (Gimli). Push Forgejo EN ATTENTE. |
| 2026-09-05 14:19 | version | v0.1.1 | main | v0.1.1 PUBLIEE : PREMIERE RELEASE COMPLETE, run 33965353603, 4/4 plateformes vertes, 9 assets (dmg x2, app.tar.gz x2, msi, setup.exe, deb, rpm, AppImage), latest = v0.1.1. Le script d embarquement a journalise sur Windows (sha256 verifie avant extraction, 552 entrees) : gate humain bsdtar Windows leve par mesure. v0.1.0 reste en pre-release. Reste : recette humaine (dmg Gatekeeper, msi, deb), cadrage RELEASE-PARTIELLE-PUBLIEE puis C.3. Push Forgejo EN ATTENTE. |
| 2026-09-05 14:07 | pause | v0.1.0 | main | Correctif Windows fusionne (834e548) : garde d entree ESM muette supprimee, script loquace et rouge si ressource absente, bump 0.1.1, gate PASS. v0.1.0 passee en PRE-RELEASE (latest = 404). Reste au decideur : tag v0.1.1 (run 4 plateformes, seul juge de bsdtar Windows), recette 3 OS, cadrage RELEASE-PARTIELLE-PUBLIEE. Push Forgejo EN ATTENTE ; GitHub a jour. |
| 2026-09-05 13:24 | pause | v0.1.0 | main | LOT C.2-b livre et fusionne (6bad4fd) : la facade pilote REELLEMENT le CLI 0.40.0 embarque (pont Rust std::process, flux --events NDJSON, feu vert par stdin, reducteur pur, garde de vocabulaire a 3 jambes, CA-I8b enfin couvert). Gate FAIL (release.yml ne produisait pas la ressource) puis PASS au 2e passage (beforeBuildCommand = npm run embarquer && npm run build, garde dediee). 70 tests front, 22 cargo, build macOS OK avec ressource. Depot PUBLIC depuis ce jour. Reste au decideur : tag v0.1.0 = premier run CI 4 plateformes (Windows tar non prouve), recette 3 OS, notarisation (C.3). Push Forgejo EN ATTENTE (NAS injoignable) ; GitHub a jour. |
| 2026-09-05 00:52 | pause | v0.1.0 | main | LOT C.2-a + B'-a livre et fusionne (72bdc7d) : coquille Tauri 2 en charte studio-clair, ecran d annonce qui dit que l app n installe rien encore, ossature release.yml 4 plateformes epinglee au SHA. Gate Legolas FAIL (CA-I8a, garde de vocabulaire aveugle a l interpolation) puis PASS au second passage apres garde de rendu. 41 tests front + 5 cargo verts, build macOS arm64 OK. Actes du decideur en attente : passage en PUBLIC (AR-I4), premier run CI, builds Windows/Linux/Intel. C.2-b (pilotage reel) attend le contrat machine du CLI (branche feat/contrat-machine-install d iakaframe, en gate). Push Forgejo EN ATTENTE (NAS injoignable) ; GitHub a jour. |
| 2026-09-05 00:24 | manual | v0.1.0 | feat/facade-tauri-ossature-release | Correction post-gate FAIL (CA-I8a) : garde de vocabulaire etendue au rendu, ecran corrige (Etape n sur N au lieu de [n/N]), tracabilite etape 1 (M-C1..M-C4) documentee. Ecart E-3 du gate (etat des lieux non regenere depuis onboarding) leve. |
| 2026-09-03 23:22 | version | v0.1.0 | main | onboarding initial |
