# Re-gate qualité P2 — lot C.2-a + B'-a (correctif post-FAIL)

> Exécuté par 🏹 Legolas, le 2026-09-05, sur ordre de mission d'Aragorn (RE-GATE après
> correctif). Branche : `feat/facade-tauri-ossature-release`, tête `30d77bb`, 5 commits
> de correction au-dessus du gate 1 (`18478ca`) : `b567771`, `261c2c5`, `a0a21bf`,
> `31fcb41`, `30d77bb`. Ce document est un **procès-verbal daté distinct** — il ne réécrit
> pas `docs/qualite/gate-facade-tauri-ossature-release.md`.
> Poste de mesure : macOS arm64, Node v24.18.0 / npm 11.16.0, rustc/cargo 1.96.0.
> Aucune mesure du gate 1 n'est reprise telle quelle, et **aucune mesure ni preuve du
> correctif de Gimli n'est reprise telle quelle non plus** : chaque critère ci-dessous a
> été **re-mesuré indépendamment** dans cette session.

## Verdict : **PASS**

Le seul point qui avait fait tomber le gate 1 — CA-I8a, le trou de la garde de
vocabulaire sur un motif `[1/4]` reconstruit par interpolation — est corrigé et
**re-démontré ici par un contrefactuel que j'ai rejoué moi-même**, avec un test que
j'ai écrit indépendamment de celui de Gimli. Les 16 critères d'acceptation sont PASS.
Aucun `.rs` ni `tauri.conf.json` n'a bougé depuis le gate 1 : le build Tauri natif n'a
donc pas été rejoué (justifié § 1). Deux écarts non bloquants restent à noter (§ 5).

---

## 1. Chaîne qualité — chaque commande, son code, son chiffre (re-mesurée)

| Commande | Code de sortie | Résumé cité |
|---|---|---|
| `npm run typecheck` (`tsc --noEmit`) | `0` | aucune sortie (silence = 0 erreur) |
| `npm run lint` (`eslint .`) | `0` | aucune sortie |
| `npm run test` (`vitest run`) | `0` | `Test Files  9 passed (9)` / `Tests  41 passed (41)` — 3 tests de plus qu'au gate 1 (38→41), exactement le nouveau fichier `vocabulaire-moteur-rendu.test.tsx` |
| `npm run build` (`tsc && vite build`) | `0` | `✓ 35 modules transformed` / `✓ built in 394ms` |
| `cargo test` (dans `src-tauri/`) | `0` | `test result: ok. 5 passed; 0 failed` (lib) + 2× `0 passed; 0 failed` (main, doc-tests) — identique au gate 1 |
| `cargo fmt --check` (dans `src-tauri/`) | `0` | aucune sortie |
| `cargo clippy --all-targets -- -D warnings` (dans `src-tauri/`) | `0` | `Finished \`dev\` profile [unoptimized + debuginfo] target(s) in 0.61s` |

**Build Tauri natif (`npm run tauri build -- --target aarch64-apple-darwin`) : NON rejoué,
justifié.** `git diff --stat 18478ca..HEAD` liste exactement 7 fichiers modifiés par les 5
commits de correction :

```
docs/qualite/mesures-etape-1-lot-C2a.md         | 93 ++++
specs/.iakaframe-journal.json                   | 10 +
specs/etat-des-lieux.html                       | 22 +--
specs/etat-des-lieux.md                         | 52 +++--
src/App.css                                     |  7 +
src/App.tsx                                     |  6 +-
src/__tests__/vocabulaire-moteur-rendu.test.tsx | 84 ++++
```

Aucun `.rs`, aucun `tauri.conf.json` (`git diff 18478ca..HEAD -- src-tauri/` et
`git log --oneline 18478ca..HEAD -- src-tauri/ '**/tauri.conf.json'` : les deux vides).
Le correctif ne touche que le front (React) et de la documentation/traçabilité. Rejouer
un build natif complet n'aurait revalidé aucune ligne modifiée par ce lot ; `cargo
test`/`fmt`/`clippy` ci-dessus couvrent déjà, à froid, l'intégralité de la surface Rust
inchangée. Le `.app`/`.dmg` du gate 1 restent la dernière preuve de buildabilité valide
pour cette surface.

---

## 2. CA-I8a — re-mesuré des deux côtés, contrefactuel rejoué indépendamment

### (a) Rendu réel des deux OS, balayage contre le registre — test écrit par moi, pas celui de Gimli

J'ai écrit un fichier de test temporaire indépendant
(`src/__tests__/legolas-remesure-i8a.test.tsx`, créé puis **supprimé après la mesure** —
`git status --porcelain` vide confirmé après), qui rend `<App/>` avec
`@testing-library/react` (mocks `detectPrerequisites`/`getPlatformInfo`) et balaie
`document.body.textContent` contre `fixtures/vocabulaire-interdit.json`, sans réutiliser
une ligne du test de Gimli :

```
$ npx vitest run src/__tests__/legolas-remesure-i8a.test.tsx
 Test Files  1 passed (1)
      Tests  3 passed (3)
