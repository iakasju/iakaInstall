# Rapport qualité — `fix/publier-gh-api-jq` — 2026-09-06

## Verdict : **PASS**

Chaîne complète verte (typecheck, lint, 137/137 tests JS, build, 22/22 tests Rust),
ordre des commits conforme (test rouge avant fix), rejeu du rouge reproduit exactement
`gh: accepts 1 arg(s), received 4`, correctif conforme (plus aucun `gh api ... --jq --arg`
exécutable, `jq --arg` seul receveur), cliquet `bloc-latest.sha256` et bloc `latest:`
inchangés, gardes ciblées vertes. Une nuance de formulation est notée en Écarts (non
bloquante). La branche est prête pour la remise au décideur (publication manuelle du
brouillon `v0.1.2`, encore en attente).

## Mesures
| Commande | Code de sortie | Résumé cité |
|---|---|---|
| `git diff --stat f6a1fc4..HEAD -- src-tauri` | `0` | sortie vide — aucun fichier Rust modifié |
| `npm run typecheck` (`tsc --noEmit`) | `0` | aucune erreur — sortie vide |
| `npm run lint` (`eslint .`) | `0` | aucune erreur — sortie vide |
| `npm run test -- --run` (`vitest run`) | `0` | `Test Files  21 passed (21)` / `Tests  137 passed (137)` |
| `npm run build` (`tsc && vite build`) | `0` | `✓ built in 345ms` — 41 modules, `dist/index.html` + assets générés |
| `cd src-tauri && cargo test` | `0` | `test result: ok. 22 passed; 0 failed` (`app_lib`) |
| `git worktree add --detach <tmp> d9cbaaa && npx vitest run scripts/__tests__/release-publier-shell.test.mjs` (copie isolée, checkout du commit `d9cbaaa`, workflow d'avant-fix sur disque) | `1` | `Tests  1 failed \| 5 passed (6)` — cas **NOMINAL** de l'étape `publier` : `stderr: gh: accepts 1 arg(s), received 4` (exact, conforme au message du commit) |
| `grep -n -- "--jq --arg" .github/workflows/release.yml` | `0` (1 occurrence) | **non vide** : ligne `258`, un **commentaire** (`# ... l'ancienne forme \`--jq --arg tag "$TAG" '...'\` ...`) citant le motif fautif à titre historique — hors code exécutable. Voir Écarts. |
| `sed -n '75,82p' .github/workflows/release.yml` | `0` | `release.yml:79` = `jq -c --arg sel "$SEL" \` — `jq` direct, `--arg` reçu par `jq` seul, conforme |
| `npx vitest run release-publication.test.mjs pin-tauri-action.test.mjs release-matrice.test.mjs ressource-avant-build.test.mjs bloc-latest.test.mjs release-publier-shell.test.mjs` | `0` | `Test Files  6 passed (6)` / `Tests  53 passed (53)` |
| `git diff --stat f6a1fc4..HEAD -- fixtures/bloc-latest.sha256` | `0` | sortie vide — cliquet inchangé |
| Vérification indépendante Legolas (hors suite du dépôt) — mutation d'une copie en mémoire de `release.yml` (réintroduction du motif fautif dans l'étape `publier`), extraction via `extraireJobs`/`extraireEtapeRun` (copiées de la logique du test), exécution sous faux `gh` du même script | `0` (rouge attendu confirmé) | `status: 1` / `stderr: gh: accepts 1 arg(s), received 4` — l'extraction **suit** la mutation, ce n'est pas une copie figée |
| `gh api repos/iakasju/iakaInstall/releases/383537762 --jq '{id,draft,tag_name,assets:(.assets\|length)}'` (lecture seule, aucune écriture) | `0` | `{"assets":9,"draft":true,"id":383537762,"tag_name":"v0.1.2"}` |
| `gh api repos/iakasju/iakaInstall/releases/latest --jq '.tag_name'` (lecture seule) | `0` | `v0.1.1` |

## Ordre des commits (vérifié)
1. `d9cbaaa` — `test(ci)` : jambe d'exécution, **rouge assumé** (5 passed, 1 failed) contre le
   texte encore bogué de `release.yml` au moment de ce commit.
2. `edf9a90` — `fix(ci)` : correctif dans `release.yml` (`publier`) + renfort de la garde
   statique `release-publication.test.mjs` (CA-R10).
3. `f2ad0a7` — `docs` : consignation du run réel `34026373514` dans `CLAUDE.md`.

Ordre conforme à la discipline « test rouge avant fix ».

## Contrefactuels vérifiés
- **`release-publier-shell.test.mjs` / étape `publier`** : le cas CONTREFACTUEL interne au
  fichier rejoue une copie figée, en dur, du texte EXACT mesuré au run réel
  `34026373514` (`SCRIPT_PUBLIER_AVANT_CORRECTIF_34026373514`) — témoin historique permanent,
  volontairement non ré-extrait (assumé dans le commentaire du fichier). Le cas NOMINAL, lui,
  extrait le texte ACTUEL de `release.yml` par marqueur (`extraireJobs`/`extraireEtapeRun`),
  jamais une copie figée. **Vérification indépendante menée par Legolas** (hors suite du
  dépôt) : une mutation en mémoire du texte réel de `release.yml` (réintroduction du motif
  `--jq --arg` dans l'étape `publier`) est bien reprise par l'extraction et fait rougir
  l'exécution avec le message exact — confirme que l'extraction suit le texte réel et
  n'est pas figée sur cette étape.
- **`release-publier-shell.test.mjs` / étape `prepare`** : contrefactuel PRÉVENTIF déclaré
  comme tel (jamais observé en vrai sur cette étape) — mutation live de
  `SCRIPT_PREPARE_ACTUEL` (`.replace("--jq .id)", '--jq --arg x y .id)')`), rougit avec le
  même message. NOMINAL vert.
- **`release-publier-shell.test.mjs` / étape `latest`** : NOMINAL vert (tag publié = plus
  haut semver → `latest` maîtrisé) ; CONTREFACTUEL (`editNoop`, dérive d'API simulée où
  `gh release edit` réussit sans rien changer) rougit nommément sur
  `latest effectif (v0.1.1) n'est pas le plus haut semver (v9.9.9)`.
- **`release-publication.test.mjs` CA-R10** : contrefactuel textuel — réintroduction du motif
  exact sur une copie de `WORKFLOW`, détecté (`fautives.length > 0`).
- **Faux `gh`** : reproduit la même règle d'arité que le vrai `gh api` (un seul argument
  positionnel, toute option non reconnue — dont `--arg` — est avalée comme valeur de
  l'option précédente) ; vérifié qu'il refuse bien la forme fautive (`accepts 1 arg(s),
  received 4`) et accepte la forme corrigée (test NOMINAL vert, un seul PATCH par id,
  aucun appel par tag).
- **`jq` réel utilisé** : `jqDisponible()` fait un `SKIP` explicite et nommé si absent
  (jamais un vert silencieux) — sur ce poste, `jq` présent (`jq-1.7.1-apple`), aucun SKIP
  déclenché, les 6 tests de ce fichier ont réellement tourné.
- **Aucun vrai `gh` appelé** : `rejouer()` place `binDir` (contenant le faux `gh`) **en tête**
  de `PATH` (`PATH: \`${binDir}:${process.env.PATH}\``, ligne 315 du fichier) — le `gh` du
  poste n'est jamais résolu par les scripts exécutés dans ce test.

## Le correctif (vérifié)
- Plus aucun `gh api ... --jq --arg` sur une ligne **exécutable** de `release.yml`.
- `jq --arg tag "$TAG" '...'` est désormais le seul receveur de `--arg`, en aval d'un
  `gh api --paginate` qui rend le JSON brut.
- Comptage « plus d'un brouillon → échec nommé » (course F8) conservé (`N -gt 1` → erreur
  nommée, `exit 1`).
