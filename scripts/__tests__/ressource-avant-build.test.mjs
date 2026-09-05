// ressource-avant-build.test.mjs — CORRECTION POST-GATE FAIL
// (docs/qualite/gate-pilotage-reel-contrat-machine.md).
//
// Le defaut mesure par Legolas : `tauri.conf.json` declare
// `bundle.resources: {"resources/cli":"cli"}`, mais RIEN ne produisait cette
// ressource avant le build Tauri (ni beforeBuildCommand, ni release.yml) ->
// echec garanti du premier run CI sur les quatre plateformes de la matrice
// ("resource path `resources/cli` doesn't exist").
//
// Voie retenue (motif complet : commit fix(ci) qui accompagne ce test) :
// `beforeBuildCommand` = "npm run embarquer && npm run build" dans
// tauri.conf.json. Tauri (CLI comme tauri-action, qui l'invoque en interne)
// execute TOUJOURS beforeBuildCommand avant de packager : une seule commande
// gouverne le build local ET le build CI, sans dupliquer la logique dans
// release.yml. Consequence directe et VOULUE : release.yml n'est plus jamais
// touche pour ce besoin -> aucun risque sur les gardes pin-tauri-action /
// release-matrice / bloc-latest (cliquets sha256 sur ce fichier).
//
// Cette garde ne juge donc PAS release.yml : elle juge la SEULE source de
// verite retenue, `beforeBuildCommand`. Elle rougit si "npm run embarquer"
// disparait de cette commande, ou si son ordre change (la ressource doit
// exister AVANT "npm run build" / le build Tauri qui la consomme).
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CHEMIN_CONF = resolve(ROOT, "src-tauri", "tauri.conf.json");

function lireBeforeBuildCommand() {
  const conf = JSON.parse(readFileSync(CHEMIN_CONF, "utf8"));
  return conf.build?.beforeBuildCommand ?? "";
}

describe("correction post-gate FAIL — la ressource CLI est produite AVANT tout build Tauri", () => {
  it("beforeBuildCommand appelle `npm run embarquer`, seule source de production de la ressource", () => {
    const cmd = lireBeforeBuildCommand();
    expect(
      cmd.includes("npm run embarquer"),
      `src-tauri/tauri.conf.json:build.beforeBuildCommand ne contient plus "npm run embarquer" ` +
        `(obtenu : "${cmd}"). Sans cette etape, bundle.resources ("resources/cli") pointe un ` +
        "dossier absent au premier `tauri build` sur un checkout propre : le premier run CI " +
        "echoue sur les quatre plateformes (gate-pilotage-reel-contrat-machine.md).",
    ).toBe(true);
  });

  it("l'ordre est respecte : la ressource est produite AVANT le build front/Tauri qui la consomme", () => {
    const cmd = lireBeforeBuildCommand();
    const idxEmbarquer = cmd.indexOf("npm run embarquer");
    const idxBuild = cmd.indexOf("npm run build");
    expect(idxEmbarquer, `"npm run embarquer" absent de beforeBuildCommand ("${cmd}")`).toBeGreaterThanOrEqual(0);
    expect(idxBuild, `"npm run build" absent de beforeBuildCommand ("${cmd}")`).toBeGreaterThanOrEqual(0);
    expect(
      idxEmbarquer,
      `"npm run embarquer" doit precede "npm run build" dans beforeBuildCommand (obtenu : "${cmd}")`,
    ).toBeLessThan(idxBuild);
  });

  it("release.yml n'est PAS la source de production de la ressource (une seule verite, locale et CI)", () => {
    // Garde de coherence de la voie retenue : si un jour une etape "embarquer"
    // ou "embarquer-cli" apparaissait DANS release.yml, la source de verite se
    // dedoublerait (deux endroits a maintenir en phase). Ce test ne l'interdit
    // pas techniquement (release.yml reste modifiable pour d'autres raisons),
    // il DOCUMENTE et VERIFIE que ce n'est pas le cas AUJOURD'HUI, pour qu'un
    // futur ajout silencieux soit visible dans un diff de test, pas seulement
    // de workflow.
    const workflow = readFileSync(
      resolve(ROOT, ".github", "workflows", "release.yml"),
      "utf8",
    );
    expect(
      /embarquer[-_]?cli|npm run embarquer/.test(workflow),
      "release.yml porte desormais une reference a l'embarquement de la ressource CLI : " +
        "la source de verite s'est dedoublee avec beforeBuildCommand (tauri.conf.json). " +
        "Choisir UNE seule voie (cf. commit fix(ci) qui a introduit cette garde).",
    ).toBe(false);
  });
});