```

Résultat : **macOS** — aucun motif du registre trouvé, `[1/4]` absent (`not.toMatch`),
`Étape 1 sur 4` présent. **Windows** — aucun motif du registre trouvé (chemin refusé,
couverture REFUSÉE affichée, testé quand même). **CA-I9** — `4 étapes / 3 téléchargements`
toujours rendu, non capturé par aucun motif.

### (b) Contrefactuel — réintroduction de `[{n}/{N}]`, joué dans l'arbre réel avec restauration prouvée

sha256 avant : `433bada38596cc5e4572770b80dd8b99b083c797289f8af8dce0eec7bf273800` (`src/App.tsx`).

Remplacement, dans le fichier réel, de `Étape {etape.n} sur {NB_ETAPES} — {etape.nom}` par
`[{etape.n}/{NB_ETAPES}] {etape.nom}` (copie de sauvegarde dans le scratchpad avant
mutation) :

```
$ npx vitest run src/__tests__/legolas-remesure-i8a.test.tsx src/__tests__/vocabulaire-moteur-rendu.test.tsx
 FAIL  .../vocabulaire-moteur-rendu.test.tsx > ... (macos)
 AssertionError: motifs du moteur trouves dans le RENDU (macos):
 [1/4]: expected [ '[1/4]' ] to deeply equal []
 FAIL  .../vocabulaire-moteur-rendu.test.tsx > ... (windows)
 AssertionError: ... [1/4]: expected [ '[1/4]' ] to deeply equal []
 Test Files  2 failed (2)
      Tests  4 failed | 2 passed (6)
```

**La garde rougit nommément**, sur mon test comme sur celui de Gimli, dès que le format
`[n/N]` réapparaît au rendu — exactement le trou que le gate 1 avait démontré exploité.
Restauration : `cp` depuis la sauvegarde, sha256 après :
`433bada38596cc5e4572770b80dd8b99b083c797289f8af8dce0eec7bf273800` — **identique**.
`git diff --stat src/App.tsx` vide après restauration.

### (c) La nouvelle forme « Étape n sur N » n'est-elle pas elle-même un motif du moteur ?

Lecture de la **prose réelle** du CLI, en lecture seule stricte dans `~/work/iakaframe`
(`git status --porcelain` vide avant et après, aucune écriture) :

```
$ node cli/src/index.js install --dry-run --root . --target-claude /tmp/legolas-x --apps-dir /tmp/legolas-x
==== iakaframe install ====
4 étapes / 3 téléchargements (AR-A) :
  [1/4] CLI (téléchargement)
  [2/4] méthode
  [3/4] IakaCockpit (téléchargement)
  [4/4] iakaFrameGUI (téléchargement)
