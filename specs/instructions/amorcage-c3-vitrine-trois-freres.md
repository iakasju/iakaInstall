# C.3 + B′-b — l'amorçage et la vitrine à trois frères

> Cadré par 🔵 **Gandalf** le **2026-09-05**, sur ordre de mission de 🟠 Aragorn.
> **Lecture seule sur le code.** Cadrage parent, non rediscuté :
> `/Users/sjupin/work/iakaframe/specs/instructions/chaine-complete-install-amorcage-dmg-msi.md`
> — § 3 (forme réelle des véhicules), § 4.0 (les huit verdicts), § 5.2 (B′-a / B′-b),
> § 6.1 étapes 14-18, § 8 (R1, R7, R8), § 9 (CA-16 à CA-20).
>
> **Ce cadrage ne rouvre aucun des huit arbitrages du parent.** Il ferme le périmètre de ce qui
> reste de **C.3** après la release réelle du 2026-09-05, et celui de **B′-b**.
>
> **Hors périmètre, renvoyé à son propre lot** : la politique **brouillon / `needs` strict /
> `latest`** (`RELEASE-PARTIELLE-PUBLIEE`, `specs/PROJET.md:268-294`). Un autre cadrage la traite
> en parallèle — **ne rien décider ici**, ne pas toucher `.github/workflows/release.yml` sur ce
> point.

---

## 0. Ce qui a été mesuré le 2026-09-05

### 0.1 — Instruments, et la limite qui les borne

Mesures faites **par lecture de fichiers** (`Read`, `Grep`, `Glob`) et par **vérification web**
pour les faits externes. **Je n'ai eu aucun shell dans cette session de cadrage.**

Conséquence, énoncée pour qu'elle ne soit pas oubliée : **je n'ai exécuté ni `npm`, ni `gh`, ni
`git`, ni `codesign`, ni `spctl`, ni `curl`.** Aucun chiffre de sortie de commande n'apparaît
ci-dessous sous ma signature. Les faits de release (identifiants de run, tailles d'assets, contenu
du `.app`) me sont **transmis par 🟠 Aragorn** et sont **attribués comme tels** en § 0.2 — je les
relaie, je ne les re-signe pas. **Tout ce qui exige une exécution est l'étape 0 de ⚒️ Gimli**
(§ 5), avec sa sortie citée.

### 0.2 — Faits transmis par 🟠 Aragorn, attribués (non re-mesurés par moi)

- Release **`v0.1.1`** d'`iakaInstall` publiée le **2026-09-05**, run **`33965353603`**,
  matrice **4/4 plateformes**. `releases/latest` = **v0.1.1**. **`v0.1.0` est en pré-release**
  (matrice partielle).
- **Neuf assets** : `iakaInstall_0.1.1_aarch64.dmg` (3 581 186 o) ·
  `iakaInstall_0.1.1_x64.dmg` (3 639 242) · `iakaInstall_aarch64.app.tar.gz` ·
  `iakaInstall_x64.app.tar.gz` · `iakaInstall_0.1.1_x64_en-US.msi` (3 764 556) ·
  `iakaInstall_0.1.1_x64-setup.exe` (2 386 633) · `iakaInstall_0.1.1_amd64.deb` ·
  `iakaInstall-0.1.1-1.x86_64.rpm` · `iakaInstall_0.1.1_amd64.AppImage` (81 111 544).
- Les `.app` **embarquent le CLI 0.40.0** sous `Contents/Resources/cli/` (vérifié sur l'asset
  arm64).
- **Aucun `.sig`, aucun `latest.json`** dans la liste des neuf.

### 0.3 — Faits internes relevés par moi (chemin:ligne)

**Sur `iakaInstall` :**

- **M-1 — `iakaInstall` n'a PAS de `README.md`.** Mesuré par lecture directe du chemin
  `/Users/sjupin/work/iakaInstall/README.md` → *File does not exist*. **Ce fait commande le
  périmètre** : la vitrine des deux sœurs **génère des zones dans un README existant** ; ici il
  n'y a pas de README du tout. Il n'y a donc **rien à marquer** — il y a **un README à écrire**,
  dont les zones générées ne seront qu'une partie.
- **M-2 — aucun outillage de vitrine.** `fixtures/` porte **six** fichiers
  (`bloc-latest.sha256`, `tauri-action-pin.json`, `cli-embarque.json`,
  `evenements-non-rendus.json`, `flux-apercu.ndjson`, `vocabulaire-interdit.json`) — **aucun**
  `vitrine-assets.json`, `vitrine-locale.json`, `updater-cles.json`, `canaux-publication.json`,
  `convergence.sha256`. `scripts/` ne porte **aucun** `vitrine*`. `package.json:6-18` n'expose
  **aucun** script `vitrine`, `vitrine:check`, `vitrine:en-ligne`, `canaux:en-ligne`,
  `test:convergence`.
- **M-3 — le comptage AR-A est déjà à l'écran, littéral.** `src/App.tsx:84` :
  `<p className="comptage">4 étapes / 3 téléchargements</p>`, gardé par
  `src/__tests__/comptage-ar-a.test.tsx` (cité en commentaire `src/App.tsx:81-83`).
  **CA-19 est donc tenu côté écran** ; il ne l'est **pas** côté vitrine, puisqu'il n'y a pas de
  vitrine.
- **M-4 — l'écart AR-C(a) n'est écrit NULLE PART côté produit.** Balayage de `src/App.tsx` : ni
  « amorce », ni « n'enchaîne pas », ni MSI. L'écran annonce les 4 étapes et les prérequis ; il ne
  dit pas que le véhicule qui l'a posé **amorce** au lieu d'enchaîner. Le fait est écrit dans
  `specs/PROJET.md:92-94` (schéma) — c'est-à-dire **pour l'équipe, pas pour l'utilisateur**.
- **M-5 — aucune signature d'aucune sorte en CI.** `.github/workflows/release.yml:104-105` : le
  bloc `env:` de l'étape `tauri-action` ne porte que `GITHUB_TOKEN`. **Aucun `APPLE_*`, aucun
  `TAURI_SIGNING_PRIVATE_KEY`.** Aucune étape `notarytool`, aucun `staple`, aucune mention
  d'Apple dans tout le fichier.
- **M-6 — le bundle n'est configuré pour aucune signature ni aucun updater.**
  `src-tauri/tauri.conf.json:26-39` : `bundle` porte `active`, `targets: "all"`, `icon`,
  `resources` — **pas de section `macOS`**, donc **pas de `signingIdentity`** ; **pas de
  `createUpdaterArtifacts`** ; et l'objet racine ne porte **aucune** clé `plugins.updater`, donc
  **aucun `pubkey`, aucun `endpoints`**. ⇒ **La façade n'a pas d'updater aujourd'hui, et ses
  bundles macOS ne peuvent structurellement porter qu'une signature ad hoc.**
- **M-7 — l'action de release est épinglée au SHA, et ce SHA ne déclare AUCUNE entrée Apple.**
  `.github/workflows/release.yml:103` épingle
  `tauri-apps/tauri-action@84b9d35b5fc46c1e45415bdb6144030364f7ebc5` (`action-v0.6.2`).
  `fixtures/tauri-action-pin.json:11-40` énumère les **28 entrées déclarées** à ce SHA : aucune ne
  concerne Apple, la signature ou la notarisation. ⇒ **la notarisation ne se pilote pas par une
  entrée de l'action, mais par des variables d'environnement lues par le bundler Tauri.**
  `fixtures/tauri-action-pin.json:47` impose de **re-lire `action.yml` au nouveau SHA** avant toute
  levée de cliquet — discipline de la maison, à respecter à l'étape 0.
- **M-8 — la release est publiée non-brouillon par construction.**
  `.github/workflows/release.yml:109-110` : `releaseDraft: false`, `prerelease: false`.
  **Constat seulement — hors périmètre**, cf. l'encart de tête.

**Sur les deux sœurs (`IakaCockpit`, `iakaFrameGUI`) — la convention, telle qu'elle est :**

- **M-9 — la table de vitrine porte SEPT plateformes, et elle est convergente.**
  `iakaFrameGUI/fixtures/vitrine-assets.json:25-68` : `windows-nsis`, `windows-msi`,
  `macos-arm64`, `macos-x64`, `linux-deb`, `linux-rpm`, `linux-appimage`. Le fichier **ne nomme
  aucune application** : `{APP}` est substitué depuis `productName` de `tauri.conf.json`
  (`vitrine-assets.json:5-9`).
