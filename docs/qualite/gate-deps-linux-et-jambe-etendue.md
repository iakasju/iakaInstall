# Rapport qualité — `fix/deps-linux-et-jambe-etendue` — 2026-09-09

## Verdict : PASS

Chaîne qualité verte, byte-identité confirmée avec les deux sœurs, registre de convergence
recalculé et cohérent (7 → 9), rouge préalable de Gimli rejoué à l'identique, contrefactuels
nommés au vert attendu, face croisée à six sens sans écart. Aucun fichier `.rs` touché. `main`
intact.

## Mesures — chaîne qualité

| Commande | Code de sortie | Résumé cité |
|---|---|---|
| `npm run typecheck` (`tsc --noEmit`) | `0` | (aucune sortie — silence = succès) |
| `npm run lint` (`eslint .`) | `0` | (aucune sortie — silence = succès) |
| `npm test` (`vitest run`) | `0` | `Test Files  25 passed (25)` / `Tests  165 passed \| 3 skipped (168)` |
| `npm run build` (`tsc && vite build`) | `0` | `✓ built in 343ms` |
| `git diff --stat f743e8b..HEAD` | — | **9 fichiers exactement**, tous annoncés : `.github/deps-linux.txt`, `.github/workflows/release.yml`, `CLAUDE.md`, `fixtures/convergence.sha256`, `scripts/__tests__/convergence-locale.test.mjs`, `scripts/__tests__/deps-linux.test.mjs`, `scripts/__tests__/release-publier-shell.test.mjs`, `scripts/lib/deps-linux.mjs`, `specs/PROJET.md` |
| `git diff --stat \| grep -c '\.rs'` | — | `0` — **aucun `.rs` touché** |

## `deps-linux.txt` et `release.yml`

- `.github/deps-linux.txt` : **5 paquets** utiles (`libwebkit2gtk-4.1-dev`, `libappindicator3-dev`,
  `librsvg2-dev`, `patchelf`, `libgtk-3-dev`), le reste étant des lignes de commentaire.
- `grep -i "cpal\|whisper" src-tauri/Cargo.toml` → **vide** (exit 1) : justifie l'absence des 3
  paquets audio du Cockpit (`libasound2-dev`, `cmake`, `pkg-config`).
- `git diff f743e8b..HEAD -- .github/workflows/release.yml` : diff **strictement limité au bloc
  apt** (2 lignes en dur remplacées par 1 ligne `xargs`), rien d'autre dans le fichier n'a bougé.
- Ligne `xargs -r -a .github/deps-linux.txt sudo apt-get install -y` : **identique caractère par
  caractère** à celle d'`IakaCockpit` sur `feat/convergence-release-yml-alignement` (vérifié par
  `git show ... | grep xargs`).
- `deps-linux.txt` est **hors registre local** : `grep -n "deps-linux.txt" fixtures/convergence.sha256`
  ne trouve aucune ligne d'empreinte (seulement des mentions en commentaire) ; `deps-linux.mjs` et
  `deps-linux.test.mjs`, eux, **sont** au registre (ce sont les copies de garde, pas la donnée
  locale).

## Byte-identité avec les deux sœurs

Comparaison `shasum -a 256` local vs `git -C <sœur> show feat/convergence-release-yml-alignement:<chemin> | shasum -a 256` :

| Fichier | Local | Cockpit | GUI | Verdict |
|---|---|---|---|---|
| `scripts/lib/deps-linux.mjs` | `88b5dcd1…` | `88b5dcd1…` | `88b5dcd1…` | identique |
| `scripts/__tests__/deps-linux.test.mjs` | `a4d019ec…` | `a4d019ec…` | `a4d019ec…` | identique |
| `scripts/__tests__/release-publier-shell.test.mjs` | `9700f609…` | `9700f609…` | `9700f609…` | identique |

Les trois fichiers sont **byte-identiques** aux deux sœurs, sur leur branche réelle.

## Registre de convergence (`fixtures/convergence.sha256`) — 7 → 9

- Comptage : `grep -c "^[a-f0-9]\{64\}  "` → **9 entrées**.
- Chaque empreinte inscrite a été **recalculée** contre le fichier réel (`shasum -a 256`) : les
  **9/9** correspondent exactement à la valeur inscrite (aucune divergence).
- Cliquet `CA-C6` (test `convergence-locale.test.mjs`) : plancher posé à `>= 9`, relevé dans le
  même commit que l'ajout des 2 lignes neuves — vérifié vert dans la suite complète.
- **Rouge préalable de CA-C5 (cité par Gimli) rejoué sur une copie** : ancienne empreinte réelle de
  `release-publier-shell.test.mjs` reprise du commit `4eea8ff` (`891d75e89e4b0d7eecb354ca041f8f2390f29e91dc811412298b56f1112d3f94`),
  substituée dans une copie du registre en gardant le fichier ACTUEL (donc `9700f609…`) :
  ```
  FAIL  scripts/__tests__/convergence-locale.test.mjs > CA-C5 …
  AssertionError: fichier(s) du registre modifié(s) EN PLACE. …
  + scripts/__tests__/release-publier-shell.test.mjs : 891d75e89e4b… → 9700f609b7a1…
  ```
  Rouge nommé, transition identique à celle citée par Gimli (`891d75e8… → 9700f609…`). Copie
  jetée après l'essai, aucun fichier du dépôt réel touché.

