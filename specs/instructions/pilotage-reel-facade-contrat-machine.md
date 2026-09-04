# C.2-b — Le pilotage réel de la façade par le contrat machine du CLI

> Cadré par 🔵 **Gandalf**, le **2026-09-05**, sur ordre de mission de 🟠 Aragorn.
> **Lecture seule** sur tout le code pendant le cadrage. Le seul fichier écrit par ce cadrage est
> celui-ci.
>
> **Cadrages de référence, qui font foi et ne sont pas rediscutés ici** :
> `iakaInstall/specs/instructions/facade-installeur-tauri-ossature-release.md` — **AR-I1(b)**
> (C.2 scindé : la coquille d'abord, le pilotage après le prérequis CLI) · **AR-I2(b)** (ressource
> Node embarquée) · **AR-I3(b)** (`studio-clair`, une seule charte) · **R3** (la façade n'est jamais
> une seconde implémentation) · **CA-I8a/I8b, CA-I9, CA-I10, CA-I11, CA-I12**.
> `iakaframe/specs/instructions/contrat-machine-du-verbe-install.md` — **AR-M1(a)** (feu vert
> ligne-par-ligne sur `stdin`) · **AR-M2(a)** (`--json` bufferisé, C-JSON) · **AR-M3(a)** (flux
> NDJSON sous `--events`, sous-processus capturés) · **R-M4** (« que l'humain VOIE l'annonce est un
> critère de C.2-b, jamais supposé tenu par le CLI »).
> `iakaframe/specs/instructions/chaine-complete-install-amorcage-dmg-msi.md` — **AR-3**, **AR-4**,
> **AR-5**, **AR-F**, **AR-G**.
>
> ⚠️ **Ce lot est le premier où la façade ÉCRIT sur la machine de l'utilisateur** — par délégation,
> jamais de sa propre main. Tout ce qui suit est ordonné par cette phrase : le consentement par
> étape (AR-4) cesse d'être une promesse d'écran et devient un protocole ; et **R-M4 nous est
> explicitement légué** — le CLI garantit qu'il demande, **nous** devons garantir que l'humain voit
> ce qu'il accorde.

---

## 0. Ce qui a été mesuré le 2026-09-05

### 0.1 — Instruments, et leur limite déclarée

- **Lecture de fichiers** (`Read`, `Grep`, `Glob`) sur `~/work/iakaInstall` et `~/work/iakaframe`.
- **Vérification web** pour les faits externes qui commandent une décision de forme (Tauri 2, plugin
  shell, ressources embarquées) — sources datées en fin de document.
- ❌ **Aucun shell dans cette session de cadrage.** Je n'ai joué **aucune** commande : ni
  `install --events`, ni `npm pack`, ni `cargo test`, ni `git`. **Je le déclare plutôt que de citer
  des sorties que je n'ai pas produites.** Conséquence exacte, et elle est bornée : tous les faits
  **M-C\*** et **M-F\*** ci-dessous sont établis **par lecture du code sur le disque**, chacun avec
  son `fichier:ligne` ; les faits **d'exécution** que je cite sont **attribués** (§ 0.2) et signalés
  comme tels. Les commandes qui transformeraient cette section en mesures d'exécution sont données
  à l'**étape 0** du § 5 : c'est le premier geste demandé à ⚒️ Gimli, avant d'écrire une ligne.
- ⚠️ **Seconde limite, sur l'état du dépôt `iakaframe`.** Un ⚒️ Gimli y travaille en parallèle sur
  la branche `fix/etapes-faites-dry-run` ; **je n'ai pas pu jouer `git show main:<chemin>`** (pas de
  shell). J'ai donc lu **les fichiers tels qu'ils sont sur le disque**, sans savoir si l'arbre est
  propre ni quelle branche est sortie. **Cela n'invalide rien** — le contrat lu est cohérent avec le
  test qui le spécifie et avec le rapport de gate — mais **un fait précis en dépend et il est
  isolé : M-C8.** Il est traité comme incertain, et la décision du § 2 est construite pour ne pas en
  dépendre.

### 0.2 — Les faits d'exécution, attribués

*Aucun n'est de moi. Chacun porte sa source, et aucune décision de ce cadrage ne repose sur eux
seuls : ils **corroborent** des faits de lecture, ils ne les remplacent pas.*

- **X-1 — Un flux réel `install --dry-run --events` fait 74 lignes, 0 non-JSON, dernière ligne
  `evt:"fin"`.** Mesuré par 🏹 Legolas au gate du contrat machine
  (`iakaframe/docs/qualite/gate-contrat-machine-install.md`, tableau des commandes).
- **X-2 — Le paquet publié porte bien le moteur complet.** `npm pack` réel sur copie isolée :
  tarball `naonedge-iakaframe-0.39.0.tgz`, **551 entrées**, `_bundled/install.mjs` identique octet
  pour octet à `install.mjs` racine, `_bundled/kits/**` présent
  (`iakaframe/docs/qualite/gate-bundle-install-mjs-embarque.md`).
- **X-3 — La coquille C.2-a est gatée PASS**, garde de vocabulaire **à deux jambes** (source +
  rendu) après un premier gate FAIL (`iakaInstall/docs/qualite/gate-facade-tauri-ossature-release.md`
  puis `-2.md`). **CA-I8b y est déclaré NON COUVERT** — c'est ce lot qui doit le couvrir.
- **X-4 — Le contrat machine est gaté PASS avec un écart non bloquant, nommé** : la sémantique de
  `etatAtteint.etapesFaites` en `--dry-run`. Le rapport écrit textuellement qu'il faut la documenter
  « avant que C.2-b (façade) ne consomme ce champ pour bâtir une logique de reprise »
  (`gate-contrat-machine-install.md`, § points ouverts). **Ce cadrage prend acte et ferme le
  chemin** : la façade ne consommera pas ce champ pour l'état d'étape (§ 2, R-P5).

### 0.3 — Le contrat machine, tel qu'il est réellement (dépôt `iakaframe`)