- **M-10 — les `.app.tar.gz` sont explicitement HORS vitrine.**
  `iakaFrameGUI/fixtures/vitrine-assets.json:70-81` énumère nommément
  `{APP}_aarch64.app.tar.gz`, `{APP}_x64.app.tar.gz`, `*.sig`, `latest.json` — *« un piège déjà
  tombé deux fois au relevé : compter les `.app.tar.gz` comme "macOS couvert". Ils ne se
  double-cliquent pas. »*
  ⇒ **Les neuf assets de `v0.1.1` se répartissent exactement en 7 de vitrine + 2 hors vitrine.**
  Aucun asset installable n'est en trop, aucun ne manque.
- **M-11 — `absents[]` déclare une PLATEFORME NON SERVIE, et rien d'autre.**
  `iakaFrameGUI/scripts/lib/vitrine.mjs:88-135` : chaque entrée porte `cle`, `constate_sur`,
  `depuis`, `motif_absence`, `condition_de_levee` ; la `cle` **doit exister dans la table**, sinon
  le générateur **jette** (`:126-131`, *« rendrait la vitrine muette sur une vraie plateforme »*) ;
  et la phrase « Tous les systèmes sont couverts » n'est émise **que** si la liste est vide
  (`:101-102`).
- **M-12 — la face en ligne mesure CINQ égalités, et elle lit `README.md`.**
  `iakaFrameGUI/scripts/vitrine-en-ligne.mjs:19-30` : E-1 `latest` = plus haut tag semver publié ·
  E-2 version du README = `latest` · E-3 chaque fichier annoncé existe · E-4 aucun asset
  installable tu · **E-5 chaque absent déclaré est réellement absent** — le cliquet
  auto-destructeur. Codes : `0` concorde, `1` écart, `2` usage, `3` **non mesuré** (jamais un
  vert). Le README est lu en dur (`:44`).
- **M-13 — le registre de convergence NE VIT PAS dans `iakaframe`.** Mesuré :
  `Glob fixtures/convergence.sha256` sur `/Users/sjupin/work/iakaframe` → **aucun résultat**. Le
  registre vit, **dupliqué**, dans `IakaCockpit/fixtures/convergence.sha256` et
  `iakaFrameGUI/fixtures/convergence.sha256` (**24 entrées**, cliquet relevé 23 → 24 le
  2026-09-05, `iakaFrameGUI/fixtures/convergence.sha256:58-72`). La face croisée est
  `scripts/test-convergence.mjs`, **une copie par dépôt**.
  ⇒ **La convergence à trois frères ne se joue pas dans `iakaframe`. Elle se joue dans les DEUX
  SŒURS.** L'ordre de mission envisageait `iakaframe` : la mesure l'écarte.
- **M-14 — et un TROISIÈME porteur du registre est un angle mort DÉJÀ DÉCLARÉ chez les sœurs.**
  `iakaFrameGUI/scripts/test-convergence.mjs:59-68`, hors-couverture écrit dans le fichier :
  *« Sans `IAKA_CONVERGENCE_HOME`, on retient LE PREMIER voisin qui porte le registre. Un
  TROISIÈME dépôt le portant changerait donc la cible SANS RIEN DIRE, et le "OK" final parlerait
  d'un autre dépôt que celui qu'on croit mesurer. »* La résolution est une **énumération de
  `..` et `../../projects`, premier trouvé** (`:81-94`). ⇒ **Faire d'`iakaInstall` un troisième
  porteur, sans rien d'autre, RÉALISE cet angle mort dans les deux sœurs.**
- **M-15 — les sœurs ne sont pas notarisées non plus, et ne le déclarent nulle part.**
  `iakaFrameGUI/.github/workflows/release.yml:98-101` : les **seuls** secrets sont
  `TAURI_SIGNING_PRIVATE_KEY` / `…_PASSWORD` — les clés **minisign de l'updater**, sans rapport
  avec Gatekeeper. Aucun `APPLE_*`, aucune étape de notarisation. Et
  `iakaFrameGUI/fixtures/vitrine-locale.json:14-21` porte `"absents": []` avec le commentaire
  *« AUCUN absent déclaré »*. ⇒ **L'absence de notarisation n'est déclarée NULLE PART dans le
  portefeuille.** Le mécanisme qu'AR-D(b) demande de « réutiliser plutôt que réinventer »
  **n'existe pas** : le mécanisme existant déclare des **plateformes absentes**, pas des
  **signatures absentes**. Ce fait commande AR-V2.
- **M-16 — précédent mesuré : `iakaframe` a SA vitrine et n'est PAS entré au registre.**
  `iakaframe/cli/fixtures/vitrine-locale.json` et `iakaframe/cli/scripts/lib/vitrine.js` existent
  (chemins et extension **différents** de ceux des sœurs), et M-13 montre qu'`iakaframe` ne porte
  pas le registre. **Le portefeuille compte donc déjà trois vitrines et deux frères.** C'est un
  précédent, pas une théorie.
- **M-17 — les scripts de la convention, à copier.** `iakaFrameGUI/package.json:23-29` :
  `test:convergence`, `vitrine` (`--write`), `vitrine:check` (`--check`), `vitrine:en-ligne`,
  `canaux:en-ligne`.

### 0.4 — Faits externes, vérifiés le 2026-09-05

- **Gatekeeper, macOS 15 Sequoia et suivants — la procédure exacte.** Le Control-clic n'ouvre plus
  une app non notarisée. Le parcours réel est : **lancer l'app** (message *« Not Opened »*) →
  **Réglages Système → Confidentialité et sécurité**, y trouver l'app et cliquer **« Ouvrir quand
  même »** → confirmer → **s'authentifier en administrateur**. **Contrainte de temps, à écrire au
  README** : il faut cliquer « Ouvrir quand même » **dans l'heure** qui suit le message. Le geste
  n'est à faire **qu'une fois** par app.
- **Signature Windows — ce que voit l'utilisateur.** Un installeur **non signé** déclenche
  systématiquement **Microsoft Defender SmartScreen** : *« Windows a protégé votre ordinateur »*.
  SmartScreen **ne bloque pas définitivement** — il faut cliquer **« Informations
  complémentaires »** puis **« Exécuter quand même »**. Le remède de fond est un certificat de
  signature de code (idéalement EV), et la réputation se construit avec le nombre
  d'installations.
- **Notarisation via `tauri-action` — comment elle s'active.** Signature :
  `APPLE_CERTIFICATE` + `APPLE_CERTIFICATE_PASSWORD` (ou `APPLE_SIGNING_IDENTITY` en local).
  Notarisation : soit `APPLE_ID` + `APPLE_PASSWORD` + `APPLE_TEAM_ID`, soit `APPLE_API_ISSUER` +
  `APPLE_API_KEY` + `APPLE_API_KEY_PATH`. **La documentation Tauri v2 ne dit pas explicitement ce
  qui se passe quand ces variables sont absentes** — elle documente en revanche la signature
  **ad hoc** (identité `"-"`) et dit d'elle : *« Ad-hoc code signing does not prevent macOS from
  requiring users to whitelist the installation. »* Et l'issue `tauri-apps/tauri-action#291`
  s'intitule *« Action failing with Mac notarization errors when we believe we're opting out of
  it »* : **le cas "secrets partiels" fait ROUGIR le build.** ⇒ **on ne câble pas des `APPLE_*`
  au jugé sur une matrice 4/4 verte** — voir AR-V5 et l'étape 0.
- **Updater Tauri v2 — ce qu'il exige.** `pubkey` dans `tauri.conf.json`, `endpoints`,
  `"createUpdaterArtifacts": true`, et `TAURI_SIGNING_PRIVATE_KEY` au build. La doc est
  catégorique : *« Tauri's updater needs a signature to verify that the update is from a trusted
  source. **This cannot be disabled.** »* ⇒ **pas d'updater sans paire de clés et sans deux
  secrets posés dans les réglages du dépôt** — un acte du décideur, refusé aux agents.

---

## 1. Problème

`iakaInstall` **a publié sa première release complète** (v0.1.1, 4/4, neuf assets). Le produit
existe donc pour de vrai — et **rien, dans le dépôt, ne le dit à un visiteur.**

