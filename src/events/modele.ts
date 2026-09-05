/**
 * modele.ts — le modele de vue de l'ecran de pilotage (§ 5 etape 4/5 de
 * l'instruction). AUCUNE valeur par defaut inventee : un champ absent d'un
 * evenement reste absent dans le modele, il n'est jamais remplace par un
 * tiret ou une supposition (§ 2 point 2, R3). Le tiret, s'il y en a un a
 * l'ecran, est une decision d'AFFICHAGE (composant), jamais du modele.
 */
import type { EtatEtape } from "./vocabulaire";

export interface DebutVue {
  versionCli: string;
  totalEtapes: number;
  telechargements: number;
  dryRun: boolean;
  plateforme: string;
}

/** Les SIX champs de l'annonce d'etape (§ 5 etape 5, § 8 CA-P4) — rendus tels quels. */
export interface AnnonceEtapeVue {
  etape: number;
  quoi: string;
  ou: string;
  version: string;
  ceQuiSeraFusionne: string;
  sourceRetenue: unknown;
  sourcesConsultees: unknown[];
}

export interface DemandeFeuVertVue {
  question: string;
}

export interface EtapeVue {
  annonce: AnnonceEtapeVue | null;
  etat: EtatEtape | null;
  detail: string | null;
  /** N'existe QUE tant que la demande de CETTE etape n'a pas ete honoree (CA-P6/CA-P7). */
  demandeFeuVertEnCours: DemandeFeuVertVue | null;
}

export interface LogDelegueLigneVue {
  etape: number;
  flux: "stdout" | "stderr";
  ligne: string;
}

export interface RollbackVue {
  resume: string;
  defaits: unknown[];
  nonDefaits: unknown[];
  rapports: unknown[];
}

export interface EtatAtteintVue {
  derniereEtapeTentee: number | null;
  etapesFaites: number[];
  etapesNonTentees: number[];
}

export interface FinVue {
  ok: boolean;
  error: string | null;
  etatAtteint: EtatAtteintVue;
  reprise: string | null;
}

export interface ModeleInstallation {
  debut: DebutVue | null;
  /** `reservoir.provenance` — la phrase au format impose, affichee TELLE QUELLE. */
  provenance: string | null;
  etapes: Partial<Record<number, EtapeVue>>;
  logsDelegues: LogDelegueLigneVue[];
  rollback: RollbackVue | null;
  fin: FinVue | null;
  /**
   * Types d'evt RECUS mais non geres explicitement par le reducteur (R-P10) :
   * une ressource plus recente que la facade emet un type inconnu -> il est
   * COMPTE et VISIBLE ici, jamais avale en silence.
   */
  evenementsNonRendus: string[];
}

export const MODELE_INITIAL: ModeleInstallation = {
  debut: null,
  provenance: null,
  etapes: {},
  logsDelegues: [],
  rollback: null,
  fin: null,
  evenementsNonRendus: [],
};

/** Enveloppe NDJSON commune (evenements.js:50-55) + champs specifiques, non types ici a dessein. */
export type EvenementBrut = {
  evt: string;
  ts: string;
  etape: number | null;
} & Record<string, unknown>;
