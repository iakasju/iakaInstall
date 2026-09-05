# Rapport qualité — `fix/embarquer-cli-windows` — 2026-09-05

> Gate 🏹 Legolas, indépendant de ⚒️ Gimli (contexte séparé). Ordre de mission
> d'Aragorn : gate du correctif après le premier run CI réel (`v0.1.0`, run
> `33963420727`, job `build windows` en échec). Tête vérifiée : `95c8d5e` (3 commits
> Gimli au-dessus de `main`@`69d76a1` : `9a766bf` fix, `41b11bc` bump 0.1.1, `95c8d5e`
> docs). Toutes les mesures ci-dessous ont été **rejouées par moi**, aucune n'est
> reprise du rapport de l'implémenteur. Aucune correction apportée au code : un seul
> fichier écrit par ce gate, celui-ci. Contrefactuels (b)/(c)/(3) menés dans une copie
> isolée sous le bac à sable (`/private/tmp/.../scratchpad/legolas-cf`, supprimée après
> usage) — **jamais** dans le dépôt réel ; sha256 de `scripts/embarquer-cli.mjs` vérifié
> identique avant/après (`1e22921de28cf20144de31001b4e98f8b3bcdf2560945f04243f0770ea5d1083`).
> Arbre remis dans l'état trouvé (`git status --short` vide en clôture ; ressource
> `src-tauri/resources/cli/` et `dist/`/`target/` régénérées par le rejeu réel, mais
> **gitignorées** — aucune trace côté suivi de source).

## Verdict : **PASS**

Le défaut mesuré au run réel (garde d'entrée `import.meta.url === file://argv[1]`
toujours fausse sur Windows, script muet, exit 0, ressource absente) est bien
**supprimé, pas réparé** : la logique vit désormais dans `scripts/lib/embarquer.mjs`
(module pur, jamais auto-exécuté), et `scripts/embarquer-cli.mjs` appelle `embarquer()`
inconditionnellement puis pose une garde de sortie qui rend le silence structurellement
impossible (`dest/package.json` doit exister ET porter la version attendue, sinon exit 1
avec message explicite). J'ai **reproduit moi-même** le rejeu réel (suppression de la
ressource puis `npm run tauri build -- --target aarch64-apple-darwin`) et **cassé
moi-même** la garde par 3 voies indépendantes (tar introuvable, version divergente,
entrée désactivée) : dans les trois cas le script/test rougit et nomme le défaut, jamais
un exit 0 silencieux. Un seul écart mineur, non bloquant, documenté ci-dessous
(§ Écarts, point a).

## Mesures

