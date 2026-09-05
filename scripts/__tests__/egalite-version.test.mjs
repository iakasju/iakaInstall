import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { VERSION_RESSOURCE } from "../../src/events/vocabulaire.ts";

// CA-P9 — trois valeurs de version, une seule verite : fixtures/cli-embarque.json,
// src-tauri/resources/cli/package.json (la ressource EXTRAITE), et
// src/events/vocabulaire.ts (genere depuis la ressource). Les trois COINCIDENT.

const ROOT = process.cwd();

describe("egalite de version (CA-P9, jambe statique)", () => {
  it("la fixture cli-embarque.json et la ressource extraite portent la MEME version", () => {
    const fixture = JSON.parse(readFileSync(join(ROOT, "fixtures", "cli-embarque.json"), "utf8"));
    const ressource = JSON.parse(
      readFileSync(join(ROOT, "src-tauri", "resources", "cli", "package.json"), "utf8"),
    );
    expect(ressource.version).toBe(fixture.version);
  });

  it("VERSION_RESSOURCE (genere) coincide avec la fixture ET la ressource", () => {
    const fixture = JSON.parse(readFileSync(join(ROOT, "fixtures", "cli-embarque.json"), "utf8"));
    const ressource = JSON.parse(
      readFileSync(join(ROOT, "src-tauri", "resources", "cli", "package.json"), "utf8"),
    );
    expect(VERSION_RESSOURCE).toBe(fixture.version);
    expect(VERSION_RESSOURCE).toBe(ressource.version);
  });
});
