#!/usr/bin/env node
/**
 * sync-vocabulaire-evenements.mjs — genere src/events/vocabulaire.ts depuis
 * le vocabulaire FERME du moteur (EVENEMENTS / ETATS_ETAPE / CANAUX_FEU_VERT,
 * cli/src/lib/evenements.js), LU DEPUIS LA RESSOURCE EMBARQUEE
 * (src-tauri/resources/cli/), jamais ecrit a la main (§ 2 point 3 de
 * l'instruction, meme idiome que scripts/sync-chartes.sh — M-F8).
 *
 * CA-P1 : `npm run vocabulaire && git diff --exit-code src/events/vocabulaire.ts`
 * doit rendre le code 0 — le fichier commite est toujours le reflet exact de
 * la ressource embarquee au moment du commit.
 *
 * Usage :
 *   node scripts/sync-vocabulaire-evenements.mjs
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const SOURCE_DEFAUT = join(ROOT, "src-tauri", "resources", "cli", "src", "lib", "evenements.js");
export const DEST_DEFAUT = join(ROOT, "src", "events", "vocabulaire.ts");
const PACKAGE_JSON_RESSOURCE = join(ROOT, "src-tauri", "resources", "cli", "package.json");

function log(msg) {
  process.stdout.write(`[sync-vocabulaire-evenements] ${msg}\n`);
}

function litteral(valeurs) {
  return valeurs.map((v) => `"${v}"`).join(" | ");
}

function tableauTs(nom, valeurs) {
  return `export const ${nom} = [${valeurs.map((v) => `"${v}"`).join(", ")}] as const;`;
}

export async function generer({ source = SOURCE_DEFAUT, dest = DEST_DEFAUT } = {}) {
  if (!existsSync(source)) {
    throw new Error(
      `ressource introuvable : ${source}\n` +
        `Lancer d'abord "npm run embarquer" (AR-P2b) pour extraire le CLI embarque.`,
    );
  }
  const module_ = await import(`file://${source}?t=${Date.now()}`);
  const { EVENEMENTS, ETATS_ETAPE, CANAUX_FEU_VERT } = module_;
  if (!EVENEMENTS || !ETATS_ETAPE || !CANAUX_FEU_VERT) {
    throw new Error("evenements.js de la ressource ne rend pas les trois exports attendus");
  }

  let version = "inconnue";
  if (existsSync(PACKAGE_JSON_RESSOURCE)) {
    version = JSON.parse(readFileSync(PACKAGE_JSON_RESSOURCE, "utf8")).version;
  }

  const contenu = `/**
 * vocabulaire.ts — GENERE par scripts/sync-vocabulaire-evenements.mjs.
 * NE PAS EDITER A LA MAIN (CA-P1).
 *
 * Source : src-tauri/resources/cli/src/lib/evenements.js (ressource embarquee,
 * version ${version}, AR-P2b). Trois unions de litteraux + les tableaux de
 * valeurs, pour que le reducteur (src/events/reducteur.ts) et la garde de
 * vocabulaire (src/__tests__/vocabulaire-evenements.test.ts, CA-P2) lisent
 * TOUJOURS le registre du moteur, jamais une liste reecrite a la main.
 */

${tableauTs("EVENEMENTS", EVENEMENTS)}
export type EvtType = ${litteral(EVENEMENTS)};

${tableauTs("ETATS_ETAPE", ETATS_ETAPE)}
export type EtatEtape = ${litteral(ETATS_ETAPE)};

${tableauTs("CANAUX_FEU_VERT", CANAUX_FEU_VERT)}
export type CanalFeuVert = ${litteral(CANAUX_FEU_VERT)};
`;

  writeFileSync(dest, contenu);
  log(`${dest} genere depuis ${source} (version ${version})`);
  return { source, dest, version, EVENEMENTS, ETATS_ETAPE, CANAUX_FEU_VERT };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generer().catch((err) => {
    process.stderr.write(`[sync-vocabulaire-evenements] ERREUR : ${err.message}\n`);
    process.exitCode = 1;
  });
}