- PATCH par id conservé (`gh api -X PATCH "repos/$DEPOT/releases/$ID" -F draft=false`).
- Vérification avant/après par id conservée (`AVANT`/`APRES` via `gh api .../releases/$ID`).
- `release.yml:79` (`jq -c --arg sel "$SEL" ...`) est un `jq` direct, correct, non concerné
  par le bug (n'a jamais porté le motif fautif).

## Ce que le run réel `34026373514` a prouvé / n'a pas prouvé
- **Prouvé (lecture seule, `gh api`, 2026-09-06)** : le brouillon `id 383537762` existe,
  `draft:true`, `tag_name:"v0.1.2"`, `9` assets — état inchangé depuis le run, aucune
  écriture faite par cette vérification.
- **`releases/latest` = `v0.1.1`** au moment de cette vérification : le décideur n'a pas
  encore publié le brouillon `v0.1.2` manuellement (repli (c) du cadrage
  `RELEASE-PARTIELLE-PUBLIEE`, acte réservé au décideur, encore en attente).
- **Prouvé** : la moitié fail-safe de la politique (aucune release incomplète n'est devenue
  visible pendant les builds).
- **Non prouvé par ce lot** : que le job `publier` corrigé publie effectivement sans
  intervention manuelle en conditions réelles — le run `34026373514` a rougi AVANT le
  correctif ; le correctif n'a pas encore de second run réel pour le prouver à son tour.
  **Successeur nommé par Gimli** (`CLAUDE.md`) : rejouer la politique complète au
  **prochain tag** — seul geste qui prouvera la publication automatique en conditions
  réelles.

## Écarts (non bloquants)
- **Formulation de l'ordre de mission vs fait mesuré** : l'ordre attendait
  `grep -n -- "--jq --arg" .github/workflows/release.yml` **vide**. Mesuré : **1 occurrence**,
  ligne `258`, dans un **commentaire** documentant l'ancienne forme fautive à titre
  historique (texte du correctif lui-même, cf. `CLAUDE.md:348-386`). Ce n'est pas une
  occurrence exécutable : la garde `CA-R10` de `release-publication.test.mjs` filtre
  explicitement les lignes commentées (`lignesExecutables`) et ne trouve aucune occurrence
  sur du code exécutable — vert confirmé, correctif réellement en place. Signalé pour
  exactitude de mesure, ne change pas le verdict.

## Ce qui reste
- **Publication manuelle du brouillon `v0.1.2` (id `383537762`) par le décideur** — repli
  (c) du cadrage `RELEASE-PARTIELLE-PUBLIEE`, geste réservé au décideur, non fait par
  Legolas (lecture seule respectée, aucune modification de release).
- **Rejeu de la politique complète au prochain tag** — successeur nommé par Gimli dans
  `CLAUDE.md` : seul run réel futur qui prouvera que `publier` publie désormais sans
  intervention manuelle.

## `CLAUDE.md:348-386` — extrait cité (source de vérité du lot, vérifié conforme au code)
> - [x] **Correctif post-PREMIER-RUN-RÉEL de `RELEASE-PARTIELLE-PUBLIEE` (2026-09-06, ⚒️ Gimli,
>       branche `fix/publier-gh-api-jq`, REMIS AU GATE 🏹 Legolas, non auto-validé)**. Le tag
>       `v0.1.2` a tourné en CI (run `34026373514`) : `prepare` OK (brouillon créé par id), les 4
>       builds VERTS, 9 assets déposés sur le brouillon — puis l'étape « Publier le brouillon (par
>       id, jamais par tag) » du job `publier` a **rougi** :
>       `gh: accepts 1 arg(s), received 4`. [...] **Preuve mesurée** : `npm run typecheck` `0` ;
>       `npm run lint` `0` ; `npm run test` `0`, **137 passed** (avant : 127 — +10, aucun supprimé) ;
>       `npm run build` `0` ; `cargo test` `0`, 22 passed (aucun `.rs` touché). **Non couvert,
>       DÉCLARÉ successeur** : re-jouer la politique **complète** au **prochain tag**.

(Extrait ; texte intégral en `CLAUDE.md` lignes 348-386, relu en entier lors de ce gate.)
