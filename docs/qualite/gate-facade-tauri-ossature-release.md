# Gate qualité P2 — lot C.2-a + B'-a (façade Tauri + ossature de release)

> Exécuté par 🏹 Legolas, le 2026-09-05, sur ordre de mission d'Aragorn.
> Branche : `feat/facade-tauri-ossature-release` (HEAD `bb98387`, 7 commits au-dessus de
> `main` @ `fb5583b`, non poussée). Instruction de référence :
> `specs/instructions/facade-installeur-tauri-ossature-release.md`.
> Poste de mesure : macOS arm64, Node v24.18.0 / npm 11.16.0, rustc/cargo 1.96.0.
> Aucune coche de Gimli n'est reprise telle quelle : chaque critère ci-dessous a été
> **re-mesuré** dans cette session, indépendamment.

## Verdict : **FAIL**

Un seul critère tombe, mais c'est celui que la mission désignait comme central (R3) : la
garde de vocabulaire (CA-I8a) a un **angle mort réel et déjà exploité par le code livré**
— pas hypothétique. Tous les autres critères mesurés sont PASS. Le renvoi va à ⚒️ Gimli
avec la reproduction ci-dessous ; rien d'autre ne bloque.

---

## 1. Chaîne qualité — chaque commande, son code, son chiffre

| Commande | Code de sortie | Résumé cité |
|---|---|---|
| `npm ci` | `0` | `added 253 packages, and audited 254 packages in 2s` — 0 vulnerabilities |
| `npm run typecheck` (`tsc --noEmit`) | `0` | aucune sortie (silence = 0 erreur) |
| `npm run lint` (`eslint .`) | `0` | aucune sortie |
| `npm run test` (`vitest run`) | `0` | `Test Files  8 passed (8)` / `Tests  38 passed (38)` |
| `npm run build` (`tsc && vite build`) | `0` | `✓ 35 modules transformed` / `✓ built in 324ms` |
| `cargo test` (dans `src-tauri/`) | `0` | `test result: ok. 5 passed; 0 failed` (lib) + 2× `0 passed; 0 failed` (main, doc-tests) |
| `cargo fmt --check` (dans `src-tauri/`) | `0` | aucune sortie |
| `cargo clippy --all-targets -- -D warnings` (dans `src-tauri/`) | `0` | `Finished \`dev\` profile [unoptimized + debuginfo] target(s) in 0.64s` |
| `npm run tauri build -- --target aarch64-apple-darwin` | `0` | `Finished 2 bundles at: .../bundle/macos/iakaInstall.app` et `.../bundle/dmg/iakaInstall_0.1.0_aarch64.dmg` |

**Piège Finder/AppleScript du DMG** : ne s'est **pas** manifesté sur ce run — le `.dmg` a
été produit avec succès (`iakaInstall_0.1.0_aarch64.dmg`, 2 933 460 octets). Le `.app`
existe de toute façon : `src-tauri/target/aarch64-apple-darwin/release/bundle/macos/iakaInstall.app`.

**Aucun secret de signature dans l'environnement** : `env | grep -iE "TAURI_SIGNING|SIGN"`
⇒ rien (code de sortie `1`, aucune correspondance). Le build n'a exigé aucun secret,
conforme à CA-I2.

---

## 2. Critères d'acceptation — un par un, re-mesurés

