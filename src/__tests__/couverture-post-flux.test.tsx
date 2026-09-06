import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import App from "../App";

// M-F6 / § 5 etape 6 — APRES un flux, la couverture affichee vient de
// `etape-terminee` (M-C6), jamais de l'indice declaratif coverage.ts.

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
  // OS annonce "windows/arm64" (pre-flux : REFUSE par coverage.ts — seul le
  // x64 est couvert cote Windows depuis la ressource CLI 0.41.0, AR-P5(a)).
  getPlatformInfo.mockReset().mockResolvedValue({ os: "windows", arch: "aarch64" });
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

describe("couverture post-flux prime sur l'indice declaratif (M-F6)", () => {
  it("avant tout flux : l'indice de coverage.ts (REFUSEES sur windows/arm64)", async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByText(/REFUSEES : seuls macOS, Linux x64 et Windows x64/)).toBeTruthy());
  });

  it("apres un `etape-terminee` faite pour l'etape 3, la couverture RENDUE est celle du flux", async () => {
    render(<App />);
    await waitFor(() => expect(ecouterEvenementsPilote).toHaveBeenCalled());

    act(() => {
      recepteurEvenement?.(
        JSON.stringify({
          evt: "etape-annoncee",
          ts: "t",
          etape: 3,
          quoi: "IakaCockpit",
          ou: "/Applications/IakaCockpit.app",
          version: "0.32.2",
          ceQuiSeraFusionne: "rien",
          sourceRetenue: null,
          sourcesConsultees: [],
        }),
      );
      recepteurEvenement?.(
        JSON.stringify({
          evt: "etape-terminee",
          ts: "t",
          etape: 3,
          etat: "faite",
          detail: "installe",
        }),
      );
    });

    await waitFor(() => expect(screen.getByText(/D'après le flux/)).toBeTruthy());
    expect(screen.queryByText(/REFUSEES : seuls macOS, Linux x64 et Windows x64/)).toBeNull();
  });
});
