import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// CA-I14 — la doc du projet ne promet aucune commande inexistante.
const claudeMd = readFileSync(join(process.cwd(), "CLAUDE.md"), "utf8");
const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));

describe("commandes-documentees", () => {
  it("chaque `npm run <x>` cite dans CLAUDE.md existe dans package.json", () => {
    const scripts = new Set(Object.keys(pkg.scripts ?? {}));
    const cites = [...claudeMd.matchAll(/npm run ([a-zA-Z0-9:_-]+)/g)].map((m) => m[1]);
    expect(cites.length).toBeGreaterThan(0);
    for (const nom of cites) {
      expect(scripts.has(nom), `commande documentee absente de package.json: npm run ${nom}`).toBe(
        true,
      );
    }
  });

  it("le script chartes reference bien scripts/sync-chartes.sh", () => {
    expect(pkg.scripts.chartes).toContain("scripts/sync-chartes.sh");
  });
});