...
```

Le moteur imprime toujours `[n/4]`, **jamais** `Étape n sur N`. Recherche complémentaire :
`grep -rniE "étape [0-9] sur|etape [0-9] sur" cli/` (hors `node_modules`) ⇒ **0
occurrence**. La nouvelle forme choisie par Gimli n'est donc **pas** elle-même un motif
que le moteur imprime — le remplacement ne déplace pas le problème, il le supprime.

**Fait annexe observé pendant cette lecture, hors périmètre du gate mais à signaler** :
au moment de ma mesure, `~/work/iakaframe` est sur la branche `feat/contrat-machine-install`
(arbre **propre**, tête `7292651`), et `install --json` **émet désormais un JSON bien
formé** (`grep -c '^{'` ⇒ `1`), et le verbe `install` **apparaît maintenant** dans
`cli/test/guard-json-output.test.js`. C'est différent à la fois de M-C1/M-C2 tels
qu'établis au 2026-09-04 dans l'instruction, et de l'état « non commité » que le
correctif de Gimli décrit dans `docs/qualite/mesures-etape-1-lot-C2a.md` (arbre alors
sale, fichiers modifiés/non suivis). Le chantier `CONTRAT-MACHINE-DU-VERBE-INSTALL` a
donc **avancé et été commité** entre l'écriture de ce document par Gimli et ma mesure,
le même jour. Ceci ne change rien à ce gate : (i) c'est un dépôt distinct, hors
périmètre du lot `iakaInstall` ; (ii) le fait qui importe pour CA-I8a — le format prose
`[n/4]`, indépendant du contrat JSON — tient toujours, mesuré à l'instant. Je le signale
à Aragorn comme illustration concrète, et datée, de l'instabilité que le correctif de
Gimli avait déjà anticipée et documentée honnêtement (« ne pas fonder de décision de
cadrage sur un état non commité de ce dépôt » — désormais commité, mais toujours mouvant).

### (d) Comptage AR-A (CA-I9) toujours rendu, non capturé

```
$ grep -n "4 étapes" src/App.tsx
68:      <p className="comptage">4 étapes / 3 téléchargements</p>
$ grep -rniE "(trois|3) installations" src/
(0 occurrence, exit 1)
```

Confirmé également par le test (a) ci-dessus, côté rendu.

**Verdict CA-I8a : PASS.** Le trou est corrigé, la correction est démontrée par
contrefactuel indépendant, la nouvelle forme ne recrée pas le problème et n'entre pas
en collision avec CA-I9.

---

## 3. Non-régression des 15 autres critères

**Rejoués (minimum imposé par la mission)** :

| # | Verdict | Preuve re-mesurée |
|---|---|---|
| CA-I3 (SHA épinglé) | PASS | `.github/workflows/release.yml:103` : `tauri-apps/tauri-action@84b9d35b5fc46c1e45415bdb6144030364f7ebc5 # action-v0.6.2` — inchangé (fichier non touché par le correctif, cf. § 4) |
| CA-I4 (cliquet du pin) | PASS | `fixtures/tauri-action-pin.json` : `entreesDeclarees` = 28 entrées, inchangé |
| CA-I5 (4 plateformes) | PASS | `grep -c '"key":"' .github/workflows/release.yml` ⇒ `4` |
| CA-I9 (comptage AR-A) | PASS | Voir § 2(d) |
| CA-I10 (couverture réelle) | PASS | `npx vitest run src/__tests__/ecran-annonce.test.tsx` ⇒ `Test Files 1 passed`, `Tests 5 passed` |
| CA-I11 (bouton désarmé) | PASS | `src/App.tsx:102` : `<button type="button" disabled>` toujours présent ; `grep -rn "'--yes'\|\"--yes\"" src/ src-tauri/src/` ⇒ 0 occurrence |

