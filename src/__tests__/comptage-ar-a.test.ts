import { describe, expect, it } from "vitest";
import { NB_ETAPES, NB_TELECHARGEMENTS, ETAPES_ANNONCEES } from "../steps";

// Le texte affiche a l'ecran (App.tsx) est LITTERAL ("4 étapes / 3 téléchargements",
// pour que le grep de CA-I9 le trouve) ; ce test garde l'invariant qui le justifie —
// si `steps.ts` derive un jour, ce test rougit AVANT que le texte litteral ne mente.
describe("invariant AR-A (4 étapes / 3 téléchargements)", () => {
  it("NB_ETAPES vaut 4", () => {
    expect(NB_ETAPES).toBe(4);
    expect(ETAPES_ANNONCEES.length).toBe(4);
  });

  it("NB_TELECHARGEMENTS vaut 3", () => {
    expect(NB_TELECHARGEMENTS).toBe(3);
    expect(ETAPES_ANNONCEES.filter((e) => e.telecharge).length).toBe(3);
  });
});