## Gardes (statiques + contrefactuels)

- `deps-linux.test.mjs` : **7/7** verts — témoin positif + contrefactuel nommé pour chacune des
  3 assertions AR-Y5(i/ii/iii). Le contrefactuel « réintroduire un paquet en dur » (i) est **déjà
  intégré à la suite** (`CONTREFACTUEL — reintroduire un paquet en dur est detecte et NOMME`) et
  passe au vert (le mécanisme de détection fonctionne — c'est le comportement attendu, pas un
  rouge : la garde détecte correctement l'anomalie simulée in-memory, elle ne s'applique pas au
  `release.yml` réel qui n'a pas cette régression).
- Jambe d'exécution `release-publier-shell.test.mjs`, étape « Dependances systeme Linux » :
  **3 tests en SKIP explicite nommé** — `SKIP EXPLICITE : \`xargs -r -a\` (GNU findutils) absent
  de ce poste (R-2) — la preuve definitive est le run de preuve sur ubuntu-22.04 (AR-Y6, CA-Y13)`.
  **Jamais vert** sur ce poste macOS (xargs BSD, pas GNU) — conforme à l'attendu, non une
  anomalie.
- `release-publication.test.mjs` : **18/18** verts.
- `fixtures/bloc-latest.sha256` : `git diff f743e8b..HEAD -- fixtures/bloc-latest.sha256` → **vide**
  (fixture inchangée) ; `bloc-latest.test.mjs` : **9/9** verts.
- `pin-tauri-action.test.mjs` : **13/13** verts.
- `ressource-avant-build.test.mjs` : **3/3** verts.
- `vocabulaire-moteur.test.mjs` (source, scripts) : **2/2** verts ; `vocabulaire-moteur-rendu.test.tsx`
  (rendu, src) : **3/3** verts.
- `vitrine.test.mjs` : **36/36** verts.
- `vitrine-en-ligne.test.mjs` : **18/18** verts.

## Face croisée — les six sens

1. **`npm run test:convergence` depuis `iakaInstall`** :
   ```
   test:convergence : OK — 2 frere(s) mesure(s) [IakaCockpit, iakaFrameGUI], 18 chemin(s) compare(s), 0 hors comparaison, 0 frere(s) nomme(s) SKIP.
   ```
   **0 écart**, 18 chemins (9+9).
2. **`npm run test:convergence` depuis `IakaCockpit`** (sur sa branche réelle
   `feat/convergence-release-yml-alignement`, exécution seule, aucun changement de branche) :
   ```
   iakaInstall (/Users/sjupin/work/iakaInstall) : mesure — 9 chemin(s) compare(s), 23 hors comparaison [...]
   test:convergence : OK — 2 frere(s) mesure(s) [iakaFrameGUI, iakaInstall], 41 chemin(s) compare(s), 23 hors comparaison, 0 frere(s) nomme(s) SKIP.
   ```
   `iakaInstall` mesuré : **9 chemins comparés, 0 écart** (les 23 hors comparaison sont déclarés,
   pas des écarts).
3. **`npm run test:convergence` depuis `iakaFrameGUI`** (même branche, exécution seule) :
   ```
   iakaInstall (/Users/sjupin/work/iakaInstall) : mesure — 9 chemin(s) compare(s), 23 hors comparaison [...]
   test:convergence : OK — 2 frere(s) mesure(s) [IakaCockpit, iakaInstall], 41 chemin(s) compare(s), 23 hors comparaison, 0 frere(s) nomme(s) SKIP.
   ```
   `iakaInstall` mesuré : **9 chemins comparés, 0 écart**.

Aucune sœur ne rougit sur `iakaInstall` — condition de FAIL non déclenchée. Les deux dépôts sœurs
sont restés `git status --short` **propre** après exécution (aucun changement de branche ni de
fichier de mon fait).

## `CLAUDE.md` / `specs/PROJET.md`

- `CLAUDE.md` § Backlog : lot consigné avec preuve mesurée (`165 passed | 3 skipped (168)`,
  identique à la mesure ci-dessus) ; entrée `CONVERGENCE-RELEASE-YML-TROIS-FRERES` placée
  **immédiatement après** `UPDATER-DE-LA-FACADE` (ligne 566, vs ligne 431 pour
  `UPDATER-DE-LA-FACADE`).
- `specs/PROJET.md` : section « Dépendances Linux externalisées + jambe d'exécution étendue
  (2026-09-09) » ajoutée, récit cohérent avec toutes les mesures ci-dessus (5 paquets, byte-identité,
  registre 7→9, rouge CA-C5 préalable, SKIP macOS nommé, face croisée 18 chemins 0 écart, sœurs
  intactes).

## Intégrité de `main`

`git rev-parse main origin/main github/main` → les trois pointent sur
`f743e8b3bc1159c0ca893aec4049b84f6c90277c` : **identiques, `main` intact**.

## Écarts

Aucun écart constaté. Tous les critères du mandat sont vérifiés PASS.

## Note hors mandat (signalée, non bloquante)

Le dépôt `~/work/iakaframe` (référence en lecture seule, hors périmètre de ce gate) porte des
modifications locales non commises (`cli/src/commands/*.js` notamment) préexistantes à cette
mission — signalé pour mémoire, je n'y ai rien touché et cela ne concerne pas `iakaInstall`.
