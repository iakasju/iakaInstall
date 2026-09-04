# Etat des lieux - iakaInstall

> Genere par iakaframe (CLI) le 2026-09-05 00:52 (motif: pause).
> A regenerer a chaque changement de version et a chaque pause/reprise.

## Etat courant

| Champ | Valeur |
|---|---|
| Version | v0.1.0 |
| Branche | main |
| Dernier commit | 72bdc7d merge: LOT C.2-a + B'-a — coquille Tauri studio-clair + ossature de release (gate Legolas PASS au second passage) |
| Arbre | propre |
| Fichiers (suivis + non ignores) | 94 |
| Note | LOT C.2-a + B'-a livre et fusionne (72bdc7d) : coquille Tauri 2 en charte studio-clair, ecran d annonce qui dit que l app n installe rien encore, ossature release.yml 4 plateformes epinglee au SHA. Gate Legolas FAIL (CA-I8a, garde de vocabulaire aveugle a l interpolation) puis PASS au second passage apres garde de rendu. 41 tests front + 5 cargo verts, build macOS arm64 OK. Actes du decideur en attente : passage en PUBLIC (AR-I4), premier run CI, builds Windows/Linux/Intel. C.2-b (pilotage reel) attend le contrat machine du CLI (branche feat/contrat-machine-install d iakaframe, en gate). Push Forgejo EN ATTENTE (NAS injoignable) ; GitHub a jour. |

## Commits recents

| Hash | Date | Sujet |
|---|---|---|
| `72bdc7d` | 2026-09-05 | merge: LOT C.2-a + B'-a — coquille Tauri studio-clair + ossature de release (gate Legolas PASS au second passage) |
| `e468b6b` | 2026-09-05 | docs(qualite): re-gate lot C.2-a + B'-a — PASS |
| `30d77bb` | 2026-09-05 | fix(gardes): lire le registre par import JSON, pas node:fs (typecheck) |
| `31fcb41` | 2026-09-05 | docs(etat-des-lieux): régénère + récit de reprise (écart E-3 du gate) |
| `a0a21bf` | 2026-09-05 | docs(qualite): traçabilité étape 1 lot C.2-a (M-C1..M-C4 rejouées) |
| `261c2c5` | 2026-09-05 | fix(front): ne plus reproduire le format [n/N] du moteur (CA-I8a, R3) |
| `b567771` | 2026-09-05 | fix(gardes): balayer le RENDU en plus de la source (CA-I8a, R-I5) |
| `18478ca` | 2026-09-05 | docs(qualite): gate lot C.2-a + B'-a — FAIL |
| `bb98387` | 2026-09-04 | docs(claude): remplir CLAUDE.md — stack reelle, commandes exposees |
| `b10dda5` | 2026-09-04 | feat(ci): ossature de release B'-a — matrice 4 plateformes, SHA epingle |

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
| 2026-09-05 00:52 | pause | v0.1.0 | main | LOT C.2-a + B'-a livre et fusionne (72bdc7d) : coquille Tauri 2 en charte studio-clair, ecran d annonce qui dit que l app n installe rien encore, ossature release.yml 4 plateformes epinglee au SHA. Gate Legolas FAIL (CA-I8a, garde de vocabulaire aveugle a l interpolation) puis PASS au second passage apres garde de rendu. 41 tests front + 5 cargo verts, build macOS arm64 OK. Actes du decideur en attente : passage en PUBLIC (AR-I4), premier run CI, builds Windows/Linux/Intel. C.2-b (pilotage reel) attend le contrat machine du CLI (branche feat/contrat-machine-install d iakaframe, en gate). Push Forgejo EN ATTENTE (NAS injoignable) ; GitHub a jour. |
| 2026-09-05 00:24 | manual | v0.1.0 | feat/facade-tauri-ossature-release | Correction post-gate FAIL (CA-I8a) : garde de vocabulaire etendue au rendu, ecran corrige (Etape n sur N au lieu de [n/N]), tracabilite etape 1 (M-C1..M-C4) documentee. Ecart E-3 du gate (etat des lieux non regenere depuis onboarding) leve. |
| 2026-09-03 23:22 | version | v0.1.0 | main | onboarding initial |
