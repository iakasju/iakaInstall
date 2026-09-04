# La façade d'installation (C.2) et son ossature de release (B′-a)

> Cadrée par 🔵 **Gandalf**, le **2026-09-04**, sur ordre de mission de 🟠 Aragorn.
> **Lecture seule** sur tout le code pendant le cadrage. Tout fait chiffré du § 0 a été relevé
> **sur le disque** ou **vérifié sur le web ce jour** ; rien n'est repris d'un brief ni d'une
> mémoire de session.
>
> **Cadrage de référence, qui fait foi et n'est pas rediscuté ici** :
> `~/work/iakaframe/specs/instructions/chaine-complete-install-amorcage-dmg-msi.md`
> (§ 4.0 les huit verdicts · § 5.2 lot B′ · § 5.4 lot C · § 6.0-6.1 étapes 11-13 · § 8 R3 ·
> § 9 CA-16..CA-20 · § 10 gate humain).
> Ce cadrage-ci **ferme le périmètre du lot C.2 + B′-a** et **acte l'état mesuré** du moteur
> livré depuis (lots A, C.1 et `bundle-install-mjs-embarque`).
>
> ⚠️ **UNE MESURE CHANGE LE PÉRIMÈTRE, ET IL FAUT LA LIRE AVANT TOUT LE RESTE.**
> Le cadrage de référence suppose, en C.2, une façade qui « affiche les annonces d'étape,
> recueille les feux verts, rend l'échec et le rollback lisibles ». **Le moteur livré n'expose
> aucun de ces quatre états à un programme.** `--json` existe, il est déclaré au registre des
> verbes, il est documenté — et **il n'émet aucun JSON** (§ 0.3, M-C1 à M-C4). La façade telle
> que le cadrage la décrit **n'est donc pas implémentable aujourd'hui sans parser de la prose**,
> c'est-à-dire sans devenir exactement le défaut que **R3** nomme.
> → **AR-I1** (§ 3), et un **prérequis nommé côté CLI**.

---

## 0. Ce qui a été mesuré le 2026-09-04

### 0.1 — Instruments, et leur limite déclarée

- **Lecture de fichiers** (`Read`, `Grep`, `Glob`) sur `iakaframe`, `iakaInstall`, `IakaCockpit`,
  `iakaFrameGUI`, `iakagraph`.
- **Vérification web** pour les faits externes (Tauri, `tauri-action`, facturation GitHub Actions).
- ❌ **Aucun shell dans cette session de cadrage.** Je **n'ai pas** joué
  `node cli/src/index.js install --dry-run --json`, contrairement à ce que l'ordre de mission
  autorisait. **Cette limite est déclarée, et elle borne ce que j'affirme** : les faits M-C1 à
  M-C4 ci-dessous sont établis **par lecture du code**, pas par exécution. La commande qui les
  confirmerait en une seconde est donnée à l'**étape 1** du § 5 — c'est le premier geste demandé
  à ⚒️ Gimli, avant d'écrire une ligne.

### 0.2 — État du dépôt `iakaInstall` (amorcé le 2026-09-03)

| Fait | Preuve |
|---|---|
| **Le dépôt ne porte aucun code.** Ni `package.json`, ni `src-tauri/`, ni `.github/`. | Balayage complet : seuls `CLAUDE.md`, `specs/{PROJET.md, etat-des-lieux.md, instructions/_TEMPLATE.md}`, `global/` (kit), `.claude/`, `.iakaframe`, `iakaframe.json`, `.gitignore` |
| **Les deux remotes existent déjà.** | `.git/config:8-16` — `origin` = `http://…@192.168.1.139:3001/sjupin/iakaInstall.git` (Forgejo NAS), `github` = `https://github.com/iakasju/iakaInstall.git` |
| **`.env` est ignoré.** | `.gitignore:2` — compte pour AR-I4 (passage public) |
| **`CLAUDE.md` est un squelette non rempli.** | `iakaInstall/CLAUDE.md` — `Stack : <!-- ex: React + TypeScript + Tauri/Rust + SQLite -->`, bloc de commandes entièrement commenté, backlog vide |
| **`productName` = `iakaInstall`, figé.** | `specs/PROJET.md:171-177` (décision du décideur du 2026-09-03) |

### 0.3 — Le moteur, tel qu'il est RÉELLEMENT au 2026-09-04

**Ce qui est livré et solide** (lots A + C.1 + `bundle-install-mjs-embarque`, gate 🏹 Legolas PASS
sur C.1 — `iakaframe/docs/qualite/gate-lot-C1-moteur-chaine.md`) :

- **M-E1 — Les 4 étapes sont chaînées et jouables sans interface.** `runInstall`
  (`iakaframe/cli/src/commands/install.js:394-474`) enchaîne `etape1Cli` → garde AR-1/AR-4 →
  `etape2Methode` → `etapeApp(3)` → `etapeApp(4)`. CA-10 mesuré PASS, re-mesuré en direct par le
  gate (`gate-lot-C1-moteur-chaine.md:54`).
- **M-E2 — Le rollback à trois gardes existe et rend une structure.** `orchestrerRollback`
  (`cli/src/lib/rollback.js:106-120`) rend `{ rapports, resume, defaits, nonDefaits }` —
  **structuré en mémoire**, imprimé en texte par `install.js:466-467`.
- **M-E3 — La provenance existe, au format imposé.** `formatProvenance`
  (`cli/src/lib/reservoir.js:120-132`), imprimée par `install.js:146`.
- **M-E4 — La signature minisign est vérifiée avant toute écriture.** `telechargerEtVerifier`
  (`cli/src/lib/app-bundle.js:76-100`), CA-14 PASS.
- **M-E5 — `install.mjs` voyage désormais avec le paquet publié** (`cli/_bundled/install.mjs`),
  R10 soldé — `reservoir.js:57-64`, `:181`.
- **M-E6 — Le CLI est en `0.39.0`**, Node **≥ 20** requis (`cli/package.json:3`, `:9-11`).

**Ce qui manque, et qui commande ce lot** :

- 🛑 **M-C1 — `install --json` N'ÉMET AUCUN JSON.** Lecture intégrale de
  `cli/src/commands/install.js` (475 lignes) : **aucun `import` de `lib/output.js`**, **aucun
  `JSON.stringify`**, **aucun `printJson`**. La valeur `values.json` n'est utilisée **qu'à un seul
  endroit** — `confirmerEtape` (`install.js:65-70`), qui la passe à `peutDemander`. Toute la
  sortie est faite de `console.log` de prose française.
- 🛑 **M-C2 — Et le registre PROMET pourtant une sortie machine.** `cli/src/lib/verbes.js:84`
  déclare `--json` parmi les options du verbe (le registre est **la source unique de l'aide**), et
  `install.js:59` l'annonce verbatim : *« `--json` Sortie machine (desactive les confirmations
  interactives) »*. **La première moitié de cette phrase est fausse.** Seule la seconde est vraie.
  Quiconque code la façade en croyant le registre perdra du temps — ou, pire, parsera la prose.
- 🛑 **M-C3 — Le verbe est HORS du contrat C-JSON du CLI, et c'est mesurable.** La convention de
  sortie machine du CLI est portée par `cli/src/lib/output.js` (5 règles, `:1-11`) et gardée par
  `cli/test/guard-json-output.test.js`. Sa liste `NOMINAL` (`:70-90`) balaye **19 commandes** —
  `list`, `portfolio`, `assemble`, `agents`, `config`, `show`, `memory`, `open`, `recall`,
  `observe`, `review`, `close`, `services`, `canaux`. **`install` n'y figure pas.** La garde ne
  peut donc pas rougir sur lui : son `--json` est vide **et personne ne le mesure**.
