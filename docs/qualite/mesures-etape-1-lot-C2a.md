# Traçabilité — étape 1 du lot C.2-a (mesures M-C1..M-C4)

> Écart non bloquant E-1 du gate `docs/qualite/gate-facade-tauri-ossature-release.md` § 6 :
> les mesures que l'instruction (`specs/instructions/facade-installeur-tauri-ossature-release.md`
> § 5, Étape 1) demandait de rejouer **avant d'écrire une ligne** n'ont laissé aucune trace
> commitée lors de l'implémentation initiale du lot. Ce document répare l'écart : les trois
> commandes exigées sont **rejouées ici, maintenant, avec la date**, sortie citée intégralement
> pour les parties significatives.

## Contexte de la mesure

- **Date** : 2026-09-05 (rejeu de correction post-gate, ordre d'Aragorn).
- **Poste** : macOS arm64 (même poste que le gate Legolas du 2026-09-05).
- **Dépôt sondé** : `~/work/iakaframe`, en **lecture seule stricte** — aucune écriture,
  aucun commit, aucun `--target-claude`/`--apps-dir` autre que `/tmp/x` (déjà utilisé par
  Legolas et par l'instruction elle-même).
- **⚠️ Arbre `iakaframe` NON PROPRE au moment de la mesure** — un autre agent (Gimli, sur un
  autre lot) y travaille en parallèle sur le prérequis `CONTRAT-MACHINE-DU-VERBE-INSTALL` :

  ```
  $ git -C ~/work/iakaframe status --porcelain
   M cli/src/commands/install.js
   M cli/src/lib/interactif.js
   M cli/test/interactif.test.js
  ?? cli/src/lib/evenements.js
  ```

  Cette mesure **sonde donc un état transitoire et non commité**, pas le moteur tel qu'il
  sera livré. Elle est fidèlement rapportée telle qu'observée à l'instant T, avec ce
  caveat explicite — elle ne remplace ni ne périme le fait mesuré et **committé** au
  2026-09-04 (M-C1..M-C4 dans l'instruction, établis par lecture de code sur l'état alors
  commité). Aucune action n'est prise sur ce constat : il est **hors du périmètre de ce
  lot de correction** (façade `iakaInstall` uniquement) et **hors du périmètre de Gimli
  vis-à-vis d'`iakaframe`**, tenu en lecture seule ici. Il est signalé à Aragorn en fin de
  compte-rendu pour arbitrage éventuel.

## Commande 1 — `install --dry-run --json --root . --target-claude /tmp/x --apps-dir /tmp/x`

```
$ cd ~/work/iakaframe
$ node cli/src/index.js install --dry-run --json --root . --target-claude /tmp/x --apps-dir /tmp/x | head -3
{
  "ok": true,
  "count": 74,
EXIT=0
```

Sortie complète (608 lignes) capturée dans le scratchpad de session : un objet JSON
**bien formé** (`JSON.parse` réussit), portant `evenements` (74 événements typés :
`debut`, `reservoir`, `etape-annoncee`, `etape-terminee`, `garde-ar1`, `log-delegue`, …)
et `etatAtteint` en queue.

**Constat au 2026-09-05, sur cet arbre non propre** : `--json` **émet** un JSON structuré
— ce qui **diffère** du fait M-C1 tel qu'établi par lecture du code committé au
2026-09-04 (« `install --json` N'ÉMET AUCUN JSON »). Ceci est cohérent avec le fichier
non suivi `cli/src/lib/evenements.js` observé ci-dessus : le prérequis
`CONTRAT-MACHINE-DU-VERBE-INSTALL` semble activement en cours d'implémentation par un
autre agent, sur du code **non commité**. Ce lot de correction n'en tient pas compte pour
son propre travail (hors périmètre, cf. ordre de mission).

## Commande 2 — comptage des lignes JSON strictes

```
$ node cli/src/index.js install --dry-run --json --root . 2>&1 | grep -c '^{'
1
```

Une seule ligne commence par `{` (l'ouverture de l'objet racine, JSON pretty-printé sur
plusieurs lignes) — cohérent avec la commande 1 : un objet JSON unique et bien formé,
pas de la prose. Sur l'état **committé** du 2026-09-04 tel que mesuré par le cadrage,
cette même commande rendait `0` (aucune ligne `{`, sortie 100 % prose) — voir gate
§ 5 pour la citation de cette mesure antérieure.

## Commande 3 — `install` dans le contrat C-JSON gardé

```
$ grep -n "install" cli/test/guard-json-output.test.js
(aucune ligne)
```

**Confirmé, inchangé** : `install` n'apparaît dans aucune ligne du fichier de garde du
contrat C-JSON — le verbe reste hors de la liste `NOMINAL` gardée, comme mesuré au
2026-09-04 (M-C3). Ce fait-là **tient** indépendamment de l'arbre non propre.

## Conclusion pour ce lot

- **M-C3 confirmé inchangé** au 2026-09-05.
- **M-C1/M-C2, tels que mesurés sur l'arbre non propre du 2026-09-05, ne reproduisent
  plus le fait committé du 2026-09-04** — mais cette mesure sonde un **chantier en cours
  d'un autre agent, non commité**, donc **non probante** pour re-cadrer quoi que ce soit
  ici. Aucune conséquence sur ce lot de correction (garde de rendu + écran, périmètre
  `iakaInstall` seul) : le prérequis `CONTRAT-MACHINE-DU-VERBE-INSTALL` reste, à ce jour,
  **non livré et non arbitré** au niveau `iakaframe`. Signalé à Aragorn, non traité ici.
