# CONVERGENCE-TROIS-FRERES — le registre passe de deux frères à trois, et il les NOMME

> Cadré par 🔵 **Gandalf** le **2026-09-08**, sur ordre de mission de 🟠 Aragorn (REPRISE : un
> premier cadreur s'est figé deux fois avant d'écrire — cette instruction est écrite en un seul
> passage, section par section, sans fetch web).
> **Lecture seule sur le code.** Successeur nommé d'**AR-V4 → (a)** de
> `specs/instructions/amorcage-c3-vitrine-trois-freres.md` (§ 3 AR-V4, mandat en trois points), et
> voisin du lot `RELEASE-PARTIELLE-PUBLIEE` (`specs/instructions/release-partielle-publiee.md`),
> dont les **deux successeurs jumeaux** sont rédigés **en annexe** de ce cadrage.
>
> **Ce cadrage ne rouvre aucun des six arbitrages d'AR-V1..AR-V6.** Il ferme le périmètre du
> successeur qu'ils ont nommé, et il rédige le mandat des deux sœurs — qu'un agent d'`iakaInstall`
> ne peut pas écrire dans leurs dépôts (canal d'écriture borné, CA-R11).

---

## 0. Ce qui a été mesuré le 2026-09-08

### 0.1 — Instruments, et la limite qui les borne

Mesures faites **par lecture de fichiers** (`Read`, `Grep`, `Glob`). **Je n'ai eu aucun shell dans
cette session de cadrage.**

Conséquence, énoncée pour qu'elle ne soit pas oubliée : **je n'ai exécuté ni `npm`, ni `gh`, ni
`git`, ni `sha256sum`, ni `diff`.** **Aucune empreinte n'apparaît ci-dessous sous ma signature** —
et c'est le point le plus important de ce cadrage, dont l'objet *est* la byte-identité. Là où
j'écris « byte-identique », je m'appuie soit sur un **cartouche déclaré dans le fichier lui-même**,
soit sur un fait **attribué** en § 0.2 ; jamais sur une mesure de ma main. **Toute affirmation
d'identité octet à octet est l'étape 0 de ⚒️ Gimli** (§ 5), avec sa sortie citée. Une instruction
qui prétendrait le contraire fabriquerait exactement le faux vert que ce corpus refuse.

### 0.2 — Faits transmis par 🟠 Aragorn, attribués (non re-mesurés par moi)

- **`iakaInstall` v0.1.2 publiée** (9 assets, `releases/latest` = ce tag).
- **Vitrine et README copiés des sœurs avec cartouches**, `iakaInstall` **n'entrant pas** au
  registre de convergence (AR-V4(a) du lot précédent).
- Le registre `fixtures/convergence.sha256` est **dupliqué chez les deux sœurs** et **n'existe pas**
  dans `iakaframe`.
- Les deux sœurs **portent la faiblesse de release** corrigée chez `iakaInstall`.
- Premier run réel du 2026-09-06 (`34026373514`) : le **fail-safe est prouvé** (rien d'incomplet
  n'est devenu visible), la **publication a rougi** sur `gh api --jq --arg`, corrigée depuis, avec
  une **jambe d'exécution** neuve.

### 0.3 — Faits internes relevés par moi (chemin:ligne)

**M-C1 — LE REGISTRE PORTE 26 ENTRÉES, PAS 24. Le chiffre de l'ordre de mission est périmé.**
`iakaFrameGUI/fixtures/convergence.sha256` : lignes d'empreinte **12-23** (12), **30-34** (5),
**44-46** (3), **55-57** (3), **72** (1), **89-90** (2) = **26**. Même compte, mêmes empreintes,
chez `IakaCockpit/fixtures/convergence.sha256`. Le cliquet est passé **23 → 24** puis **24 → 26**
le **2026-09-05** (lots « gardes de la vitrine » puis « garde de la face en ligne des canaux »,
motifs écrits `convergence.sha256:58-71` et `:73-88`). ⚠️ **Le `27` que rend `npm run
test:convergence` est une troisième grandeur** : `test-convergence.mjs:113` compare **le registre
lui-même en plus** des chemins qu'il liste. **Trois nombres circulent — 24 (périmé), 26 (entrées),
27 (fichiers comparés) — et les confondre est le plus court chemin vers un faux plancher.**

**M-C2 — la résolution du frère est une ÉNUMÉRATION, premier trouvé, et le hors-couverture est
écrit dans le fichier.** `iakaFrameGUI/scripts/test-convergence.mjs:81-94` : on énumère
`resolve(ROOT, "..")` et `resolve(ROOT, "..", "..", "projects")`, puis `candidats.find(estFrere)`.
`estFrere` (`:42-52`) ne demande qu'**une chose** : que le candidat porte
`fixtures/convergence.sha256` et ne soit pas soi-même. Le hors-couverture est déclaré en toutes
lettres `:59-68` : *« Un TROISIÈME dépôt le portant changerait donc la cible SANS RIEN DIRE, et le
"OK" final parlerait d'un autre dépôt que celui qu'on croit mesurer. »* ⚠️ **L'ordre de
`readdirSync` n'est spécifié par rien** — ce n'est donc pas « `iakaInstall` passerait après », c'est
**« on ne sait pas qui serait mesuré »**. C'est exactement ce qui rend l'angle mort silencieux.

**M-C3 — LE FAIT QUI COMMANDE TOUT LE LOT : la face croisée traite un fichier absent comme un
ÉCART.** `test-convergence.mjs:119-126` : `ABSENT ici` et `ABSENT chez le frere` sont poussés dans
`ecarts`, donc **exit 1**. Or `iakaInstall` **ne porte que 11 des 26 chemins** (M-C4). ⇒ **inscrire
`iakaInstall` au registre tel qu'il est ferait rougir la face croisée QUINZE fois, immédiatement,
et pour de bonnes raisons.** La convergence à trois **n'est pas** la même relation que la
convergence à deux : entre les sœurs c'est une **égalité**, avec `iakaInstall` c'est une
**intersection**. Aucune option de ce cadrage ne peut ignorer ce fait.

**M-C4 — ce qu'`iakaInstall` porte des 26 chemins : 11 présents, 15 absents.** Mesuré par `Glob`
sur `/Users/sjupin/work/iakaInstall/{scripts,fixtures}/**/*`.

| # | Chemin du registre | Chez `iakaInstall` | Statut |
|---|---|---|---|
| 1 | `fixtures/tauri-action-pin.json` | **présent** | aucun cartouche de divergence ; **0 occurrence** du nom du dépôt ⇒ **candidat byte-identique** |
| 2 | `scripts/__tests__/pin-tauri-action.test.mjs` | **présent** | idem ⇒ candidat byte-identique |
| 3 | `scripts/lib/pin-tauri-action.mjs` | **présent** | en-tête `:1-13` **sans** cartouche de divergence ⇒ candidat byte-identique |
| 4 | `fixtures/updater-cles.json` | absent | pas d'updater (AR-V3(a), successeur `UPDATER-DE-LA-FACADE`) |
| 5 | `scripts/__tests__/canal-mesure.test.mjs` | absent | idem |
| 6 | `scripts/__tests__/forge-host-parity.test.mjs` | absent | c'est **la face locale de la convergence** — absente faute de registre |
| 7 | `scripts/__tests__/verifier-mesures.test.mjs` | absent | idem updater |
| 8 | `scripts/lib/verifier-mesures.mjs` | absent | idem |
| 9 | `scripts/mesurer-artefacts.mjs` | absent | idem |
| 10 | `scripts/test-convergence.mjs` | **absent** | **c'est l'objet du lot** |
| 11 | `specs/instructions/cles-installeur-manifeste-updater.md` | absent | instruction d'un lot updater |
| 12 | `specs/instructions/gardes-tiedes.md` | absent | instruction d'un lot des sœurs |
| 13 | `fixtures/vitrine-assets.json` | **présent** | **byte-identique déclaré** (« vérifié par empreinte », lot C.3) |
| 14 | `scripts/lib/vitrine.mjs` | **présent** | **DIVERGENT DÉCLARÉ**, cartouche `:4-20` — 3 ajouts nommés |
| 15 | `scripts/vitrine.mjs` | **présent** | **DIVERGENT DÉCLARÉ**, cartouche `:5-13` — « exactement sur une ligne » |
| 16 | `scripts/vitrine-en-ligne.mjs` | **présent** | cartouche `:4-5` : « COPIE STRICTE, **aucune divergence fonctionnelle** » ⇒ **le cartouche lui-même diverge** |
| 17 | `scripts/__tests__/vitrine.test.mjs` | **présent** | **DIVERGENT DÉCLARÉ**, cartouche `:4-29` ; **12 occurrences** de `securite` |
| 18 | `fixtures/bloc-latest.sha256` | **présent** | **DIVERGENT PAR CONSTRUCTION** : porte l'empreinte du bloc de **CE** dépôt (`:19`), cartouche `:1-18` |
| 19 | `scripts/lib/bloc-latest.mjs` | **présent** | cartouche local `:3-5` ⇒ divergent au moins par l'en-tête |
| 20 | `scripts/__tests__/bloc-latest.test.mjs` | **présent** | cartouche local `:3-4` ⇒ divergent au moins par l'en-tête |
| 21 | `scripts/lib/canaux-publication.mjs` | absent | pas de chaîne de publication |
| 22 | `scripts/__tests__/canaux-publication.test.mjs` | absent | idem |
| 23 | `scripts/verifier-canaux-en-ligne.mjs` | absent | idem |
| 24 | `scripts/__tests__/vitrine-en-ligne.test.mjs` | **absent** | ⚠️ **la garde de la face en ligne de la vitrine (lot du 2026-09-05) n'a PAS été copiée** — `iakaInstall` porte donc `vitrine-en-ligne.mjs` **sans le test qui l'exerce**, exactement le défaut F-3 que les sœurs ont fermé |
| 25 | `scripts/lib/canaux-en-ligne.mjs` | absent | pas de canaux |
| 26 | `scripts/__tests__/canaux-en-ligne.test.mjs` | absent | idem |

**Résumé mesuré : 11 présents · 15 absents. Parmi les 11 : 5 divergences DÉCLARÉES par cartouche
(14, 15, 17, 18, et au moins l'en-tête de 19/20), 1 divergence probable réduite au cartouche (16),
4 candidats byte-identiques (1, 2, 3, 13).** Aucune de ces quatre n'est **prouvée** identique par
moi (§ 0.1) : c'est l'étape 0.

**M-C5 — un défaut trouvé au passage, hors périmètre, INSCRIT.** L'entrée 24 ci-dessus :
`iakaInstall` porte `scripts/vitrine-en-ligne.mjs` mais **aucun test ne l'exécute** — la copie a été
faite **avant** que les sœurs ne ferment F-3, ou sans reprendre la garde. La désarmer ici laisserait
tout vert. **Ce cadrage ne le traite pas** (ce serait un « tant qu'on y est » sur un lot dont
l'objet est la convergence), il l'**inscrit** : successeur `GARDE-FACE-EN-LIGNE-VITRINE-INSTALL`
(§ 8). L'inscrire **est** le geste.

**M-C6 — les trois `release.yml`, mesurés.**
*Les deux sœurs* (`IakaCockpit/.github/workflows/release.yml` et `iakaFrameGUI/…`, **mêmes numéros
de ligne**) : `:103-104` `tagName`/`releaseName` — donc **chaque job de matrice cherche ou crée la
release**, la course F8 (`tauri-apps/tauri-action#914`) est **ouverte** ; `:105` **`releaseDraft:
false`** — la release est publique **dès le premier build vert** ; `:127` `includeUpdaterJson:
false` ; `:185-190` job `latest`, **`needs: build`**, `if: always()`. **Aucun job `publier`.**
*`iakaInstall`* : brouillon créé **une seule fois** dans `prepare` par appel d'API
(`release.yml:97-113`, `draft=true`), `releaseId` passé à la matrice (`:215`), **`releaseDraft:
true`** (`:223`), job **`publier`** `needs: [build]` **strict, sans `if:`** (`:244-293`), `latest`
en **`needs: publier`** avec `if: always()` **conservé** (`:324-326`).
⇒ **La convention MONTE : d'`iakaInstall` vers les sœurs, jamais l'inverse.** C'est le contenu des
deux annexes.

**M-C7 — LE PIÈGE DES DEUX SŒURS : le bloc `latest:` est un fichier CONVERGENT.**
`convergence.sha256:44` inscrit `fixtures/bloc-latest.sha256`, **avec la même empreinte des deux
côtés**, et le cartouche `:35-43` explique pourquoi : ce n'est pas le workflow qui converge (les
deux diffèrent l. 72 et l. 96-99, successeur `CONVERGENCE-RELEASE-YML-ALIGNEMENT`), **c'est le
bloc**. Or les annexes font passer ce bloc de `needs: build` à `needs: publier`. ⇒ **si une seule
sœur bouge, `fixtures/bloc-latest.sha256` diverge, donc `fixtures/convergence.sha256` diverge, donc
la face croisée rougit.** Les deux instructions jumelles ne sont pas deux lots indépendants : ce
sont **deux moitiés d'un seul commit logique**. Écrit ici parce qu'une annexe lue seule ne le dirait
pas.

**M-C8 — deux précédents mesurés : copier n'est pas inscrire.** (i) `iakaframe` porte sa propre
vitrine (`cli/scripts/lib/vitrine.js`, chemins et extension différents) et **n'est pas** au registre
— le portefeuille tient donc **déjà** trois vitrines et deux frères. (ii)
`iakaInstall/scripts/sync-chartes.sh:2-6` se déclare *« Copie RESTREINTE du geste d'IakaCockpit […]
même contrat de tokens, mais UNE seule entrée au lieu de dix »* : une copie **volontairement
divergente**, jamais candidate au registre. **La question « faut-il inscrire ? » a donc déjà deux
réponses « non » motivées dans ce portefeuille** — ce lot doit dire ce qui change.

**M-C9 — la donnée locale a déjà sa forme dans ce corpus.** Deux registres **locaux**, hors
convergence, avec leur motif écrit : `fixtures/vitrine-locale.json` (motif `convergence.sha256:27-29`
— *« LOCAL à chaque dépôt et n'a donc PAS sa place ici »*) et `fixtures/canaux-publication.json`
(motif `:47-49` — *« son contenu diverge PAR NATURE »*, AR-3 de L45). **Une liste de frères diverge
par nature elle aussi** : chaque dépôt nomme **ses** voisins. La forme existe, il n'y a rien à
inventer.

**M-C10 — `iakaInstall` porte deux gardes de release que les sœurs n'ont pas.**
`scripts/lib/release-publication.mjs` + `scripts/__tests__/release-publication.test.mjs` (garde
**statique**, par lecture du **texte** du workflow, avec sa limite déclarée dans son propre fichier)
et `scripts/__tests__/release-publier-shell.test.mjs` (**jambe d'exécution** : extraction du script
shell par marqueur, exécution en `bash` avec un **faux `gh`** reproduisant la règle d'arité et le
**vrai `jq`**, `SKIP` explicite si `jq` est absent, aucun réseau). ⚠️ **C'est la seconde qui a
attrapé le défaut réel** que la première ne pouvait pas voir (`gh api --jq --arg`, run
`34026373514`). Transposer la faiblesse corrigée **sans** transposer la garde qui l'a corrigée
serait recopier le défaut avec son pansement de façade.

---

## 1. Problème

`iakaInstall` est le **troisième frère de fait** : il porte la vitrine des sœurs, leurs marqueurs,
leurs codes de sortie, leur discipline. Il n'est **le frère de personne au sens du registre** — et
c'est un choix qui a été tranché, motivé et daté (AR-V4(a)).

Trois manques, de natures différentes :

1. **Les copies d'`iakaInstall` ne sont gardées par aucune face croisée.** Une édition en place ici
   ne fait rougir personne. C'est le **coût dit** d'AR-V4(a), pas une découverte — mais il n'a pas
   de terme tant que ce lot n'est pas joué.
2. **Le jour où il entrerait naïvement au registre, il CASSERAIT la garde des sœurs — de deux façons
   distinctes.** D'abord silencieusement (M-C2 : la cible de la face croisée change sans rien dire).
   Ensuite bruyamment et à tort (M-C3 : 15 fichiers « ABSENT », alors que leur absence est
   **normale** — `iakaInstall` n'a ni updater ni chaîne de publication, et c'est écrit).
3. **La faiblesse de release corrigée ici vit toujours chez les deux sœurs** (M-C6) : chez elles, un
   build vert sur quatre suffit à rendre publique une release incomplète, et le `latest` la désigne.
   Ce qui a été **prouvé** chez `iakaInstall` le 2026-09-06 — la moitié fail-safe de la politique —
   n'a **aucun équivalent** chez elles.

Et un quatrième point, qui est le nœud de méthode : **la « convergence à trois » n'est pas la
convergence à deux avec un frère de plus.** À deux, la relation est une **égalité** sur une liste
unique. À trois, elle devient une **intersection déclarée** — et une garde qui traiterait
l'intersection comme une égalité serait, au choix, muette (M-C2) ou menteuse (M-C3).

---

## 2. Décision retenue, et les écarts qu'elle assume

**La décision, en une phrase :** on remplace la **résolution par énumération** par une **liste
NOMMÉE de frères, locale à chaque dépôt**, on fait de la face croisée une mesure **N-1 avec SKIP
nommé** — jamais un vert muet, jamais un rouge pour un frère absent —, et `iakaInstall` n'entre au
registre **que pour le sous-ensemble MESURÉ byte-identique**, l'asymétrie étant **déclarée** au lieu
d'être devinée.

**Trois écarts assumés, chacun motivé — aucun n'est un oubli :**

| # | Écart | Motif court | Arbitrage |
|---|---|---|---|
| É-1 | `iakaInstall` n'entre **pas** au registre pour les 26 chemins, mais pour **4 à 5** d'entre eux (mesure à l'étape 0) | M-C3 : les 15 absents feraient rougir la face croisée **à juste titre** ; leur absence est une **décision écrite** (AR-V3(a), AR-V4(a)), pas une dérive | **AR-C3** |
| É-2 | Les **5 fichiers de vitrine** n'entrent au registre à trois **que si** `rendreSecurite` remonte chez les sœurs | Sans remontée, les copies divergent **délibérément** (cartouches `vitrine.mjs:5-13`, `lib/vitrine.mjs:4-20`, `vitrine.test.mjs:4-29`) : les inscrire ferait rougir la face croisée sur une divergence **voulue** | **AR-C5** |
| É-3 | Les deux instructions jumelles de release sont **un seul commit logique à deux dépôts**, pas deux lots indépendants | M-C7 : `fixtures/bloc-latest.sha256` est **convergent** ; le bloc change ; une sœur qui bouge seule fait diverger le registre | **AR-C6** |

**Ce qui, en revanche, ne bouge pas d'un octet** : les deux faces et leur répartition (locale dans
le gate, croisée hors gate) ; le SKIP propre sans frère (`test-convergence.mjs:96-102`) ;
`IAKA_CONVERGENCE_HOME` **autoritaire** (`:69-79`, exit 2 si le chemin ne porte pas le registre) ;
le cliquet de complétude par dépôt ; la règle *« tout fichier de ce registre se modifie DANS LES
DEUX DÉPÔTS au même commit logique »* (`convergence.sha256:6`), qui devient simplement *« dans TOUS
les dépôts qui l'inscrivent »*.

---

## 3. Arbitrages — à trancher par le décideur

> **Verdicts rendus le 2026-09-08** — autonomie maximale (Stéphane, 2026-09-06), recommandations appliquées
> par 🔴 Aragorn : **AR-C1 → (a)** `fixtures/freres.json` local par dépôt, script neutre. **AR-C2 → (a)** frère
> absent = SKIP nommé. **AR-C3 → (b)** un registre par dépôt, comparaison = intersection, asymétrie dite.
> **AR-C4 → (a)** deux temps, sœurs d'abord (lot 1) puis `iakaInstall` (lot 2). **AR-C5 → (a)**
> `rendreSecurite` remonte dans le lot 1. **AR-C6 → (a)** convention de release entière, garde statique ET
> jambe d'exécution. **Portée** : le lot 1 et les jumelles touchent `IakaCockpit` et `iakaFrameGUI` — hors du
> royaume IAKAFRAME/iakaInstall, ils seront joués sous la posture portefeuille (Odin) après la vague en cours.

*Six questions. Chacune a une recommandation motivée. **Aucune n'est tranchée ici.***

### AR-C1 — Où vit la vérité de la liste des frères ?

- **(a)** Un registre **local et nommé**, `fixtures/freres.json` dans **chaque** dépôt : il nomme
  les autres dépôts (nom + chemin relatif attendu), avec un motif par entrée. `test-convergence.mjs`
  le lit et **cesse d'énumérer** ; le script reste **neutre** — il ne nomme toujours aucun dépôt.
- **(b)** La liste **en dur** dans `test-convergence.mjs`. Le script cesse d'être convergent.
- **(c)** Pas de liste : `IAKA_CONVERGENCE_HOME` rendu **obligatoire**, l'énumération supprimée.

**Recommandation : (a).** **(1)** C'est la **neutralité du script** qui le rend convergent — écrit
dans son propre cartouche (`test-convergence.mjs:3-7` : *« Il ne nomme aucun des deux dépôts en
dur : il désigne "l'autre", quel qu'il soit — c'est ce qui le rend convergent »*). **(b)** détruit
exactement cette propriété, et sortirait le fichier du registre. **(2)** La donnée qui diffère par
dépôt a **déjà sa forme** dans ce corpus, deux fois, avec son motif écrit (M-C9) : `freres.json` est
**local**, **hors** du registre de convergence, pour la même raison que
`fixtures/canaux-publication.json`. **(3)** **(c)** est écarté sur un fait de comportement : une
face croisée qui exige une variable d'environnement pour tourner **ne tourne jamais** — elle devient
une garde tiède, ce que ce corpus refuse nommément. Le remède autoritaire doit **rester** un remède,
pas devenir la seule voie.

### AR-C2 — Que mesure la face croisée à trois : tous les frères, ou N-1 avec SKIP ?

- **(a)** **N-1 avec SKIP NOMMÉ.** Chaque frère **nommé et présent** est mesuré ; un frère **nommé
  mais absent du disque** produit un **SKIP explicite qui le NOMME**, jamais un rouge ; la sortie
  énumère **qui a été mesuré et qui a été sauté** ; **exit 0** seulement si zéro écart, et la ligne
  de succès **ne peut pas être lue comme « tous les frères sont d'accord »** quand l'un a été sauté.
  Zéro frère présent ⇒ SKIP global, exit 0 en le disant (comportement actuel, conservé).
- **(b)** Tous obligatoires : un frère nommé absent ⇒ **rouge**.
- **(c)** Statu quo nommé : on retient le **premier** frère nommé qui est là.

**Recommandation : (a).** **(1)** **(b)** casse le clone isolé — c'est la raison même pour laquelle
cette face est **hors gate** (`test-convergence.mjs:28-30`), et la rendre exigeante la rendrait
inexécutable pour quiconque n'a pas les trois dépôts côte à côte. **(2)** **(c)** est l'angle mort
M-14 **repeint** : on aurait remplacé « premier voisin trouvé » par « premier voisin nommé » sans
rien gagner sur le fond — le « OK » parlerait encore d'un autre dépôt que celui qu'on croit mesurer.
**(3)** La **forme exacte** de (a) existe déjà et a été payée : la ligne de succès de
`iakaFrameGUI/scripts/verifier-canaux-en-ligne.mjs:134` **nomme** les endpoints atteints-sans-servir
en conservant son préfixe `OK (0)` — lot `ENDPOINT-404-COMPTE-COMME-INTERROGE`, dont le défaut était
**mot pour mot celui-ci** : une ligne de sortie qui **affirmait plus que la mesure**. **On reprend
cette forme, on n'en invente pas une seconde.**

**Ce qu'(a) exige, et sans quoi (a) ne vaut pas mieux que (c) :** la ligne de succès **ne doit pas
pouvoir** être vraie à vide. Un test doit rougir si le compte de frères mesurés tombe à zéro pendant
que la sortie garde son préfixe `OK`.

### AR-C3 — Le registre à trois : liste unique, ou intersection des registres ?

*Rappel du fait qui commande : M-C3. `iakaInstall` porte 11 des 26 chemins, et un absent est un
écart.*

- **(a)** Chaque **entrée** du registre porte la liste des frères qu'elle concerne (topologie dans
  le registre).
- **(b)** **Chaque dépôt porte SON registre** — la seule liste qui fasse foi **pour lui** —, et la
  face croisée compare, pour une paire donnée, **l'INTERSECTION des deux registres**. Un chemin
  présent dans un seul registre est **hors comparaison** et **déclaré tel** dans la sortie.
- **(c)** Un second registre par sous-ensemble (`convergence-vitrine.sha256`, etc.).

**Recommandation : (b).** **(1)** Elle **préserve l'invariant fondateur** — *« C'est la SEULE liste
qui fasse foi : aucun compte n'en est recopié ailleurs »* (`convergence.sha256:1-2`) — en le lisant
**par dépôt**, ce qu'il a toujours été de fait : chaque dépôt a **sa** copie, **son** cliquet, **sa**
face locale. **(2)** **(a)** met de la **topologie** dans un fichier d'**empreintes** : le jour où un
quatrième dépôt arrive, chaque ligne des trois registres doit être relue. **(3)** **(c)** multiplie
les registres, donc les planchers, donc les endroits où l'on peut baisser un compte sans le décider
— or le cliquet de complétude existe **précisément** pour que le compte ne descende que sur
décision. **(4)** (b) rend l'asymétrie **lisible** : la sortie dit « 5 chemins comparés avec
`iakaInstall`, 21 hors comparaison (absents de son registre) », et **c'est vrai**.

**Conséquence chiffrée, à dire au décideur** : le registre d'`iakaInstall` ne portera pas 26 entrées
mais **4 ou 5** (les candidats byte-identiques de M-C4 : `fixtures/tauri-action-pin.json`,
`scripts/lib/pin-tauri-action.mjs`, `scripts/__tests__/pin-tauri-action.test.mjs`,
`fixtures/vitrine-assets.json`, plus `scripts/vitrine-en-ligne.mjs` **si et seulement si** l'étape 0
prouve qu'il est byte-identique — son cartouche dit « aucune divergence **fonctionnelle** », ce qui
n'est **pas** la même chose). **Un petit registre honnête vaut mieux qu'un grand registre rouge.**

### AR-C4 — L'ordre des lots : qui bouge en premier, et combien de passes ?

*Fait qui commande : `estFrere` (`test-convergence.mjs:42-52`) ne demande qu'une chose — porter
`fixtures/convergence.sha256`. **À la seconde où `iakaInstall` pose ce fichier, il devient un frère
candidat pour les deux sœurs**, dans un ordre que rien ne spécifie (M-C2).*

- **(a)** **Deux temps.** **Lot 1 — les deux sœurs** (un seul commit logique) : `freres.json` posé
  chez chacune, **nommant les DEUX autres dépôts** (y compris `iakaInstall`, qui n'est pas encore
  là), résolution nommée + N-1 + SKIP nommé. **Lot 2 — `iakaInstall` seul** : registre local,
  `freres.json`, copie du script, script npm, cliquet.
- **(b)** **Trois temps** : sœurs (résolution nommée, ne nommant qu'elles-mêmes) → `iakaInstall`
  (registre) → sœurs de nouveau (ajout d'`iakaInstall` à leur `freres.json`).
- **(c)** Un seul lot traversant les trois dépôts.

**Recommandation : (a).** **(1)** **AR-C2(a) rend le troisième temps INUTILE** : un frère **nommé et
absent** produit un **SKIP nommé**, pas un rouge. Les sœurs peuvent donc nommer `iakaInstall` avant
qu'il n'existe comme frère — et pendant toute la fenêtre entre les deux lots, leur sortie **dit
exactement la vérité** : « `iakaInstall` nommé, absent du disque, non mesuré ». **C'est un état
lisible, jamais un faux vert.** **(2)** L'ordre **1 puis 2 est contraint, pas préférentiel** : si
`iakaInstall` posait son registre en premier, il réaliserait l'angle mort M-14 dans les deux sœurs
pendant toute la durée du lot 1. **(3)** **(c)** est écarté sur un précédent mesuré du portefeuille
— exécutions parallèles sur un arbre git partagé — et sur le canal d'écriture borné de ⚒️ Gimli
(CA-R11) : trois dépôts, trois gates.

**Ce que (a) ne dispense pas de faire** : le lot 1 **est** un lot à deux dépôts au même commit
logique — c'est déjà la règle pour tout fichier du registre (`convergence.sha256:6`), et
`test-convergence.mjs` en est un.

### AR-C5 — Les 5 fichiers de vitrine : remontée de `rendreSecurite` maintenant, ou successeur ?

- **(a)** **Dans le lot 1** : `rendreSecurite()`, la zone `securite`, le cliquet offline et la clé
  `absences_de_signature` (dans le `vitrine-locale.json` **local** de chaque sœur, avec **leur**
  motif, **leur** date, **leur** condition de levée) remontent chez les deux sœurs ; les copies
  redeviennent byte-identiques ; les 5 fichiers deviennent inscriptibles au registre à trois.
- **(b)** On laisse la divergence déclarée par cartouche, et les 5 restent hors du registre à trois.
  Successeur nommé.

**Recommandation : (a).** **(1)** Le mandat est **déjà écrit** et n'est pas de mon fait :
`amorcage-c3-vitrine-trois-freres.md` § AR-V2 exigence 3 — *« `rendreSecurite` est de la matière de
portefeuille, pas d'`iakaInstall` […] le successeur reçoit mandat de REMONTER cette fonction chez
elles, pas de la recopier »*, sur le fait mesuré **M-15** : **les deux sœurs ont exactement la même
absence de notarisation et de signature, et ne la déclarent nulle part.** **(2)** Le lot 1 touche
**déjà** les deux sœurs au même commit logique : y adjoindre la remontée ne crée aucune passe
supplémentaire. **(3)** Différer laisserait le portefeuille dans l'état exact qui a motivé AR-V2 :
**un produit sur trois dit ce qu'il ne signe pas**, les deux autres se taisent.

**Coût dit, sans le minimiser** : (i) la remontée **fait bouger les deux README** (zone `securite`
neuve) — donc `npm run vitrine -- --write` puis `vitrine:check` des deux côtés, et la face en ligne
à rejouer ; (ii) le **cliquet offline** lit le `release.yml` **de chaque sœur**, qui n'est pas
byte-identique à celui d'`iakaInstall` : la fonction reste générique, mais son résultat est local ;
(iii) si le décideur préfère (b), les 5 fichiers **restent hors registre à trois** et le registre
d'`iakaInstall` tombe à **3 ou 4 entrées** — ce qui reste honnête, seulement plus maigre.

### AR-C6 — Les jumelles de release : convention entière, ou moitié ?

- **(a)** **La convention entière monte** : brouillon créé **une fois** dans `prepare` par API +
  `releaseId` passé à la matrice + `releaseDraft: true` + job `publier` `needs: [build]` **strict**
  + `latest` en `needs: publier` (`if: always()` **conservé**) + la **garde statique**
  (`release-publication.mjs` et son test) + **la jambe d'exécution**
  (`release-publier-shell.test.mjs`) + **refixation de `fixtures/bloc-latest.sha256`** des **deux**
  côtés au même commit.
- **(b)** La moitié visible : `releaseDraft: true` + `publier`, sans la jambe d'exécution.

**Recommandation : (a).** **(1)** Fait mesuré, et il est décisif : la garde **statique** lit le
**texte** du workflow, jamais son **comportement** — sa limite est écrite dans son propre fichier —
et c'est **précisément** ce qui a laissé passer `gh api --jq --arg` jusqu'au run réel
`34026373514`. **Transposer la faiblesse corrigée sans la garde qui l'a corrigée reviendrait à
donner aux sœurs la version d'`iakaInstall` qui a échoué.** **(2)** La création sérialisée du
brouillon dans `prepare` n'est pas un ornement : chez les sœurs, `tagName`/`releaseName`
(`release.yml:103-104`) laisse **chaque job de matrice** chercher ou créer la release — la course F8
y est **ouverte**, là où `iakaInstall` l'a fermée **par construction**. **(3)** `if: always()` sur
`latest` **se conserve** : il doit tourner **même quand `publier` est *skippé*** (matrice rouge),
sinon le pointeur reste au défaut `true` de l'API.

**Ce que (a) n'autorise PAS, et qu'il faut écrire dans les deux annexes** : **aligner les deux
`release.yml` en passant.** Ils divergent déjà (l. 72, l. 96-99), c'est un successeur **nommé**
(`CONVERGENCE-RELEASE-YML-ALIGNEMENT`) et il se cadre, il ne se glisse pas dans un lot voisin. Les
deux jumelles portent **le même geste**, chacune dans son fichier.

---

## 4. Périmètre

### Inclus — LOT 2, `iakaInstall` (le seul dépôt que ce lot-ci modifie)

1. **`fixtures/freres.json`** — registre **local**, hors convergence (motif écrit dedans, calqué sur
   `convergence.sha256:47-49`) : nomme `IakaCockpit` et `iakaFrameGUI`, leur chemin relatif attendu,
   et **une raison par entrée**.
2. **`scripts/test-convergence.mjs`** — copie **byte-identique** de la version issue du lot 1 des
   sœurs (résolution nommée, N-1, SKIP nommé). **Aucune adaptation** : ce fichier ne nomme aucun
   dépôt, tout vient de `freres.json`.
3. **`fixtures/convergence.sha256`** — registre **local** d'`iakaInstall`, ne portant que les
   chemins **MESURÉS byte-identiques** à l'étape 0 (AR-C3(b)), chacun sous un commentaire qui dit
   **pourquoi il converge** ; en-tête reprenant la commande de régénération
   (`convergence.sha256:9`) ; **cliquet de complétude** posé au compte mesuré.
4. **`scripts/__tests__/forge-host-parity.test.mjs`** ou son équivalent local — **la face LOCALE**,
   dans le gate : recalcule les empreintes du registre local et **nomme** le fichier qui a dérivé.
   Sans elle, le registre n'est qu'un fichier de texte.
5. **Le script npm `test:convergence`**, **hors** `npm test` (motif identique aux sœurs : la mesure
   dépend d'un dépôt frère), **inscrit dans `CLAUDE.md` § Commandes dans le même commit** — sans
   quoi `scripts/__tests__/commandes-documentees.test.mjs` est en défaut.
6. **`CLAUDE.md`** : § Commandes, § Convergence (la règle opératoire à trois), backlog —
   `CONVERGENCE-TROIS-FRERES` coché **avec sa preuve**, successeurs inscrits (§ 8).
7. **Les cartouches des copies divergentes mis à jour** : `scripts/lib/vitrine.mjs:4-20`,
   `scripts/vitrine.mjs:5-13`, `scripts/__tests__/vitrine.test.mjs:4-29` disent aujourd'hui
   *« `iakaInstall` N'ENTRE PAS à ce registre »*. **Après ce lot, cette phrase est fausse** — elle
   doit être **rectifiée en la datant**, jamais effacée (règle 4 du corpus).

### Inclus — LOT 1, les deux sœurs (annexes A et B ; déposé par Odin, pas par cet agent)

Voir **Annexe A** (`RELEASE-BROUILLON-JUSQUA-MATRICE-VERTE-COCKPIT`) et **Annexe B** (`…-GUI`) pour
la part release, et **Annexe C** pour la part convergence (résolution nommée + remontée de
`rendreSecurite`). ⚠️ **Lot 1 précède lot 2** (AR-C4).

### Exclu — décidé, pas oublié

- **Aligner les deux `release.yml` entre eux** → `CONVERGENCE-RELEASE-YML-ALIGNEMENT`, déjà nommé.
- **L'updater d'`iakaInstall`** et tout ce qui en dépend (`fixtures/updater-cles.json`,
  `mesurer-artefacts.mjs`, `verifier-mesures*`, `canaux-*`) → `UPDATER-DE-LA-FACADE` (AR-V3(a)).
  **Ces 15 chemins n'entrent pas au registre d'`iakaInstall`, et leur absence est une décision
  écrite, pas une dérive.**
- **La garde manquante de `vitrine-en-ligne.mjs` chez `iakaInstall`** (M-C5) →
  `GARDE-FACE-EN-LIGNE-VITRINE-INSTALL`, inscrit § 8. **Ne pas la traiter ici.**
- **Tout acte de release** : poser un tag, publier, supprimer un brouillon, poser un secret.
  **Refusé aux agents.** Le **run de preuve** de chaque sœur est **son prochain tag**, et il
  appartient au décideur.
- **`TAURI-ACTION-V1-POUR-LES-TROIS`**, `MARQUE-IAKAINSTALL`, `INSTALL-I18N`,
  `RESSOURCE-CLI-RAFRAICHIE-EN-LIGNE`, `PUBLICATION-VERIFIE-LES-ASSETS` — déjà au backlog, aucun
  n'entre ici.

---

## 5. Étapes d'implémentation (⚒️ Gimli) — LOT 2, `iakaInstall`

### Étape 0 — MESURER, avant d'écrire une ligne

*Je n'ai pas eu de shell ; toi si. Chaque commande a **sa** ligne, **son** code de sortie, **son**
chiffre. Une formule d'ensemble vaut FAIL.*

0.1 **Le compte du registre des sœurs.** Compter les lignes d'empreinte de
`IakaCockpit/fixtures/convergence.sha256` **et** de `iakaFrameGUI/…`. **Dire le nombre.** Si ce
n'est pas **26** des deux côtés (M-C1), **s'arrêter et le dire** : le référent a bougé depuis ce
cadrage.
0.2 **Les deux registres sont-ils byte-identiques entre eux ?** `diff` ou `sha256`. Une divergence
ici invalide tout le lot 1 avant qu'il ne commence.
0.3 **LA MESURE QUI COMMANDE LE PÉRIMÈTRE — la byte-identité des 11 chemins présents.** Pour
**chacun** des 11 de M-C4, comparer `iakaInstall` ↔ `IakaCockpit` ↔ `iakaFrameGUI`. **Rendre un
tableau : chemin, 3 empreintes, verdict.** Les 4 candidats (`tauri-action-pin.json`,
`lib/pin-tauri-action.mjs`, `__tests__/pin-tauri-action.test.mjs`, `vitrine-assets.json`) sont des
**hypothèses de ma part, jamais des mesures** (§ 0.1) : si l'un diverge, il sort du registre, et le
dire est le geste. Mesurer aussi `scripts/vitrine-en-ligne.mjs` — son cartouche dit « aucune
divergence **fonctionnelle** », ce qui laisse ouverte la divergence **du cartouche**.
0.4 **La face croisée aujourd'hui, chez chaque sœur.** `npm run test:convergence` chez l'une, puis
chez l'autre : citer **la ligne qui nomme le frère mesuré**. C'est l'état de départ, et il dit quel
voisin `readdirSync` retient **sur ce poste** — fait local, jamais une loi.
0.5 **L'état de départ d'`iakaInstall`** : `npm run typecheck`, `npm run lint`, `npm run test`,
`cargo test`. Un lot qui commence sur un rouge inconnu ne peut rien prouver.
0.6 **Vérifier que le lot 1 est LANDÉ** (AR-C4) : les sœurs portent-elles `fixtures/freres.json` et
la résolution nommée ? **Sinon, s'arrêter** : poser le registre ici avant elles réalise l'angle mort
M-14.

### Étape 1 — La liste nommée

1.1 Écrire `fixtures/freres.json` : deux entrées (`IakaCockpit`, `iakaFrameGUI`), chacune avec son
**chemin relatif attendu** et **sa raison**. En tête du fichier, le motif de sa localité (« ce
contenu diverge par nature d'un dépôt à l'autre », calque `convergence.sha256:47-49`) et la mention
explicite qu'il **n'entre pas** au registre de convergence.
1.2 Copier `scripts/test-convergence.mjs` **byte-identique** depuis une sœur (post-lot 1). Vérifier
**par empreinte, pas à l'œil**.
1.3 Exposer `test:convergence` dans `package.json`, **hors** `npm test`, et l'inscrire dans
`CLAUDE.md` § Commandes **dans le même commit**.

### Étape 2 — Le registre local et sa face locale

2.1 Écrire `fixtures/convergence.sha256` avec **les seuls chemins mesurés identiques en 0.3**, sous
des commentaires qui disent **pourquoi** chacun converge, et la commande de régénération en tête.
2.2 Poser la **face locale** dans le gate : elle recalcule et **nomme** le fichier qui a dérivé.
2.3 Poser le **cliquet de complétude** au compte mesuré. **Contrefactuel obligatoire** : retirer une
ligne du registre ⇒ le cliquet **rougit nommément** ; révoquer, `sha256` du registre inchangé.

### Étape 3 — Les deux faces jouées

3.1 `npm run test` → la face locale est verte. **Contrefactuel** : muter un octet d'un fichier
inscrit ⇒ la face locale **rougit en le nommant** ; révoquer, empreinte identique.
3.2 `npm run test:convergence` → citer **la sortie entière**. Elle doit **nommer les deux frères
mesurés**, **le compte de chemins comparés**, et **le compte de chemins hors comparaison**.
3.3 **Contrefactuel du frère absent** : renommer temporairement le répertoire d'une sœur (ou pointer
`freres.json` sur un chemin inexistant, sur une **copie**) ⇒ **SKIP NOMMÉ**, exit **0**, et la ligne
de succès **dit qui a été sauté**. Révoquer et prouver au `sha256`.
3.4 **Contrefactuel de l'angle mort M-14** : vérifier qu'**aucune** énumération ne subsiste — retirer
une entrée de `freres.json` ne doit **jamais** faire retomber le script sur un voisin deviné.

### Étape 4 — La mémoire du lot

4.1 **Rectifier en les datant** les trois cartouches qui disent *« `iakaInstall` N'ENTRE PAS à ce
registre »* (§ 4 inclus, point 7). **On date, on n'efface pas.**
4.2 `CLAUDE.md` : § Commandes, § Convergence (la règle à trois : *tout fichier inscrit dans PLUSIEURS
registres se modifie dans TOUS ces dépôts au même commit logique*), backlog coché **avec preuve**,
successeurs inscrits.
4.3 **Remise au gate 🏹 Legolas. Ne pas s'auto-valider.**

---

## 6. Fichiers concernés, par dépôt

### `iakaInstall` — le seul dépôt modifié par CE lot

| Fichier | Nature | Ce qui change |
|---|---|---|
| `fixtures/freres.json` | **neuf, local** | nomme les deux sœurs, chemin + raison ; **hors** registre |
| `scripts/test-convergence.mjs` | **neuf, copié** | version N-aire du lot 1, byte-identique |
| `fixtures/convergence.sha256` | **neuf, local** | 4-5 entrées **mesurées**, motifs, cliquet |
| face locale (`scripts/__tests__/…`) | **neuf** | recalcul + nommage du fichier dérivé + cliquet |
| `package.json` | modifié | script `test:convergence`, **hors** `npm test` |
| `CLAUDE.md` | modifié | § Commandes, § Convergence, backlog, successeurs |
| `scripts/lib/vitrine.mjs` | modifié (**cartouche seul**) | rectification datée `:4-20` |
| `scripts/vitrine.mjs` | modifié (**cartouche seul**) | rectification datée `:5-13` |
| `scripts/__tests__/vitrine.test.mjs` | modifié (**cartouche seul**) | rectification datée `:4-29` |

⚠️ **Aucun fichier d'`IakaCockpit` ni d'`iakaFrameGUI` n'est touché par ce lot.** Leur part est le
lot 1 (annexes), déposée par 🔷 Odin dans leurs dépôts.

---

## 7. Risques

- **R-1 — le registre d'`iakaInstall` se révèle quasi vide.** Si l'étape 0.3 montre que les 4
  candidats divergent, il ne reste presque rien à inscrire. *Mitigation* : **c'est un résultat, pas
  un échec** — on inscrit ce qui converge, on **déclare** le reste, et le lot vaut alors surtout par
  la **fin de l'angle mort** chez les sœurs (lot 1), qui est le vrai danger.
- **R-2 — la fenêtre entre lot 1 et lot 2.** Les sœurs nomment `iakaInstall` avant qu'il ne porte le
  registre. *Mitigation* : AR-C2(a) — **SKIP nommé**, jamais un rouge, jamais un vert muet. La
  fenêtre est **lisible dans la sortie**.
- **R-3 — la remontée de `rendreSecurite` fait bouger les README des sœurs.** *Mitigation* :
  `vitrine -- --write` puis `vitrine:check` **des deux côtés dans le même commit** ; la face en ligne
  rejouée, son code cité (un `3` n'est **jamais** un succès).
- **R-4 — le cliquet `bloc-latest` des sœurs.** M-C7 : si une seule bouge, les registres divergent.
  *Mitigation* : les deux annexes sont **un seul commit logique** ; l'écrire dans les deux.
- **R-5 — `jq` absent d'un poste** ⇒ la jambe d'exécution `SKIP`. *Mitigation* : le SKIP est
  **explicite** (forme déjà en place chez `iakaInstall`) ; il n'est **jamais** compté comme un vert.
- **R-6 — le run de preuve de chaque sœur n'aura pas lieu avant longtemps.** *Mitigation* : c'est
  **déclaré non couvert** (§ 8), pas contourné. La preuve, c'est **leur prochain tag**, et il
  appartient au décideur.

---

## 8. Non couvert — déclaré, jamais présenté comme acquis

- **Le run de preuve chez chaque sœur** = **son prochain tag**. Aucune garde statique, aucune jambe
  d'exécution ne prouve le comportement d'un workflow : c'est écrit dans le fichier de garde
  d'`iakaInstall` lui-même, et c'est le run réel `34026373514` qui l'a établi.
- **Le contrefactuel de sabotage** (entrée `casser`) chez chaque sœur : `workflow_dispatch` sur un
  **tag de test**, jamais sur un tag réel — **acte du décideur**.
- **La byte-identité des 4 candidats** : hypothèse de cadrage, **mesure de l'étape 0**.
- **L'ordre de `readdirSync`** : non spécifié, et **ce lot le rend sans objet** plutôt que de le
  documenter.

**Successeurs INSCRITS ICI, NON TRAITÉS** *(les inscrire est le geste, les traiter serait un « tant
qu'on y est »)* :

- **`GARDE-FACE-EN-LIGNE-VITRINE-INSTALL`** — M-C5 : `iakaInstall` porte
  `scripts/vitrine-en-ligne.mjs` **sans** `scripts/__tests__/vitrine-en-ligne.test.mjs`. La désarmer
  laisse tout vert : **c'est le défaut F-3 des sœurs, rouvert dans le troisième dépôt par la copie**.
  Remède connu, forme connue (sous-processus, réseau neutralisé, limite écrite dans le fichier).
  ≈ **0,5 j**.
- **`CONVERGENCE-RELEASE-YML-ALIGNEMENT`** — déjà nommé chez les sœurs, **non rouvert ici**.
- **`PUBLICATION-VERIFIE-LES-ASSETS`** — déjà au backlog d'`iakaInstall` ; les annexes le
  **transposent comme successeur** chez les sœurs, elles ne le traitent pas.

---

## 9. Critères d'acceptation

*Chaque critère porte **sa** vérification. Un critère non mesuré se déclare **non mesuré**, jamais
`PASS`.*

- [ ] **CA-C1 — le compte est dit, et il est juste.** Le registre d'`iakaInstall` porte exactement
      le nombre d'entrées **mesuré** à l'étape 0.3, et ce nombre est **cité** dans le verdict.
      *Vérif* : sortie de `test:convergence` + compte des lignes d'empreinte.
      *Contrefactuel* : ajouter une ligne pour un chemin **absent** ⇒ la face croisée **rougit en
      nommant le chemin** ; révoquer, `sha256` inchangé.
- [ ] **CA-C2 — plus aucune énumération.** `scripts/test-convergence.mjs` ne contient **aucun**
      `readdirSync` de répertoire voisin ; la résolution passe **uniquement** par `freres.json` ou
      `IAKA_CONVERGENCE_HOME`. *Vérif* : lecture + `grep`.
      *Contrefactuel* : vider `freres.json` ⇒ **SKIP global nommé**, exit 0 — **jamais** un repli sur
      un voisin deviné.
- [ ] **CA-C3 — un frère nommé mais absent produit un SKIP NOMMÉ, exit 0, et la ligne de succès ne
      ment pas.** *Vérif* : étape 3.3, sortie citée. *Contrefactuel* : rendre la clause de SKIP
      **inconditionnelle** ⇒ un **témoin de contraste** (les deux frères présents) doit rougir. **Ce
      verrou n'est pas optionnel** : sans lui, le test serait vert même si le SKIP n'avait jamais
      lieu — le témoin vide, payé neuf fois par ce portefeuille.
- [ ] **CA-C4 — la ligne de succès ne peut pas être vraie à vide.** Si **zéro** frère est mesuré, la
      sortie ne porte pas de `OK` sur la byte-identité. *Contrefactuel* : forcer le compte de frères
      mesurés à zéro tout en conservant le préfixe ⇒ un test **rougit nommément**.
- [ ] **CA-C5 — la face locale nomme le fichier qui a dérivé.** *Contrefactuel* : muter un octet d'un
      fichier inscrit ⇒ rouge **portant le chemin** ; révoquer, empreinte identique.
- [ ] **CA-C6 — le cliquet de complétude ne se baisse que par décision.** *Contrefactuel* : retirer
      une ligne du registre ⇒ rouge nommé.
- [ ] **CA-C7 — l'asymétrie est DÉCLARÉE, pas devinée.** La sortie de la face croisée distingue
      explicitement **comparés** et **hors comparaison**, et donne les deux comptes.
      *Contrefactuel* : compter un chemin hors comparaison comme comparé ⇒ rouge.
- [ ] **CA-C8 — les 15 absents ne sont jamais un écart.** Avec `iakaInstall` mesuré depuis une sœur,
      `fixtures/updater-cles.json` & consorts **n'apparaissent pas** dans les écarts.
      *Vérif* : sortie citée.
- [ ] **CA-C9 — `test:convergence` est hors `npm test`, et documenté.** *Vérif* : `package.json` +
      `CLAUDE.md` + `scripts/__tests__/commandes-documentees.test.mjs` vert.
- [ ] **CA-C10 — les cartouches périmés sont rectifiés EN LES DATANT.** Les trois fichiers du § 4.7
      ne portent plus une phrase fausse, et l'ancienne est **conservée datée**.
      *Vérif* : lecture des trois en-têtes.
- [ ] **CA-C11 — `IakaCockpit` et `iakaFrameGUI` sont INTACTS après le lot 2.** *Vérif* : `git
      status` et `git diff` **vides** dans les deux dépôts.
- [ ] **CA-C12 — chaîne qualité verte, une ligne par commande.** `typecheck`, `lint`, `test`,
      `cargo test` — **chacune** avec son code et son chiffre. Une formule d'ensemble vaut **FAIL**.
- [ ] **CA-C13 — LOT 1 (sœurs), non couvert par ce lot-ci mais suivi ici** : la face croisée de
      chaque sœur nomme le frère mesuré, les deux registres restent byte-identiques entre elles, et
      `fixtures/bloc-latest.sha256` est refixé **des deux côtés au même commit**. *Vérif* : dans le
      gate du lot 1, pas ici.

---

## ANNEXE A — `RELEASE-BROUILLON-JUSQUA-MATRICE-VERTE-COCKPIT`

> **Instruction rédigée ici, à déposer par 🔷 Odin dans `IakaCockpit/specs/instructions/`.**
> Un agent d'`iakaInstall` ne peut pas écrire dans le dépôt d'une sœur (CA-R11) : ce texte est
> **le mandat**, pas le fichier final.
> ⚠️ **Jumelle de l'annexe B : UN SEUL COMMIT LOGIQUE dans les deux dépôts** (M-C7).

### A.1 Problème

`IakaCockpit/.github/workflows/release.yml:105` porte **`releaseDraft: false`** : chaque job de la
matrice publie ce qu'il produit **au fur et à mesure**. Une matrice partiellement rouge laisse donc
une release **publique et incomplète**, et `latest` (`:185-190`, `needs: build`, `if: always()`) la
**désigne**. De plus, `tagName`/`releaseName` (`:103-104`) laissent **chaque job** chercher ou créer
la release : la course F8 (`tauri-apps/tauri-action#914`) est **ouverte**.

Ce n'est pas une hypothèse : `iakaInstall` a vécu le cas (tag `v0.1.0`, 7 assets sur 9, ni `.msi` ni
`.exe`, **publiée**), l'a corrigé, et son **fail-safe a été prouvé en run réel** (`34026373514`).

### A.2 Décision (sous réserve d'AR-C6)

Transposer **la convention entière** d'`iakaInstall` : brouillon créé **une seule fois** dans
`prepare`, `releaseId` passé à la matrice, `releaseDraft: true`, job `publier` `needs: [build]`
**strict et sans `if:`**, `latest` en `needs: publier` avec **`if: always()` conservé**, plus **les
deux gardes** — statique **et** d'exécution.

### A.3 Périmètre

**Inclus** : `.github/workflows/release.yml` (les 4 jobs) · `scripts/lib/release-publication.mjs` +
`scripts/__tests__/release-publication.test.mjs` (garde statique, **limite déclarée dans le
fichier**) · `scripts/__tests__/release-publier-shell.test.mjs` (**jambe d'exécution** : extraction
par marqueur, `bash`, faux `gh` à l'arité du vrai, **vrai `jq`**, SKIP explicite si `jq` absent,
zéro réseau, zéro jeton) · **refixation de `fixtures/bloc-latest.sha256`** · régénération de
`fixtures/convergence.sha256` · `CLAUDE.md` (backlog + preuve).
**Exclu** : **aligner les deux `release.yml`** (→ `CONVERGENCE-RELEASE-YML-ALIGNEMENT`) · toucher à
`prerelease` · toucher à `includeUpdaterJson` · **tout acte de release**.

### A.4 Étapes

0. **Mesurer** : lire `release.yml` au SHA épinglé de `tauri-action` et **confirmer** que
   `releaseId` court-circuite la recherche/création (`src/index.ts:178`) et attache par id
   (`:211`) — **relire à la source, ne pas croire ce cadrage** ; empreinte du bloc `latest:` avant
   modification ; état de départ (`quality.sh`).
1. `prepare` : créer le brouillon par `gh api "repos/$DEPOT/releases" -X POST … -F draft=true`,
   sortir `release_id`.
2. `build` : remplacer `tagName`/`releaseName` par `releaseId`, poser `releaseDraft: true`.
   ⚠️ **Ne pas toucher** aux dépendances Linux (l. 72) ni au commentaire minisign (l. 96-99).
3. `publier` : `needs: [build]` **strict**, adressage **par id, jamais par tag**, zéro brouillon =
   échec nommé, **deux** brouillons = échec nommé (jamais de choix à l'aveugle).
   ⚠️ **`gh api` n'a PAS d'option `--arg`** : `--paginate` rend le JSON brut, **seul `jq`** reçoit
   `--arg`. C'est le défaut réel du run `34026373514`.
4. `latest` : `needs: publier`, **`if: always()` conservé** (il doit tourner quand `publier` est
   *skippé*).
5. Gardes : statique **et** d'exécution, avec un **rouge préalable capturé** avant le correctif.
6. **Refixer `fixtures/bloc-latest.sha256`** en **datant** le motif ; régénérer
   `fixtures/convergence.sha256` ; **au même commit logique que l'annexe B**.

### A.5 Critères d'acceptation

- [ ] **CA-A1** — `releaseDraft: true` et `releaseId` posés ; plus aucun `tagName`/`releaseName` sous
      le `with:`. *Contrefactuel* : remettre `releaseDraft: false` sur une **copie en mémoire** ⇒ la
      garde statique **rougit en nommant la valeur**.
- [ ] **CA-A2** — `publier` en `needs: [build]` **sans `if:`**. *Contrefactuel* : ajouter un `if:` ⇒
      rouge nommé.
- [ ] **CA-A3** — `latest` en `needs: publier` **avec** `if: always()`. *Contrefactuel* : retirer
      `always()` ⇒ rouge nommé.
- [ ] **CA-A4** — **aucun** `gh api … --jq --arg` dans le fichier. *Contrefactuel* : réintroduire le
      motif sur une copie ⇒ détecté.
- [ ] **CA-A5** — la **jambe d'exécution** exécute réellement le script du job `publier` (faux `gh`
      à l'arité du vrai, vrai `jq`) et **rougissait** sur le texte bogué. *Vérif* : rouge préalable
      capturé, puis vert.
- [ ] **CA-A6** — `fixtures/bloc-latest.sha256` refixé, **motif daté**, ancien texte **conservé**.
- [ ] **CA-A7** — `fixtures/convergence.sha256` régénéré et **byte-identique avec `iakaFrameGUI`**.
      *Vérif* : `diff` vide. **Ce critère échoue si l'annexe B n'est pas jouée au même commit.**
- [ ] **CA-A8 — NON COUVERT, DÉCLARÉ** : la preuve de bout en bout est **le prochain tag** (run 4/4
      vert ⇒ `isDraft: false`, assets complets, `latest` = ce tag ; run sabotée ⇒ brouillon conservé,
      `latest` **inchangé**, `publier` *skipped*). **Acte du décideur.**
- [ ] **CA-A9** — `bash scripts/quality.sh` **exit 0**, chiffres cités ligne par ligne.

### A.6 Successeurs à inscrire là-bas

`PUBLICATION-VERIFIE-LES-ASSETS` (un build **vert et vide** passerait la règle) ;
`CONVERGENCE-RELEASE-YML-ALIGNEMENT` (rappelé, non traité).

---

## ANNEXE B — `RELEASE-BROUILLON-JUSQUA-MATRICE-VERTE-GUI`

> **Même mandat que l'annexe A, dans `iakaFrameGUI`.** Les deux `release.yml` portent, au 2026-09-08,
> **les mêmes numéros de ligne** pour les points en cause (`:103-105`, `:127`, `:185-190`) : le geste
> est **identique**, le fichier est **différent**.

**Ce qui change par rapport à l'annexe A, et rien d'autre :**

1. **`scripts/quality.sh` n'existe pas dans ce dépôt** — la chaîne qualité s'y rend en **lignes
   séparées** : `npm run lint:all`, `npm run test:all`, **`npm run test:rust` sur une ligne
   distincte et obligatoire** (arbitrage écrit dans le `package.json` lui-même ; une formule
   d'ensemble vaut **FAIL**).
2. Les **écarts connus** avec le Cockpit — dépendances Linux l. 72, commentaire minisign l. 96-99 —
   **ne sont pas corrigés en passant**.
3. Les critères deviennent **CA-B1..CA-B9**, mot pour mot ceux d'A.5, avec **CA-B7** miroir :
   `fixtures/convergence.sha256` byte-identique avec `IakaCockpit`.

⚠️ **A et B sont UN SEUL commit logique.** `fixtures/bloc-latest.sha256` est un fichier
**convergent** (`convergence.sha256:44`) : jouer A sans B fait diverger le registre et rougir la
face croisée des deux côtés. **Aucune des deux ne se fusionne seule.**

---

## ANNEXE C — LOT 1, la part CONVERGENCE des deux sœurs

> **À déposer par 🔷 Odin dans les deux dépôts** — un seul commit logique. **Précède le lot 2**
> (AR-C4).

### C.1 Ce qui est livré (sous réserve d'AR-C1, AR-C2, AR-C5)

1. **`fixtures/freres.json`** dans chaque sœur — **local**, hors registre, nommant **les deux
   autres** dépôts (`iakaInstall` **compris**, bien qu'absent : AR-C2(a) le rend inoffensif), avec
   chemin relatif attendu et **une raison par entrée**.
2. **`scripts/test-convergence.mjs`** réécrit, **byte-identique entre les deux sœurs** :
   - résolution **par `freres.json`**, plus aucune énumération de voisins ;
   - `IAKA_CONVERGENCE_HOME` **conservé et autoritaire** (exit 2 inchangé) ;
   - mesure **N-1** : chaque frère nommé et présent est comparé ;
   - **SKIP NOMMÉ** pour un frère nommé et absent (exit 0), la ligne de succès **énumérant** mesurés
     et sautés — **forme reprise de `verifier-canaux-en-ligne.mjs:134`**, jamais réinventée ;
   - comparaison sur l'**INTERSECTION des deux registres** (AR-C3(b)), avec le compte **hors
     comparaison** dit ;
   - le hors-couverture `:59-68` **retiré en le datant** — il est **fermé**, c'est le lot.
3. **Remontée de `rendreSecurite()`** (AR-C5(a)) : la fonction, la zone `securite`, les deux
   fonctions du **cliquet offline**, et la clé `absences_de_signature` dans le
   `fixtures/vitrine-locale.json` **local** de chaque sœur — avec **son** motif, **sa** date, **sa**
   condition de levée. Les 5 fichiers de vitrine redeviennent alors byte-identiques **avec
   `iakaInstall`** et deviennent inscriptibles au registre à trois.
4. **README des deux sœurs régénérés** (`vitrine -- --write`), `vitrine:check` **0**,
   `vitrine:en-ligne` **rejoué et son code cité** (un `3` n'est jamais un succès).
5. **`fixtures/convergence.sha256` régénéré** des deux côtés, cliquet **relevé si et seulement si**
   un fichier **neuf** est inscrit ; `CLAUDE.md` des deux sœurs mis à jour (§ Convergence : la règle
   à trois).

### C.2 Critères

- [ ] **CA-D1** — plus aucun `readdirSync` de voisin dans `test-convergence.mjs`.
      *Contrefactuel* : `freres.json` vidé ⇒ SKIP global nommé, **jamais** un repli deviné.
- [ ] **CA-D2** — un frère nommé absent ⇒ **SKIP nommé**, exit 0, ligne de succès honnête, **avec
      témoin de contraste** (verrou anti-témoin-vide).
- [ ] **CA-D3** — `IAKA_CONVERGENCE_HOME` **inchangé dans son comportement** : chemin sans registre
      ⇒ exit **2**, aucun repli. *Contrefactuel* : rétablir un repli ⇒ rouge nommé.
- [ ] **CA-D4** — les deux `test-convergence.mjs` et les deux `convergence.sha256` sont
      byte-identiques **entre sœurs**. *Vérif* : `diff` vide.
- [ ] **CA-D5** — `rendreSecurite` remonté : les 5 fichiers de vitrine sont byte-identiques **entre
      les trois dépôts**. *Vérif* : empreintes des trois côtés, citées.
- [ ] **CA-D6** — le **cliquet offline** rougit sur chaque sœur si son `release.yml` câble un `env:`
      `APPLE_*`/`WINDOWS_*` actif. *Contrefactuel* : injecter le câblage sur une **copie en
      mémoire** ⇒ rouge nommé ; révoquer, `sha256` inchangé.
- [ ] **CA-D7** — chaîne qualité verte des deux côtés, **une ligne par commande** (`quality.sh` côté
      Cockpit ; `lint:all` + `test:all` + **`test:rust`** côté GUI).

---

## ANNEXE D — Estimation (obligatoire au jalon P1→P2)

| Lot | Dépôt(s) | Équivalent j-homme | Complexité / risque |
|---|---|---|---|
| **Lot 1 — convergence** (annexe C) | `IakaCockpit` **+** `iakaFrameGUI`, un commit logique | **1,25 j** | **Élevée** : réécriture d'un fichier convergent + remontée de `rendreSecurite` + 2 README + 2 registres, sur **deux gates** |
| **Lot 2 — registre à trois** (ce cadrage) | `iakaInstall` | **0,5 j** | **Faible** : copie + registre local + face locale ; dépend entièrement des mesures de l'étape 0 |
| **Lots jumeaux — release** (annexes A+B) | `IakaCockpit` **+** `iakaFrameGUI`, un commit logique | **1,25 j** | **Moyenne-élevée** : geste connu et éprouvé, mais 2 gardes neuves × 2 dépôts + refixation de cliquets convergents |
| **Total** | trois dépôts, **quatre gates** | **≈ 3 j-homme** | — |

**Ce n'est pas un engagement ferme : un ordre de grandeur assumé et révisable**, à confronter au
temps réel à la clôture.

**Inconnues susceptibles de faire glisser :**

1. **Le résultat de l'étape 0.3.** Si les 4 candidats byte-identiques n'en sont pas, le registre
   d'`iakaInstall` tombe à 1 ou 2 entrées — le lot 2 **raccourcit** (≈ 0,3 j) mais son **intérêt**
   se déplace entièrement vers le lot 1.
2. **La remontée de `rendreSecurite`** (AR-C5). Si le décideur tranche **(b)**, le lot 1 perd ≈ 0,4 j
   et le registre à trois perd 5 entrées. Si **(a)**, la régénération des README des deux sœurs peut
   faire rougir leur face en ligne pour une raison **étrangère au lot** (une release déjà divergente)
   — imprévisible depuis ici.
3. **L'état réel des deux registres** (étape 0.2). S'ils ont divergé depuis le 2026-09-05, il faut
   **d'abord** les réconcilier — lot non compté ici.
4. **Les gates**. Quatre gates indépendants, sur trois dépôts. L'historique récent de ce portefeuille
   montre **un FAIL puis PASS** sur plusieurs lots de cette famille — un FAIL coûte ≈ 0,25 j.
5. **`jq` et le poste.** La jambe d'exécution `SKIP`e sans `jq` : un SKIP n'est pas une preuve, et il
   faudra le dire au verdict plutôt que de le taire.
