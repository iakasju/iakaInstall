// embarquer-cli-entree.test.mjs — GARDE DE NON-REGRESSION post-gate FAIL du
// premier run CI reel (`v0.1.0`, run 33963420727, job `build windows`,
// 2026-09-05). Le defaut mesure : la garde d'entree
// `import.meta.url === \`file://${process.argv[1]}\`` est TOUJOURS fausse sur
// Windows (URL encodee a slashs vs chemin natif a antislashs) -> le script se
// terminait en silence, exit 0, sans avoir rien fait ; `beforeBuildCommand`
// poursuivait vers un build sans ressource.
//
// Voie retenue (motif complet : commentaire d'en-tete de scripts/embarquer-cli.mjs
// et scripts/lib/embarquer.mjs) : SUPPRIMER la garde, deplacer la logique dans
// `scripts/lib/embarquer.mjs` (module pur, jamais auto-execute), et faire du
// point d'entree un appel INCONDITIONNEL — plus de condition, plus rien a
// rater. Ce fichier PROUVE que ce point d'entree s'execute reellement, dans
// les deux sens (rouge/vert sur le sha256), en le lancant en SOUS-PROCESSUS
// (jamais en `import`, qui declencherait un vrai run reseau — cf. commentaire
// de scripts/embarquer-cli.mjs).
//
// Contrefactuel (honnetete, cf. instruction) : on ne peut pas executer
// Windows sur ce poste macOS, et la voie retenue SUPPRIME la garde plutot que
// de reparer sa comparaison — il n'existe donc plus, dans le fichier reel,
// d'expression a "defaire" avec un argv[1] reecrit en style Windows. Les deux
// tests de caracterisation ci-dessous rejouent l'expression booleenne de
// L'ANCIENNE garde (recopiee ici en dur, jamais importee) avec les chaines
// EXACTES du run reel en echec : ils prouvent que cette expression precise
// etait bien fausse sur Windows et vraie par accident sur POSIX — ils ne
// pretendent pas executer Windows.
import { describe, expect, it } from "vitest";
import { execFileSync, spawn } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SCRIPT = join(ROOT, "scripts", "embarquer-cli.mjs");

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

/** Construit un vrai tarball npm-like (`package/package.json` + un fichier), gzip. */
function construireTarball(version) {
  const staging = mkdtempSync(join(tmpdir(), "embarquer-entree-staging-"));
  const pkgDir = join(staging, "package");
  mkdirSync(pkgDir, { recursive: true });
  writeFileSync(join(pkgDir, "package.json"), JSON.stringify({ name: "fixture-test", version }));
  writeFileSync(join(pkgDir, "fichier.txt"), "contenu de test\n");
  const tarballPath = join(staging, "fixture.tgz");
  execFileSync("tar", ["-czf", tarballPath, "-C", staging, "package"]);
  const buffer = readFileSync(tarballPath);
  rmSync(staging, { recursive: true, force: true });
  return buffer;
}

/** Sert `buffer` en HTTP local (127.0.0.1, port ephemere) — pas de reseau reel. */
function demarrerServeur(buffer) {
  return new Promise((resolveServeur) => {
    const srv = createServer((_req, res) => {
      res.writeHead(200, { "Content-Type": "application/octet-stream" });
      res.end(buffer);
    });
    srv.listen(0, "127.0.0.1", () => resolveServeur(srv));
  });
}

/**
 * Lance le VRAI point d'entree en sous-processus, en ASYNCHRONE
 * (`spawn`, pas `spawnSync`) : le serveur HTTP local qui sert le tarball de
 * test vit dans CE MEME process de test — un `spawnSync` bloquerait sa boucle
 * d'evenements et le sous-processus n'obtiendrait jamais de reponse a son
 * `fetch()` (deadlock verifie empiriquement pendant l'ecriture de ce test).
 */
function lancerScript({ fixture, dest }) {
  return new Promise((resolveLancement) => {
    const enfant = spawn(process.execPath, [SCRIPT], {
      cwd: ROOT,
      env: { ...process.env, EMBARQUER_FIXTURE: fixture, EMBARQUER_DEST: dest },
    });
    let stdout = "";
    let stderr = "";
    enfant.stdout.on("data", (d) => {
      stdout += d.toString();
    });
    enfant.stderr.on("data", (d) => {
      stderr += d.toString();
    });
    enfant.on("close", (status) => resolveLancement({ status, stdout, stderr }));
  });
}

