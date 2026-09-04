import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

// CA-I8a / R3 — la facade ne porte AUCUNE logique du moteur (garde de
// vocabulaire). Registre versionne, hors-couverture DECLARE et MOTIVE
// (jamais une liste muette) — voir fixtures/vocabulaire-interdit.json.

const ROOT = process.cwd();
const registre = JSON.parse(readFileSync(join(ROOT, "fixtures/vocabulaire-interdit.json"), "utf8"));

const DOSSIERS_BALAYES = [join(ROOT, "src"), join(ROOT, "src-tauri/src")];
const EXTENSIONS = new Set([".ts", ".tsx", ".rs"]);

function listerFichiers(dossier) {
  const resultat = [];
  for (const entree of readdirSync(dossier)) {
    const chemin = join(dossier, entree);
    const info = statSync(chemin);
    if (info.isDirectory()) {
      resultat.push(...listerFichiers(chemin));
    } else if (EXTENSIONS.has(chemin.slice(chemin.lastIndexOf(".")))) {
      resultat.push(chemin);
    }
  }
  return resultat;
}

const cheminsHorsCouverture = new Set(registre.horsCouverture.map((h) => h.chemin));

const tousLesFichiers = DOSSIERS_BALAYES.flatMap(listerFichiers).filter(
  (chemin) => !chemin.endsWith(".test.ts") && !chemin.endsWith(".test.tsx"),
);

describe("garde de vocabulaire (CA-I8a)", () => {
  it("le cliquet de completude porte exactement 13 motifs (toute baisse est une decision)", () => {
    expect(registre.motifs.length).toBe(13);
  });

  it("aucun motif du moteur n'apparait hors du fichier declare hors-couverture", () => {
    const violations = [];
    for (const chemin of tousLesFichiers) {
      const relatif = relative(ROOT, chemin);
      if (cheminsHorsCouverture.has(relatif)) continue;
      const contenu = readFileSync(chemin, "utf8");
      for (const { motif } of registre.motifs) {
        if (contenu.includes(motif)) {
          violations.push(`${relatif} :: "${motif}"`);
        }
      }
    }
    expect(violations, `motifs du moteur trouves hors couverture:\n${violations.join("\n")}`).toEqual(
      [],
    );
  });
});
