#!/usr/bin/env node
/**
 * embarquer-cli.mjs — POINT D'ENTREE de l'embarquement de la ressource CLI
 * (AR-P2(b)). Toute la logique vit dans `scripts/lib/embarquer.mjs` (module
 * pur, injectable, importe par les tests) ; ce fichier n'a plus qu'UN role :
 * l'appeler INCONDITIONNELLEMENT quand il est execute, puis verifier le
 * resultat et rendre un code de sortie honnete.
 *
 * Correction post-gate FAIL du premier run CI reel (v0.1.0, run 33963420727,
 * job `build windows`, 2026-09-05) : l'ancienne version de ce fichier portait
 * une garde `if (import.meta.url === \`file://${process.argv[1]}\`)` pour ne
 * s'auto-executer que lorsqu'il est le module principal. Sur Windows cette
 * comparaison est TOUJOURS fausse (URL encodee a slashs vs chemin natif a
 * antislashs) : le script se terminait en ~0,4 s SANS AUCUNE SORTIE, code 0,
 * sans avoir rien fait — une garde MUETTE. `beforeBuildCommand` poursuivait
 * alors vers `npm run build` puis `cargo` rougissait sur une ressource
 * absente. Cette garde est SUPPRIMEE (pas reparee) : ce fichier n'est plus
 * jamais importe pour sa logique (elle est dans lib/), il n'a donc plus
 * aucune raison de se demander "suis-je le module principal ?" — il appelle
 * `embarquer()` a chaque execution, point final.
 *
 * Deuxieme garde ajoutee ici (le script n'a plus le droit d'etre silencieux
 * NI de rendre 0 sans ressource, quelle qu'en soit la cause) : apres l'appel
 * a `embarquer()`, on verifie que `<dest>/package.json` existe ET porte la
 * version attendue. Un `beforeBuildCommand` qui rendrait 0 sans ressource ne
 * peut plus exister : soit la ressource est la et conforme, soit le process
 * sort en 1 avec un message explicite.
 *
 * Variables d'environnement (tests / diagnostics uniquement — jamais utilisees
 * par `beforeBuildCommand`, qui appelle ce script sans argument ni variable) :
 *   EMBARQUER_FIXTURE=<chemin>  fixture a lire au lieu de fixtures/cli-embarque.json
 *   EMBARQUER_DEST=<chemin>     destination d'extraction au lieu de src-tauri/resources/cli
 *
 * Usage normal :
 *   node scripts/embarquer-cli.mjs
 */
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { embarquer, FIXTURE_PATH, DEST_DEFAUT } from "./lib/embarquer.mjs";

// ATTENTION : ce fichier appelle `main()` INCONDITIONNELLEMENT au chargement
// (voir plus bas) — c'est precisement le correctif (plus de garde d'entree
// qui puisse se taire). Consequence directe : PERSONNE ne doit plus importer
// CE fichier pour sa logique (un `import` declencherait un vrai run reseau).
// Les tests unitaires de la logique importent `scripts/lib/embarquer.mjs` ;
// ce point d'entree n'est teste QUE par sous-processus
// (`scripts/__tests__/embarquer-cli-entree.test.mjs`), comme n'importe quel
// script CLI.

function log(msg) {
  process.stdout.write(`[embarquer-cli] ${msg}\n`);
}

async function main() {
  const fixturePath = process.env.EMBARQUER_FIXTURE
    ? resolve(process.env.EMBARQUER_FIXTURE)
    : FIXTURE_PATH;
  const dest = process.env.EMBARQUER_DEST ? resolve(process.env.EMBARQUER_DEST) : DEST_DEFAUT;

  log(`fixture : ${fixturePath}`);
  log(`destination visee : ${dest}`);

  const resultat = await embarquer({ fixturePath, dest, log });

  // *** LA GARDE FINALE — le script ne peut plus rendre 0 sans ressource ***
  const pkgPath = join(dest, "package.json");
  if (!existsSync(pkgPath)) {
    throw new Error(
      `GARDE embarquer-cli : ${pkgPath} n'existe pas apres embarquer() — ressource NON produite ` +
        "(un beforeBuildCommand qui rend 0 sans cette ressource ne doit plus exister).",
    );
  }
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  if (pkg.version !== resultat.version) {
    throw new Error(
      `GARDE embarquer-cli : ${pkgPath} porte la version ${JSON.stringify(pkg.version)}, ` +
        `attendu ${JSON.stringify(resultat.version)} (fixture ${fixturePath}).`,
    );
  }
  log(`OK — ${pkgPath} conforme (version ${pkg.version}).`);
}

main().catch((err) => {
  process.stderr.write(`[embarquer-cli] ERREUR : ${err.message}\n`);
  process.exitCode = 1;
});
