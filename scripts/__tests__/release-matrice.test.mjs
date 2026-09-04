import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// CA-I5 — la matrice porte les quatre plateformes, et seulement elles.
// CA-I6 — includeUpdaterJson: false est pose, avec son motif.
const WORKFLOW = readFileSync(
  join(process.cwd(), ".github/workflows/release.yml"),
  "utf8",
);

describe("CA-I5 — matrice a 4 plateformes", () => {
  it("porte exactement les 4 cles macos-arm64/macos-x64/linux/windows", () => {
    const cles = [...WORKFLOW.matchAll(/"key":"([a-z0-9-]+)"/g)].map((m) => m[1]);
    expect(cles).toEqual(["macos-arm64", "macos-x64", "linux", "windows"]);
  });

  it("CONTREFACTUEL — retirer une cle romprait l'egalite avec l'ensemble attendu", () => {
    const cles = [...WORKFLOW.matchAll(/"key":"([a-z0-9-]+)"/g)].map((m) => m[1]);
    const sansUne = cles.slice(0, -1);
    expect(sansUne).not.toEqual(["macos-arm64", "macos-x64", "linux", "windows"]);
  });
});

describe("CA-I6 — includeUpdaterJson: false, motive", () => {
  it("est pose a false exactement une fois", () => {
    const lignes = WORKFLOW.split("\n").filter((l) => /includeUpdaterJson\s*:/.test(l));
    expect(lignes.length).toBe(1);
    expect(lignes[0]).toMatch(/includeUpdaterJson:\s*false/);
  });

  it("le motif est ecrit dans le fichier (pas de manifeste updater a poser, B'-b)", () => {
    expect(WORKFLOW).toMatch(/manifeste updater/);
    expect(WORKFLOW).toMatch(/concurrent/);
  });
});
