# Rapport qualité — `test/garde-face-en-ligne-vitrine` — 2026-09-08

## Verdict : FAIL

La chaîne technique (typecheck/lint/test/build) est intégralement verte et le script
`scripts/vitrine-en-ligne.mjs` est bien intouché. Mais le fichier livré,
`scripts/__tests__/vitrine-en-ligne.test.mjs`, contredit **sa propre en-tête** : son
cartouche affirme explicitement « adapté UNIQUEMENT sur ce cartouche — rien d'autre,
aucune assertion changée, **aucun cas ajouté ni retiré** » (lignes 24-25), alors qu'il
contient un bloc de test entier (`describe("Contrefactuel...")`, lignes 336-372, 2 `it`)
absent des deux vraies sœurs `IakaCockpit` et `iakaFrameGUI` (byte-identiques entre elles,
16 tests chacune, contre 18 dans cette copie). C'est précisément le type de divergence
non déclarée que le successeur `GARDE-FACE-EN-LIGNE-VITRINE-INSTALL` a pour objet
d'empêcher (F-3 / M-C5) — ici elle porte sur le fichier de garde lui-même, pas sur le
script qu'il exerce.

## Mesures

| Commande | Code de sortie | Résumé cité |
|---|---|---|
| `npx tsc --noEmit` | `0` | (aucune sortie — silence = succès) |
| `npx eslint .` | `0` | (aucune sortie — silence = succès) |
| `npx vitest run` | `0` | `Test Files  22 passed (22)` / `Tests  155 passed (155)` |
| `npm run build` (`tsc && vite build`) | `0` | `✓ built in 343ms` |
| `git diff --stat d8118fe..HEAD` | `0` | `CLAUDE.md \| 24 ++` / `scripts/__tests__/vitrine-en-ligne.test.mjs \| 372 ++...` / `2 files changed, 396 insertions(+)` |
| `git diff d8118fe..HEAD -- scripts/vitrine-en-ligne.mjs` | `0` | (vide — script intouché, confirmé) |
| `diff iakaFrameGUI/.../vitrine-en-ligne.mjs iakaInstall/.../vitrine-en-ligne.mjs` | `1` | écart limité aux lignes 4-11 (cartouche) — conforme à la déclaration |
| `diff iakaFrameGUI/.../vitrine-en-ligne.test.mjs iakaInstall/.../vitrine-en-ligne.test.mjs` | `1` | écart au-delà du cartouche : bloc `describe("Contrefactuel...")` (334-372) **absent chez la sœur** — **non conforme** à la déclaration de tête |
| `diff IakaCockpit/.../vitrine-en-ligne.test.mjs iakaFrameGUI/.../vitrine-en-ligne.test.mjs` | `0` | vide — les deux vraies sœurs sont bien byte-identiques (16 tests chacune) |
| `diff fixtures/vitrine-assets.json` (iakaInstall vs iakaFrameGUI) | `0` | vide — 7 plateformes + exclusion `*.sig` byte-identiques |
| `npx vitest run scripts/__tests__/vitrine-en-ligne.test.mjs` (iakaInstall) | `0` | `Tests  18 passed (18)` |
| `npx vitest run scripts/__tests__/vitrine-en-ligne.test.mjs` (iakaFrameGUI, sœur) | `0` | `Tests  16 passed (16)` — **2 tests de plus côté copie, non déclarés** |
| Réseau injoignable via `https_proxy=http://127.0.0.1:9 node scripts/vitrine-en-ligne.mjs` | `0` | **ne reproduit PAS l'injoignabilité** : `fetch` natif de Node ignore `http(s)_proxy`, sortie réelle `OK — la vitrine et l'etagere concordent` — méthode de repro suggérée invalide dans cet environnement |
| Réseau injoignable via `sandbox-exec -p '(deny network*)' node scripts/vitrine-en-ligne.mjs` (méthode alternative retenue) | `3` | `SKIP : NON MESURE (reseau indisponible — fetch failed)` |
| `node scripts/vitrine-en-ligne.mjs` en ligne, réel, contre GitHub | `0` | `assets sur v0.1.2 : 9` / `OK — la vitrine et l'etagere concordent.` |
| Contrefactuel — copie isolée du script, `api()` forcé en SKIP inconditionnel, suite rejouée dans la copie | `0` (vitest) | `Tests  3 failed \| 15 passed (18)` — rougit nommément sur `vitrine-en-ligne.test.mjs:301`, `:316`, `:368` (`expected 0 to be 3` / `expected 1 to be 3`) |
| Témoin non-vide — lecture du mécanisme d'injection (`STUB` + compteur de fichier) | — | confirmé réel : `globalThis.fetch` est remplacé via `--import` avant l'exécution du script (sous-processus), et un compteur de chemins appelés (`record()`) verrouille contre un script qui sortirait avant tout `fetch` |
| `npx vitest run scripts/__tests__/commandes-documentees.test.mjs` | `0` | `Tests  2 passed (2)` — inchangé, conforme à `CLAUDE.md` |

## Échecs

### Cartouche du fichier de garde en contradiction avec son propre contenu
- **Attendu** (déclaré par le fichier lui-même, `scripts/__tests__/vitrine-en-ligne.test.mjs:24-25`) :
  « adapté UNIQUEMENT sur ce cartouche — rien d'autre, aucune assertion changée, aucun cas ajouté
  ni retiré » par rapport aux sœurs.
