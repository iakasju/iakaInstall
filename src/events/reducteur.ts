/**
 * reducteur.ts — la fonction PURE `(modele, evenement) => modele` (§ 2 point 2,
 * § 5 etape 4). Aucun effet de bord, aucune horloge, aucun reseau, aucun
 * `invoke` : c'est ce qui rend CA-I8b (devenu CA-P4) enfin testable sans
 * interface, par simple rejeu d'un flux enregistre.
 *
 * `TYPES_RENDUS` est la declaration EXPLICITE, par type, de ce que ce
 * reducteur fait vivre a l'ecran (§ 2 point 3, 3e jambe de R3). Un type du
 * moteur absent de cette liste doit etre inscrit dans
 * `fixtures/evenements-non-rendus.json`, AVEC MOTIF — sinon la garde
 * (CA-P2, src/__tests__/vocabulaire-evenements.test.ts) rougit en le nommant.
 */
import type { EvtType } from "./vocabulaire";
import { EVENEMENTS, VERSION_RESSOURCE } from "./vocabulaire";
import type {
  AnnonceEtapeVue,
  EtapeVue,
  EtatAtteintVue,
  EvenementBrut,
  ModeleInstallation,
} from "./modele";
import { MODELE_INITIAL } from "./modele";

export { MODELE_INITIAL };

/**
 * Les types EFFECTIVEMENT rendus a l'ecran (produisent un champ de vue
 * consulte par un composant). `garde-ar1` n'y figure pas : il est un signal
 * interne du corollaire AR-1/AR-4 sans champ d'ecran dedie, DECLARE hors
 * couverture dans fixtures/evenements-non-rendus.json.
 */
export const TYPES_RENDUS: readonly EvtType[] = [
  "debut",
  "reservoir",
  "etape-annoncee",
  "demande-feu-vert",
  "feu-vert",
  "etape-terminee",
  "log-delegue",
  "rollback",
  "fin",
] as const;

function etapeVierge(): EtapeVue {
  return { annonce: null, etat: null, detail: null, demandeFeuVertEnCours: null };
}

export function reduire(modele: ModeleInstallation, evt: EvenementBrut): ModeleInstallation {
  const type = evt.evt as EvtType;

  switch (type) {
    case "debut": {
      const versionCli = evt.versionCli as string;
      return {
        ...modele,
        debut: {
          versionCli,
          totalEtapes: evt.totalEtapes as number,
          telechargements: evt.telechargements as number,
          dryRun: evt.dryRun as boolean,
          plateforme: evt.plateforme as string,
        },
        // CA-P9 : trois valeurs de version, une seule verite. Divergence ⇒
        // l'ecran refuse et NOMME les deux (jamais un plantage silencieux).
        incompatibiliteVersion:
          versionCli !== VERSION_RESSOURCE
            ? { attendue: VERSION_RESSOURCE, recue: versionCli }
            : null,
      };
    }

    case "reservoir":
      // `provenance` est affichee TELLE QUELLE (§ 2 point 2, CA-P4) — jamais recomposee.
      return { ...modele, provenance: evt.provenance as string };

    case "etape-annoncee": {
      const numero = evt.etape as number;
      const annonce: AnnonceEtapeVue = {
        etape: numero,
        quoi: evt.quoi as string,
        ou: evt.ou as string,
        version: evt.version as string,
        ceQuiSeraFusionne: evt.ceQuiSeraFusionne as string,
        sourceRetenue: evt.sourceRetenue,
        sourcesConsultees: (evt.sourcesConsultees as unknown[]) ?? [],
      };
      return {
        ...modele,
        etapes: { ...modele.etapes, [numero]: { ...etapeVierge(), annonce } },
      };
    }

    case "demande-feu-vert": {
      const numero = evt.etape as number;
      const existante = modele.etapes[numero];
      // CA-P6 : on n'accorde que ce qui est affiche — le bloc de decision
      // n'existe QUE si l'annonce de CETTE etape est deja dans le modele.
      if (!existante || !existante.annonce) {
        return {
          ...modele,
          evenementsNonRendus: [
            ...modele.evenementsNonRendus,
            `demande-feu-vert sans etape-annoncee prealable (etape ${numero})`,
          ],
        };
      }
      return {
        ...modele,
        etapes: {
          ...modele.etapes,
          [numero]: { ...existante, demandeFeuVertEnCours: { question: evt.question as string } },
        },
      };
    }

    case "feu-vert": {
      const numero = evt.etape as number;
      const existante = modele.etapes[numero];
      if (!existante) return modele;
      // Le bloc de decision DISPARAIT apres la reponse (§ 5 etape 5.3).
      return {
        ...modele,
        etapes: { ...modele.etapes, [numero]: { ...existante, demandeFeuVertEnCours: null } },
      };
    }

    case "etape-terminee": {
      const numero = evt.etape as number;
      const existante = modele.etapes[numero] ?? etapeVierge();
      return {
        ...modele,
        etapes: {
          ...modele.etapes,
          [numero]: {
            ...existante,
            etat: evt.etat as EtapeVue["etat"],
            detail: (evt.detail as string | undefined) ?? null,
            demandeFeuVertEnCours: null,
          },
        },
      };
    }

    case "log-delegue":
      return {
        ...modele,
        logsDelegues: [
          ...modele.logsDelegues,
          {
            etape: evt.etape as number,
            flux: evt.flux as "stdout" | "stderr",
            ligne: evt.ligne as string,
          },
        ],
      };

    case "garde-ar1":
      // Declare hors-couverture (fixtures/evenements-non-rendus.json) : signal
      // interne, sans champ d'ecran dedie a ce jour. No-op assume, pas un oubli.
      return modele;

    case "rollback":
      return {
        ...modele,
        rollback: {
          resume: evt.resume as string,
          defaits: (evt.defaits as unknown[]) ?? [],
          nonDefaits: (evt.nonDefaits as unknown[]) ?? [],
          rapports: (evt.rapports as unknown[]) ?? [],
        },
      };

    case "fin":
      return {
        ...modele,
        fin: {
          ok: evt.ok as boolean,
          error: (evt.error as string | undefined) ?? null,
          etatAtteint: evt.etatAtteint as EtatAtteintVue,
          reprise: (evt.reprise as string | null | undefined) ?? null,
        },
      };

    default: {
      // R-P10 : un `evt` hors du vocabulaire connu de CETTE facade (ressource
      // plus recente) est COMPTE et VISIBLE, jamais avale en silence.
      const _exhaustif: never = type;
      return { ...modele, evenementsNonRendus: [...modele.evenementsNonRendus, String(_exhaustif)] };
    }
  }
}

/** Verifie a l'import que TYPES_RENDUS ne contient rien hors du vocabulaire du moteur. */
const inconnus = TYPES_RENDUS.filter((t) => !(EVENEMENTS as readonly string[]).includes(t));
if (inconnus.length > 0) {
  throw new Error(`reducteur.ts : TYPES_RENDUS contient des types inventes : ${inconnus.join(", ")}`);
}
