# Gate P2 — ressource CLI 0.41.0 (AR-P5a) + bump façade 0.1.2

Branche : `chore/ressource-cli-0.41.0` (7 commits sur `main` @ `d511e53` :
`fff6e70`, `6063016`, `088c7df`, `1a59c84`, `2e3c428`, `0cbe147`, `05d9278`)
Date : 2026-09-06 — reprise après 3 blocages du harnais (aucun défaut de code trouvé,
aucun rapport écrit)
Vérificateur : Legolas (contexte séparé, ne corrige pas, ne pousse pas, aucun tag posé)
Base : `specs/instructions/pilotage-reel-facade-contrat-machine.md` (CA-P1, P2, P9, P13,
P15), `facade-installeur-tauri-ossature-release.md` (CA-I9, CA-I10)

## Verdict : PASS (avec 2 écarts non bloquants, à porter à la connaissance du décideur)

Toutes les mesures de qualité exécutables (typecheck, lint, 129/129 tests JS/TS, build,
22/22 tests Rust, `cargo fmt`/`clippy` sans warning, vitrine hors-ligne, sha256 de la
ressource re-mesuré par retéléchargement réel, cinq contrefactuels rejoués) sont vertes.
Aucun test rouge masqué, aucun seuil baissé. Deux écarts de **traçabilité documentaire**
sont relevés (mesures 8a et 10c/10d) — ils ne font rougir aucune garde existante et ne
bloquent pas ce lot, mais méritent d'être connus avant le tag `v0.1.2`.

### Écarts relevés

1. **(mesure 8a, mineur)** Le diff de `fixtures/flux-apercu.ndjson` entre `d511e53` et
   `HEAD` n'est **pas strictement « limité aux versions »** comme l'annonçait la mission :
   4 des 74 lignes changent aussi de méthode d'enregistrement (`embarqueDir`/
   `installMjsPath`/`Kits`/`Kit` pointent vers un chemin d'extraction scratch en v0.40.0,
   vers `src-tauri/resources/cli` directement en v0.41.0). Aucun test n'assert ces chemins
   (`rejeu-flux-apercu.test.mjs` reste vert) : impact fonctionnel nul, mais l'affirmation
   « seuls les numéros de version changent » de `docs/releases/v0.1.2.md:54-57` et du
   `.tagmsg` est **imprécise**.
2. **(mesure 10c/10d, à signaler avant tag)** Les runs de banc cités par la mission comme
   devant être référencés (`33997947501`, `33999564308`, workflow `banc-etapes-3-4` du
   dépôt **sœur** `iakaframe`) sont **absents de toute la documentation d'`iakaInstall`**
   (`docs/releases/v0.1.2.md`, `.tagmsg`, `CLAUDE.md`, `specs/PROJET.md`). Mesurés en
   lecture seule via `gh` : le premier run est **rouge** (rollback Windows NSIS — la
   désinstallation d'IakaCockpit ET d'iakaFrameGUI laisse une sous-clé de registre
   résiduelle), le second (commit suivant) est **vert**. **Point rassurant confirmé
   (mesure 10f)** : le tag `v0.41.0` embarqué par ce lot pointe un commit **postérieur**
   aux deux runs et **inclut** le commit du correctif (`ahead_by:8, behind_by:0` depuis le
   commit du run vert) — la ressource intégrée ici porte donc le correctif, pas la
   régression. Mais cette vérification n'était **tracée nulle part** avant ce gate : sans
   elle, rien ne garantissait que le tag v0.41.0 embarqué n'était pas celui du run rouge.

### Reproduction des écarts

- Écart 1 : `git diff d511e53..HEAD -- fixtures/flux-apercu.ndjson` puis normaliser
  `"ts":"..."` et `0.40.0`/`0.41.0`, comparer — 4 lignes diffèrent hors version.
- Écart 2 : `gh run view 33997947501 --repo iakasju/iakaframe --log-failed` (rouge) ;
  `gh run view 33999564308 --repo iakasju/iakaframe` (vert) ; `grep -rn "33997947501"
  /Users/sjupin/work/iakaInstall` (aucune occurrence).