- ✅ **M-C1 — Le vocabulaire d'événements est FERMÉ et EXPORTÉ.** `cli/src/lib/evenements.js:21-32`
  déclare **dix** types : `debut`, `reservoir`, `etape-annoncee`, `demande-feu-vert`, `feu-vert`,
  `etape-terminee`, `log-delegue`, `garde-ar1`, `rollback`, `fin`. Deux vocabulaires fermés
  supplémentaires : `ETATS_ETAPE` (`:35`) = `faite|refusee|echouee|sautee|dry-run`, et
  `CANAUX_FEU_VERT` (`:38`) = `yes|tty|stdin|refus-par-defaut`. Enveloppe commune sur **chaque**
  ligne : `evt`, `ts` (ISO 8601), `etape` (ou `null`) — `:50-55`. Impression **NDJSON compacte**,
  `JSON.stringify(o) + '\n'` (`:43-45`). **C'est ce registre, et lui seul, qui doit fournir le
  vocabulaire de la façade** (§ 2, point 4 de l'ordre de mission).
- ✅ **M-C2 — Les trois drapeaux existent, et les combinaisons incohérentes sont refusées AVANT
  TOUT EFFET.** `cli/src/commands/install.js:556-571` (`parseArgs`) ; refus explicites `:574-587` :
  `--json --events` ⇒ `exit 1` en nommant les deux drapeaux ; `--json --feu-vert stdin` ⇒ idem ;
  `--feu-vert` hors `{refus, stdin}` ⇒ idem. `USAGE` à jour (`:60-74`), `docs/commandes.md:248`
  à jour.
- ✅ **M-C3 — Le protocole de feu vert est LIGNE PAR LIGNE, et il ferme son lecteur à chaque
  demande.** `cli/src/lib/interactif.js:83-114` : `readline.createInterface({ input, terminal:false })`,
  **`rl.once('line', …)`** — **une seule ligne**, puis `rl.close()` (`:90`). Accepte
  `{"etape":n,"reponse":"oui"|"non"}` **ou** la forme nue `oui`/`non` (`:96-103`). Rend **`false`**
  sur : ligne vide (`:95`), réponse hors séquence (`:104-107`), réponse non reconnue (`:110`), EOF
  (`:112`). **Conséquence de protocole, et c'est la plus importante du lot** : un lecteur `readline`
  est **créé et détruit à chaque demande** ; ce qui aurait été écrit sur `stdin` **avant** la demande
  n'est couvert par aucun test du CLI. → **la façade écrit exactement UNE ligne, et seulement APRÈS
  avoir reçu `demande-feu-vert`.** Jamais de pré-remplissage. → **R-P2**, mesure due à l'étape 0.
- ✅ **M-C4 — La séquence d'un feu vert est : annonce → demande → octroi.**
  `install.js:85-114` : `demande-feu-vert{etape, question}` puis `feu-vert{etape, accorde, canal,
  motif}`. `--yes` court-circuite en émettant `feu-vert{canal:'yes'}` (`:86-88`).
- 🛑 **M-C5 — En `--dry-run`, AUCUNE demande de feu vert n'est émise.** Les quatre étapes
  retournent **avant** `confirmerEtape` : étape 1 `install.js:282-285`, étape 2 `:370-372` (le bloc
  de confirmation est **sous** `if (!values['dry-run'])`), étapes 3/4 `:503-507` — et plus tôt
  encore en cas de plateforme non couverte (`:445-456`) ou de source inexploitable (`:471-480`).
  **Le `--dry-run` est donc un aperçu PUR : aucun bouton, aucune décision, rien à accorder.** C'est
  ce qui rend le point (3) de l'ordre de mission naturel plutôt qu'artificiel.
- ✅ **M-C6 — L'état d'une étape est porté par `etape-terminee.etat` + `detail`.** Y compris les
  refus : plateforme non couverte ⇒ `etat:'echouee'` en réel (`:451`) / `etat:'dry-run'` en aperçu
  (`:455`), `detail: 'plateforme "<x>" non couverte'` ; source inexploitable ⇒ `:475`/`:479`. **La
  couverture réelle des étapes 3/4 est donc désormais DISPONIBLE EN CHAMPS** — c'est le fait qui
  permet de dé-doubler `src/coverage.ts` (M-F6).
- ✅ **M-C7 — La fin porte l'état atteint et la reprise.** `install.js:614-622` :
  `fin{ok, error?, etatAtteint:{derniereEtapeTentee, etapesFaites[], etapesNonTentees[]}, reprise}`.
- ⚠️ **M-C8 — `etapesFaites` est ASYMÉTRIQUE en `--dry-run` sur l'arbre que j'ai lu**, et c'est le
  seul fait de ce cadrage marqué incertain (§ 0.1). Les étapes 1 et 2 sont poussées **sans
  condition** (`install.js:638`, `:666`), les étapes 3 et 4 **sous condition** (`if (!r3.dryRun)`
  `:679`, `if (!r4.dryRun)` `:700`). Le verdict complémentaire du décideur du 2026-09-05 tranche
  qu'**en dry-run aucune étape ne compte comme faite**, et le correctif est **en cours** sur
  `fix/etapes-faites-dry-run`. **Je ne sais pas si l'arbre que j'ai lu est avant ou après le
  correctif** — la lecture montre l'asymétrie, donc soit le correctif n'est pas encore écrit, soit
  la branche n'est pas sortie. **Décision de robustesse** : la façade **ne dérive JAMAIS** l'état
  d'une étape de `etatAtteint.etapesFaites` ; elle le dérive de `etape-terminee.etat` (M-C6), qui
  est correct dans les deux mondes. `etatAtteint` n'est utilisé **que** pour le résumé final et la
  phrase de reprise. → **R-P5**, et une garde (CA-P11).
- ✅ **M-C9 — La sortie des sous-processus est TYPÉE, et elle ne peut pas casser le découpage en
  lignes.** `log-delegue{etape, flux:'stdout'|'stderr', ligne}` (`install.js:193` et suivantes,
  commentaire de la capture `stdio:['ignore','pipe','pipe']`). La ligne déléguée voyage comme
  **valeur de chaîne JSON** : un `\r` de barre de progression `npm` y est **échappé** (`\r`, deux
  caractères), jamais émis en octet brut. **Chaque ligne NDJSON ne porte donc qu'un seul `\n`, le
  sien.** C'est ce qui rend le découpage par saut de ligne sûr, côté Rust comme côté plugin (M-X2).
- 🛑 **M-C10 — Le double réseau est INACCESSIBLE depuis `iakaInstall`.** `cli/package.json:12-16`
  déclare `files: ["src","_bundled","README.md"]` — `cli/test/` **n'est jamais publié** ; et
  `cli/src/lib/network-double.js:30, :41-61` charge le double depuis `../../test/fixtures/…`, avec
  un **diagnostic sur stderr** si on le demande sans pouvoir le fournir (`:55-59`). **Conséquence
  dure pour CA-I8b** : depuis la façade, **il n'existe aucun moyen de simuler le réseau du moteur**.
  Un rejeu de chaîne lancé depuis `iakaInstall` consulte l'API GitHub et le NAS **pour de vrai**. →
  la forme du test de rejeu est arbitrée en § 2 (réducteur pur + flux enregistré + un run vivant
  déclaré), jamais un test qui prétendrait simuler.
- ✅ **M-C11 — Le CLI est en `0.39.0`, Node ≥ 20.** `cli/package.json:3`, `:9-11`. **Le lot du
  contrat machine n'a PAS bumpé la version.** Croisé avec X-2, cela produit le fait le plus lourd de
  conséquence de ce cadrage : **`0.39.0` désigne aujourd'hui deux artefacts différents** — celui
  publié (asset de release, sans `--events`) et celui de la source d'aujourd'hui (avec). → **AR-P3**,
  prérequis bloquant.

### 0.4 — La coquille livrée, telle qu'elle est (dépôt `iakaInstall`)

- **M-F1 — Le point d'`invoke` est unique et vide de métier.** `src/api/backend.ts:17-47` : trois
  fonctions, toutes d'**infrastructure** (`ping`, `detectPrerequisites`, `getPlatformInfo`). C'est
  le **seul chemin hors-couverture déclaré** du registre de vocabulaire
  (`fixtures/vocabulaire-interdit.json:18-23`), et le motif inscrit dit exactement ce que ce lot
  vient faire : « documenter ce que C.2-b branchera ».
- **M-F2 — Le backend Rust `spawn` DÉJÀ des processus, sans aucun plugin.**
  `src-tauri/src/lib.rs:13` importe `std::process::Command` ; `sonder()` (`:39-57`) l'utilise pour
  `node --version` / `npm --version`. `invoke_handler` porte trois commandes (`:83-87`). Les
  capabilities sont **minimales** : `src-tauri/capabilities/default.json:6` ⇒ `["core:default"]`,
  **aucun plugin**. **L'idiome dont ce lot a besoin existe déjà dans le fichier** — c'est
  déterminant pour AR-P1.
- **M-F3 — La garde de vocabulaire a DEUX jambes, motivées et cliquetées.** Source :
  `scripts/__tests__/vocabulaire-moteur.test.mjs:35-56` (balaye `src/` et `src-tauri/src/`, cliquet
  **13 motifs** asserté `:36`, hors-couverture déclaré `:29`). Rendu :
  `src/__tests__/vocabulaire-moteur-rendu.test.tsx:52-84` (rend l'écran, balaye le **texte rendu**,
  couvre les motifs **reconstruits par interpolation**). Registre motivé :
  `fixtures/vocabulaire-interdit.json`. **C'est cette garde qu'il faut ÉTENDRE, pas refaire.**
- **M-F4 — `tauri.conf.json` est nu, et sa CSP est stricte.** Pas de `bundle.resources`, pas de
  `plugins`, `productName: "iakaInstall"` figé (`:3`), `identifier: com.iakateam.iakainstall` (`:5`),
  `devUrl` port **3040** (`:8`), `dragDropEnabled:false` (`:19`), CSP `default-src 'self'; … ;
  connect-src 'self' ipc: http://ipc.localhost` (`:23`). **Les événements Tauri passent par l'IPC
  déjà autorisée** : ce lot ne doit relâcher **aucune** directive CSP (CA-P13).
- **M-F5 — Le bouton est désarmé et sa cause est écrite.** `src/App.tsx:102` (`disabled`) et
  `:7-11` (`CAUSE_DESARMEMENT`, qui nomme le successeur). **C'est ce texte qui doit disparaître dans
  ce lot** — et la garde CA-I11 qui doit changer de sens (§ 2).
- **M-F6 — `src/coverage.ts` est une REDITE du moteur, tolérée faute de flux.** `coverage.ts:20-23`
  déclare « seul macOS est couvert », et son en-tête (`:1-9`) le reconnaît explicitement comme un
  « fait déclaratif mesuré au cadrage ». **M-C6 rend ce fait en champs** : à partir de ce lot, la
  couverture affichée **après** un aperçu doit venir du flux, jamais de ce fichier. `coverage.ts`
  est rétrogradé au rang d'**indice avant tout flux**, et il le dit. *(C'est une réduction de dette
  R3, pas un « tant qu'on y est » : le fichier existait précisément parce que le flux n'existait
  pas.)*
- **M-F7 — La stack, relevée.** `package.json:16-37` : React **18.3.1** et TypeScript **5.5.4**
  (épinglés), Vite **^6**, Vitest **^4.1.9**, `@tauri-apps/api` **^2**, `@tauri-apps/cli` **^2**,
  jsdom **^29.1.1**, `@testing-library/react` **^16.1.0**, eslint **^9.39.4**. Scripts existants
  (`:6-15`) : `dev`, `build`, `preview`, `typecheck`, `lint`, `test`, `tauri`, `chartes`.
  **Aucune dépendance nouvelle n'est nécessaire** sous AR-P1(a).
- **M-F8 — Le geste « générer un module TS depuis une source externe » existe déjà.**
  `scripts/sync-chartes.sh` produit `src/assets/chartes/{chartes.css, manifest.ts}` — fichiers
  **générés, jamais édités à la main**. Ce lot **réutilise cet idiome** pour le vocabulaire
  d'événements (§ 5, étape 3), il n'en invente pas un second.

### 0.5 — Les faits externes, vérifiés le 2026-09-05

- **M-X1 — Tauri 2 stable = `2.11.5`, publiée le 2026-07-01** (les deux précédentes : `2.11.4` le
  2026-06-28, `2.11.3` le 2026-06-17). La coquille déclare `^2` : **aucun changement de plage n'est
  requis**.
- **M-X2 — `tauri-plugin-shell` est en `2.3.6`, publiée le 2026-08-31.** Son API Rust
  (`process::CommandEvent`) porte `Stdout(Vec<u8>)`, `Stderr(Vec<u8>)`, `Error(String)`,
  `Terminated(TerminatedPayload)`, avec la sémantique documentée : *« If configured for raw output,
  all bytes written to stdout. Otherwise, bytes until a newline (`\n`) or carriage return (`\r`) is
  found. »* `CommandChild` expose `write(&[u8])`, `kill()`, `pid()`. **Le découpage par défaut coupe
  aussi sur `\r`** — sans conséquence ici (M-C9), mais **c'est un fait à connaître** : il
  interdirait tout protocole qui laisserait passer un `\r` brut.
- **M-X3 — Côté JavaScript**, `@tauri-apps/plugin-shell` expose `Command.create` /
  `Command.sidecar`, `execute()` / `spawn()`, les événements `close` / `error`, et des
  `EventEmitter` `stdout` / `stderr` émettant `data` ; `Child.write(data)` écrit sur `stdin`. Les
  **permissions nommées** requises dans une capability sont `"shell:allow-execute"`,
  `"shell:allow-spawn"`, `"shell:allow-stdin-write"`, plus un **scope** (`name`, `cmd`, `args`,
  `sidecar`).
- ⚠️ **M-X4 — `tauri-apps/plugins-workspace#1632` est OUVERTE** : le plugin shell **ne transmet pas
  à JS une sortie flushée qui ne se termine pas par un saut de ligne** (*« the output is flushed
  correctly by the spawned program, it is not terminated with a newline character. As a result, the
  JS above receives all output except for the last line »*). **Sans effet sur C-EVT** — chaque ligne
  NDJSON se termine par `\n` (M-C1, M-C9) — mais cela établit que ce canal est **structurellement
  dépendant du saut de ligne**, et qu'un protocole interactif y est un usage à contre-courant.
- ⚠️ **M-X5 — `tauri-apps/tauri#7684`** (ouverte le 2023-08-23, **fermée**) rapportait des **lignes
  de stdout sautées** via le `Command` JS au-delà de ~20 000 lignes, avec un processus qui reste
  suspendu. Fermée, cause non énoncée sur la page. Un flux d'installation est très en deçà (**74
  lignes** mesurées en aperçu, X-1) — **mais `log-delegue` d'un `npm install -g` verbeux n'est
  borné par rien.** Compte, avec M-X4, contre le pilotage depuis la webview (AR-P1).
- **M-X6 — Les ressources embarquées.** `bundle.resources` accepte une **liste** de chemins
  (globs acceptés) ou, en Tauri 2, une **map source → destination**. Tauri **reconstruit** les
  chemins : un `../` devient l'alias `_up_`, un chemin absolu passe sous l'alias racine. La
  résolution se fait par `resolveResource()` (JS) ou la base `Resource` du gestionnaire de chemins
  (Rust). Côté permissions, *« absolute paths and paths containing parent components (`../`) can
  only be allowed via `$RESOURCE/**` »*.

---

## 1. Problème

