# Rapport qualité — `RELEASE-PARTIELLE-PUBLIEE` — branche `feat/release-brouillon-jusqua-matrice-verte` — 2026-09-05

> Gate P2 🏹 Legolas, contexte séparé (jamais l'agent qui a codé). Base de comparaison :
> `cb138be` (avant lot) → `b05229c` (HEAD, 3 commits Gimli : `3739313`, `a7a49dd`, `b05229c`).
> Référence : `specs/instructions/release-partielle-publiee.md`. Aucune ligne de code modifiée par
> ce gate ; aucun push, aucun tag, aucun `gh workflow run`, aucune release touchée. Fichier
> non suivi `specs/instructions/amorcage-c3-vitrine-trois-freres.md` non lu, non touché,
> toujours présent (vérifié `git status --porcelain=2` avant et après).

## Verdict : **PASS**

Les six arbitrages (AR-1 à AR-6) sont implémentés conformément aux verdicts tranchés le
2026-09-05, la chaîne qualité est intégralement verte, la garde statique neuve est prouvée par
témoin positif + contrefactuels rejoués indépendamment (rouges et nommés), le cliquet
`bloc-latest.sha256` a réagi (rouge préalable reproduit sur copie isolée), et les lectures au
SHA épinglé de `tauri-action` confirment ligne par ligne ce que le workflow affirme dans ses
cartouches. Deux écarts sont documentés ci-dessous (§ Écarts) — aucun n'est bloquant : l'un est
un écart de **forme** dans le rapport de Gimli (CA-R10, substance re-vérifiée exacte par mes
soins), l'autre une **observation** hors périmètre du lot (absence de `concurrency:` group).
Trois lignes restent, comme prescrit, **hors gate automatique** et réservées au décideur
(§ Ce qui reste au décideur).

---

## 1. Chaîne qualité — re-mesurée intégralement

| Commande | Code de sortie | Résumé cité |
|---|---|---|
| `npm run typecheck` | `0` | `tsc --noEmit` — silencieux, aucune erreur |
| `npm run lint` | `0` | `eslint .` — silencieux, aucune erreur |
| `npm run test` | `0` | `Test Files  19 passed (19)` / `Tests  91 passed (91)` — conforme à l'attendu (91/91, 19 fichiers) |
| `npm run build` | `0` | `tsc && vite build` → `✓ 41 modules transformed` / `✓ built in 367ms` |
| `cargo test` (`src-tauri/`) | `0` | `test result: ok. 22 passed; 0 failed; 0 ignored` |
| `cargo fmt --check` (`src-tauri/`) | `0` | silencieux — aucune ligne mal formatée |
| `cargo clippy --all-targets -- -D warnings` (`src-tauri/`) | `0` | `Finished \`dev\` profile` — aucun warning |

**Build Tauri non lancé, à raison** : `git diff --stat cb138be..HEAD` ne touche que 6 fichiers
(`.github/workflows/release.yml`, `CLAUDE.md`, `fixtures/bloc-latest.sha256`,
`scripts/__tests__/release-publication.test.mjs`, `scripts/lib/release-publication.mjs`,
`specs/PROJET.md`) — aucun `.rs` ni `tauri.conf.json`.

---

## 2. Le workflow, ligne à ligne — `.github/workflows/release.yml`

**(a) `releaseDraft: true` + `releaseId` dans la matrice.** Ligne 187 : `releaseDraft: true`
dans l'étape `tauri-action` du job `build`, posée **une seule fois** (confirmé par
`releaseDraftPosee()` sur le texte réel : `poseeUneFois: true`, `valeur: "true"`). Ligne 179 :
`releaseId: ${{ needs.prepare.outputs.release_id }}` **remplace** `tagName`/`releaseName`
(absents de l'étape). Cohérent avec AR-1(a)+AR-2(b).

**(b) `prepare` crée le brouillon une fois.** Lignes 97-113 : job `prepare`, étape `brouillon`,
`gh api repos/$DEPOT/releases -X POST -f tag_name=$TAG ... -F draft=true -F prerelease=false`,
sortie `release_id`. **Comportement sur re-run (vérifié par lecture, non mesuré par un run
réel)** : cette étape **ne vérifie pas** l'existence d'un brouillon préalable pour le même tag —
elle en **crée systématiquement un nouveau** à chaque exécution du job `prepare`. Si un ancien
brouillon rouge (laissé par AR-3, jamais supprimé) subsiste pour le même tag et qu'on relance
un run complet (nouveau `workflow_dispatch` ou nouveau push du même tag après suppression/
recréation), **deux brouillons** coexisteront pour ce tag. C'est exactement le cas que le job
`publier` (lignes 231-239) est câblé pour intercepter : `N -gt 1` ⇒ échec **nommé**, listant les
`id`, exigeant un nettoyage manuel — jamais une publication à l'aveugle. **Ce n'est pas un
défaut du lot** (le comportement est le filet de secours voulu par AR-2), mais c'est une
**conséquence opérationnelle non écrite explicitement dans l'instruction ni dans le rapport de
Gimli** : un nouveau run complet après un run rouge **exige un cleanup manuel du brouillon
précédent avant de pouvoir publier**, sans quoi `publier` échouera systématiquement en boucle.
Je le signale comme observation, pas comme écart bloquant.

**(c) `publier` : `needs: [build]` strict, sans `if:`.** Ligne 209 : `needs: [build]`, aucune
condition sur le job. Confirmé par `etatPublication()` : `publicationDependDeMatrice: true`,
`publicationPorteConditionMatriceRouge: false`. Adressage **par id, jamais par tag** (lignes
221-222, 241-245) — conforme à § 5.2. Échoue en nommant sur 0 brouillon (lignes 225-229) et sur
**plus d'un** brouillon (lignes 231-239, message citant explicitement la course F8).

**(d) `latest` : `needs: publier`.** Ligne 282 : `needs: publier`. Confirmé :
`latestDependDePublication: true`. `if: always()` **conservé** (ligne 283) — motif documenté aux
lignes 254-280 (cartouche daté, état antérieur conservé, ce qui dépasse et ce qui ne dépasse
pas explicitement écrit).

**(e) `casser` : `workflow_dispatch` seul, avant `tauri-action`.** Entrée déclarée lignes
36-53 (`type: choice`, défaut `aucune`). Étape de sabotage lignes 158-164, **avant** l'étape
`tauri-action` (ligne 169) — confirmé par l'ordre des lignes dans le fichier. Condition ligne
159 : `if: github.event_name == 'workflow_dispatch' && github.event.inputs.casser == matrix.key`
— sur un `push` de tag, `github.event.inputs.casser` est structurellement vide, la comparaison
échoue toujours : **inerte hors dispatch**, vérifié aussi par contrefactuel (§ 4).

**(f) SHA de `tauri-action` inchangé, cliquet du pin.** `84b9d35b5fc46c1e45415bdb6144030364f7ebc5`
identique avant/après (grep sur le fichier). `fixtures/tauri-action-pin.json` **non modifié**
par ce lot (absent du `git diff --stat`) ; `entreesDeclarees` contient bien `releaseId` **et**
`releaseDraft` (vérifié par lecture directe du JSON) — rien à désépingler, conforme à § 2.4/AR-2.
`pin-tauri-action.test.mjs` reste vert (dans les 91 tests).

**sha256 du workflow, avant/après** :
- avant (`cb138be`) : `d8186cf85362c92e59fe0c917249e701044d7dd32d7e6326028bf0fefdd2837e`
- après (`HEAD`) : `03a659b0021796de171e78fc0f01aa20d3e39777ae20b9acdd1f119164c99147`

---

## 3. Lecture au SHA épinglé — confirmée ligne par ligne, moi-même, jamais `dev`

Sources téléchargées via `raw.githubusercontent.com/tauri-apps/tauri-action/84b9d35b5fc46c1e45415bdb6144030364f7ebc5/{src/index.ts,src/create-release.ts,action.yml}`.
`sha256` de `action.yml` re-mesuré : `351738c494a482a2e583a0ecc93a0130e42c902fd91d6b938a8099fc3c5e879a`
— **identique** à `actionYmlSha256` de `fixtures/tauri-action-pin.json`.

- **`src/index.ts:178`** : `if (tagName && !releaseId) { ... getOrCreateRelease(...) ... }` —
  confirmé : la recherche/création de release (par tag) est **sautée entièrement** dès que
  `releaseId` est fourni. Comme le job `build` de ce lot ne passe **que** `releaseId` (jamais
  `tagName`), ce chemin n'est **jamais emprunté** par les 4 jobs de matrice.
- **`src/index.ts:211`** : `if (releaseId) { await uploadReleaseAssets(owner, repo, releaseId,
  artifacts, ...) }` — confirmé : les artefacts sont attachés **directement** à l'id fourni.
- **`src/create-release.ts:103-113`** : `createRelease({ owner, repo, tag_name, name, body,
  draft, prerelease, target_commitish, generate_release_notes })` — confirmé : **aucun**
  paramètre `make_latest` n'est transmis, donc défaut `true` de l'API GitHub (F3). Cette
  fonction (`getOrCreateRelease`) n'est de toute façon **pas invoquée** par le flux réel de ce
  workflow (cf. point précédent), mais la lecture confirme que **si** elle l'était (chemin
  `tagName`), le défaut `make_latest=true` s'appliquerait — cohérent avec F3/R-4.

