import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import App from "../App";
import { VERSION_RESSOURCE } from "../events/vocabulaire";

// CA-P9 (jambe de rendu) — un flux dont `debut.versionCli` diverge de la
// ressource embarquee doit faire REFUSER l'ecran, en NOMMANT les deux
// valeurs — jamais un plantage silencieux, jamais une poursuite normale.

const detectPrerequisites = vi.fn();
const getPlatformInfo = vi.fn();
const demarrerInstallation = vi.fn();
const repondreFeuVert = vi.fn();
const interrompreInstallation = vi.fn();
const ecouterEvenementsPilote = vi.fn();
const ecouterErreursPilote = vi.fn();
const ecouterCodeSortiePilote = vi.fn();

let recepteurEvenement: ((ligne: string) => void) | null = null;

vi.mock("../api/backend", () => ({
  detectPrerequisites: (...args: unknown[]) => detectPrerequisites(...args),
  getPlatformInfo: (...args: unknown[]) => getPlatformInfo(...args),
  demarrerInstallation: (...args: unknown[]) => demarrerInstallation(...args),
  repondreFeuVert: (...args: unknown[]) => repondreFeuVert(...args),
  interrompreInstallation: (...args: unknown[]) => interrompreInstallation(...args),
  ecouterEvenementsPilote: (cb: (ligne: string) => void) => ecouterEvenementsPilote(cb),
  ecouterErreursPilote: (...args: unknown[]) => ecouterErreursPilote(...args),
  ecouterCodeSortiePilote: (...args: unknown[]) => ecouterCodeSortiePilote(...args),
}));

beforeEach(() => {
  recepteurEvenement = null;
  detectPrerequisites.mockReset().mockResolvedValue({
    node: { present: true, version: "v20.0.0" },
    npm: { present: true, version: "10.0.0" },
  });
  getPlatformInfo.mockReset().mockResolvedValue({ os: "macos", arch: "aarch64" });
  demarrerInstallation.mockReset().mockResolvedValue(undefined);
  repondreFeuVert.mockReset();
  interrompreInstallation.mockReset();
  ecouterEvenementsPilote.mockReset().mockImplementation((cb: (ligne: string) => void) => {
    recepteurEvenement = cb;
    return Promise.resolve(() => {});
  });
  ecouterErreursPilote.mockReset().mockResolvedValue(() => {});
  ecouterCodeSortiePilote.mockReset().mockResolvedValue(() => {});
});

describe("garde d'egalite de version au rendu (CA-P9)", () => {
  it("refuse et NOMME les deux versions si `debut.versionCli` diverge", async () => {
    render(<App />);
    await waitFor(() => expect(getPlatformInfo).toHaveBeenCalled());
    await waitFor(() => expect(ecouterEvenementsPilote).toHaveBeenCalled());

    act(() => {
      recepteurEvenement?.(
        JSON.stringify({
          evt: "debut",
          ts: "2026-09-05T00:00:00.000Z",
          etape: null,
          versionCli: "0.39.0",
          totalEtapes: 4,
          telechargements: 3,
          dryRun: true,
          plateforme: "darwin-arm64",
        }),
      );
    });

    expect(screen.getByText(/Version incompatible/)).toBeTruthy();
    expect(screen.getByText(VERSION_RESSOURCE, { exact: false })).toBeTruthy();
    expect(screen.getByText("0.39.0", { exact: false })).toBeTruthy();
  });

  it("n'affiche AUCUN refus quand la version coincide", async () => {
    render(<App />);
    await waitFor(() => expect(getPlatformInfo).toHaveBeenCalled());
    await waitFor(() => expect(ecouterEvenementsPilote).toHaveBeenCalled());

    act(() => {
      recepteurEvenement?.(
        JSON.stringify({
          evt: "debut",
          ts: "2026-09-05T00:00:00.000Z",
          etape: null,
          versionCli: VERSION_RESSOURCE,
          totalEtapes: 4,
          telechargements: 3,
          dryRun: true,
          plateforme: "darwin-arm64",
        }),
      );
    });

    expect(screen.queryByText(/Version incompatible/)).toBeNull();
  });
});
