# CLAUDE.md — Instructions pour Claude Code

> Ce fichier est lu en priorité par Claude Code à chaque session.
> Pour la vision complète du projet, lire `specs/PROJET.md`.
> Pour la méthode de collaboration, voir `methode-de-travail.md` (iakaframe).

---

## Rôles (rappel)

- **Cowork** (réflexion) rédige les instructions dans `specs/instructions/`. Il ne
  modifie jamais le code.
- **Claude Code** (toi) lis l'instruction correspondante AVANT chaque tâche, puis
  implémentes, builds, testes et commites.

---

## Ce qu'est ce projet

`iakaInstall` — l'application d'installation de la suite iaka : une **façade** Tauri
au-dessus du moteur du CLI `@naonedge/iakaframe` (verbe `install`), jamais une seconde
implémentation de sa logique (AR-3). Le lot C.2-a + B′-a a livré la **coquille**
(annonce, prérequis, couverture). Le lot **C.2-b** (celui-ci) branche le **pilotage
réel** sur le contrat machine du CLI (`--events --feu-vert stdin`, CLI `0.40.0`) : un
pont natif Rust (`src-tauri/src/pilote.rs`) spawn le processus, un réducteur pur
(`src/events/reducteur.ts`) transforme le flux NDJSON en modèle de vue, l'écran
(`src/components/EcranPilotage.tsx`) rend aperçu → feux verts par étape → journal →
rollback → fin. Le texte « cette application n'installe rien encore » a disparu : il a
cessé d'être vrai.

Stack : **React 18.3 + TypeScript 5.5 + Vite 6** (front, `src/`) · **Tauri 2 / Rust**
(backend, `src-tauri/`) — répliquée de `IakaCockpit`/`iakaFrameGUI` (M-R7). App id
`com.iakateam.iakainstall`. **Une seule charte** (`studio-clair`, AR-I3), tokens
synchronisés depuis `iakagraph/theme/studio/clair/`, aucun sélecteur.

Architecture front (D7, calque des sœurs) : `src/api/backend.ts` = **unique point
d'`invoke`/`listen`** vers Rust — `demarrerInstallation`, `repondreFeuVert`,
`interrompreInstallation` + abonnement aux évènements du pont natif (C.2-b).

---

## Commandes à utiliser

```bash
npm install                  # installer les deps front
npm run embarquer            # AR-P2(b) : telecharge + verifie (sha256) + extrait le CLI embarque
                              #   dans src-tauri/resources/cli/ (gitignore)
                              #   AUTOMATIQUE avant `npm run tauri build` (voir plus bas) ;
                              #   a lancer A LA MAIN avant `npm run tauri dev` (beforeDevCommand
                              #   ne l'appelle pas).
                              #   Logique dans scripts/lib/embarquer.mjs (module pur, teste sans
                              #   reseau) ; scripts/embarquer-cli.mjs est le SEUL point d'entree,
                              #   appelle embarquer() inconditionnellement (plus de garde
                              #   d'entree — correction post-gate FAIL Windows, v0.1.0, voir
                              #   backlog).
npm run vocabulaire          # regenere src/events/vocabulaire.ts depuis la ressource embarquee
npm run dev                  # front Vite seul (port 3040)
npm run tauri dev            # app desktop Tauri en dev (GUI) — exige IAKAINSTALL_SANDBOX (AR-P4)
                              #   et `npm run embarquer` prealable (beforeDevCommand ne l'appelle pas)
npm run build                # build front (tsc + vite)
npm run tauri build          # bundle desktop (.app + .dmg sur ce poste, macOS arm64)
                              #   beforeBuildCommand = "npm run embarquer && npm run build" :
                              #   la ressource CLI est produite AUTOMATIQUEMENT avant chaque
                              #   build, en local comme en CI (tauri-action invoque le meme
                              #   beforeBuildCommand) — UNE SEULE commande, une seule verite.
                              #   Correction post-gate FAIL du 2026-09-05 : le premier run CI
                              #   (release.yml, matrice 4 plateformes) echouait "resource path
                              #   `resources/cli` doesn't exist" faute de cette etape. release.yml
                              #   lui-meme n'a pas ete touche (aucun risque sur les cliquets
                              #   pin-tauri-action / release-matrice / bloc-latest).
npm run typecheck            # tsc --noEmit
npm run lint                 # ESLint
npm run test                 # vitest (front + scripts/)
npm run rejeu:vivant         # CA-P4 (2e jambe) : rejoue un apercu reel, HORS npm test (reseau)
npm run chartes              # re-synchronise la charte depuis iakagraph/theme/studio/clair/

# --- Vitrine (C.3 + B'-b, 2026-09-05) -------------------------------------------------------------
# La section "Installation" du README est GENEREE entre marqueurs
# (`<!-- vitrine:debut:<zone> -->`) depuis fixtures/vitrine-assets.json (table des 7 plateformes,
# copiee byte-identique des soeurs IakaCockpit/iakaFrameGUI) et fixtures/vitrine-locale.json
# (depot, absents, absences_de_signature). Convention CONVERGENCE-TROIS-FRERES : voir Backlog.
npm run vitrine               # reecrit les zones du README depuis l'autorite (package.json + fixtures)
npm run vitrine:check         # compare sans ecrire (code 1 si derive) — c'est la garde du gate
npm run vitrine:en-ligne      # FACE EN LIGNE, HORS GATE : anonyme, sans jeton, vue d'un visiteur
# Codes de vitrine:en-ligne : 0 concorde · 1 ecart(s) · 3 NON MESURE (pas de reseau, jamais un vert).

# Côté Rust (depuis src-tauri/) :
cargo test
cargo fmt --check
cargo clippy --all-targets -- -D warnings
```

