/**
 * backend.ts — point d'`invoke` UNIQUE vers le backend Tauri (convention D7 des
 * soeurs, IakaCockpit/iakaFrameGUI). Aucun autre fichier du front n'importe
 * `@tauri-apps/api` : c'est la seule couture par laquelle la webview parle au
 * cote natif.
 *
 * CE LOT (C.2-a) N'EXPOSE AUCUNE COMMANDE METIER : `detectPrerequisites` sonde
 * l'environnement (Node/npm presents ?), ce n'est pas une etape d'installation.
 * Le pilotage reel de la chaine (etapes, feux verts, provenance, rollback) est
 * C.2-b, et attend le prerequis CLI cote `iakaframe`
 * (`CONTRAT-MACHINE-DU-VERBE-INSTALL`, AR-I1(b) — voir
 * specs/instructions/facade-installeur-tauri-ossature-release.md § 3).
 *
 * C'est le SEUL endroit ou la garde de vocabulaire (CA-I8a, R3) tolere de
 * nommer le moteur — dans ce commentaire, pas dans du code executable.
 */
import { invoke } from "@tauri-apps/api/core";

export interface PrerequisiteStatus {
  present: boolean;
  version: string | null;
}

export interface PrerequisitesReport {
  node: PrerequisiteStatus;
  npm: PrerequisiteStatus;
}

export interface PlatformInfo {
  os: string;
  arch: string;
}

/** Preuve minimale que le pont front <-> natif fonctionne. */
export async function ping(): Promise<string> {
  return invoke<string>("ping");
}

/** Detecte Node >= 20 et npm sur la machine — jamais suppose (CA-I12, M-C7). */
export async function detectPrerequisites(): Promise<PrerequisitesReport> {
  return invoke<PrerequisitesReport>("detect_prerequisites");
}

/** OS/arch courants, pour afficher la couverture reelle des etapes 3/4 (CA-I10, M-C6). */
export async function getPlatformInfo(): Promise<PlatformInfo> {
  return invoke<PlatformInfo>("platform_info");
}
