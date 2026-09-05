# Rapport qualité — re-gate — `feat/pilotage-reel-contrat-machine` — 2026-09-05

> Gate 🏹 Legolas, indépendant de ⚒️ Gimli (contexte séparé). Ordre de mission
> d'Aragorn : RE-GATE après correctif du FAIL constaté dans
> `docs/qualite/gate-pilotage-reel-contrat-machine.md` (`920a88a`). Tête vérifiée :
> `d5050e6` (3 commits Gimli : `1cdf9c4` fix, `ed8e4ea` garde, `d5050e6` docs). Toutes
> les mesures ci-dessous ont été **rejouées** par moi, aucune n'est reprise du rapport
> de l'implémenteur ou du premier gate. Aucune correction apportée au code : un seul
> fichier écrit par ce gate, celui-ci. Arbre remis dans l'état trouvé
> (`git status --porcelain` vide après chaque mesure destructive).

## Verdict : **PASS**

Le défaut qui motivait le FAIL du 920a88a — `release.yml` ne produisait jamais la
ressource dont `bundle.resources` dépend — est corrigé, et je l'ai **reproduit
moi-même de bout en bout** : ressource absente ⇒ échec identique au gate précédent ;
même arbre, correctif en place ⇒ build réussi, ressource produite par la voie retenue,
`.app` conforme. La voie choisie (`beforeBuildCommand` dans `tauri.conf.json`, pas de
touche à `release.yml`) est **prouvée équivalente en CI** par lecture du code de
`tauri-action` au SHA épinglé, pas seulement supposée. Les 16 CA-P restent verts, aucun
fichier hors des 4 attendus n'a bougé depuis `920a88a`, les trois cliquets
(`pin-tauri-action`, `release-matrice`, `bloc-latest`) sont intacts et verts.

Ce qui reste **déclaré non couvert** (gate humain / premier run CI) est identique à ce
que Gimli déclare déjà dans son commit et dans `CLAUDE.md` — je le confirme sans rien y
ajouter de nouveau, sauf une nuance sur ce qui est *prouvable par lecture* vs *seulement
documenté* (§ CI ci-dessous).

---

## 1. Reproduction de la mesure du FAIL — moi-même, sans rien restaurer avant

```bash
cd ~/work/iakaInstall
mv src-tauri/resources/cli /private/tmp/.../scratchpad/cli-backup-legolas
npm run tauri build -- --target aarch64-apple-darwin
```

**Obtenu** (extrait du log complet) :
```
Info Looking up installed tauri packages to check mismatched versions...
 Running beforeBuildCommand `npm run embarquer && npm run build`

> iakainstall@0.1.0 embarquer
> node scripts/embarquer-cli.mjs

[embarquer-cli] obtention de https://github.com/iakasju/iakaframe/releases/download/v0.40.0/naonedge-iakaframe-0.40.0.tgz (version 0.40.0)
[embarquer-cli] sha256 verifie AVANT extraction : 21fe0f9421cf14af97a273d7f06bb645e980004ae8c53efc028c359716ca1032
[embarquer-cli] ressource extraite dans /Users/sjupin/work/iakaInstall/src-tauri/resources/cli
...
    Compiling iakainstall v0.1.0 (/Users/sjupin/work/iakaInstall/src-tauri)
    Finished `release` profile [optimized] target(s) in 22.81s
    Bundling iakaInstall.app (...)
    Bundling iakaInstall_0.1.0_aarch64.dmg (...)
    Finished 2 bundles at: .../bundle/macos/iakaInstall.app , .../bundle/dmg/iakaInstall_0.1.0_aarch64.dmg
```
Code de sortie : `0`. **Séquence exacte observée** : téléchargement de l'asset épinglé
→ sha256 vérifié **avant** toute extraction → extraction → build front → build Rust →
bundling. C'est la voie retenue (`beforeBuildCommand`) qui a reconstruit la ressource,
**je n'ai rien restauré à la main avant de lancer le build** — contrairement au premier
gate où j'avais dû restaurer manuellement après avoir constaté le FAIL.