Trois manques, et ils ne sont pas de même nature :

1. **Il n'y a pas de vitrine, parce qu'il n'y a pas de README** (M-1, M-2). Un utilisateur qui
   arrive sur le dépôt ne trouve **aucun nom de fichier à télécharger**, aucune indication de
   plateforme, aucune procédure. Le premier produit du portefeuille dont le métier est
   *d'installer* est le seul qui n'explique pas comment on l'installe.
2. **Le premier contact avec le produit est un refus, et il n'est déclaré nulle part.** Les `.dmg`
   sont signés ad hoc (M-5, M-6) : téléchargés **par navigateur**, ils sont bloqués par Gatekeeper,
   et depuis Sequoia le contournement historique n'existe plus (§ 0.4). Le `.msi` et le
   `.exe` déclenchent SmartScreen. **Ce n'est pas un défaut créé par ce lot** — il frappe déjà les
   deux sœurs (M-15) — mais ici il frappe **à la première seconde**, parce que ce produit *est* la
   première chose qu'on touche.
3. **L'écart acté par AR-C(a) n'est écrit nulle part côté produit** (M-4). Le décideur a demandé
   « un MSI enchaînant » ; il a reçu — et validé — « un MSI qui **amorce** ce qui enchaîne ». Cet
   écart est écrit dans le cadrage parent et dans `specs/PROJET.md` ; il n'est écrit ni à l'écran,
   ni dans une vitrine qui n'existe pas. **Un écart qu'on n'écrit que pour soi n'est pas déclaré.**

Et un quatrième point, qui est une **question de découpage** plutôt qu'un manque : le cadrage
parent demande de faire passer le registre de convergence *« de deux frères à trois »*. La mesure
M-13/M-14 montre que ce geste **ne se joue pas où l'ordre de mission le croyait** (pas dans
`iakaframe`), et qu'il **réalise un angle mort déjà déclaré** chez les deux sœurs. → AR-V4.

---

## 2. Décision retenue, et les écarts qu'elle assume

**La décision, en une phrase :** ce lot livre, dans `iakaInstall` **seul**, la **vitrine à deux
faces** de la convention du portefeuille, **posée sur un README écrit pour l'occasion**, et il y
**déclare ce que le produit ne tient pas** — la notarisation macOS et la signature Windows — avec
motif, date et condition de levée, plus les **procédures exactes** que l'utilisateur devra suivre.

**Ce que la mesure change par rapport au cadrage parent, et qu'il faut dire :**

> **C.3 n'a plus de travail de fabrication.** Les étapes 14 du § 6.1 parent (« première release :
> le `.dmg` arm64 et Intel, le `.msi`, plus le `.exe` NSIS, le `.deb`, le `.rpm` et l'AppImage »)
> **sont faites** : run `33965353603`, 4/4, neuf assets (§ 0.2). Ce qui reste de C.3 — les étapes
> **15** (notarisation déclarée, procédure Sequoia) et **16** (l'écart AR-C(a) écrit dans la
> vitrine) — **est de la matière de vitrine**. C.3 et B′-b **ne sont donc pas deux lots**, ils
> sont les deux moitiés du même geste. → **AR-V1**.

**Quatre écarts assumés, chacun motivé et nommé — aucun n'est un oubli :**

| # | Écart avec le cadrage parent | Motif court | Arbitrage |
|---|---|---|---|
| É-1 | L'absence de notarisation **ne se déclare pas** dans le tableau `absents` de `vitrine-locale.json`, comme AR-D(b) l'écrivait | **Mesuré impossible** : `absents[].cle` doit exister dans la table des 7 plateformes, sinon le générateur **jette** (M-11) ; et E-5 exige que l'absent soit **réellement absent** — or les deux `.dmg` existent (3 581 186 o / 3 639 242 o). Y loger la notarisation rendrait la vitrine **rouge à tort** et **muette sur une vraie plateforme**. | **AR-V2** |
| É-2 | **Pas de `updater/latest.json`**, contrairement à l'étape 17 du § 6.1 parent | La façade n'a **ni `pubkey`, ni `endpoints`, ni `createUpdaterArtifacts`** (M-6) ; Tauri v2 : la signature *« cannot be disabled »* ⇒ il faut **deux secrets posés dans les réglages du dépôt**, acte du décideur. Et ce qui périme ici n'est pas la coquille mais **la charge** (`fixtures/cli-embarque.json`), dont le successeur est **déjà nommé**. | **AR-V3** |
| É-3 | **`iakaInstall` n'entre PAS au registre de convergence** dans ce lot, contrairement à l'étape 18 | Y entrer **réalise l'angle mort déclaré** de `test-convergence.mjs:59-68` (M-14) dans les **deux** sœurs, qui ne sont pas dans ce lot. Précédent mesuré : `iakaframe` a fait exactement ce choix (M-16). | **AR-V4** |
| É-4 | **Pas de `fixtures/canaux-publication.json`**, contrairement à l'étape 17 | **Conséquence d'É-2** : ce registre déclare les remotes que **`publish-update.mjs` pousse**. Sans updater, ce script n'existe pas ⇒ le registre n'aurait **aucun consommateur**. Une garde sans consommateur est une garde tiède, et les sœurs en ont déjà une d'ouverte (`FACE-EN-LIGNE-DES-CANAUX-NON-EXERCEE`). | conséquence d'**AR-V3** |

**Ce qui, en revanche, est dupliqué tel quel et sans invention** : la table des 7 plateformes, le
générateur, les deux faces de la garde, les marqueurs de zone, les codes de sortie 0/1/2/3, la
discipline « une plateforme non servie se déclare, elle ne se glisse pas dans un paragraphe ».

---

## 3. Arbitrages — à trancher par le décideur

*Six questions. Chacune a une recommandation motivée. **Aucune n'est tranchée ici.***

> **Verdicts rendus le 2026-09-05 par Stéphane** — décision anticipée *« comme reco »*, appliquée par
> 🔵 Aragorn à la lettre des recommandations : **AR-V1 → (a)** UN lot dans `iakaInstall`, la convergence
> devient le successeur `CONVERGENCE-TROIS-FRERES` (sœurs). **AR-V2 → (a)** clé neuve
> `absences_de_signature` + `rendreSecurite()` + cliquet offline. **AR-V3 → (a)** updater dehors,
> successeur `UPDATER-DE-LA-FACADE` (secrets = acte du décideur) ; `canaux-publication.json` exclu.
> **AR-V4 → (a)** copier sans entrer au registre. **AR-V5 → (a) si et seulement si** l'étape 0 prouve
> qu'un `APPLE_*` vide ne casse pas le build, **sinon (b)** en l'écrivant — on ne casse pas une matrice
> 4/4 verte. **AR-V6 → (a)** macOS ET Windows déclarés (Gatekeeper + SmartScreen).
> **Ordonnancement (Aragorn)** : ce lot s'exécute APRÈS `RELEASE-PARTIELLE-PUBLIEE` (les deux touchent
> `release.yml`), sur une branche partant du `main` qui l'intègre.

### AR-V1 — Un lot, ou deux ?

- **(a)** **UN lot dans `iakaInstall`** : ce qui reste de C.3 (étapes 15-16) et B′-b sont livrés
  ensemble, par un seul ⚒️ Gimli, sur une seule branche. La convergence à trois frères devient un
  **lot successeur nommé** dans les deux sœurs.
- **(b)** Deux lots successifs dans `iakaInstall` : d'abord la clôture documentaire de C.3, puis
  B′-b.
- **(c)** Un seul lot traversant les trois dépôts (`iakaInstall` + les deux sœurs).

**Recommandation : (a).** **(1)** Les étapes 15 et 16 de C.3 **produisent des zones de vitrine** —
les séparer ferait écrire deux fois le même README. **(2)** (c) est écarté sur un fait de méthode
autant que de mesure : les sœurs sont **deux autres dépôts, deux autres gates**, et le portefeuille
a déjà payé le prix des exécutions parallèles sur un arbre git partagé. **(3)** Le cadrage parent
lui-même isole les sœurs : *« ces deux dépôts ne sont pas à modifier par ce lot, à la seule
exception du cliquet `fixtures/convergence.sha256` »* (§ 7) — une exception **conditionnelle**,
qu'AR-V4 propose de ne pas déclencher maintenant.

