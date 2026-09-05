/**
 * lib/embarquer.mjs — le COEUR de l'embarquement de la ressource CLI (AR-P2(b)),
 * separe du point d'entree (`scripts/embarquer-cli.mjs`) depuis la correction
 * post-gate-FAIL du run CI reel `v0.1.0` (2026-09-05).
 *
 * Pourquoi ce fichier existe (au lieu d'un unique embarquer-cli.mjs) :
 * l'ancien point d'entree portait une garde `import.meta.url === \`file://${process.argv[1]}\``
 * pour ne s'auto-executer QUE lorsqu'il est le module principal (pas quand il
 * est importe par les tests). Sur Windows cette garde est TOUJOURS fausse :
 * `import.meta.url` vaut `file:///D:/a/.../embarquer-cli.mjs` (URL encodee,
 * slashs) tandis que `process.argv[1]` vaut `D:\a\...\embarquer-cli.mjs`
 * (chemin natif, antislashs) — la concatenation `file://${argv1}` ne peut
 * JAMAIS egaler l'URL reelle. Sur POSIX les deux formes coincident par
 * accident (Node normalise argv[1] en chemin absolu pour le module d'entree,
 * qui utilise deja des slashs) : le meme code se tait sur un OS et fonctionne
 * sur l'autre, une garde d'entree MUETTE (elle echoue silencieusement et
 * rend 0 — cf. `gardes-muettes-pas-en-dur` dans le journal iakaframe).
 *
 * Voie retenue : SUPPRIMER la garde plutot que de la reparer avec une
 * comparaison de chemins (`path.resolve` cote-a-cote resterait fragile aux
 * memes bugs de forme : lien symbolique, casse, drive letter). Ce module
 * n'est JAMAIS execute directement (pas de shebang, pas de bloc `if (...)
 * main()`) : c'est une bibliotheque pure, important seulement pour ses
 * exports. Le point d'entree (`scripts/embarquer-cli.mjs`) l'importe et
 * appelle `embarquer()` INCONDITIONNELLEMENT — il ne peut plus se taire,
 * puisqu'il n'a plus de condition a rater.
 */
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

// Ce module vit sous scripts/lib/ : la racine du depot est DEUX niveaux
// au-dessus (lib/ -> scripts/ -> racine).
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const FIXTURE_PATH = join(ROOT, "fixtures", "cli-embarque.json");
export const DEST_DEFAUT = join(ROOT, "src-tauri", "resources", "cli");

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
 * Compte recursivement les fichiers (pas les repertoires) sous `dir`. Sert de
 * preuve imprimee ("N entrees extraites") : un tar qui rend 0 sans rien
 * extraire (dest vide) se voit immediatement au journal, avant meme la
 * verification finale de `package.json`.
 */
function compterFichiers(dir) {
  let n = 0;
  for (const entree of readdirSync(dir, { withFileTypes: true })) {
    const chemin = join(dir, entree.name);
    n += entree.isDirectory() ? compterFichiers(chemin) : 1;
  }
  return n;
}

/**
 * Coeur du script, injectable pour les tests (`telecharger`, `extraireTar`) —
 * jamais un second chemin de production : les valeurs par defaut SONT le
 * chemin reel. `log` est injectable pour que le point d'entree redirige
 * proprement, mais imprime par defaut (le silence n'est jamais le defaut).
 */
export async function embarquer({
  fixturePath = FIXTURE_PATH,
  dest = DEST_DEFAUT,
  telecharger = telechargerReel,
  extraireTar = extraireTarReel,
  log = (msg) => process.stdout.write(`[embarquer-cli] ${msg}\n`),
} = {}) {
  const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
  const { version, url, sha256: attendu } = fixture;
  if (!version || !url || !attendu) {
    throw new Error("fixture cli-embarque.json incomplete (version/url/sha256 requis)");
  }

  log(`version attendue : ${version}`);
  log(`url : ${url}`);
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

  const nbEntrees = extraireTar({ tarball: contenu, dest });
  log(`destination : ${dest}`);
  log(`entrees extraites : ${nbEntrees ?? "n/d (extraireTar de test, sans decompte)"}`);
  return { version, sha256: empreinte, dest, nbEntrees };
}

function extraireTarReel({ tarball, dest }) {
  const tmp = mkdtempSync(join(tmpdir(), "iakainstall-cli-"));
  const tarballPath = join(tmp, "cli.tgz");
  writeFileSync(tarballPath, tarball);
  try {
    if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
    mkdirSync(dest, { recursive: true });
    // Chemins construits via `path.join` (jamais de concatenation de
    // chaines) : `tarballPath`/`dest` portent des antislashs sur Windows
    // (ex. `D:\a\...\cli.tgz`), forme que `execFileSync` transmet TELLE
    // QUELLE a l'executable (pas de shell interpose, donc pas d'echappement
    // a faire) — bsdtar (livre par defaut sur windows-latest depuis
    // Windows 10 build 17063) accepte nativement ces deux formes de
    // chemin pour `-C`/le nom de fichier. Non rejoue sur Windows reel dans
    // ce lot (poste macOS) : DECLARE, pas prouve ici (cf. reponse Gimli).
    execFileSync("tar", ["-xzf", tarballPath, "-C", dest, "--strip-components=1"]);
    return compterFichiers(dest);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}
