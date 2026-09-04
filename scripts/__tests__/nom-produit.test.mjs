import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// CA-I1 — le nom du produit est fige, a la casse pres.
const conf = JSON.parse(readFileSync(join(process.cwd(), "src-tauri/tauri.conf.json"), "utf8"));

describe("nom-produit", () => {
  it("porte exactement 'iakaInstall'", () => {
    expect(conf.productName).toBe("iakaInstall");
  });
});