- 🛑 **M-C4 — Il n'existe AUCUN canal de consentement non-TTY, et `--json` REFUSE tout.**
  `peutDemander` (`cli/src/lib/interactif.js:36-50`) rend `true` **si et seulement si** six
  conditions tiennent, dont `stdin.isTTY`, `stdout.isTTY`, et **`json !== true`**. `confirmerEtape`
  (`install.js:65-70`) : si `--yes` → `true` ; sinon si non-interactif → **`false`, refus**. Et le
  prompt lui-même, `askYesNo` (`interactif.js:58-63`), lit `process.stdin` par `readline`.
  **Conséquence dure, et c'est le cœur du lot** : un programme qui lance `install --json` obtient
  un **refus à la première étape qui demande quelque chose** ; le seul moyen de faire avancer la
  chaîne depuis un programme est **`--yes`, qui saute TOUTES les validations** (AR-4). **Il
  n'existe aujourd'hui aucun chemin par lequel une interface graphique puisse recueillir un feu
  vert par étape.** C'est précisément ce qu'AR-4 exige et ce que C.2 doit afficher.
- 🛑 **M-C5 — Le verbe est monolithique.** `runInstall` (`install.js:394-474`) joue 1→4 en séquence.
  Les options déclarées (`:396-408`) ne portent **aucun** sélecteur d'étape. La façade ne peut donc
  pas non plus découper la chaîne en quatre appels successifs pour intercaler ses feux verts.
- 🟠 **M-C6 — Les étapes 3 et 4 ne couvrent QUE macOS.** `cleManifestePlateforme`
  (`cli/src/lib/app-bundle.js:52-58`) rend une clé pour `darwin/arm64` et `darwin/x64`, et **`null`
  partout ailleurs** ; `etapeApp` refuse alors explicitement (`install.js:317-327`, CA-15 PASS).
  **Lu tel quel : un utilisateur Windows qui lance le `.msi` demandé par AR-C obtiendrait un
  installeur qui pose le CLI et la méthode, puis REFUSE les deux applications.** Ce n'est pas créé
  par ce lot — c'est la portée assumée de C.1 (§ 10 du cadrage de référence). Mais **c'est la
  façade qui le rendra visible au premier contact**. → **R-I2**.
- 🟠 **M-C7 — L'étape 1 exige `npm` sur la machine cible.** `install.js:200` :
  `spawnSync(cmd, args…)` avec `cmd = 'npm'` (`:152`, `:171-173`). **Un poste « qui n'a rien » n'a
  pas `npm`.** La chaîne présuppose donc Node ≥ 20 + npm. → **R-I3**, et cela **décide AR-I2**.

### 0.4 — La convention de release des deux sœurs, relevée

- **M-R1 — Le SHA épinglé est le même des deux côtés** :
  `tauri-apps/tauri-action@84b9d35b5fc46c1e45415bdb6144030364f7ebc5 # action-v0.6.2`
  (`IakaCockpit/.github/workflows/release.yml:93` et
  `iakaFrameGUI/.github/workflows/release.yml:93`).
- **M-R2 — Matrice à 4 plateformes**, construite par un job `prepare` qui rend un JSON :
  `macos-arm64` / `macos-x64` (tous deux sur `macos-latest`, `--target` explicite), `linux`
  (`ubuntu-22.04`), `windows` (`windows-latest`) — `IakaCockpit/.github/workflows/release.yml:39-44`.
  Déclenchement : `push` sur `tags: v*`, plus un `workflow_dispatch` avec sélecteur de plateformes
  (`:6-25`) — **motif écrit dans le fichier** : « ne pas consommer inutilement les minutes macOS
  (facturees 10x) ».
- **M-R3 — Autres actions, non épinglées** : `actions/checkout@v4` (`:63`),
  `actions/setup-node@v4` + `node-version: 20` (`:74-76`), `dtolnay/rust-toolchain@stable` (`:79`),
  `swatinem/rust-cache@v2` (`:83`). **Seule `tauri-action` est épinglée au SHA.** CA-20 du cadrage
  de référence ne demande pas davantage ; l'étendre serait un « tant qu'on y est ».
- **M-R4 — `includeUpdaterJson: false`** (`:127`), avec le motif écrit sur 20 lignes (`:107-126`) :
  le manifeste qui fait autorité est `updater/latest.json`, pas celui que l'action poserait.
- **M-R5 — Un job `latest`** (`:185-273`) qui **désigne explicitement** le plus haut semver
  **porteur d'une release**, `if: always()`. **Comportement mesuré et écrit** : s'il n'existe
  **aucune** release, il **sort en succès en le disant** (`:232-236`). C'est exactement l'état d'un
  dépôt neuf — le job sera **présent, correct et inerte** jusqu'à la première release.
- 🛑 **M-R6 — LES DEUX `release.yml` NE SONT PAS BYTE-IDENTIQUES, et c'est une dette connue.**
  `IakaCockpit/CLAUDE.md` (entrée L44) et `iakaFrameGUI/CLAUDE.md` (entrée L44) nomment tous deux
  le successeur **`CONVERGENCE-RELEASE-YML-ALIGNEMENT`** : les deux fichiers diffèrent **l. 72**
  (dépendances Linux : `libasound2-dev cmake pkg-config` en plus côté Cockpit) et **l. 96-99**
  (commentaire des secrets minisign). **Conséquence directe pour ce lot** : « copier la convention
  éprouvée » **ne peut pas vouloir dire « copier à l'octet »** — il faut **nommer laquelle des deux
  on copie**. → décidé en § 2.
- **M-R7 — Stack front des deux sœurs, mesurée** (`IakaCockpit/package.json`) : React **18.3.1**
  (épinglé, sans `^`), TypeScript **5.5.4** (épinglé), Vite **^6**, Vitest **^4.1.9**,
  `@tauri-apps/api` **^2**, `@tauri-apps/cli` **^2**, jsdom **^29.1.1**, eslint **^9.39.4**,
  `@testing-library/react` **^16.1.0**. **C'est la stack à répliquer** (`specs/PROJET.md:69-72`).
- **M-R8 — Ports de dev déjà pris** : `3020` (IakaCockpit, `IakaCockpit/CLAUDE.md`) et **`3030`**
  (`iakaFrameGUI/src-tauri/tauri.conf.json:8`). **`3040` est libre** → convention « ports hôte
  distincts par projet ».
- **M-R9 — CSP stricte, jamais `null`**, et tout servi en `'self'` :
  `iakaFrameGUI/src-tauri/tauri.conf.json:23`.

### 0.5 — Le réservoir de chartes, relevé

Les chartes vivent dans **`~/work/iakagraph/theme/<famille>/<variante>/`** — et nulle part ailleurs.
**Dix chartes** sont disponibles, catalogue mesuré dans
`IakaCockpit/src/assets/chartes/manifest.ts:15-26` (fichier **généré**, jamais édité à la main) :

| id | nom | fond / carte / accent |
|---|---|---|
| `naonedge-dark` | NaonEdge dark | `#0a0a0a` `#1a1a1a` `#c8a44e` |
| `naonedge-light` | NaonEdge light | `#f7f6f2` `#ffffff` `#9a7521` |
| `grimoire-dark-fantasy` | Grimoire dark-fantasy | `#e7dcc0` `#efe6cf` `#a84b2a` |
| `os-windows` | OS Windows | `#f3f3f3` `#ffffff` `#0067c0` |
| `os-ubuntu` | OS Ubuntu | `#fafafa` `#ffffff` `#e95420` |
| `os-android` | OS Android | `#fef7ff` `#ffffff` `#6750a4` |
| `os-macos` | OS macOS | `#ececec` `#ffffff` `#007aff` |
| `cartoon-std` | Cartoon std | `#fff7e6` `#ffffff` `#ff5a5f` |
| `photoreal-modern` | Photoreal modern | `#f5f6f8` `#ffffff` `#4f46e5` |
| `studio-clair` | Studio clair | `#fbfbfc` `#ffffff` `#5b5bd6` |

Chaque charte porte `tokens.css`, `components.css`, `logos/*.svg`, `vignettes/*.png`
(ex. `iakagraph/theme/naonedge/dark/{tokens.css, logos/naonedge-logo.svg}`).
**Le geste de reprise existe déjà** : `IakaCockpit/scripts/sync-chartes.sh` synchronise les
`tokens.css` via un **pont de 23 variables** (contrat app ← iakagraph) vers
`src/assets/chartes/chartes.css` + `manifest.ts`, servis en `'self'` (CSP intacte). → **AR-I3**.

