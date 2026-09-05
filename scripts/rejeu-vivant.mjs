#!/usr/bin/env node
/**
 * rejeu-vivant.mjs — CA-P4, seconde jambe (§ 5 etape 7b). Relance un aperçu
 * REEL depuis la ressource embarquee et verifie que le flux reste parsable
 * et se termine par `fin`. HORS `npm run test` : depend du reseau (le
 * moteur consulte GitHub/le registre) et d'une ressource deja extraite
 * (`npm run embarquer`). Un echec reseau rend un SKIP EXPLICITE avec son
 * code, JAMAIS un vert silencieux (meme doctrine que `vitrine:en-ligne` du
 * CLI, cli/package.json:22-23).
 *
 * Code de sortie :
 *   0  — flux parsable, termine par `fin`.
 *   1  — flux invalide (non-JSON, ou pas de `fin`) : echec REEL.
 *  75  — SKIP explicite (ressource absente ou reseau indisponible), EX_TEMPFAIL.
 */
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RESSOURCE = join(ROOT, "src-tauri", "resources", "cli");
const INDEX_JS = join(RESSOURCE, "src", "index.js");

function log(msg) {
  process.stdout.write(`[rejeu-vivant] ${msg}\n`);
}

function skip(motif) {
  log(`SKIP : ${motif}`);
  process.exitCode = 75;
}

async function main() {
  if (!existsSync(INDEX_JS)) {
    skip(`ressource introuvable (${INDEX_JS}) — lancer "npm run embarquer" d'abord`);
    return;
  }

  const lignes = [];
  let sortieNonJson = 0;

  const enfant = spawn(
    "node",
    [INDEX_JS, "install", "--dry-run", "--events", "--root", RESSOURCE],
    { stdio: ["ignore", "pipe", "pipe"] },
  );

  let tampon = "";
  enfant.stdout.on("data", (chunk) => {
    tampon += chunk.toString("utf8");
    const morceaux = tampon.split("\n");
    tampon = morceaux.pop() ?? "";
    for (const ligne of morceaux) {
      if (ligne.length === 0) continue;
      lignes.push(ligne);
      try {
        JSON.parse(ligne);
      } catch {
        sortieNonJson += 1;
      }
    }
  });

  let erreurReseau = "";
  enfant.stderr.on("data", (chunk) => {
    erreurReseau += chunk.toString("utf8");
  });

  const code = await new Promise((resolve) => enfant.on("close", resolve));

  if (code !== 0 && /ENOTFOUND|ETIMEDOUT|ECONNREFUSED|EAI_AGAIN/.test(erreurReseau)) {
    skip(`reseau indisponible (${erreurReseau.trim().slice(0, 200)})`);
    return;
  }

  if (sortieNonJson > 0) {
    log(`ECHEC : ${sortieNonJson} ligne(s) non-JSON dans le flux`);
    process.exitCode = 1;
    return;
  }

  const derniere = lignes[lignes.length - 1];
  const derniereEvt = derniere ? JSON.parse(derniere).evt : null;
  if (derniereEvt !== "fin") {
    log(`ECHEC : le flux ne se termine pas par "fin" (dernier evt : ${derniereEvt ?? "aucun"})`);
    process.exitCode = 1;
    return;
  }

  log(`OK : ${lignes.length} lignes, 0 non-JSON, termine par "fin"`);
  process.exitCode = 0;
}

main();