### AR-V2 — Où se déclare l'absence de notarisation (et de signature Windows) ?

- **(a)** **Une clé NEUVE `absences_de_signature` dans `fixtures/vitrine-locale.json`** — donnée
  structurée (`plateformes`, `motif`, `depuis`, `condition_de_levee`, `procedure`) —, rendue dans
  une **zone de README dédiée** (`<!-- vitrine:debut:securite -->`) par une fonction
  `rendreSecurite()` **ajoutée à la copie locale** de `scripts/lib/vitrine.mjs`, avec sa **garde
  locale** et son **cliquet offline** (voir ci-dessous).
- **(b)** Réutiliser le tableau `absents` existant, comme AR-D(b) l'écrit littéralement.
- **(c)** De la prose libre au README, sans structure, sans garde, sans cliquet.

**Recommandation : (a).** **(b) est écarté par la mesure, pas par le goût** : `rendreBinaires`
**jette** sur une `cle` inconnue de la table des 7 plateformes (M-11,
`vitrine.mjs:126-131`), et il n'existe **aucune clé « notarisation »** dans cette table ; si on
détournait `macos-arm64`, alors E-5 — *« chaque absent déclaré est réellement absent »* —
**rougirait immédiatement**, puisque `iakaInstall_0.1.1_aarch64.dmg` **existe** (3 581 186 o).
(b) fabriquerait donc soit un plantage, soit un faux rouge permanent, soit une vitrine muette sur
une plateforme réellement servie. **(c) fait retomber AR-D(b) sur AR-D(c)** — un aveu sans cliquet
survit à sa propre péremption, ce que le corpus interdit nommément.

**Ce qu'(a) exige, et sans quoi (a) ne vaut pas mieux que (c) :**
1. **Un cliquet offline, déterministe, qui puisse rougir.** Le cliquet naturel — mesurer
   `spctl`/`codesign` sur un asset téléchargé — **n'est pas jouable en gate** (réseau + macOS +
   quarantaine). Le cliquet retenu est **local et exact** : *si `.github/workflows/release.yml`
   porte un câblage `APPLE_*` actif, la déclaration « non notarisé » **doit** tomber* — et
   symétriquement pour un câblage de signature Windows. Le jour où le décideur pose ses secrets et
   qu'on câble l'étape, **la garde rougit et force le retrait de l'aveu**. C'est le cliquet
   auto-destructeur d'AR-D(b), transposé à ce qu'on peut réellement mesurer sans réseau.
2. **La divergence avec les sœurs est DÉCLARÉE en tête du fichier copié.**
   `scripts/lib/vitrine.mjs` d'`iakaInstall` porte un cartouche qui énumère **exactement** ce qui
   est ajouté (`rendreSecurite`, `SENTINELLE_SECURITE`, la zone `securite`) et renvoie au
   successeur `CONVERGENCE-TROIS-FRERES`. Une divergence non déclarée est une dette invisible.
3. **`rendreSecurite` est de la matière de portefeuille, pas d'`iakaInstall`.** M-15 le mesure :
   **les deux sœurs ont exactement la même absence, et ne la déclarent pas non plus.** Le
   successeur reçoit donc mandat de **remonter** cette fonction chez elles, pas de la recopier.

### AR-V3 — L'updater de la façade : dedans ou dehors ?

- **(a)** **Dehors.** Successeur nommé **`UPDATER-DE-LA-FACADE`**, avec sa condition d'entrée
  écrite.
- **(b)** Dedans : `pubkey` + `endpoints` + `createUpdaterArtifacts` + secrets minisign +
  `updater/latest.json` + `fixtures/updater-cles.json` + `scripts/publish-update.mjs` +
  `scripts/mesurer-artefacts.mjs` + `fixtures/canaux-publication.json`.

**Recommandation : (a), et je la défends contre elle-même.** L'objection est réelle : un installeur
figé installe éternellement le CLI `0.40.0` qu'il embarque, et personne ne le lui dira.
**Quatre motifs la surmontent.** **(1)** Tauri v2 est catégorique : la signature de la charge
*« cannot be disabled »* (§ 0.4). (b) suppose donc de **générer une paire de clés et de poser deux
secrets dans les réglages du dépôt** — un **acte du décideur, refusé aux agents**. L'inscrire au
périmètre rendrait le lot **non livrable pour une raison étrangère au lot** : c'est **exactement**
la forme d'AR-D, déjà tranchée (b) par le décideur. **(2)** Ce qui périme dans ce produit n'est
**pas la coquille, c'est la charge** — `fixtures/cli-embarque.json` épingle le CLI `0.40.0`, et
`CLAUDE.md:91-95` dit que la monter **est un lot**. Le successeur qui vise juste est **déjà
nommé** : `RESSOURCE-CLI-RAFRAICHIE-EN-LIGNE`. Un updater de coquille mettrait à jour la fenêtre
en laissant le moteur périmé. **(3)** Un installeur **se jette après usage** : sa mise à jour
naturelle est *« retélécharger le dernier »* — c'est-à-dire **précisément ce que la vitrine
livre**. **(4)** (b) est un lot entier — six fichiers de mécanique et une chaîne de publication —
greffé sur un lot dont l'objet est de **dire la vérité sur une release qui existe déjà**.
**Coût du (a), dit** : un utilisateur qui a installé `iakaInstall` v0.1.1 ne saura pas qu'une
v0.2.0 existe. **Condition de levée de `UPDATER-DE-LA-FACADE`** : le jour où le décideur pose la
paire minisign **et** qu'une seconde version de la façade est publiée — c'est-à-dire quand la
question cesse d'être hypothétique.

### AR-V4 — La convergence à trois frères : maintenant, ou dans son propre lot ?

*Rappel de la mesure qui reformule la question : le registre **ne vit pas dans `iakaframe`**
(M-13). Il vit, dupliqué, chez les deux sœurs, et un **troisième porteur** est un angle mort
**qu'elles ont elles-mêmes écrit** (M-14).*

