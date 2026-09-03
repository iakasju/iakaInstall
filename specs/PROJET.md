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

- **Visibilité du dépôt.** Créé **privé** (défaut du portefeuille). Or au lot C.3 un inconnu doit
  pouvoir télécharger le `.dmg` et le `.msi` ⇒ **il devra passer public**. Décision à prendre quand
  la première release approche, pas avant.
- **Nom affiché du produit** (`productName`) : il commande toute la chaîne de distribution (vitrine,
  manifeste, artefacts). `iakaInstall` est le nom du **dépôt** ; le nom de l'**application** peut
  différer. À figer **avant** C.2, car il est très coûteux à changer ensuite.
- **Charte visuelle** de la façade (réservoir `iakagraph/theme/`) — non abordée par le cadrage.
