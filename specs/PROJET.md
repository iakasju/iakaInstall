# PROJET — iakaInstall

> Espace Cowork (réflexion). Document de vision et de specs.
> **Aucun code n'est écrit ici** — seulement des décisions et des spécifications.
>
> **Amorcé par 🟡 Odin le 2026-09-03**, à partir des **huit arbitrages tranchés par le décideur**
> le même jour. Tout ce qui suit est soit **arbitré**, soit **mesuré** — rien n'est inventé.
> Ce qui reste à décider est marqué **⬜ à décider** et attend Stéphane.
>
> **Cadrage de référence** (il fait foi, ce document ne fait que le refléter) :
> `~/work/iakaframe/specs/instructions/chaine-complete-install-amorcage-dmg-msi.md`
> (§ 4.0 = les verdicts, § 6.0 = le découpage d'exécution).

---

## Vision

Aujourd'hui, installer la suite iaka demande **trois téléchargements séparés** et autant de gestes
manuels — c'est exactement ce que le décideur a fait le 2026-09-03, à la main, pour mettre son
poste à jour. `iakaInstall` est l'**application d'installation** qui rend ce parcours unique : on
obtient un fichier, on le lance, et les **quatre composants** de la méthode sont posés dans l'ordre,
chacun après validation.

Le projet ne réinvente aucune installation. Il est une **façade** au-dessus du moteur qui vit dans
le CLI `@naonedge/iakaframe` (verbe `install`). C'est la contrainte fondatrice, tranchée en AR-3 :
*une seule implémentation de la logique d'installation, jamais deux.*

## Objectifs

- Un **utilisateur qui n'a rien** obtient les quatre composants en **un téléchargement et un
  lancement**, sur les 4 plateformes (linux-x86_64, windows-x86_64, darwin-aarch64, darwin-x86_64).
- **Chaque étape s'annonce et attend** : quoi, où, quelle version, ce qui existe déjà et sera
  fusionné. `--yes` / « tout accepter » saute l'ensemble (AR-4).
- Un **échec partiel ne laisse pas le poste à moitié installé** : rollback automatique, qui ne
  défait que ce qu'il peut **prouver** avoir changé, ne retire jamais ce qu'il n'a pas posé, et
  **énonce ce qu'il n'a pas su défaire** (AR-5).
- **Zéro logique d'installation dupliquée** : tout ce que fait l'interface doit être faisable en
  ligne de commande, et testable sans elle.

## Périmètre

**Dans le scope :**
- L'**application d'installation** (façade graphique), 3ᵉ app Tauri du portefeuille.
- Les **deux véhicules d'amorçage** : un `.dmg` et un `.msi` qui **posent l'application**.
- L'ossature de distribution : `release.yml` à matrice 4 plateformes, épinglée au SHA (lot B′-a),
  puis vitrine / manifeste / canaux / convergence après la première release réelle (lot B′-b).

**Hors scope (pour l'instant) :**
- **La logique d'installation elle-même** — elle vit dans le CLI (verbe `install`, lot A du
  cadrage), pas ici. C'est AR-3, et c'est structurant.
- **Le chaînage natif Windows** (bundle WiX Burn) : il produirait un `.exe`, pas un `.msi` (AR-C).
- **La notarisation Apple** : dépendance déclarée, pas travail d'exécution (AR-D — voir ci-dessous).
- Désinstallation · mise à jour des quatre composants en une passe (c'est un **autre** verbe, à
  cadrer séparément).

---

## Stack technique — décision

> **Fondement : AR-E(a).** Le dépôt est neuf plutôt qu'une seconde app logée chez un frère, parce
> que toute la mécanique de distribution de ces dépôts est **mono-application par construction**
> (`vitrine-assets.json` substitue un seul `{APP}` tiré du `productName` unique ; `latest.json`
> décrit une app ; `VERSION_CARRIERS` garde les porteurs d'**une** version). Loger une 2ᵉ app chez
> un frère ferait diverger les trois d'un coup, et le premier symptôme serait une vitrine qui ment.
> **Ce dépôt duplique une convention éprouvée ; il n'en invente pas une.**

| Couche | Choix | Raison |
|---|---|---|
| Frontend | React 18.3.1 + TypeScript 5.5.4 + Vite 6 | **Mesuré identique** chez `iakaFrameGUI` et `IakaCockpit` (2026-09-03) — convention à répliquer |
| Application | Tauri 2 (`@tauri-apps/api` ^2, `@tauri-apps/cli` ^2) | Idem ; et les véhicules `.dmg`/`.msi` **tombent gratuitement** de sa matrice de bundles |
| Tests | Vitest ^4.1.9 | Idem frères |
| Moteur d'installation | **aucun ici** — le CLI `@naonedge/iakaframe` | AR-3 : façade, jamais seconde implémentation |
| Hébergement / distribution | Forgejo NAS (`origin`) + GitHub (`github`) ; artefacts sur les **releases GitHub** | Convention du portefeuille ; l'iakabox a été retirée des endpoints le 2026-09-03, motif écrit |

---

## Sources de données / dépendances externes

| Besoin | Source | Quota / coût | Stratégie en dev |
|---|---|---|---|
| Tarball du CLI | Release GitHub `iakasju/iakaframe` | gratuit | voie publique **actée** par AR-H(a) — le registre npm `@naonedge` n'est pas joignable depuis Internet |
| Bundles des 2 apps | Releases GitHub `IakaCockpit`, `iakaFrameGUI` | gratuit | déjà 9 clés / 4 plateformes / toutes signées (lot B **livré**) |
| Signature updater | Clés minisign (secrets CI) | gratuit | en place |
| **Notarisation macOS** | Apple Developer Program | **99 $/an — non acquis** | **AR-D(b)** : le CI est livré **prêt à notariser**, l'étape se **saute en le disant** quand les secrets Apple manquent (modèle des secrets minisign), et l'absence est **déclarée** en vitrine |

---

## Architecture

```
                    +----------------------------+
   1 telechargement |  .dmg (macOS) / .msi (Win) |   <- les VEHICULES : ils AMORCENT
                    |  = ils POSENT l'app        |      ils n'enchainent pas (AR-B, AR-C)
                    +-------------+--------------+
                                  | pose
                                  v
                    +----------------------------+
                    |   iakaInstall (Tauri)      |   <- LA FACADE : affiche, demande, rend lisible
                    |   n'implemente RIEN         |      l'echec et le rollback (AR-3)
                    +-------------+--------------+
                                  | appelle
                                  v
                    +----------------------------+
                    |  moteur = CLI iakaframe    |   <- LA LOGIQUE, testable sans interface
                    |  verbe `install`           |
                    +-------------+--------------+
                                  |
            +---------+-----------+-----------+-----------+
            v         v                       v           v
        1. CLI    2. methode              3. Cockpit  4. FrameGUI
        (tarball) (kit ~/.claude)         (bundle)    (bundle)
        \_____________________/           \_______________________/
          aucun telechargement              2 telechargements
          separe : le CLI porte
          la methode

   4 etapes / 3 telechargements  <- les DEUX comptes sont affiches (AR-A)
   Chaque etape : s'annonce, attend le feu vert, peut etre rollbackee (AR-4, AR-5)
```

---

## Backlog des features

Chaque feature reçoit son fichier dans `specs/instructions/` AVANT implémentation.
**L'ordre ci-dessous est celui du § 6.0 du cadrage — il n'est pas librement permutable** (voir
« Décisions structurantes », entrée sur la dépendance `productName`).

| # | Feature | Instruction | État |
|---|---|---|---|
| 3 | **C.1 — le moteur de chaîne** (dans `iakaframe`, pas ici) | `iakaframe/specs/instructions/chaine-complete-…md` § 5.4 | bloqué par lot A |
| 4 | **C.2 — la façade** + **B′-a — l'ossature CI** | à écrire | **premier lot de CE dépôt** |
| 5 | **C.3 — première release + les 2 véhicules** | à écrire | après C.2 |
| 6 | **B′-b — vitrine, manifeste, canaux, convergence** | à écrire | **après une release RÉELLE**, jamais avant |

---

## Décisions structurantes (journal)

> Trace courte des arbitrages importants — le « pourquoi » qui se perd sinon.

- **2026-09-03** — **Les huit arbitrages du cadrage sont tranchés, 8/8 conformes à la
  recommandation du cadreur.** Conséquence inscrite : les **motifs** de chaque arbitrage font
  désormais partie de la décision — on ne peut plus les contredire à l'implémentation sans rouvrir
  l'arbitrage. Détail en § 4.0 du cadrage de référence.
  - **AR-A (a)** — l'interface annonce **4 étapes / 3 téléchargements**, les deux comptes visibles.
    Fusionner CLI+méthode en une étape masquerait l'écriture dans `~/.claude` derrière un
    consentement donné pour `/usr/local/lib`.
  - **AR-B (a)** — véhicule macOS = **`.dmg` portant l'app**. Un `.pkg` mettrait sa logique dans
    des scripts `postinstall` = seconde implémentation (interdit par AR-3), et sans validation par
    étape possible. Tauri ne sait pas produire de `.pkg`.
  - **AR-C (a)** — véhicule Windows = **`.msi` posant l'app**. Fait dur : **il n'existe aucune
    forme de `.msi` qui en enchaîne d'autres** — les installations imbriquées sont dépréciées et
    déconseillées pour le public par Microsoft. Un chaînage natif s'appellerait un `.exe` (Burn).
  - **AR-D (b)** — notarisation en **dépendance déclarée**. Motif : (a) ne dépend pas de nous
    (achat + compte), l'inscrire au périmètre rendrait le lot non livrable pour une raison
    étrangère au lot ; (c) serait malhonnête. Trois exigences attachées, non négociables :
    déclaration d'absence dans `fixtures/vitrine-locale.json` (motif, date, condition de levée,
    avec cliquet qui rougit dès que l'absence devient fausse) · **procédure Sequoia exacte** au
    README (le contournement Control-clic **n'existe plus**) · étape CI sautée **en le disant**.
  - **AR-E (a)** — **ce dépôt existe pour cette raison** (voir § Stack).
  - **AR-F (a)** — « le plus récent gagne ; **à égalité, le vivant** ». L'égalité est le **cas
    nominal, pas un `else`** : `_bundled/VERSION` est *dérivé* de `cli/package.json`, donc sur le
    poste du décideur les deux versions sont égales **par construction**. Version indéterminée
    (une frame sans `cli/`) ⇒ le vivant l'emporte quand même **et la provenance le dit**.
  - **AR-G (a)** — l'étape 1 a **deux sens** : vraie première install quand la façade la joue,
    **mise à jour** quand le CLI la joue. Un message unique mentirait dans l'un des deux cas.
  - **AR-H (a)** — la voie publique du CLI est le **tarball de release GitHub**, pas un registre
    npm. Ferme sans objet l'inconnue « désigner un 3ᵉ registre » d'AR-7.

- **2026-09-03** — **`productName` = `iakaInstall`, identique au nom du dépôt.** Décision du
  décideur. Elle **fige** ce qui commande toute la chaîne de distribution : la vitrine y substitue
  son `{APP}`, le manifeste updater et les artefacts en tirent leur nom. Conforme à la convention
  **mesurée** chez les deux frères, où `productName` égale déjà le nom du dépôt (`iakaFrameGUI`,
  `IakaCockpit`). Conséquence pour l'exécution : les artefacts s'appelleront `iakaInstall_<version>_*`
  et le nom **ne doit plus bouger** — en changer après C.2 casserait vitrine, manifeste et
  convergence d'un seul coup.

- **2026-09-03** — **L'ordre des lots n'est pas librement permutable.** `B′` ne peut pas précéder
  `C.2` : toute la convention de distribution **dérive du `productName` de `tauri.conf.json`**, qui
  n'existe qu'une fois l'application créée. Et `B′-b` exige une **release réelle** — avant elle, la
  garde de vitrine ne peut rendre qu'un `SKIP`, c'est-à-dire **une garde verte qui n'a rien
  mesuré**. (Correction apportée par le cadreur à un découpage d'Odin qui était faux.)

- **2026-09-03** — **Défaut de signature macOS mesuré, qui vise ce projet en plein.** Les bundles
  publiés portent une signature **ad-hoc invalide** : `codesign -v --deep --strict` et `spctl`
  échouent **sur l'app telle qu'elle est dans le DMG**, avant toute copie. Une installation faite
  avec `gh release download` **réussit et trompe** (`gh` ne pose pas `com.apple.quarantine`) ; un
  utilisateur qui télécharge **par navigateur** est bloqué par Gatekeeper. Un installeur que
  Gatekeeper bloque est un installeur qui n'installe pas → c'est ce qui rend AR-D structurant, et
  non cosmétique. *Cause établie par lecture (aucune section `bundle.macOS`, aucun `signingIdentity`,
  aucun secret Apple dans les `release.yml`) ; symptôme mesuré par Odin, à re-mesurer à l'exécution
  en citant la sortie.*

---

## ⬜ Ce qui reste à décider — attente Stéphane

> **Mis à jour le 2026-09-04** par 🔵 Gandalf, au cadrage du lot **C.2 + B′-a**. Les quatre points
> ci-dessous sont **soumis au décideur avec une recommandation motivée** dans
> `specs/instructions/facade-installeur-tauri-ossature-release.md` § 3 — les motifs y sont, ils ne
> sont pas recopiés ici.

- **AR-I1 — Quand la façade pilote-t-elle réellement la chaîne ?** ⚠️ **Fait mesuré qui rouvre la
  question** : le verbe `install` **n'émet aucune sortie machine** (`--json` est déclaré au registre
  et ne produit que de la prose), et **aucun canal ne permet un feu vert par étape hors TTY** — le
  seul moyen de faire avancer la chaîne depuis un programme est `--yes`, qui **saute toutes** les
  validations (AR-4 nié). La façade décrite par le cadrage n'est donc **pas implémentable** sans
  parser de la prose, c'est-à-dire sans réaliser **R3**.
  *Reco : **(b)** scinder — **C.2-a + B′-a maintenant** (ils ne dépendent de rien), et un prérequis
  nommé côté `iakaframe`, `CONTRAT-MACHINE-DU-VERBE-INSTALL`, cadré et joué en parallèle, avant
  **C.2-b** (le pilotage réel).*

- **AR-I2 — Comment la façade atteint-elle le moteur ?** Sous-processus du CLI installé / ressource
  Node embarquée / sidecar Tauri. *Reco : **ressource embarquée** exécutée par le `node` du poste —
  le prérequis Node/npm **existe déjà**, l'étape 1 du moteur `spawn` littéralement `npm`. Le sidecar
  est nommé successeur (`SIDECAR-CLI-AUTONOME`), sa condition d'entrée étant de servir des postes
  **sans Node**.*

- **AR-I3 — Charte visuelle.** **Dix** chartes disponibles au réservoir `iakagraph/theme/`
  (`naonedge-dark`, `naonedge-light`, `grimoire-dark-fantasy`, `os-windows`, `os-ubuntu`,
  `os-android`, `os-macos`, `cartoon-std`, `photoreal-modern`, `studio-clair`).
  *Reco : **`naonedge-dark`**, **une seule** charte, **aucun sélecteur** — c'est le premier écran du
  produit, il dit la marque. Geste déjà écrit : `IakaCockpit/scripts/sync-chartes.sh` (pont de
  23 variables), tokens servis en `'self'`. Une marque propre à `iakaInstall` serait 🎨 Loki
  (successeur `MARQUE-IAKAINSTALL`).*

- **AR-I4 — Visibilité du dépôt.** Mesure qui déplace la question : Actions est **gratuit et
  illimité** sur un dépôt **public**, alors qu'un dépôt **privé** consomme 2 000 min/mois avec
  **macOS décompté ×10** — et la matrice porte **deux** jobs macOS. Techniquement B′-a fonctionne en
  privé ; **économiquement non**, et **C.3 l'exige public**.
  *Reco : **passer public avant le premier run de B′-a**, après le balayage de secrets (CA-I13) —
  les deux sœurs sont publiques depuis le 2026-08-28, et ce dépôt est neuf. **Acte du décideur**,
  refusé aux agents. (Visibilité actuelle de `iakasju/iakaInstall` : **non mesurée** — le remote
  existe, `.git/config:15`, mais son état demande un appel authentifié non joué.)* ⬜ **Toujours
  ouvert au 2026-09-05** — non touché par le lot C.2-b.

> **AR-I1/AR-I2/AR-I3 — résolus par l'implémentation.** AR-I1 : **(b)** joué — le prérequis
> `CONTRAT-MACHINE-DU-VERBE-INSTALL` est livré côté `iakaframe` (CLI `0.40.0`), C.2-b (ce lot)
> pilote réellement la chaîne au travers de lui. AR-I2 : ressource embarquée, précisée en AR-P2/
> AR-P3 ci-dessous. AR-I3 : la charte retenue à l'implémentation est **`studio-clair`** (et non
> `naonedge-dark` recommandé alors) — voir `CLAUDE.md` § stack.

### Verdicts du lot C.2-b (2026-09-05) — DÉCIDÉS, non « à décider »

> Rendus par Stéphane le 2026-09-05 (relayés par Aragorn, *« comme reco »*), tranchant les cinq
> arbitrages de `specs/instructions/pilotage-reel-facade-contrat-machine.md` § 3. Consignés ici
> pour mémoire — la recommandation motivée complète reste dans l'instruction, elle n'est pas
> recopiée.

- **AR-P1 → (a)** Rust pilote le processus (`std::process::Command`), zéro plugin, zéro
  permission ouverte à la webview. *Implémenté : `src-tauri/src/pilote.rs`.*
- **AR-P2 → (b)** la ressource embarquée est l'arbre extrait **au build** depuis l'asset de
  release GitHub épinglé (version + `sha256` en fixture, vérifiés **avant** extraction) ; repli
  (a) (arbre committé) documenté mais non retenu. *Implémenté : `scripts/embarquer-cli.mjs`,
  `fixtures/cli-embarque.json`.*
- **AR-P3 → (a)** bump du CLI en `0.40.0` et publication **avant** ce lot — **fait** (release
  GitHub `v0.40.0`, asset `naonedge-iakaframe-0.40.0.tgz`, `sha256`
  `21fe0f9421cf14af97a273d7f06bb645e980004ae8c53efc028c359716ca1032`, mesuré deux fois : par
  Aragorn puis re-mesuré par Gimli à l'étape 0 — identique).
- **AR-P4 → (a)** bac à sable obligatoire en test/dev (`IAKAINSTALL_SANDBOX` force
  `--target-claude`/`--apps-dir`/`--backup-dir`, refuse tout chemin sous `$HOME/.claude` ou
  `$HOME/Applications`) ; le run réel non isolé reste le produit, hors tests, gate humain.
- **AR-P5 → (a)** ressource épinglée, remontée à chaque release de la façade (un lot, pas un
  geste) ; successeur nommé `RESSOURCE-CLI-RAFRAICHIE-EN-LIGNE`, condition d'entrée non mesurée
  (aucune release de la façade n'a encore eu lieu).

### `RELEASE-PARTIELLE-PUBLIEE` — successeur ⬜ à décider (constaté au premier run réel, 2026-09-05)

> Consigné par ⚒️ Gimli (ordre de mission Aragorn, correctif `fix/embarquer-cli-windows`), **sans
> le corriger** : hors périmètre du correctif. Le fait est mesuré, pas la décision.

Le tag `v0.1.0` a joué le premier run réel du workflow de release (run `33963420727`) : `prepare`
et les builds `linux` / `macos-x64` / `macos-arm64` ont réussi, **`build windows` a échoué**
(ressource CLI absente, cause détaillée dans `CLAUDE.md` § Backlog). Le job `latest` a pourtant
**réussi** : la release `v0.1.0` a été publiée **non-brouillon**, avec seulement 7 des 9 assets
attendus (ni `.msi` ni `.exe`), et `releases/latest` a été avancé dessus. C'est exactement le
risque **R8** du cadrage parent (« on déclare livré ce qui n'est que buildé ») — réalisé, pas
seulement redouté.

Deux voies possibles, **non tranchées** :
- publier la release en **brouillon** (`draft: true`) tant que la matrice complète n'a pas
  réussi, un humain la publie ensuite manuellement ;
- ou poser un `needs:` **strict** sur le job `latest` couvrant **tous** les jobs de build de la
  matrice (pas seulement ceux déjà requis), pour qu'un job en échec bloque `latest` lui-même.

> **Mitigation appliquée le 2026-09-05** (verdict Stéphane « pre release », appliqué par 🟠 Aragorn) : la
> release `v0.1.0` est passée en **pré-release** avec une note explicative ; `releases/latest` répond
> désormais **404** — aucune release complète n'existe, et c'est exact. `v0.1.1` (correctif Windows,
> gate PASS) sera la première `latest` si la matrice passe à 4/4. La décision de fond (brouillon ou
> `needs` strict) reste ⬜.

> **⬜ « Attente Stéphane » ci-dessus est un ÉTAT ANTÉRIEUR, conservé tel quel** (rien n'était
> encore touché au workflow à ce moment). **Il est dépassé par le verdict daté ci-dessous.**

### Verdict du lot `RELEASE-PARTIELLE-PUBLIEE` (2026-09-05) — DÉCIDÉ ET LIVRÉ

> Rendu par Stéphane le 2026-09-05 (relayé par Aragorn, *« comme reco »*), tranchant les six
> arbitrages de `specs/instructions/release-partielle-publiee.md` § 3. Implémenté par ⚒️ Gimli,
> branche `feat/release-brouillon-jusqua-matrice-verte`, **REMIS AU GATE 🏹 Legolas, non
> auto-validé** — la recommandation motivée complète reste dans l'instruction, elle n'est pas
> recopiée ici.

**AR-1 → (a)** `releaseDraft: true` dans l'étape `tauri-action` du job `build` ; job neuf
`publier` en `needs: [build]` **strict** (sans `if:`), inséré **avant** le bloc `latest:` du
workflow ; le job `latest` passe en `needs: publier` (`if: always()` conservé, motif daté dans
le fichier). **AR-2 → (b)** confirmée à l'étape 0 : lecture ligne par ligne de `tauri-action` au
SHA épinglé `84b9d35b5fc46c1e45415bdb6144030364f7ebc5` — `releaseId` court-circuite
**entièrement** la recherche/création de release (`src/index.ts:178`,
`if (tagName && !releaseId)`), et attache directement les artefacts à cet id
(`src/index.ts:211`). Le brouillon est donc créé **une seule fois**, sérialisé dans le job
`prepare`, son `release_id` passé aux 4 jobs de la matrice — la course F8
(`tauri-apps/tauri-action#914`) est fermée **par construction**. Le job `publier` reste le
filet de secours **nommé** : il échoue explicitement s'il trouve zéro ou plus d'un brouillon
pour le tag. **AR-3 → (a)** un brouillon laissé par une matrice rouge **reste**, daté (titre
`releaseName` = tag), **jamais supprimé** par l'agent. **AR-4 → `iakaInstall` seul** — voir
« Successeurs nommés » ci-dessous. **AR-5 → (a) bornée** : entrée `casser` du
`workflow_dispatch` (`aucune` par défaut, ou une clé de plateforme), lue **uniquement** sous
`github.event_name == 'workflow_dispatch'` (garde statique dessus), étape de sabotage placée
**avant** `tauri-action` ; le run qui l'active est réservé au décideur. **AR-6 → (a)** garde
statique par lecture du **texte** du workflow (regex, zéro dépendance, cohérente avec les trois
cliquets déjà en place), limite déclarée **dans le fichier de garde lui-même**
(`scripts/lib/release-publication.mjs`).

**Étape 0 mesurée par ⚒️ Gimli le 2026-09-05** (jamais reprise du rapport d'un autre agent) :
état réel des releases concordant avec le rapport d'Aragorn (`v0.1.0` non-brouillon 7 assets,
passée en pré-release par mitigation manuelle ; `v0.1.1` = `latest`, 9 assets) ; chaîne qualité
verte avant toute modification ; empreinte du bloc `latest:` confirmée `f5de9ecb…` avant
modification ; lecture au SHA épinglé de `src/index.ts` et `src/create-release.ts` (citations
de lignes ci-dessus) ; mesure en lecture seule des runs passés d'`IakaCockpit` et
`iakaFrameGUI` — aucune n'a d'historique 100 % 4/4, au moins un job de build rouge par sœur
dans les runs `workflow_dispatch` récents (mécanisme identique à celui corrigé ici, confirmé
par la lecture de code du § 0.5 de l'instruction) ; endpoint `repos/<depot>/releases` confirmé
rendant le champ `draft` par release (adressage par `id` retenu, jamais par tag, F7).

**Successeurs nommés, demandés nommément à 🟠 Aragorn / au décideur (CA-R11)** — le canal
d'écriture de ⚒️ Gimli est borné à `specs/instructions/` **de ce dépôt**, l'inscription aux
backlogs des sœurs n'est pas son geste :
- `RELEASE-BROUILLON-JUSQUA-MATRICE-VERTE-COCKPIT` → backlog `IakaCockpit`.
- `RELEASE-BROUILLON-JUSQUA-MATRICE-VERTE-GUI` → backlog `iakaFrameGUI`.
- `PUBLICATION-VERIFIE-LES-ASSETS` → backlog de **ce** dépôt (inscrit, `CLAUDE.md` § Backlog) :
  ce lot ferme « build rouge → release publiée », pas « build vert et vide → release publiée ».

**Non couvert par construction, gate humain déclaré (CA-R8/CA-R9)** : seul un run réel avec un
build volontairement cassé (`casser`) prouve que la release reste brouillon et que
`releases/latest` ne bouge pas ; seul un run réel 4/4 vert prouve que `publier` publie et que
`latest` désigne. Procédure complète et gardes-fous : `CLAUDE.md` § Backlog,
`specs/instructions/release-partielle-publiee.md` § 5.7 et § 8.

### Verdicts du lot C.3 + B′-b — « la vitrine à trois frères » (2026-09-05) — DÉCIDÉS ET LIVRÉS

> Rendus par Stéphane le 2026-09-05 (relayés par Aragorn, *« comme reco »*), tranchant les six
> arbitrages de `specs/instructions/amorcage-c3-vitrine-trois-freres.md` § 3. Implémenté par
> ⚒️ Gimli, branche `feat/vitrine-trois-freres`, **REMIS AU GATE 🏹 Legolas, non auto-validé** — la
> recommandation motivée complète reste dans l'instruction, elle n'est pas recopiée ici.

**AR-V1 → (a)** un seul lot dans `iakaInstall` : ce qui restait de C.3 (notarisation déclarée,
écart AR-C(a) écrit) et B′-b sont livrés ensemble — la release réelle était déjà faite (`v0.1.1`,
9 assets, 4/4), ce qui en restait est de la matière de vitrine. **AR-V2 → (a)** clé neuve
`absences_de_signature` dans `fixtures/vitrine-locale.json` (deux entrées : notarisation macOS,
signature Windows), `rendreSecurite()` + zone `securite` ajoutées à la copie locale de
`scripts/lib/vitrine.mjs` avec cartouche de divergence en tête, **cliquet offline**
(`ecartsCliquetSecurite`) éprouvé par contrefactuel (câblage `env:` APPLE_*/WINDOWS_* fictif
injecté en mémoire → rougit nommément → révoqué, empreinte `sha256` du fichier réel inchangée).
**AR-V3 → (a)** updater de la façade **dehors** — successeur nommé `UPDATER-DE-LA-FACADE`
(`CLAUDE.md` § Backlog), condition d'entrée non remplie (pas de paire minisign posée, pas de
seconde version publiée) ; `fixtures/canaux-publication.json` exclu en conséquence. **AR-V4 → (a)**
`iakaInstall` **copie** les cinq fichiers de la convention (byte-identiques entre `IakaCockpit` et
`iakaFrameGUI`, vérifié par empreinte à l'étape 0.4) mais **n'entre PAS** au registre de
convergence des sœurs — successeur nommé `CONVERGENCE-TROIS-FRERES` (`CLAUDE.md` § Backlog),
mandat en trois points écrit là-bas. **AR-V5 → (b)**, tranché par la mesure de l'étape 0.3 : lu au
tag `@tauri-apps/cli-v2.11.4` (celui que résout `package-lock.json` de ce dépôt), `keychain()`
(`crates/tauri-bundler/src/bundle/macos/sign.rs:19-44`) entre en branche de signature dès que
`APPLE_CERTIFICATE`/`APPLE_CERTIFICATE_PASSWORD` sont **présentes, même vides**, dans
l'environnement du process — et GitHub Actions pose une variable `env:` référençant un secret
absent comme une chaîne vide mais **présente**. Câbler ces deux clés sur l'étape `tauri-action`
sans que les secrets existent aurait donc décodé un p12 vide et cassé la matrice 4/4 verte
(`tauri-apps/tauri-action#291`). L'étape de notarisation posée dans `release.yml` **n'écrit donc
aucun `env:` APPLE_\*** sur `tauri-action` ; elle imprime son verdict en lisant la présence des
secrets par expression GitHub Actions (`${{ secrets.X }}`, substitution textuelle, aucune
variable d'environnement créée — donc sans le risque mesuré). **AR-V6 → (a)** Gatekeeper **et**
SmartScreen déclarés dans le même bloc `absences_de_signature`, chacun avec sa procédure exacte
et sa condition de levée propre (macOS : achat seul ; Windows : achat **et** réputation qui se
construit avec le temps).

**Étape 0 mesurée par ⚒️ Gimli le 2026-09-05** : 9 assets de `v0.1.1` re-mesurés via
`gh release view`, tailles identiques à celles transmises par Aragorn, aucun `.sig` ni
`latest.json`, `releases/latest = v0.1.1`, `v0.1.0` en pré-release (confirmé) ; symptôme F-d
mesuré sur l'asset **réel téléchargé** (`iakaInstall_0.1.1_aarch64.dmg`, monté, `codesign -dv
--verbose=4` → `Signature=adhoc`, `TeamIdentifier=not set` ; `spctl -a -vv` → rejeté, exit non
nul) ; lecture de `action.yml` au SHA épinglé (aucune entrée Apple) **et** de la source Rust de
`tauri-bundler`/`tauri-macos-sign` au tag résolu par ce dépôt (verdict AR-V5 ci-dessus) ; **les
cinq fichiers de vitrine comparés par empreinte entre `IakaCockpit` et `iakaFrameGUI` : AUCUNE
divergence** (`fixtures/vitrine-assets.json`, `scripts/lib/vitrine.mjs`, `scripts/vitrine.mjs`,
`scripts/vitrine-en-ligne.mjs`, `scripts/__tests__/vitrine.test.mjs`, cinq empreintes `sha256`
identiques de part et d'autre) — le lot ne s'est donc **pas** arrêté sur l'inconnue 0.4 ; chaîne
qualité verte avant toute modification (`typecheck` `0`, `lint` `0`, `test` `91 passed (91)`,
`cargo test` `22 passed`).

**Preuve mesurée après implémentation** — `npm run typecheck` `0` ; `npm run lint` `0` ;
`npm run test` `0`, **`127 passed (127)`** (avant : `91` — **+36 tests, aucun supprimé**) ;
`cargo test` `0`, `22 passed` (**aucun `.rs` ni `tauri.conf.json` modifié : pas de build Tauri à
rejouer**) ; `npm run vitrine:check` → `0` ; `npm run vitrine:en-ligne` sur la release réelle
`v0.1.1` → **`0`**, concordance citée, jamais un `3` présenté comme un succès ; `IakaCockpit` et
`iakaFrameGUI` intacts (`fixtures/convergence.sha256` toujours à 90 lignes de part et d'autre,
`git diff --stat` vide sur ce fichier dans les deux dépôts). **Écart déclaré, sans rapport avec ce
lot** : `IakaCockpit` porte un diff local pré-existant sur `.claude/settings.local.json` (fichier
de configuration d'outil, hors du périmètre de ce lot, non touché par ⚒️ Gimli) — `git status`
n'y est donc pas strictement vierge, mais aucun fichier de la convention de vitrine n'y est
modifié.

**Non couvert par construction, gate humain déclaré (§ 8 de l'instruction)** : téléchargement du
`.dmg` par navigateur sur un Mac vierge (Gatekeeper, procédure Sequoia telle qu'écrite) ; `.msi`
sur Windows réel (SmartScreen) ; `.deb`/AppImage sur Linux réel ; `.dmg` Intel sur Mac Intel ;
l'étape de notarisation s'exécutant dans un run CI réel (exige un push de tag, acte du décideur) ;
poser les secrets Apple/Windows dans les réglages du dépôt (acte du décideur).

**Successeurs nommés (backlog `CLAUDE.md`, non traités par ce lot)** : `CONVERGENCE-TROIS-FRERES`
(à jouer dans les deux sœurs) et `UPDATER-DE-LA-FACADE` (condition d'entrée : paire minisign posée
par le décideur + seconde version publiée).

### Exécution AR-P5(a) — remontée CLI 0.40.0 → 0.41.0 + release v0.1.2 (2026-09-06)

> Premier lot qui joue réellement AR-P5(a) (« ressource épinglée, remontée à chaque release de
> la façade, un lot pas un geste ») : la sœur `iakaframe` a publié `v0.41.0`, qui ouvre les
> étapes 3/4 (IakaCockpit, iakaFrameGUI) à **Linux** (AppImage) et **Windows** (`.exe` NSIS), en
> plus de macOS. Implémenté par ⚒️ Gimli, branche `chore/ressource-cli-0.41.0`, **REMIS AU GATE
> 🏹 Legolas, non auto-validé**.

`fixtures/cli-embarque.json` remonté à `0.41.0` (`naonedge-iakaframe-0.41.0.tgz`, 697 967 octets,
sha256 `d8799b7d6ac32cb7d336def415588c1f739d78d8cce56336c42253615b2594f7`, re-mesuré). Vocabulaire
fermé **inchangé** entre 0.40.0 et 0.41.0 (conforme AR-W8) — seul `VERSION_RESSOURCE` bouge.
`src/coverage.ts` (indice pré-flux) **corrigé** : il affirmait encore « seule macOS couverte »,
devenu faux avec `cleManifestePlateforme` côté CLI 0.41.0 (couvre désormais aussi linux/x64 et
windows/x64) — l'indice mentait par omission, `etapes34Couvertes` prend maintenant l'architecture
en compte. Façade bumpée `0.1.1` → `0.1.2` (5 fichiers), README régénéré par la vitrine.
**Correctif incidentel** : la note de sécurité citait un nom de fichier versionné en dur
(`iakaInstall_0.1.1_aarch64.dmg`) que la garde CA-10 lit comme une promesse — reformulée sans
répéter de nom de fichier versionné. `fixtures/flux-apercu.ndjson` ré-enregistrée contre 0.41.0
(rejeu réel en bac à sable) : **7 des 74 lignes changent** (1, 2, 3, 4, 6, 8, 11) — 3 (1, 3, 4)
ne changent que le numéro de version, 4 (2, 6, 8, 11) changent aussi de **chemin**
(`reservoir.embarqueDir`/`installMjsPath`/`provenance`, `sourceRetenue.pourquoi` de l'étape 2,
deux lignes de log `Kits`/`Kit`) parce que ce rejeu pointe `--root` directement sur la ressource
embarquée **en place** (`src-tauri/resources/cli`, comme le fait déjà défaut
`scripts/rejeu-vivant.mjs`) plutôt que sur une extraction scratch comme le premier enregistrement
(0.40.0) — **pas** un changement de comportement du CLI. Aucun test n'assure la **valeur** de ces
chemins : vérifié par grep (rien) et par lecture de `scripts/__tests__/rejeu-flux-apercu.test.mjs`,
qui ne compare qu'**en auto-référence** (le modèle rejoué contre l'événement de la même fixture),
jamais contre une valeur figée en dur. Le reste du flux (étapes 3/4, `darwin-arm64`) est
structurellement identique. Chaîne qualité complète verte (typecheck/lint/129 tests/build/cargo
test·fmt·clippy/`tauri build --target aarch64-apple-darwin` depuis un arbre sans ressource
préalable — `.app` vérifié en 0.41.0/vitrine:check). Détail complet, preuve mesurée et commande de
tag : `docs/releases/v0.1.2.md` + `.tagmsg`.

**Preuve de ce que « installeur complet Windows/Linux » veut dire côté moteur** — re-vérifiée en
lecture seule (`gh run view`, `gh api compare`), pas reprise telle quelle du rapport d'un autre
agent : deux runs réels du banc CI d'`iakaframe` (`banc-etapes-3-4.yml`). Run `33997947501`
(`headSha e34c1af9…`, 2026-09-05T23:10:29Z) — `banc (ubuntu-latest)` `success`, `banc
(windows-latest)` `failure` (rollback NSIS : `uninstall.exe /S` sans `_?=<InstallLocation>`, code
`0` mais clé de registre encore présente — **avant** correctif). Run `33999564308` (`headSha
3baf20ec…`, 2026-09-05T23:46:48Z) — `banc (windows-latest)` `success`, 16 mesures dont 15 `PASS`
(1 `NON-MESURE` : UAC compte non-admin — **après** correctif). Le tag `v0.41.0` est **postérieur
aux deux runs et inclut le correctif** :
`gh api repos/iakasju/iakaframe/compare/3baf20ec5a773f11c82bfe63471ad1a252b20588...v0.41.0` →
`{"ahead_by":8,"behind_by":0,"status":"ahead"}` — le `headSha` du run 2 (post-correctif) est un
**ancêtre direct** de `v0.41.0`. La ressource remontée dans ce lot embarque donc bien le correctif
de rollback Windows mesuré vert, pas seulement le code d'avant le fix.

**Non couvert, gate humain déclaré** : UAC sur compte Windows non-administrateur, SmartScreen
(aucun certificat Windows posé), Gatekeeper/notarisation macOS (signature AD HOC), recette réelle
de l'installeur unifié sur les trois OS.
