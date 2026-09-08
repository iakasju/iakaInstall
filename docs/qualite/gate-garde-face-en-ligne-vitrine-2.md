# Rapport qualité (re-gate) — `test/garde-face-en-ligne-vitrine` — 2026-09-08

## Verdict : PASS

Le correctif de ⚒️ Gimli (commit `cbf843d`) répare exactement le défaut relevé au premier gate
(`docs/qualite/gate-garde-face-en-ligne-vitrine.md`, `f97835a`, FAIL) : le cartouche de
`scripts/__tests__/vitrine-en-ligne.test.mjs` **nomme désormais** la divergence du bloc
contrefactuel (lignes, motif, statut de remontée) au lieu de la nier. Trois fichiers de
documentation modifiés, **aucun code** touché. Mesure indépendante refaite : les numéros de
ligne cités sont exacts, et — vérification plus stricte que la simple relecture — le **code
réel** (hors commentaires) du corps partagé est prouvé byte-identique à la sœur `iakaFrameGUI`.

## Mesures

| Commande | Code de sortie | Résumé cité |
|---|---|---|
| `git diff f97835a..cbf843d --stat` | `0` | `CLAUDE.md \| 27 ++++++++++++++--------` / `scripts/__tests__/vitrine-en-ligne.test.mjs \| 31 ++++++++++++++++----------` / `specs/instructions/convergence-trois-freres.md \| 11 +++++++++` / `3 files changed, 48 insertions(+), 21 deletions(-)` — 3 fichiers, tous doc, aucun code |
| `npx tsc --noEmit` | `0` | (aucune sortie — silence = succès) |
| `npx eslint .` | `0` | (aucune sortie — silence = succès) |
| `npx vitest run` | `0` | `Test Files  22 passed (22)` / `Tests  155 passed (155)` |
| Vérification ligne — `describe("Contrefactuel...")` cité `342-379` | — | confirmé : `awk` sur le fichier montre la ligne `342` = ouverture du bloc-séparateur commenté, `349` = `describe(...)`, `379` = accolade fermante — bornes exactes |
| Comparaison code-seul (hors commentaires, hors bloc 342-379, hors cartouche) vs `iakaFrameGUI` | — | `241` lignes de code de chaque côté, `difflib.unified_diff` **vide** — aucune assertion des 16 tests partagés n'a changé, confirmant littéralement la nouvelle formulation du cartouche |
| `diff` CLAUDE.md (extrait autour de la ligne 310) | — | scinde bien SCRIPT (copie stricte, diff cartouche seul) et TEST (18 vs 16, divergence nommée) — conforme à ce qui a été mesuré au premier gate |
| `specs/instructions/convergence-trois-freres.md:763` | — | ajout daté 2026-09-08, référence explicite au gate FAIL `f97835a`, candidat de remontée inscrit en Annexe C, **non tranché** (laissé au décideur/cadrage du lot 1) — conforme |

## Points vérifiés

- **Aucun code modifié** : le diff `f97835a..cbf843d` ne touche que `CLAUDE.md`,
  `scripts/__tests__/vitrine-en-ligne.test.mjs` (commentaires uniquement) et
  `specs/instructions/convergence-trois-freres.md`.
- **Le cartouche dit désormais exactement la vérité mesurée** : 16 tests chez les sœurs
  (byte-identiques entre elles), 18 ici ; le bloc `describe("Contrefactuel — un SKIP travesti en
  succes...")`, lignes 342-379 (2 `it`), est nommé comme l'unique écart fonctionnel, attribué à
  une exigence explicite d'Aragorn et non au cadrage F-3 d'origine ; le reste (16 `it`) est
  déclaré verbatim — vérifié vrai par comparaison code-seul, pas seulement relu.
- **`CLAUDE.md:308` et suivants** distinguent maintenant clairement le diff du **script**
  (cartouche seul, lignes 4-11) de celui du **fichier de test** (18 vs 16, divergence nommée) —
  la confusion relevée au premier gate est levée.
- **`convergence-trois-freres.md`**, Annexe C (ligne 763) : ajout daté, référencé au gate FAIL,
  candidat de remontée chez les sœurs inscrit sans trancher la décision — conforme au rôle de
  Legolas (constat, pas correction) et à celui du cadrage (décision réservée).
- `npm run test` : **155 passed (155)**, inchangé depuis le premier gate — aucune régression
  introduite par ce correctif purement documentaire.

## Jalon

PASS → ouvre l'étape suivante (stage), gate franchi sans humain, conformément au geste
`iakaframe jalon` posé séparément (Legolas → Gimli/étape suivante).