| # | Verdict | Preuve |
|---|---|---|
| CA-I1 (nom figé) | **PASS** | `src-tauri/tauri.conf.json` : `"productName": "iakaInstall"`. Contrefactuel joué (`iakainstall`) ⇒ `nom-produit.test.mjs` rougit en nommant le champ et les deux valeurs. Restauré, sha256 identique avant/après (`c371c67a…`). |
| CA-I2 (build local) | **PASS** | `npm run tauri build -- --target aarch64-apple-darwin` ⇒ code 0, `.app` et `.dmg` produits. Aucun `TAURI_SIGNING_*` dans l'environnement. |
| CA-I3 (SHA épinglé) | **PASS** | `.github/workflows/release.yml:103` : `tauri-apps/tauri-action@84b9d35b5fc46c1e45415bdb6144030364f7ebc5 # action-v0.6.2`. `grep -c 'tauri-action@v'` ⇒ `0`. SHA vérifié **exact** contre l'API GitHub sans authentification : `GET /repos/tauri-apps/tauri-action/git/ref/tags/action-v0.6.2` ⇒ `84b9d35b5fc46c1e45415bdb6144030364f7ebc5`. Contrefactuel joué **en mémoire seulement** (jamais écrit sur disque, cf. § 3) : `ref` mutée en `v0.6.2` ⇒ `estSha40` rend `false`, la garde rougirait nommément. Fichier réel jamais touché (sha256 `d8186cf8…` inchangé). |
| CA-I4 (cliquet du pin) | **PASS** | `fixtures/tauri-action-pin.json` porte le SHA, `actionYmlSha256`, `entreesDeclarees` (28 entrées), `entreesAbsentesVerifiees` (`uploadUpdaterJson`, `uploadUpdaterSignatures`), l'ordre de re-lecture. `npm run test` couvre CA-13/14/15/D-4, tous verts. |
| CA-I5 (4 plateformes) | **PASS** | `grep -c '"key":"'` ⇒ `4` (`macos-arm64`, `macos-x64`, `linux`, `windows`). **Contrefactuel joué dans l'arbre réel** : retrait de la clé `windows` ⇒ `release-matrice.test.mjs` rougit en citant la clé manquante (`- "windows"`). Restauré, sha256 identique avant/après (`d8186cf8…`), `git status --porcelain` vide après restauration. |
| CA-I6 (`includeUpdaterJson: false`) | **PASS** | `release.yml:115` : `includeUpdaterJson: false`, motif écrit lignes 9-12 et 111-114. |
| CA-I7 (job `latest`) | **PASS, avec une nuance à signaler** | Le job existe, `if: always()`, lit `repos/<depot>/releases` (pas les tags), exclut brouillons/préversions, sort en succès en le disant si aucune release. J'ai **diffé manuellement** le fichier contre `IakaCockpit@8ed1e1a` (le commit cité en tête du fichier, confirmé présent dans l'historique du dépôt) : le bloc `prepare`+`build` matrice est **byte-identique**, le bloc `latest` est **logiquement identique** (commentaires massivement raccourcis, aucune ligne de commande modifiée). ⚠️ **Nuance** : le test réel (`bloc-latest.test.mjs`) compare l'empreinte du bloc à une **fixture locale** (`fixtures/bloc-latest.sha256`), pas à une comparaison **live** avec `IakaCockpit@main` comme le libellé du critère le suggère — ce qui est cohérent avec le choix documenté (garde purement locale, `iakaInstall` non inscrit au registre de convergence des sœurs, AR-E) mais mérite d'être noté : la preuve d'équivalence avec le Cockpit repose sur ma comparaison manuelle de cette session, pas sur un mécanisme automatique et permanent. |
| CA-I8a (garde de vocabulaire) | **FAIL — voir § 3, c'est le point qui fait tomber le gate** | |
| CA-I8b | **Déclaré non couvert, à bon droit** | Confirmé : `install --json` n'émet toujours aucun JSON (re-mesuré, § 4). Le critère reste structurellement bloqué, comme écrit. |
| CA-I9 (comptage AR-A) | **PASS** | `grep -rn "4 étapes" src/` ⇒ `src/App.tsx:68` (`4 étapes / 3 téléchargements`). `grep -rniE "(trois|3) installations" src/` ⇒ 0 occurrence. |
| CA-I10 (couverture réelle) | **PASS** | `src/coverage.ts` déclare `etapes34Couvertes` (macOS seul) ; `src/__tests__/ecran-annonce.test.tsx` teste le rendu sur `windows` (refus affiché, `REFUSEES`) et sur `macos` (`sont couvertes.`). Rejoué : `npx vitest run` sur ce fichier isolé ⇒ vert. |
| CA-I11 (bouton désarmé) | **PASS** | `src/App.tsx` : `<button type="button" disabled>Lancer l'installation</button>` + `CAUSE_DESARMEMENT` nommant explicitement le manquant. `grep -rn "'--yes'\|\"--yes\"" src/ src-tauri/src/` ⇒ 0 occurrence. |
| CA-I12 (prérequis détectés) | **PASS** | `src-tauri/src/lib.rs::detect_prerequisites` sonde `node --version` / `npm --version` par sous-processus, jamais supposé. 5 tests Rust dédiés, tous verts (dont un qui vérifie que l'absence n'est jamais fabriquée). |
| CA-I13 (aucun secret) | **PASS** | `git ls-files -z \| xargs -0 grep -nIE '(BEGIN [A-Z ]*PRIVATE KEY\|FORGEJO_TOKEN=\|GITHUB_TOKEN=\|TAURI_SIGNING_PRIVATE_KEY=...)'` ⇒ la seule correspondance est la citation **littérale** de ce motif de recherche dans l'instruction elle-même (`specs/instructions/…:661`), pas un secret. `git ls-files \| grep -c '^\.env$'` ⇒ `0`. Recherche complémentaire de SHA hex-40 : uniquement des SHA de commit/action légitimes et documentés (`84b9d35b…`, `8ed1e1a1…`, `1deb371b…`). Recherche `ghp_`/`glpat-` ⇒ 0 occurrence. |
| CA-I14 (doc sans commande fantôme) | **PASS** | `commandes-documentees.test.mjs` (dans `npm run test`, vert) vérifie chaque `npm run <x>` cité dans `CLAUDE.md` contre `package.json`. Vérification visuelle : les 7 commandes citées (`dev`, `tauri dev`, `build`, `tauri build`, `typecheck`, `lint`, `test`, `chartes`) existent toutes. |
| CA-I15 (dépôts frères intacts) | **PASS** | `git -C ~/work/IakaCockpit status --porcelain` ⇒ vide. `git -C ~/work/iakaFrameGUI status --porcelain` ⇒ vide. `git -C ~/work/iakaframe status --porcelain` ⇒ vide. |
| CA-I16 (chaîne qualité verte) | **PASS** | Voir § 1 — une ligne par commande, code + chiffre, aucune formule d'ensemble. |