**Vérification du `.app` produit** :
```bash
$APP/Contents/Resources/cli/package.json → "version": "0.40.0"
node $APP/Contents/Resources/cli/src/index.js -v → 0.40.0
```
Conforme, comme demandé explicitement.

---

## 2. Contrefactuel de la garde `ressource-avant-build.test.mjs`

```bash
cp src-tauri/tauri.conf.json /scratchpad/tauri.conf.json.bak
shasum -a 256 src-tauri/tauri.conf.json   # 39080eb95c6ba7ee589aa24324bce7c3ca1cc1182b244424093add2214f9290a
# beforeBuildCommand ramené à "npm run build" (mutation JSON)
npx vitest run scripts/__tests__/ressource-avant-build.test.mjs
```
**Obtenu (rouge, nommé)** :
```
FAIL ... beforeBuildCommand appelle `npm run embarquer` ...
  ne contient plus "npm run embarquer" (obtenu : "npm run build")
FAIL ... l'ordre est respecte ...
  "npm run embarquer" absent de beforeBuildCommand ("npm run build")
Tests  2 failed | 1 passed (3)
```
Restauration puis re-mesure :
```bash
cp /scratchpad/tauri.conf.json.bak src-tauri/tauri.conf.json
shasum -a 256 src-tauri/tauri.conf.json   # 39080eb95c6ba7ee589aa24324bce7c3ca1cc1182b244424093add2214f9290a (identique)
npx vitest run scripts/__tests__/ressource-avant-build.test.mjs   # Tests 3 passed (3)
```
Sha256 avant/après identique, `git status --porcelain` vide. Conforme au commit
`ed8e4ea` qui annonçait exactement ce contrefactuel.

---

## 3. CI : `tauri-action` exécute-t-elle `beforeBuildCommand` ?