### 0.6 — Les faits externes, vérifiés le 2026-09-04 (sources en fin de document)

- **Tauri 2.x stable = `2.11.5`** (crate `tauri`, publiée le **2026-07-01**). Les sœurs déclarent
  `@tauri-apps/api: ^2` et `@tauri-apps/cli: ^2` : la plage couvre déjà cette version, **aucun
  changement de plage n'est requis**.
- **MSRV Tauri 2 = Rust `1.77.2`** (abaissée délibérément pour Windows 7, PR `tauri-apps/tauri#11205`).
  Le CI des sœurs utilise `dtolnay/rust-toolchain@stable` : conforme.
- **`tauri-apps/tauri-action`** — **le SHA épinglé par les deux sœurs est vérifié exact** : le tag
  `action-v0.6.2` pointe bien `84b9d35b5fc46c1e45415bdb6144030364f7ebc5` (API GitHub, tags).
  ⚠️ **Il existe une release plus récente** : `action-v1.0.0` =
  `1deb371b0cd8bd54025b384f1cd735e725c4060f`, qui **retire le support de Tauri v1 et des v2
  instables** et ajoute Android/iOS. **Elle n'est PAS retenue ici** : monter d'une majeure dans le
  dépôt neuf ferait diverger la troisième app des deux autres **sur le seul point que L41 a coûté
  un lot à verrouiller**, et le cliquet de `IakaCockpit/fixtures/tauri-action-pin.json` impose de
  **re-lire `action.yml` au nouveau SHA** avant toute levée. → successeur nommé
  **`TAURI-ACTION-V1-POUR-LES-TROIS`**, hors périmètre, à jouer **sur les trois dépôts à la fois**
  ou sur aucun.
- **Facturation GitHub Actions** : **gratuite et illimitée pour les dépôts publics** ; pour un
  dépôt **privé**, quota mensuel de **2 000 minutes Linux-équivalent** (plan Free), et **macOS
  décompté ×10**. La matrice porte **deux** jobs macOS. → **AR-I4**.

---

## 1. Problème

Le décideur veut **un point de départ unique par système**. Le cadrage de référence a tranché la
forme : un `.dmg` et un `.msi` qui **posent** une application d'installation (AR-B(a), AR-C(a)),
laquelle **enchaîne** les quatre étapes en s'appuyant sur le moteur du CLI, **sans jamais en être
une seconde implémentation** (AR-3).

Le moteur (lots A, C.1) est **livré et gaté PASS**. Le dépôt de l'application est **amorcé et
vide**. Ce lot doit donc produire **deux choses, et seulement deux** :

1. **C.2** — l'application Tauri qui met ce moteur en façade ;
2. **B′-a** — l'ossature de release à matrice 4 plateformes épinglée au SHA, **posée avec le
   squelette** parce que toute la convention de distribution dérive du `productName` de
   `tauri.conf.json`, qui n'existe qu'une fois l'app créée (§ 6.0 du cadrage de référence).

**L'obstacle mesuré ce jour, et il est structurel** : le moteur **ne parle qu'aux humains**. Il
n'expose ni événement d'étape, ni feu vert externe, ni provenance, ni rapport de rollback à un
programme (M-C1..M-C5). Une façade qui devrait afficher ces états n'a donc, aujourd'hui, que deux
voies : **parser de la prose française** — c'est-à-dire fabriquer, dans l'interface, une seconde
lecture de la logique, exactement le glissement que **R3** nomme — ou **ne pas piloter la chaîne**.

Ce cadrage refuse la première et organise la seconde.

---

## 2. Décision retenue

> **Le lot livre la coquille et son ossature de release, il ne livre PAS le pilotage de la chaîne,
> et il DIT pourquoi.**

Concrètement, et sous réserve des arbitrages du § 3 :

- **L'application Tauri existe, se build, s'ouvre, porte sa charte et annonce la chaîne** — les
  quatre étapes, les trois téléchargements (AR-A), ce que chacune fera, où, et ce qui sera fusionné.
- **`release.yml` est posé, matrice 4 plateformes, `tauri-action` épinglée au SHA**, avec le
  **cliquet** qui interdit de la dés-épingler en silence (copie de la convention L41).
- **L'action « Lancer l'installation » est présente et DÉSARMÉE**, et l'écran **nomme la cause** :
  le moteur n'offre pas encore de contrat machine permettant un feu vert par étape (AR-4).
  **Un bouton qui lancerait `--yes` serait pire que pas de bouton** : il livrerait un installeur
  qui saute **toutes** les validations, c'est-à-dire une violation d'AR-4 emballée dans une
  interface.

**Ce qui est écarté, avec son motif :**

| Écarté | Motif |
|---|---|
| **Parser la sortie humaine du CLI** pour en dériver les états d'étape | C'est **R3 réalisé** : la façade porterait une seconde lecture — donc une seconde implémentation — de la logique d'étape. Et une prose n'est pas un contrat : elle change au premier lot qui reformule un message. |
| **Piloter la chaîne via `--yes`** | Saute **toutes** les validations (`install.js:66`) ⇒ AR-4 nié. Le cadrage parent interdit nommément qu'un consentement donné pour `/usr/local/lib` couvre une écriture dans `~/.claude`. |
| **Piloter la chaîne dans un PTY** en émulant les réponses `o/N` | Ré-implémente un émulateur de terminal (le `PtyTerminal` du Cockpit) pour, au bout du compte, **lire de la prose** : cumule le coût de (1) et le défaut de R3. |
| **Réimplémenter une étape, même une seule, côté Tauri/Rust** | AR-3, sans appel. |
| **Monter `tauri-action` en `action-v1.0.0`** | Ferait diverger la 3ᵉ app des deux autres sur le point exact que L41 a verrouillé (M-R6, § 0.6). Successeur nommé `TAURI-ACTION-V1-POUR-LES-TROIS`. |
| **Inscrire `iakaInstall` au registre de convergence des sœurs** | C'est **B′-b** (§ 5.2 du cadrage de référence), et cela suppose de **modifier les deux dépôts frères** — ce qu'AR-E interdit à ce lot. |
| **i18n fr/en** | Sur-ingénierie pour un MVP d'installeur. **FR seul.** Successeur nommé `INSTALL-I18N`. |

**Quelle convention on copie, puisque les deux sœurs divergent (M-R6)** : **celle d'`IakaCockpit`**,
et le fichier le **déclare en tête** (dépôt source + commit de référence). Motif : c'est celle dont
le job `latest` et le cartouche L44 sont les plus à jour, et c'est celle dont les deux écarts connus
(dépendances Linux plus complètes) sont les **plus sûrs** — un runner Linux avec `cmake`/`pkg-config`
en trop ne casse rien, l'inverse casse un build.

**Isolation Docker : NON APPLICABLE, et c'est dit.** La convention permanente du portefeuille
(« une stack Docker par projet, ports hôte distincts ») vise les projets à runtime serveur.
`iakaInstall` est une **application de bureau** : aucun service, aucun conteneur, aucun port hôte
exposé. Le seul port du projet est celui du serveur de développement Vite, et il suit la même
discipline anti-collision : **3040** (M-R8 : 3020 et 3030 sont pris).

---

## 3. Arbitrages — ce que je ne peux pas trancher seul

*Chacun porte ma recommandation. Aucun n'est tranché ici.*

### AR-I1 — Quand la façade pilote-t-elle réellement la chaîne ?

Le contrat machine du moteur n'existe pas (M-C1..M-C5). Trois voies :

- **(a) Prérequis d'abord.** On cadre et on joue **d'abord** un lot côté `iakaframe`
  (`CONTRAT-MACHINE-DU-VERBE-INSTALL`), puis C.2 **en entier**. Coût : B′-a attend, alors que le
  cadrage de référence demande de la poser **avec** le squelette.
