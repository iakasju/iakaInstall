# Etat des lieux - iakaInstall

> Genere par iakaframe (CLI) le 2026-09-05 00:24 (motif: manual).
> A regenerer a chaque changement de version et a chaque pause/reprise.

## Etat courant

| Champ | Valeur |
|---|---|
| Version | v0.1.0 |
| Branche | feat/facade-tauri-ossature-release |
| Dernier commit | a0a21bf docs(qualite): traçabilité étape 1 lot C.2-a (M-C1..M-C4 rejouées) |
| Arbre | propre |
| Fichiers (suivis + non ignores) | 93 |
| Note | Correction post-gate FAIL (CA-I8a) : garde de vocabulaire etendue au rendu, ecran corrige (Etape n sur N au lieu de [n/N]), tracabilite etape 1 (M-C1..M-C4) documentee. Ecart E-3 du gate (etat des lieux non regenere depuis onboarding) leve. |

## Commits recents

| Hash | Date | Sujet |
|---|---|---|
| `a0a21bf` | 2026-09-05 | docs(qualite): traçabilité étape 1 lot C.2-a (M-C1..M-C4 rejouées) |
| `261c2c5` | 2026-09-05 | fix(front): ne plus reproduire le format [n/N] du moteur (CA-I8a, R3) |
| `b567771` | 2026-09-05 | fix(gardes): balayer le RENDU en plus de la source (CA-I8a, R-I5) |
| `18478ca` | 2026-09-05 | docs(qualite): gate lot C.2-a + B'-a — FAIL |
| `bb98387` | 2026-09-04 | docs(claude): remplir CLAUDE.md — stack reelle, commandes exposees |
| `b10dda5` | 2026-09-04 | feat(ci): ossature de release B'-a — matrice 4 plateformes, SHA epingle |
| `bab0278` | 2026-09-04 | test(gardes): vocabulaire du moteur (R3, CA-I8a) + nom-produit + doc |
| `873201d` | 2026-09-04 | feat(tauri): backend Rust minimal, coquille C.2-a (AR-I2b) |
| `713e71c` | 2026-09-04 | feat(charte): synchroniser studio-clair depuis iakagraph (AR-I3) |
| `1f8ef24` | 2026-09-04 | feat(front): squelette React/TS/Vite de la facade (ecran d'annonce) |

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
| 2026-09-05 00:24 | manual | v0.1.0 | feat/facade-tauri-ossature-release | Correction post-gate FAIL (CA-I8a) : garde de vocabulaire etendue au rendu, ecran corrige (Etape n sur N au lieu de [n/N]), tracabilite etape 1 (M-C1..M-C4) documentee. Ecart E-3 du gate (etat des lieux non regenere depuis onboarding) leve. |
| 2026-09-03 23:22 | version | v0.1.0 | main | onboarding initial |