- **Obtenu** : un bloc de test entier a été ajouté, absent des deux vraies sœurs —
  `scripts/__tests__/vitrine-en-ligne.test.mjs:336-372` (`describe("Contrefactuel — un SKIP
  travesti en succes doit etre detectable")`, 2 `it`). Mesuré : `IakaCockpit` et `iakaFrameGUI`
  sont byte-identiques entre eux sur ce fichier (`diff` vide, 16 tests chacun via `vitest run`
  ciblé) ; la copie d'`iakaInstall` en compte 18 (`+2`, non déclarés par le cartouche).
- Second symptôme, moindre : le premier des deux tests ajoutés
  (`scripts/__tests__/vitrine-en-ligne.test.mjs:343-360`, mode `network-error`) ne discrimine
  en réalité rien de nouveau — il attend un code `3` déjà garanti par ce même mode dans le test
  `CA-4` juste au-dessus (`:321-326`) ; seul le second test ajouté (« témoin de contraste »,
  `:361-372`) apporte une vérification réelle contre le contrefactuel demandé. La section se
  présente pourtant comme « CONTREFACTUEL DEMANDE PAR L'ORDRE DE MISSION » (`:336`), ce qui laisse
  croire à une couverture double alors qu'une des deux assertions est redondante.
- **Reproduction** :
  ```
  diff /Users/sjupin/work/iakaFrameGUI/scripts/__tests__/vitrine-en-ligne.test.mjs \
       /Users/sjupin/work/iakaInstall/scripts/__tests__/vitrine-en-ligne.test.mjs
  # → écart au-delà des lignes de cartouche, bloc 328a334,372 ajouté côté iakaInstall

  npx vitest run scripts/__tests__/vitrine-en-ligne.test.mjs   # iakaInstall → 18 passed
  cd /Users/sjupin/work/iakaFrameGUI && npx vitest run scripts/__tests__/vitrine-en-ligne.test.mjs  # → 16 passed
  ```

## Points vérifiés et conformes (hors le point ci-dessus)

- Chaîne complète verte : typecheck 0, lint 0, tests 155/155, build 0.
- `git diff --stat d8118fe..HEAD` = exactement 2 fichiers (`CLAUDE.md`,
  `scripts/__tests__/vitrine-en-ligne.test.mjs`) ; `scripts/vitrine-en-ligne.mjs` non modifié
  dans la branche.
- `scripts/vitrine-en-ligne.mjs` vs sa sœur `iakaFrameGUI` : seul le cartouche (lignes 4-11)
  diverge — conforme à ce que déclare le fichier de garde.
- `fixtures/vitrine-assets.json` byte-identique à la sœur (7 plateformes, exclusion `*.sig`).
- Cas réseau injoignable : reproductible avec code `3` + « NON MESURE » — mais **pas** via la
  méthode de repro suggérée (`https_proxy=...`), qui échoue silencieusement dans cet
  environnement Node (fetch natif n'honore pas les variables de proxy) ; reproductible en
  revanche via `sandbox-exec -p '(deny network*)'`, sans toucher au code.
- Release réelle en ligne (v0.1.2, 9 assets) : `OK`, conforme à `CLAUDE.md`.
- Asset manquant : `E-3` nommé, testé et vert (`CA-4`, ligne 312, et cas local ligne 140/150).
- Contrefactuel réel (SKIP rendu inconditionnel sur une copie isolée du script) : fait bien
  rougir la suite, nommément, sur 3 assertions distinctes — le verrou CA-3/CA-4/CA-6 est
  effectif, ce n'est pas un témoin vide.
- Injection du double réseau : réelle (remplacement de `globalThis.fetch` avant exécution du
  script en sous-processus + compteur d'appels), pas un stub muet.
- `CLAUDE.md` (autour de la ligne 310) : successeur `GARDE-FACE-EN-LIGNE-VITRINE-INSTALL` bien
  soldé et daté du 2026-09-08 ; le compte « 18 tests » et « 155 passed / avant 137, +18, aucun
  supprimé » y est exact. En revanche `CLAUDE.md` ne relève pas que ces 18 tests incluent 2 cas
  absents des sœurs — sa phrase « mesuré par diff... l'écart ne porte que sur les lignes 4-11 »
  documente le diff du **script**, pas celui du fichier de test, et se lit à tort comme
  couvrant les deux.

## Retour à Gimli

Corriger l'un des deux, au choix mais explicitement :
1. retirer le bloc `describe("Contrefactuel...")` ajouté (lignes 336-372) pour que la copie soit
   réellement verbatim, comme le cartouche l'affirme ; ou
2. conserver le bloc mais **corriger le cartouche** (`:24-25`) pour qu'il déclare cette addition
   au lieu de la nier, et clarifier dans `CLAUDE.md` que le diff « cartouche seul » ne concerne
   que le script — pas le fichier de garde, qui diverge de +2 tests par rapport aux sœurs.

Dans les deux cas, la chaîne technique restant verte, ce retour porte sur la véracité de la
documentation embarquée, pas sur une régression fonctionnelle.