### Bac à sable obligatoire (AR-P4)

En mode développement (`npm run tauri dev`, et **tout** test) la chaîne réelle refuse de
se lancer sans `IAKAINSTALL_SANDBOX=<répertoire>` (hors de `$HOME/.claude` et
`$HOME/Applications`) : le pont force alors `--target-claude`/`--apps-dir`/
`--backup-dir` sur ce répertoire. Le run réel non isolé (sans la variable) reste le
**produit** — c'est le geste réservé au **gate humain** (recette sur poste réel).

### La ressource CLI embarquée — un lot, pas un geste (AR-P5)

`fixtures/cli-embarque.json` épingle `version` + `url` + `sha256` de l'asset de release
GitHub du CLI. **Monter cette version est un lot** (nouvelle mesure du `sha256`, rejeu du
test de rejeu CA-P4, une ligne au journal) — jamais un simple changement de nombre.

<!-- Si un Makefile/scripts existent, exiger de passer par eux plutôt que les
     commandes brutes (docker compose, cargo, etc.). -->

---

## Conventions

- **Langue du code** : anglais (identifiants, commits techniques).
- **Langue de la doc et des échanges** : français.
- **Commits** : *conventional commits* (`feat:`, `fix:`, `docs:`, `chore:`, `wip:`).
- **Commits atomiques et fréquents** : après chaque étape logique (filet de
  sécurité pour pouvoir revenir en arrière). Jamais de `reset --hard` ni de
  `push --force` de ton côté.
- **MVP d'abord, puis itérer.** Pas de sur-ingénierie.
- **Self-hosted / open-source d'abord** pour tout choix de backend ; cloud en
  fallback justifié seulement.
- **Réutiliser l'existant** (infra, services, MCP) avant de réimplémenter.
- En dev, **mocker les appels API** coûteux/limités (voir `specs/mock/`).
- **Isolation Docker : non applicable** — application de bureau, aucun service, aucun
  port hôte exposé (seul le serveur de dev Vite tient le port **3040**, distinct de
  3020/IakaCockpit et 3030/iakaFrameGUI).

---

## Dépôt git : Forgejo (NAS) + miroir GitHub

Remote `origin` = **Forgejo NAS** `http://192.168.1.139:3001/sjupin/iakaInstall.git`,
**HTTP + token** (jeton lisible dans `.git/config` **local**, jamais commité). Remote
`github` = `https://github.com/iakasju/iakaInstall.git` (miroir de partage). Voir
`iakabox-usage.html` (iakaframe) pour la procédure générale (clone/push, création de
dépôt via API, description **ASCII**, rotation de token).

**Visibilité actuelle non mesurée dans ce lot** (AR-I4) : le passage public est un acte
du décideur, précédé d'un balayage de secrets (CA-I13) — jamais un agent.

