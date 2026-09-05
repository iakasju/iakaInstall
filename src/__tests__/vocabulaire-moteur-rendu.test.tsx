import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import App from "../App";
import registre from "../../fixtures/vocabulaire-interdit.json";

// CA-I8a / R3 / R-I5 — deuxieme jambe de la garde de vocabulaire, sur le
// RENDU (pas seulement la source). La garde statique (grep) de
// scripts/__tests__/vocabulaire-moteur.test.mjs est structurellement
// aveugle a tout motif RECONSTRUIT au runtime par interpolation (ex.
// `[{etape.n}/{NB_ETAPES}]` qui rend `[1/4]` sans jamais l'ecrire comme
// chaine litterale dans le fichier source). Cette garde-ci rend l'ecran
// avec @testing-library/react et balaie le TEXTE RENDU contre le meme
// registre versionne — voir docs/qualite/gate-facade-tauri-ossature-release.md
// § 3 pour la reproduction qui a fait tomber le gate.

const detectPrerequisites = vi.fn();
const getPlatformInfo = vi.fn();
const demarrerInstallation = vi.fn();
const repondreFeuVert = vi.fn();
const interrompreInstallation = vi.fn();
const ecouterEvenementsPilote = vi.fn();
const ecouterErreursPilote = vi.fn();
const ecouterCodeSortiePilote = vi.fn();

vi.mock("../api/backend", () => ({
  detectPrerequisites: (...args: unknown[]) => detectPrerequisites(...args),
  getPlatformInfo: (...args: unknown[]) => getPlatformInfo(...args),
  demarrerInstallation: (...args: unknown[]) => demarrerInstallation(...args),
  repondreFeuVert: (...args: unknown[]) => repondreFeuVert(...args),
  interrompreInstallation: (...args: unknown[]) => interrompreInstallation(...args),
  ecouterEvenementsPilote: (...args: unknown[]) => ecouterEvenementsPilote(...args),
  ecouterErreursPilote: (...args: unknown[]) => ecouterErreursPilote(...args),
  ecouterCodeSortiePilote: (...args: unknown[]) => ecouterCodeSortiePilote(...args),
}));

beforeEach(() => {
  detectPrerequisites.mockReset();
  getPlatformInfo.mockReset();
  demarrerInstallation.mockReset();
  repondreFeuVert.mockReset();
  interrompreInstallation.mockReset();
  ecouterEvenementsPilote.mockReset().mockResolvedValue(() => {});
  ecouterErreursPilote.mockReset().mockResolvedValue(() => {});
  ecouterCodeSortiePilote.mockReset().mockResolvedValue(() => {});
});

async function rendreEcran(os: string) {
  detectPrerequisites.mockResolvedValue({
    node: { present: true, version: "v20.0.0" },
    npm: { present: true, version: "10.0.0" },
  });
  getPlatformInfo.mockResolvedValue({ os, arch: "aarch64" });

  render(<App />);
  await waitFor(() => expect(getPlatformInfo).toHaveBeenCalled());

  return document.body.textContent ?? "";
}

function violationsDuRendu(texteRendu: string): string[] {
  const violations: string[] = [];
  for (const { motif } of registre.motifs) {
    if (texteRendu.includes(motif)) {
      violations.push(motif);
    }
  }
  return violations;
}

describe("garde de vocabulaire au RENDU (CA-I8a, R-I5)", () => {
  it("aucun motif du registre n'apparait dans le texte RENDU de l'ecran (macos)", async () => {
    const texteRendu = await rendreEcran("macos");
    const violations = violationsDuRendu(texteRendu);
    expect(
      violations,
      `motifs du moteur trouves dans le RENDU (macos):\n${violations.join("\n")}`,
    ).toEqual([]);
  });

  it("aucun motif du registre n'apparait dans le texte RENDU de l'ecran (windows, chemin refuse)", async () => {
    const texteRendu = await rendreEcran("windows");
    const violations = violationsDuRendu(texteRendu);
    expect(
      violations,
      `motifs du moteur trouves dans le RENDU (windows):\n${violations.join("\n")}`,
    ).toEqual([]);
  });

  it("exception documentee — le comptage AR-A (CA-I9) n'est pas un motif du registre", () => {
    // Verifie que "4 étapes / 3 téléchargements" (texte impose par CA-I9,
    // src/App.tsx:68) n'est capture par AUCUN motif du registre — sinon
    // cette garde entrerait en conflit avec CA-I9 et exigerait une
    // exception inscrite au registre, avec motif (jamais une exclusion
    // muette). Constat : aucun motif ne matche ce texte, donc aucune
    // exception n'est necessaire aujourd'hui.
    const comptage = "4 étapes / 3 téléchargements";
    const motifsCapturants = registre.motifs
      .map((m: { motif: string }) => m.motif)
      .filter((motif: string) => comptage.includes(motif));
    expect(motifsCapturants).toEqual([]);
  });
});
