import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "../App";

// Tests d'ecran du pilotage reel : CA-P5 (l'apercu est le premier ecran, il
// ne peut rien accorder), CA-P6 (on n'accorde que ce qui est affiche), CA-P10
// (l'arret propre est un refus ; le kill est nomme et separe).

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

function emettre(evt: Record<string, unknown>) {
  act(() => {
    recepteurEvenement?.(JSON.stringify(evt));
  });
}

beforeEach(async () => {
  recepteurEvenement = null;
  detectPrerequisites.mockReset().mockResolvedValue({
    node: { present: true, version: "v20.0.0" },
    npm: { present: true, version: "10.0.0" },
  });
  getPlatformInfo.mockReset().mockResolvedValue({ os: "macos", arch: "aarch64" });
  demarrerInstallation.mockReset().mockResolvedValue(undefined);
  repondreFeuVert.mockReset().mockResolvedValue(undefined);
  interrompreInstallation.mockReset().mockResolvedValue(undefined);
  ecouterEvenementsPilote.mockReset().mockImplementation((cb: (ligne: string) => void) => {
    recepteurEvenement = cb;
    return Promise.resolve(() => {});
  });
  ecouterErreursPilote.mockReset().mockResolvedValue(() => {});
  ecouterCodeSortiePilote.mockReset().mockResolvedValue(() => {});
});

async function monterEtDemarrerApercu() {
  render(<App />);
  await waitFor(() => expect(getPlatformInfo).toHaveBeenCalled());
  await waitFor(() => expect(ecouterEvenementsPilote).toHaveBeenCalled());
  const bouton = screen.getByRole("button", { name: /Voir ce qui sera fait/ });
  fireEvent.click(bouton);
  await waitFor(() => expect(demarrerInstallation).toHaveBeenCalledWith("apercu"));
}

const ANNONCE_ETAPE_1 = {
  evt: "etape-annoncee",
  ts: "t",
  etape: 1,
  quoi: "CLI",
  ou: "npm global",
  version: "0.40.0",
  ceQuiSeraFusionne: "rien",
  sourceRetenue: null,
  sourcesConsultees: [],
};

describe("CA-P5 — l'apercu est le premier ecran, il ne peut rien accorder", () => {
  it("aucun bouton de feu vert en dry-run, et 'Lancer l'installation' n'apparait qu'apres fin{ok:true}", async () => {
    await monterEtDemarrerApercu();

    emittreDebut();
    emettre(ANNONCE_ETAPE_1);
    emettre({ evt: "etape-terminee", ts: "t", etape: 1, etat: "sautee", detail: "rien" });

    expect(screen.queryByRole("button", { name: /^Oui$/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /Lancer l'installation/ })).toBeNull();

    emettre({
      evt: "fin",
      ts: "t",
      etape: null,
      ok: true,
      etatAtteint: { derniereEtapeTentee: 1, etapesFaites: [], etapesNonTentees: [] },
      reprise: null,
    });

    expect(screen.getByRole("button", { name: /Lancer l'installation/ })).toBeTruthy();
  });

  function emittreDebut() {
    emettre({
      evt: "debut",
      ts: "t",
      etape: null,
      versionCli: "0.40.0",
      totalEtapes: 4,
      telechargements: 3,
      dryRun: true,
      plateforme: "darwin-arm64",
    });
  }
});

describe("CA-P6 — on n'accorde que ce qui est affiche", () => {
  it("une demande-feu-vert SANS annonce prealable ne monte AUCUN bouton", async () => {
    await monterEtDemarrerApercu();
    emettre({
      evt: "debut",
      ts: "t",
      etape: null,
      versionCli: "0.40.0",
      totalEtapes: 4,
      telechargements: 3,
      dryRun: false,
      plateforme: "darwin-arm64",
    });
    // demande-feu-vert SANS etape-annoncee prealable pour l'etape 2 :
    emettre({ evt: "demande-feu-vert", ts: "t", etape: 2, question: "?" });

    expect(screen.queryByRole("button", { name: /^Oui$/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /Non \(arrêter\)/ })).toBeNull();
  });

  it("une demande-feu-vert AVEC annonce prealable monte le bloc de decision, et une reponse l'efface", async () => {
    await monterEtDemarrerApercu();
    emettre({
      evt: "debut",
      ts: "t",
      etape: null,
      versionCli: "0.40.0",
      totalEtapes: 4,
      telechargements: 3,
      dryRun: false,
      plateforme: "darwin-arm64",
    });
    emettre(ANNONCE_ETAPE_1);
    emettre({ evt: "demande-feu-vert", ts: "t", etape: 1, question: "Confirmer ?" });

    const boutonOui = screen.getByRole("button", { name: /^Oui$/ });
    expect(boutonOui).toBeTruthy();
    fireEvent.click(boutonOui);
    expect(repondreFeuVert).toHaveBeenCalledWith(1, "oui");

    emettre({ evt: "feu-vert", ts: "t", etape: 1, accorde: true, canal: "stdin", motif: "ok" });
    expect(screen.queryByRole("button", { name: /^Oui$/ })).toBeNull();
  });
});

describe("CA-P10 — l'arret propre est un refus ; le kill est nomme et separe", () => {
  it("repondre 'Non' declenche repondreFeuVert(etape, 'non') — un ARRET PROPRE, pas un kill", async () => {
    await monterEtDemarrerApercu();
    emettre({
      evt: "debut",
      ts: "t",
      etape: null,
      versionCli: "0.40.0",
      totalEtapes: 4,
      telechargements: 3,
      dryRun: false,
      plateforme: "darwin-arm64",
    });
    emettre(ANNONCE_ETAPE_1);
    emettre({ evt: "demande-feu-vert", ts: "t", etape: 1, question: "Confirmer ?" });

    fireEvent.click(screen.getByRole("button", { name: /Non \(arrêter\)/ }));
    expect(repondreFeuVert).toHaveBeenCalledWith(1, "non");
    expect(interrompreInstallation).not.toHaveBeenCalled();
  });

  it("le bouton 'Forcer l'arret' (dernier recours) est SEPARE, nomme, et appelle le kill", async () => {
    await monterEtDemarrerApercu();
    emettre({
      evt: "debut",
      ts: "t",
      etape: null,
      versionCli: "0.40.0",
      totalEtapes: 4,
      telechargements: 3,
      dryRun: false,
      plateforme: "darwin-arm64",
    });

    const boutonKill = screen.getByRole("button", { name: /Forcer l'arrêt \(dernier recours\)/ });
    expect(boutonKill).toBeTruthy();
    fireEvent.click(boutonKill);
    expect(interrompreInstallation).toHaveBeenCalledTimes(1);
    expect(repondreFeuVert).not.toHaveBeenCalled();
  });
});