- **(a)** `iakaInstall` **copie** les fichiers de vitrine (byte-identiques en fait, sauf la
  divergence déclarée d'AR-V2) mais **n'entre PAS** au registre. Successeur nommé
  **`CONVERGENCE-TROIS-FRERES`**, à jouer **dans les deux sœurs**, mandat écrit.
- **(b)** `iakaInstall` entre au registre **dans ce lot** : `fixtures/convergence.sha256` posé
  ici, cliquets des deux sœurs relevés au même commit logique.
- **(c)** `iakaInstall` n'entre au registre **qu'après** que `test-convergence.mjs` sache résoudre
  N frères — c'est-à-dire : le successeur d'abord, l'entrée ensuite.

**Recommandation : (a), qui vaut (c) en deux temps.** **(1)** **(b) installe le défaut qu'on
prétend éviter** : la face croisée des deux sœurs retient *le premier voisin trouvé par
`readdirSync`* (`test-convergence.mjs:81-94`) ; avec un troisième porteur, `IakaCockpit` pourrait
mesurer `iakaInstall` **en croyant mesurer `iakaFrameGUI`, sans rien dire**. Ce n'est pas une
crainte : c'est écrit dans leur propre code comme hors-couverture. **(2)** **Précédent mesuré** :
`iakaframe` porte sa vitrine et **n'est pas au registre** (M-16) — le portefeuille tient déjà trois
vitrines et deux frères, sans que cela ait été un défaut. **(3)** (c) est la bonne fin, mais faire
dépendre ce lot d'un lot **dans deux autres dépôts** le rendrait non livrable pour une raison
étrangère à lui — encore la forme d'AR-D.
**Coût du (a), dit sans le minimiser** : les copies d'`iakaInstall` **ne sont gardées par aucune
face croisée** — une édition en place ici ne fera rougir personne. Ce qui reste gardé, c'est la
dérivation **README ↔ table** *à l'intérieur* d'`iakaInstall` (face locale). C'est exactement le
prix qu'`iakaframe` paie déjà.
**Mandat du successeur `CONVERGENCE-TROIS-FRERES`, écrit ici pour qu'il ne se perde pas** :
(i) rendre la résolution du frère **N-aire ou autoritaire** dans `test-convergence.mjs`, en fermant
le hors-couverture de `:59-68` ; (ii) **remonter `rendreSecurite`** chez les deux sœurs, qui ont la
même absence non déclarée (M-15) ; (iii) inscrire `iakaInstall` au registre et relever le cliquet
**24 → N** dans le commit qui le décide. Ordre de grandeur **≈ 0,75 j**, **non compté** ici.

### AR-V5 — L'étape CI de notarisation : quelle forme, pour « présente et sautée en le disant » ?

- **(a)** Une étape `run:` **avant** le build, qui mesure la présence des secrets Apple et imprime
  soit « notarisation ACTIVE », soit « notarisation SAUTÉE — motif, condition de levée », **plus**
  le câblage `env: APPLE_*` sur l'étape `tauri-action`, prêt à s'allumer.
- **(b)** L'étape de **déclaration seule**, **sans** câblage `env` : le jour où le décideur achète
  l'adhésion, un lot câble les variables **et** rejoue la matrice.

**Recommandation : (a) SI ET SEULEMENT SI l'étape 0 établit qu'un `APPLE_*` VIDE ne fait pas
échouer le build ; SINON (b), en le disant.** Ce conditionnel n'est pas une dérobade, c'est la
discipline de la maison : `fixtures/tauri-action-pin.json:47` **exige** de re-lire la source au SHA
épinglé avant de toucher au câblage. Les faits qui commandent la prudence : le SHA épinglé
**ne déclare aucune entrée Apple** (M-7) — la notarisation passe donc par l'environnement, pas par
l'action ; et l'issue `tauri-action#291` montre que le cas « secrets partiels » **fait rougir le
build** (§ 0.4). **On ne casse pas une matrice 4/4 verte pour une étape décorative.**
**Dans les deux cas, ce qui n'est pas négociable** : l'étape **existe**, elle **imprime son
verdict**, et elle **ne saute jamais en silence** — modèle exact du commentaire minisign des sœurs
(`iakaFrameGUI/.github/workflows/release.yml:98-99`, où l'absence de secret est **commentée comme
un gate humain**).

### AR-V6 — La signature Windows : déclarée aussi, ou seulement macOS ?

- **(a)** **Les deux**, dans le même bloc `absences_de_signature` : macOS (notarisation) **et**
  Windows (signature de code), chacun avec son motif, sa date, sa condition de levée et **sa
  procédure utilisateur exacte**.
- **(b)** macOS seul — c'est la lettre d'AR-D, qui ne vise que Gatekeeper.

**Recommandation : (a).** **(1)** Le `.msi` est **l'un des deux véhicules demandés** par le
décideur : le livrer en taisant que Windows affichera *« Windows a protégé votre ordinateur »*
serait tenir sur Windows le discours qu'AR-D interdit sur macOS. **(2)** Le geste est le même et
il coûte trois lignes de données. **(3)** Le motif diffère et mérite d'être écrit : sur macOS
l'obstacle est un **achat** (Apple Developer Program, 99 $/an) ; sur Windows, c'est un achat
**et** une **réputation** qui se construit avec le nombre d'installations (§ 0.4) — un certificat
neuf ne fait pas disparaître SmartScreen du jour au lendemain. **Une condition de levée honnête
doit le dire.**

---

## 4. Périmètre

### Inclus

1. **`README.md` d'`iakaInstall` — écrit, pas seulement marqué** (M-1). Il porte, dans cet ordre :
   ce qu'est le produit · **le comptage AR-A** (« 4 étapes / 3 téléchargements ») · **l'écart
   AR-C(a)** écrit pour l'utilisateur · la **zone `binaires` générée** · la **zone `securite`
   générée** (Sequoia + SmartScreen + absences déclarées) · les prérequis (Node/npm) · la zone
   `sources`.
2. **`fixtures/vitrine-assets.json`** — copie **byte-identique** de celle des sœurs (M-9). Aucune
   édition, aucune ligne ajoutée.
3. **`fixtures/vitrine-locale.json`** — local : `depot: "iakasju/iakaInstall"`, `absents: []`
   (constat, cf. M-10 : les 9 assets = 7 de vitrine + 2 hors vitrine), la clé neuve
   `absences_de_signature` (AR-V2), et les `gabarits` (`sources`, et la prose de l'écart AR-C(a)
   si elle est mise en zone).
4. **`scripts/lib/vitrine.mjs`, `scripts/vitrine.mjs`, `scripts/vitrine-en-ligne.mjs`** — copies
   des sœurs, **plus** `rendreSecurite` et sa zone dans le premier, **divergence déclarée en tête**
   (AR-V2, exigence 2).
5. **`scripts/__tests__/vitrine.test.mjs`** — face **locale**, dans le gate, déterministe et hors
   réseau : rejoue le générateur en mémoire et compare au README versionné.
6. **La garde de l'aveu et son cliquet offline** (AR-V2, exigence 1) : chaque entrée de
   `absences_de_signature` est rendue **avec motif, date et condition de levée** ; et si
   `release.yml` porte un câblage de signature **actif**, la déclaration correspondante **doit**
   tomber — la garde rougit sinon.
7. **Les scripts npm** : `vitrine`, `vitrine:check`, `vitrine:en-ligne` — et leur inscription dans
   `CLAUDE.md` § Commandes, sans quoi `scripts/__tests__/commandes-documentees.test.mjs` et la
   convention permanente du portefeuille sont en défaut.
8. **L'étape CI de notarisation**, selon le verdict d'AR-V5 — **présente, et sautée en le disant**.
9. **La face en ligne rejouée sur la release réelle `v0.1.1`**, avec sa sortie citée (code 0, 1 ou
   3 — jamais reformulée).
10. **Le backlog de `CLAUDE.md` et le § ⬜ de `specs/PROJET.md`** mis à jour : C.3 et B′-b cochés
    avec leur preuve, les trois successeurs (`CONVERGENCE-TROIS-FRERES`, `UPDATER-DE-LA-FACADE`,
    et le mandat de remontée de `rendreSecurite`) **inscrits**.

### Exclu — décidé, pas oublié

- **La politique brouillon / `needs` strict / `latest`** (`RELEASE-PARTIELLE-PUBLIEE`) → **son
  propre lot**, cadré en parallèle. **Ne pas toucher `release.yml` sur ce point.** La seule
  modification autorisée de ce fichier par ce lot est **l'étape de notarisation** d'AR-V5.
- **`updater/latest.json`, `fixtures/updater-cles.json`, `scripts/publish-update.mjs`,
  `scripts/mesurer-artefacts.mjs`** → AR-V3(a), successeur `UPDATER-DE-LA-FACADE`.
- **`fixtures/canaux-publication.json`, `scripts/verifier-canaux-en-ligne.mjs`** → conséquence
  d'AR-V3(a) : aucun consommateur sans chaîne de publication.
- **`fixtures/convergence.sha256` et toute modification d'`IakaCockpit` ou d'`iakaFrameGUI`** →
  AR-V4(a), successeur `CONVERGENCE-TROIS-FRERES`. **Aucun fichier de ces deux dépôts n'est touché
  par ce lot.**
- **Toute modification de `src/` (le front) autre que rien.** M-3 mesure que le comptage AR-A est
  déjà à l'écran et gardé. **L'écran n'est pas à retoucher** ; l'écart AR-C(a) se dit dans le
  README, où se tient l'utilisateur qui n'a pas encore lancé l'app.
- **Tout acte de release** : poser un tag, créer/éditer une release, poser un secret dans les
  réglages du dépôt, acheter une adhésion Apple ou un certificat Windows. **Refusé aux agents.**
- **`MARQUE-IAKAINSTALL`, `INSTALL-I18N`, `SIDECAR-CLI-AUTONOME`,
  `RESSOURCE-CLI-RAFRAICHIE-EN-LIGNE`, `TAURI-ACTION-V1-POUR-LES-TROIS`,
  `CONVERGENCE-RELEASE-YML-ALIGNEMENT`** — déjà au backlog, aucun n'entre ici.

---

## 5. Étapes d'implémentation (⚒️ Gimli)

### Étape 0 — MESURER, avant d'écrire une ligne

*Je n'ai pas eu de shell ; toi si. Chaque commande a **sa** ligne, **son** code de sortie, **son**
chiffre. Une formule d'ensemble vaut FAIL.*

0.1 **Re-mesurer la release** : les neuf assets de `v0.1.1`, leurs **tailles**, et l'absence de
`.sig` / `latest.json`. Comparer aux chiffres de § 0.2 et **dire si l'un diffère**. Confirmer que
`releases/latest` = `v0.1.1` et que `v0.1.0` est en pré-release.
0.2 **Mesurer le symptôme F-d sur l'asset réel** — celui que je n'ai pas signé (§ 0.1) : `codesign
-dv --verbose=4` et `spctl -a -vv` sur l'app extraite du `.dmg` arm64 **téléchargé**. Citer la
sortie. C'est la preuve qui manque au corpus depuis le 2026-09-03.
0.3 **AR-V5 — lire `action.yml` ET la source au SHA épinglé** `84b9d35b…` : comment la
notarisation s'active, et **ce qui se passe quand `APPLE_ID` est présent mais vide**. Croiser avec
`tauri-apps/tauri-action#291`. **De cette mesure seule dépend le choix (a) ou (b) d'AR-V5.**
Consigner le constat dans `fixtures/tauri-action-pin.json` (`constatsLusDansLaSourceDuSha`), comme
le fichier l'impose (`:47`).
0.4 **Vérifier la byte-identité** des trois fichiers à copier entre `IakaCockpit` et
`iakaFrameGUI` **avant** de copier : si les deux sœurs divergent déjà sur l'un d'eux, **s'arrêter
et le dire** — on ne copie pas une divergence.
0.5 **Mesurer l'état de départ** : `npm run typecheck`, `npm run lint`, `npm run test`,
`cargo test`. Un lot qui commence sur un rouge inconnu ne peut rien prouver.

### Étape 1 — La copie de la convention

1.1 Copier `fixtures/vitrine-assets.json` **byte-identique** depuis `iakaFrameGUI`. Vérifier par
empreinte, pas à l'œil.
1.2 Copier `scripts/lib/vitrine.mjs`, `scripts/vitrine.mjs`, `scripts/vitrine-en-ligne.mjs`,
`scripts/__tests__/vitrine.test.mjs`. **Ne rien adapter à ce stade** : ces fichiers ne nomment
aucun dépôt, tout vient de `productName`, `package.json` et `vitrine-locale.json`.
1.3 Écrire `fixtures/vitrine-locale.json` : `depot`, `absents: []` **avec le commentaire qui en
fait un CONSTAT** (les 7 plateformes sont servies, mesuré à l'étape 0.1 — la liste vide n'est pas
un oubli), et les `gabarits`.
1.4 Exposer `vitrine`, `vitrine:check`, `vitrine:en-ligne` dans `package.json`, et les inscrire
dans `CLAUDE.md` § Commandes **dans le même commit**.

### Étape 2 — Le README, écrit

2.1 Écrire `README.md` avec ses zones marquées. **Ce que le README dit hors zones générées** : ce
qu'est `iakaInstall`, le **comptage AR-A** (« 4 étapes / 3 téléchargements ») **identique au texte
de l'écran** (`src/App.tsx:84`), les prérequis Node/npm, et **l'écart AR-C(a)** :

> Le `.dmg` et le `.msi` **posent** l'application d'installation ; c'est **elle** qui enchaîne les
> quatre étapes. Ni un DMG ni un MSI ne peuvent enchaîner : un DMG n'exécute rien, et Windows
> Installer n'exécute qu'un seul MSI à la fois (les installations imbriquées sont dépréciées et
> déconseillées pour le public par Microsoft). **Ils amorcent ce qui enchaîne.**

2.2 **Aucun nom d'artefact écrit à la main dans la prose.** Les noms de fichiers ne sortent que de
la zone générée. Motif mesuré : la face en ligne compte comme **promesse** tout nom entre backticks
**hors d'un bloc d'absence déclarée**, où qu'il soit — prose comprise. Un nom recopié à la main est
une seconde source de vérité, et la première à diverger.
2.3 `npm run vitrine` puis `npm run vitrine:check` → doit rendre **0**.

### Étape 3 — L'aveu et son cliquet (AR-V2)

3.1 Ajouter `absences_de_signature` à `fixtures/vitrine-locale.json` — **deux** entrées :

- **macOS / notarisation** — *motif* : aucun certificat Developer ID ni adhésion Apple Developer
  Program (99 $/an) ; les bundles ne portent qu'une **signature ad hoc** (mesuré : aucune section
  `bundle.macOS` dans `tauri.conf.json:26-39`, aucun secret Apple dans `release.yml:104-105`).
  *depuis* : 2026-09-05. *condition de levée* : adhésion acquise **et** deux secrets Apple posés
  dans les réglages du dépôt — **acte du décideur**.
  *procédure* : lancer l'app → **Réglages Système → Confidentialité et sécurité** → **« Ouvrir
  quand même »** → confirmer → **mot de passe administrateur**. **Dans l'heure** qui suit le
  message. **Une seule fois** par application. **Ne jamais écrire « Control-clic »** : ce
  contournement n'existe plus depuis macOS 15.