**Ce n'est pas `tauri-action` qui exécute `beforeBuildCommand`** : l'action, au SHA
épinglé `84b9d35b` (vérifié — `shasum -a 256` de `action.yml` retéléchargé =
`351738c494a482a2e583a0ecc93a0130e42c902fd91d6b938a8099fc3c5e879a`, **identique** au
`actionYmlSha256` de `fixtures/tauri-action-pin.json` : le pin n'a pas bougé), se
contente d'appeler `getRunner()` puis `runner.execTauriCommand(['build'], ...)`
(`src/build.ts:25` et `:53-58`). Lu dans `src/runner.ts:23-46` : avec
`@tauri-apps/cli` en dépendance et **aucun** lockfile yarn/pnpm/bun (confirmé :
`ls yarn.lock pnpm-lock.yaml bun.lockb` → absents, seul `package-lock.json` présent),
le runner choisi est `new Runner('npm', ['run', 'tauri'])` — soit exactement
`npm run tauri build -- --target <arch>`, **la commande identique** à celle que j'ai
lancée en local pour ma reproduction (§ 1). C'est le binaire `@tauri-apps/cli` lui-même
(schema documenté : `node_modules/@tauri-apps/cli/config.schema.json:1930`,
`beforeBuildCommand` = hook standard de build) qui lit `tauri.conf.json` et exécute le
hook — indépendamment de qui l'invoque (poste local ou action CI). **Ce point n'est donc
pas une supposition mais une équivalence de commande prouvée par lecture du code source
de l'action au SHA gardé par le cliquet, croisée avec l'état réel du dépôt (choix du
runtime npm).**

**`npm ci` précède-t-il ?** Oui : `.github/workflows/release.yml:97-98` (`Installer les
dependances` → `npm ci`) est une étape **antérieure** à l'étape `tauri-action`
(`:103`). Nécessaire car `npm run build` (dans `beforeBuildCommand`) invoque `tsc` et
`vite`, tous deux dépendances npm. **Le script `embarquer-cli.mjs` lui-même est Node
pur** : lu en entier, ses seuls imports sont `node:crypto`, `node:fs`, `node:os`,
`node:path`, `node:url`, `node:child_process` — zéro dépendance npm, il n'a donc besoin
que de Node (déjà installé par `actions/setup-node@v4` à l'étape précédente), pas de
`npm ci` pour lui-même — mais `npm ci` a de toute façon déjà tourné avant, dans l'ordre
observé.

**`tar` sur le runner** : `embarquer-cli.mjs:90` appelle `execFileSync("tar", [...])`.
macOS et Linux (`ubuntu-22.04`, `macos-latest`) portent `tar` nativement — non
contestable. **Windows** : Gimli documente (commit `1cdf9c4`, `CLAUDE.md`) que
`bsdtar` est présent nativement depuis Windows 10 build 17063 sur `windows-latest`.
**Je confirme que c'est un fait de notoriété publique bien documenté (tar.exe = bsdtar,
livré par défaut sur les images GitHub-hosted `windows-latest` depuis des années), mais
je ne l'ai PAS exécuté** — aucun accès à un runner Windows depuis ce poste macOS. **Ce
qui est prouvable par lecture** : le code source de `embarquer-cli.mjs` n'a aucune
branche conditionnelle par OS, il appelle `tar` platform-agnostique de la même façon
partout — donc si `tar` est présent, le comportement est identique sur les 4
plateformes. **Ce qui reste gate humain** : la vérification empirique que `tar` répond
bien avec les options `-xzf ... -C ... --strip-components=1` sur `windows-latest` (pas
seulement sa présence), donc le tout premier run CI réel.

---

## 4. Asset public GitHub, pas NAS — contrefactuel sha256 faux

`fixtures/cli-embarque.json.url` = `https://github.com/iakasju/iakaframe/releases/download/v0.40.0/naonedge-iakaframe-0.40.0.tgz`
— domaine `github.com`, release publique, **aucune** référence au NAS/LAN iakabox.
Confirmé par la reproduction § 1 : le téléchargement a réussi **depuis ce poste**, sans
VPN ni accès iakabox — donc accessible depuis n'importe quel runner GitHub Actions
public.

**Contrefactuel sha256 faux, sur une copie de la fixture (jamais le fichier suivi)** :
```
fixture mutee (copie) : sha256 = "000...0" (64 zéros)
node --input-type=module -e "import { embarquer } from './scripts/embarquer-cli.mjs'; ..."
```
**Obtenu** :
```
EXCEPTION ATTENDUE : sha256 divergent — REFUS D'EXTRAIRE.
  attendu : 0000000000000000000000000000000000000000000000000000000000000000
  obtenu  : 21fe0f9421cf14af97a273d7f06bb645e980004ae8c53efc028c359716ca1032
```
`ls $DEST` après coup → `No such file or directory` : **aucune écriture** n'a eu lieu,
la vérification a bien lieu **avant** l'extraction (CA-P13 reconfirmé).

---

## 5. `release.yml` / cliquets — diff vide, gardes vertes

```bash
git diff 920a88a..HEAD -- .github/workflows/release.yml fixtures/tauri-action-pin.json fixtures/bloc-latest.sha256
# → (vide)
git diff --stat 920a88a..HEAD
#  CLAUDE.md                                          | 23 ++++++-
#  scripts/__tests__/ressource-avant-build.test.mjs   | 79 ++++++++++++++++++++++
#  specs/instructions/pilotage-reel-facade-contrat-machine.md | 2 +-
#  src-tauri/tauri.conf.json                          | 2 +-
```
**Exactement** les 4 fichiers annoncés par les 3 commits de Gimli, rien de plus. Gardes
rejouées (`npx vitest run --reporter=verbose`, extraits) :
```
✓ pin-tauri-action.test.mjs > CA-13/CA-14/CA-15/D-4 (10 assertions)
✓ release-matrice.test.mjs > CA-I5/CA-I6 (4 assertions)
✓ bloc-latest.test.mjs > CA-11/CA-12 (9 assertions)
```
Toutes vertes.

---

## 6. Non-régression — chaîne qualité complète

| Commande | Code de sortie | Résumé cité |
|---|---|---|
| `npm run typecheck` | `0` | `tsc --noEmit` — aucune sortie |
| `npm run lint` | `0` | `eslint .` — aucune sortie |
| `npm run test` | `0` | `Test Files 17 passed (17)` · `Tests 70 passed (70)` (67 + 3 nouveaux de `ed8e4ea` — conforme) |
| `cargo test` (`src-tauri/`) | `0` | `test result: ok. 22 passed; 0 failed` (attendu 22/22 — conforme) |
| `cargo fmt --check` | `0` | aucune sortie |
| `cargo clippy --all-targets -- -D warnings` | `0` | `Finished \`dev\` profile` — 0 warning |
| `npm run tauri build -- --target aarch64-apple-darwin` | `0` | `Finished 2 bundles` — `.app` + `.dmg`, ressource reconstruite par `beforeBuildCommand` |
| `npm run rejeu:vivant` | `0` | `[rejeu-vivant] OK : 74 lignes, 0 non-JSON, termine par "fin"` |

**Diff des fichiers des 16 critères CA-P non concernés par ce correctif** : vérifié
ci-dessus (§ 5) — seuls `CLAUDE.md`, `ressource-avant-build.test.mjs`,
`pilotage-reel-facade-contrat-machine.md` § 4 et `tauri.conf.json` (une ligne) ont
bougé. Aucun fichier source des CA-P1 à CA-P16 (`vocabulaire.ts`, `reducteur.ts`,
`pilote.rs`, `EcranPilotage.tsx`, `embarquer-cli.mjs`, `fixtures/vocabulaire-interdit.json`,
etc.) n'a changé depuis `920a88a` — les 16 verdicts du premier gate restent donc
valables tels quels, je ne les ré-instruis pas un par un ici (aucun changement à juger).

---

## 7. `.gitignore` — ressource jamais versionnée

```bash
grep -n "resources/cli" .gitignore
# 16:src-tauri/resources/cli/
git ls-files | grep -i "resources/cli"
# (vide)
```
Conforme.

---

## Ce qui reste au décideur (gate humain, non prouvable par ce gate)

1. **Le premier run CI réel, quatre plateformes** — la correction est prouvée par
   reproduction locale + équivalence de commande démontrée par lecture du code de
   `tauri-action`, mais **aucun run GitHub Actions n'a été déclenché** par ce gate (hors
   périmètre, aucun push ni workflow lancé).