**Confirmés par diff (fichiers non touchés par les 5 commits de correction)** :
`git diff --stat 18478ca..HEAD` (§ 1) n'inclut ni `src-tauri/tauri.conf.json` (CA-I1),
ni `.github/workflows/release.yml` (CA-I6, CA-I7), ni `src-tauri/src/lib.rs` (CA-I12),
ni `CLAUDE.md`/`package.json` (CA-I14). Ces critères restent dans l'état PASS établi et
motivé au gate 1, par construction (rien n'a pu les faire régresser).

**Re-vérifiés à neuf par prudence (peu coûteux)** :
- CA-I13 (secrets) : `git ls-files -z | xargs -0 grep -nIE '(BEGIN [A-Z ]*PRIVATE KEY|FORGEJO_TOKEN=|GITHUB_TOKEN=|TAURI_SIGNING_PRIVATE_KEY=)'` hors citation littérale dans l'instruction ⇒ 0 ; `git ls-files | grep -c '^\.env$'` ⇒ `0`. PASS.
- CA-I15 (dépôts frères intacts) : hors périmètre d'écriture de cette session, aucune trace laissée (voir § 6).
- CA-I16 (chaîne qualité verte) : voir § 1, tableau par commande, aucune formule d'ensemble.
- CA-I2 (build local), CA-I8b : non re-rejoués physiquement ce tour (build natif non refait, § 1) ; aucun motif de suspicion, aucun fichier concerné modifié.

---

## 4. Écarts non bloquants du gate 1 — recevabilité

| # | Écart (gate 1) | État constaté | Verdict |
|---|---|---|---|
| E-1 | Étape 1 de l'instruction jamais citée par Gimli | `docs/qualite/mesures-etape-1-lot-C2a.md` (commit `a0a21bf`) rejoue les 3 commandes, **date** la mesure (2026-09-05), **cite les sorties réelles**, et pose un **caveat explicite et honnête** sur l'arbre `iakaframe` non propre au moment de la mesure (diff `git status --porcelain` cité littéralement). J'ai vérifié moi-même que l'état a depuis évolué (§ 2c) — le document ne prétend pas figer un fait qu'il savait volatile, il le signale. | **Recevable.** Traçabilité posée, honnête sur ses limites. |
| E-2 | CA-I7 comparaison non automatisée | Non concerné par ce lot de correction, aucun fichier touché. | Inchangé, toujours non bloquant (limite déjà documentée). |
| E-3 | `specs/etat-des-lieux.md` non régénéré | Régénéré par le commit `31fcb41`. Lu intégralement : le récit cite les 5 commits de correction, explique le problème corrigé, mentionne explicitement le fait volatile d'`iakaframe` en le datant et en le qualifiant de « à confirmer », et pose une prochaine étape concrète (remise au gate). `specs/etat-des-lieux.html` régénéré en parallèle (diff 22 lignes, cohérent). | **Recevable, écart levé.** |

---

## 5. Le correctif `30d77bb` (import JSON) — la garde lit-elle toujours le vrai registre ?

Diff du commit : remplace `readFileSync(join(ROOT, "fixtures/vocabulaire-interdit.json"))`
par `import registre from "../../fixtures/vocabulaire-interdit.json"` (motif déclaré :
`tsconfig` front sans types Node, `readFileSync`/`process.cwd()` faisaient échouer
`tsc --noEmit`).

**Vérification indépendante, par mutation réelle du registre** (pas une lecture du code,
une preuve par le comportement) :

```
sha256 avant fixtures/vocabulaire-interdit.json : 9757072eb3e065b58a40971d24c8872cb7a0fbe666b0f5f8ed7dc4c71ef7b6b9
```

Ajout d'un motif temporaire `"iakaInstall"` au registre réel (14e entrée) :

```
$ npx vitest run src/__tests__/vocabulaire-moteur-rendu.test.tsx scripts/__tests__/vocabulaire-moteur.test.mjs
 FAIL scripts/__tests__/vocabulaire-moteur.test.mjs > ... (cliquet de complétude, 13 → 14, rougit)
 FAIL src/__tests__/vocabulaire-moteur-rendu.test.tsx > ... (macos)
 AssertionError: iakaInstall: expected [ 'iakaInstall' ] to deeply equal []
 FAIL ... (windows) — idem
```

**La garde par import JSON relit bel et bien le fichier réel à chaque run** — sans cache
figé, sans copie gelée au moment du build : la mutation est vue **immédiatement**, sur
le même process `vitest run`, sans étape de reconstruction manuelle. C'est cohérent avec
le fonctionnement de la transformation Vite/esbuild des imports JSON sous Vitest (lecture
disque à la transformation, invalidée par le hash du fichier). Restauration :
`cp` depuis la sauvegarde, sha256 après : `9757072eb3e065b58a40971d24c8872cb7a0fbe666b0f5f8ed7dc4c71ef7b6b9`
— **identique**. `git status --porcelain` vide après.

**Verdict : PASS.** Le correctif de typage ne dégrade pas la garde ; il reste couplé au
registre réel et versionné, pas à une copie figée.

---

## 6. Arbre remis comme trouvé

- `src/App.tsx` : muté deux fois (contrefactuel `[n/N]`, § 2b) puis restauré à chaque
  fois — sha256 identique avant/après : `433bada38596cc5e4572770b80dd8b99b083c797289f8af8dce0eec7bf273800`.
- `fixtures/vocabulaire-interdit.json` : muté une fois (ajout temporaire d'un motif,
  § 5) puis restauré — sha256 identique avant/après :
  `9757072eb3e065b58a40971d24c8872cb7a0fbe666b0f5f8ed7dc4c71ef7b6b9`.
- `src/__tests__/legolas-remesure-i8a.test.tsx` : créé pour la preuve indépendante du
  § 2, supprimé avant de conclure.
- Copies de sauvegarde utilisées pour restaurer : dans le scratchpad de session
  (`/private/tmp/claude-501/.../scratchpad/`), jamais dans le dépôt.
- `git status --porcelain` : **vide** dans `iakaInstall` à l'instant de la rédaction de
  ce rapport (avant le commit du rapport lui-même).
- `~/work/iakaframe` : **lecture seule stricte** tout du long — aucune écriture, aucune
  commande hors `node cli/src/index.js install --dry-run [...]` et `grep`/`git status`.
  `git status --porcelain` vide avant et après chaque lecture, confirmé à plusieurs
  reprises (§ 2c).
- Aucune autre modification, aucun autre dépôt touché.

---

## 7. Ce qui reste au décideur (jamais un agent)

- **Le passage du dépôt en public** (AR-I4), précédé du balayage de secrets CA-I13, PASS
  ici comme au gate 1. Visibilité actuelle non mesurée (nécessite un appel authentifié à
  l'API GitHub, non joué).
- **Le premier run réel de `release.yml` en CI** (builds Windows/Linux/macOS Intel, effet
  du job `latest`) — rien de ce gate ne le suppose.
- **Les builds et recettes réelles sur Windows, Linux et macOS Intel** — machines absentes
  de ce poste.
- **La fusion en `main`** de `feat/facade-tauri-ossature-release` — acte du décideur,
  ce gate PASS l'ouvre mais ne la déclenche pas.
- **Le suivi du chantier `CONTRAT-MACHINE-DU-VERBE-INSTALL`** dans `iakaframe` (§ 2c) —
  hors périmètre de ce gate, signalé à Aragorn pour arbitrage éventuel sur le calendrier
  de C.2-b (le jour où `install` émettra un contrat JSON stable, le bouton désarmé de
  CA-I11 redeviendra un sujet de cadrage).