| Commande | Code de sortie | Résumé cité |
|---|---|---|
| `npm run typecheck` | `0` | `tsc --noEmit` — aucune sortie, aucune erreur |
| `npm run lint` | `0` | `eslint .` — aucune sortie, aucune erreur |
| `npm run test` | `0` | `Test Files  18 passed (18)` / `Tests  75 passed (75)` — conforme à l'attendu (75/75, 18 fichiers) |
| `npm run build` | `0` | `✓ built in 351ms` (tsc + vite build) |
| `cargo test` (dans `src-tauri/`) | `0` | `test result: ok. 22 passed; 0 failed; 0 ignored` — conforme à l'attendu (22/22) |
| `cargo fmt --check` | `0` | aucune sortie (rien à reformater) |
| `cargo clippy --all-targets -- -D warnings` | `0` | `Finished \`dev\` profile [unoptimized + debuginfo] target(s) in 0.45s` — 0 warning |
| `rm -rf src-tauri/resources/cli && npm run tauri build -- --target aarch64-apple-darwin` | `0` | journal complet imprimé : `fixture : .../fixtures/cli-embarque.json` / `destination visee : .../src-tauri/resources/cli` / `version attendue : 0.40.0` / `url : https://github.com/iakasju/iakaframe/releases/download/v0.40.0/naonedge-iakaframe-0.40.0.tgz` / `sha256 verifie AVANT extraction : 21fe0f9421cf...` / `entrees extraites : 552` / `OK — .../package.json conforme (version 0.40.0)` ; puis `Finished 2 bundles` |
| lecture `Contents/Resources/cli/package.json` du `.app` produit | `0` | `version: 0.40.0` — ressource reproduite dans le bundle |
| `grep -n "import.meta.url" scripts/embarquer-cli.mjs` | `0` (1 hit) | 1 occurrence, ligne 11, **dans un commentaire** documentant l'historique du bug — écart mineur, voir § Écarts (a) |
| `git grep -n "embarquer-cli.mjs" scripts/__tests__ src` | `0` | seules occurrences dans `scripts/__tests__/embarquer-cli-entree.test.mjs` (chemin `SCRIPT` passé à `spawn`, jamais un `import`) — aucune trace dans `src` |
| contrefactuel (b) — `PATH=""` (tar introuvable), sous-processus réel via serveur HTTP local | `1` | stdout : journal jusqu'au sha256 vérifié ; stderr : `[embarquer-cli] ERREUR : spawnSync tar ENOENT` |
| contrefactuel (c) — tarball servi porte `package.json` version `9.9.9`, fixture épingle `1.2.3` | `1` | stdout : `entrees extraites : 1` ; stderr : `GARDE embarquer-cli : .../dest/package.json porte la version "9.9.9", attendu "1.2.3" (fixture ...)` |
| contrefactuel (3) — copie isolée, `main()` ré-enveloppé dans `if (false) { ... }` (entrée cassée), rejeu du scénario « vert » du test d'entrée | `0` (le script cassé rend 0) | sortie totale = 0 octet, `dest/package.json` absent → les deux assertions du test réel (`sortie non vide`, `existsSync(.../package.json) === true`) échoueraient explicitement — preuve que le test n'est pas vacueux |
| `npm run rejeu:vivant` | `0` | `[rejeu-vivant] OK : 74 lignes, 0 non-JSON, termine par "fin"` |
| `git diff 69d76a1 -- .github/workflows/release.yml` | `0` | diff vide — `release.yml` inchangé |
| `git tag -l` | `0` | `v0.1.0` seul — aucun tag `v0.1.1` posé |
| `gh api repos/iakasju/iakaInstall/releases/tags/v0.1.0` | `0` | `{"draft":false,"prerelease":true,"tag_name":"v0.1.0"}` |
| `gh api repos/iakasju/iakaInstall/releases/latest` | `1` | `{"message":"Not Found",...,"status":"404"}` |

## Cohérence du bump 0.1.1

Vérifié par lecture directe (pas de reprise) :

| Fichier | Version lue |
|---|---|
| `package.json` | `0.1.1` |
| `package-lock.json` (racine + `packages[""]`) | `0.1.1` / `0.1.1` |
| `src-tauri/tauri.conf.json` | `0.1.1` |
| `src-tauri/Cargo.toml` | `0.1.1` |
| `src-tauri/Cargo.lock` (paquet `iakainstall`) | `0.1.1` |

Les 5 valeurs coïncident. Gardes `nom-produit.test.mjs` (`productName === "iakaInstall"`)
et `egalite-version.test.mjs` (2 assertions, fixture/ressource/`VERSION_RESSOURCE`
coïncident) vertes dans les 75/75.

## Ce qui est prouvable par lecture vs ce qui reste gate humain (Windows)

**Prouvé par lecture, sur ce poste macOS** :
- `scripts/lib/embarquer.mjs` construit tous ses chemins via `path.join`/`resolve`
  (jamais de concaténation de chaînes) — vérifié par grep exhaustif.
- `execFileSync("tar", [...])` est appelé **sans** `{ shell: true }` (grep sur tout
  `scripts/` et `src-tauri/src/` : aucune occurrence de `shell: true`/`shell:true`) —
  les chemins à antislashs (`D:\...`) sont donc transmis tels quels à l'exécutable, sans
  interprétation shell qui les casserait.
- Les flags `-xzf ... -C ... --strip-components=1` sont ceux d'un tar GNU-compatible ;
  `bsdtar` (livré par défaut sur `windows-latest` depuis Windows 10 build 17063) les
  accepte selon la documentation citée par Gimli — **déclaré, pas exécuté ici**.

**Non prouvé ici, DÉCLARÉ gate humain** (ni ce gate ni le correctif ne peuvent le
couvrir sur un poste macOS) : le comportement réel de `bsdtar` sur `windows-latest`
face à des chemins à antislashs/lettre de lecteur en conditions réelles CI. Seul un
run CI Windows réel (prochain tag) tranche.

