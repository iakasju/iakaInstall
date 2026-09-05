import { useCallback, useEffect, useRef, useState } from "react";
import {
  demarrerInstallation,
  ecouterCodeSortiePilote,
  ecouterErreursPilote,
  ecouterEvenementsPilote,
  interrompreInstallation,
  repondreFeuVert,
  type ModeInstallation,
  type ReponseFeuVert,
} from "../api/backend";
import { MODELE_INITIAL, reduire } from "../events/reducteur";
import type { EvenementBrut, ModeleInstallation } from "../events/modele";

/**
 * usePilotageInstallation — orchestre le pilotage reel (§ 5 etape 5). AUCUNE
 * inference : chaque champ du modele vient d'un evenement recu (le
 * reducteur, pur, fait tout le travail d'interpretation). Ce hook ne fait
 * que : (1) s'abonner aux evenements du pont natif, (2) parser CHAQUE ligne
 * en JSON, (3) appliquer le reducteur, (4) suivre la PHASE d'ecran (avant /
 * apercu / reel / termine) — un fait DERIVE de la sequence des flux joues
 * dans CETTE session, jamais du contenu d'un evenement.
 */
export type PhaseEcran = "avant-tout-flux" | "apercu-en-cours" | "apercu-termine" | "reel-en-cours" | "reel-termine";

export interface EtatPilotage {
  phase: PhaseEcran;
  modele: ModeleInstallation;
  ligneNonJson: string[];
  erreurLancement: string | null;
  logsErreurProcessus: string[];
  peutLancerReel: boolean;
  lancerApercu: () => void;
  lancerReel: () => void;
  repondre: (etape: number, reponse: ReponseFeuVert) => void;
  arreterProprement: (etape: number) => void;
  forcerArret: () => void;
}

export function usePilotageInstallation(): EtatPilotage {
  const [phase, setPhase] = useState<PhaseEcran>("avant-tout-flux");
  const [modele, setModele] = useState<ModeleInstallation>(MODELE_INITIAL);
  const [ligneNonJson, setLigneNonJson] = useState<string[]>([]);
  const [erreurLancement, setErreurLancement] = useState<string | null>(null);
  const [logsErreurProcessus, setLogsErreurProcessus] = useState<string[]>([]);
  const phaseCourante = useRef<PhaseEcran>(phase);
  phaseCourante.current = phase;

  useEffect(() => {
    let annule = false;
    const desabonnements: Array<() => void> = [];

    ecouterEvenementsPilote((ligne) => {
      if (annule) return;
      let evt: EvenementBrut;
      try {
        evt = JSON.parse(ligne) as EvenementBrut;
      } catch {
        setLigneNonJson((prec) => [...prec, ligne]);
        return;
      }
      setModele((prec) => reduire(prec, evt));
      if (evt.evt === "fin") {
        setPhase(phaseCourante.current === "apercu-en-cours" ? "apercu-termine" : "reel-termine");
      }
    }).then((u) => desabonnements.push(u));

    ecouterErreursPilote((ligne) => {
      if (!annule) setLogsErreurProcessus((prec) => [...prec, ligne]);
    }).then((u) => desabonnements.push(u));

    ecouterCodeSortiePilote(() => {
      // Evenement de TRANSPORT (fin du processus) : n'affecte pas le modele,
      // deja porte par `evt:"fin"` s'il a ete emis par le moteur.
    }).then((u) => desabonnements.push(u));

    return () => {
      annule = true;
      desabonnements.forEach((u) => u());
    };
  }, []);

  const lancer = useCallback((mode: ModeInstallation) => {
    setErreurLancement(null);
    setPhase(mode === "apercu" ? "apercu-en-cours" : "reel-en-cours");
    demarrerInstallation(mode).catch((err: unknown) => {
      setErreurLancement(err instanceof Error ? err.message : String(err));
      setPhase("avant-tout-flux");
    });
  }, []);

  const lancerApercu = useCallback(() => lancer("apercu"), [lancer]);
  const lancerReel = useCallback(() => lancer("reel"), [lancer]);

  const repondre = useCallback((etape: number, reponse: ReponseFeuVert) => {
    repondreFeuVert(etape, reponse).catch((err: unknown) => {
      setErreurLancement(err instanceof Error ? err.message : String(err));
    });
  }, []);

  // "Arreter" = repondre "non" au feu vert en cours — un ARRET PROPRE, pas un kill (R-P4).
  const arreterProprement = useCallback(
    (etape: number) => repondre(etape, "non"),
    [repondre],
  );

  const forcerArret = useCallback(() => {
    interrompreInstallation().catch((err: unknown) => {
      setErreurLancement(err instanceof Error ? err.message : String(err));
    });
  }, []);

  // Le bouton "Lancer l'installation" n'apparait QU'apres un apercu termine
  // avec succes DANS CETTE SESSION (§ 2 point 4, CA-P5) — jamais avant.
  const peutLancerReel = phase === "apercu-termine" && modele.fin?.ok === true;

  return {
    phase,
    modele,
    ligneNonJson,
    erreurLancement,
    logsErreurProcessus,
    peutLancerReel,
    lancerApercu,
    lancerReel,
    repondre,
    arreterProprement,
    forcerArret,
  };
}