La coquille est livrée : elle s'ouvre, annonce les **4 étapes / 3 téléchargements**, dit les
prérequis détectés et la couverture réelle — **et elle n'installe rien**, parce que le moteur ne
parlait qu'aux humains. C'était vrai le 2026-09-04 ; **ce ne l'est plus.**

Le contrat machine est fusionné et gaté PASS : un flux **NDJSON** d'événements typés
(`--events`), un **canal de consentement par étape** sur `stdin` (`--feu-vert stdin`), un rapport
bufferisé (`--json`), un vocabulaire **fermé et exporté**, et un test qui **spécifie tout cela de
façon exécutable** (`cli/test/install-contrat-machine.test.js`).

Ce lot consomme ce contrat. Et il doit le faire en tenant **quatre choses en même temps** :

1. **N'inventer aucun état.** Tout ce que l'écran affiche vient d'un événement reçu. C'est **R3**,
   et c'est le risque en tête du lot : une façade qui « sait » ce que fait une étape est une seconde
   implémentation qui s'ignore.
2. **Faire voir avant de faire accorder.** Le CLI garantit qu'il **demande** ; il **ne peut pas**
   garantir que l'humain a **vu** (R-M4 nous est explicitement légué). Un bouton « oui » cliqué sans
   que l'annonce soit affichée serait un `--yes` déguisé — c'est-à-dire exactement ce que la
   coquille a refusé de livrer.
3. **Embarquer le moteur, pas le réécrire.** AR-I2(b) est tranché : ressource Node embarquée. Ce
   lot doit dire **quoi** exactement, **d'où** il vient, et **comment on prouve** que ce qu'on
   embarque est ce qu'on annonce.
4. **Rendre CA-I8b couvrable.** Il était déclaré non couvert « parce qu'un fait mesuré le
   bloquait ». Le fait a changé. Le laisser non couvert maintenant serait du confort, plus une
   mesure.

---

## 2. Décision retenue

> **La façade est un TUYAU et un ÉCRAN : elle transporte des lignes, elle rend des champs, elle
> renvoie une ligne de consentement. Elle ne décide rien, elle ne reformule rien, elle n'infère
> rien.**

Concrètement — **sous réserve des cinq arbitrages du § 3**, dont trois changent le contenu du
bundle et sont donc soumis au décideur :

1. **Un pont natif, un seul.** Le processus `node <ressource>/src/index.js install --events
   --feu-vert stdin […]` est lancé **depuis Rust**, sa sortie est découpée **ligne par ligne**,
   **chaque ligne est transmise telle quelle** au front comme un événement Tauri. Le front ne
   *spawn* rien, ne lit aucun fichier, ne connaît aucun chemin. La convention D7 tient : le front
   parle au natif par `src/api/backend.ts`, et par rien d'autre.
2. **Le front applique un RÉDUCTEUR PUR** : `(modèle, événement) → modèle`. Une fonction sans effet
   de bord, sans horloge, sans réseau, sans `invoke` — donc **testable hors interface**, ce qui est
   la condition même de CA-I8b. **Tout champ affiché est un champ reçu** : `quoi`, `ou`, `version`,
   `ceQuiSeraFusionne`, `sourceRetenue`, `sourcesConsultees` sont **rendus**, jamais recomposés.
3. **Le vocabulaire de la façade est DÉRIVÉ du vocabulaire du moteur.** Un script génère
   `src/events/vocabulaire.ts` à partir des exports `EVENEMENTS` / `ETATS_ETAPE` /
   `CANAUX_FEU_VERT` de la **ressource embarquée** — même idiome que `sync-chartes.sh` (M-F8).
   Le réducteur déclare un rendu **par type**, et une garde compare **les deux ensembles** : un type
   inventé côté façade rougit ; un type du moteur non rendu rougit **ou** est déclaré hors-couverture
   **avec motif**. C'est la **troisième jambe** de la garde R3.
4. **Le premier écran réel est l'APERÇU (`--dry-run`).** Il ne demande rien et ne peut rien
   accorder — c'est un fait du moteur, pas une politique d'écran (M-C5). Le run réel n'est
   atteignable **qu'après** un aperçu terminé (`fin{ok:true}`) dans la même session.
5. **Un bouton par étape, et il n'existe qu'à la réception de `demande-feu-vert`.** Il écrit
   **exactement une ligne** — `{"etape":n,"reponse":"oui"|"non"}` — puis **disparaît**. Aucun
   pré-remplissage, aucune file d'attente, aucune réponse anticipée (M-C3). `--yes` n'apparaît
   **nulle part** : CA-I11 tient, dans son fond, en changeant de forme.
6. **L'état d'une étape vient de `etape-terminee.etat`, jamais de `etatAtteint.etapesFaites`**
   (M-C8, X-4). `etatAtteint` et `reprise` ne servent qu'à l'écran de fin.
7. **L'arrêt propre est un refus, pas un `kill`.** « Arrêter » n'est offert **qu'à une demande de
   feu vert** (répondre `non` ⇒ le CLI s'arrête, `exit 1`, et rend `etatAtteint` + `reprise`). Un
   `kill` reste possible en dernier recours, il est **nommé comme tel** à l'écran, et l'écran dit
   qu'il **court-circuite le rollback d'AR-5**. → R-P4.

**Ce qui est écarté, avec son motif :**

| Écarté | Motif |
|---|---|
| **Parser la prose du CLI** (mode humain) | R3 réalisé. Et il n'y a plus aucune raison : le contrat existe. |
| **`--yes`, sous quelque forme que ce soit** | Saute **toutes** les validations (AR-4 nié). CA-I11 le garde déjà par un `grep` ; ce lot **conserve la garde** et l'étend au Rust. |
| **`--json` pour piloter** | Bufferisé : le client verrait la demande **après** la fin. Le CLI refuse lui-même la combinaison (M-C2). |
| **Piloter depuis la webview** via le plugin shell | AR-P1 ; motifs complets là-bas (D7, capabilities, M-X4/M-X5). |
| **Un sidecar autonome** (Node SEA) | AR-I2(b) est tranché ; `SIDECAR-CLI-AUTONOME` reste le successeur, sa condition d'entrée inchangée : servir des postes **sans Node**. |
| **Réimplémenter une étape, même une seule, côté Rust ou TS** | AR-3, sans appel. |
| **Un timeout d'attente côté façade** | Symétrique du refus du CLI (`contrat-machine`, § 2) : le client est un humain qui lit. Une horloge transformerait une lecture attentive en refus silencieux. |
| **Afficher un état d'étape déduit** (« si l'étape 2 est finie, l'étape 1 a réussi ») | R3 par la petite porte. Toute case de l'écran a un événement qui la remplit, ou reste vide. |
| **Simuler le réseau du moteur depuis `iakaInstall`** | **Impossible** : le double n'est pas publié (M-C10). Prétendre le contraire fabriquerait un témoin vide. |
| **Toucher `iakaframe`** | Autre dépôt. Le seul besoin côté CLI est le bump de version (AR-P3) : **c'est un acte à ordonner, pas à commettre ici**. |
| **`plugins.updater` / la vitrine / le manifeste** | B′-b, inchangé. |
| **i18n, sélecteur de charte, marque propre** | MVP. `INSTALL-I18N`, `MARQUE-IAKAINSTALL`. |

**Et ce que ce lot RETIRE, délibérément** : le texte `CAUSE_DESARMEMENT` (`App.tsx:7-11`) et le
`disabled` du bouton (`:102`) disparaissent — **ils étaient vrais, ils cessent de l'être**. Un écran
qui continuerait à dire « cette application n'installe rien » après ce lot serait un mensonge de
même nature que celui que `--json` portait. **CA-I11 ne disparaît pas pour autant** : elle change de
contenu (§ 8, CA-P8) — le bouton de lancement est armé, mais **aucun bouton de feu vert n'existe
hors d'une demande reçue**, et `--yes` reste introuvable dans tout l'arbre.

---

## 3. Arbitrages — ce que je ne peux pas trancher seul

*Chacun porte ma recommandation. Aucun n'est tranché ici.*

> **Verdicts rendus le 2026-09-05 par Stéphane** (relayés par 🔵 Aragorn, mot pour mot : *« comme reco »*) :
> **AR-P1 → (a)** Rust pilote (`std::process::Command`), zéro plugin, zéro permission ouverte à la webview.
> **AR-P2 → (b)** ressource = arbre extrait au build depuis l'asset de release GitHub épinglé, version +
> `sha256` en fixture vérifiés AVANT extraction ; repli (a) documenté. **AR-P3 → (a)** bump du CLI en
> `0.40.0` et publication AVANT ce lot — prérequis ordonné par Aragorn dans `iakaframe`, le tag qui
> déclenche la publication est un acte du décideur. **AR-P4 → (a)** jamais d'écriture dans `~/.claude`
> pendant les tests : bac à sable `--target-claude`/`--apps-dir`/`--backup-dir` temporaires, garde qui
> rougit si l'un manque. **AR-P5 → (a)** ressource épinglée, remontée à chaque release de la façade ;
> successeur `RESSOURCE-CLI-RAFRAICHIE-EN-LIGNE`.

### AR-P1 — Qui pilote le processus : le natif (Rust) ou la webview (JS) ?

Cet arbitrage commande les **dépendances**, les **capabilities** et la surface d'attaque. Il se
tranche avant la première ligne.

- **(a) Rust pilote.** `std::process::Command` avec `stdin/stdout/stderr` en `piped()`, un fil de
  lecture par flux (`BufReader::lines()`), chaque ligne réémise au front par un événement Tauri ;
  une commande `invoke` unique pour écrire la ligne de consentement sur `stdin`. **Pour** :
  **zéro dépendance neuve**, **zéro capability neuve** (M-F2, M-F4) ; l'idiome existe **déjà** dans
  `lib.rs` (`sonder`, `:39-57`) ; D7 est tenu **par construction** — la webview ne peut pas lancer
  de processus, même compromise ; testable en `cargo test`. **Contre** : il faut écrire le découpage
  en lignes et la mécanique de fils (~80 lignes de Rust), là où un plugin la donnerait.
- **(b) La webview pilote** via `@tauri-apps/plugin-shell` (`Command.create` + `spawn` +
  `Child.write`). **Pour** : l'API est faite pour ça, le découpage en lignes est fourni (M-X2/M-X3).
  **Contre, et il est lourd** : il faut ajouter le plugin (Rust **et** npm), **ouvrir trois
  permissions** — `shell:allow-execute`, `shell:allow-spawn`, `shell:allow-stdin-write` — et un
  **scope d'exécution** dans la capability, c'est-à-dire donner à la webview le droit de lancer
  `node` avec des arguments ; toute faiblesse du front devient une exécution de commande. **Et deux
  faits externes pèsent** : `#1632` **ouverte** (M-X4) et `#7684` (M-X5), tous deux sur le découpage
  de flux de ce plugin, sur un canal dont notre protocole dépend **entièrement**.
- **(c) Rust pilote, mais via `tauri-plugin-shell` côté Rust** (`CommandEvent`, `CommandChild`).
  **Pour** : le découpage en lignes est fourni, sans exposer de permission à la webview.
  **Contre** : une dépendance et un plugin en plus pour remplacer `BufReader::lines()`.

> **Recommandation : (a).** Trois motifs. **(1)** C'est le seul choix qui **n'ajoute rien** — ni
> dépendance, ni permission, ni plugin — dans un dépôt dont la capability tient en une ligne
> (`core:default`) et c'est une propriété qu'un installeur devrait garder. **(2)** D7 cesse d'être
> une convention et devient une impossibilité : la webview **ne peut pas** lancer de processus.
> **(3)** Les deux faits externes M-X4/M-X5 portent précisément sur le mécanisme que (b) et (c)
> rendraient central.
>
> **Ce que (a) coûte, dit franchement** : le découpage en lignes est **à nous**, donc à éprouver —
> et il doit l'être avec un cas qui casse un découpage naïf (ligne très longue, `\r` interne
> échappé, flux coupé au milieu d'une ligne). C'est **CA-P3**, et son contrefactuel.
>
> **Point à mesurer à l'étape 0, non supposé** : que `["core:default"]` suffise à **écouter** un
> événement émis par Rust dans la webview. Si une permission d'écoute doit être ajoutée
> explicitement, elle l'est — **nommément, avec son motif dans la description de la capability**,
> jamais un `core:default` élargi en silence.

### AR-P2 — Que contient exactement la ressource embarquée, et d'où vient-elle ?

AR-I2(b) dit « ressource Node embarquée ». Il reste à dire **quoi**.

- **(a) L'arbre extrait du tarball, COMMITTÉ dans `iakaInstall`** (`src-tauri/resources/cli/**`,
  ~551 entrées, X-2). **Pour** : build hors ligne, reproductible, auditable au commit près.
  **Contre** : on versionne une copie d'un autre dépôt — la dérive silencieuse devient possible, et
  chaque bump du CLI est un gros diff.
