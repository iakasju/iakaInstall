# Etat des lieux - iakaInstall

> Genere par iakaframe (CLI) le 2026-09-05 13:24 (motif: pause).
> A regenerer a chaque changement de version et a chaque pause/reprise.

## Etat courant

| Champ | Valeur |
|---|---|
| Version | v0.1.0 |
| Branche | main |
| Dernier commit | 6bad4fd merge: LOT C.2-b — pilotage reel de la facade par le contrat machine du CLI 0.40.0 (gate Legolas PASS au second passage) |
| Arbre | propre |
| Fichiers (suivis + non ignores) | 117 |
| Note | LOT C.2-b livre et fusionne (6bad4fd) : la facade pilote REELLEMENT le CLI 0.40.0 embarque (pont Rust std::process, flux --events NDJSON, feu vert par stdin, reducteur pur, garde de vocabulaire a 3 jambes, CA-I8b enfin couvert). Gate FAIL (release.yml ne produisait pas la ressource) puis PASS au 2e passage (beforeBuildCommand = npm run embarquer && npm run build, garde dediee). 70 tests front, 22 cargo, build macOS OK avec ressource. Depot PUBLIC depuis ce jour. Reste au decideur : tag v0.1.0 = premier run CI 4 plateformes (Windows tar non prouve), recette 3 OS, notarisation (C.3). Push Forgejo EN ATTENTE (NAS injoignable) ; GitHub a jour. |

## Commits recents

| Hash | Date | Sujet |
|---|---|---|
| `6bad4fd` | 2026-09-05 | merge: LOT C.2-b — pilotage reel de la facade par le contrat machine du CLI 0.40.0 (gate Legolas PASS au second passage) |
| `a689d51` | 2026-09-05 | docs(qualite): re-gate lot C.2-b — PASS |
| `d5050e6` | 2026-09-05 | docs: consigner la correction post-gate FAIL (ressource CLI avant build) |
| `ed8e4ea` | 2026-09-05 | test(gardes): rougit si la ressource CLI cesse d'etre produite avant le build |
| `1cdf9c4` | 2026-09-05 | fix(ci): produire la ressource CLI avant tout build Tauri, local et CI |
| `920a88a` | 2026-09-05 | docs(qualite): gate lot C.2-b — FAIL |
| `c281135` | 2026-09-05 | docs: CLAUDE.md + PROJET.md a jour pour C.2-b (etape 11) |
| `fdedf6f` | 2026-09-05 | feat(rejeu): rejeu vivant depuis la ressource embarquee (CA-P4, 2e jambe) |
| `b8fa01d` | 2026-09-05 | refactor(coverage): retrograde coverage.ts en indice pre-flux (M-F6) |
| `6ff34e3` | 2026-09-05 | test(ecran): couvre CA-P5/CA-P6/CA-P10 sur le pilotage reel |

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
| 2026-09-05 13:24 | pause | v0.1.0 | main | LOT C.2-b livre et fusionne (6bad4fd) : la facade pilote REELLEMENT le CLI 0.40.0 embarque (pont Rust std::process, flux --events NDJSON, feu vert par stdin, reducteur pur, garde de vocabulaire a 3 jambes, CA-I8b enfin couvert). Gate FAIL (release.yml ne produisait pas la ressource) puis PASS au 2e passage (beforeBuildCommand = npm run embarquer && npm run build, garde dediee). 70 tests front, 22 cargo, build macOS OK avec ressource. Depot PUBLIC depuis ce jour. Reste au decideur : tag v0.1.0 = premier run CI 4 plateformes (Windows tar non prouve), recette 3 OS, notarisation (C.3). Push Forgejo EN ATTENTE (NAS injoignable) ; GitHub a jour. |
| 2026-09-05 00:52 | pause | v0.1.0 | main | LOT C.2-a + B'-a livre et fusionne (72bdc7d) : coquille Tauri 2 en charte studio-clair, ecran d annonce qui dit que l app n installe rien encore, ossature release.yml 4 plateformes epinglee au SHA. Gate Legolas FAIL (CA-I8a, garde de vocabulaire aveugle a l interpolation) puis PASS au second passage apres garde de rendu. 41 tests front + 5 cargo verts, build macOS arm64 OK. Actes du decideur en attente : passage en PUBLIC (AR-I4), premier run CI, builds Windows/Linux/Intel. C.2-b (pilotage reel) attend le contrat machine du CLI (branche feat/contrat-machine-install d iakaframe, en gate). Push Forgejo EN ATTENTE (NAS injoignable) ; GitHub a jour. |
| 2026-09-05 00:24 | manual | v0.1.0 | feat/facade-tauri-ossature-release | Correction post-gate FAIL (CA-I8a) : garde de vocabulaire etendue au rendu, ecran corrige (Etape n sur N au lieu de [n/N]), tracabilite etape 1 (M-C1..M-C4) documentee. Ecart E-3 du gate (etat des lieux non regenere depuis onboarding) leve. |
| 2026-09-03 23:22 | version | v0.1.0 | main | onboarding initial |
