/**
 * vocabulaire.ts — GENERE par scripts/sync-vocabulaire-evenements.mjs.
 * NE PAS EDITER A LA MAIN (CA-P1).
 *
 * Source : src-tauri/resources/cli/src/lib/evenements.js (ressource embarquee,
 * version 0.40.0, AR-P2b). Trois unions de litteraux + les tableaux de
 * valeurs, pour que le reducteur (src/events/reducteur.ts) et la garde de
 * vocabulaire (src/__tests__/vocabulaire-evenements.test.ts, CA-P2) lisent
 * TOUJOURS le registre du moteur, jamais une liste reecrite a la main.
 */

export const EVENEMENTS = ["debut", "reservoir", "etape-annoncee", "demande-feu-vert", "feu-vert", "etape-terminee", "log-delegue", "garde-ar1", "rollback", "fin"] as const;
export type EvtType = "debut" | "reservoir" | "etape-annoncee" | "demande-feu-vert" | "feu-vert" | "etape-terminee" | "log-delegue" | "garde-ar1" | "rollback" | "fin";

export const ETATS_ETAPE = ["faite", "refusee", "echouee", "sautee", "dry-run"] as const;
export type EtatEtape = "faite" | "refusee" | "echouee" | "sautee" | "dry-run";

export const CANAUX_FEU_VERT = ["yes", "tty", "stdin", "refus-par-defaut"] as const;
export type CanalFeuVert = "yes" | "tty" | "stdin" | "refus-par-defaut";
