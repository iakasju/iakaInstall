import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "../App";

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

describe("ecran d'annonce", () => {
  it("CA-I9 — affiche le comptage 4 etapes / 3 telechargements, sans le pluriel interdit", async () => {
    detectPrerequisites.mockResolvedValue({
      node: { present: true, version: "v20.0.0" },
      npm: { present: true, version: "10.0.0" },
    });
    getPlatformInfo.mockResolvedValue({ os: "macos", arch: "aarch64" });

    render(<App />);

    expect(screen.getByText(/4 étapes/)).toBeTruthy();
    expect(screen.getByText(/3 téléchargements/)).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/(trois|3)\s+installations/i);

    await waitFor(() => expect(getPlatformInfo).toHaveBeenCalled());
  });

  it("CA-I10 — sur une plateforme non couverte, l'ecran porte le refus (jamais un succes simule)", async () => {
    detectPrerequisites.mockResolvedValue({
      node: { present: true, version: "v20.0.0" },
      npm: { present: true, version: "10.0.0" },
    });
    getPlatformInfo.mockResolvedValue({ os: "windows", arch: "x86_64" });

    render(<App />);

    await waitFor(() => expect(screen.getByText(/REFUSEES/)).toBeTruthy());
  });

  it("CA-I10 (contraire) — sur macOS, la couverture est affirmee, pas simulee ailleurs", async () => {
    detectPrerequisites.mockResolvedValue({
      node: { present: true, version: "v20.0.0" },
      npm: { present: true, version: "10.0.0" },
    });
    getPlatformInfo.mockResolvedValue({ os: "macos", arch: "aarch64" });

    render(<App />);

    await waitFor(() => expect(screen.getByText(/sont couvertes\./)).toBeTruthy());
  });

  it("CA-P8 (= CA-I11 transformee) — avant tout apercu, seul le bouton d'apercu existe, jamais desarme", async () => {
    detectPrerequisites.mockResolvedValue({
      node: { present: true, version: "v20.0.0" },
      npm: { present: true, version: "10.0.0" },
    });
    getPlatformInfo.mockResolvedValue({ os: "macos", arch: "aarch64" });

    render(<App />);
    await waitFor(() => expect(getPlatformInfo).toHaveBeenCalled());

    const boutonApercu = screen.getByRole("button", { name: /Voir ce qui sera fait/ });
    expect(boutonApercu.hasAttribute("disabled")).toBe(false);
    // Le texte perime (l'application "n'installe rien encore") a disparu :
    // il cessait d'etre vrai (§ 2 de l'instruction pilotage-reel-facade-contrat-machine.md).
    expect(document.body.textContent).not.toMatch(/n'installe rien/);
    // "Lancer l'installation" n'existe QU'apres un apercu termine avec succes
    // (CA-P5) — jamais avant, jamais desarme par un `disabled`.
    expect(screen.queryByRole("button", { name: /Lancer l'installation/ })).toBeNull();
  });

  it("CA-I12 — l'absence de npm est detectee et DITE, jamais un plantage ni un silence", async () => {
    detectPrerequisites.mockResolvedValue({
      node: { present: true, version: "v20.0.0" },
      npm: { present: false, version: null },
    });
    getPlatformInfo.mockResolvedValue({ os: "macos", arch: "aarch64" });

    render(<App />);

    await waitFor(() => expect(screen.getByText(/npm : absent/)).toBeTruthy());
  });
});