- **Windows / signature de code** — *motif* : aucun certificat de signature ; le `.msi` et le
  `.exe` déclenchent **Microsoft Defender SmartScreen**. *depuis* : 2026-09-05. *condition de
  levée* : certificat acquis **et** réputation construite — **un certificat neuf ne supprime pas
  SmartScreen immédiatement**, la réputation se bâtit avec le nombre d'installations ; le dire.
  *procédure* : *« Windows a protégé votre ordinateur »* → **« Informations complémentaires »** →
  **« Exécuter quand même »**.

3.2 Ajouter `rendreSecurite()` et la zone `securite` à la copie locale de `scripts/lib/vitrine.mjs`,
**avec le cartouche de divergence en tête** (liste exacte des ajouts + renvoi à
`CONVERGENCE-TROIS-FRERES`).
3.3 Écrire la **garde locale** : chaque entrée est rendue **avec ses quatre champs** ; une entrée
sans condition de levée est un **refus**, pas une ligne muette (calque exact de
`vitrine.mjs:126-131`).
3.4 Écrire le **cliquet offline** : `release.yml` porte-t-il un câblage de signature **actif** ? Si
oui, l'entrée correspondante **doit** avoir disparu. **Contrefactuel obligatoire** : injecter un
câblage `APPLE_*` fictif dans une copie en mémoire ⇒ la garde **rougit nommément** ; révoquer et
prouver par `sha256` inchangé.

### Étape 4 — L'étape CI de notarisation (AR-V5)

4.1 Selon le verdict d'AR-V5 **et la mesure 0.3**, poser l'étape dans `release.yml` — **et rien
d'autre dans ce fichier**.
4.2 Elle **imprime** son verdict : « notarisation ACTIVE » ou « notarisation SAUTÉE — aucun secret
Apple ; voir `fixtures/vitrine-locale.json` § `absences_de_signature` ; condition de levée : … ».
**Jamais un saut silencieux.**
4.3 Si le verdict d'AR-V5 est **(b)**, **l'écrire dans le fichier** : pourquoi le câblage `env`
n'est pas posé, et ce qu'il faudra faire le jour venu. Une abstention motivée est une décision ;
une abstention muette est un oubli.

### Étape 5 — Les deux faces, et la preuve

5.1 `npm run test` → la face **locale** est verte. **Contrefactuel** : muter un octet du README
dans une zone générée ⇒ la face locale **rougit nommément** ; révoquer, `sha256` identique.
5.2 `npm run vitrine:en-ligne` **sur la release réelle `v0.1.1`** → citer le **code de sortie** et
la sortie. **Un `3` (non mesuré) n'est pas un succès et ne se présente jamais comme tel.**
5.3 Rejouer `typecheck`, `lint`, `test`, `cargo test` — **une ligne par commande**, avec son code
et son chiffre.

### Étape 6 — La mémoire du lot

6.1 `CLAUDE.md` : backlog — **C.3** et **B′-b** cochés **avec leur preuve** ; les nouvelles
commandes en § Commandes ; les successeurs **`CONVERGENCE-TROIS-FRERES`** et
**`UPDATER-DE-LA-FACADE`** inscrits avec leur mandat et leur condition d'entrée.
6.2 `specs/PROJET.md` § ⬜ : consigner les verdicts d'AR-V1..AR-V6 tels que rendus.
6.3 **Remise au gate 🏹 Legolas. Ne pas s'auto-valider.**

---

## 6. Fichiers concernés, par dépôt