- **(b) C.2 scindé, et le prérequis en parallèle.** **Ce lot = C.2-a + B′-a** (coquille, charte,
  écran d'annonce, ossature de release, gardes) — qui **ne dépendent de rien**. Le prérequis CLI se
  cadre et se joue **en parallèle**, puis **C.2-b** (le pilotage réel) le consomme.
- **(c) La façade parse la prose.** Écarté au § 2.

> **Recommandation : (b).** Trois motifs. **(1)** Le squelette, la charte, `tauri.conf.json` et
> `release.yml` ne dépendent **d'aucun** contrat : les retarder ne rend rien plus sûr. **(2)** Le
> cadrage de référence exige explicitement que B′-a soit posée **avec** le squelette (§ 5.2, § 6.0)
> — (a) contredit cette dépendance sans rien gagner. **(3)** Le prérequis vit dans un **autre
> dépôt** : le jouer en parallèle ne partage ni branche ni index (une leçon déjà payée sur les
> sous-agents parallèles).
>
> **Ce que (b) coûte, dit franchement** : à la fin de ce lot, l'application **s'ouvre et n'installe
> rien**. C'est un livrable partiel, et l'écran doit le dire — jamais le laisser croire.

**Le prérequis, nommé et détaillé** — `CONTRAT-MACHINE-DU-VERBE-INSTALL`, dépôt `iakaframe`,
**à cadrer séparément, non cadré ici**. Ce qui manque, exactement :

1. **Émission d'un événement par étape**, portant au minimum : `etape` (1..4), `nom`, `quoi`, `ou`,
   `version`, `ceQuiSeraFusionne`, `source` (nommée), `etat` (`annoncee`/`confirmee`/`refusee`/
   `faite`/`echouee`/`sautee`). Aujourd'hui : **rien** (M-C1).
2. **Un canal de consentement non-TTY** : un moyen, pour un programme, de rendre un feu vert
   **par étape** — sans TTY, sans `--yes`. Aujourd'hui : **impossible** (M-C4).
3. **La provenance** (`reservoir.provenance`, M-E3) exposée en champ, pas en phrase.
4. **Le rapport de rollback** (`{ rapports, resume, defaits, nonDefaits }`, M-E2) exposé tel quel —
   il est **déjà structuré**, il ne manque que la sortie.
5. **L'état atteint et la commande de reprise** (CA-07) en champs.
6. **La levée de l'ambiguïté de `--json`** (M-C2) : soit il émet, soit il cesse de se dire « sortie
   machine ». Un drapeau qui promet ce qu'il ne fait pas est un mensonge vivant dans le code.

⚠️ **Une tension à trancher DANS ce lot-là, pas ici** : la convention C-JSON du CLI impose **une
racine objet, une seule impression** (`cli/src/lib/output.js:1-11`, règle 1). Un **flux**
d'événements par étape ne peut pas tenir dans une impression unique. Le lot prérequis devra donc
choisir entre un **canal distinct** (NDJSON sous un drapeau propre, `--events`) et une **extension
motivée** de C-JSON. **Ce choix est le sien** ; le noter ici évite qu'il soit tranché en silence
par le premier qui code.

### AR-I2 — Comment la façade atteint-elle le moteur ?

Cet arbitrage commande `tauri.conf.json` (clés `bundle.resources` ou `bundle.externalBin`), qui est
un fichier de **ce** lot : il se tranche maintenant, même si la plomberie n'est posée qu'en C.2-b.

- **(a) Sous-processus du CLI déjà installé** (`iakaframe install …` depuis le `PATH`).
  Zéro poids. **Mais impossible sur le chemin nominal** : le CLI est précisément **ce que l'étape 1
  installe** (AR-G, « le CLI ne peut pas s'installer lui-même »). La façade ne servirait qu'aux
  postes déjà équipés — ce qui vide le lot de son sens.
- **(b) Ressource embarquée + `node` de la machine.** Le tarball du CLI (ou `cli/` + `_bundled/`)
  est déclaré en `bundle.resources` de `tauri.conf.json` et exécuté par `node`. **Aucune chaîne de
  build neuve** : c'est une copie de fichiers. **Le prérequis Node n'est pas créé par ce choix** —
  il est **déjà inhérent au moteur**, dont l'étape 1 `spawn` littéralement `npm` (M-C7,
  `install.js:200`).
- **(c) Sidecar Tauri** (`bundle.externalBin` + `tauri-plugin-shell`) : un exécutable autonome du
  CLI (Node SEA), un par cible. Supprime le prérequis Node **pour la façade** — mais **pas pour
  l'étape 1**, qui appellera `npm` de toute façon. Et ouvre une **chaîne de build neuve, sur
  4 cibles**, exactement ce qu'AR-B(a) refusait pour le `.pkg`.

> **Recommandation : (b)**, avec le **prérequis Node ≥ 20 + npm DÉCLARÉ** dans l'application
> (détecté, nommé, et refusé en le disant s'il manque — jamais un plantage obscur).
> **(c) est nommé successeur** — `SIDECAR-CLI-AUTONOME` — et sa **condition d'entrée est une
> décision** : servir des postes **sans Node**. Tant que l'étape 1 appelle `npm`, (c) ne rachète
> qu'une moitié du problème pour le prix d'une chaîne de build complète.

### AR-I3 — Quelle charte visuelle ?

Dix chartes disponibles (§ 0.5). L'installeur est le **premier contact** avec le produit.

- **(a) `naonedge-dark`** — la marque assumée (dark + or `#c8a44e`), celle du Cockpit.
- **(b) `studio-clair`** — la charte des outils de dev, plus neutre, plus claire.
- **(c) La charte de l'OS** (`os-macos` sur macOS, `os-windows` sur Windows) — un installeur qui se
  fond dans son système.
- **(d) Toutes, avec un sélecteur** — comme le Cockpit.

> **Recommandation : (a) `naonedge-dark`, UNE seule charte, aucun sélecteur.** Motifs : **(1)**
> c'est le premier écran du produit, il doit dire **la marque**, pas se fondre ; **(2)** l'exécution
> doit être **moderne** — l'UI datée d'iakaIDE est l'anti-modèle, IakaCockpit la référence ;
> **(3)** (c) imposerait de tenir **deux** chartes et de les synchroniser à la plateforme, pour un
> écran qu'on voit trois minutes une fois dans sa vie ; **(4)** (d) est de la sur-ingénierie dans un
> installeur — le sélecteur du Cockpit existe parce qu'on y passe ses journées.
>
> **Dans tous les cas, le geste est le même et il est déjà écrit** : copier
> `IakaCockpit/scripts/sync-chartes.sh` (pont de 23 variables) et servir les tokens en `'self'`.
> **Ne jamais recopier des couleurs à la main dans le CSS de l'app** — le réservoir est
> `iakagraph/theme/`, et lui seul.
>
> **Icône de l'application** : dérivée de `iakagraph/theme/naonedge/dark/logos/naonedge-logo.svg`
> par `npm run tauri icon`. Une **marque propre à `iakaInstall`** serait un travail de 🎨 Loki, hors
> périmètre — successeur nommé `MARQUE-IAKAINSTALL`.

### AR-I4 — Le dépôt passe-t-il public maintenant ?

`specs/PROJET.md:199-201` le pose en question ouverte, à décider « quand la première release
approche ». **La mesure du § 0.6 déplace la question** :

- **Techniquement**, B′-a **fonctionne en privé** : Actions tourne sur un dépôt privé.
- **Économiquement**, non : un dépôt privé consomme le quota **2 000 min/mois**, et **macOS y est
  décompté ×10**. La matrice porte **deux** jobs macOS. Le workflow des sœurs porte déjà, en
  commentaire, la trace de cette douleur (M-R2 : « minutes macOS facturees 10x »).
- **Pour C.3**, c'est rédhibitoire : un inconnu ne télécharge pas l'asset d'une release privée.

> **Recommandation : passer public AVANT le premier run de B′-a.** Motifs : **(1)** Actions devient
> gratuit et illimité, la matrice cesse de coûter ; **(2)** les deux sœurs sont **déjà publiques**
> depuis le 2026-08-28 — la troisième app suit la convention ; **(3)** le dépôt est **neuf** : il ne
> porte aucun historique à auditer, et `.env` est ignoré (`.gitignore:2`).
> **Deux conditions, non négociables** : le passage public est un **acte du décideur** (refusé aux
> agents), et il est précédé d'un **balayage de secrets** sur l'arbre versionné — la commande est
> donnée en CA-I13. *(Rappel du portefeuille : `iakabox` est resté privé précisément parce qu'il
> portait des secrets en clair.)*
> **Ce que je ne peux pas mesurer** : la visibilité **actuelle** du dépôt `iakasju/iakaInstall`.
> Le remote existe (`.git/config:15`) ; son état sur GitHub demande un appel authentifié que je
> n'ai pas joué. **Déclaré non mesuré.**

---

## 4. Périmètre

### Inclus

1. **Le squelette de l'application Tauri 2** : `package.json`, `tsconfig.json`, `vite.config.ts`,
   `eslint.config.js`, `index.html`, `src/`, `src-tauri/` — stack **répliquée** de M-R7, **sans
   dérive de version**.
2. **`productName` = `iakaInstall`**, gardé par un test (il commande vitrine, manifeste et noms
   d'artefacts — `specs/PROJET.md:171-177`).
3. **La charte** (AR-I3) : script de synchronisation copié du Cockpit, tokens servis en `'self'`,
   CSP stricte, icônes générées.
4. **L'écran d'annonce** : « 4 étapes / 3 téléchargements » (AR-A), ce que chaque étape fera, où, et
   ce qui sera fusionné. **Aucun écran ne dit « trois installations »** (CA-19 du cadrage).
5. **La déclaration honnête de ce qui n'est pas là** : l'action de lancement **désarmée** et sa
   **cause nommée** ; les prérequis (Node ≥ 20 + npm) **détectés et dits** ; la couverture réelle
   des étapes 3/4 (**macOS seul**, M-C6) **affichée, jamais simulée**.
6. **B′-a** : `.github/workflows/release.yml` — matrice 4 plateformes, `tauri-action` **épinglée au
   SHA**, `includeUpdaterJson: false`, job `latest`, plus le **cliquet** `fixtures/tauri-action-pin.json`
   et ses tests.
7. **Les gardes de ce lot**, chacune avec **son contrefactuel** (§ 8).
8. **`CLAUDE.md` du projet, rempli** — stack réelle et **commandes réellement exposées**
   (l'invariant du dépôt frère : une commande documentée mais inexistante est pire qu'absente).
9. **`specs/PROJET.md`** : mise à jour de la seule section « ⬜ Ce qui reste à décider ».

### Exclu — décisions, pas oublis

| Exclu | Motif | Successeur |
|---|---|---|
| **Le pilotage réel de la chaîne** | Le contrat machine n'existe pas (M-C1..M-C5) | **C.2-b**, après `CONTRAT-MACHINE-DU-VERBE-INSTALL` |
| **Toute modification de `iakaframe`** | Ce lot vit dans `iakaInstall` ; le prérequis est un **autre lot, autre dépôt, autre cadrage** | `CONTRAT-MACHINE-DU-VERBE-INSTALL` |
| **C.3** — première release, `.dmg`, `.msi`, les 5 autres artefacts | § 6.0 : après C.2. Et **produire un `.msi` est impossible sur ce poste** (macOS) | lot C.3 |
| **B′-b** — vitrine, `vitrine-locale`, `updater/latest.json`, registre de canaux, convergence à trois frères | § 5.2 : **mesurable seulement après une release réelle** ; avant elle, la face en ligne ne peut rendre qu'un `SKIP`, c'est-à-dire **aucune preuve** | lot B′-b |
| **La notarisation Apple** | AR-D(b) : dépendance déclarée, et l'étape CI vit dans C.3 | — |
| **La désinstallation** · la mise à jour des 4 composants en une passe | Autre verbe, à cadrer séparément (cadrage de référence § 5.3) | — |
| **L'auto-update de `iakaInstall` lui-même** (`plugins.updater`) | Sans manifeste ni release, la clé serait un endpoint qui pointe le vide. Vient avec B′-b | lot B′-b |
| **Toute modification de `IakaCockpit` / `iakaFrameGUI`** | **AR-E**, sans exception. Le cliquet `fixtures/convergence.sha256` des sœurs **ne bouge pas** | B′-b |
| **i18n** · sélecteur de charte · marque propre | MVP | `INSTALL-I18N`, `MARQUE-IAKAINSTALL` |
| **Épingler `checkout`/`setup-node`/`rust-toolchain`/`rust-cache`** | CA-20 ne demande que `tauri-action` (M-R3). L'étendre serait un « tant qu'on y est » — et devrait se faire **sur les trois dépôts** | — |
| **`tauri-action@action-v1.0.0`** | § 0.6 | `TAURI-ACTION-V1-POUR-LES-TROIS` |
| **Isolation Docker** | **Non applicable** : app de bureau, aucun service, aucun port hôte | — |

---

## 5. Étapes d'implémentation, ordonnées

**Étape 1 — Vérifier les quatre faits qui commandent tout le lot (avant d'écrire une ligne).**
Je n'avais pas de shell (§ 0.1). Ces mesures sont **dues**, et leur sortie est à **citer** :

```bash
cd ~/work/iakaframe
node cli/src/index.js install --dry-run --json --root . --target-claude /tmp/x --apps-dir /tmp/x | head -3
node cli/src/index.js install --dry-run --json --root . 2>&1 | grep -c '^{'   # attendu : 0
grep -n "install" cli/test/guard-json-output.test.js                          # attendu : rien dans NOMINAL
```

**Si l'une de ces mesures contredit M-C1..M-C4, ARRÊTER et remonter à 🔵 Gandalf** : le § 2 et
l'AR-I1 reposent dessus, et une instruction qui repose sur un fait faux se re-cadre, elle ne
s'exécute pas.

**Étape 2 — Le squelette.** `npm create tauri-app` **n'est pas** l'outil : on **réplique la stack
mesurée** (M-R7), versions comprises, en copiant la configuration d'`IakaCockpit`
(`package.json` sans les dépendances qui ne servent pas ici — ni xterm, ni i18next, ni les plugins
dialog/process/updater). `devUrl` = **`http://localhost:3040`** (M-R8). `identifier` =
`com.iakateam.iakainstall` (calque de `com.iakateam.iakacockpit`).

**Étape 3 — `tauri.conf.json`.** `productName: "iakaInstall"` (figé), `bundle.active: true`,
`bundle.targets: "all"`, CSP **stricte** copiée de M-R9, `dragDropEnabled: false` (piège WebView2
connu du portefeuille). **Ne pas poser `plugins.updater`** (exclu, B′-b). **Ne pas poser
`createUpdaterArtifacts`** pour la même raison — il exigerait les deux secrets de signature au
build local, ce qui bloquerait CA-I2.

**Étape 4 — La charte (AR-I3).** Copier `IakaCockpit/scripts/sync-chartes.sh`, le restreindre à la
charte tranchée, générer `src/assets/chartes/{chartes.css, manifest.ts}`. Icônes :
`npm run tauri icon <logo du réservoir>`.

**Étape 5 — L'écran.** Une page, lue de haut en bas : le comptage **4 étapes / 3 téléchargements**,
les quatre étapes annoncées (quoi / où / ce qui sera fusionné), les **prérequis détectés**, la
**couverture réelle** des étapes 3/4, et l'action de lancement **désarmée avec sa cause nommée**.
**Aucune donnée fabriquée** : ce qui n'est pas obtenable du moteur ne s'affiche pas.

**Étape 6 — La façade d'appel, vide mais posée.** `src/api/backend.ts` = **point d'`invoke` unique**
(convention D7 des sœurs), avec **zéro** commande métier pour l'instant. C'est la couture par
laquelle C.2-b passera, et le seul endroit où la garde du § 8 tolérera le vocabulaire du moteur.

**Étape 7 — B′-a, `release.yml`.** Copier celui d'`IakaCockpit` (M-R6 : **déclarer la source et le
commit en tête du fichier**), en retirant ce qui ne s'applique pas à un dépôt sans manifeste.
Conserver **verbatim** : le job `prepare` et sa matrice à 4 clés, l'épinglage
`@84b9d35b5fc46c1e45415bdb6144030364f7ebc5 # action-v0.6.2`, `includeUpdaterJson: false` et son
motif, le job `latest` et son cartouche.

**Étape 8 — Le cliquet du pin.** Copier `fixtures/tauri-action-pin.json` et son test
(`scripts/__tests__/pin-tauri-action.test.mjs`). **Le contrefactuel se joue TOUJOURS dans la
fixture, jamais dans le workflow** (discipline L41).

**Étape 9 — Les gardes du lot** (§ 8), chacune **éprouvée par une mutation qui la fait rougir
nommément**, la mutation portant sur **le programme** (jamais sur l'attendu) et **révoquée avec
preuve au `sha256`**.

**Étape 10 — `CLAUDE.md`**, rempli : stack réelle, commandes **réellement exposées**, backlog
pointant les successeurs nommés ici.

**Étape 11 — Remise au gate 🏹 Legolas.** Jamais d'auto-validation. Le tableau de verdict porte
**une ligne par commande**, avec son code de sortie et son chiffre.

---

## 6. Fichiers concernés

**Dépôt `iakaInstall` — tout ce que ce lot écrit y est :**

| Chemin | Ce qui change |
|---|---|
| `package.json`, `package-lock.json` | **neufs** — stack M-R7 répliquée ; scripts `dev`/`build`/`typecheck`/`lint`/`test`/`tauri`/`chartes` |
| `index.html`, `vite.config.ts` (port **3040**), `tsconfig.json`, `eslint.config.js` | **neufs** |
| `src/main.tsx`, `src/App.tsx` | **neufs** — l'écran d'annonce |
| `src/api/backend.ts` | **neuf** — point d'`invoke` **unique**, vide de métier |
| `src/assets/chartes/{chartes.css, manifest.ts}` | **générés** par le script, jamais édités à la main |
| `scripts/sync-chartes.sh` | **copié** d'`IakaCockpit` |
| `src-tauri/{Cargo.toml, build.rs, tauri.conf.json, src/main.rs, src/lib.rs, capabilities/default.json, icons/}` | **neufs** — `productName` figé, CSP stricte, **ni updater ni createUpdaterArtifacts** |
| `.github/workflows/release.yml` | **neuf (B′-a)** — matrice 4 plateformes, SHA épinglé, `includeUpdaterJson: false`, job `latest` |
| `fixtures/tauri-action-pin.json` | **neuf** — cliquet du pin |
| `scripts/__tests__/*.test.mjs` | **neufs** — pin, nom de produit, façade-sans-logique, commandes documentées, CSP |
| `.gitignore` | `dist/`, `src-tauri/target/` (déjà couverts par `build/`+`target/` — **vérifier, ne pas dupliquer**) |
| `CLAUDE.md` | **rempli** |
| `specs/PROJET.md` | **section « ⬜ Ce qui reste à décider » seule** |

**Dépôt `iakaframe`** — **rien.** Le prérequis est un lot distinct, cadré ailleurs.

**Dépôts `IakaCockpit` / `iakaFrameGUI`** — **rien, et c'est AR-E.** On y **lit** (`release.yml`,
`sync-chartes.sh`, `pin-tauri-action`), on n'y **écrit** pas. Le cliquet `fixtures/convergence.sha256`
des deux sœurs **ne bouge pas** : le passage à trois frères est **B′-b**.

**Réservoir `iakagraph`** — **lecture seule** (`theme/<charte>/{tokens.css, logos/*.svg}`).

---

## 7. Risques

| # | Risque | Mitigation |
|---|---|---|
| **R3** *(hérité, en tête)* | **La façade devient une seconde implémentation.** Un état, une décision, un message n'existent que dans l'interface. AR-3 le nomme ; **rien ne l'empêche mécaniquement**. | **Deux gardes, pas une.** (1) **Maintenant** : une **garde de vocabulaire** balaye `src/` et `src-tauri/src/` sur les motifs du moteur (`install.mjs`, `minisign`, `_bundled`, `rollback`, `npm install -g`, `.app.tar.gz`, `apps-dir`, `latest.json`, `192.168.1.139`, `raw.githubusercontent`, `[1/4]`, `dW50cnVzdGVk`) et **refuse** toute occurrence hors du point d'`invoke` unique, avec un **registre de hors-couverture déclaré et motivé** — jamais une liste muette. (2) **En C.2-b** : le test qui **rejoue la chaîne sans interface** et compare l'état affiché à l'état obtenu en CLI, **champ par champ**. → **CA-I8a**, **CA-I8b**. |
| **R-I1** | **Le prérequis CLI n'est jamais joué**, et l'application reste une coquille indéfiniment. Le lot aurait alors livré un dépôt de plus à tenir, pour rien. | Le prérequis est **nommé, détaillé point par point** (§ 3, AR-I1) et **chiffré** (§ 9). L'écran **dit** qu'il manque : une coquille qui s'annonce comme telle se referme ; une coquille qui se tait devient une dette silencieuse. |
| **R-I2** | **Un `.msi` amorce une application qui refusera la moitié de la chaîne.** Les étapes 3/4 ne couvrent que macOS (M-C6). L'utilisateur Windows — celui pour qui AR-C(a) a été tranché — obtient CLI + méthode, puis deux refus. | **L'application AFFICHE la couverture réelle, par plateforme, avant de proposer quoi que ce soit** (CA-I10). Jamais une simulation, jamais un silence. **Successeur nommé côté CLI** : `ETAPES-3-4-WINDOWS-LINUX` — sa condition d'entrée est une **recette réelle** sur ces machines (§ 10 du cadrage de référence), pas du code. |
| **R-I3** | **La chaîne présuppose `npm`** (M-C7), qu'un poste « qui n'a rien » n'a pas. La promesse « un fichier, un double-clic » est donc, aujourd'hui, **conditionnelle**. | **Détecter et dire**, jamais planter (CA-I11). Le remède de fond est AR-I2(c) **plus** un mode d'étape 1 qui ne dépende pas de `npm` — deux décisions, aucune de ce lot. |
| **R-I4** | **`--json` promet une sortie machine qui n'existe pas** (M-C2). Le prochain qui code la façade croira le registre, perdra une journée, ou pire : parsera la prose « en attendant ». | Écrit ici en § 0.3 **et** inscrit au point 6 du prérequis. **Un drapeau qui ment est un défaut, même quand il ne casse rien.** |
| **R-I5** | **Faux vert de la garde de vocabulaire.** Si le motif ne peut rien matcher par construction, la garde est verte **et aveugle** — le témoin vide déjà payé deux fois dans ce portefeuille (F-1/L42). | **Contrefactuel obligatoire** : introduire une comparaison de version dans le front **doit** faire rougir la garde nommément. Plus un **cliquet de complétude** : le nombre de motifs ne descend que **dans le commit qui le décide**. |
| **R-I6** | **La convergence des trois `release.yml`** — ils divergent **déjà à deux** (M-R6). Un troisième fichier « copié » sans dire **de qui** installe la dérive au jour 1. | Le fichier **déclare sa source et son commit** en tête. **Ne pas aligner les sœurs en passant** : `CONVERGENCE-RELEASE-YML-ALIGNEMENT` est un lot à part, et le toucher ici violerait AR-E. |
| **R-I7** | **Le quota Actions** : sur un dépôt privé, deux jobs macOS décomptés ×10 vident 2 000 minutes vite. | AR-I4 : passer public **avant** le premier run. En attendant, `workflow_dispatch` avec sélecteur de plateformes (M-R2) permet de ne construire que Linux. |
| **R-I8** | **Le job `latest` est inerte et donc non éprouvé** : sans release, il sort en succès en le disant (M-R5). On croira l'avoir gardé. | **Déclaré tel** : sa première exécution utile est en **C.3**. Aucun critère de ce lot ne suppose son effet — seulement sa **présence conforme** (CA-I7). |

---

## 8. Critères d'acceptation

> **Règle du lot, non négociable** : chaque critère se vérifie **par une commande ou un
> `fichier:ligne`**, jamais par une lecture d'intention. Chaque **garde** porte son
> **contrefactuel** — une mutation du **programme** (jamais de l'attendu) qui la fait **rougir
> nommément**, puis est **révoquée avec preuve au `sha256`**. *Une garde qui ne peut pas rougir
> n'est pas une garde.*
>
> **Correspondance avec le cadrage de référence** : relèvent de **ce lot** les critères **CA-19**
> (comptage affiché → CA-I9) et **CA-20** (pin au SHA → CA-I3/CA-I4). Restent à **C.3** :
> **CA-16** (le `.dmg` arm64 buildé se monte et se lance), **CA-17** (les sept artefacts ou leur
> absence déclarée), **CA-18** (notarisation AR-D(b)). Aucun critère ci-dessous ne les suppose.

- [ ] **CA-I1 — Le nom du produit est figé ET gardé.**
      `src-tauri/tauri.conf.json` porte `"productName": "iakaInstall"`, à la casse près.
      **Vérif** : `npm run test` (test `nom-produit`).
      **Contrefactuel** : le passer à `iakainstall` ⇒ le test rougit **en nommant le champ et les
      deux valeurs**. *(Il commande vitrine, manifeste et noms d'artefacts — `specs/PROJET.md:171-177`.)*

- [ ] **CA-I2 — L'application se build sur ce poste et produit un `.app` arm64.**
      **Vérif** : `npm ci` puis `npm run tauri build -- --target aarch64-apple-darwin` ⇒ code **0**,
      et `ls -d src-tauri/target/aarch64-apple-darwin/release/bundle/macos/iakaInstall.app` ⇒ le
      chemin existe. **Le build ne doit exiger AUCUN secret** (c'est pourquoi
      `createUpdaterArtifacts` est exclu).
      *(Les trois autres OS : gate humain, § « Ce qui n'est pas prouvable ici ».)*

- [ ] **CA-I3 — `tauri-action` est épinglée au SHA, jamais un tag flottant.**
      **Vérif** : `grep -n 'tauri-apps/tauri-action@' .github/workflows/release.yml` ⇒ **exactement
      une** ligne, portant `@84b9d35b5fc46c1e45415bdb6144030364f7ebc5 # action-v0.6.2` ; et
      `grep -c 'tauri-action@v' .github/workflows/release.yml` ⇒ **0**.
      **Contrefactuel** : remettre `@v0` ⇒ le test du pin rougit nommément. *(= CA-20.)*

- [ ] **CA-I4 — Le cliquet du pin existe, et il interdit une levée muette.**
      `fixtures/tauri-action-pin.json` porte le **SHA**, le `sha256` de l'`action.yml` **lu à ce
      SHA**, les entrées **déclarées** (`includeUpdaterJson`), les entrées **vérifiées absentes**
      (`uploadUpdaterJson`, `uploadUpdaterSignatures`), et l'**ordre de re-lire `action.yml` au
      nouveau SHA** avant toute levée.
      **Vérif** : `npm run test` (test `pin-tauri-action`).
      **Contrefactuel** : muter le SHA **dans la fixture** ⇒ rouge nommé. *(La mutation ne touche
      jamais le workflow — discipline L41.)*

- [ ] **CA-I5 — La matrice porte les quatre plateformes, et seulement elles.**
      **Vérif** : dans le job `prepare`, le JSON `ALL` porte exactement les clés `macos-arm64`,
      `macos-x64`, `linux`, `windows` ; `grep -c '"key":"' .github/workflows/release.yml` ⇒ **4**.
      **Contrefactuel** : en retirer une ⇒ le test de matrice rougit **en nommant la clé absente**.

- [ ] **CA-I6 — `includeUpdaterJson: false` est posé, avec son motif.**
      **Vérif** : `grep -n 'includeUpdaterJson' .github/workflows/release.yml` ⇒ une ligne à
      `false`, et le motif est **écrit dans le fichier** (le manifeste qui fera autorité est
      `updater/latest.json`, B′-b). **Contrefactuel** : `true` ⇒ le test rougit.

- [ ] **CA-I7 — Le job `latest` est présent et conforme à la convention copiée.**
      **Vérif** : le job existe, porte `if: always()`, lit `repos/<depot>/releases` (**pas** les
      tags), exclut brouillons et préversions, et **sort en succès en le disant** quand aucune
      release n'existe. Empreinte du bloc comparée à celle d'`IakaCockpit@main` par le geste
      **existant** (`scripts/lib/bloc-latest.mjs`, extraction par marqueur), copié.
      **Contrefactuel** : muter un octet du bloc ⇒ la garde d'empreinte rougit **en nommant le
      fichier**.
      **⚠️ Déclaré non couvert** : l'**effet** du job. Sans release, il ne peut rien désigner
      (R-I8). Sa première exécution utile est en **C.3**.

- [ ] **CA-I8a — La façade ne porte AUCUNE logique du moteur (garde de vocabulaire).**
      Un test balaye `src/` et `src-tauri/src/` sur un **registre de motifs versionné** —
      `install.mjs`, `_bundled`, `minisign`, `rollback`, `npm install -g`, `.app.tar.gz`,
      `apps-dir`, `latest.json`, `192.168.1.139`, `raw.githubusercontent`, `dW50cnVzdGVk`,
      `[1/4]`, `réservoir :` — et **refuse** toute occurrence hors du point d'`invoke` unique.
      Le **hors-couverture est déclaré et motivé** dans le registre, jamais tacite.
      **Vérif** : `npm run test`.
      **Contrefactuel** : écrire une comparaison de version ou un endpoint dans un composant
      ⇒ rouge **nommant le fichier et le motif**.
      **Cliquet de complétude** : le nombre de motifs du registre **ne descend que dans le commit
      qui le décide** ; le test l'asserte.

- [ ] **CA-I8b — *(C.2-b — DÉCLARÉ NON COUVERT PAR CE LOT, et il faut le lire ainsi)*.**
      Le test qui **rejoue la chaîne sans interface** et compare, **champ par champ**, l'état
      affiché par la façade à l'état rendu par le CLI. **Il est structurellement impossible
      aujourd'hui** : le CLI ne rend aucun champ (M-C1). **Ce critère n'est pas « à faire plus
      tard » par confort — il est bloqué par un fait mesuré**, et il est la vraie mitigation de R3.

- [ ] **CA-I9 — Le comptage d'AR-A est affiché, et rien ne dit « trois installations ».**
      **Vérif** : `grep -rn "4 étapes" src/` ⇒ au moins une occurrence, associée à
      « 3 téléchargements » ; et `grep -rniE "(trois|3) installations" src/` ⇒ **0**.
      **Contrefactuel** : écrire « 3 installations » dans un écran ⇒ le test rougit **en citant la
      ligne**. *(= CA-19.)*

- [ ] **CA-I10 — La couverture réelle est affichée, jamais simulée.**
      L'écran indique, **par plateforme**, que les étapes 3 et 4 ne sont couvertes **que sur
      macOS** (M-C6), et **n'annonce jamais** une étape comme faite sans preuve.
      **Vérif** : test de rendu sur une plateforme simulée non couverte ⇒ l'écran porte le refus.
      **Contrefactuel** : faire afficher un succès sur cette plateforme ⇒ rouge nommé.

- [ ] **CA-I11 — L'action de lancement est désarmée, et sa cause est nommée à l'écran.**
      Le bouton existe, est **inactif**, et l'écran dit **pourquoi** (le moteur n'expose pas encore
      de feu vert par étape) **et ce qui manque** (le prérequis nommé).
      **Vérif** : test de rendu (bouton `disabled`, texte de cause présent) ; et
      `grep -rn "'--yes'\|\"--yes\"" src/ src-tauri/src/` ⇒ **0**.
      **Contrefactuel** : activer le bouton, ou introduire `--yes` ⇒ rouge nommé.
      *C'est le critère qui empêche ce lot de livrer une violation d'AR-4 emballée dans une
      interface.*

- [ ] **CA-I12 — Les prérequis de la machine sont détectés et dits, jamais supposés.**
      L'application affiche l'état de **Node ≥ 20** et de **npm** (M-C7) ; leur absence est
      **nommée**, jamais un plantage ni un silence.
      **Contrefactuel** : simuler `npm` absent ⇒ l'écran le dit ; supprimer la détection ⇒ le test
      rougit.

- [ ] **CA-I13 — Aucun secret dans l'arbre versionné (préalable à AR-I4).**
      **Vérif** : `git ls-files -z | xargs -0 grep -nIE
      '(BEGIN [A-Z ]*PRIVATE KEY|FORGEJO_TOKEN=|GITHUB_TOKEN=|TAURI_SIGNING_PRIVATE_KEY=["'\''][^$])'`
      ⇒ **aucune** ligne. `git ls-files | grep -c '^\.env$'` ⇒ **0**.
      *(Le jeton lisible dans `.git/config:9` n'est pas versionné — `.git/` ne part pas au push.)*
      **Le passage public reste un acte du décideur**, jamais d'un agent.

- [ ] **CA-I14 — La doc du projet ne promet aucune commande inexistante.**
      Chaque commande citée dans `CLAUDE.md` existe dans `package.json`.
      **Vérif** : `npm run test` (test `commandes-documentees`).
      **Contrefactuel** : documenter `npm run inexistant` ⇒ rouge **en nommant la commande**.
      *(Invariant repris verbatim d'`iakaFrameGUI/CLAUDE.md` : « une commande documentée mais
      inexistante est pire qu'absente ».)*

- [ ] **CA-I15 — Les dépôts frères ne sont pas touchés (AR-E).**
      **Vérif** : `git -C ~/work/IakaCockpit status --porcelain` et
      `git -C ~/work/iakaFrameGUI status --porcelain` ⇒ **vides** ; et
      `git -C ~/work/iakaframe status --porcelain` ⇒ **vide**.
      *Le cliquet `fixtures/convergence.sha256` des deux sœurs garde son compte : le passage à trois
      frères est **B′-b**.*

- [ ] **CA-I16 — La chaîne qualité est verte, ligne par ligne.**
      **Vérif** — un tableau, **une ligne par commande**, avec **son** code de sortie et **son**
      chiffre : `npm run typecheck` · `npm run lint` · `npm run test` · `cargo test` (dans
      `src-tauri/`). **Une formule d'ensemble (« tout est vert », « les suites complètes ») vaut
      FAIL** ; un critère **non mesuré** se déclare *non mesuré*, jamais *PASS*.

### Ce qui n'est PAS prouvable ici — gate humain, DÉCLARÉ

*Précédent AR-6, tenu à la lettre : « buildé ne vaut pas recetté ». **Aucun critère ci-dessus ne
suppose ces mesures.***

| Prouvable sur ce poste (macOS arm64) | Prouvable en CI seulement | Exige une machine absente |
|---|---|---|
| build local de l'app, `.app` arm64 (CA-I2) · toutes les gardes (CA-I1, CA-I3..CA-I15) · la chaîne qualité (CA-I16) | le build **Windows**, **Linux** et **macOS Intel** de la matrice · la production du `.msi`, du `.exe` NSIS, du `.deb`, du `.rpm`, de l'AppImage · l'effet du job `latest` (C.3) | **recette réelle** Windows · **recette réelle** Linux · **recette réelle** macOS Intel · comportement réel de Gatekeeper |

**Actes refusés aux agents, appartenant au décideur** : passer le dépôt public (AR-I4), pousser un
tag, créer une release, poser un secret dans les réglages d'un dépôt.

---

## 9. Estimation *(ordre de grandeur assumé et révisable — pas un engagement ferme)*

| Bloc | j-homme | Complexité / risque | Inconnues |
|---|---|---|---|
| **C.2-a — squelette Tauri + charte + écran d'annonce** | **1,0** | faible | aucune technique : la stack est **mesurée** (M-R7) et se réplique. Le seul aléa est la génération d'icônes et le premier `cargo build` (télécharge la chaîne Rust). |
| **B′-a — ossature de release + cliquet du pin** | **0,5** | faible | **copie** d'une convention éprouvée (M-R1..M-R5). Surcoût réel vs les 0,25 j du cadrage parent : le cliquet `tauri-action-pin` et la garde du bloc `latest` n'existaient pas quand ce chiffre a été posé. |
| **Les gardes + leurs contrefactuels** | **0,5** | **moyenne** | la garde de vocabulaire (CA-I8a) est la seule pièce **neuve** du lot : il faut qu'elle **puisse rougir** (R-I5), et un témoin vide a déjà été payé deux fois dans ce portefeuille. |
| **TOTAL de CE lot (C.2-a + B′-a)** | **≈ 2,0** *(fourchette 1,5 – 3)* | | |
| *(prérequis, **autre dépôt**, **NON COMPTÉ** ici)* `CONTRAT-MACHINE-DU-VERBE-INSTALL` | *≈ 1,5* | **forte** | la tension C-JSON (règle « une racine, une impression ») face à un **flux** d'événements ; et le **canal de consentement non-TTY**, qui n'a aucun précédent dans ce CLI. **À cadrer avant d'être chiffré fermement.** |
| *(successeur, **NON COMPTÉ**)* **C.2-b — le pilotage réel** | *≈ 1,5* | moyenne | conditionné au prérequis ; porte CA-I8b, la vraie mitigation de R3. |

**Réconciliation avec l'estimation parente, et elle est due.** Le cadrage de référence chiffrait le
lot **C entier** (moteur + façade + amorçage) à **5 j**, dont C.1 est livré. Il restait donc
implicitement **≈ 2 à 2,5 j** pour C.2 + C.3. **Ce lot en consomme 2 pour la seule coquille**, et
**ajoute 3 j non prévus** (prérequis + pilotage). **L'écart a une cause unique et mesurée** : le
cadrage parent supposait un moteur offrant un contrat à mettre en façade ; **la mesure du 2026-09-04
montre qu'il n'en offre aucun** (M-C1..M-C5). Ce n'est pas un dépassement, c'est **une hypothèse
fausse rendue visible avant d'avoir coûté**.

**Les trois inconnues qui peuvent faire glisser ce chiffre, nommées :**
1. **La forme du contrat machine** (AR-I1). Tant qu'elle n'est pas tranchée, C.2-b n'est chiffrable
   qu'en ordre de grandeur.
2. **La couverture Windows/Linux des étapes 3/4** (R-I2). Si le décideur veut que le `.msi` d'AR-C
   installe vraiment les deux applications, c'est un **lot CLI supplémentaire**, non chiffré ici,
   et sa condition d'entrée est une **recette réelle** sur ces machines.
3. **La visibilité du dépôt** (AR-I4). En privé, chaque run complet de la matrice consomme du
   quota à ×10 sur macOS : le coût n'est pas en jours-homme, mais il est réel.

---

## Sources externes, vérifiées le 2026-09-04

- Tauri — versions du cœur (2.11.5, 2026-07-01) : <https://tauri.app/release/core/>
- Tauri 2 — prérequis / MSRV 1.77.2 : <https://v2.tauri.app/start/prerequisites/> et
  <https://github.com/tauri-apps/tauri/pull/11205>
- `tauri-apps/tauri-action` — releases : <https://github.com/tauri-apps/tauri-action/releases>
- `tauri-apps/tauri-action` — SHA des tags (`action-v0.6.2` = `84b9d35b…`, `action-v1.0.0` =
  `1deb371b…`) : <https://api.github.com/repos/tauri-apps/tauri-action/tags>
- GitHub Actions — facturation (public = gratuit et illimité ; privé = 2 000 min/mois, macOS ×10) :
  <https://docs.github.com/en/actions/concepts/billing-and-usage> et <https://github.com/pricing>