- **(b) L'arbre extrait, PRODUIT AU BUILD** par un script qui télécharge **l'asset de release
  GitHub** épinglé (version + `sha256` en fixture), puis extrait. Sortie **gitignorée**.
  **Pour** : une seule source de vérité (la release), un cliquet vérifiable (`sha256`), un diff
  minuscule à chaque bump (deux valeurs dans une fixture). **Fait décisif** : le registre npm du NAS
  (`192.168.1.139`) est sur le LAN, **injoignable depuis un runner GitHub** — l'asset de release
  GitHub, lui, est public depuis le passage public des dépôts. **Contre** : le build exige le réseau
  ; et la commande de build cesse d'être hermétique.
- **(c) Le `.tgz` embarqué tel quel, extrait au premier lancement.** **Contre** : il faut un
  extracteur `tar.gz` dans l'application (dépendance Rust neuve), un dossier d'état, une invalidation
  — et une écriture **avant** le premier écran, ce qui heurte l'esprit du dry-run.

> **Recommandation : (b)**, avec **(a) comme repli documenté** si le décideur veut un build hors
> ligne. Motifs : **(1)** le `sha256` en fixture est un cliquet qui **peut rougir** — un
> `resources/cli/**` committé ne peut être gardé que par lui-même ; **(2)** le diff d'un bump reste
> lisible ; **(3)** l'asset de release est **exactement** l'artefact que l'utilisateur final aurait
> obtenu, ce qui aligne ce qu'on embarque et ce qu'on installe.
>
> **Dans les deux cas, la même règle** : la ressource est **l'arbre extrait**, pas l'archive — la
> façade lance `node <ressource>/src/index.js`, sans jamais extraire quoi que ce soit à l'exécution.

### AR-P3 — Quelle version du CLI la ressource embarque-t-elle ? *(prérequis potentiellement bloquant)*

**Le fait, d'abord** : le lot du contrat machine **n'a pas bumpé la version** (M-C11), et l'asset
publié `naonedge-iakaframe-0.39.0.tgz` (X-2) date d'**avant** le contrat. **`0.39.0` désigne donc
deux artefacts différents** : l'un sans `--events`, l'autre avec.

- **(a) Bumper le CLI en `0.40.0` et publier, AVANT que ce lot n'embarque quoi que ce soit.**
  **Pour** : la règle d'égalité d'AR-F redevient vérifiable — une version, un artefact, un `sha256`.
  **Contre** : c'est un acte dans `iakaframe`, donc **un ordre à donner**, et ce lot attend.
- **(b) Empaqueter localement la source d'aujourd'hui** (`npm pack` dans `cli/`) et embarquer le
  résultat. **Pour** : ne bloque rien. **Contre, et c'est dirimant** : on embarquerait un artefact
  estampillé `0.40.0`… non, estampillé **`0.39.0`** — c'est-à-dire un artefact qui **ment sur son
  identité**, et aucune garde de version ne peut alors rougir sur la bonne cause.
- **(c) Embarquer l'asset publié `0.39.0`.** **Absurde et à écarter explicitement** : la façade
  embarquerait un moteur **sans `--events`**, et échouerait au premier lancement — le pire des
  échecs, celui qui ressemble à un bug de la façade.

> **Recommandation : (a), et je la pose comme PRÉREQUIS.** ⚒️ Gimli **s'arrête à l'étape 1** et
> remonte si la version publiée ne porte pas `--events`. Motif : sans elle, **CA-P9 (l'égalité de
> version) ne peut pas être gardée honnêtement** — on garderait l'égalité de deux chiffres identiques
> désignant deux artefacts différents, c'est-à-dire une garde qui ne peut pas rougir. *Rappel du
> portefeuille : la vitrine `vitrine:en-ligne` du CLI existe précisément pour rendre visible une
> dette de publication (`cli/package.json:22-23`) — c'en est une.*
>
> **Ce que je ne peux pas mesurer sans shell, et que je déclare** : la version réellement présente
> sur la release GitHub et sur le registre NAS **aujourd'hui**. Étape 0, mesure due.

### AR-P4 — Le run réel écrit-il dans le `~/.claude` du poste de dev pendant les tests ?

La chaîne réelle écrit dans `~/.claude` (étape 2), dans `~/Applications` (étapes 3/4), et joue
`npm install -g` (étape 1, sur le `npm` du poste). **Un test qui la joue « pour de vrai » sur le
poste de dev est un test qui modifie l'environnement de travail de l'équipe.**

- **(a) Jamais.** Toute exécution lancée par un test, ou par l'application en mode développement,
  passe **obligatoirement** `--target-claude`, `--apps-dir` et `--backup-dir` sur des répertoires
  **temporaires**, et une garde rougit si la chaîne est lancée sans les trois. L'étape 1 (qui
  `npm install -g`) n'est **jamais** accordée dans un test : on répond `non`, ou l'étape est
  naturellement sautée (CLI déjà à jour).
- **(b) Le poste tel quel**, au motif que « c'est le vrai comportement ».

> **Recommandation : (a), sans réserve.** Motifs : **(1)** `~/.claude` porte la méthode **et la
> mémoire** de l'utilisateur — un test qui y écrit peut casser la session en cours de tout le
> portefeuille ; **(2)** un test qui dépend de l'état réel du poste n'est pas reproductible, donc ne
> prouve rien ; **(3)** l'isolation est **gratuite** : les trois options existent déjà au registre du
> verbe (`install.js:563-565`).
>
> **Forme proposée, à ne pas re-litiger en cours de dev** : un **bac à sable explicite**, armé par
> une variable d'environnement (`IAKAINSTALL_SANDBOX=<répertoire>`), qui **impose** les trois options
> et **refuse de lancer** la chaîne si le répertoire n'est pas hors de `$HOME/.claude` et de
> `$HOME/Applications`. **Le run réel non isolé reste possible — c'est le produit —** mais il est
> **hors des tests**, et c'est le **gate humain** (§ 8).

### AR-P5 — Comment la ressource embarquée est-elle mise à jour ?

- **(a) Épinglée, remontée à chaque release de la façade.** La version et le `sha256` vivent dans une
  fixture ; les monter est un commit qui se voit et se relit.
- **(b) La façade télécharge la dernière version du CLI au lancement.** **Contre** : elle ajoute un
  point de panne **avant le premier écran**, sur un poste qui peut être hors ligne — et un installeur
  qui ne démarre pas parce qu'il cherche son propre moteur est un installeur cassé.
- **(c) Auto-update de la ressource seule**, indépendant de la version de la façade. **Contre** :
  deux cycles de version pour un produit, et une matrice de compatibilité à tenir dès le jour 1.

> **Recommandation : (a).** L'application et son moteur forment **un** artefact daté et signé ; c'est
> ce qui rend une recette reproductible. **(b) est nommé successeur** — `RESSOURCE-CLI-RAFRAICHIE-EN-LIGNE`
> — et sa **condition d'entrée est un besoin mesuré** : une façade qui vieillit plus vite que son
> moteur. Elle n'existe pas encore : il n'y a pas eu une seule release.
>
> **Corollaire, à écrire dans `CLAUDE.md`** : *monter la version du CLI embarqué est un lot, pas un
> geste* — fixture, `sha256`, rejeu du test de rejeu, et une ligne au journal.

---

## 4. Périmètre

### Inclus

1. **La ressource embarquée** (AR-P2/AR-P3) : script d'obtention, fixture `version` + `sha256`,
   déclaration `bundle.resources` dans `tauri.conf.json`, résolution du chemin côté Rust.
2. **Le pont natif** (AR-P1) : lancement du processus, découpage **ligne par ligne** de `stdout` et
   de `stderr`, réémission de **chaque ligne telle quelle** vers le front, écriture d'**une** ligne
   de consentement sur `stdin`, arrêt propre et `kill` de dernier recours, code de sortie remonté.
3. **Le vocabulaire généré** : `src/events/vocabulaire.ts`, produit **depuis la ressource**, jamais
   écrit à la main (idiome `sync-chartes.sh`, M-F8).
4. **Le réducteur pur** `(modèle, événement) → modèle` et son modèle de vue — **aucun champ
   recomposé**, aucune inférence, aucun effet de bord.
5. **L'écran de pilotage** : aperçu (`--dry-run`) d'abord, puis run réel ; annonce d'étape avec ses
   **six champs** ; provenance ; demande de feu vert et son bouton **éphémère** ; log délégué ;
   échec ; rollback ; fin avec état atteint et commande de reprise.
6. **La rétrogradation de `src/coverage.ts`** (M-F6) : indice **avant tout flux** ; après un flux,
   la couverture affichée vient de `etape-terminee` (M-C6).
