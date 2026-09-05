#!/usr/bin/env node
/**
 * embarquer-cli.mjs — AR-P2(b) : la ressource embarquee du moteur CLI est
 * l'ARBRE EXTRAIT depuis l'asset de release GitHub epingle
 * (fixtures/cli-embarque.json : version, url, sha256), jamais une seconde
 * implementation ni un second chemin (AR-3, AR-P2).
 *
 * Doctrine non negociable (CA-P13) : le sha256 est verifie AVANT toute
 * extraction. Un tarball dont l'empreinte diverge est REFUSE, rien n'est
 * ecrit sous `dest`. Meme discipline que la verification minisign du moteur.
 *
 * La ressource extraite (`src-tauri/resources/cli/`) n'est jamais commitee
 * (AR-P2(b), .gitignore) : une seule source de verite, la release.
 *
 * Usage :
 *   node scripts/embarquer-cli.mjs
 *   IAKAINSTALL_CLI_URL=... IAKAINSTALL_CLI_SHA256=... node scripts/embarquer-cli.mjs   (tests)
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const FIXTURE_PATH = join(ROOT, "fixtures", "cli-embarque.json");
export const DEST_DEFAUT = join(ROOT, "src-tauri", "resources", "cli");

function log(msg) {
  process.stdout.write(`[embarquer-cli] ${msg}\n`);
}

export function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function telechargerReel(url) {
  const reponse = await fetch(url);
  if (!reponse.ok) {
    throw new Error(`telechargement echoue : ${reponse.status} ${reponse.statusText} (${url})`);
  }
  return Buffer.from(await reponse.arrayBuffer());
}

/**
 * Coeur du script, injectable pour les tests (`telecharger`, `extraireTar`) —
 * jamais un second chemin de production : les valeurs par defaut SONT le
 * chemin reel.
 */
export async function embarquer({
  fixturePath = FIXTURE_PATH,
  dest = DEST_DEFAUT,
  telecharger = telechargerReel,
  extraireTar = extraireTarReel,
} = {}) {
  const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
  const { version, url, sha256: attendu } = fixture;
  if (!version || !url || !attendu) {
    throw new Error("fixture cli-embarque.json incomplete (version/url/sha256 requis)");
  }

  log(`obtention de ${url} (version ${version})`);
  const contenu = await telecharger(url);
  const empreinte = sha256(contenu);

  // *** LA VERIFICATION, AVANT TOUT LE RESTE (CA-P13) *** — aucune ecriture
  // sous `dest` n'a lieu avant cette ligne.
  if (empreinte !== attendu) {
    throw new Error(
      `sha256 divergent — REFUS D'EXTRAIRE.\n  attendu : ${attendu}\n  obtenu  : ${empreinte}`,
    );
  }
  log(`sha256 verifie AVANT extraction : ${empreinte}`);

  extraireTar({ tarball: contenu, dest });
  log(`ressource extraite dans ${dest}`);
  return { version, sha256: empreinte, dest };
}

function extraireTarReel({ tarball, dest }) {
  const tmp = mkdtempSync(join(tmpdir(), "iakainstall-cli-"));
  const tarballPath = join(tmp, "cli.tgz");
  writeFileSync(tarballPath, tarball);
  try {
    if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
    mkdirSync(dest, { recursive: true });
    // Le tarball npm porte tout sous "package/" ; --strip-components=1 amene
    // le contenu directement dans `dest` (src/, _bundled/, package.json...).
    execFileSync("tar", ["-xzf", tarballPath, "-C", dest, "--strip-components=1"]);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  embarquer().catch((err) => {
    process.stderr.write(`[embarquer-cli] ERREUR : ${err.message}\n`);
    process.exitCode = 1;
  });
}