---

## 3. FAIL — CA-I8a, garde de vocabulaire (R3, le risque central)

**Ce que la mesure explicite dit** : `npm run test` est vert, et mon propre contrefactuel
instruit (injecter `"minisign"` dans `src/App.tsx`) fait bien rougir la garde nommément
(`src/App.tsx :: "minisign"`), avec restauration prouvée au sha256
(`ed0ccf0f621bdf28…` identique avant/après). **Sur ce point précis, la garde fonctionne.**

**Ce que j'ai trouvé en creusant plus loin, et qui fait tomber le gate** : la garde est un
**grep statique sur le texte source**. Le code livré construit **déjà**, par
interpolation JSX, une chaîne qui reproduit **littéralement** un motif interdit du
registre — sans jamais l'écrire comme chaîne littérale, donc sans jamais déclencher le
grep.

- **Fichier** : `src/App.tsx:74` — `[{etape.n}/{NB_ETAPES}] {etape.nom}`.
- **Motif interdit concerné** : `[1/4]`, inscrit dans `fixtures/vocabulaire-interdit.json`
  avec la raison *« format de progression imprimé par le moteur (prose CLI, install.js) »*.
- **Reproduction** : j'ai re-mesuré la sortie réelle du moteur (§ 4) —
  `node cli/src/index.js install --dry-run --json …` imprime en toute première ligne utile
  `[1/4] CLI (téléchargement)`. Puis j'ai rendu `<App />` avec `@testing-library/react`
  (mocks `detectPrerequisites`/`getPlatformInfo` résolus, `os: "macos"`) dans un fichier de
  test **temporaire**, jamais committé
  (`/private/tmp/.../scratchpad/preuve-1-4.test.tsx`, supprimé après coup — `git status
  --porcelain src/__tests__/` vide après) :
  ```
  expect(document.body.textContent).toMatch(/\[1\/4\]/);
  ```
  ⇒ **1 test passed** : le texte rendu par l'écran d'annonce contient bel et bien,
  littéralement, `[1/4]` — exactement le motif que le registre bannit, et exactement la
  forme sous laquelle le moteur l'imprime dans sa prose.
- **Pourquoi la garde ne le voit pas** : `vocabulaire-moteur.test.mjs` lit le **texte du
  fichier source** (`readFileSync`) et cherche des occurrences **littérales** des motifs.
  `[{etape.n}/{NB_ETAPES}]` n'est jamais, dans le fichier, la chaîne `[1/4]` — elle
  n'existe qu'une fois le composant **rendu**, avec `etape.n = 1`. Le grep est donc
  **structurellement aveugle** à toute reconstruction dynamique d'un motif banni.

**Pourquoi ce n'est pas une chicane** : c'est exactement le risque que l'instruction
elle-même nomme et redoute — **R-I5**, § 7 : *« Faux vert de la garde de vocabulaire. Si
le motif ne peut rien matcher par construction, la garde est verte et aveugle — le témoin
vide déjà payé deux fois dans ce portefeuille. »* Ici ce n'est pas hypothétique : le code
**actuellement livré** produit, au rendu, la reproduction exacte de la prose du moteur
pour numéroter ses étapes — la même convention `[n/4]` que `install.js` utilise pour ses
propres étapes réelles. Un utilisateur qui verrait `[1/4] CLI` dans le CLI puis
`[1/4] CLI` dans l'application aurait toutes les raisons de croire que la façade **reflète
un état réel de progression** — précisément la confusion que R3 interdit, et que CA-I8a
est censée empêcher structurellement.

