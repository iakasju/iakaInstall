import { describe, expect, it } from "vitest";
import { EVENEMENTS } from "../events/vocabulaire";
import { TYPES_RENDUS } from "../events/reducteur";
import registreNonRendus from "../../fixtures/evenements-non-rendus.json";

// CA-P2 — 3e jambe de R3. Le vocabulaire des evenements RENDUS par le
// reducteur est compare a `EVENEMENTS`, lu depuis la RESSOURCE (via
// src/events/vocabulaire.ts, genere — jamais une liste reecrite ici). La
// garde rougit dans LES DEUX SENS.

describe("garde de vocabulaire d'evenements (CA-P2)", () => {
  it("aucun type invente cote facade : TYPES_RENDUS est inclus dans EVENEMENTS (autorite moteur)", () => {
    const inventes = TYPES_RENDUS.filter((t) => !(EVENEMENTS as readonly string[]).includes(t));
    expect(inventes, `type(s) invente(s) : ${inventes.join(", ")}`).toEqual([]);
  });

  it("chaque type du moteur est soit rendu, soit declare hors-couverture AVEC MOTIF", () => {
    const nonRendusDeclares = new Set(registreNonRendus.map((e) => e.type));
    const rendus = new Set<string>(TYPES_RENDUS);
    const oublies: string[] = [];
    for (const type of EVENEMENTS) {
      if (!rendus.has(type) && !nonRendusDeclares.has(type)) {
        oublies.push(type);
      }
    }
    expect(oublies, `type(s) du moteur ni rendu(s) ni declare(s) : ${oublies.join(", ")}`).toEqual(
      [],
    );
  });

  it("chaque entree hors-couverture porte un motif ecrit, et ne redoute pas un type deja rendu", () => {
    const rendus = new Set<string>(TYPES_RENDUS);
    for (const entree of registreNonRendus) {
      expect(typeof entree.motif, `motif manquant pour "${entree.type}"`).toBe("string");
      expect(entree.motif.length, `motif vide pour "${entree.type}"`).toBeGreaterThan(10);
      expect(rendus.has(entree.type), `"${entree.type}" est a la fois rendu ET hors-couverture`).toBe(
        false,
      );
    }
  });

  it("cliquet : le nombre d'entrees hors-couverture est connu et documente", () => {
    // Ce nombre ne MONTE que dans le commit qui le decide (chaque entree
    // porte un motif ecrit, verifie ci-dessus).
    expect(registreNonRendus.length).toBe(1);
  });
});