7. **Les trois gardes de ce lot**, chacune avec son contrefactuel : vocabulaire d'événements
   (3ᵉ jambe de R3), égalité de version, bac à sable.
8. **CA-I8b enfin couvert** : le test qui rejoue la chaîne **sans interface** et compare, champ par
   champ, l'état du modèle à l'événement d'origine.
9. **`CLAUDE.md`** : stack inchangée, **commandes réellement exposées** (l'invariant : une commande
   documentée mais inexistante est pire qu'absente), backlog remis à jour.
10. **`specs/PROJET.md`** — section « ⬜ Ce qui reste à décider » seule, après les verdicts du § 3.

### Exclu — décisions, pas oublis

| Exclu | Motif | Successeur |
|---|---|---|
| **Toute modification de `iakaframe`** | Autre dépôt. Le bump d'AR-P3 est un **ordre à donner**, pas un geste de ce lot | — |
| **Le sidecar autonome** (postes sans Node) | AR-I2(b) tranché ; la condition d'entrée est inchangée | `SIDECAR-CLI-AUTONOME` |
| **C.3** — première release, `.dmg`, `.msi` | § 6.0 du cadrage parent ; et un `.msi` ne se produit pas sur ce poste | lot C.3 |
| **B′-b** — vitrine, `updater/latest.json`, canaux, convergence à trois frères | mesurable après une release réelle | lot B′-b |
| **L'auto-update de `iakaInstall`** | sans manifeste ni release, la clé pointerait le vide | lot B′-b |
| **Rafraîchir la ressource en ligne** | AR-P5 ; besoin non mesuré | `RESSOURCE-CLI-RAFRAICHIE-EN-LIGNE` |
| **Ouvrir les étapes 3/4 à Windows/Linux** | le contrat **rend le refus en champs** (M-C6) ; l'ouvrir est un lot CLI dont la condition d'entrée est une **recette réelle** | `ETAPES-3-4-WINDOWS-LINUX` |
| **Un verbe `uninstall`, une mise à jour en une passe** | autre verbe, cadrage parent § 5.3 | — |
| **Simuler le réseau du moteur** | impossible (M-C10) ; prétendre le contraire fabriquerait un témoin vide | — |
| **Un timeout d'attente du feu vert** | § 2 | — |
| **i18n** · sélecteur de charte · marque propre | MVP | `INSTALL-I18N`, `MARQUE-IAKAINSTALL` |
| **Toute modification de `IakaCockpit` / `iakaFrameGUI`** | **AR-E**, sans exception | B′-b |
| **Toucher `release.yml`, le pin `tauri-action`, le bloc `latest`** | B′-a est gaté PASS ; y toucher rouvrirait un lot fermé. *(Seule exception possible : si AR-P2(b) est retenu, l'étape d'obtention de la ressource doit exister **dans le build**, donc dans le workflow — c'est alors un ajout **déclaré**, gardé par le cliquet du bloc `latest` qui ne doit pas bouger.)* | — |

---

## 5. Étapes d'implémentation, ordonnées

**Étape 0 — Les mesures dues (AVANT d'écrire une ligne).** Je n'avais pas de shell (§ 0.1). Ces
mesures sont **dues**, et leurs sorties sont à **citer** dans le rapport de remise. Elles sont
ordonnées de la moins chère à la plus chère.

```bash
cd ~/work/iakaframe

# (0a) ETAT DU DEPOT VOISIN — quelle branche, quel arbre (M-C8 en dépend)
git status --porcelain -b | head -5
git log --oneline -3
git show main:cli/src/commands/install.js | sed -n '630,705p' | grep -n 'etapesFaites'

# (0b) LE FLUX EXISTE ET IL EST PROPRE (corrobore X-1, par moi cette fois)
node cli/src/index.js install --dry-run --events --root . 2>/dev/null | wc -l
node cli/src/index.js install --dry-run --events --root . 2>/dev/null \
  | while read -r l; do echo "$l" | node -e 'JSON.parse(require("fs").readFileSync(0,"utf8"))' \
    || echo "NON-JSON: $l"; done | grep -c NON-JSON      # attendu : 0
node cli/src/index.js install --dry-run --events --root . 2>/dev/null | tail -1   # attendu : evt:"fin"

# (0c) LE VOCABULAIRE EST BIEN EXPORTABLE ET LISIBLE DE L'EXTERIEUR (commande la génération, § 5.3)
node -e 'import("./cli/src/lib/evenements.js").then(m=>console.log(m.EVENEMENTS.length, m.ETATS_ETAPE.length, m.CANAUX_FEU_VERT.length))'
                                                          # attendu : 10 5 4

# (0d) AUCUNE DEMANDE DE FEU VERT EN DRY-RUN (M-C5, le fait qui commande l'écran d'aperçu)
node cli/src/index.js install --dry-run --events --root . 2>/dev/null | grep -c 'demande-feu-vert'
                                                          # attendu : 0

# (0e) *** LA MESURE CRITIQUE DU LOT *** — DEUX demandes de feu vert successives dans UN SEUL run,
# une ligne écrite PAR demande, et les deux honorées. Aucun test du CLI ne l'exerce (le harnais
# n'en produit qu'une). Si readline perd la seconde, tout le § 2 point 5 est à re-cadrer.
# Isolé : rien n'est écrit hors des répertoires temporaires ; on répond "non" à la dernière.
SBX=$(mktemp -d)
node cli/src/index.js install --events --feu-vert stdin --root . \
  --target-claude "$SBX/claude" --apps-dir "$SBX/apps" --backup-dir "$SBX/backups" \
  < <(printf '{"etape":2,"reponse":"oui"}\n'; sleep 2; printf '{"etape":3,"reponse":"non"}\n')
# attendu : DEUX evt:"feu-vert" (etape 2 accorde:true canal:"stdin" ; etape 3 accorde:false),
#           et `ls "$SBX/apps"` vide.

# (0f) VERSION PUBLIEE vs SOURCE (AR-P3 — prérequis potentiellement bloquant)
node -e 'console.log(require("./cli/package.json").version)'
curl -s https://api.github.com/repos/iakasju/iakaframe/releases/latest \
  | node -e 'const r=JSON.parse(require("fs").readFileSync(0,"utf8"));console.log(r.tag_name, (r.assets||[]).map(a=>a.name).join(","))'
# Puis, sur l'asset téléchargé : `tar -xzOf <asset> package/src/lib/evenements.js | head -1`
# attendu : le fichier EXISTE. S'il est absent -> AR-P3 est BLOQUANT, ARRÊTER.

# (0g) LE POINT DE COMPARAISON DE LA COQUILLE, AVANT TOUTE MODIFICATION
cd ~/work/iakaInstall && npm run typecheck && npm run lint && npm run test && (cd src-tauri && cargo test)
```

> **Si (0e) montre qu'une seconde demande n'est pas honorée, ou si (0f) montre que la version
> publiée ne porte pas le contrat : ARRÊTER et remonter à 🔵 Gandalf.** Le § 2 (points 5 et 6) et
> l'AR-P3 reposent dessus, et une instruction qui repose sur un fait faux se re-cadre, elle ne
> s'exécute pas.

**Étape 1 — La ressource embarquée** (AR-P2, AR-P3). Script `scripts/embarquer-cli.mjs` :
lit la fixture `fixtures/cli-embarque.json` (`version`, `sha256`, `url`), obtient le tarball,
**vérifie le `sha256` AVANT d'extraire** (jamais après), extrait dans `src-tauri/resources/cli/`
(gitignoré si AR-P2(b)). `tauri.conf.json` gagne `bundle.resources` pointant ce dossier — **et
rien d'autre**. Aucune autre clé du fichier ne bouge (CSP, `dragDropEnabled`, `productName`,
`identifier`, `devUrl`, `bundle.targets`, `bundle.icon` : **inchangés**).

**Étape 2 — Le pont natif** (AR-P1(a)), dans `src-tauri/src/`. Un module dédié, pas `lib.rs` qui
grossit. Il porte, et **rien de plus** :
- `demarrer_installation(mode: "apercu" | "reel", bac_a_sable: Option<Chemin>) -> Result<()>` :
  résout le chemin de la ressource, résout `node` (le même que celui sondé par `detect_prerequisites`
  — **jamais** un second chemin de résolution), construit l'argv, `spawn` avec les trois flux en
  `piped()`, arme deux fils de lecture ;
- **le découpage en lignes** : `BufReader::lines()` sur `stdout` — **une ligne = un événement
  transmis TEL QUEL** (chaîne brute, non parsée côté Rust : le Rust ne doit **rien comprendre** au
  contenu ; c'est le front qui parse, sinon on a deux lecteurs du contrat) ;
- `stderr` est lu et transmis **sur un canal séparé et étiqueté** — il n'entre **jamais** dans le
  flux d'événements (le CLI y écrit son diagnostic de double réseau, M-C10) ;
- `repondre_feu_vert(etape: u32, reponse: "oui" | "non")` : écrit **exactement** une ligne
  `{"etape":n,"reponse":"…"}\n` sur `stdin`, et **refuse** s'il n'y a pas de demande en cours ;
- `interrompre_installation()` : `kill`, **explicitement nommé comme un dernier recours** ;
- la terminaison : code de sortie remonté au front comme un événement de transport distinct (jamais
  confondu avec `evt:"fin"`, qui est un événement **du moteur**).

**Étape 3 — Le vocabulaire généré.** `scripts/sync-vocabulaire-evenements.mjs` : importe
`src-tauri/resources/cli/src/lib/evenements.js`, écrit `src/events/vocabulaire.ts` — trois unions de
littéraux (`EvtType`, `EtatEtape`, `CanalFeuVert`) + les tableaux. En-tête : **« généré, ne pas
éditer à la main »**, avec la source et la version. Script câblé dans `package.json`
(`npm run vocabulaire`) **et** documenté dans `CLAUDE.md` (CA-I14 tient).

**Étape 4 — Le réducteur pur**, `src/events/reducteur.ts`. `(modele, evenement) => modele`. Un
`switch` **exhaustif** sur `EvtType` (le compilateur TypeScript le garantit via un `never` de
fermeture). Aucun `Date.now()`, aucun `fetch`, aucun `invoke`, aucune valeur par défaut inventée :
un champ absent reste **absent**, il n'est pas remplacé par un tiret dans le modèle (le tiret est
une décision d'affichage, pas de modèle). Un `evt` inconnu (ressource plus récente que la façade)
est **conservé en « non rendu », visible et compté** — jamais avalé en silence.

**Étape 5 — L'écran.** Trois temps, lus de haut en bas :
1. **Avant tout flux** : ce que la coquille montre déjà (comptage AR-A, prérequis détectés, indice
   de couverture) + un unique bouton **« Voir ce qui sera fait (aperçu) »**.
2. **Aperçu** : le flux `--dry-run --events` rendu. Provenance (`reservoir.provenance`, **la phrase
   au format imposé, affichée telle quelle**, + les champs). Quatre étapes avec leurs six champs.
   Aucun bouton de feu vert (M-C5). À `fin{ok:true}`, un bouton **« Lancer l'installation »**
   apparaît — et **seulement là**.
3. **Run réel** : le même rendu, plus, **à chaque `demande-feu-vert`**, un bloc de décision qui
   affiche **l'annonce de CETTE étape** (les six champs) au-dessus de la question, et deux boutons.
   Le bloc **n'existe pas** avant la demande et **disparaît** après la réponse. Les `log-delegue`
   s'accumulent dans une zone repliée, étiquetée par étape et par flux. `rollback` est rendu
   **intégralement** : `resume`, `defaits[]`, `nonDefaits[]`, et chaque `rapports[]` — **jamais un
   « restauré » global** (AR-5, garde 3). `fin` rend `etatAtteint` et **la commande de reprise,
   copiable**.

**Étape 6 — La garde de vocabulaire d'événements** (3ᵉ jambe de R3),
`src/__tests__/vocabulaire-evenements.test.ts` : compare **l'ensemble des `EvtType` rendus par le
réducteur** à `EVENEMENTS` **lu depuis la ressource** (jamais une liste réécrite dans le test —
idiome CA-M15 du CLI). Un type inventé côté façade ⇒ rouge en le nommant. Un type du moteur non
rendu ⇒ rouge, **sauf** entrée dans un registre `fixtures/evenements-non-rendus.json` **avec
motif**, cliqueté sur son compte.

**Étape 7 — CA-I8b, le rejeu sans interface.** Deux jambes, et la seconde n'est pas facultative :
- **(a) Rejeu sur flux enregistré** : une fixture `fixtures/flux-apercu.ndjson` **enregistrée par
  un run réel** (étape 0, mesure (0b)), jamais écrite à la main. Le test applique le réducteur ligne
  à ligne et compare **champ par champ** le modèle obtenu aux événements d'origine : pour chaque
  `etape-annoncee`, les six champs du modèle sont **identiques** à ceux de l'événement ; pour chaque
  `etape-terminee`, l'état affiché est **exactement** `etat`. Garde anti-témoin-vide : la fixture
  doit porter **au moins** un `debut`, un `reservoir`, quatre `etape-annoncee` ou une raison
  déclarée, et un `fin` — et le test l'asserte.
- **(b) Rejeu vivant, déclaré** : une commande, **hors `npm run test`** (elle dépend du réseau et
  d'une ressource extraite), qui relance la chaîne en aperçu depuis la ressource embarquée et
  vérifie que le flux reste parsable et se termine par `fin`. **Un échec réseau rend un SKIP
  EXPLICITE avec son code, jamais un vert** — même doctrine que `vitrine:en-ligne` du CLI
  (`cli/package.json:22-23`).

**Étape 8 — La garde d'égalité de version** (AR-F, règle d'égalité) : la façade lit la version
déclarée par la **ressource** (`resources/cli/package.json`) et la compare à `debut.versionCli` du
flux. **Différence ⇒ l'écran refuse de continuer et NOMME les deux versions.** Le test compare
aussi la version de la ressource à celle de `fixtures/cli-embarque.json`. **Trois valeurs, une seule
vérité.**

**Étape 9 — La garde du bac à sable** (AR-P4) : un test rougit si un test ou le mode développement
lance la chaîne **sans** les trois options d'isolation, ou avec un chemin sous `$HOME/.claude` /
`$HOME/Applications`.

**Étape 10 — Les contrefactuels.** Chaque garde du § 8 est **éprouvée par une mutation du
PROGRAMME** (jamais de l'attendu) qui la fait **rougir nommément**, puis **révoquée avec preuve au
`sha256`**. *Une garde qui ne peut pas rougir n'est pas une garde.*

**Étape 11 — `CLAUDE.md`, `specs/PROJET.md`, et le retrait du texte périmé.** Retirer
`CAUSE_DESARMEMENT` et le `disabled` (M-F5) ; mettre à jour le backlog ; documenter les nouvelles
commandes `npm run` **réellement exposées** ; écrire dans `CLAUDE.md` que **monter la version du CLI
embarqué est un lot** (AR-P5).

**Étape 12 — Remise au gate 🏹 Legolas.** Jamais d'auto-validation. Le tableau de verdict porte
**une ligne par commande**, avec **son** code de sortie et **son** chiffre. Une formule d'ensemble
(« tout est vert ») vaut FAIL ; un critère non mesuré se déclare **non mesuré**, jamais PASS.

---

## 6. Fichiers concernés

**Dépôt `iakaInstall` — tout ce que ce lot écrit y est :**

| Chemin | Ce qui change |
|---|---|
| `scripts/embarquer-cli.mjs` | **neuf** — obtient, vérifie le `sha256`, extrait la ressource |
| `fixtures/cli-embarque.json` | **neuf** — `version`, `sha256`, `url` ; **le cliquet de la ressource** |
| `scripts/sync-vocabulaire-evenements.mjs` | **neuf** — génère `src/events/vocabulaire.ts` depuis la ressource |
| `src/events/vocabulaire.ts` | **généré**, jamais édité à la main |
| `src/events/reducteur.ts` | **neuf** — la fonction pure `(modèle, événement) → modèle` |
| `src/events/modele.ts` | **neuf** — le modèle de vue (types), **aucune valeur par défaut inventée** |
| `src/api/backend.ts` | **+** `demarrerInstallation`, `repondreFeuVert`, `interrompreInstallation`, et l'abonnement aux événements. **Reste le point d'`invoke` unique** |
| `src/App.tsx` + composants d'écran | pilotage : aperçu → run, bloc de décision **éphémère**, log délégué, rollback, fin. **Retrait** de `CAUSE_DESARMEMENT` et du `disabled` |
| `src/coverage.ts` | **rétrogradé** — indice **avant tout flux** ; son en-tête le dit |
| `src-tauri/src/pilote.rs` (ou nom équivalent) | **neuf** — spawn, découpage en lignes, émission, écriture stdin, kill |
| `src-tauri/src/lib.rs` | **+** les trois commandes au `invoke_handler`. `sonder`/`ping`/`platform_info` **inchangés** |
| `src-tauri/tauri.conf.json` | **+** `bundle.resources` — **et rien d'autre** (CSP, `dragDropEnabled`, `productName`, `identifier`, `devUrl` : inchangés) |
| `src-tauri/capabilities/default.json` | **inchangé si possible** ; toute permission ajoutée est **nommée et motivée** dans la `description` |
| `src-tauri/Cargo.toml` | **inchangé si AR-P1(a)** — c'est un critère (CA-P12) |
| `fixtures/flux-apercu.ndjson` | **neuf** — flux **enregistré** par un run réel (étape 0), jamais écrit à la main |
| `fixtures/evenements-non-rendus.json` | **neuf** — hors-couverture **motivé** + cliquet |
| `src/__tests__/*`, `scripts/__tests__/*` | **neufs** — vocabulaire d'événements, rejeu (CA-I8b), version, bac à sable, écran |
| `package.json` | **+** `embarquer`, `vocabulaire`, `rejeu:vivant` — **et leur documentation** |
| `.gitignore` | `src-tauri/resources/cli/` si AR-P2(b) |
| `CLAUDE.md`, `specs/PROJET.md` | remis à jour (§ 5 étape 11) |

**Ce qui est LU et jamais écrit** : la ressource extraite (`src-tauri/resources/cli/**`),
`fixtures/vocabulaire-interdit.json` *(sauf ajout de motif, qui est une décision — cliquet)*,
`.github/workflows/release.yml`, `fixtures/tauri-action-pin.json`, `fixtures/bloc-latest.sha256`.

**Dépôt `iakaframe`** — **rien.** Le bump d'AR-P3 est un **ordre à donner à Aragorn**, pas un geste
de ce lot.

**Dépôts `IakaCockpit` / `iakaFrameGUI`** — **rien, et c'est AR-E.**

---

## 7. Risques

| # | Risque | Mitigation |
|---|---|---|
| **R3** *(hérité, en tête)* | **La façade redevient une seconde implémentation.** Le danger change de forme : il ne s'agit plus de nommer le moteur, mais d'**inférer** — « l'étape 2 est finie donc l'étape 1 a réussi », « pas de manifeste donc pas couvert », un libellé recomposé à partir de deux champs. Une inférence ne se voit pas dans un `grep`. | **Trois jambes, désormais.** (1) La garde de vocabulaire **existante**, à deux jambes (source + rendu, M-F3), **inchangée**. (2) **Neuve** : le vocabulaire des événements rendus est comparé au registre **du moteur** (CA-P2). (3) **Neuve, et c'est la vraie** : **CA-I8b** — le réducteur est **pur**, rejoué sur un flux enregistré, et comparé **champ par champ** à l'événement d'origine (CA-P4). Une inférence produit une divergence de champ, et la divergence rougit. |
| **R-P1** | **Le feu vert devient un `--yes` déguisé** : un bouton cliqué sans que l'annonce ait été affichée. **Le CLI ne peut pas l'empêcher** — R-M4 nous le lègue explicitement. | **CA-P6** : le bloc de décision **n'existe pas** sans l'annonce de la même étape dans le modèle ; le test rend un flux où `demande-feu-vert` arrive **sans** `etape-annoncee` préalable et vérifie que **rien n'est cliquable**. Contrefactuel : rendre le bouton indépendamment de l'annonce ⇒ rouge. |
| **R-P2** | **Perte d'une ligne de consentement.** `lireLigneFeuVert` **crée et détruit** un `readline` à chaque demande (M-C3, `interactif.js:86, :90`). Ce qui aurait été écrit **avant** la demande peut disparaître dans le tampon détruit — et **aucun test du CLI n'exerce deux demandes successives**. | **Mesure (0e) à l'étape 0, bloquante.** Et, par construction : **une ligne écrite seulement APRÈS `demande-feu-vert`**, jamais de file d'attente. `repondre_feu_vert` **refuse** s'il n'y a pas de demande en cours (CA-P7). |
| **R-P3** | **La ressource embarquée n'est pas celle qu'on annonce** — deux artefacts sous `0.39.0` (M-C11 + X-2). Le pire cas est silencieux : la façade lance un moteur sans `--events` et l'échec ressemble à un bug de façade. | **AR-P3 en prérequis bloquant** ; **CA-P9** : trois valeurs (fixture, `package.json` de la ressource, `debut.versionCli`) doivent coïncider, sinon l'écran **refuse et nomme les trois**. `sha256` vérifié **avant** extraction. |
| **R-P4** | **Un `kill` en pleine écriture court-circuite le rollback d'AR-5** et laisse la machine dans un état que personne ne décrit. | « Arrêter » = **répondre `non` à un feu vert** (arrêt propre, `etatAtteint` + `reprise`). Le `kill` est **un dernier recours nommé**, et l'écran **dit** qu'il peut laisser des traces que le moteur n'aura pas défaites. **CA-P10.** |
| **R-P5** | **`etatAtteint.etapesFaites` est asymétrique en dry-run** (M-C8) et un correctif est **en cours** dans un autre dépôt. Une façade qui s'en sert afficherait « étape 1 faite » sur un aperçu qui n'a rien fait. | **Le champ n'est pas consommé pour l'état d'étape** (§ 2 point 6). **CA-P11** : un test rejoue un flux d'**aperçu** et vérifie qu'**aucune** étape n'est affichée comme faite — et il tient **quel que soit** l'état du correctif voisin. |
| **R-P6** | **Le flux est pollué ou tronqué par le transport.** Un découpage naïf casse sur une ligne très longue (un `log-delegue` de `npm` peut être long), sur une lecture coupée au milieu d'une ligne, ou sur un `stderr` mêlé au flux. | `BufReader::lines()` (pas de taille fixe) ; `stderr` sur un **canal séparé et étiqueté** (M-C10 : le CLI y écrit un diagnostic) ; **CA-P3** avec contrefactuel sur une ligne longue. Et le choix d'AR-P1(a) évite les deux défauts connus du plugin (M-X4, M-X5). |
| **R-P7** | **Node absent sur le poste.** La chaîne présuppose Node ≥ 20 **et** `npm` (l'étape 1 *spawn* `npm`). Un poste « qui n'a rien » n'en a pas. | **Détecter et dire, jamais planter** — la coquille le fait déjà (`usePrerequisites`, `lib.rs:39-68`). Ce lot **refuse de lancer** si `node` est absent, en le nommant. Le remède de fond reste `SIDECAR-CLI-AUTONOME`, et sa condition d'entrée est une **décision**, pas ce lot. |
| **R-P8** | **Le rejeu (CA-I8b) devient un témoin vide** : une fixture écrite à la main, ou si courte qu'elle ne prouve rien. Le portefeuille a déjà payé ce défaut deux fois. | La fixture est **enregistrée par un run réel** (étape 0), et le test **asserte sa richesse** (présence de `debut`, `reservoir`, `etape-annoncee` × 4 ou raison déclarée, `fin`). La jambe **vivante** existe en plus, et un échec réseau y rend un **SKIP explicite avec son code**, jamais un vert. |
| **R-P9** | **Le run réel des tests écrit dans le `~/.claude` du poste** et casse la session de l'équipe. | AR-P4(a) + **CA-P14** : garde de bac à sable, qui rougit si la chaîne est lancée sans isolation. |
| **R-P10** | **La façade vieillit par rapport au moteur** : un `evt` neuf apparaît côté CLI, la façade l'ignore en silence, et un état cesse d'être affiché sans que personne ne le voie. | Le réducteur **conserve et compte** les `evt` non rendus ; **CA-P2** rougit si un type du registre n'est ni rendu ni **déclaré avec motif**. Un `evt` neuf est donc, au pire, **visible**. |

---

## 8. Critères d'acceptation

> **Règle du lot, non négociable** : chaque critère se vérifie **par une commande ou un
> `fichier:ligne`**, jamais par une lecture d'intention. Chaque **garde** porte son
> **contrefactuel** — une mutation du **programme** (jamais de l'attendu) qui la fait **rougir
> nommément**, puis est **révoquée avec preuve au `sha256`**.
> ***Une garde qui ne peut pas rougir n'est pas une garde.***
>
> **Héritage explicite** : **CA-I8b** (déclaré non couvert par C.2-a) devient **CA-P4** et **doit**
> être PASS. **CA-I11** ne disparaît pas : elle devient **CA-P8**. **CA-I8a**, **CA-I9**, **CA-I10**,
> **CA-I12**, **CA-I14** restent en vigueur et **ne doivent pas régresser** (CA-P15).

- [ ] **CA-P1 — Le vocabulaire de la façade est GÉNÉRÉ depuis le moteur, jamais écrit à la main.**
      `src/events/vocabulaire.ts` porte l'en-tête « généré », et son contenu est **identique** à ce
      que rend `scripts/sync-vocabulaire-evenements.mjs` relancé.
      **Vérif** : `npm run vocabulaire && git diff --exit-code src/events/vocabulaire.ts` ⇒ code **0**.
      **Contrefactuel** : ajouter un type à la main dans le fichier ⇒ le `git diff` rougit **en
      citant la ligne**.

- [ ] **CA-P2 — La garde d'événements rougit dans LES DEUX SENS.**
      Le test compare l'ensemble des `EvtType` rendus par le réducteur à `EVENEMENTS` **lu depuis la
      ressource** (comparaison **à l'appel de l'autorité**, jamais une liste réécrite).
      **Vérif** : `npm run test`.
      **Contrefactuel A (type inventé)** : ajouter un rendu pour `"etape-magique"` ⇒ rouge **en
      nommant le type**. **Contrefactuel B (type oublié)** : retirer le rendu de `rollback` sans
      l'inscrire au registre `evenements-non-rendus.json` ⇒ rouge **en nommant le type**.
      **Cliquet** : le nombre d'entrées `non-rendus` ne **monte** que dans le commit qui le décide,
      et chacune porte **un motif écrit**.

- [ ] **CA-P3 — Le transport ne perd, ne coupe et ne mélange aucune ligne.**
      **Vérif** : un test Rust (`cargo test`) donne au découpeur un flux contenant (1) une ligne de
      **plus de 64 Ko**, (2) une ligne coupée entre deux lectures, (3) un `\r` **échappé** à
      l'intérieur d'une valeur JSON, (4) une ligne sur `stderr` ⇒ les lignes de `stdout` ressortent
      **entières, dans l'ordre, une par événement**, et la ligne `stderr` **ne figure pas** dans le
      flux d'événements.
      **Contrefactuel** : remplacer `BufReader::lines()` par une lecture à tampon fixe ⇒ le cas (1)
      rougit **en montrant la ligne tronquée**.

- [ ] **CA-P4 — *(= CA-I8b, enfin couvert)* La chaîne est rejouée SANS interface, et comparée champ
      par champ.**
      **Vérif** : `npm run test` — le réducteur est appliqué à `fixtures/flux-apercu.ndjson`
      (**enregistrée par un run réel**, étape 0) ; pour **chaque** `etape-annoncee`, les six champs
      du modèle (`quoi`, `ou`, `version`, `ceQuiSeraFusionne`, `sourceRetenue`, `sourcesConsultees`)
      sont **strictement égaux** à ceux de l'événement ; pour **chaque** `etape-terminee`, l'état du
      modèle est **exactement** `etat` ; `reservoir.provenance` est affichée **telle quelle**.
      **Garde anti-témoin-vide** : le test asserte que la fixture porte `debut`, `reservoir`, au
      moins une `etape-annoncee` et `fin`.
      **Contrefactuel** : faire recomposer `quoi` par le réducteur (par exemple `` `${nom} v${version}` ``)
      ⇒ rouge **en nommant le champ et l'étape**.
      **Seconde jambe, déclarée** : `npm run rejeu:vivant` relance un aperçu réel depuis la
      ressource ⇒ code **0**, ou **SKIP explicite avec son code** en cas d'indisponibilité réseau —
      **jamais un vert silencieux**.

- [ ] **CA-P5 — L'aperçu est le premier écran, et il ne peut rien accorder.**
      **Vérif** : test de rendu — sur un flux `--dry-run`, **aucun** bouton de feu vert n'apparaît
      (c'est un fait du moteur, M-C5) ; le bouton « Lancer l'installation » **n'apparaît qu'après**
      un `fin{ok:true}` d'aperçu dans la session.
      **Contrefactuel** : rendre le bouton de lancement disponible avant tout aperçu ⇒ rouge nommé.

- [ ] **CA-P6 — On n'accorde que ce qui est affiché.**
      **Vérif** : test de rendu sur un flux où `demande-feu-vert{etape:2}` arrive **sans**
      `etape-annoncee{etape:2}` ⇒ **aucun bouton cliquable**, et l'écran **dit** qu'il attend
      l'annonce.
      **Contrefactuel** : rendre le bloc de décision indépendamment de l'annonce ⇒ rouge.
      *(C'est la réponse à R-M4, qui nous a été explicitement légué.)*

- [ ] **CA-P7 — Une réponse = une ligne, après la demande, et jamais avant.**
      **Vérif** : test du pont — `repondre_feu_vert` **hors demande en cours** ⇒ **refus** nommé,
      rien d'écrit ; en demande ⇒ **exactement** `{"etape":n,"reponse":"oui"}\n`, une fois, sur
      `stdin`.
      **Contrefactuel** : autoriser une réponse anticipée, ou écrire deux lignes ⇒ rouge.
      *(Ferme R-P2, dont la mesure (0e) conditionne tout le protocole.)*

- [ ] **CA-P8 — *(= CA-I11, transformée)* `--yes` reste introuvable, et aucun bouton n'existe hors
      demande.**
      **Vérif** : `grep -rn "'--yes'\|\"--yes\"\|--yes" src/ src-tauri/src/ scripts/` ⇒ **0**
      occurrence ; et test de rendu : hors `demande-feu-vert`, **aucun** bouton d'accord n'est monté.
      **Contrefactuel** : introduire `--yes` dans l'argv du pont ⇒ rouge **en citant le fichier et
      la ligne**.
      *C'est le critère qui empêche ce lot de livrer une violation d'AR-4 emballée dans une
      interface — la même phrase qu'en C.2-a, avec un bouton armé cette fois.*

- [ ] **CA-P9 — Trois valeurs de version, une seule vérité.**
      La version de `fixtures/cli-embarque.json`, celle de `resources/cli/package.json` et le champ
      `debut.versionCli` du flux **coïncident**. À défaut, l'application **refuse de lancer** et
      **nomme les trois**.
      **Vérif** : `npm run test` (test statique sur les deux premières) **+** test de rendu (flux
      dont `debut.versionCli` diverge ⇒ l'écran refuse et affiche les deux valeurs).
      **Contrefactuel** : muter la version **dans la fixture** ⇒ rouge nommé. *(La mutation ne touche
      jamais la ressource — même discipline que le cliquet du pin `tauri-action`.)*

- [ ] **CA-P10 — L'arrêt propre est un refus ; le `kill` est nommé et ses limites sont dites.**
      **Vérif** : test de rendu — « Arrêter » n'est proposé **qu'à une demande de feu vert** et
      envoie `non` ; le `kill` est accessible séparément, **étiqueté comme dernier recours**, et
      l'écran affiche qu'il peut laisser des traces que le moteur n'aura pas défaites (AR-5).
      **Contrefactuel** : câbler « Arrêter » sur le `kill` ⇒ rouge nommé.

- [ ] **CA-P11 — En aperçu, aucune étape n'est affichée comme faite.**
      **Vérif** : le réducteur appliqué à `fixtures/flux-apercu.ndjson` ⇒ **zéro** étape à l'état
      « faite » ; et un test statique : `etatAtteint.etapesFaites` **n'est référencé nulle part** dans
      le calcul d'un état d'étape.
      **Contrefactuel** : dériver l'état d'étape de `etatAtteint.etapesFaites` ⇒ rouge.
      *(Tient **quel que soit** l'état du correctif `fix/etapes-faites-dry-run` du dépôt voisin —
      c'est précisément pourquoi il est écrit ainsi, M-C8.)*

- [ ] **CA-P12 — Le coût d'entrée est nul : ni dépendance, ni permission, ni CSP relâchée.**
      **Vérif** : `git diff` sur `src-tauri/Cargo.toml` ⇒ **aucune dépendance ajoutée** (si AR-P1(a)
      est retenu) ; `git diff` sur `tauri.conf.json` ⇒ **seule** la clé `bundle.resources` est
      ajoutée, la CSP est **identique octet pour octet** ; `git diff` sur
      `capabilities/default.json` ⇒ inchangé, **ou** la ou les permissions ajoutées sont **nommées
      et motivées** dans le champ `description`.
      **Contrefactuel** : ajouter `shell:allow-execute` sans motif ⇒ rouge **en nommant la
      permission**.

- [ ] **CA-P13 — La ressource est vérifiée AVANT d'être extraite.**
      **Vérif** : `scripts/embarquer-cli.mjs` calcule et compare le `sha256` **avant** toute
      écriture hors du fichier téléchargé ; un test lui donne un tarball corrompu ⇒ **refus**, rien
      d'extrait.
      **Contrefactuel** : déplacer la vérification après l'extraction ⇒ rouge **en montrant les
      fichiers extraits**. *(Même doctrine que la vérification minisign du moteur : vérifier avant
      d'écrire, jamais après.)*

- [ ] **CA-P14 — Aucun test, aucun mode développement n'écrit hors du bac à sable.**
      **Vérif** : test statique — toute construction d'argv de chaîne dans les tests et en mode
      développement porte `--target-claude`, `--apps-dir` **et** `--backup-dir`, tous sous un
      répertoire temporaire ; un chemin sous `$HOME/.claude` ou `$HOME/Applications` ⇒ **refus**.
      **Contrefactuel** : retirer une des trois options ⇒ rouge **en nommant l'option manquante**.

- [ ] **CA-P15 — Aucune régression des gardes de C.2-a.**
      **Vérif** : `npm run test` — `vocabulaire-moteur` (cliquet **13** motifs), `vocabulaire-moteur-rendu`,
      `comptage-ar-a`, `ecran-annonce`, `nom-produit`, `pin-tauri-action`, `release-matrice`,
      `bloc-latest`, `commandes-documentees` : **tous verts**, et le cliquet de 13 motifs **n'a pas
      baissé**.
      *Le comptage « 4 étapes / 3 téléchargements » (CA-I9) reste affiché ; la couverture réelle
      (CA-I10) est désormais rendue **depuis le flux** après un aperçu, et **plus jamais** simulée.*

- [ ] **CA-P16 — La chaîne qualité est verte, ligne par ligne.**
      **Vérif** — un tableau, **une ligne par commande**, avec **son** code de sortie et **son**
      chiffre : `npm run typecheck` · `npm run lint` · `npm run test` · `cargo test` (dans
      `src-tauri/`) · `npm run rejeu:vivant` (avec son code, SKIP compris).
      **Une formule d'ensemble (« tout est vert ») vaut FAIL** ; un critère **non mesuré** se
      déclare *non mesuré*, jamais *PASS*.

### Ce qui n'est PAS prouvable ici — gate humain, DÉCLARÉ

*Précédent AR-6, tenu à la lettre : « buildé ne vaut pas recetté ». **Aucun critère ci-dessus ne
suppose ces mesures.***

| Prouvable sur ce poste (macOS arm64) | Prouvable en CI seulement | **Gate humain — exige un humain et une machine** |
|---|---|---|
| le pont, le réducteur, les gardes, le rejeu sur flux enregistré, le build local | les builds Windows / Linux / macOS Intel de la matrice | **le run réel avec écriture** : un humain lance la chaîne, lit chaque annonce, accorde ou refuse étape par étape, et constate le résultat — **sur les trois OS** |
| l'aperçu réel depuis la ressource (réseau requis, SKIP déclaré sinon) | — | la **recette Windows** et la **recette Linux** : elles montreront le refus des étapes 3/4 (M-C6) — **c'est le comportement attendu, pas un échec** |
| — | — | le comportement de **Gatekeeper**, la notarisation (C.3) |

**Ce que le gate humain doit vérifier nommément, et qu'aucun test ne peut établir** :
1. que l'annonce d'étape est **lisible et comprise** avant d'accorder — c'est R-M4, et c'est le seul
   point du contrat AR-4 qui ne se prouve qu'avec des yeux ;
2. qu'un **refus** à mi-chaîne laisse la machine dans l'état que l'écran décrit (`etatAtteint`), et
   que la **commande de reprise** affichée fonctionne réellement ;
3. qu'un **échec de l'étape 4 après une étape 3 réussie** rend un rollback dont l'écran énonce **ce
   qui a été défait ET ce qui ne l'a pas été** (AR-5, garde 3).

**Actes refusés aux agents, appartenant au décideur** : publier une version du CLI, pousser un tag,
créer une release, passer un dépôt public, poser un secret dans les réglages d'un dépôt.

---

## 9. Estimation *(ordre de grandeur assumé et révisable — pas un engagement ferme)*

| Bloc | j-homme | Complexité / risque | Inconnues |
|---|---|---|---|
| **Étape 0 — les mesures dues** | **0,25** | faible… **sauf (0e)** | (0e) est la mesure qui peut **re-cadrer le lot** : si `readline` perd la seconde ligne de consentement, le protocole change de forme. |
| **Ressource embarquée + fixture + `sha256`** | **0,5** | faible | dépend d'AR-P2 **et** d'AR-P3. Si AR-P3 impose d'attendre une publication du CLI, ce bloc **attend**, il ne se contourne pas. |
| **Pont natif Rust** (spawn, lignes, émission, stdin, kill) | **0,75** | **moyenne** | le découpage en lignes est **à nous** sous AR-P1(a) ; c'est ~80 lignes, mais elles portent tout le flux. La résolution de `node` sur les trois OS est le second aléa. |
| **Réducteur + modèle + écran** (aperçu, run, décision éphémère, log délégué, rollback, fin) | **1,0** | moyenne | c'est le gros du travail visible ; aucune inconnue technique, beaucoup de cas d'affichage. |
| **Les trois gardes + CA-I8b + les contrefactuels** | **0,75** | **moyenne-forte** | c'est la partie qui **peut mentir** si elle est bâclée. Le rejeu (CA-P4) est neuf ; la garde d'événements doit rougir **dans les deux sens**. |
| **Doc, `CLAUDE.md`, `PROJET.md`, remise** | **0,25** | faible | — |
| **TOTAL de CE lot (C.2-b)** | **≈ 3,5** *(fourchette 2,5 – 5)* | | |
| *(prérequis, **autre dépôt**, **NON COMPTÉ**)* bump + publication du CLI (AR-P3) | *≈ 0,25* | faible | un acte, pas un lot — mais **il bloque** le début de l'étape 1. |

**Réconciliation avec l'estimation parente, et elle est due.** Le cadrage de C.2-a chiffrait C.2-b
à **≈ 1,5 j**, « conditionné au prérequis, porte CA-I8b ». **Je monte à ≈ 3,5 j**, et l'écart a
trois causes **mesurées**, pas une dérive :
1. **Le pont est à écrire**, pas à configurer (AR-P1) : 1,5 j n'imaginait pas un module Rust de
   transport avec ses tests de découpage.
2. **La ressource est un sous-lot à part entière** (obtention, vérification, cliquet, version) — et
   **AR-P3 a fait apparaître un prérequis que personne n'avait vu** : le contrat a été fusionné sans
   bump, donc `0.39.0` désigne deux artefacts.
3. **CA-I8b coûte ce qu'il coûte.** Il était chiffré comme un test ; c'est une **architecture** (un
   réducteur pur, séparé de l'écran) — c'est d'ailleurs pourquoi il **vaut** quelque chose.

**Les trois inconnues qui peuvent faire glisser ce chiffre, nommées :**
1. **La mesure (0e)** — deux feux verts successifs. Si elle échoue, le protocole se re-cadre
   (côté CLI, donc autre dépôt, donc autre lot).
2. **AR-P3** — si la publication du CLI tarde, ce lot attend son moteur.
3. **Le run réel sur trois OS** (gate humain). Ce n'est pas du j-homme de dev, mais c'est **le seul
   endroit où le lot devient vrai**, et il dépend de machines qui ne sont pas sur ce bureau.

---

## Sources externes, vérifiées le 2026-09-05

- Tauri — versions du cœur (`2.11.5`, 2026-07-01 ; `2.11.4`, 2026-06-28 ; `2.11.3`, 2026-06-17) :
  <https://tauri.app/release/core/>
- Tauri 2 — plugin Shell, installation, **permissions** (`shell:allow-execute`, `shell:allow-spawn`,
  `shell:allow-stdin-write`) et **scope** : <https://v2.tauri.app/plugin/shell/>
- `@tauri-apps/plugin-shell` — `Command.create` / `Command.sidecar`, `spawn()`, `Child.write()`,
  `stdout`/`stderr` `data` : <https://tauri.app/reference/javascript/shell/>
- `tauri-plugin-shell` **2.3.6** (publiée le 2026-08-31) — `CommandEvent` (découpage
  « bytes until a newline (`\n`) or carriage return (`\r`) »), `CommandChild::{write,kill,pid}` :
  <https://docs.rs/tauri-plugin-shell/latest/tauri_plugin_shell/process/enum.CommandEvent.html> et
  <https://docs.rs/tauri-plugin-shell/latest/tauri_plugin_shell/process/struct.CommandChild.html>
- Bogue **ouvert** — sortie flushée non transmise sans saut de ligne :
  <https://github.com/tauri-apps/plugins-workspace/issues/1632>
- Bogue **fermé** — lignes de stdout sautées sur gros volume via le `Command` JS :
  <https://github.com/tauri-apps/tauri/issues/7684>
- Tauri 2 — **embarquer des fichiers** (`bundle.resources`, map source→destination, alias `_up_`,
  `resolveResource`, `$RESOURCE/**`) : <https://v2.tauri.app/develop/resources/>
- NDJSON — spécification `1.0.0` (une ligne = un JSON, terminé par `\n`, UTF-8) :
  <https://github.com/ndjson/ndjson-spec>