**Ce que je ne dis pas** : je ne dis pas que `steps.ts`/`App.tsx` *exécutent* une seconde
implémentation de la logique du moteur — `ETAPES_ANNONCEES` est un tableau statique,
indépendant de toute exécution réelle (vérifié, § 2 du fichier). La substance de R3 (une
décision ou un état qui n'existerait que dans l'interface) n'est **pas** engagée ici. Mais
le **critère CA-I8a**, tel qu'écrit, est une garde **mécanique** contre la dérive de
vocabulaire, et elle a un trou démontré, déjà rempli par du code réel. Une garde qui rate
sa propre cible n'est pas une garde qui passe.

**Verdict du critère : FAIL.** Ce n'est pas bloquant parce que la logique serait dupliquée
(elle ne l'est pas) — c'est bloquant parce que **la garde censée l'empêcher est prouvée
contournable, et le code actuel la contourne déjà**, sans que quiconque l'ait vu passer
`npm run test` en vert.

**Ce qui revient à Gimli** : soit reformuler l'affichage du numéro d'étape pour ne pas
reproduire le format `[n/N]` du moteur (ex. `Étape 1 sur 4`), soit étendre la garde pour
détecter les motifs reconstruits par interpolation (plus dur, et probablement hors de
portée d'un simple grep de texte — un test de **rendu** ciblé, comme celui que j'ai joué
ci-dessus, est la voie la plus sûre et la moins chère).

---

## 4. R3 — recherche active de logique d'installation dans la façade

Recherche exhaustive sur `src/`, `src-tauri/src/`, et en particulier le hors-couverture
déclaré `src/api/backend.ts` :

```
grep -rniE "minisign|download|telecharg|~/Applications|\.claude|manifest|writeFile|fs::write|reqwest|resolve.*manifest" src/ src-tauri/src/
```
⇒ Aucune occurrence de logique métier. Les seules correspondances sont :
- des commentaires déclaratifs (`coverage.ts` citant `cleManifestePlateforme` **côté CLI**,
  pour expliquer pourquoi la couverture est macOS-seule — jamais réimplémenté) ;
- le champ statique `telecharge: boolean` de `steps.ts` (annonce, pas exécution) ;
- `src/assets/chartes/manifest.ts`, qui est le manifeste de **charte visuelle** généré par
  `sync-chartes.sh`, sans rapport avec le manifeste d'installation du moteur.

`src/api/backend.ts` (10-46) expose exactement 3 fonctions : `ping()`, sonde de santé ;
`detectPrerequisites()`, sonde Node/npm ; `getPlatformInfo()`, sonde OS/arch. Aucun appel
minisign, aucun téléchargement, aucune écriture disque, aucune résolution de manifeste,
aucune décision d'étape. Côté Rust (`src-tauri/src/lib.rs`), les trois commandes
correspondantes ne font que `Command::new(programme).arg("--version").output()` et lire
`std::env::consts::{OS,ARCH}` — **aucune écriture, aucun réseau**. Tout état affiché
(prérequis, couverture) est bien obtenu par sonde locale, jamais fabriqué ni simulé.

**R3 tenu sur le fond** — le seul défaut trouvé est le défaut mécanique de la garde
(§ 3), pas une réimplémentation de la logique métier du moteur.

---

## 5. M-C1 à M-C4 — re-mesurés moi-même dans `iakaframe` (lecture seule)

L'instruction (§ 0.1) déclarait que Gandalf n'avait **pas** de shell pour vérifier ces
faits, et l'étape 1 de son plan d'implémentation (§ 5) exigeait explicitement que Gimli
les rejoue **avant d'écrire une ligne**, en **citant la sortie**.

**Constat** : aucun commit de la branche, ni `CLAUDE.md`, ni
`specs/etat-des-lieux.md` (toujours daté du 2026-09-03, onboarding initial, jamais
régénéré pour ce lot) ne cite la sortie de cette vérification. **Gimli ne semble pas
avoir formellement rejoué ni cité l'étape 1** — c'est un écart de traçabilité, signalé
ci-dessous en § 6.

**Je les ai re-mesurées moi-même, dans `iakaframe` (lecture seule, aucune écriture)** :

```
$ node cli/src/index.js install --dry-run --json --root . --target-claude /tmp/x --apps-dir /tmp/x | head -3
==== iakaframe install ====
4 étapes / 3 téléchargements (AR-A) :
  [1/4] CLI (téléchargement)
EXIT=0

$ node cli/src/index.js install --dry-run --json --root . 2>&1 | grep -c '^{'
0

$ grep -n "install" cli/test/guard-json-output.test.js
(aucune ligne — "install" absent de la liste NOMINAL)
```

**Confirmé** : M-C1 (aucun JSON émis malgré `--json`), M-C2 (le registre promet une sortie
machine qui n'existe pas — visible dans le titre `==== iakaframe install ====` et la prose
`[1/4] CLI…`, jamais un objet JSON), M-C3 (le verbe `install` n'est dans aucune liste
gardée du contrat C-JSON) tiennent **exactement** comme écrit au § 0.3 de l'instruction.
Ces faits **fondent** aussi la découverte du § 3 : `[1/4]` est bien la forme exacte
imprimée par le moteur, confirmée en direct.

---

## 6. Écarts non bloquants

| # | Écart | Effet |
|---|---|---|
| E-1 | **Étape 1 de l'instruction (§ 5) jamais citée par Gimli.** Aucun commit, aucun fichier du dépôt ne cite la sortie des trois commandes de vérification préalable. J'ai re-mesuré moi-même (§ 5) et les faits tiennent — donc **aucune conséquence sur le fond** — mais la traçabilité *instruction ↔ preuve* exigée par le lot n'est pas là. | Non bloquant (faits confirmés indépendamment), mais à corriger pour la prochaine livraison : citer la sortie, pas juste s'y fier. |
| E-2 | **CA-I7 : comparaison à `IakaCockpit@main` non automatisée.** La garde compare à une fixture locale figée (`fixtures/bloc-latest.sha256`), pas à une lecture live du dépôt frère. J'ai vérifié manuellement l'équivalence cette session (§ 2) ; rien ne le referait automatiquement à la prochaine dérive du Cockpit. | Non bloquant (choix déjà motivé et documenté comme garde locale, cohérent avec AR-E) — à noter comme limite connue. |
| E-3 | **`specs/etat-des-lieux.md` non régénéré** depuis l'onboarding (toujours `v0.1.0` / `main`, 2026-09-03) alors que 7 commits de fond ont été posés sur une branche de feature. `CLAUDE.md` du projet prescrit la régénération "à chaque changement de version". | Non bloquant pour ce gate (pas un CA-I), mais dette de documentation à lever avant merge en `main`. |

---

## 7. Ce qui reste au décideur (jamais un agent)

- **Le passage du dépôt en public** (AR-I4) — précédé du balayage de secrets CA-I13, que
  j'ai rejoué et qui est PASS. Visibilité actuelle non mesurée dans ce gate (nécessite un
  appel authentifié à l'API GitHub que je n'ai pas joué).
