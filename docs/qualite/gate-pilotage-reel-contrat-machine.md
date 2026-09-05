# Rapport qualité — `feat/pilotage-reel-contrat-machine` — 2026-09-05

> Gate 🏹 Legolas, indépendant de ⚒️ Gimli (contexte séparé). Base :
> `specs/instructions/pilotage-reel-facade-contrat-machine.md` § 3, § 8 (CA-P1..P16).
> Toutes les mesures ci-dessous ont été **rejouées**, aucune n'est reprise du rapport de
> l'implémenteur. Aucune correction apportée au code : un seul fichier écrit par ce gate,
> celui-ci.

## Verdict : **FAIL**

Les **16 critères CA-P1 à CA-P16** passent, individuellement, avec leurs contrefactuels
rejoués. Mais le gate ne s'arrête pas à cette liste : la mission (point 7) demandait de vérifier
que le **premier run CI** ne casse pas — et il casse, **par construction, sur les quatre
plateformes de la matrice**, macOS arm64 (la cible de référence) y compris. C'est un écart
**bloquant**, pas une nuance : sans lui, la release qu'attend le lot suivant (C.3) ne peut
tout simplement pas se produire.

## Le défaut qui motive le FAIL — `release.yml` ne produit jamais la ressource

**Reproduction** :
```bash
cd ~/work/iakaInstall
mv src-tauri/resources/cli /tmp/cli-backup   # simule un checkout CI propre (resources/cli est gitignore)
npm run tauri build -- --target aarch64-apple-darwin --no-bundle
```
**Obtenu** :
```
resource path `resources/cli` doesn't exist
failed to build app: failed to build app
```
`bundle.resources` (`src-tauri/tauri.conf.json:36-38`) déclare `"resources/cli": "cli"`, un
dossier produit **uniquement** par `node scripts/embarquer-cli.mjs` (`npm run embarquer`),
**gitignoré** (`.gitignore:16`). `beforeBuildCommand` de `tauri.conf.json:9` vaut
`"npm run build"` (= `tsc && vite build`) — **rien n'appelle `embarquer`**. J'ai lu
`.github/workflows/release.yml` en entier : aucune étape `npm run embarquer` ni équivalent,
sur aucun des quatre jobs de la matrice (`macos-arm64`, `macos-x64`, `linux`, `windows`).

C'est exactement le point que l'instruction anticipait et rendait **conditionnellement
obligatoire** : § 4, table « Exclu », ligne *« Toucher `release.yml`… »* : *« Seule exception
possible : si AR-P2(b) est retenu, l'étape d'obtention de la ressource doit exister **dans le
build**, donc dans le workflow — c'est alors un ajout **déclaré**, gardé par le cliquet du bloc
`latest` qui ne doit pas bouger. »* **AR-P2(b) est retenu** (verdict du décideur, § 3, et
`fixtures/cli-embarque.json` confirme). L'exception s'applique donc et n'a **pas** été
exercée. Le § 5 étape 12 de l'instruction, cité dans l'ordre de mission (point 7), prévoyait
justement ce scénario : *« Si non, le premier run CI échouera : FAIL ou écart bloquant à
motiver. »* — je choisis FAIL, l'écart n'étant motivable par aucune circonstance : c'est une
étape manquante, point.

**J'ai restauré `src-tauri/resources/cli/` immédiatement après cette mesure** (`mv` retour,
vérifié par `node <ressource>/src/index.js -v` → `0.40.0` et `git status --porcelain` vide).

**Ce que je ne dis pas** : la mesure ne porte que sur ce point précis (résolution de
`bundle.resources`). Je n'ai pas rejoué le reste de `release.yml` (le pin `tauri-action`, le
job `latest`) — non touchés par ce lot (`git diff main..HEAD` vide sur ce fichier), et hors
périmètre déclaré de ce gate.

---

## Mesures — chaîne qualité, ligne par ligne