### `iakaInstall` — **le seul dépôt modifié par ce lot**

| Fichier | Nature | Ce qui change |
|---|---|---|
| `README.md` | **neuf** | n'existe pas (M-1) — à écrire, zones marquées comprises |
| `fixtures/vitrine-assets.json` | **neuf, copié** | byte-identique aux sœurs, non édité |
| `fixtures/vitrine-locale.json` | **neuf, local** | `depot`, `absents: []` (constat), `absences_de_signature`, `gabarits` |
| `scripts/lib/vitrine.mjs` | **neuf, copié + divergence déclarée** | `rendreSecurite`, zone `securite`, cartouche de divergence |
| `scripts/vitrine.mjs` | **neuf, copié** | générateur `--write` / `--check` |
| `scripts/vitrine-en-ligne.mjs` | **neuf, copié** | face en ligne, codes 0/1/2/3 |
| `scripts/__tests__/vitrine.test.mjs` | **neuf** | face locale + garde de l'aveu + **cliquet offline** + contrefactuels |
| `package.json` | modifié | trois scripts npm |
| `CLAUDE.md` | modifié | § Commandes, backlog, successeurs |
| `specs/PROJET.md` | modifié | § ⬜ : verdicts AR-V1..AR-V6 |
| `.github/workflows/release.yml` | modifié, **strictement borné** | **l'étape de notarisation d'AR-V5, et RIEN d'autre** — la politique `latest`/brouillon est le lot voisin |
| `fixtures/tauri-action-pin.json` | modifié | le constat lu à l'étape 0.3, comme `:47` l'impose |

### `IakaCockpit` et `iakaFrameGUI` — **NON MODIFIÉS**

Aucun fichier. AR-V4(a) : `fixtures/convergence.sha256` **n'est pas relevé** par ce lot ; le
cliquet reste à **24** de part et d'autre. Les toucher « en passant » est le défaut que leur propre
corpus interdit (cadrage parent § 7).

### `iakaframe` — **NON MODIFIÉ**

**Contrairement à l'hypothèse de l'ordre de mission.** Mesuré (M-13) : le registre de convergence
n'y vit pas — `Glob fixtures/convergence.sha256` sur `/Users/sjupin/work/iakaframe` ne ramène
rien. Ce dépôt porte sa **propre** vitrine (`cli/scripts/lib/vitrine.js`,
`cli/fixtures/vitrine-locale.json`) et n'est **pas** au registre : c'est un précédent (M-16), pas
un point d'entrée pour ce lot.

---

## 7. Risques

