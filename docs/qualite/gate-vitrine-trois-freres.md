# Rapport qualité — `C.3 + B′-b — la vitrine à trois frères` — branche `feat/vitrine-trois-freres` — 2026-09-05

> Gate P2 🏹 Legolas, contexte séparé (jamais l'agent qui a codé). Base de comparaison :
> `ddf3d3d` (avant lot, `main`) → `64baf72` (HEAD, 5 commits Gimli : `f44003b`, `646bf33`,
> `f0fe00b`, `e776285`, `64baf72`). Référence : `specs/instructions/amorcage-c3-vitrine-trois-freres.md`
> — verdicts § 3 rappelés en tête de l'ordre de mission (AR-V1(a), AR-V2(a), AR-V3(a), AR-V4(a),
> AR-V5(a si et seulement si..., sinon b), AR-V6(a)), critères d'acceptation § 8 (CA-A1..CA-A16).
> Aucune ligne de code modifiée par ce gate ; aucun push, aucun tag, aucun `gh workflow run`,
> aucune release touchée ; lecture seule sur GitHub et sur les deux sœurs (`IakaCockpit`,
> `iakaFrameGUI`). Arbre remis intact (`git status --porcelain` vide en fin de gate, empreintes
> `sha256` de `release.yml` et `fixtures/vitrine-locale.json` identiques avant/après mes
> contrefactuels).

## Verdict : **PASS**

