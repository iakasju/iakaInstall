import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "../App";

const detectPrerequisites = vi.fn();
const getPlatformInfo = vi.fn();

vi.mock("../api/backend", () => ({
  detectPrerequisites: (...args: unknown[]) => detectPrerequisites(...args),
  getPlatformInfo: (...args: unknown[]) => getPlatformInfo(...args),
}));

beforeEach(() => {
  detectPrerequisites.mockReset();
  getPlatformInfo.mockReset();
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

  it("CA-I11 — le bouton de lancement est desarme et la cause est nommee", async () => {
    detectPrerequisites.mockResolvedValue({
      node: { present: true, version: "v20.0.0" },
      npm: { present: true, version: "10.0.0" },
    });
    getPlatformInfo.mockResolvedValue({ os: "macos", arch: "aarch64" });

    render(<App />);

    const bouton = screen.getByRole("button", { name: /Lancer l'installation/ });
    expect(bouton.hasAttribute("disabled")).toBe(true);
    expect(screen.getByText(/moteur d'installation ne fournit pas encore/)).toBeTruthy();
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