2. **`tar` sur `windows-latest`** — présence documentée et de notoriété publique, **non
   exécutée** depuis ce poste macOS : reste à confirmer par le premier run CI lui-même.
3. **La recette guidée sur les trois OS** (macOS, Windows, Linux) avec écriture réelle,
   feu vert par étape, lue et comprise par un humain (R-M4) — inchangé depuis le
   premier gate.
4. **Le comportement du Gatekeeper / la notarisation** (C.3) — inchangé.
5. **La visibilité du dépôt** (AR-I4) — inchangé, toujours ⬜ ouvert.

---

## Ce que je n'ai PAS mesuré, déclaré

- Les builds Linux / Windows / macOS Intel de la matrice (accessibles seulement en CI).
- L'exécution empirique de `tar`/`bsdtar` sur un runner Windows réel.
- Le comportement à plus de ~20 000 lignes de `log-delegue` (M-X5) — hors périmètre de
  ce re-gate, déjà signalé au premier gate.

## Verdict et suite

**PASS.** Le point bloquant unique du premier gate est corrigé, reproduit par moi de
façon indépendante, et la voie choisie est prouvée équivalente en CI (pas seulement
supposée). Aucune régression sur les 16 CA-P ni sur les trois cliquets de `release.yml`.
Ce jalon ouvre l'étape suivante (stage), la bascule restant conditionnée au feu vert
humain (⛴️ Charon). Le premier run CI réel, quatre plateformes, reste le seul jalon qui
ne peut être franchi que par son exécution effective — non couvert par un gate agent,
comme documenté ci-dessus.