describe("embarquer-cli.mjs — point d'entree (non-regression post-gate FAIL Windows)", () => {
  it("ne porte plus l'ancienne garde muette `import.meta.url === file://...`", () => {
    const source = readFileSync(SCRIPT, "utf8");
    expect(
      /import\.meta\.url\s*===\s*`file:\/\//.test(source),
      "embarquer-cli.mjs contient encore la comparaison import.meta.url/argv[1] : elle est " +
        "FAUSSE sur Windows (voir l'en-tete du fichier pour l'historique du bug).",
    ).toBe(false);
  });

  it("caracterisation honnete : l'ANCIENNE garde etait bien fausse avec les chaines reelles du run Windows en echec (run 33963420727)", () => {
    // Chaines EXACTES rapportees par Aragorn depuis le run reel — pas une
    // simulation d'execution Windows (impossible sur ce poste macOS) : on
    // rejoue seulement l'expression booleenne de l'ancienne garde.
    const importMetaUrlWindows = "file:///D:/a/iakaInstall/iakaInstall/scripts/embarquer-cli.mjs";
    const argv1Windows = "D:\\a\\iakaInstall\\iakaInstall\\scripts\\embarquer-cli.mjs";
    const ancienneGarde = importMetaUrlWindows === `file://${argv1Windows}`;
    expect(
      ancienneGarde,
      "l'ancienne garde aurait du etre fausse sur Windows (c'est exactement le bug) — si elle " +
        "redevient vraie ici, cette caracterisation ne reproduit plus le run reel.",
    ).toBe(false);
  });

  it("(honnetete, meme caracterisation) sur POSIX la meme expression coincidait par accident", () => {
    // Ne PROUVE rien sur Windows : montre seulement pourquoi le bug etait
    // invisible sur ce poste (Node absolutise argv[1] pour le module
    // d'entree sur POSIX, qui utilise deja des slashs) — d'ou une garde
    // MUETTE (verte ici, fausse sur Windows), jamais reparee par un simple
    // "ca marche chez moi".
    const importMetaUrlPosix = `file://${SCRIPT}`;
    const argv1Posix = SCRIPT;
    expect(importMetaUrlPosix === `file://${argv1Posix}`).toBe(true);
  });

  it("rouge : sha256 volontairement faux -> le point d'entree ECRIT quelque chose ET rend exit 1", async () => {
    const tarball = construireTarball("1.2.3");
    const srv = await demarrerServeur(tarball);
    const { port } = srv.address();
    const staging = mkdtempSync(join(tmpdir(), "embarquer-entree-rouge-"));
    const fixturePath = join(staging, "fixture.json");
    writeFileSync(
      fixturePath,
      JSON.stringify({
        version: "1.2.3",
        url: `http://127.0.0.1:${port}/asset.tgz`,
        sha256: "0".repeat(64), // volontairement FAUX
      }),
    );
    const dest = join(staging, "dest");

    const resultat = await lancerScript({ fixture: fixturePath, dest });
    srv.close();

    const sortie = `${resultat.stdout ?? ""}${resultat.stderr ?? ""}`;
    expect(
      sortie.trim().length,
      "le point d'entree n'a RIEN ecrit : il ne s'est pas execute (regression garde muette).",
    ).toBeGreaterThan(0);
    expect(resultat.status, `sortie : ${sortie}`).toBe(1);
    expect(sortie).toMatch(/sha256 divergent/);
    expect(existsSync(dest)).toBe(false);

    rmSync(staging, { recursive: true, force: true });
  });

  it("vert : sha256 correct -> le point d'entree extrait la ressource ET rend exit 0", async () => {
    const version = "1.2.3";
    const tarball = construireTarball(version);
    const srv = await demarrerServeur(tarball);
    const { port } = srv.address();
    const staging = mkdtempSync(join(tmpdir(), "embarquer-entree-vert-"));
    const fixturePath = join(staging, "fixture.json");
    writeFileSync(
      fixturePath,
      JSON.stringify({
        version,
        url: `http://127.0.0.1:${port}/asset.tgz`,
        sha256: sha256(tarball),
      }),
    );
    const dest = join(staging, "dest");

    const resultat = await lancerScript({ fixture: fixturePath, dest });
    srv.close();

    const sortie = `${resultat.stdout ?? ""}${resultat.stderr ?? ""}`;
    expect(resultat.status, `sortie : ${sortie}`).toBe(0);
    expect(sortie).toMatch(/entrees extraites/);
    expect(existsSync(join(dest, "package.json"))).toBe(true);
    expect(JSON.parse(readFileSync(join(dest, "package.json"), "utf8")).version).toBe(version);

    rmSync(staging, { recursive: true, force: true });
  });
});