| # | Risque | Mitigation |
|---|---|---|
| **R1** | **Le premier contact avec le produit est un refus.** Un `.dmg` signé ad hoc, téléchargé **par navigateur**, est bloqué par Gatekeeper ; depuis Sequoia le Control-clic n'existe plus, et l'utilisateur a **une heure** pour trouver *Réglages Système → Confidentialité et sécurité*. Un installeur que Gatekeeper bloque est un installeur qui n'installe pas. | **AR-D(b), tranché.** Absence **déclarée** avec motif, date et condition de levée (AR-V2) ; **procédure Sequoia exacte** au README, **jamais** un « autorisez l'application » vague ; étape CI **présente et sautée en le disant** (AR-V5) ; **cliquet offline** qui force le retrait de l'aveu le jour où il devient faux. **La vitrine ne promet jamais une installation lisse.** → CA-A5, CA-A6. |
| R2 | **Une installation par `gh release download` réussit et TROMPE** : `gh` ne pose pas `com.apple.quarantine`. Un agent qui « vérifie » ainsi conclura que tout va bien. | La recette de R1 est un **gate humain** : téléchargement **par navigateur**, sur un Mac **vierge** (§ 8). Aucun critère d'acceptation ne suppose ce contrôle couvert. |
| R3 | **La déclaration d'absence survit à sa propre péremption** — l'aveu reste écrit alors que la notarisation est active, et la vitrine ment dans l'autre sens. | Cliquet offline d'AR-V2 (étape 3.4), **éprouvé par contrefactuel**. Une garde qui ne peut pas rougir n'est pas une garde. |
| R4 | **La vitrine ment sans que rien ne rougisse** : la face locale compare deux dérivées de la **même** table (`vitrine-assets.json:19-22`, dit tel quel dans le fichier). Si le bundler change sa convention de nommage, elle reste verte sur un README faux. | La face **en ligne** est **rejouée sur la release réelle `v0.1.1`** à l'étape 5.2, avec son code de sortie cité. C'est la **seule** face non circulaire. Un `3` n'est **jamais** compté comme un vert. |
| R5 | **La copie diverge en silence** : `iakaInstall` n'entre pas au registre (AR-V4(a)), donc aucune face croisée ne garde ses copies. | **Coût assumé et déclaré** (AR-V4). Atténué par : cartouche de divergence **en tête** de chaque fichier copié, énumérant exactement les écarts ; successeur **`CONVERGENCE-TROIS-FRERES`** nommé avec son mandat en trois points. |
| R6 | **L'étape de notarisation casse une matrice 4/4 verte** — des `APPLE_*` vides suffisent à faire échouer le build (`tauri-action#291`). | AR-V5 : la forme retenue **dépend de la mesure 0.3**, jamais d'une supposition. En cas de doute, **(b)** : la déclaration seule, sans câblage, **et l'abstention écrite dans le fichier**. |
| R7 | **Un troisième porteur du registre détourne la face croisée des sœurs** en silence (M-14, angle mort qu'elles ont elles-mêmes écrit). | AR-V4(a) : on **n'entre pas** au registre ici. Le successeur ferme le hors-couverture **avant** l'entrée. |
| R8 | **On déclare « livré » ce qui n'est que « buildé »** sur Windows, Linux et macOS Intel — le risque du cadrage parent, déjà réalisé une fois sur `v0.1.0`. | § 8 : gate humain **déclaré**, jamais compté comme couvert. Aucun critère ne suppose une recette réelle sur ces machines. |
| R9 | **Le lot déborde sur la politique `latest`/brouillon** en touchant `release.yml`. | Périmètre § 4 : **la seule** modification autorisée de `release.yml` est l'étape de notarisation. Cadré ailleurs, en parallèle. |

---

## 8. Critères d'acceptation

*Testables. Ceux qui ne le sont pas figurent au § « gate humain » et sont déclarés **non
couverts**, jamais PASS.*

- [ ] **CA-A1** — `README.md` existe, porte les **zones marquées**, et `npm run vitrine:check`
      rend **0**. **Contrefactuel** : retirer un marqueur ⇒ le générateur **jette** avec le nom de
      la zone (« les marqueurs ne se retirent pas ») ; révoqué, `sha256` identique.
- [ ] **CA-A2** — La zone `binaires` annonce les **sept** artefacts de la table, aux **noms
      exacts** de la release `v0.1.1`, et **la liste des absents est vide** — donc la phrase
      « Tous les systèmes sont couverts » est émise **comme un constat**. Prouvé par 5.2, pas par
      lecture.
- [ ] **CA-A3** — **Aucun nom d'artefact n'est écrit à la main** hors zone générée. **Contrefactuel** :
      ajouter en prose un nom fictif entre backticks (dérivé d'aucune plateforme) ⇒ la face en
      ligne le compte comme **promesse** et **rougit** (E-3) ; retiré.
- [ ] **CA-A4** — Le README annonce **« 4 étapes / 3 téléchargements »**, **au mot près** comme
      `src/App.tsx:84`. **Aucun écran, aucune ligne du README ne parle de « trois
      installations ».** *(CA-19 du cadrage parent, volet vitrine.)*
- [ ] **CA-A5** — **Notarisation, AR-D(b)** : la vitrine **déclare** l'app non notarisée avec
      **motif, date et condition de levée** ; le README porte la procédure **Sequoia exacte**
      (Réglages Système → Confidentialité et sécurité → Ouvrir quand même → mot de passe admin,
      **dans l'heure**) ; **le mot « Control-clic » n'apparaît nulle part.**
- [ ] **CA-A6** — **Signature Windows** : même exigence, et la procédure **SmartScreen exacte**
      (Informations complémentaires → Exécuter quand même). La condition de levée **dit** qu'un
      certificat neuf ne supprime pas SmartScreen immédiatement.
- [ ] **CA-A7** — **Cliquet de l'aveu.** **Contrefactuel obligatoire** : un câblage `APPLE_*`
      actif injecté dans `release.yml` (en mémoire) ⇒ la garde **rougit nommément** en exigeant le
      retrait de la déclaration macOS ; révoqué, `sha256` de `release.yml` **identique avant et
      après**.
- [ ] **CA-A8** — **Refus d'une déclaration incomplète.** Une entrée de `absences_de_signature`
      privée de sa `condition_de_levee` fait **rougir** la garde avec le nom de l'entrée — jamais
      une ligne muette. *(Calque de `vitrine.mjs:126-131`.)*
- [ ] **CA-A9** — **L'écart AR-C(a) est écrit dans le README**, en toutes lettres : le `.dmg` et
      le `.msi` **amorcent**, ils n'enchaînent pas — avec la raison (un DMG n'exécute rien ;
      Windows Installer n'exécute qu'un MSI à la fois). **Contrefactuel de forme** : un balayage du
      README sur cette formulation, qui rougit si elle disparaît.
- [ ] **CA-A10** — **Étape CI de notarisation** : elle **existe** dans `release.yml` et **imprime**
      son verdict. **Aucun saut silencieux.** Si AR-V5 est tranché **(b)**, l'absence de câblage
      `env` est **écrite dans le fichier** avec son motif. *(Non prouvable en exécution ici — voir
      gate humain.)*
- [ ] **CA-A11** — **`release.yml` n'a reçu AUCUNE autre modification** que l'étape de
      notarisation. Prouvé par `diff`, pas par déclaration. Les cliquets `pin-tauri-action`,
      `release-matrice` et `bloc-latest` restent **verts et inchangés**.
- [ ] **CA-A12** — **`IakaCockpit` et `iakaFrameGUI` sont intacts.** `git status` propre dans les
      deux, et leurs `fixtures/convergence.sha256` portent toujours **24** entrées.
- [ ] **CA-A13** — **Face en ligne rejouée** sur `v0.1.1` : code de sortie **cité**. Un `3`
      (non mesuré) est rapporté comme **non mesuré**, jamais comme un succès. *(Hors gate : elle
      dépend d'un tiers.)*
- [ ] **CA-A14** — **Divergence déclarée** : chaque fichier copié des sœurs porte, **en tête**, la
      liste **exacte** de ce qui diffère, et le renvoi à `CONVERGENCE-TROIS-FRERES`. Un fichier
      copié sans cartouche est un défaut.
- [ ] **CA-A15** — `CLAUDE.md` § Commandes cite les trois scripts neufs, et
      `scripts/__tests__/commandes-documentees.test.mjs` reste **vert** (chaque `npm run <x>` cité
      existe dans `package.json`).
- [ ] **CA-A16** — Les quatre mesures du gate sont rendues **une par ligne**, avec **son** code de
      sortie et **son** chiffre : `npm run typecheck`, `npm run lint`, `npm run test`,
      `cargo test`. Une formule d'ensemble vaut **FAIL**.

### Gate humain — DÉCLARÉ non couvert, jamais compté comme tenu

*Précédent AR-6 du cadrage parent, tenu à la lettre : « buildé et signé ne vaut pas recetté ».*

| Ce qui reste à un humain | Pourquoi |
|---|---|
| **Télécharger le `.dmg` par NAVIGATEUR sur un Mac vierge**, subir Gatekeeper, suivre la procédure Sequoia du README **telle qu'elle est écrite**, et dire si elle est juste | Seul contrôle qui mesure R1. `gh release download` **ne pose pas** la quarantaine et **trompe** (R2). |
| **Lancer le `.msi` sur un Windows réel**, subir SmartScreen, suivre la procédure du README | Aucune machine Windows ici ; et la réputation SmartScreen ne se simule pas. |
| **Installer le `.deb` et lancer l'AppImage sur un Linux réel** | Aucune machine Linux ici. |
| **Lancer le `.dmg` Intel sur un Mac Intel** | Machine absente. |
| **Voir l'étape de notarisation s'exécuter et se sauter en le disant dans un run CI réel** | Exige un **push de tag** — acte du décideur, refusé aux agents. CA-A10 se vérifie **par lecture** ici, et se **recette** au prochain tag. |
| **Acheter l'adhésion Apple Developer Program / un certificat de signature Windows ; poser un secret dans les réglages du dépôt** | Actes du décideur. Ce sont les **conditions de levée** écrites, pas du travail d'exécution. |

---

## 9. Estimation

*Ordre de grandeur assumé et révisable — **pas un engagement ferme**.*

| Poste | j-homme | Complexité / risque | Inconnues |
|---|---|---|---|
| Copie de la convention (5 fichiers) + scripts npm | **0,25** | faible | aucune si l'étape 0.4 confirme la byte-identité des sœurs |
| `README.md` **écrit de zéro** + zones + écart AR-C(a) + comptage AR-A | **0,25** | faible | il n'existe pas (M-1) : c'est de la rédaction, pas du marquage |
| `absences_de_signature` + `rendreSecurite` + garde + **cliquet offline** + contrefactuels | **0,5** | **moyenne** | **aucun précédent dans le portefeuille** (M-15) : c'est de la matière neuve, pas une copie |
| Étape CI de notarisation (mesure 0.3 comprise) | **0,25** | **moyenne** | la forme dépend de ce que dit la source au SHA épinglé ; `tauri-action#291` |
| Deux faces rejouées + mesures citées + mémoire du lot | **0,25** | faible | la face en ligne dépend d'un tiers (quota anonyme) |
| **Total** | **≈ 1,5** *(fourchette 1 – 2,5)* | | |
| *(successeur `CONVERGENCE-TROIS-FRERES`, deux autres dépôts)* | *+0,75* | | **non compté** — autre lot, autre gate, autre Gimli |
| *(successeur `UPDATER-DE-LA-FACADE`)* | *+1* | | **non compté** — soumis à l'acte du décideur (paire minisign) |

**Écart avec l'estimation parente (B′-b ≈ 0,75 j), et sa raison.** Le parent chiffrait B′-b comme
une **copie de convention** sur un dépôt déjà doté d'un README. **Trois faits mesurés le doublent :**
(1) **il n'y a pas de README du tout** (M-1) — il faut l'écrire, pas le marquer ; (2) **la
déclaration d'absence de signature n'existe nulle part dans le portefeuille** (M-15) : le mécanisme
qu'AR-D(b) demandait de « réutiliser » **est à inventer**, avec son cliquet et son contrefactuel ;
(3) l'étape CI de notarisation exige une **mesure de source** au SHA épinglé avant d'écrire une
ligne. En sens inverse, **C.3 ne coûte plus rien** : la release est faite.

**Les trois inconnues qui peuvent faire glisser ce chiffre, nommées :**
1. **AR-V5.** Si la mesure 0.3 montre qu'un `APPLE_*` vide fait rougir le build, la forme (a)
   devient un travail de contournement d'un coût **non borné par comparaison** — d'où la
   recommandation de basculer sur (b) plutôt que de creuser.
2. **Le cliquet offline d'AR-V2.** Sa forme exacte (« un câblage de signature actif fait tomber la
   déclaration ») n'a **aucun précédent** ; le contrefactuel peut demander plus d'un essai.
3. **L'étape 0.4.** Si les deux sœurs divergent déjà sur l'un des cinq fichiers de vitrine — ce que
   `CONVERGENCE-RELEASE-YML-ALIGNEMENT` rend plausible pour d'autres fichiers —, le lot s'arrête
   pour arbitrage plutôt que de copier une divergence.

---

## 10. Vérification (gate de ce lot)

`npm run typecheck` · `npm run lint` · `npm run test` · `cargo test` — **une ligne par commande**,
avec son code de sortie et son chiffre · `npm run vitrine:check` = **0** · `npm run
vitrine:en-ligne` sur `v0.1.1`, **code cité** · **chaque contrefactuel joué ET révoqué avec
preuve** (`sha256` identique avant/après) · `git status` propre dans `IakaCockpit` et
`iakaFrameGUI`.

**Garde d'honnêteté, héritée et non négociable** : un critère **non mesuré** se déclare *non
mesuré*, **jamais** *PASS*. Une formule d'ensemble (« tout est vert », « les suites complètes »)
vaut **FAIL**.
