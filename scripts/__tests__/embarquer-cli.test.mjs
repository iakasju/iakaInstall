import { describe, expect, it, vi } from "vitest";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { embarquer, sha256 } from "../lib/embarquer.mjs";

// CA-P13 — la ressource est verifiee AVANT d'etre extraite. Un tarball corrompu
// (sha256 divergent) est REFUSE, rien n'est ecrit sous `dest`.

function fixtureTemporaire(contenu) {
  const dir = mkdtempSync(join(tmpdir(), "cli-embarque-fixture-"));
  const chemin = join(dir, "cli-embarque.json");
  writeFileSync(chemin, JSON.stringify(contenu));
  return { dir, chemin };
}

describe("embarquer-cli (CA-P13)", () => {
  it("verifie le sha256 AVANT toute extraction, et n'extrait rien si le tarball est corrompu", async () => {
    const bonBuffer = Buffer.from("contenu-legitime");
    const empreinteAttendue = sha256(bonBuffer);
    const { dir, chemin } = fixtureTemporaire({
      version: "9.9.9",
      url: "https://exemple.invalide/asset.tgz",
      sha256: empreinteAttendue,
    });
    const dest = join(dir, "dest");

    const extraireTar = vi.fn();
    // Le "telechargement" rend un buffer CORROMPU (empreinte differente de
    // celle de la fixture) : la fonction doit refuser AVANT d'appeler extraireTar.
    const telecharger = vi.fn().mockResolvedValue(Buffer.from("contenu-CORROMPU"));

    await expect(
      embarquer({ fixturePath: chemin, dest, telecharger, extraireTar }),
    ).rejects.toThrow(/sha256 divergent/);

    expect(extraireTar).not.toHaveBeenCalled();
    expect(existsSync(dest)).toBe(false);

    rmSync(dir, { recursive: true, force: true });
  });

  it("extrait quand le sha256 coincide (chemin nominal, sur donnee de test)", async () => {
    const bonBuffer = Buffer.from("contenu-legitime");
    const empreinteAttendue = sha256(bonBuffer);
    const { dir, chemin } = fixtureTemporaire({
      version: "9.9.9",
      url: "https://exemple.invalide/asset.tgz",
      sha256: empreinteAttendue,
    });
    const dest = join(dir, "dest");

    const extraireTar = vi.fn();
    const telecharger = vi.fn().mockResolvedValue(bonBuffer);

    const resultat = await embarquer({ fixturePath: chemin, dest, telecharger, extraireTar });

    expect(resultat.sha256).toBe(empreinteAttendue);
    expect(extraireTar).toHaveBeenCalledTimes(1);
    expect(extraireTar).toHaveBeenCalledWith({ tarball: bonBuffer, dest });

    rmSync(dir, { recursive: true, force: true });
  });

  it("refuse si la fixture est incomplete (version/url/sha256 requis)", async () => {
    const { dir, chemin } = fixtureTemporaire({ version: "9.9.9" });
    await expect(embarquer({ fixturePath: chemin, dest: join(dir, "dest") })).rejects.toThrow(
      /incomplete/,
    );
    rmSync(dir, { recursive: true, force: true });
  });
});