- **Le premier run réel de `release.yml`** en CI (build Windows/Linux/macOS Intel, effet
  du job `latest`, production du `.msi`/`.exe`/`.deb`/`.rpm`/AppImage) — rien de ce gate ne
  le suppose, conforme au tableau § 8 de l'instruction.
- **Les builds et recettes réelles** sur Windows, Linux et macOS Intel — machines absentes
  de ce poste.
- **La correction du défaut § 3** (CA-I8a) — retour à Gimli, ce n'est **pas** à moi de
  corriger le format d'affichage ni la garde.

---

## Ce que j'ai rendu tel que trouvé

- `src-tauri/tauri.conf.json` : muté (`productName`) puis restauré, sha256 identique
  (`c371c67a…`).
- `.github/workflows/release.yml` : muté deux fois dans l'arbre réel (retrait de la clé
  `windows` ; le contrefactuel du SHA a été joué **en mémoire seulement**, jamais écrit),
  restauré, sha256 identique (`d8186cf8…`) après chaque restauration.
- `src/App.tsx` : muté (`// minisign` ajouté) puis restauré, sha256 identique
  (`ed0ccf0f…`).
- `src/__tests__/preuve-1-4.test.tsx` : créé temporairement pour la preuve du § 3, supprimé
  avant de conclure — `git status --porcelain` confirmé vide.
- `src/assets/chartes/{chartes.css,manifest.ts}` : régénérés par `bash
  scripts/sync-chartes.sh` pour vérifier la reproductibilité — sortie byte-identique,
  `git status --porcelain` vide.
- Aucun autre fichier du dépôt `iakaInstall` n'a été modifié. Les dépôts `iakaframe`,
  `IakaCockpit`, `iakaFrameGUI` n'ont reçu aucune écriture (lecture seule respectée,
  confirmé par `git status --porcelain` vide sur les trois avant et après cette session).