### Ce qui reste au décideur

- Le tag `v0.1.2` — **premier run réel de la politique brouillon** côté `iakaInstall`
  (`releaseDraft: true` + job `publier` gate humain, cf. `CLAUDE.md` § backlog
  `RELEASE-PARTIELLE-PUBLIEE`).
- La **recette réelle** sur les trois OS (UAC non-admin Windows, SmartScreen, Gatekeeper/
  notarisation macOS) — déclarée non couverte par Gimli, non rejouée ici (hors mandat
  Legolas, gate humain).
- Décider si les deux écarts ci-dessus méritent une correction de `docs/releases/v0.1.2.md`
  / `.tagmsg` avant le tag (reformuler « seuls les numéros de version changent » ; ajouter
  la référence aux runs de banc `iakaframe` et la confirmation 10f) — **Legolas ne corrige
  pas**, retour à Gimli si cette correction est requise avant tag.

## Mesures
| # | Commande | Code de sortie | Résumé cité |
|---|---|---|---|
| 1a | `npm run typecheck` | `0` | `> iakainstall@0.1.2 typecheck` / `> tsc --noEmit` (aucune erreur affichée) |
| 1b | `npm run lint` | `0` | `> iakainstall@0.1.2 lint` / `> eslint .` (0 erreur/warning) |
| 1c | `npm test` (vitest run) | `0` | `Test Files  20 passed (20)` / `Tests  129 passed (129)` (attendu 129/129 : conforme) |
| 1d | `npm run build` | `0` | `✓ 41 modules transformed.` / `✓ built in 331ms` |
| 1e | `cargo test` (src-tauri) | `0` | `test result: ok. 22 passed; 0 failed` (attendu 22 : conforme) |
| 1f | `cargo fmt --check` (src-tauri) | `0` | sortie vide (aucun fichier mal formaté) |
| 1g | `cargo clippy --all-targets -- -D warnings` (src-tauri) | `0` | `Finished \`dev\` profile [unoptimized + debuginfo] target(s) in 0.54s` (0 warning) |
| 1h | `npm run vitrine:check` | `0` | `vitrine : OK — README aligne sur v0.1.2 (3 zone(s)).` |
| 1i | `npm run vitrine:en-ligne` | `1` | `2 ecart(s)` — `E-2 : le README annonce v0.1.2, GitHub presente v0.1.1` (dette de publication, hors gate) ; `E-3 : la release v0.1.2 ... N'EXISTE PAS` (tag pas encore poussé — attendu, décideur non déclenché) |
| 2a | Fixture `fixtures/cli-embarque.json` | — | version `0.41.0`, url asset GitHub v0.41.0, sha256 `d8799b7d6ac32cb7d336def415588c1f739d78d8cce56336c42253615b2594f7` (64 hex) — conforme à la mission |
| 2b | `curl` retéléchargement asset v0.41.0 + `shasum -a 256` (scratch) | `0` | `HTTP:200 SIZE:697967` ; sha256 `d8799b7d6ac32cb7d336def415588c1f739d78d8cce56336c42253615b2594f7` — identique à la fixture |
| 2c | Contrefactuel sha256 muté (copie fixture, `dest` scratch, via `embarquer()`) | refus (exception) | `sha256 divergent — REFUS D'EXTRAIRE.` — `dest-contrefactuel/` reste vide après tentative (aucune écriture avant vérification, CA-P13 confirmé) |
| 3a | `npm run vocabulaire` puis `git diff --exit-code src/events/vocabulaire.ts` | `0` / `0` | `genere depuis .../evenements.js (version 0.41.0)` ; diff vide (0 = CA-P1 confirmé) |
| 3b | Comparaison manuelle EVENEMENTS/ETATS_ETAPE/CANAUX_FEU_VERT (vocabulaire.ts vs evenements.js) | — | listes identiques mot pour mot dans les deux fichiers |
| 4a | Lecture comparée `src/coverage.ts` vs `cleManifestePlateforme` (`app-bundle.js`) | — | Même table : darwin arm64/x64 couverts sans condition d'archi, linux x64 et windows x64 couverts, linux/arm64 et windows/arm64 refusés (retour `null` côté CLI, `false` côté façade) — aucune divergence relevée (R3) |
| 4b | `src/__tests__/ecran-annonce.test.tsx` (déjà inclus dans les 129) | `0` (dans 1c) | `"Windows x64 est desormais couvert, plus de refus a priori"` (texte `/sont couvertes\./`, absence de `REFUSEES`) ; `"Windows arm64 ... l'ecran porte le refus"` (texte `/REFUSEES/`) ; `"Linux x64 ... couvert"` |
| 4c | `src/__tests__/couverture-post-flux.test.tsx` (déjà inclus dans les 129) | `0` (dans 1c) | pré-flux windows/arm64 → `/REFUSEES : seuls macOS, Linux x64 et Windows x64/` ; post-flux (etape-terminee) prime sur l'indice déclaratif |
| 4d | `scripts/__tests__/vocabulaire-moteur.test.mjs` — garde vocabulaire source+rendu (déjà inclus dans les 129) | `0` (dans 1c) | `13 motifs`, aucune violation hors couverture déclarée |
| 5a | Lecture `VERSION_RESSOURCE` (vocabulaire.ts) vs `src-tauri/resources/cli/package.json` | — | `"0.41.0"` des deux côtés — identique |
| 5b | `scripts/__tests__/egalite-version.test.mjs` (déjà inclus dans les 129) | `0` (dans 1c) | `ressource.version === fixture.version` et `VERSION_RESSOURCE === fixture.version === ressource.version` — verts |
| 5c | Contrefactuel version ressource mutée (`9.9.9`, copie hors dépôt sous scratch) + assertion Node équivalente à la garde | échec attendu | `Expected values to be strictly equal: '9.9.9' !== '0.41.0'` — rouge confirmé |
| 6a | Lecture croisée versions (`package.json`, `package-lock.json`, `tauri.conf.json`, `Cargo.toml`, `Cargo.lock`) | — | `0.1.2` dans les cinq fichiers — cohérent |
| 6b | `git tag -l "v0.1.2"` | `0` | sortie vide — aucun tag posé (conforme, décideur non déclenché) |
| 6c | README régénéré (voir 1h `vitrine:check`) | `0` | `vitrine : OK — README aligne sur v0.1.2` — README déjà identique au régénéré, aucun diff |
| 7a | Lecture commit `2e3c428` (`fixtures/vitrine-locale.json`) | — | motif reformulé sans nom de fichier versionné entre backticks ; mesure historique (codesign/spctl v0.1.1) conservée |
| 7b | Contrefactuel : restauration en mémoire de l'ancien motif (`iakaInstall_0.1.1_aarch64.dmg` entre backticks) via `rendreVitrine`/`ecrireZones`/`fichiersPromis` (script hors dépôt, `scripts/lib/vitrine.mjs` importé en lecture seule) | rouge attendu | `Fichiers promis non derives de la table : [ 'iakaInstall_0.1.1_aarch64.dmg' ]` — confirme que `vitrine.test.mjs` (CA-10) rougirait sur l'ancien texte au bump 0.1.2 |
| 7c | Lecture motif actuel `fixtures/vitrine-locale.json` (`macos-notarisation`) | — | cite toujours `codesign -dv --verbose=4`, `Signature=adhoc`, `TeamIdentifier=not set`, `spctl -a -vv` rejeté — mesure historique préservée sans nom de fichier versionné |
| 8a | `git diff d511e53..HEAD -- fixtures/flux-apercu.ndjson` (74 lignes chacune) normalisé timestamp+version | — | **ÉCART relevé** : 4 lignes (sur 74) diffèrent au-delà de la version — `embarqueDir`/`installMjsPath`/`Kits`/`Kit` pointent en v0.40.0 vers un chemin d'extraction scratch (`.../scratchpad/release/extrait/package[...]`) et en v0.41.0 directement vers `src-tauri/resources/cli[...]` (la ressource embarquée réelle). Ce n'est PAS « limité aux versions » comme annoncé dans l'instruction — c'est un changement de méthode d'enregistrement du rejeu (source réservoir différente), sans impact fonctionnel mesuré (aucun test n'assert ce chemin, cf. 8b) mais à signaler tel quel. |
| 8b | `rejeu-flux-apercu.test.mjs` (déjà inclus dans les 129) | `0` (dans 1c) | vert ; n'assert aucun chemin absolu d'`embarqueDir`/`Kits`/`Kit` (grep vide) — l'écart 8a ne le fait pas rougir |
| 8c | `IAKAINSTALL_SANDBOX=<scratch> npm run rejeu:vivant` | `0` | `[rejeu-vivant] OK : 74 lignes, 0 non-JSON, termine par "fin"` |
| 9a | Gardes précédentes (toute la suite npm test, cargo test — 1c/1e) | `0` | déjà mesuré : 129/129 + 22/22 verts, incluant toutes les gardes de vocabulaire/version/vitrine/rejeu |
| 9b | `git diff --exit-code d511e53..HEAD -- .github/workflows/release.yml` | `0` | aucun diff — fichier inchangé depuis `d511e53` |
| 9c | `git diff --exit-code d511e53..HEAD -- fixtures/bloc-latest.sha256` | `0` | aucun diff — fichier inchangé depuis `d511e53` |
| 10a | Lecture `docs/releases/v0.1.2.md` + `.tagmsg` | — | Notes exactes et cohérentes avec le code mesuré (preuve chiffrée reprise correctement : 129/129, 22/22, sha256, octets) ; gates humains listés (UAC non-admin, SmartScreen, Gatekeeper/notarisation, recette 3 OS) |
| 10b | `Contents/Resources/cli/package.json` + `_bundled/VERSION` du bundle `.app` présent sous `src-tauri/target/aarch64-apple-darwin/release/bundle/macos/iakaInstall.app` | — | `"version": "0.41.0"` et `v0.41.0` — mesuré directement (bundle présent, pas seulement déclaré par Gimli) |
| 10c | Recherche `33997947501`/`33999564308` dans tout le dépôt (`grep -rn`) | — | **ABSENTS partout** (v0.1.2.md, .tagmsg, CLAUDE.md, PROJET.md, etat-des-lieux) — non cités comme l'attendait la mission |
| 10d | `gh run view 33997947501/33999564308 --repo iakasju/iakaframe` | — | Les deux runs existent dans le dépôt **sœur** `iakaframe` (workflow `banc-etapes-3-4`, `workflow_dispatch`, 2026-09-05) : le run `33997947501` (job windows) **ROUGE** — 2 mesures en échec, rollback réel du désinstalleur Windows NSIS pour IakaCockpit ET iakaFrameGUI laisse une sous-clé de registre résiduelle (`sousClesRestantes=1` au lieu de 0 attendu) ; le run `33999564308` (commit suivant, `3baf20e`) est **VERT**, correctif confirmé côté `iakaframe`. |
| 10e | `git diff --exit-code d511e53..HEAD -- CLAUDE.md specs/PROJET.md` (présence de section AR-P5a) | — | CLAUDE.md et PROJET.md sont à jour sur le lot (backlog + § Exécution AR-P5(a)) ; ne citent pas non plus les runs 10c/10d |
| 10f | `gh api repos/iakasju/iakaframe/git/refs/tags/v0.41.0` + `gh api .../commits/v0.41.0` + `gh api .../compare/3baf20e...52f5f22` | — | tag `v0.41.0` = commit `52f5f22` (2026-09-06T00:33:02Z, **postérieur** aux deux runs) ; comparaison `3baf20e→52f5f22` : `ahead_by:8, behind_by:0` — le commit du correctif (run vert `33999564308`) **est bien un ancêtre** du tag v0.41.0. La ressource embarquée dans ce lot **contient le correctif**, pas la régression. |
