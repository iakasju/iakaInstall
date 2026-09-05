# `RELEASE-PARTIELLE-PUBLIEE` — aucune release visible, aucun `latest`, tant que la matrice n'est pas complète

> Lot cadré le **2026-09-05** par 🔵 Gandalf, sur ordre de mission d'🟠 Aragorn.
> Successeur consigné dans `specs/PROJET.md` § `RELEASE-PARTIELLE-PUBLIEE` et dans `CLAUDE.md`
> § Backlog. Réalisation du risque **R8** du cadrage parent
> (`iakaframe/specs/instructions/chaine-complete-install-amorcage-dmg-msi.md` § 8 : « **on déclare
> livré ce qui n'est que buildé** »), au **premier run réel**.

---

## 0. État mesuré

### 0.1 Limite de ce cadrage — JE N'AI PAS DE SHELL, et c'est dit avant tout le reste

Ce cadrage a été produit **sans aucune exécution**. Concrètement :

- **Ce que j'ai fait** : lu des fichiers **sur le disque** (chemins cités un à un au § 0.3-0.6), et
  lu des **sources externes datées** (§ 0.7).
- **Ce que je n'ai PAS fait, et que je ne peux pas faire** : lancer `gh`, `git`, `npm test`,
  `cargo`, ni le moindre run CI. **Aucun chiffre de run, aucun état de release, aucun compte
  d'assets de ce document ne sort de ma main.**
- **Conséquence opératoire** : toute mesure d'exécution est **l'étape 0 de ⚒️ Gimli** (§ 5.0). Un
  fait de ce document marqué *(à mesurer)* n'est **pas** un fait tant que l'étape 0 ne l'a pas
  rendu, avec sa commande et sa sortie.

Les faits de runs ci-dessous sont **ceux d'🟠 Aragorn**, qui les a mesurés et me les a transmis :
ils lui sont **attribués**, je ne les reprends pas à mon compte.

### 0.2 Les faits de runs — mesurés par 🟠 Aragorn (2026-09-05), attribués

| Fait | Valeur rapportée par Aragorn |
|---|---|
| Run `33963420727`, tag `v0.1.0`, `2026-09-05 11:28Z` | `prepare` **OK** · `build linux` **OK** · `build macos-x64` **OK** · `build macos-arm64` **OK** · **`build windows` FAIL** (script d'embarquement muet, corrigé depuis) |
| Job `latest` du même run | **a réussi** |
| Release produite | `v0.1.0` publiée **non-brouillon**, **7 assets sur 9** (ni `.msi` ni `.exe`) |
| Pointeur | `releases/latest` **avancé sur `v0.1.0`** |
| Mitigation manuelle du décideur | `gh release edit v0.1.0 --prerelease` → `releases/latest` répond **404** |
| Run `33965353603`, tag `v0.1.1` | **4/4 verts**, **9 assets**, `latest` = `v0.1.1` |

**Ce que ces faits établissent** : la chaîne a **publié et désigné comme dernière version** une
release à laquelle il manquait les **deux artefacts Windows** — c'est-à-dire exactement la
plateforme dont le build avait échoué. Rien n'a empêché ça, et **rien ne l'empêcherait demain** :
le correctif d'embarquement (`fix/embarquer-cli-windows`) répare **une cause** de build rouge, pas
le **mécanisme** qui publie malgré un build rouge.

### 0.3 Ce que dit le workflow de ce dépôt — lecture de `.github/workflows/release.yml`

Lu intégralement (181 lignes). Structure : `prepare` → `build` (matrice 4) → `latest`.

- `build` : `needs: prepare`, `strategy.fail-fast: false` (l. 66-69) — **délibéré** : un échec ne
  coupe pas les autres plateformes.
- Étape `tauri-apps/tauri-action@84b9d35b…` (l. 103), avec :
  - `releaseDraft: false` (l. 109),
  - `prerelease: false` (l. 110),
  - `includeUpdaterJson: false` (l. 115, motivé : pas de manifeste updater dans ce dépôt, B′-b),
  - `tagName` / `releaseName` / `args`.
- `latest` : `needs: build` **plus `if: always()`** (l. 131-132). Le cartouche (l. 118-129)
  explique ce `always()` : « *les artefacts sont déjà téléversés quand ce job démarre, y compris
  après un build partiellement rouge — ne pas désigner le `latest` dans ce cas laisserait le
  drapeau au défaut `true` de l'API* ». Il **dit aussi ce qu'il ne fait pas** : « *elle **RÉPARE**
  […] mais n'**EMPÊCHE** pas le vol (la release est créée avant que ce job ne démarre)* ».

**Le workflow est donc, à la lettre, conforme à ce que ses commentaires annoncent.** Le défaut
n'est pas dans le job `latest` : il est **en amont**, dans le fait que la release est **créée
publiée** par chaque job de build, une plateforme à la fois.

### 0.4 Les cliquets en place — ce qu'ils gardent, et ce qu'ils vont exiger

| Cliquet | Fichier | Ce qu'il fait |
|---|---|---|
| Bloc `latest:` | `fixtures/bloc-latest.sha256` + `scripts/lib/bloc-latest.mjs` + `scripts/__tests__/bloc-latest.test.mjs` | Empreinte **sha256** du bloc qui va **du marqueur `  latest:` jusqu'à la FIN du fichier**, unicité du marqueur **assertée** (rougit à 0 comme à 2 occurrences). Empreinte actuelle : `f5de9ecb81dc4ed25924484a6cf20afa81829f8e188d50b206960795ede32af3`. |
| Matrice | `scripts/__tests__/release-matrice.test.mjs` | Les 4 clés `macos-arm64/macos-x64/linux/windows`, **exactement**, dans cet ordre ; `includeUpdaterJson: false` posé **une seule fois**, avec son motif écrit dans le fichier. |
| Pin de l'action | `fixtures/tauri-action-pin.json` + `scripts/lib/pin-tauri-action.mjs` + `scripts/__tests__/pin-tauri-action.test.mjs` | Référence = **SHA de 40 caractères** identique à la fixture ; **toute entrée posée doit être DÉCLARÉE** par la version épinglée (une entrée inconnue est ignorée **en silence** par GitHub Actions — c'est le défaut D-4 déjà payé par le portefeuille). |

**Deux conséquences directes pour ce lot :**

1. `entreesDeclarees` de `fixtures/tauri-action-pin.json` contient **`releaseDraft`** (l. 16) **et
   `releaseId`** (l. 12). Poser l'une ou l'autre **ne fait pas rougir** le cliquet du pin, et
   n'oblige **pas** à re-lire l'`action.yml` — le référent ne bouge pas.
2. Le bloc `latest:` va **du marqueur à la fin du fichier**. Un job neuf placé **après** `latest:`
   serait **avalé** par le bloc gardé ; un job neuf placé **avant** ne l'est pas. Toute
   modification du bloc **exige de re-figer la fixture avec son motif** — la commande de
   régénération est écrite en tête de `fixtures/bloc-latest.sha256` :
   `node -e "import('./scripts/lib/bloc-latest.mjs').then(m=>console.log(m.empreinte(m.lireBloc('.'))))"`.

### 0.5 Les deux sœurs — même faiblesse, lue et non mesurée

Lus intégralement : `/Users/sjupin/work/IakaCockpit/.github/workflows/release.yml` (274 l.) et
`/Users/sjupin/work/iakaFrameGUI/.github/workflows/release.yml` (274 l.).

**Constat de lecture, ferme** : les deux portent **exactement la même faiblesse structurelle** —
`releaseDraft: false` + `prerelease: false` (l. 105-106 des deux), matrice 4 en `fail-fast: false`,
job `latest` en `needs: build` **+ `if: always()`** (l. 186-190 des deux). Le bloc `latest:` des
deux sœurs est **byte-identique entre elles** et **inscrit à leur registre de convergence**
(`fixtures/convergence.sha256`) ; celui d'`iakaInstall` en est une **copie locale**, gardée par sa
**propre** fixture (AR-E : `iakaInstall` n'est **pas** inscrit au registre des sœurs).

**Ce que je ne peux PAS dire, et que Gimli devra mesurer (étape 0.6)** : si leurs runs passés
étaient 4/4, ou si elles ont déjà, elles aussi, publié une release incomplète. Cela demande un
shell :

```bash
gh run list --workflow release.yml --repo iakasju/IakaCockpit  --limit 30 --json databaseId,displayTitle,conclusion,createdAt
gh run list --workflow release.yml --repo iakasju/iakaFrameGUI --limit 30 --json databaseId,displayTitle,conclusion,createdAt
# puis, pour chaque run non `success`, le détail par job :
gh run view <id> --repo <depot> --json jobs --jq '.jobs[] | {name, conclusion}'
# et, en regard, le compte d'assets de la release du tag correspondant :
gh release view <tag> --repo <depot> --json isDraft,isPrerelease,assets --jq '{isDraft,isPrerelease,n:(.assets|length)}'
```

⚠️ **Ces mesures sont de la LECTURE et rien d'autre.** Elles ne commandent **aucun geste** sur les
sœurs dans ce lot (§ 4, AR-4).

### 0.6 `iakaframe` — forme différente, défaut voisin, lot distinct

Lu : `/Users/sjupin/work/iakaframe/.github/workflows/release.yml` (216 l.). **Job unique
`package`**, pas de matrice, acteur `softprops/action-gh-release@v2` (tag flottant, non épinglé —
signalé là-bas, non traité). `make_latest` y est **calculé avant** la création (l. 141-182), puis
une étape « **Vérifier ce qu'est devenu le latest** » (l. 189-215) **rougit** et **nomme** le
rattrapage manuel. Aragorn rapporte que le **2026-09-05 sur `v0.40.0` le `make_latest` calculé n'a
pas agi**, et qu'un rattrapage manuel `gh release edit --latest` a été nécessaire — successeur
`CI-RELEASE-LATEST-NON-MAITRISE` au backlog d'`iakaframe`.

**Ce dépôt n'est PAS concerné par le présent lot** : sans matrice, il n'a pas de « release
partielle » possible au sens de R8 — il a **un autre** défaut, sur le pointeur, déjà nommé
ailleurs. Ne pas fondre les deux.

### 0.7 Faits externes vérifiés — sources datées, lues le 2026-09-05

Tout ce qui suit a été **lu au SHA épinglé** (`84b9d35b5fc46c1e45415bdb6144030364f7ebc5`,
`action-v0.6.2`) ou dans une documentation de référence — **jamais sur `dev`**. Lire `dev` en
croyant décrire ce qui s'exécute est précisément le défaut **D-4** que le portefeuille a déjà payé.

| # | Fait | Source, lue le 2026-09-05 |
|---|---|---|
| **F1** | `releaseDraft` est **déclarée**, description « *Whether the release to create is a draft or not* », **défaut `false`**. `prerelease` idem, défaut `false`. `releaseId` est **déclarée** : « *The id of the release to upload artifacts as release assets* ». | `action.yml` **au SHA épinglé** |
| **F2** | Au SHA épinglé, la recherche d'une release **existante** emprunte **deux chemins distincts** : `getReleaseByTag` pour une release publiée, **et un parcours paginé de TOUTES les releases** pour un brouillon — le code note qu'« *on ne peut pas obtenir un brouillon existant par son tag* ». | `src/create-release.ts` **au SHA épinglé** |
| **F3** | `createRelease` est appelé **sans `make_latest`** (paramètres : `tag_name`, `name`, `body`, `draft`, `prerelease`, `target_commitish`, `generate_release_notes`) — donc **au défaut `true` de l'API**. Ce fait **recoupe** ce que le corpus du portefeuille a déjà écrit (L43/L44, cartouches des trois workflows). | `src/create-release.ts` **au SHA épinglé** |
| **F4** | « *If a job fails or is skipped, all jobs that need it are skipped unless the jobs use a conditional expression that causes the job to continue.* » et « *If you would like a job to run even if a job it is dependent on did not succeed, use the `always()` conditional expression* ». **Donc : oui, un job matriciel en échec fait échouer la dépendance — sauf `if: always()` (ou équivalent).** | docs GitHub, *Use jobs in a workflow* |
| **F5** | `fail-fast: false` **n'ignore pas** les erreurs : il laisse les autres jobs de la matrice **aller au bout**, l'échec reste un échec. Il ne rend donc **pas** la matrice « verte ». | docs / littérature Actions |
| **F6** | `gh release edit <tag> --draft=false` est la forme documentée pour **publier un brouillon** (« *Publish a release that was previously a draft* »). | manuel `gh release edit` |
| **F7** | ⚠️ **Les brouillons sont mal adressables par tag côté `gh`** : `gh release list` **n'inclut pas** les brouillons (issue `cli/cli#10140`), un `gh release create --draft` peut produire une release **non taguée** (`untagged-<hash>`, issue `cli/cli#11589`), et des « release not found » sont rapportés sur les brouillons (`cli/cli#5252`, `#6599`). | issues `cli/cli` |
| **F8** | ⚠️ **`tauri-action` crée parfois des releases EN DOUBLE pour un même tag**, « *peut-être une course* », artefacts éclatés sur deux releases, nettoyage manuel + re-run. Issue **ouverte** `tauri-apps/tauri-action#914`, ouverte le **2024-09-17**, **non résolue**, aucun correctif nommé. Le mode d'emploi recommande pourtant explicitement la **matrice concurrente** — c'est-à-dire le contexte exact de la course. | issue `tauri-action#914` |

> **F2 + F8 se composent, et il faut le dire.** En brouillon, la recherche d'une release existante
> passe par un **listing paginé**, pas par un accès direct : la fenêtre entre « je liste » et « je
> crée » est **plus large**, pas plus étroite. La course de F8 est donc, en régime brouillon, un
> risque **à prendre au sérieux, pas à supposer résolu** (§ 3, AR-2 ; § 7, R-2).

### 0.8 Ce qui n'est PAS mesuré, et le restera jusqu'à l'étape 0 de Gimli

- L'état actuel des releases et du pointeur sur `iakasju/iakaInstall` (je n'ai que le rapport
  d'Aragorn).
- L'historique de runs des deux sœurs (§ 0.5).
- Le **comportement** de `releaseId` au SHA épinglé : court-circuite-t-il la création ? (lecture de
  `src/index.ts` / `src/create-release.ts` à faire **ligne par ligne**, § 5.0).
- Ce que fait **réellement** `gh release edit <tag> --draft=false` sur un brouillon de **ce** dépôt
  (F6 contre F7 : la documentation et les issues ne disent pas la même chose).
- Si la **publication** d'un brouillon déplace le pointeur `latest` (défaut `make_latest` de
  l'endpoint de **mise à jour**). Le corpus a déjà **réfuté par mesure** une doc de GitHub sur ce
  terrain (L43/L44) : **on ne déduit pas, on mesure**.

---

## 1. Problème

Le workflow **publie une release et avance `releases/latest` alors qu'une plateforme de la matrice
n'a pas été construite**. Ce n'est ni un accident du job `latest`, ni une conséquence du bug
d'embarquement Windows : c'est la **structure** du workflow.

La mécanique, dans l'ordre :

1. Chaque job de build appelle `tauri-action` avec `releaseDraft: false`. **Le premier job qui
   arrive CRÉE la release, publiée**, et y attache ses artefacts (F1, F2).
2. `createRelease` est appelé **sans `make_latest`**, donc **au défaut `true`** : la release
   **prend le pointeur `latest` à sa création** (F3). À cet instant, **aucun** des trois autres
   builds n'est terminé.
3. Les autres jobs rejoignent la même release et y déposent leurs artefacts. Celui qui rougit n'en
   dépose aucun — **et personne ne retire la release pour autant**.
4. Le job `latest`, en `if: always()`, s'exécute même sur matrice rouge : il fait ce que son
   cartouche annonce — il **ré-affirme** le pointeur sur le plus haut semver **porteur d'une
   release**. Ici, ce plus haut semver **était** la release incomplète. Il a donc **entériné** ce
   qu'il ne pouvait pas empêcher, et il a **réussi** en le disant.

Résultat mesuré par Aragorn : `v0.1.0`, **7 assets sur 9**, **non-brouillon**, **`latest`**. Un
visiteur Windows arrivait sur la page « dernière version » d'un **installeur** et n'y trouvait
**aucun installeur pour son système**.

**Le défaut de fond, en une phrase** : *la visibilité publique d'une release est acquise **à la
première plateforme construite**, alors qu'elle ne devrait l'être qu'à **la dernière**.*

Et une nuance qui commande tout le § 3 : **le job `latest` n'est pas le coupable**. Le supprimer ou
durcir son `needs` ne changerait **rien** au point 2 ci-dessus — la release serait déjà publiée
**et déjà `latest`** avant que ce job n'existe. C'est le sens exact de la phrase que ses propres
commentaires portent depuis L44 : « **il n'EMPÊCHE toujours pas** ».

---

## 2. Décision retenue, et écarts motivés

### 2.1 La règle — elle précède le mécanisme

> **Aucune release non-brouillon, et aucun `releases/latest`, tant que TOUS les jobs de la matrice
> ne sont pas verts.**

Cette règle est **le livrable** ; le mécanisme n'en est que la mise en œuvre. Elle se lit sans
connaître GitHub Actions, et c'est elle qu'un futur lot devra citer avant de la modifier.

Corollaires, énoncés pour ne pas être découverts après coup :

- **Une matrice rouge ne produit rien de visible.** Pas de release publiée, pas de pointeur
  déplacé, pas de page « dernière version » qui ment. Il reste un **brouillon**, invisible d'un
  visiteur.
- **La règle porte sur la MATRICE, pas sur les artefacts.** Un build vert qui n'aurait rien produit
  (le cas de la garde muette du 2026-09-05 : `exit 0`, rien d'écrit) **passerait** cette règle.
  C'est une **limite déclarée**, avec son successeur nommé au § 4.

### 2.2 Le mécanisme retenu — voie (a), publication automatique stricte

Trois voies étaient sur la table (§ 3, AR-1). **Recommandation : (a)**, dans la forme suivante :

1. **`releaseDraft: true`** dans l'étape `tauri-action` du job `build`. La release existe pendant
   les builds, **en brouillon** : elle reçoit les artefacts, et **aucun visiteur ne la voit**.
   `prerelease` **reste `false`** — ce lot ne touche pas à ce drapeau.
2. **Un job neuf `publier`**, `needs: [build]` **strict** (pas d'`if:`), qui **passe la release en
   non-brouillon**. Par F4, un seul job de la matrice en échec **suffit** à le faire *skipper* :
   c'est **la plateforme** qui applique la règle, pas notre code. C'est le point décisif — on
   préfère toujours une garde portée par le mécanisme à une garde portée par une condition qu'on a
   écrite soi-même.
3. **Le job `latest` existant est conservé, et passe `needs: publier`** (en gardant son
   `if: always()`). L'**ordre** est le cœur de la correction :
   - si `publier` a tourné, `latest` trouve une release **publiée** et ré-affirme le pointeur —
     comportement d'aujourd'hui, inchangé ;
   - si `publier` a été *skippé* (matrice rouge), `latest` tourne quand même (`always()`), ne voit
     **que des releases non-brouillon** — son référent filtre déjà `select(.draft|not)` — et
     désigne donc la **précédente** version complète, ou sort en **succès** en disant qu'il n'y a
     rien à désigner. **Il ne peut plus entériner une release partielle : elle n'est pas dans sa
     population.**

**Pourquoi `latest` doit dépendre de `publier` et non tourner en parallèle** : sans cet ordre, les
deux jobs démarrent ensemble, `latest` lit la release **encore brouillon**, la filtre, désigne
l'ancienne — puis `publier` publie et **reprend le pointeur au défaut de l'API**, après coup, sans
que personne ne le ré-affirme. On fabriquerait un **vol de `latest` par notre propre workflow**.

**Pourquoi on ne peut pas simplement demander « publie sans prendre le latest »** : le corpus l'a
**mesuré** — `make_latest=false` par `PATCH` est **inerte**, `legacy` n'est atteignable que par
`PATCH` et sa formule est **inconnue**, seul `true` agit (tableau des cinq écritures, L44,
reproduit dans les trois workflows). On ne bricole pas contre une sémantique déjà réfutée par
mesure : **on ordonne les jobs**.

### 2.3 Ce que devient `fixtures/bloc-latest.sha256`

Le bloc gardé va **du marqueur `  latest:` jusqu'à la fin du fichier** (§ 0.4). Donc :

- Le job **`publier` s'insère AVANT le bloc `latest:`** — sans quoi il serait **avalé** par le
  bloc, et le cliquet garderait autre chose que ce qu'il prétend garder.
- Le bloc `latest:` **change** (son `needs:` passe de `build` à `publier`, et son cartouche doit
  **cesser de dire** « il n'empêche pas », qui devient faux dès lors qu'il ne voit plus la release
  avant publication). Il faut donc **re-figer la fixture**, avec la commande écrite en tête du
  fichier et un **motif daté** en commentaire. **Ce n'est pas un obstacle, c'est la cérémonie** :
  le cliquet est fait pour forcer ce geste conscient.
- Le cartouche du bloc **date, il n'efface pas** : la phrase « *elle RÉPARE mais n'EMPÊCHE pas* »
  est conservée comme état antérieur, **datée**, et suivie de ce qui la dépasse.

Pour les deux autres voies : (b) **modifie aussi** le bloc (retrait de `if: always()`) donc exige
la même re-fixation ; (c) est la **seule** à laisser la fixture **intacte** (le seul changement,
`releaseDraft: true`, est **hors** du bloc). Ce détail n'est pas un argument de poids — mais il est
mesurable, alors il est écrit.

### 2.4 Écarts motivés

| Écart | Motif |
|---|---|
| **On ne supprime pas le job `latest`** | C'est le **seul détecteur** du pointeur, et son cartouche l'interdit explicitement dans les trois dépôts. Ce lot le **subordonne**, il ne le retire pas. |
| **On ne touche pas au SHA épinglé de `tauri-action`** | Le désépingler pour chercher une entrée « publier à la fin » déferait L41 et ferait rougir `fixtures/tauri-action-pin.json`, **à raison**. `releaseDraft` et `releaseId` sont **déjà déclarées** au SHA épinglé (§ 0.4) : rien à désépingler. |
| **On ne touche pas à `includeUpdaterJson: false`, ni à la matrice à 4 clés** | Gardés par deux cliquets, motivés ailleurs, hors sujet ici. |
| **On ne vérifie pas le nombre d'assets avant publication** | Tentant, et **hors périmètre** : la table des artefacts attendus est, chez les sœurs, `fixtures/vitrine-assets.json` — que ce dépôt **n'a pas** (la vitrine est B′-b). Successeur nommé au § 4. |
| **On ne supprime pas les brouillons laissés par une matrice rouge** | § 3, AR-3 : c'est un **acte destructif de release**, refusé aux agents ; et un brouillon n'est visible de personne. |

---

## 3. Arbitrages — 🔵 Gandalf propose, le décideur tranche

> **Verdicts rendus le 2026-09-05 par Stéphane** — décision anticipée *« comme reco »* donnée avant la
> remise, appliquée par 🔵 Aragorn à la lettre des recommandations : **AR-1 → (a)** `releaseDraft: true` +
> job `publier` en `needs: [build]` strict + `latest` en `needs: publier`. **AR-2 → (b) conditionnée** :
> sérialiser la création du brouillon dans `prepare` et passer `releaseId` à la matrice SI la lecture de
> l'étape 0 confirme que `releaseId` court-circuite la création ; sinon (a) avec échec nommé si plus d'un
> brouillon. **AR-3 → (a)** brouillon laissé, daté, jamais supprimé. **AR-4 → `iakaInstall` seul** ;
> successeurs `RELEASE-BROUILLON-JUSQUA-MATRICE-VERTE-COCKPIT` et `…-GUI` inscrits au backlog
> portefeuille par Aragorn. **AR-5 → (a) bornée** : entrée `casser` du `workflow_dispatch`, inerte hors
> dispatch, run de preuve réservé au décideur. **AR-6 → (a)** garde par lecture du texte, limite écrite.

### AR-1 — la voie (question 2 de l'ordre de mission)

- **(a) `releaseDraft: true` + job `publier` en `needs: [build]` strict, puis `latest` derrière.**
  La release n'existe **publiquement** qu'après le dernier build vert. Le blocage est porté par
  **GitHub lui-même** (F4), pas par une condition de notre cru. Coût : un job de ~10 s, une fixture
  à re-figer, et l'exposition à la course F8 (traitée en AR-2).
- **(b) `needs` strict sur le job `latest` existant, sans brouillon.**
  ⚠️ **Insuffisant, et démontrablement.** La release est **créée publiée par le premier build**
  (F1+F2) et prend le pointeur **à la création** au défaut `make_latest=true` (F3). Le run
  `33963420727` aurait donc, sous (b) : publié `v0.1.0` **exactement pareil**, avec 7 assets sur 9,
  **et** avancé `latest` dessus — la seule différence étant que le job `latest` aurait été
  *skippé* au lieu de réussir. **(b) ne corrige aucun des deux symptômes mesurés.** Pire : retirer
  `if: always()` **rouvre** le défaut que L44 avait fermé (sur matrice rouge, plus personne ne
  ré-affirme le pointeur, qui reste au hasard du défaut de l'API). **(b) est donc, en l'état, une
  régression déguisée en durcissement.** Elle n'est acceptable **que** combinée au brouillon —
  c'est-à-dire (a).
- **(c) brouillon + publication humaine.**
  Le plus sûr, et cohérent avec la doctrine du portefeuille (les actes de release appartiennent au
  décideur). Coût : **un geste humain à chaque version**, y compris quand la matrice est 4/4 verte
  — c'est-à-dire un gate humain là où il n'y a **rien à arbitrer**. Un gate qu'on répète sans
  décider est un gate qu'on finit par exécuter sans lire.

> **Recommandation : (a).** Elle **empêche** au lieu de **réparer** — la distinction que tout le
> corpus `latest` de ce portefeuille a payée cher. Le gate humain reste intact **là où il compte** :
> **la pose du tag** est déjà un acte du décideur, et rien ne se publie sans elle. **Aragorn
> recommande également la voie automatique stricte, et je la pèse dans le même sens** : (b) ne
> tient pas à la mesure, (c) déplace un gate là où il n'y a pas de décision.
> **(c) reste le repli** si le décideur veut, pour les toutes premières versions, garder l'œil sur
> chaque publication : la bascule (a)↔(c) coûte **une ligne** (retirer le job `publier`).

### AR-2 — la course aux brouillons dupliqués (F8), en régime `releaseDraft: true`

- **(a) Accepter la course, la déclarer, la mesurer au premier run.** L'incident F8 est rapporté
  comme intermittent. Coût si elle se produit : **deux brouillons**, artefacts éclatés, et
  `publier` publierait **l'un des deux** — c'est-à-dire **l'incident du lot, reproduit**.
- **(b) Sérialiser la création dans `prepare`, et passer `releaseId` aux jobs de la matrice.**
  `prepare` crée **un** brouillon (une seule fois, un seul job) et publie son `id` en sortie ; les
  4 jobs de build posent `releaseId` **au lieu de** `tagName` — entrée **déclarée au SHA épinglé**
  (§ 0.4). **Plus aucune création concurrente, donc plus de course.**

> **Recommandation : (b), conditionnée à l'étape 0.4.** Si la lecture de la source **au SHA
> épinglé** confirme que `releaseId` **court-circuite** la création (et ne fait qu'attacher les
> artefacts), on prend (b) : la course F8 est exactement la pathologie que ce lot combat, il serait
> absurde de la laisser en place dans le remède. **Si la lecture ne le confirme pas**, on prend
> (a), **la course est écrite au § 7 comme risque assumé**, et l'on **ne prétend pas** l'avoir
> fermée.

### AR-3 — le brouillon laissé par une matrice rouge (question 3 de l'ordre de mission)

- **(a) Le brouillon reste, daté, personne ne le supprime.** Motifs : supprimer une release est un
  **acte destructif**, refusé aux agents ; un brouillon **n'est visible d'aucun visiteur** (il ne
  ment donc à personne) ; il **porte les artefacts partiels**, utiles au diagnostic ; et une
  suppression automatique **entrerait en course avec un re-run** du job rouge, qui viendrait
  compléter ce même brouillon.
- **(b) Nettoyage automatique en `if: failure()`.** Rend l'état propre, au prix d'un geste
  destructif automatisé et d'une course avec le re-run.

> **Recommandation : (a).** Avec deux exigences de forme, parce qu'un état muet ne se relit pas :
> le brouillon **porte le tag et la date** dans son titre (ce que `tauri-action` fait déjà via
> `releaseName`), et le **`publier` *skippé* est visible** dans l'interface du run.
> **Limite déclarée** : un job *skippé* ne **dit** rien de lui-même. Si le décideur juge ce silence
> inacceptable, la variante est un `publier` en `if: always()` **portant en interne** le test
> `needs.build.result == 'success'`, qui **parle** puis sort en succès sans publier. **Je ne la
> recommande pas** : elle remplace une garde **portée par la plateforme** par une garde **écrite
> par nous**, et c'est un pas dans la mauvaise direction pour exactement 4 lignes de log.

### AR-4 — la portée (question 4 de l'ordre de mission)

**TRANCHÉ par le cadrage, et voici pourquoi je me permets de trancher** : la doctrine est déjà
écrite ailleurs, je ne fais que l'appliquer.

- **`iakaInstall` SEUL** pour ce lot.
  Motifs : **AR-E du cadrage parent** interdit de toucher aux fichiers des sœurs (`iakaInstall`
  n'est **pas** inscrit à leur `fixtures/convergence.sha256`) ; leur bloc `latest:` est
  **byte-identique entre elles et inscrit à leur registre**, donc s'y toucher est une cérémonie **à
  deux dépôts, au même commit logique**, avec régénération des empreintes des deux côtés ; et leur
  historique de runs **n'est pas mesuré** (§ 0.5) — on ne modifie pas un workflow qui a déjà publié
  sur la foi d'une lecture.
- **Deux successeurs NOMMÉS, un par dépôt**, à inscrire aux backlogs **des sœurs** :
  - `RELEASE-BROUILLON-JUSQUA-MATRICE-VERTE-COCKPIT` (`IakaCockpit`),
  - `RELEASE-BROUILLON-JUSQUA-MATRICE-VERTE-GUI` (`iakaFrameGUI`).
  Chacun porte : la mesure d'abord (`gh run list`, § 0.5), puis la transposition **si et seulement
  si** la mesure montre que la faiblesse a mordu ou peut mordre ; et la cérémonie de convergence
  (les deux dépôts, même commit logique, cliquet re-mesuré).
- **`iakaframe` est hors sujet** (§ 0.6) : forme différente, défaut différent, successeur déjà
  nommé là-bas.

⚠️ **Ce que je ne peux PAS faire** : inscrire ces successeurs moi-même. Mon canal d'écriture est
borné à `specs/instructions/` **de ce dépôt**. **L'inscription aux backlogs des sœurs est un geste
d'🟠 Aragorn ou du décideur**, et je le demande explicitement ici — les successeurs de L42 sont
restés **six jours** au seul état de mémoire d'un rapport, c'est la maladie qu'on ne refait pas.

### AR-5 — l'instrument de preuve (question 6 de l'ordre de mission)

Aucune garde statique ne prouve qu'une release **reste** brouillon : seul un **run réel avec un
build volontairement cassé** le prouve.

- **(a) Un levier `casser` dans le `workflow_dispatch`** du workflow de **ce** dépôt : entrée
  `casser` (`aucune` par défaut, ou une clé de plateforme), honorée **uniquement** sur
  `workflow_dispatch` — **jamais** sur `push` de tag —, matérialisée par une étape placée **avant**
  l'étape `tauri-action` (donc rien n'est téléversé pour la plateforme sacrifiée), qui sort en
  erreur en disant qu'elle est **délibérée**. Le **run** appartient au décideur.
- **(b) Un banc privé** (précédent : `iakasju/latest-contrefactuel`).
  ⚠️ Le corpus porte déjà, en toutes lettres et **trois fois**, que ce qui est mesuré sur un banc
  privé avec un acteur substitut **n'est pas transposé** — « *CA-5 RESTE DÛ* ». Reproduire ce
  schéma, c'est reproduire sa dette.
- **(c) Aucun instrument : gate humain déclaré non couvert.** Honnête, et sans preuve.

> **Recommandation : (a), bornée.** Trois bornes non négociables : (i) l'entrée est **inerte** hors
> `workflow_dispatch` (et une garde statique le vérifie, § 5.5) ; (ii) l'étape de sabotage est
> **avant** `tauri-action` ; (iii) le **run** est un acte du **décideur**, pas de l'agent. Le
> brouillon laissé par ce run de preuve est ensuite supprimé **par le décideur** s'il le souhaite —
> acte de release, jamais l'agent.
> **Si (a) est refusée**, alors CA-R8 est **déclaré non couvert**, écrit tel quel, **jamais compté
> comme couvert** — c'est exactement ce que R8 du cadrage parent prescrit.

### AR-6 — la ligne que trace la garde statique (question 5)

- **(a) La garde lit le texte du workflow** (expressions régulières, zéro dépendance, comme les
  trois gardes existantes de ce dépôt).
- **(b) La garde parse le YAML** (dépendance nouvelle, lecture par le **sens** et non par le
  **motif**).

> **Recommandation : (a)**, par cohérence stricte avec les trois cliquets déjà en place et avec la
> règle « MVP d'abord ». **Sa limite est déclarée dans le fichier de garde lui-même** : elle lit
> **du texte**, donc elle prouve **ce qui est écrit**, jamais **ce qui s'exécute** — leçon **H-1**
> du corpus (« la complétude d'un balayage est celle du MOTIF, jamais celle du SENS »). Le
> comportement, lui, ne se prouve qu'au § 5.7 (run réel).

---

## 4. Périmètre

### Inclus

- `.github/workflows/release.yml` de **`iakaInstall`** : `releaseDraft: true`, job **`publier`**,
  `needs` du job `latest`, cartouches **datés** (jamais effacés), et — si AR-2 = (b) — création du
  brouillon dans `prepare` + `releaseId` dans la matrice.
- `fixtures/bloc-latest.sha256` : **re-fixation** de l'empreinte, avec **motif daté** en
  commentaire.
- Une **garde statique neuve** : `scripts/lib/release-publication.mjs` (cœur pur) +
  `scripts/__tests__/release-publication.test.mjs` (avec **contrefactuels nommés** et **témoin
  positif**).
- Si AR-5 = (a) : l'entrée `casser` du `workflow_dispatch` + sa garde d'inertie hors dispatch.
- Mise à jour du **backlog de ce dépôt** (`CLAUDE.md`) et de `specs/PROJET.md`
  § `RELEASE-PARTIELLE-PUBLIEE` (statut ⬜ → décidé + livré), **par ⚒️ Gimli** — ce n'est pas mon
  canal.

### Exclus — et chaque exclusion porte son motif

| Exclu | Motif |
|---|---|
| `IakaCockpit` et `iakaFrameGUI` | AR-4. Deux successeurs **nommés**, à inscrire par Aragorn/le décideur. |
| `iakaframe` | § 0.6 : autre forme, autre défaut, successeur déjà nommé là-bas. |
| Le SHA épinglé de `tauri-action` | § 2.4. |
| `includeUpdaterJson`, la matrice à 4 clés, `prerelease` | Gardés/motivés ailleurs, hors sujet. |
| **La vérification du contenu de la release avant publication** (compte et noms d'assets) | Successeur nommé **`PUBLICATION-VERIFIE-LES-ASSETS`** : ce dépôt n'a pas de table d'artefacts attendus (`fixtures/vitrine-assets.json` est une convention des sœurs, la vitrine est **B′-b**). ⚠️ **Conséquence à ne pas taire** : un build **vert qui ne produit rien** (la garde muette du 2026-09-05) passerait la règle du § 2.1. Ce lot ferme le trou « **build rouge → release publiée** », **pas** le trou « **build vert et vide → release publiée** ». |
| La suppression des brouillons | AR-3, acte destructif refusé aux agents. |
| Tout acte de release (pousser un tag, publier, éditer, supprimer, `workflow_dispatch`) | Doctrine du portefeuille : **au décideur**. L'agent **écrit le mécanisme**, il ne le **joue** pas. |

---

## 5. Étapes pour ⚒️ Gimli

### 5.0 — Étape 0 : MESURER avant d'écrire une ligne

Rien de ce qui suit n'est un préalable de politesse : chaque mesure **peut changer le lot**.

- **0.1** État réel des releases et du pointeur de ce dépôt :
  `gh release list --repo iakasju/iakaInstall`, puis pour `v0.1.0` et `v0.1.1` :
  `gh release view <tag> --json isDraft,isPrerelease,assets --jq '{isDraft,isPrerelease,n:(.assets|length)}'`,
  et `gh api repos/iakasju/iakaInstall/releases/latest --jq .tag_name` (ou son 404). **Confronter au
  rapport d'Aragorn (§ 0.2) et dire si ça concorde** — une mesure reprise du rapport d'un autre
  agent n'est pas une mesure.
- **0.2** Chaîne qualité **avant** toute modification : `npm run typecheck`, `npm run lint`,
  `npm run test` — les trois **avec leur code de sortie et leur chiffre**, pour disposer d'un
  référent.
- **0.3** Re-mesurer l'empreinte du bloc `latest:` **avant** modification, avec la commande de la
  fixture, et vérifier qu'elle vaut bien `f5de9ecb…32af3`. Si elle diffère, **arrêter** et le dire.
- **0.4** **Lire la source de `tauri-action` AU SHA ÉPINGLÉ** (`84b9d35b5fc46c1e45415bdb6144030364f7ebc5`),
  jamais `dev` : `src/index.ts` et `src/create-release.ts`. Répondre **par citation de lignes** à
  trois questions : (i) que fait exactement `releaseDraft: true` (chemin de recherche, chemin de
  création) ? (ii) `releaseId` **court-circuite-t-il** la création, ou s'y ajoute-t-il ? (iii)
  `createRelease` passe-t-il `make_latest` ? **Les réponses F1/F2/F3 du § 0.7 sont une lecture
  indirecte, à confirmer ligne par ligne.**
- **0.5** Décider, sur 0.4, de **AR-2 (a) ou (b)** et l'écrire.
- **0.6** Mesurer les **sœurs** en lecture seule (commandes au § 0.5 de ce document) et **rapporter
  le tableau** : leurs runs passés étaient-ils 4/4 ? une release incomplète a-t-elle été publiée
  chez elles ? **Aucun geste sur ces dépôts.**
- **0.7** Vérifier le comportement de `gh` sur un **brouillon** (F6 contre F7). En **lecture
  seule** : `gh api repos/iakasju/iakaInstall/releases --jq '[.[] | {tag_name,draft,id}]'` — cet
  endpoint **rend les brouillons** (c'est d'ailleurs pourquoi le job `latest` actuel les filtre
  explicitement). **Conclusion attendue** : préférer **l'adressage par `id`** via l'API à
  l'adressage **par tag** via `gh release edit`, dont F7 montre qu'il est mal défini sur les
  brouillons.

### 5.1 — Le brouillon

Poser `releaseDraft: true` (l. 109). **Ne pas toucher** à `prerelease`, `includeUpdaterJson`, ni au
SHA. Écrire **dans le fichier**, en commentaire, la règle du § 2.1 et sa raison — pas un renvoi à
ce document : la raison doit se lire là où le lecteur est.

Si **AR-2 = (b)** : ajouter à `prepare` la création du brouillon (une seule fois) et la sortie
`release_id` ; dans `build`, remplacer `tagName`/`releaseName` par `releaseId` **si et seulement si**
0.4 le confirme.

### 5.2 — Le job `publier`

Inséré **AVANT** le bloc `  latest:` (§ 2.3, sans quoi le cliquet garderait autre chose).

Forme attendue : `needs: [build]` **strict, sans `if:`** ; `permissions: contents: write` ;
`runs-on: ubuntu-latest` ; une étape qui, dans l'ordre : **retrouve la release par son `id`**
(listing `repos/<depot>/releases`, filtre `.draft == true and .tag_name == $TAG`), **échoue en le
nommant** si elle n'en trouve pas exactement **une** (zéro = rien à publier ; **deux = la course
F8 s'est produite**, et c'est **précisément** le cas où publier à l'aveugle reproduirait
l'incident), puis **la passe en non-brouillon**. Enfin, elle **dit** ce qu'elle a fait : le tag,
l'`id`, le nombre d'assets, l'état avant/après. **Un « OK » muet ne se relit pas.**

### 5.3 — Le job `latest`

`needs: build` → **`needs: publier`**. `if: always()` **conservé** (motif au § 2.2 : il doit
tourner même quand `publier` est *skippé*, pour ne pas laisser le pointeur au hasard). Le corps du
script **ne change pas** — son référent filtre déjà les brouillons, ce qui devient, avec ce lot,
**la propriété qui fait le travail**.

Le cartouche est **mis à jour en datant** : la phrase « *il n'EMPÊCHE toujours pas* » **reste**,
marquée comme état antérieur au 2026-09-05, suivie de ce qui la dépasse — **et de ce qui ne la
dépasse pas** : le job **ne prévient toujours pas** le vol du `latest` par une release **créée à la
main** hors de ce workflow. Sa portée s'arrête à **ce** workflow.

### 5.4 — Re-figer `fixtures/bloc-latest.sha256`

Avec la commande écrite en tête du fichier, **après** 5.3, et **jamais** en recopiant une valeur
lue ailleurs. Ajouter un **commentaire daté** : ce qui a changé (le `needs`, le cartouche), pourquoi
(ce lot), et la nouvelle empreinte. **Vérifier que `npm run test` rougissait AVANT la re-fixation**
— si le test était vert alors que le bloc avait changé, **le cliquet ne garde rien** et c'est un
défaut plus grave que le lot.

### 5.5 — La garde statique

`scripts/lib/release-publication.mjs`, cœur **pur** (on lui passe le **texte**, il rend des faits),
sur le modèle exact de `scripts/lib/pin-tauri-action.mjs`. Quatre propriétés :

1. `releaseDraft: true` est posé **exactement une fois** dans l'étape `tauri-action`.
2. Il existe un job de publication, et son `needs` **contient le job de build de la matrice**.
3. Ce job **ne porte pas** de condition qui le ferait tourner sur matrice rouge (`always()`,
   `!cancelled()`, `success() || failure()`…). ⚠️ **Motif, pas sens** : la garde reconnaît une
   **liste explicite** de formes, et **cette liste est déclarée dans le fichier** avec ce qu'elle
   ne couvre pas.
4. Le job `latest` **dépend** du job de publication.
5. Si AR-5 = (a) : l'entrée `casser` **n'est lue** que sous `github.event_name == 'workflow_dispatch'`
   (ou `github.event.inputs.casser`, qui est vide sur un `push`) — et jamais autrement.

**Toute mutation se fait sur une COPIE du texte, en mémoire — jamais sur le fichier versionné.**

### 5.6 — Les contrefactuels, joués et révoqués

Chacun **mute le programme** (le texte du workflow **en mémoire**, ou le fichier avec révocation
prouvée au `sha256`), **jamais l'attendu**. Liste au § 8. **Et d'abord le témoin positif** : le
workflow **non muté** doit **passer** la garde — sans quoi « ça rougit toujours » satisferait tous
les contrefactuels, et on aurait écrit un témoin vide. Ce dépôt a déjà payé ce défaut (F-1 de L42,
trois fois dans le portefeuille).

### 5.7 — Ce qui reste au décideur, et qui n'est PAS couvert par ce qui précède

- Le **run réel** avec un build volontairement cassé (AR-5). C'est **la seule** preuve que la
  release **reste brouillon** et que le pointeur **ne bouge pas**.
- Le **run réel nominal** 4/4 vert, qui prouve que `publier` publie **et** que `latest` désigne.
- Toute suppression du brouillon de preuve.

**Aucune de ces trois lignes ne se déclare PASS par un agent.**

---

## 6. Fichiers concernés

| Fichier | Ce qui change |
|---|---|
| `.github/workflows/release.yml` | `releaseDraft: true` ; job **`publier`** inséré **avant** le bloc `latest:` ; `latest` passe en `needs: publier` ; cartouches **datés** ; si AR-2=(b) : brouillon créé dans `prepare` + `releaseId` dans `build` ; si AR-5=(a) : entrée `casser` + étape de sabotage **avant** `tauri-action` |
| `fixtures/bloc-latest.sha256` | **Empreinte re-figée**, avec **motif daté** |
| `scripts/lib/release-publication.mjs` | **Neuf** — cœur pur de la garde statique, avec sa **limite déclarée dans le fichier** |
| `scripts/__tests__/release-publication.test.mjs` | **Neuf** — témoin positif + contrefactuels nommés |
| `CLAUDE.md` § Backlog | `RELEASE-PARTIELLE-PUBLIEE` : ⬜ → décidé/livré ; successeurs des sœurs **nommés** |
| `specs/PROJET.md` § `RELEASE-PARTIELLE-PUBLIEE` | Verdict inscrit **en datant**, la section « deux voies non tranchées » conservée comme état antérieur |

**Non touchés, et c'est délibéré** : `fixtures/tauri-action-pin.json`,
`scripts/__tests__/release-matrice.test.mjs`, `scripts/__tests__/pin-tauri-action.test.mjs`,
`scripts/embarquer-cli.mjs`, et **les workflows des trois autres dépôts**.

---

## 7. Risques

| # | Risque | Mitigation |
|---|---|---|
| **R-1** | **Le lot corrige le job `latest` et croit avoir fermé le trou.** C'est la lecture naturelle du symptôme (« le job `latest` a réussi alors qu'un build était rouge »), et elle est **fausse** : la release était **déjà publiée et déjà `latest`** avant ce job. | § 1 et AR-1(b) démontrent l'insuffisance **sur le run mesuré**. La correction porte sur `releaseDraft`, pas sur `latest`. |
| **R-2** | **La course F8 fabrique DEUX brouillons**, et `publier` en publie un — l'incident reproduit **à l'intérieur du remède**. | AR-2(b) supprime la création concurrente. Si (a) est retenue : le job `publier` **échoue en le nommant** dès qu'il trouve **plus d'un** brouillon pour le tag (§ 5.2) — il **ne devine pas**. |
| **R-3** | **`gh` est mal défini sur les brouillons** (F7) : `gh release edit <tag> --draft=false` peut ne pas trouver la release, ou en trouver une autre. | Étape 0.7 : adressage **par `id`** via l'API, jamais par tag. Le job **dit** l'`id` qu'il a publié. |
| **R-4** | **La publication déplace le pointeur** au défaut `make_latest` de l'endpoint de mise à jour, et personne ne le ré-affirme. | Ordre `publier` → `latest` (§ 2.2). ⚠️ **Ce défaut est un fait supposé, pas mesuré** : à **observer** au run nominal (§ 5.7), jamais à déduire — le corpus a déjà réfuté par mesure une doc de GitHub sur ce champ exact. |
| **R-5** | **Un job *skippé* est muet** : une matrice rouge laisse un brouillon sans qu'aucune ligne ne le dise. | AR-3 : accepté et **déclaré**. La variante parlante est écrite, et **non recommandée**, avec son motif. |
| **R-6** | **La garde statique prouve le TEXTE, pas le COMPORTEMENT.** Une garde verte sur un workflow qui publierait quand même serait le pire des faux verts. | Limite **écrite dans le fichier de garde** (H-1) ; CA-R8 déclaré **non couvert** sans le run réel d'AR-5. |
| **R-7** | **Le trou voisin reste ouvert** : un build **vert et vide** publierait une release incomplète, et ce lot n'y peut rien. | Exclu **explicitement** au § 4, successeur **nommé** `PUBLICATION-VERIFIE-LES-ASSETS`. Ne **jamais** écrire que ce lot garantit une release complète : il garantit qu'**aucun build n'a rougi**. |
| **R-8** | **Les successeurs des sœurs restent à l'état de mémoire d'un rapport.** Précédent mesuré : F-2/F-3 de L42, **six jours** sans inscription. | AR-4 : les deux noms sont écrits ici ; **leur inscription aux backlogs des sœurs est demandée nommément** à Aragorn/au décideur, et c'est un **livrable du lot**, pas une politesse. |
| **R-9** | **Le levier `casser` finit par casser une vraie release.** | AR-5 : inerte hors `workflow_dispatch`, garde statique dessus (§ 5.5, propriété 5), étape de sabotage **avant** tout téléversement, run réservé au décideur. |

---

## 8. Critères d'acceptation

*Testables. Ceux qui ne le sont pas sont déclarés non couverts — jamais comptés comme PASS.*

- [ ] **CA-R1** — `.github/workflows/release.yml` pose **`releaseDraft: true`** exactement une
      fois, dans l'étape `tauri-apps/tauri-action@<sha épinglé>`, et le SHA épinglé est
      **inchangé**.
      *Contrefactuel* : remettre `releaseDraft: false` **sur une copie en mémoire** ⇒ la garde
      rougit **en nommant l'entrée et la valeur lue**.

- [ ] **CA-R2** — Il existe un job de publication dont le `needs` **contient le job de build**, et
      qui **ne porte aucune condition** le faisant tourner sur matrice rouge.
      *Contrefactuels, trois, chacun rouge et nommé* : (i) `needs: prepare` au lieu de `build` ;
      (ii) ajout de `if: always()` ; (iii) suppression pure et simple du job.

- [ ] **CA-R3** — Le job `latest` **dépend** du job de publication.
      *Contrefactuel* : remettre `needs: build` ⇒ rouge nommé, avec le message disant **pourquoi**
      l'ordre compte (sinon `latest` lit une release encore brouillon, puis la publication reprend
      le pointeur après coup).

- [ ] **CA-R4** — **Témoin positif** : le workflow **non muté** passe la garde.
      *Sans ce critère, « ça rougit toujours » satisferait CA-R1 à CA-R3.* Ce critère est **le
      verrou anti-témoin-vide**, et il se lit comme tel.

- [ ] **CA-R5** — `fixtures/bloc-latest.sha256` porte la **nouvelle** empreinte, **mesurée par la
      commande de la fixture**, avec un commentaire **daté** disant ce qui a changé et pourquoi ;
      et `npm run test` est **vert**.
      *Contrefactuel* : **avant** la re-fixation, `npm run test` devait **rougir** sur
      `bloc-latest.test.mjs` — le rouge est **capturé et cité**. S'il n'a pas eu lieu, le cliquet
      ne garde rien, et **c'est un FAIL du lot**.

- [ ] **CA-R6** — La garde statique **déclare sa limite dans son propre fichier** : elle lit du
      texte, donc elle prouve ce qui est **écrit**, jamais ce qui **s'exécute** ; et elle **énumère
      les formes de condition** qu'elle sait reconnaître, avec ce qu'elle ne couvre pas.

- [ ] **CA-R7** *(si AR-5 = (a))* — L'entrée `casser` est **inerte** hors `workflow_dispatch`, et
      une garde statique le vérifie.
      *Contrefactuel* : retirer la condition d'événement ⇒ rouge nommé.

- [ ] **CA-R8** — 🛑 **NON COUVERT PAR CONSTRUCTION, et déclaré tel.** *Un run réel dont un job de
      la matrice échoue laisse la release en **brouillon**, ne déplace **pas** `releases/latest`,
      et `publier` apparaît **skippé**.* **Aucune garde automatisée ne peut le prouver** : c'est
      une **recette du décideur** (AR-5). Il se rend par **trois mesures citées** : l'état de la
      release (`isDraft: true`), la sortie de `releases/latest` (inchangée), et la conclusion du
      job `publier` (`skipped`).

- [ ] **CA-R9** — 🛑 **NON COUVERT PAR CONSTRUCTION.** *Un run réel 4/4 vert publie la release
      **et** désigne `latest`.* Recette du décideur. Mesures attendues : `isDraft: false`, compte
      d'assets **= 9**, `releases/latest` = le tag publié.

- [ ] **CA-R10** — Les faits de l'étape 0 sont **rendus** dans le rapport de ⚒️ Gimli, avec
      commandes et sorties : état des releases de ce dépôt (0.1), **lecture au SHA épinglé** (0.4)
      répondant aux trois questions, verdict AR-2 (0.5), **tableau des runs des sœurs** (0.6). Un
      critère **non mesuré** se déclare *non mesuré*, jamais *PASS*.

- [ ] **CA-R11** — Les **deux successeurs des sœurs** (`RELEASE-BROUILLON-JUSQUA-MATRICE-VERTE-COCKPIT`,
      `…-GUI`) et le successeur `PUBLICATION-VERIFIE-LES-ASSETS` sont **inscrits** — les deux
      premiers aux backlogs des sœurs (geste d'Aragorn/du décideur, **demandé nommément**), le
      troisième au backlog de ce dépôt. **Un lot qui répare un successeur oublié ne repart pas en
      oubliant les siens.**

- [ ] **CA-R12** — Chaîne qualité verte, **chaque commande sur sa ligne**, avec son code de sortie
      et son chiffre : `npm run typecheck`, `npm run lint`, `npm run test`. **Aucune formule
      d'ensemble** (« tout est vert ») — c'est un FAIL de forme dans ce portefeuille.

---

## 9. Estimation

**Rappel de forme** : ce n'est **pas un engagement ferme**. C'est un ordre de grandeur assumé et
révisable, donné pour que le décideur **engage, découpe ou re-cadre en connaissance de cause**. Il
sera **confronté au temps réel** à la clôture du lot.

### Équivalent jour-homme — **≈ 1,5 j-homme** (spec fermée, arbitrages tranchés)

| Poste | Charge |
|---|---|
| Étape 0 (mesures, dont lecture de la source au SHA épinglé et mesure des sœurs) | ≈ 0,35 j |
| Workflow : brouillon + job `publier` + `needs` + cartouches datés | ≈ 0,3 j |
| Garde statique + contrefactuels + témoin positif | ≈ 0,45 j |
| Re-fixation de la fixture (avec le rouge préalable capturé) + backlog + PROJET.md | ≈ 0,2 j |
| Rapport de remise au gate 🏹 Legolas, mesures citées | ≈ 0,2 j |

**Si AR-2 = (b)** (création sérialisée + `releaseId`) : **+0,3 j**. **Si AR-5 = (a)** (levier
`casser` + sa garde) : **+0,2 j**. **Fourchette raisonnable : 1,5 à 2,0 j-homme.**

### Complexité / risque

**Complexité technique : FAIBLE.** Une entrée à basculer, un job d'une dizaine de lignes, un `needs`
à changer, une garde textuelle sur le modèle de trois gardes existantes. Rien d'algorithmique.

**Risque : ÉLEVÉ — et l'écart entre les deux est le fait saillant de ce lot.** Motifs :

1. **Le juge unique est un run réel**, qui appartient au décideur. Tout ce qu'un agent peut livrer
   ici est **du texte gardé par du texte**.
2. On modifie **le mécanisme même de publication**, sur un dépôt qui vient d'en payer un défaut :
   une erreur ne se voit pas en test, elle se voit **sur la page publique**.
3. Le sujet a un **passif dense** dans ce portefeuille (L42→L44 : cartouches faux, gardes tièdes,
   témoins vides, conclusions déduites au lieu d'être mesurées). La tentation de **conclure par
   lecture** y est structurellement forte.

### Inconnues susceptibles de faire glisser l'estimation

| # | Inconnue | Effet si elle tombe mal |
|---|---|---|
| **I-1** | `releaseId` **ne court-circuite pas** la création au SHA épinglé | AR-2(b) tombe → on garde la course F8 comme risque **assumé et déclaré**, et le lot **ne ferme pas** ce trou. **Pas de dépassement de charge, mais une garantie en moins.** |
| **I-2** | La publication d'un brouillon **ne se comporte pas** comme attendu (`gh` vs API, F6/F7) | +0,3 j de mise au point du job `publier` ; possible bascule vers l'API brute exclusivement. |
| **I-3** | Le run de preuve (AR-5) **révèle** un comportement non anticipé (course, pointeur, assets) | Lot correctif **successeur**, pas une rallonge de celui-ci. |
| **I-4** | La mesure des sœurs (0.6) montre qu'**elles ont déjà publié des releases incomplètes** | Ne change **pas** ce lot (AR-4), mais **relève la priorité** des deux successeurs — décision du décideur. |
| **I-5** | Le rouge préalable de CA-R5 **n'a pas lieu** (le cliquet ne garde rien) | Le lot **s'arrête** et remonte : un cliquet aveugle est un défaut plus grave que celui qu'on répare. |

---

## 10. Ce que ce lot ne prétend PAS faire

Écrit ici pour qu'aucune relecture ne l'ajoute par optimisme :

- Il **ne garantit pas** qu'une release publiée soit **complète** — seulement qu'**aucun build n'a
  rougi** (§ 4, R-7).
- Il **n'empêche pas** le vol du `latest` par une release **créée à la main** hors de ce workflow.
  Sa portée s'arrête à ce workflow.
- Il **ne corrige rien** chez les sœurs ni dans `iakaframe`.
- Il **ne prouve rien** par lui-même sur le comportement réel : **la seule preuve est un run**, et
  ce run appartient au décideur.