## Écarts

### (a) `grep -n "import.meta.url" scripts/embarquer-cli.mjs` n'est pas vide

- **Attendu** (ordre de mission) : grep vide.
- **Obtenu** : 1 occurrence, ligne 11, **dans un commentaire** de l'en-tête qui documente
  l'historique du bug (`* une garde \`if (import.meta.url === ...)\` pour ne`).
- **Analyse** : ce n'est pas une régression de la garde muette — c'est un texte de
  documentation, jamais évalué par le moteur JS. La preuve fonctionnelle que la garde
  n'existe plus est portée par une assertion plus précise dans
  `scripts/__tests__/embarquer-cli-entree.test.mjs` (regex sur le motif de comparaison
  réel, `/import\.meta\.url\s*===\s*\`file:\/\//`), verte dans les 75/75, et confirmée
  par ma propre lecture du fichier (aucun `if` conditionnant l'appel à `main()`).
- **Verdict sur ce point** : non bloquant — signalé pour traçabilité, ne renverse pas le
  verdict global.

### (b) Documentation du successeur `RELEASE-PARTIELLE-PUBLIEE` — état partiellement obsolète

`CLAUDE.md` et `specs/PROJET.md` consignent correctement le fait initial (R8 réalisé :
`v0.1.0` publiée non-brouillon avec la matrice incomplète, `releases/latest` avancé
dessus) mais **ne mentionnent pas encore** la mitigation déjà appliquée par le décideur
(via Aragorn) : `v0.1.0` est désormais marquée `prerelease: true` (`draft: false`),
confirmé par `gh api repos/iakasju/iakaInstall/releases/tags/v0.1.0`, et
`releases/latest` répond bien `404` en conséquence (`gh api
repos/iakasju/iakaInstall/releases/latest`). Écart de fraîcheur documentaire, pas de
code — signalé, non corrigé par moi.

## Reproduction des contrefactuels (b) / (c) / (3)

Menés dans une copie isolée du dossier `scripts/` + `fixtures/` sous
`/private/tmp/claude-501/-Users-sjupin-work/491bc970-2cd2-4bfd-8669-ae053380e4f6/scratchpad/legolas-cf`
(supprimée après usage) :

- **(b)** serveur HTTP local servant un vrai tarball construit à la volée, `PATH=""` au
  sous-processus → `spawnSync tar ENOENT`, exit 1, `dest` créé mais extraction refusée.
- **(c)** même serveur, tarball dont le `package.json` embarqué porte `9.9.9` alors que
  la fixture épingle `1.2.3` → extraction réussie (1 entrée) puis garde finale : exit 1,
  message nommant les deux versions.
- **(3)** copie de `scripts/embarquer-cli.mjs` avec `main().catch(...)` ré-enveloppé
  dans `if (false) { ... }` (entrée désactivée, reproduisant la forme du bug d'origine :
  script qui se termine sans rien faire) → exit 0, sortie de 0 octet, `dest/package.json`
  absent. Rejoué contre le scénario « vert » du test réel : les deux assertions
  (`sortie.trim().length > 0`, `existsSync(dest/package.json) === true`) auraient échoué
  — la couverture n'est pas vacueuse.

Le dépôt réel n'a jamais été modifié pendant ces trois contrefactuels ; sha256 de
`scripts/embarquer-cli.mjs` identique avant/après.

## Ce qui reste au décideur

- **Tag `v0.1.1`** → déclenchement du run réel 4 plateformes (seul juge du comportement
  `bsdtar` sur `windows-latest`, non prouvable sur ce poste).
- **Recette 3 OS** (Windows/Linux/macOS) sur le produit réel une fois le tag joué.
- **Cadrage `RELEASE-PARTIELLE-PUBLIEE`** : trancher entre release en brouillon tant que
  la matrice n'est pas complète, ou `needs` strict sur le job `latest` — non traité ici
  (hors périmètre du correctif), et la documentation du statut déjà appliqué
  (`prerelease: true` sur `v0.1.0`) reste à rafraîchir dans `CLAUDE.md`/`specs/PROJET.md`
  (§ Écarts, point b).

## Jalon

Récepteur : **stage** (le gate dev→stage est automatique, tests verts). Le tag `v0.1.1`
et le run CI 4 plateformes restent un geste du décideur, hors gate.
