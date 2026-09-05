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
- [ ] **C.3** — première release réelle, `.dmg` + `.msi`, les 5 autres artefacts.
- [ ] **B′-b** — vitrine, manifeste updater, canaux, convergence à trois frères
      (mesurable seulement après une release réelle).
- [ ] `SIDECAR-CLI-AUTONOME` — successeur AR-I2(c), si servir des postes sans Node
      devient une exigence.
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