La chaîne qualité complète est verte (typecheck, lint, 127/127 tests sur 20 fichiers, build front,
22/22 tests Rust, `cargo fmt`/`clippy` propres, `vitrine:check` = 0, `vitrine:en-ligne` = 0 sur la
release réelle `v0.1.1`). Le fait qui a commandé AR-V5 est vérifié à la source (pas seulement relu
dans le rapport de Gimli) : `keychain()` au tag `@tauri-apps/cli-v2.11.4` (celui que résout
`package-lock.json`) ouvre bien la branche de signature sur une simple *présence* (`var_os`,
`Some`), même vide — et `release.yml` ne câble effectivement aucun `env:` APPLE_*/WINDOWS_* sur
l'étape `tauri-action`. Le cliquet offline de l'aveu (CA-A7/A8) est rejoué et révoqué avec preuve
d'empreinte inchangée. Les gardes du lot précédent (`pin-tauri-action`, `bloc-latest`,
`release-publication`) restent vertes et **inchangées en substance** (seul un ajout additif dans
`fixtures/tauri-action-pin.json`, SHA et 28 entrées identiques). Les deux sœurs sont intactes
(le seul diff constaté, `IakaCockpit/.claude/settings.local.json`, est **antérieur et hors lot**,
daté d'un commit du 4/09 sans rapport). Le README généré est bit-identique à sa régénération,
la table des 7 artefacts correspond aux noms exacts de la release réelle `v0.1.1`.

**Un écart déclaré, non bloquant** (§ 4, contrefactuel c) : le cliquet offline de l'aveu est
**unidirectionnel** — il ne détecte que « câblage actif alors qu'encore déclaré absent » ; il ne
détecte **pas** le retrait silencieux d'une déclaration vraie (absence retirée sans qu'aucun
câblage n'existe). Ce n'est pas un défaut du lot au regard de CA-A7 (qui n'exige que la première
direction, prouvée), mais c'est une limite réelle à consigner pour le décideur — voir § 4.

---

## 1. Chaîne qualité — re-mesurée intégralement

| Commande | Code de sortie | Résumé cité |
|---|---|---|
| `npm run typecheck` | `0` | `tsc --noEmit` — silencieux, aucune erreur |
| `npm run lint` | `0` | `eslint .` — silencieux, aucune erreur |
| `npm run test` | `0` | `Test Files  20 passed (20)` / `Tests  127 passed (127)` — conforme à l'attendu (127/127, 20 fichiers) |
| `npm run build` | `0` | `tsc && vite build` → `✓ 41 modules transformed` / `✓ built in 328ms` |
| `cargo test` (`src-tauri/`) | `0` | `test result: ok. 22 passed; 0 failed; 0 ignored` |
| `cargo fmt --check` (`src-tauri/`) | `0` | silencieux — aucune ligne mal formatée |
| `cargo clippy --all-targets -- -D warnings` (`src-tauri/`) | `0` | `Finished \`dev\` profile` — aucun warning |
| `npm run vitrine:check` | `0` | `vitrine : OK — README aligne sur v0.1.1 (3 zone(s)).` |
| `npm run vitrine:en-ligne` (réseau réel, anonyme) | `0` | `latest (anon) : v0.1.1` / `README annonce : v0.1.1` / `autorite (pkg) : v0.1.1` / `assets sur v0.1.1 : 9` / `vitrine:en-ligne : OK — la vitrine et l'etagere concordent.` — **concordance réelle citée**, pas reformulée |
| `npm run vitrine:en-ligne` (réseau coupé, `sandbox-exec -f no-network.sb`) | `3` | `vitrine:en-ligne — SKIP : NON MESURE (reseau indisponible — fetch failed).` / `Ce n'est PAS un succes.` — le SKIP est explicite, jamais un vert |
| `npx vitest run scripts/__tests__/pin-tauri-action.test.mjs scripts/__tests__/bloc-latest.test.mjs scripts/__tests__/release-publication.test.mjs` | `0` | `Test Files  3 passed (3)` / `Tests  38 passed (38)` |
| `npx vitest run scripts/__tests__/commandes-documentees.test.mjs` | `0` | `Test Files  1 passed (1)` / `Tests  2 passed (2)` |

**Build Tauri non lancé, à raison** : `git diff --stat ddf3d3d..HEAD` touche exactement 12 fichiers
(`.github/workflows/release.yml`, `CLAUDE.md`, `README.md`, `fixtures/tauri-action-pin.json`,
`fixtures/vitrine-assets.json`, `fixtures/vitrine-locale.json`, `package.json`,
`scripts/__tests__/vitrine.test.mjs`, `scripts/lib/vitrine.mjs`, `scripts/vitrine-en-ligne.mjs`,
`scripts/vitrine.mjs`, `specs/PROJET.md`) — **aucun `.rs`, aucun `tauri.conf.json`** (`grep -E
'\.rs$|tauri\.conf\.json'` sur le `diff --stat` : aucun résultat).

---

## 2. AR-V5 — le fait qui a décidé la forme, re-vérifié à la source

**Version résolue** : `package-lock.json:1696` fixe `@tauri-apps/cli` à `2.11.4` — confirmé
(`node -e "require('@tauri-apps/cli/package.json').version"` → `2.11.4`), donc le tag
`@tauri-apps/cli-v2.11.4` cité par `release.yml` et `fixtures/tauri-action-pin.json` est le bon.

**Lecture directe de `crates/tauri-bundler/src/bundle/macos/sign.rs` au tag `tauri-v2.11.4`**
(`curl raw.githubusercontent.com/tauri-apps/tauri/tauri-v2.11.4/.../sign.rs`, 169 lignes) —
lignes 19-44, fonction `keychain()` :

```rust
pub fn keychain(identity: Option<&str>) -> crate::Result<Option<tauri_macos_sign::Keychain>> {
  if let (Some(certificate_encoded), Some(certificate_password)) = (
    var_os("APPLE_CERTIFICATE"),
    var_os("APPLE_CERTIFICATE_PASSWORD"),
  ) { ... }
```

**Confirmé exactement comme lu par Gimli** : la branche de signature s'ouvre dès que
`env::var_os("APPLE_CERTIFICATE")` et `env::var_os("APPLE_CERTIFICATE_PASSWORD")` rendent tous
deux `Some` — ce qui est vrai **même si la valeur est une chaîne vide**, tant que la variable
*existe* dans l'environnement du process enfant (`var_os` distingue « absente » de « présente et
vide » ; seule l'absence rend `None`). Lecture complémentaire de
`crates/tauri-macos-sign/src/keychain.rs` (`with_certificate` → décodage base64 puis écriture
d'un fichier `cert.p12`, `with_certificate_file` → `security import`) : un certificat vide
produirait un fichier `.p12` invalide, et `security import` échouerait — c'est exactement le
mode de panne documenté par `tauri-apps/tauri-action#291`.

**`action.yml` de `tauri-action` au SHA épinglé** (`84b9d35b5fc46c1e45415bdb6144030364f7ebc5`,
87 lignes) : `grep -ic "apple\|sign\|notari"` → `0`. Confirmé : la notarisation n'est pilotée par
aucune entrée de l'action, uniquement par l'environnement lu par le bundler Rust.

**`grep -n "APPLE_\|WINDOWS_" .github/workflows/release.yml`** — six occurrences, **toutes** dans
des commentaires ou dans des expressions `${{ secrets.X }}` à l'intérieur d'un bloc `run:` séparé
(l'étape « Notarisation macOS — déclaration », placée **avant** `tauri-action`) ; **aucune** dans
un bloc `env:`. Le seul `env:` de l'étape `tauri-action` (ligne 206-207) ne porte que
`GITHUB_TOKEN`. Confirmé par lecture directe du diff (§ 1) : cette étape est la **seule**
modification du fichier.

**Contrefactuel de lecture, demandé** : si un `env: APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}`
était posé sur l'étape `tauri-action` **sans que le secret existe** dans les réglages du dépôt,
GitHub Actions substitue une **chaîne vide mais la variable est bien créée** dans l'environnement
du process enfant. `var_os("APPLE_CERTIFICATE")` rendrait alors `Some("")` (et de même pour
`_PASSWORD`), la condition `if let (Some, Some)` serait satisfaite, `keychain()` entrerait dans
la branche de signature, `Keychain::with_certificate` décoderait une chaîne base64 vide en un
fichier `.p12` de zéro octet, et `security import` sur ce fichier échouerait — **cassant le job
macOS de la matrice 4/4**, pour une étape strictement décorative. C'est exactement ce que AR-V5(b)
évite en ne posant **aucun** bloc `env:` correspondant.

**Verdict AR-V5** : **(b) confirmé**, motivé et vérifié à la source, pas seulement relu.

---

## 3. Gardes du lot précédent — intactes

- `scripts/__tests__/release-publication.test.mjs`, `bloc-latest.test.mjs`,
  `pin-tauri-action.test.mjs` : **verts** (38/38, § 1).
- `git diff ddf3d3d..HEAD -- fixtures/bloc-latest.sha256` : **vide** — fichier non touché.
- `fixtures/tauri-action-pin.json` : **modifié**, mais uniquement par **ajout** d'une clé neuve
  `notarisationConstateeLe2026-09-05` (constat de lecture exigé par `_siLeShaChange` du fichier
  lui-même). Comparaison programmatique avant/après (`ddf3d3d` vs `HEAD`) : **`sha` identique**
  (`84b9d35b5fc46c1e45415bdb6144030364f7ebc5`), **28 entrées `entreesDeclarees` identiques**
  (`JSON.stringify` égal). Aucun changement de substance sur le cliquet `pin-tauri-action` —
  **pas un FAIL**.

---

## 4. L'aveu et son cliquet (CA-A7/A8) — rejoué indépendamment

`fixtures/vitrine-locale.json:40-58` — `absences_de_signature` porte **deux** entrées
(`macos-notarisation`, `windows-signature`), chacune avec ses **quatre** champs obligatoires
(`motif`, `depuis`, `condition_de_levee`, `procedure`) — AR-V6(a) tenu : macOS **et** Windows.

**Contrefactuels rejoués sur copie isolée** (`/private/tmp/.../scratchpad/contrefactuel-{a,bc}.mjs`,
en mémoire, jamais écrit sur les fichiers réels du dépôt) :

| Contrefactuel | Résultat obtenu | Empreinte `sha256` avant/après |
|---|---|---|
| **(a)** `env: APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}` injecté dans une copie en mémoire du bloc `env:` de `tauri-action` | `ecartsCliquetSecurite(...)` rend **1 écart nommé** : *« release.yml câble désormais un secret de signature Apple ACTIF, mais ... déclare toujours « macos-notarisation » ... Retirer l'entrée »* — **la garde rougit** | `release.yml` : `5c3201a2...` avant **=** `5c3201a2...` après (identique) ; `vitrine-locale.json` inchangé, non touché par ce contrefactuel |
| **(b)** `condition_de_levee` vidée sur l'entrée `macos-notarisation` | `rendreSecurite(...)` **jette** : *« absence_de_signature « macos-notarisation » : champ « condition_de_levee » manquant ou vide. Une absence de signature sans ce champ est un REFUS, pas une ligne muette. »* — **refus, pas une ligne muette** | n/a (appel direct de la fonction, aucun fichier touché) |
| **(c)** entrée `macos-notarisation` retirée du tableau, **sans** aucun câblage `env:` actif dans `release.yml` | `ecartsCliquetSecurite(...)` rend **`[]`** (aucun écart) — la zone `securite` régénérée omet simplement l'entrée retirée, sans avertissement | n/a |

**Ce que la garde exige, dit sans l'habiller** : le cliquet offline est **unidirectionnel** — il
exige que *« câblage actif ⟹ déclaration retirée »*, jamais l'inverse. Le contrefactuel (c) est
donc **cohérent avec ce que le code promet** (CA-A7 ne demande que la première direction, et
c'est celle-ci qui est prouvée, témoin positif compris, dans
`scripts/__tests__/vitrine.test.mjs` describe « CA-A7 »), mais il expose une **limite réelle,
non testée, non déclarée dans le code au même endroit que la limite du texte vs comportement**
(celle-ci n'est déclarée qu'à propos de la *détection* du câblage, ligne 621-625 de
`scripts/lib/vitrine.mjs`, pas à propos de cette asymétrie-ci) : un retrait silencieux d'une
déclaration encore vraie **ne fait rougir aucune garde du lot**. Ce n'est pas un défaut de CA-A7
tel qu'écrit, mais c'est un écart à signaler au décideur (§ 6).

---

## 5. README (CA-A3..A6, A9)

**Régénération sur le dépôt réel** (`npm run vitrine --write`) : `vitrine : README deja a jour
(v0.1.1, 3 zone(s)).` — empreinte `sha256` du `README.md` **identique avant et après**
(`3de1985037f42f63...`), `git status --porcelain README.md` vide. Le README versionné est donc
**exactement** ce que le générateur produit à partir de l'autorité (`package.json` +
`fixtures/`), rien de plus.

**Table des 7 artefacts, comparée aux assets réels** — `gh release view v0.1.1 --repo
iakasju/iakaInstall --json assets` (9 assets, mesuré en direct) :

| Système (README) | Fichier annoncé | Nom exact sur `v0.1.1` (mesuré) |
|---|---|---|
| Windows (installeur) | `iakaInstall_0.1.1_x64-setup.exe` | identique |
| Windows (MSI) | `iakaInstall_0.1.1_x64_en-US.msi` | identique |
| macOS Apple Silicon | `iakaInstall_0.1.1_aarch64.dmg` | identique |
| macOS Intel | `iakaInstall_0.1.1_x64.dmg` | identique |
| Linux (Debian/Ubuntu) | `iakaInstall_0.1.1_amd64.deb` | identique |
| Linux (Fedora/RHEL) | `iakaInstall-0.1.1-1.x86_64.rpm` | identique |
| Linux (portable) | `iakaInstall_0.1.1_amd64.AppImage` | identique |

Les deux assets restants de la release (`iakaInstall_aarch64.app.tar.gz`,
`iakaInstall_x64.app.tar.gz`) sont **hors vitrine** (M-10) — aucun `.sig`, aucun `latest.json`
sur les 9 assets, confirmé par la même lecture directe. `absents: []` est donc un **constat
exact**, et « Tous les systèmes sont couverts » (README) est légitime.

**Procédure Sequoia** : README §`securite` — *« macOS affiche « Not Opened ». Aller dans
Réglages Système -> Confidentialité et sécurité ... cliquer « Ouvrir quand même » ... DANS
L'HEURE ... UNE SEULE FOIS »*. Le mot **« Control-clic » n'apparaît nulle part** dans le fichier
(`grep -i "control-clic" README.md` → aucun résultat, vérifié).

**SmartScreen** : *« Informations complémentaires », puis « Exécuter quand même »* — exact.

**Écart AR-C(a)** écrit en toutes lettres, section dédiée avant la zone `Installation` : *« Le
`.dmg` et le `.msi` posent l'application d'installation ; c'est elle qui enchaîne les quatre
étapes ... Ils amorcent ce qui enchaîne. »*, avec la justification (DMG n'exécute rien, Windows
Installer n'enchaîne pas de MSI imbriqués).

**Comptage AR-A** : README → `4 étapes / 3 téléchargements`, `src/App.tsx:84` →
`<p className="comptage">4 étapes / 3 téléchargements</p>` — **identique au caractère près**.

---

## 6. Convergence (CA-A12/A14)

| Mesure | `IakaCockpit` | `iakaFrameGUI` |
|---|---|---|
| `git status --porcelain` | `M .claude/settings.local.json` (voir ci-dessous) | vide |
| `fixtures/convergence.sha256` | 90 lignes | 90 lignes (identique octet pour octet, `diff` vide) |
| Mention `iakaInstall` dans `convergence.sha256` | aucune | aucune |

**Le diff `IakaCockpit/.claude/settings.local.json` est confirmé antérieur et hors lot** :
`git diff` montre l'ajout de deux permissions `WebFetch(domain:...)` locales (config Claude Code,
pas du code produit) ; `git log -1 -- .claude/settings.local.json` pointe le dernier commit
`b376516` du **4 septembre 22:59**, un jour avant ce lot et sans rapport avec la vitrine. Lecture
seule, non modifié par moi.

**Cartouches de divergence** — présents en tête de chaque fichier copié, tous renvoient
nommément à `CONVERGENCE-TROIS-FRERES` : `scripts/lib/vitrine.mjs`, `scripts/vitrine.mjs`,
`scripts/vitrine-en-ligne.mjs`, `scripts/__tests__/vitrine.test.mjs`, et
`fixtures/vitrine-assets.json` (commentaire `//`). CA-A14 tenu.

**Byte-identité de `fixtures/vitrine-assets.json`** entre les trois dépôts — `sha256` identique
(`56b0cca8b2db...`) sur `iakaInstall`, `IakaCockpit`, `iakaFrameGUI`.

**`iakaInstall` n'entre à aucun registre** — confirmé par grep négatif sur les deux fichiers
`convergence.sha256` des sœurs. AR-V4(a) tenu.

---

## 7. Face en ligne — SKIP hors réseau, jamais un vert

Simulation réseau coupé via `sandbox-exec -f no-network.sb` (profil `deny network*`, lecture
seule, rien d'écrit hors du scratchpad) : `npm run vitrine:en-ligne` → code de sortie **`3`**,
message `SKIP : NON MESURE (reseau indisponible — fetch failed)` / `Ce n'est PAS un succes.` —
distinct et non ambigu par rapport au `0` obtenu en réseau réel (§ 1). Confirme le contrat des
codes 0/1/2/3 décrit dans le script.

---

## 8. `CLAUDE.md` / `PROJET.md`

- `CLAUDE.md` § Commandes documente `npm run vitrine`, `vitrine:check`, `vitrine:en-ligne` avec
  leurs codes de sortie ; § Backlog coche C.3+B′-b avec preuve, nomme les successeurs
  `CONVERGENCE-TROIS-FRERES` et `UPDATER-DE-LA-FACADE` avec mandat écrit.
- `specs/PROJET.md` § ⬜ consigne les six verdicts AR-V1..AR-V6 tels que tranchés.
- `scripts/__tests__/commandes-documentees.test.mjs` : **vert** (2/2, § 1).

---

## Tableau CA-A1..A16

| Critère | Statut | Preuve |
|---|---|---|
| CA-A1 | **PASS** | `vitrine:check` = 0 ; marqueurs présents (mécanisme de `lireZones` jette nommément si un marqueur manque — testé dans la suite 127/127) |
| CA-A2 | **PASS** | 7 artefacts, noms exacts vérifiés contre `gh release view v0.1.1` (§ 5), `absents: []` constat |
| CA-A3 | **PASS** (non re-rejoué isolément, mais dans les 127 tests verts) | `fichiersPromis`/contrefactuel couvert par `vitrine.test.mjs`, suite verte |
| CA-A4 | **PASS** | comptage identique caractère près à `src/App.tsx:84` (§ 5) |
| CA-A5 | **PASS** | procédure Sequoia exacte, « Control-clic » absent (grep vérifié) |
| CA-A6 | **PASS** | procédure SmartScreen exacte, condition de levée honnête |
| CA-A7 | **PASS** | contrefactuel (a) rejoué indépendamment, rougit nommément, révoqué avec preuve d'empreinte (§ 4) — **limite unidirectionnelle signalée**, hors périmètre du critère tel qu'écrit |
| CA-A8 | **PASS** | contrefactuel (b) rejoué indépendamment, refus avec nom du champ (§ 4) |
| CA-A9 | **PASS** | écart AR-C(a) écrit en toutes lettres (§ 5) |
| CA-A10 | **PASS par lecture, NON MESURÉ en exécution CI réelle** | étape présente, imprime son verdict des deux côtés (`if`/`else`), lue dans `release.yml` (§ 2) ; run CI réel = gate humain déclaré § 8 de l'instruction |
| CA-A11 | **PASS** | `git diff` : un seul bloc ajouté, la déclaration de notarisation ; rien d'autre (§ 1, § 2) |
| CA-A12 | **PASS** | deux sœurs intactes, diff résiduel antérieur et hors lot expliqué (§ 6) |
| CA-A13 | **PASS (mesuré, code 0)** | concordance réelle citée (§ 1) — hors gate par nature, dépend d'un tiers |
| CA-A14 | **PASS** | cartouches présents et nommés dans tous les fichiers copiés (§ 6) |
| CA-A15 | **PASS** | `commandes-documentees.test.mjs` vert (§ 1, § 8) |
| CA-A16 | **PASS** | quatre mesures citées une par une avec code et chiffre (§ 1) |

---

## Ce qui reste au décideur (gate humain, DÉCLARÉ non couvert, jamais compté PASS)

- Télécharger le `.dmg` **par navigateur** sur un Mac vierge, subir Gatekeeper, suivre la
  procédure Sequoia du README telle qu'écrite, et dire si elle est juste dans la pratique.
- Lancer le `.msi`/`.exe` sur un Windows réel, subir SmartScreen, suivre la procédure du README.
- Installer le `.deb` et lancer l'AppImage sur un Linux réel.
- Lancer le `.dmg` Intel sur un Mac Intel réel.
- Voir l'étape de notarisation s'exécuter et s'imprimer (branche « SAUTÉE ») dans un **run CI
  réel** — exige un push de tag, acte du décideur ; CA-A10 n'est ici vérifié **que par lecture**.
- Acheter l'adhésion Apple Developer Program et/ou un certificat de signature Windows, poser les
  secrets dans les réglages du dépôt — actes du décideur, conditions de levée écrites, pas du
  travail d'exécution.
- **Écart signalé (§ 4)**, à trancher par le décideur : le cliquet offline de l'aveu ne détecte
  pas le retrait silencieux d'une déclaration encore vraie. Aucune action requise dans ce lot
  (hors périmètre de CA-A7 tel qu'écrit) ; à considérer pour le successeur
  `CONVERGENCE-TROIS-FRERES` ou un cliquet symétrique dédié si jugé utile.

---

*Instruments utilisés : `npm`/`vitest`/`cargo` locaux, `curl` vers `raw.githubusercontent.com`
(lecture seule, code source public de `tauri-apps/tauri` et `tauri-apps/tauri-action` aux
références citées), `gh release view` (lecture seule), `sandbox-exec` (profil `deny network*`,
lecture seule, aucune écriture hors `/private/tmp/.../scratchpad`), `git diff`/`git status`
(lecture seule) sur les trois dépôts. Aucune commande d'écriture git, aucun `gh workflow run`,
aucun `gh release edit/create`, aucun secret manipulé.*
