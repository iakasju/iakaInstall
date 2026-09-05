import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { reduire, MODELE_INITIAL } from "../../src/events/reducteur.ts";

// CA-P4 (= CA-I8b, enfin couvert) — la chaine est rejouee SANS INTERFACE, et
// comparee CHAMP PAR CHAMP a l'evenement d'origine. Fixture enregistree par un
// run reel (etape 0, mesures (0b)/(0e)) contre la RESSOURCE EMBARQUEE (jamais
// ecrite a la main).

const CHEMIN_FIXTURE = join(process.cwd(), "fixtures", "flux-apercu.ndjson");

function chargerFlux() {
  const brut = readFileSync(CHEMIN_FIXTURE, "utf8");
  return brut
    .split("\n")
    .filter((l) => l.length > 0)
    .map((l) => JSON.parse(l));
}

function rejouer(flux) {
  const etats = [];
  let modele = MODELE_INITIAL;
  for (const evt of flux) {
    modele = reduire(modele, evt);
    etats.push(modele);
  }
  return etats;
}

describe("rejeu sans interface du flux d'apercu (CA-P4)", () => {
  const flux = chargerFlux();

  it("garde anti-temoin-vide : la fixture porte un debut, un reservoir, des annonces et une fin", () => {
    expect(flux.length).toBeGreaterThan(10);
    expect(flux.some((e) => e.evt === "debut")).toBe(true);
    expect(flux.some((e) => e.evt === "reservoir")).toBe(true);
    expect(flux.filter((e) => e.evt === "etape-annoncee").length).toBeGreaterThanOrEqual(1);
    expect(flux.some((e) => e.evt === "fin")).toBe(true);
  });

  it("chaque etape-annoncee produit un modele dont les SIX champs sont identiques a l'evenement", () => {
    const etats = rejouer(flux);
    flux.forEach((evt, index) => {
      if (evt.evt !== "etape-annoncee") return;
      const etape = evt.etape;
      const vue = etats[index].etapes[etape]?.annonce;
      expect(vue, `pas d'annonce en vue pour l'etape ${etape}`).not.toBeNull();
      expect(vue.quoi).toBe(evt.quoi);
      expect(vue.ou).toBe(evt.ou);
      expect(vue.version).toBe(evt.version);
      expect(vue.ceQuiSeraFusionne).toBe(evt.ceQuiSeraFusionne);
      expect(vue.sourceRetenue).toEqual(evt.sourceRetenue);
      expect(vue.sourcesConsultees).toEqual(evt.sourcesConsultees);
    });
  });

  it("chaque etape-terminee produit un etat de modele EXACTEMENT egal a `etat`", () => {
    const etats = rejouer(flux);
    flux.forEach((evt, index) => {
      if (evt.evt !== "etape-terminee") return;
      const etape = evt.etape;
      const vue = etats[index].etapes[etape];
      expect(vue.etat).toBe(evt.etat);
      expect(vue.detail).toBe(evt.detail ?? null);
    });
  });

  it("`reservoir.provenance` est affichee TELLE QUELLE, jamais recomposee", () => {
    const etats = rejouer(flux);
    const idx = flux.findIndex((e) => e.evt === "reservoir");
    const evt = flux[idx];
    expect(etats[idx].provenance).toBe(evt.provenance);
  });

  it("le modele final ne compte AUCUN evenement non rendu (vocabulaire connu, garde-ar1 assume)", () => {
    const etats = rejouer(flux);
    const dernier = etats[etats.length - 1];
    expect(dernier.evenementsNonRendus).toEqual([]);
  });

  it("le `fin` final rend `ok`, `etatAtteint` et `reprise` tels que l'evenement d'origine", () => {
    const etats = rejouer(flux);
    const evt = flux[flux.length - 1];
    expect(evt.evt).toBe("fin");
    const dernier = etats[etats.length - 1];
    expect(dernier.fin.ok).toBe(evt.ok);
    expect(dernier.fin.etatAtteint).toEqual(evt.etatAtteint);
    expect(dernier.fin.reprise).toBe(evt.reprise ?? null);
  });

  it("CA-P11 : en apercu, aucune etape n'est affichee comme faite", () => {
    const etats = rejouer(flux);
    const dernier = etats[etats.length - 1];
    const debut = flux.find((e) => e.evt === "debut");
    expect(debut.dryRun).toBe(true);
    for (const etape of Object.values(dernier.etapes)) {
      expect(etape.etat).not.toBe("faite");
    }
  });

  it("CA-P11 (statique) : `etatAtteint.etapesFaites` n'est jamais lu par le reducteur pour deriver un etat", () => {
    const source = readFileSync(join(process.cwd(), "src", "events", "reducteur.ts"), "utf8");
    expect(source.includes("etapesFaites")).toBe(false);
  });
});
