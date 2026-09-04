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
implémentation de sa logique (AR-3). Ce lot (C.2-a + B′-a) livre la **coquille** : elle
s'ouvre, annonce les 4 étapes / 3 téléchargements, affiche la couverture réelle et les
prérequis détectés — et **dit qu'elle n'installe rien encore** (AR-I1(b)). Le pilotage
réel de la chaîne est C.2-b, après un prérequis côté CLI.

Stack : **React 18.3 + TypeScript 5.5 + Vite 6** (front, `src/`) · **Tauri 2 / Rust**
(backend, `src-tauri/`) — répliquée de `IakaCockpit`/`iakaFrameGUI` (M-R7). App id
`com.iakateam.iakainstall`. **Une seule charte** (`studio-clair`, AR-I3), tokens
synchronisés depuis `iakagraph/theme/studio/clair/`, aucun sélecteur.

Architecture front (D7, calque des sœurs) : `src/api/backend.ts` = **unique point
d'`invoke`** vers Rust — zéro commande métier pour l'instant (couture pour C.2-b).

---

## Commandes à utiliser

```bash
npm install                  # installer les deps front
npm run dev                  # front Vite seul (port 3040)
npm run tauri dev            # app desktop Tauri en dev (GUI)
npm run build                # build front (tsc + vite)
npm run tauri build          # bundle desktop (.app sur ce poste, macOS arm64)
npm run typecheck            # tsc --noEmit
npm run lint                 # ESLint
npm run test                 # vitest (front + scripts/)
npm run chartes              # re-synchronise la charte depuis iakagraph/theme/studio/clair/

# Côté Rust (depuis src-tauri/) :
cargo test
cargo fmt --check
cargo clippy --all-targets -- -D warnings
```

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
- [ ] **C.2-b** — le pilotage réel de la chaîne (feux verts par étape, provenance,
      retour arrière), après le prérequis côté CLI `CONTRAT-MACHINE-DU-VERBE-INSTALL`
      (dépôt `iakaframe`, cadré séparément, AR-I1(b)).
- [ ] **C.3** — première release réelle, `.dmg` + `.msi`, les 5 autres artefacts.
- [ ] **B′-b** — vitrine, manifeste updater, canaux, convergence à trois frères
      (mesurable seulement après une release réelle).
- [ ] `SIDECAR-CLI-AUTONOME` — successeur AR-I2(c), si servir des postes sans Node
      devient une exigence.
- [ ] `MARQUE-IAKAINSTALL` — icône/identité propre à `iakaInstall` (aujourd'hui
      dérivée du logo NaonEdge), travail 🎨 Loki.
- [ ] `INSTALL-I18N` — fr/en (MVP = FR seul aujourd'hui).
- [ ] `ETAPES-3-4-WINDOWS-LINUX` — côté CLI, si une recette réelle sur ces machines
      ouvre l'entrée (R-I2).
- [ ] `TAURI-ACTION-V1-POUR-LES-TROIS` — monter `tauri-action` en `action-v1.0.0`,
      à jouer sur les trois dépôts à la fois ou sur aucun.
- [ ] `CONVERGENCE-RELEASE-YML-ALIGNEMENT` — aligner les `release.yml` d'IakaCockpit
      et iakaFrameGUI (déjà divergents entre eux, M-R6), avant d'y inscrire ce 3ᵉ dépôt.
