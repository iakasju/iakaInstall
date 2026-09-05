/**
 * backend.ts — point d'`invoke` UNIQUE vers le backend Tauri (convention D7 des
 * soeurs, IakaCockpit/iakaFrameGUI). Aucun autre fichier du front n'importe
 * `@tauri-apps/api` (ni `core`, ni `event`) : c'est la seule couture par
 * laquelle la webview parle au cote natif.
 *
 * C.2-b branche le pilotage reel (AR-P1a) : `demarrerInstallation`,
 * `repondreFeuVert`, `interrompreInstallation` invoquent le pont Rust
 * (src-tauri/src/pilote.rs) ; les trois fonctions `ecouter*` s'abonnent aux
 * evenements de transport qu'il emet. Le contenu de chaque ligne n'est PAS
 * interprete ici : cette fonction transporte, le reducteur (src/events/)
 * interprete.
 *
 * C'est le SEUL endroit ou la garde de vocabulaire (CA-I8a, R3) tolere de
 * nommer le moteur — dans ce commentaire, pas dans du code executable.
 */
import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

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

export type ModeInstallation = "apercu" | "reel";
export type ReponseFeuVert = "oui" | "non";

/** Lance la chaine (aperçu ou reel) — AR-P1(a), le pont natif spawn le processus. */
export async function demarrerInstallation(mode: ModeInstallation): Promise<void> {
  return invoke<void>("demarrer_installation", { mode });
}

/** Ecrit EXACTEMENT une ligne de consentement, apres une demande recue (CA-P7). */
export async function repondreFeuVert(etape: number, reponse: ReponseFeuVert): Promise<void> {
  return invoke<void>("repondre_feu_vert", { etape, reponse });
}

/** `kill`, dernier recours explicitement nomme (R-P4) — pas un arret propre. */
export async function interrompreInstallation(): Promise<void> {
  return invoke<void>("interrompre_installation");
}

interface LigneTransport {
  ligne: string;
}

interface CodeSortieTransport {
  code: number | null;
}

/** Chaque ligne NDJSON du flux, TELLE QUELLE (non parsee cote Rust). */
export function ecouterEvenementsPilote(gestionnaire: (ligne: string) => void): Promise<UnlistenFn> {
  return listen<LigneTransport>("pilote://evenement", (e) => gestionnaire(e.payload.ligne));
}

/** Canal SEPARE et ETIQUETE — jamais mele au flux d'evenements (M-C10). */
export function ecouterErreursPilote(gestionnaire: (ligne: string) => void): Promise<UnlistenFn> {
  return listen<LigneTransport>("pilote://stderr", (e) => gestionnaire(e.payload.ligne));
}

/** Evenement de TRANSPORT distinct de `evt:"fin"` (qui est du moteur). */
export function ecouterCodeSortiePilote(
  gestionnaire: (code: number | null) => void,
): Promise<UnlistenFn> {
  return listen<CodeSortieTransport>("pilote://code-sortie", (e) => gestionnaire(e.payload.code));
}