## Cycle de documentation (état des lieux)

Régénérer l'état des lieux **à chaque changement de version** et **à chaque pause /
préparation de reprise** :

```bash
iakaframe snapshot --reason version --version vX.Y.Z --note "..."
iakaframe snapshot --reason pause   --note "où on s'arrête, quoi reprendre"
iakaframe snapshot --reason reprise --note "reprise"
```

Génère `specs/etat-des-lieux.md` + `.html` (faits git auto). **Compléter le récit de
reprise** dans le `.md` (ce qui vient d'être fait, ce qui reste, prochaine étape).

---

## Avant toute tâche non triviale

1. Lire l'instruction correspondante dans `specs/instructions/`.
2. Si elle n'existe pas → le signaler ; ne pas improviser une feature lourde sans
   spec. Proposer un plan court d'abord.
3. Implémenter étape par étape, avec commits intermédiaires.
4. Lancer typecheck + lint + tests avant de considérer la tâche finie.
5. Pour toute action vraiment destructive hors denylist : **demander confirmation
   par message texte avant d'agir.**

---

## Backlog

- [x] **C.2-a + B′-a** — coquille Tauri + charte `studio-clair` + écran d'annonce +
      ossature de release (matrice 4 plateformes, `tauri-action` épinglée au SHA)
      → `specs/instructions/facade-installeur-tauri-ossature-release.md`
      *(implémenté côté ⚒️ Gimli — REMIS AU GATE 🏹 Legolas, non auto-validé.)*
- [x] **C.2-b** — le pilotage réel de la chaîne (feux verts par étape, provenance,
      retour arrière) sur le contrat machine du CLI `0.40.0`
      → `specs/instructions/pilotage-reel-facade-contrat-machine.md`
      *(implémenté côté ⚒️ Gimli — REMIS AU GATE 🏹 Legolas, non auto-validé. Gate humain
      restant, DÉCLARÉ non couvert : le run réel avec écriture, sur les trois OS.)*
      **Correction post-gate FAIL (2026-09-05)** : `beforeBuildCommand` produit désormais la
      ressource CLI avant tout build (voir « Commandes » ci-dessus) — reproduit sur ce poste
      (build échoue sans le correctif, réussit avec). **Non couvert, DÉCLARÉ gate humain /
      premier run CI** : le comportement de `tar` (extraction du tarball par
      `scripts/embarquer-cli.mjs`) sur `windows-latest` — présent depuis Windows 10 build
      17063 (`bsdtar`), non exécuté sur ce poste macOS, donc non prouvé ici. Les builds
      Linux / Windows / macOS Intel de la matrice restent, comme avant, prouvables en CI
      seulement.
- [x] **Correctif post-premier-run-réel (2026-09-05)** — le tag `v0.1.0` a bien tourné en CI
      (run `33963420727`) : `prepare` + les trois builds macOS/Linux OK, mais **`build windows`
      a rougi** — `resources\cli` absent. Cause réelle, distincte de la précédente : la garde
      d'entrée de `scripts/embarquer-cli.mjs`
      (`import.meta.url === \`file://${process.argv[1]}\``) est **toujours fausse sur Windows**
      (URL encodée à slashs vs chemin natif à antislashs), **toujours vraie par accident sur
      POSIX** — le script se terminait en ~0,4 s, code 0, **sans rien faire ni rien écrire**
      (garde muette). La release `v0.1.0` a néanmoins été **publiée non-brouillon** avec 7
      assets (ni `.msi` ni `.exe`) — voir `RELEASE-PARTIELLE-PUBLIEE` ci-dessous.
      *Correctif (⚒️ Gimli, branche `fix/embarquer-cli-windows`, REMIS AU GATE 🏹 Legolas, non
      auto-validé) : garde supprimée (pas réparée) ; logique déplacée dans
      `scripts/lib/embarquer.mjs` (jamais auto-exécuté) ; `scripts/embarquer-cli.mjs` appelle
      `embarquer()` inconditionnellement et rougit désormais explicitement si
      `dest/package.json` est absent ou porte la mauvaise version. Journal complet imprimé
      (version, url, sha256, destination, nombre d'entrées extraites). Rejeu réel sur ce poste :
      ressource supprimée puis `npm run tauri build -- --target aarch64-apple-darwin` →
      ressource reproduite et embarquée dans le `.app`. Non couvert, DÉCLARÉ gate humain : le
      comportement réel de `bsdtar` sur `windows-latest` (chemins à antislashs/lettre de
      lecteur) — code rendu défensif (`path.join`, pas de concaténation), non exécuté sur ce
      poste macOS. Bump `0.1.0` → `0.1.1` (le tag `v0.1.0` reste immuable et pointe le code
      fautif) ; aucun tag posé par cet agent.*
- [x] `RELEASE-PARTIELLE-PUBLIEE` — **décidé et livré** (2026-09-05, ⚒️ Gimli, branche
      `feat/release-brouillon-jusqua-matrice-verte`, REMIS AU GATE 🏹 Legolas, non auto-validé) :
      **AR-1 → (a)** `releaseDraft: true` dans l'étape `tauri-action` du job `build`, job neuf
      **`publier`** en `needs: [build]` **strict** (sans `if:`) inséré **avant** le bloc
      `latest:`, `latest` passe en `needs: publier` (`if: always()` conservé). **AR-2 → (b)** —
      lecture au SHA épinglé de `tauri-action` confirmée : `releaseId` court-circuite
      **entièrement** la recherche/création (`src/index.ts:178`), attache directement les
      artefacts (`src/index.ts:211`) → le brouillon est créé **une seule fois** dans `prepare`,
      son `release_id` passé à la matrice ; la course F8 (`tauri-apps/tauri-action#914`) est
      fermée **par construction**, pas seulement gérée au job `publier` (qui reste le filet de
      secours nommé sur zéro/deux brouillons trouvés pour un même tag). **AR-3 → (a)** un
      brouillon laissé par une matrice rouge **reste**, daté, **jamais supprimé** par l'agent.
      **AR-5 → (a) bornée** : entrée `casser` du `workflow_dispatch` (`aucune` par défaut, ou
      une clé de plateforme), **inerte hors `workflow_dispatch`** (garde statique dessus),
      étape de sabotage placée **avant** `tauri-action`. **AR-6 → (a)** garde par lecture du
      **texte** du workflow (`scripts/lib/release-publication.mjs` +
      `scripts/__tests__/release-publication.test.mjs`, témoin positif + contrefactuels
      nommés, limite déclarée dans le fichier de garde).
      **Règle écrite (CA-R du lot)** : *une release d'`iakaInstall` n'existe publiquement
      (non-brouillon) et n'est désignée `releases/latest` qu'à la **dernière plateforme
      construite** — un seul job de la matrice en échec suffit à ce que rien ne devienne
      visible.* Ce que ce lot **ne garantit pas** : qu'une release publiée soit **complète**
      en contenu (un build vert mais vide passerait la règle) — successeur nommé
      `PUBLICATION-VERIFIE-LES-ASSETS` ci-dessous. Ce qu'il **n'empêche pas** : le vol du
      `latest` par une release créée **à la main** hors de ce workflow — sa portée s'arrête à
      **ce** workflow.
      **Procédure du run de preuve, réservée au décideur (CA-R8, non couvert par construction)** :
      `gh workflow run release.yml --repo iakasju/iakaInstall -f tag=<tag-de-test> -f casser=windows`
      (ou `linux` / `macos-x64` / `macos-arm64`) sur un tag de test, **jamais sur un tag réel** ;
      vérifier ensuite que la release du tag reste `isDraft: true`
      (`gh release view <tag> --json isDraft`), que `releases/latest` **n'a pas bougé**
      (`gh api repos/iakasju/iakaInstall/releases/latest --jq .tag_name`), et que le job
      `publier` apparaît `skipped` dans le run. Le brouillon de preuve, s'il reste, n'est
      supprimé **que par le décideur** (acte de release, refusé aux agents). **Gate humain
      déclaré, non compté couvert** : seul ce run réel prouve CA-R8 ; de même pour un run 4/4
      vert nominal (CA-R9, `isDraft: false`, 9 assets, `latest` = le tag publié).
      **Successeurs demandés nommément à 🟠 Aragorn / au décideur** (CA-R11, canal d'écriture de
      cet agent borné à ce dépôt) : `RELEASE-BROUILLON-JUSQUA-MATRICE-VERTE-COCKPIT`
      (`IakaCockpit`) et `…-GUI` (`iakaFrameGUI`) — mesure des runs passés faite en lecture
      seule le 2026-09-05 (aucun run 4/4 systématique, au moins un job de build rouge par sœur
      dans l'historique récent ; état de complétude des releases publiées à ce moment-là **non
      mesurable rétroactivement**, déclaré tel) ; transposition **si et seulement si** un
      cadrage dédié confirme que la faiblesse a mordu ou peut mordre chez elles.
- [x] **C.3 + B′-b — la vitrine à trois frères** (2026-09-05, ⚒️ Gimli, branche
      `feat/vitrine-trois-freres`, **REMIS AU GATE 🏹 Legolas, non auto-validé**). Cadré par
      🔵 Gandalf, 6 arbitrages **TRANCHÉS** par Stéphane le 2026-09-05 :
      → `specs/instructions/amorcage-c3-vitrine-trois-freres.md`.
      **C.3 clos** : la release réelle (`v0.1.1`, run `33965353603`, 4/4, 9 assets) était déjà
      faite ; ce qui en restait (notarisation déclarée, écart AR-C(a) écrit) est la matière de
      B′-b — les deux étaient un seul geste (**AR-V1 → (a)**).
      **Livré** : `README.md` **écrit de zéro** (n'existait pas, M-1) avec ses zones `binaires` /
      `securite` / `sources` générées, le comptage AR-A repris au mot près de `src/App.tsx:84`,
      et l'écart AR-C(a) écrit en toutes lettres pour l'utilisateur (« ils amorcent ce qui
      enchaîne ») ; `fixtures/vitrine-assets.json` copié **byte-identique** des sœurs (vérifié
      par empreinte) ; `fixtures/vitrine-locale.json` avec la clé **neuve**
      `absences_de_signature` (**AR-V2 → (a)**) — deux entrées (notarisation macOS, signature
      Windows), chacune avec motif **mesuré sur l'asset réel** (`codesign`/`spctl` sur le `.dmg`
      arm64 téléchargé : `Signature=adhoc`, `TeamIdentifier=not set`, `spctl` rejette), date,
      condition de levée honnête et procédure exacte (Sequoia : Réglages Système →
      Confidentialité et sécurité → Ouvrir quand même, dans l'heure — **jamais** « Control-clic » ;
      SmartScreen : Informations complémentaires → Exécuter quand même) ; `rendreSecurite()` +
      zone `securite` ajoutées à la copie locale de `scripts/lib/vitrine.mjs`, avec cartouche de
      divergence en tête et **cliquet offline** (`ecartsCliquetSecurite`/
      `detecterCablageSignatureActif`) qui rougit si `release.yml` câble un jour un `env:`
      APPLE_*/WINDOWS_* actif — **contrefactuel joué et révoqué** (empreinte `sha256`
      identique). Trois scripts npm (`vitrine`, `vitrine:check`, `vitrine:en-ligne`) exposés et
      documentés ci-dessus. Étape CI de notarisation dans `release.yml`
      (**AR-V5 → (b)**, motivé § 0.3 ci-dessous) : elle **imprime son verdict**, ne câble
      **aucun** `env:` APPLE_* sur `tauri-action` (mesuré : ce câblage, même vide, casserait le
      build — `tauri-apps/tauri-action#291`), et lit la présence des secrets par expression
      GitHub Actions (`${{ secrets.X }}`, substitution textuelle, aucune variable
      d'environnement créée). `iakaInstall` **n'entre PAS** au registre de convergence des sœurs
      (**AR-V4 → (a)** — successeur `CONVERGENCE-TROIS-FRERES` ci-dessous) ; `IakaCockpit` et
      `iakaFrameGUI` **intacts** (`fixtures/convergence.sha256` toujours à 90 lignes de part et
      d'autre, `git diff` vide sur ce fichier des deux côtés).
      **Preuve mesurée** — `npm run typecheck` `0` ; `npm run lint` `0` ; `npm run test` `0`,
      **`127 passed (127)`** (avant : 91 — **+36 tests, aucun supprimé**) ; `cargo test` `0`,
      `22 passed` (**aucun `.rs` ni `tauri.conf.json` modifié par ce lot : pas de build Tauri à
      rejouer**) ; `npm run vitrine:check` → `0` ; `npm run vitrine:en-ligne` sur `v0.1.1` → **`0`**
      (concordance réelle, code cité, jamais un `3` présenté comme un succès).
      **Non couvert, DÉCLARÉ gate humain** (§ 8 de l'instruction) : téléchargement du `.dmg` par
      navigateur sur un Mac vierge (Gatekeeper + procédure Sequoia telle qu'écrite) ; `.msi` sur
      Windows réel (SmartScreen) ; `.deb`/AppImage sur Linux réel ; `.dmg` Intel sur Mac Intel ;
      voir l'étape de notarisation s'exécuter dans un run CI réel (exige un tag, acte du
      décideur) ; poser les secrets Apple/Windows (acte du décideur).
      **Successeurs nommés** (backlog, non traités par ce lot) : voir `CONVERGENCE-TROIS-FRERES`
      et `UPDATER-DE-LA-FACADE` ci-dessous.
- [ ] `CONVERGENCE-TROIS-FRERES` — successeur nommé d'**AR-V4 → (a)** (lot vitrine, 2026-09-05),
      **à jouer dans les DEUX SŒURS** (`IakaCockpit`, `iakaFrameGUI`), pas ici : canal d'écriture
      de ⚒️ Gimli borné à ce dépôt (CA-R11). Mandat en trois points, écrit pour qu'il ne se perde
      pas : (i) rendre la résolution du frère **N-aire ou autoritaire** dans
      `scripts/test-convergence.mjs` des deux sœurs, en fermant le hors-couverture *« sans
      `IAKA_CONVERGENCE_HOME`, on retient le premier voisin qui porte le registre »* (angle mort
      qu'un 3ᵉ porteur réaliserait sans rien dire, M-14) ; (ii) **remonter `rendreSecurite()`**
      chez les deux sœurs, qui ont la **même** absence de notarisation/signature non déclarée
      (M-15, mesuré : `iakaFrameGUI/fixtures/vitrine-locale.json` porte `"absents": []` avec
      *« AUCUN absent déclaré »*, rien sur la signature) ; (iii) alors seulement inscrire
      `iakaInstall` au registre de convergence et relever le cliquet. Ordre de grandeur **≈ 0,75 j**.
- [ ] `UPDATER-DE-LA-FACADE` — successeur nommé d'**AR-V3 → (a)** (lot vitrine, 2026-09-05).
      La façade n'a **ni `pubkey`, ni `endpoints`, ni `createUpdaterArtifacts`** — Tauri v2 est
      catégorique : la signature de la charge de l'updater *« cannot be disabled »*, ce qui
      suppose de **générer une paire de clés minisign et poser deux secrets dans les réglages du
      dépôt** — acte du décideur, refusé aux agents. **Condition d'entrée** : le décideur pose la
      paire minisign **ET** une seconde version de la façade est publiée (sinon la question reste
      hypothétique — un installeur figé se met à jour en le retéléchargeant, ce que la vitrine
      livre déjà). Emporte avec lui `fixtures/canaux-publication.json` (aucun consommateur sans
      chaîne de publication). Ordre de grandeur **≈ 1 j**.
- [ ] `SIDECAR-CLI-AUTONOME` — successeur AR-I2(c), si servir des postes sans Node
      devient une exigence.
- [x] **AR-P5(a) — remontée CLI 0.40.0 → 0.41.0 + release v0.1.2** (2026-09-06, ⚒️ Gimli,
      branche `chore/ressource-cli-0.41.0`, **REMIS AU GATE 🏹 Legolas, non auto-validé**).
      La sœur `iakaframe` a publié `v0.41.0` (étapes 3/4 ouvertes à Linux/AppImage et
      Windows/`.exe` NSIS, en plus de macOS). `fixtures/cli-embarque.json` remonté (asset
      `naonedge-iakaframe-0.41.0.tgz`, 697 967 octets, sha256
      `d8799b7d6ac32cb7d336def415588c1f739d78d8cce56336c42253615b2594f7`, re-mesuré) ;
      vocabulaire régénéré, **inchangé** entre les deux versions (AR-W8) ; `src/coverage.ts`
      (indice pré-flux) corrigé — il affirmait encore « seule macOS couverte », faux depuis
      `cleManifestePlateforme` (CLI 0.41.0) qui couvre aussi linux/x64 et windows/x64 ;
      façade bumpée `0.1.1` → `0.1.2` (package.json, package-lock.json, tauri.conf.json,
      Cargo.toml, Cargo.lock), README régénéré (`npm run vitrine -- --write`). **Correctif
      incidentel** : la note de sécurité (`fixtures/vitrine-locale.json`) citait un nom de
      fichier versionné en dur, lu comme une fausse promesse par la garde CA-10 au bump —
      reformulée sans nom de fichier versionné, la mesure historique reste dite.
      `fixtures/flux-apercu.ndjson` ré-enregistrée (rejeu réel en bac à sable) : 7 des 74
      lignes changent (3 seulement de version ; 4 aussi de chemin, `--root` pointant
      désormais la ressource embarquée en place plutôt qu'une extraction scratch — pas un
      changement de comportement du CLI, aucun test n'assure la valeur de ces chemins). Le
      reste du flux (étapes 3/4, `darwin-arm64`) est structurellement identique. Preuve de la
      couverture Linux/Windows côté moteur re-vérifiée en lecture seule : runs de banc
      `33997947501` (rollback NSIS rouge, avant correctif) et `33999564308` (vert, après) ;
      `v0.41.0` postérieur aux deux et incluant le correctif
      (`gh api .../compare/<sha run 2>...v0.41.0` → `ahead_by:8, behind_by:0`). Chaîne
      qualité complète verte, y compris `npm run tauri build -- --target aarch64-apple-darwin`
      lancé depuis un arbre **sans** ressource CLI préalable (`beforeBuildCommand` l'a
      reproduite en 0.41.0, vérifié dans le `.app`). Détail + commande de tag :
      `docs/releases/v0.1.2.md` + `.tagmsg`. Non couvert, DÉCLARÉ gate humain : UAC sur
      compte Windows non-administrateur, SmartScreen, Gatekeeper/notarisation macOS, recette
      réelle de l'installeur unifié sur les trois OS.
- [x] **Correctif post-PREMIER-RUN-RÉEL de `RELEASE-PARTIELLE-PUBLIEE` (2026-09-06, ⚒️ Gimli,
      branche `fix/publier-gh-api-jq`, REMIS AU GATE 🏹 Legolas, non auto-validé)**. Le tag
      `v0.1.2` a tourné en CI (run `34026373514`) : `prepare` OK (brouillon créé par id), les 4
      builds VERTS, 9 assets déposés sur le brouillon — puis l'étape « Publier le brouillon (par
      id, jamais par tag) » du job `publier` a **rougi** :
      `gh: accepts 1 arg(s), received 4`. Cause : `gh api "repos/$DEPOT/releases" --paginate
      --jq --arg tag "$TAG" '[...]'` — `gh api` **n'a pas** d'option `--arg` (c'est une option de
      `jq`) ; `--jq` a avalé `--arg` comme sa valeur, et les trois tokens restants (`tag`, la
      valeur de `$TAG`, le filtre) sont devenus des arguments positionnels en trop pour `gh api`
      (qui n'en accepte qu'un, l'endpoint) : 1 + 3 = 4. **Résultat côté politique** : la release
      est restée en **brouillon**, `latest` = `v0.1.1` inchangé, le job `latest` (`if: always()`,
      filtre `select(.draft|not)`) a rendu **success sans rien avancer** — **la moitié fail-safe
      de la politique est PROUVÉE** (aucune release incomplète n'est devenue visible) ; **la
      moitié publication a rougi sur une erreur de syntaxe**, corrigée par ce lot. La publication
      manuelle du brouillon `v0.1.2` par le décideur, une fois le correctif validé, est le **repli
      (c)** prévu au cadrage de `RELEASE-PARTIELLE-PUBLIEE` (acte de release réservé au décideur)
      — **attendu une fois**, pas un geste à reproduire à chaque tag.
      **Pourquoi la garde statique ne pouvait pas le voir** : `scripts/lib/release-publication.mjs`
      / `scripts/__tests__/release-publication.test.mjs` lisent le **texte** du workflow, jamais
      son **comportement** — limite écrite dans son propre fichier (CA-R6). C'était exactement le
      trou déclaré non couvert (CA-R8/CA-R9) : seul un run réel prouve le comportement.
      **Livré** : (i) `test(ci)` d'abord — `scripts/__tests__/release-publier-shell.test.mjs`,
      jambe **EXÉCUTION** nouvelle : extrait par marqueur le script shell de chaque étape
      concernée (`publier`/`prepare`/`latest`) depuis le texte réel de `release.yml`, l'exécute en
      `bash` avec un **faux `gh`** en tête de `PATH` (reproduit la même règle d'arité que le vrai
      `gh api` — un seul argument positionnel) et le **vrai `jq`** du poste (SKIP explicite si
      absent) ; aucun réseau, aucun jeton. État rouge volontaire capturé au commit `test(ci)` :
      5/6, le cas nominal `publier` reproduisait fidèlement `accepts 1 arg(s), received 4` contre
      le texte encore bogué. (ii) `fix(ci)` — `release.yml`, étape `publier` : `gh api --paginate`
      rend désormais le JSON **brut** (plus de `--jq` sur cette commande), filtré en aval par un
      `jq --arg tag "$TAG" '...'` séparé — **`jq` reste le seul à recevoir `--arg`** (option
      préférable du cadrage). Relu tout le fichier : aucune autre occurrence de
      `gh api ... --jq --arg` (`prepare`/`latest` utilisaient déjà `--jq` sans `--arg`). Garde
      statique renforcée : assertion `CA-R10` (« aucun `gh api ... --jq --arg` dans le fichier »)
      + contrefactuel qui réintroduit le motif sur une copie et vérifie qu'il est détecté.
      `fixtures/bloc-latest.sha256` **non touché** (le bloc `latest:` n'est pas modifié par ce
      correctif) — `git diff` vide dessus, vérifié. **Preuve mesurée** : `npm run typecheck` `0` ;
      `npm run lint` `0` ; `npm run test` `0`, **137 passed** (avant : 127 — +10, aucun supprimé) ;
      `npm run build` `0` ; `cargo test` `0`, 22 passed (aucun `.rs` touché). **Non couvert,
      DÉCLARÉ successeur** : re-jouer la politique **complète** au **prochain tag** — c'est le
      seul geste qui prouvera, en conditions réelles, que le job `publier` publie désormais sans
      intervention manuelle (le run `34026373514` avait prouvé le fail-safe mais pas la
      publication ; ce lot corrige le texte mais n'a **pas** de second run réel pour le prouver
      à son tour — hors périmètre de cet agent, acte de release réservé au décideur).
- [ ] `RESSOURCE-CLI-RAFRAICHIE-EN-LIGNE` — successeur AR-P5(b), si la façade vieillit
      plus vite que son moteur (besoin non mesuré, pas encore une seule release).
- [ ] `MARQUE-IAKAINSTALL` — icône/identité propre à `iakaInstall` (aujourd'hui
      dérivée du logo NaonEdge), travail 🎨 Loki.
- [ ] `INSTALL-I18N` — fr/en (MVP = FR seul aujourd'hui).
- [ ] `ETAPES-3-4-WINDOWS-LINUX` — côté CLI, si une recette réelle sur ces machines
      ouvre l'entrée (R-I2).
- [ ] `TAURI-ACTION-V1-POUR-LES-TROIS` — monter `tauri-action` en `action-v1.0.0`,
      à jouer sur les trois dépôts à la fois ou sur aucun.
- [ ] `CONVERGENCE-RELEASE-YML-ALIGNEMENT` — aligner les `release.yml` d'IakaCockpit
      et iakaFrameGUI (déjà divergents entre eux, M-R6), avant d'y inscrire ce 3ᵉ dépôt.
- [ ] `PUBLICATION-VERIFIE-LES-ASSETS` — successeur nommé au lot `RELEASE-PARTIELLE-PUBLIEE`
      (2026-09-05) : ce lot ferme le trou « **build rouge → release publiée** », **pas** le
      trou voisin « **build vert et vide → release publiée** » (un job de matrice qui réussit
      sans rien produire — cas déjà vécu avec la garde muette de `embarquer-cli.mjs` avant son
      correctif — passerait la règle du lot). Nécessite une table d'artefacts attendus
      (`fixtures/vitrine-assets.json`, convention des sœurs) que ce dépôt n'a pas encore
      (vitrine = B′-b).