**Conclusion** : AR-2(b) est **bien fondée** — `releaseId` court-circuite entièrement la
création, la course F8 est fermée par construction pour ce workflow (les 4 builds ne créent
jamais de release, ils déposent seulement sur l'id fourni par `prepare`).

---

## 4. CA-R5 — le cliquet `bloc-latest.sha256`, rejoué

- `git show cb138be:fixtures/bloc-latest.sha256` → `f5de9ecb81dc4ed25924484a6cf20afa81829f8e188d50b206960795ede32af3`
- `fixtures/bloc-latest.sha256` sur HEAD → `8cb5cf2b505d25b399a0867b6cebb089964bb374a7147da79532276a1e9623ff`,
  avec commentaire **daté** (2026-09-05) expliquant le changement (`needs: build → publier`) et
  citant le rouge préalable observé par Gimli.
- **Re-mesure indépendante** : `node -e "import('./scripts/lib/bloc-latest.mjs').then(m=>console.log(m.empreinte(m.lireBloc('.'))))"`
  → `8cb5cf2b505d25b399a0867b6cebb089964bb374a7147da79532276a1e9623ff` — **identique** à la
  fixture. Le cliquet garde bien ce qu'il prétend garder.
- **Rouge préalable rejoué sur copie isolée** (`git archive HEAD` extrait sous le scratchpad,
  ancienne fixture `cb138be` réinjectée) : `npx vitest run scripts/__tests__/bloc-latest.test.mjs`
  → `1 failed | 8 passed (9)`, échec nommé sur `CA-12`, message : *« ce bloc CONVERGE... Si un
  seul côté a bougé, c'est la dérive que cette garde existe pour dire »*, `Expected:
  f5de9ecb...` / `Received: 8cb5cf2b...`. **Confirme que le cliquet n'était pas muet** (I-5
  écartée, conforme au commentaire de la fixture).

---

## 5. Garde `release-publication` — contrefactuels rejoués indépendamment

Rejeu **indépendant** (script séparé du test de Gimli, même module `etatPublication` importé
depuis `scripts/lib/release-publication.mjs`, mutations en mémoire sur le texte réel du
workflow — jamais sur le fichier versionné) :

| Contrefactuel | Résultat | Rouge nommé ? |
|---|---|---|
| Témoin positif (non muté) | `releaseDraft.valeur="true"`, `publicationDependDeMatrice=true`, `conditionDangereuse=false`, `latestDependDePublication=true`, `casser.gardee=true` | **Doit passer — PASSE.** |
| `releaseDraft: false` sur le job `build` | `valeur="false"` | **Oui** — la garde nomme la valeur lue, différente de `"true"` |
| `publier` avec `needs: [prepare]` | `publicationDependDeMatrice=false` | **Oui** — ne dépend plus de `build` |
| `publier` avec `if: always()` ajouté | `conditionDangereuse=true` | **Oui** — forme reconnue dans `FORMES_CONDITION_MATRICE_ROUGE` |
| `latest` avec `needs: build` | `latestDependDePublication=false` | **Oui** |
| `casser` sans garde d'événement | `presente=true`, `gardeeParEvenement=false` | **Oui** — nommé séparément (présent mais non gardé) |
| **Témoin vide** (texte `""`) | `extraireJobs()` lève `Error: "release-publication : aucune cle \`jobs:\` trouvee dans le workflow."` | **Un workflow vide ne passe PAS silencieusement** — il **plante explicitement**, jamais un vert par défaut. |

Les 91 tests de la suite (incluant `release-publication.test.mjs`) sont **également** verts,
donc les contrefactuels **de Gimli lui-même** concordent avec mon rejeu indépendant.

---

## 6. Sémantique GitHub

- **F4 (citée dans le workflow et l'instruction)** : « *if a job fails, all jobs that need it
  are skipped unless the jobs use a conditional expression that causes the job to continue* »,
  et « *use \`always()\` [...] to run even if a job it is dependent on did not succeed* » —
  conforme à la documentation *GitHub Actions — Using jobs in a workflow*. **Conséquence
  vérifiée sur ce workflow** : le job `build` porte une `strategy.matrix` ; en GitHub Actions,
  le **statut global** d'un job matriciel est `failure` dès qu'**une** des combinaisons échoue
  (même avec `fail-fast: false`, qui ne fait que laisser les autres combinaisons **aller au
  bout** sans annuler). Un job en aval avec `needs: [build]` **strict** (sans `if:`) est donc
  bien *skipped* dès qu'**un seul** job de matrice a rougi — c'est la mécanique exacte sur
  laquelle repose AR-1(a).
- **`fail-fast: false` (ligne 118)** : confirmé **voulu** (cartouche § 0.3 de l'instruction,
  repris ligne 1-13 du workflow) — les plateformes saines vont au bout, déposent leurs
  artefacts sur le brouillon (via `releaseId`), même si une autre plateforme rougit. **Cohérent
  avec AR-3(a)** : un brouillon avec 3/4 (voire moins) assets **reste**, daté, non supprimé —
  c'est le résultat attendu, pas un bug.

---

## 7. Contrat des sœurs

- `iakaFrameGUI` : `git status --porcelain` → **vide**. `git diff --stat` → **vide**. Conforme.
- `IakaCockpit` : `git status --porcelain` → **`M .claude/settings.local.json`** (ajout de deux
  domaines `WebFetch` autorisés — permissions locales de l'outil, **sans rapport** avec
  `release.yml` ni avec ce lot). **Aucun fichier du périmètre de ce lot** (`release.yml`,
  fixtures, scripts) n'est touché côté sœurs — le contrat de non-modification du **lot** est
  respecté ; je signale la modification hors-périmètre par honnêteté de mesure, elle ne relève
  pas d'AR-4.
- **Successeurs nommés** : présents dans `CLAUDE.md` d'`iakaInstall`
  (`RELEASE-BROUILLON-JUSQUA-MATRICE-VERTE-COCKPIT`, `…-GUI`, `PUBLICATION-VERIFIE-LES-ASSETS`)
  et dans `specs/PROJET.md` § verdict. **Pas encore inscrits** dans les `CLAUDE.md`/`PROJET.md`
  propres à `IakaCockpit`/`iakaFrameGUI` (recherché, absent) — conforme à AR-4 : ce n'est **pas**
  le canal de Gimli, c'est un geste demandé nommément à Aragorn/au décideur. Confirmé présent,
  à l'état de demande, dans `~/work/BACKLOG.md:129-132` (item non coché, porté au portefeuille).
- **Mesure en lecture seule des runs passés (re-mesurée par mes soins, jamais reprise du rapport
  de Gimli)** :
  - `IakaCockpit` : 6 runs `release.yml` récents, dont **1 échec** (`31024518725`, 2026-08-05,
    job `build (linux)` en `failure` pendant que `build (windows)` réussissait) et **1 run 4/4
    vert complet** avec job `latest` (`33273513846`, 2026-08-29). Les autres runs listés sont
    des `workflow_dispatch` à plateforme unique (pas de matrice complète, pas de job `latest`
    dans ces runs-là).
  - `iakaFrameGUI` : 7 runs `release.yml` récents, dont **1 échec** (`31692224488`,
    2026-08-13).
  - **Concorde** avec l'affirmation de Gimli (§ Écarts, CA-R10) : « aucune des deux sœurs n'a
    d'historique 100 % 4/4, au moins un job de build rouge par sœur dans l'historique récent » —
    confirmé exact par ma propre mesure `gh run list` + `gh run view --json jobs`.

---

## 8. CA-R8 / CA-R9 — non couverts par construction, procédure vérifiée

Les entrées `tag` et `casser` existent bien dans `on.workflow_dispatch.inputs` du workflow réel
(lignes 21-24 et 36-53), avec exactement ces noms — la procédure
`gh workflow run release.yml --repo iakasju/iakaInstall -f tag=<tag> -f casser=<plateforme>`
citée dans `CLAUDE.md` est donc **exécutable telle quelle**. CA-R8 et CA-R9 restent, comme
prescrit par l'instruction et repris dans `CLAUDE.md`, **déclarés non couverts par
construction** — aucune garde automatisée ne peut prouver un comportement d'exécution réel ;
seul un run réel, réservé au décideur, le peut. Je ne les compte **pas** comme `PASS`.

État actuel des releases, re-mesuré (§ 0.1 de l'instruction, en lecture seule) :

```
gh release list --repo iakasju/iakaInstall
  v0.1.1  Latest       v0.1.1  2026-09-05T12:15:02Z
  v0.1.0  Pre-release  v0.1.0  2026-09-05T11:32:27Z

gh release view v0.1.0 --repo iakasju/iakaInstall --json isDraft,isPrerelease,assets --jq '{isDraft,isPrerelease,n:(.assets|length)}'
  {"isDraft":false,"isPrerelease":true,"n":7}

gh release view v0.1.1 --repo iakasju/iakaInstall --json isDraft,isPrerelease,assets --jq '{isDraft,isPrerelease,n:(.assets|length)}'
  {"isDraft":false,"isPrerelease":false,"n":9}

gh api repos/iakasju/iakaInstall/releases/latest --jq .tag_name
  v0.1.1
```

Concorde exactement avec le rapport d'Aragorn (§ 0.2 de l'instruction) et avec ce que Gimli
en dit dans `specs/PROJET.md`.

---

## 9. Tableau CA-R1..CA-R12

| Critère | Verdict | Preuve |
|---|---|---|
| **CA-R1** | **PASS** | `releaseDraft: true` posé une fois (ligne 187), SHA inchangé ; contrefactuel `false` rejoué → rouge nommé (§ 5) |
| **CA-R2** | **PASS** | `publier` : `needs: [build]`, aucune condition ; 3 contrefactuels rejoués indépendamment → rouges nommés (§ 5) |
| **CA-R3** | **PASS** | `latest`: `needs: publier` ; contrefactuel `needs: build` rejoué → rouge nommé (§ 5) |
| **CA-R4** | **PASS** | Témoin positif rejoué indépendamment : le workflow réel non muté passe tous les indicateurs (§ 5) |
| **CA-R5** | **PASS** | Empreinte re-mesurée par mes soins = fixture HEAD (`8cb5cf2b…`) ; rouge préalable reproduit sur copie isolée avec l'ancienne fixture (§ 4) |
| **CA-R6** | **PASS** | `release-publication.mjs` déclare sa limite en tête de fichier (« LIMITE DECLAREE », « JAMAIS ce qui S'EXECUTE », « LISTE FERMEE », « ELLE NE COUVRE PAS ») — lu directement |
| **CA-R7** | **PASS** | Sabotage `if: github.event_name == 'workflow_dispatch' && ...` avant `tauri-action` ; contrefactuel retrait de garde → rouge nommé (§ 5) |
| **CA-R8** | **NON COUVERT PAR CONSTRUCTION**, déclaré tel — procédure du run de preuve vérifiée exécutable (entrées `tag`/`casser` existent, § 8) |
| **CA-R9** | **NON COUVERT PAR CONSTRUCTION**, déclaré tel — idem (§ 8) |
| **CA-R10** | **PASS avec réserve de forme** — substance re-vérifiée exacte par mes soins (état des releases, lecture au SHA épinglé, mesure des sœurs, § 3/7/8) ; **écart** : le rapport de Gimli (`CLAUDE.md`/`PROJET.md`/commits) **narre** ces mesures (« concorde avec le rapport d'Aragorn ») sans **citer littéralement** les commandes et leurs sorties brutes pour l'étape 0.1 et 0.6 — l'instruction (§ 5.0.1) exige explicitement « confronter... une mesure reprise du rapport d'un autre agent n'est pas une mesure ». Je l'ai re-mesuré moi-même et la substance est exacte ; la forme du rapport de Gimli, elle, ne l'est pas pleinement. |
| **CA-R11** | **PASS** | 2 successeurs sœurs + `PUBLICATION-VERIFIE-LES-ASSETS` nommés dans `CLAUDE.md`/`PROJET.md` ; demande explicite à Aragorn/décideur retrouvée dans `~/work/BACKLOG.md:129-132` (item non coché — geste hors canal de Gimli, comme prescrit) |
| **CA-R12** | **PASS** | Chaîne qualité re-mesurée intégralement par mes soins, chaque commande sur sa ligne avec code de sortie et chiffre (§ 1) |

---

## 10. Écarts

1. **CA-R10 — écart de forme, substance confirmée** (voir tableau ci-dessus). Non bloquant :
   je l'ai re-mesuré moi-même à l'identique de ce que Gimli affirme. À noter pour un futur lot :
   citer les commandes et sorties brutes, pas une confrontation narrative.
2. **Observation hors périmètre — comportement sur re-run non documenté.** Le job `prepare`
   crée un brouillon **sans vérifier** l'existence d'un brouillon préalable pour le même tag
   (§ 2b). Le filet de secours du job `publier` (échec nommé sur >1 brouillon) intercepte bien
   le cas, mais **impose un nettoyage manuel avant toute nouvelle tentative de publication**
   après un premier run rouge sur le même tag — jamais écrit explicitement ni dans l'instruction
   ni dans le rapport de Gimli. Ce n'est pas un défaut du lot (comportement voulu par AR-2/R-2),
   juste une conséquence opérationnelle à connaître.
3. **Observation hors périmètre — absence de `concurrency:` group.** Rien n'empêche deux runs
   simultanés sur le même tag de créer chacun leur propre brouillon en parallèle ; le filet de
   secours du job `publier` les ferait tous deux échouer (nommé), jamais publier à l'aveugle,
   mais **aucun des deux runs ne pourrait alors publier sans intervention manuelle**. Hors
   périmètre de ce lot (non demandé par l'instruction), possible successeur à évaluer.
4. **`IakaCockpit` porte une modification hors périmètre** (`.claude/settings.local.json`,
   permissions locales) — sans rapport avec ce lot, signalé par honnêteté de mesure (§ 7).

Aucun de ces quatre points ne fait tomber le verdict `PASS` : la règle du § 2.1 de l'instruction
(*aucune release non-brouillon, aucun `latest`, tant que la matrice n'est pas complète*) est
correctement portée par le mécanisme, prouvée par le texte (garde statique + cliquet), et
cohérente avec la sémantique GitHub réelle (§ 6) et le comportement documenté de `tauri-action`
au SHA épinglé (§ 3).

---

## 11. Ce qui reste au décideur — non couvert par ce gate, jamais déclaré PASS par un agent

1. **Le run réel de preuve (AR-5/CA-R8)** : `gh workflow run release.yml --repo iakasju/iakaInstall
   -f tag=<tag-de-test> -f casser=<plateforme>` sur un **tag de test**, jamais un tag réel ;
   vérifier ensuite `isDraft: true` sur la release du tag, `releases/latest` **inchangé**, et le
   job `publier` **`skipped`** dans le run. Suppression du brouillon de preuve : acte du
   décideur seul.
2. **Le run réel nominal 4/4 vert (CA-R9)** : `isDraft: false`, 9 assets, `latest` = le tag
   publié.
3. **L'inscription effective des deux successeurs aux backlogs des sœurs**
   (`RELEASE-BROUILLON-JUSQUA-MATRICE-VERTE-COCKPIT`/`…-GUI`) — nommés et demandés par ce lot,
   pas encore inscrits dans `IakaCockpit`/`iakaFrameGUI` eux-mêmes (geste d'Aragorn ou du
   décideur, hors canal de Gimli comme de Legolas).