| Commande | Code de sortie | Résumé cité |
|---|---|---|
| `npm run typecheck` | `0` | `tsc --noEmit` — aucune sortie, aucune erreur |
| `npm run lint` | `0` | `eslint .` — aucune sortie, aucune erreur |
| `npm run build` | `0` | `✓ built in 325ms` (`dist/index.html`, `dist/assets/index-*.js` 157.70 kB) |
| `npm run test` | `0` | `Test Files 16 passed (16)` · `Tests 67 passed (67)` (attendu : 67/67 — conforme) |
| `cargo test` (dans `src-tauri/`) | `0` | `test result: ok. 22 passed; 0 failed` (attendu : 22/22 — conforme) |
| `cargo fmt --check` | `0` | aucune sortie |
| `cargo clippy --all-targets -- -D warnings` | `0` | `Finished \`dev\` profile` — 0 warning |
| `npm run tauri build -- --target aarch64-apple-darwin` | `0` | `Finished 2 bundles` — `.app` + `.dmg` produits |
| `npm run rejeu:vivant` | `0` | `[rejeu-vivant] OK : 74 lignes, 0 non-JSON, termine par "fin"` |

**Rejeu manuel de `--dry-run --events` contre la ressource embarquée** (hors script, pour
comparaison indépendante) : `node src-tauri/resources/cli/src/index.js install --dry-run
--events --root src-tauri/resources/cli` → **74 lignes**, même distribution d'événements que
la fixture (`1 debut, 1 reservoir, 4 etape-annoncee, 4 etape-terminee, 62 log-delegue, 1 fin`),
mêmes six champs par étape (`quoi`/`ou`/`version` identiques), seuls les chemins cible
(`--target-claude`/`--apps-dir`) diffèrent puisque je n'ai pas isolé mon run dans un bac à
sable (mais c'était un `--dry-run`, donc **aucune écriture** — M-C5). Ceci **corrobore de
façon indépendante** que `fixtures/flux-apercu.ndjson` a bien été enregistrée par un run réel
contre le CLI `0.40.0`, pas écrite à la main.

## Le `.app` construit — vérification demandée explicitement

```
$APP/Contents/Resources/cli/package.json → "version": "0.40.0"
node $APP/Contents/Resources/cli/src/index.js -v → 0.40.0
```
Conforme.

---

## Tableau CA-P1 → CA-P16

| # | Critère | Verdict | Preuve |
|---|---|---|---|
| CA-P1 | Vocabulaire généré, jamais écrit à la main | **PASS** | `npm run vocabulaire && git diff --exit-code src/events/vocabulaire.ts` → 0. Contrefactuel : ligne ajoutée à la main → `git diff` rougit en la citant (`+// contrefactuel legolas`) |
| CA-P2 | Garde d'événements rougit dans les deux sens | **PASS** | 4 tests verts. Contrefactuel A (type inventé `etape-magique` dans `TYPES_RENDUS`) → `reducteur.ts:197` lève *« TYPES_RENDUS contient des types inventes : etape-magique »*. Contrefactuel B (retrait de `"rollback"` de `TYPES_RENDUS`) → *« type(s) du moteur ni rendu(s) ni declare(s) : rollback »* |
| CA-P3 | Le transport ne perd, ne coupe, ne mélange aucune ligne | **PASS** | `cargo test` : les 4 cas (ligne >64 Ko, lecture coupée, `\r` échappé, flux stderr séparé) verts. Contrefactuel : `lire_lignes` remplacé par une lecture à tampon fixe 4096 → `lire_lignes_ne_tronque_pas_une_ligne_de_plus_de_64ko` rouge, `left: 4096, right: 70000` |
| CA-P4 (= CA-I8b) | Rejeu sans interface, comparé champ par champ | **PASS** | `rejeu-flux-apercu.test.mjs` (7 tests) vert, garde anti-témoin-vide incluse. Réducteur relu ligne par ligne : aucune inférence trouvée (`etatAtteint.etapesFaites` jamais lu, tous les champs sont soit copiés tels quels soit normalisés `undefined→null`/`[]`, jamais recomposés). 2e jambe : `npm run rejeu:vivant` → code 0, 74 lignes, corroboré par mon propre rejeu indépendant (même distribution d'événements) |
| CA-P5 | L'aperçu est le premier écran, il ne peut rien accorder | **PASS** | `pilotage-ecran.test.tsx` (bloc `CA-P5`) vert, dans les 67 |
| CA-P6 | On n'accorde que ce qui est affiché | **PASS** | `pilotage-ecran.test.tsx` (bloc `CA-P6`) vert ; `BlocDecision` (`EcranPilotage.tsx:56`) exige `annonce` ET `demandeFeuVertEnCours` |
| CA-P7 | Une réponse = une ligne, après la demande, jamais avant | **PASS** | `cargo test` : 4 tests `repondre_*` verts (`pilote.rs:452-480`) |
| CA-P8 (= CA-I11) | `--yes` introuvable, aucun bouton hors demande | **PASS** | `grep -rn -- "--yes" src/ src-tauri/src/ scripts/` → exit 1 (0 occurrence). Contrefactuel : `argv.push("--yes")` ajouté dans `pilote.rs:116` → grep rougit `src-tauri/src/pilote.rs:116` |
| CA-P9 | Trois valeurs de version, une seule vérité | **PASS** | `egalite-version.test.mjs` + `egalite-version-ecran.test.tsx` verts. Contrefactuel : `fixtures/cli-embarque.json.version` muté en `9.9.9` → `expected '0.40.0' to be '9.9.9'`, les deux tests rougissent en nommant les deux valeurs |
| CA-P10 | Arrêt propre = refus ; `kill` nommé et séparé | **PASS** | `pilotage-ecran.test.tsx` (bloc `CA-P10`) vert ; `EcranPilotage.tsx:64-66` (« Non (arrêter) » → `repondreFeuVert(n,"non")`) et `:188-192` (« Forcer l'arrêt (dernier recours) » séparé, avertit des traces non défaites) |
| CA-P11 | En aperçu, aucune étape affichée comme faite | **PASS** | `rejeu-flux-apercu.test.mjs` : test dynamique (0 étape à `"faite"`) + test statique (`etapesFaites` absent du code source de `reducteur.ts`) verts. Grep croisé : `etapesFaites` n'apparaît que dans `EcranPilotage.tsx:127` (résumé de fin, autorisé), `modele.ts:56` (type) et un fixture de test — jamais pour dériver un état d'étape |
| CA-P12 | Coût d'entrée nul : aucune dépendance, permission ou CSP relâchée | **PASS** | `git diff main..HEAD -- src-tauri/Cargo.toml src-tauri/Cargo.lock src-tauri/capabilities/default.json` → vide. `git diff main..HEAD -- src-tauri/tauri.conf.json` → **seule** la clé `bundle.resources` ajoutée (+3 lignes), CSP identique |
| CA-P13 | Ressource vérifiée AVANT extraction | **PASS** | Lecture `embarquer-cli.mjs:63-77` : sha256 calculé puis comparé avant tout appel à `extraireTar`. Contrefactuel rejoué : fixture copiée avec `sha256` muté → `Error: sha256 divergent — REFUS D'EXTRAIRE` avant écriture, `dest-contrefactuel/` reste vide après coup (`ls` : 0 entrée) |
| CA-P14 | Aucun test/dev n'écrit hors du bac à sable | **PASS** | `cargo test` : 5 tests `bac_a_sable_*`/`mode_*` verts. Contrefactuel : `--apps-dir` retiré de `construire_argv` → `argv_reel_avec_bac_a_sable_est_exactement_les_drapeaux_attendus` rouge, diff montrant `--apps-dir` manquant dans l'argv obtenu |
| CA-P15 | Aucune régression des gardes de C.2-a | **PASS** | Les 9 fichiers nommés (`vocabulaire-moteur` cliquet 13 motifs, `vocabulaire-moteur-rendu`, `comptage-ar-a`, `ecran-annonce`, `nom-produit`, `pin-tauri-action`, `release-matrice`, `bloc-latest`, `commandes-documentees`) sont tous présents et verts dans les 67 |
| CA-P16 | Chaîne qualité verte, ligne par ligne | **PASS** (localement) | voir tableau ci-dessus — mais voir **le FAIL du gate**, hors liste des 16, ci-dessus |

---

## R3, les trois jambes — mesuré en détail

**(a) Vocabulaire interdit, source + rendu, extension du registre par Gimli lui-même.**
`git diff main..HEAD -- fixtures/vocabulaire-interdit.json` montre l'ajout de **6** entrées
`horsCouverture` (`src/events/vocabulaire.ts`, `reducteur.ts`, `modele.ts`,
`EcranPilotage.tsx`, `pilote.rs`), chacune motivée pour `rollback` et/ou `apps-dir`.
**J'ai vérifié que chaque exclusion est étroite en pratique** : pour les 5 fichiers, j'ai
balayé les **13 motifs** du registre un par un (`grep -qF`) — **seuls** les motifs annoncés
dans le `motif` de l'exclusion apparaissent (`rollback` pour les 4 premiers ; `rollback` +
`apps-dir` pour `pilote.rs`), aucun autre motif interdit ne s'y cache. **Réserve à noter, pas
un FAIL** : le mécanisme d'exclusion est **au niveau du fichier entier**
(`scripts/__tests__/vocabulaire-moteur.test.mjs:33` — `cheminsHorsCouverture.has(relatif)`
saute **tout** le fichier), pas motif par motif. Aujourd'hui c'est sans conséquence (mesuré
ci-dessus) mais **c'est une garde structurellement moins fine que ce qu'elle pourrait être** :
un futur ajout d'un motif interdit sans rapport (ex. `minisign`) dans un de ces 5 fichiers
passerait inaperçu. Contrefactuel `[1/4]` rejoué : ajout dans `src/App.tsx` (non exclu) →
`scripts/__tests__/vocabulaire-moteur.test.mjs` rouge, citant `src/App.tsx :: "[1/4]"`.
J'ai vérifié `git status --porcelain` vide après restauration.

Rendu : le mot `rollback` n'apparaît dans `EcranPilotage.tsx` que dans un `aria-label`
(`:104`, jamais dans `document.body.textContent`) — le texte visible dit « Retour arrière »
(`:105`). La garde de rendu (`vocabulaire-moteur-rendu.test.tsx`) n'a donc **aucune** exclusion
à porter et n'en porte aucune.

**(b) `vocabulaire-evenements.test.ts` rougit dans les deux sens** — confirmé plus haut
(CA-P2), avec les deux contrefactuels rejoués et leurs messages cités.

**(c) `reducteur.ts` est pur — recherche d'inférence.** Lu ligne par ligne (198 lignes) :
aucune horloge, aucun `fetch`/`invoke`, aucune dérivation d'un état d'écran à partir d'un
champ qui ne serait pas directement celui de l'événement. Les seules normalisations
observées (`?? null`, `?? []`) transforment `undefined` en valeur d'absence déclarée dans le
modèle (`modele.ts` le dit explicitement : « le tiret est une décision d'affichage, jamais de
modèle ») — ce n'est pas une inférence d'état métier. `fixtures/flux-apercu.ndjson` rejouée
(`rejeu-flux-apercu.test.mjs`) confirme l'égalité champ par champ. **Comparaison à un run que
j'ai joué moi-même** (§ Mesures ci-dessus) : même distribution d'événements, mêmes six champs
d'annonce — la fixture est bien un enregistrement réel, pas un artefact écrit à la main.

---

## Bac à sable (CA-P14, AR-P4) — comment la production autorise l'écriture réelle

`pilote.rs:61-93` (`resoudre_bac_a_sable`) : en **mode développement**
(`cfg!(debug_assertions)` = `true`, donc tout `cargo build`/`cargo test`/`tauri dev` sans
`--release`), `IAKAINSTALL_SANDBOX` est **obligatoire** et un chemin sous `$HOME/.claude` ou
`$HOME/Applications` est **refusé**. En **production** (`tauri build`, profil `release`,
`debug_assertions` = `false` — confirmé par le journal de mon propre build : *« Finished
\`release\` profile [optimized] »*), l'absence de la variable est **acceptée sans bac à
sable** : c'est le produit qui écrit aux vrais chemins. **C'est gardé par le profil de
compilation Rust**, pas par un indicateur applicatif explicite — donc **binaire et fiable**
(un `.app` livré par `tauri build` ne peut pas être un build de debug), mais cela signifie
qu'un `cargo build --release` lancé manuellement en dehors de `tauri build`, sur le poste
d'un agent, écrirait aussi aux vrais chemins sans bac à sable : **aucun geste de ce type n'a
été exécuté par ce gate** (aucun `--release` hors le `tauri build` demandé, dont je n'ai lancé
que le build, jamais l'exécutable produit).

---

## `--root <ressource>` épinglé (point 8)

`construire_argv` (`pilote.rs:98-125`) ajoute systématiquement `--root <racine_ressource>`,
où `racine_ressource` vient exclusivement de `resoudre_racine_ressource` (`:210-229`) : soit
le résolveur Tauri de ressources bundlées, soit le repli dev `CARGO_MANIFEST_DIR/resources/cli`.
Aucune variable d'environnement, aucun `$PATH`, aucune convention « réservoir vivant » ne peut
faire retomber ce chemin sur `~/work/iakaframe` — confirmé par lecture et par le test
`argv_epingle_toujours_root_sur_la_ressource` (vert, dans les 22).

---

## Ce qui reste au décideur (gate humain, non prouvable par ce gate)

Repris et confirmés cohérents avec la table § 8 de l'instruction :
1. **Le premier run CI réel** — et il **échouera aujourd'hui** tant que le défaut ci-dessus
   n'est pas corrigé (ce n'est plus une supposition, c'est mesuré).
2. **La recette guidée sur les trois OS** (macOS, Windows, Linux) avec écriture réelle,
   feu vert par étape, lu et compris par un humain (R-M4).
3. **Le comportement du Gatekeeper / la notarisation** (C.3).
4. **La visibilité du dépôt** (AR-I4, non touché par ce lot, toujours ⬜ ouvert dans
   `specs/PROJET.md`).

`CLAUDE.md` et `specs/PROJET.md` § « ⬜ Ce qui reste à décider » sont à jour et exacts :
la sous-section « Verdicts du lot C.2-b (2026-09-05) » y consigne fidèlement AR-P1→P5,
le `sha256` cité (`21fe0f9421...`) correspond à celui re-téléchargé et vérifié par ce gate.

---

## Ce que je n'ai PAS mesuré, déclaré

- Les builds Windows / Linux / macOS Intel de la matrice (accessible seulement en CI).
- L'exécution réelle de la chaîne avec écriture (gate humain, hors périmètre d'un agent).
- Le comportement à plus de ~20 000 lignes de `log-delegue` (M-X5) — non rejoué, coût jugé
  disproportionné pour ce gate ; signalé pour mémoire, pas un FAIL.

## Retour à Gimli

Le point bloquant unique : **ajouter, dans `.github/workflows/release.yml`, une étape
d'obtention de la ressource CLI (`npm run embarquer` ou équivalent) avant le build Tauri, sur
les quatre jobs de la matrice** — c'est l'exception explicitement prévue par l'instruction
elle-même (§ 4, table Exclu, ligne `release.yml`) pour AR-P2(b), qui est le verdict retenu.
Reproduction : voir § « Le défaut qui motive le FAIL » ci-dessus.

