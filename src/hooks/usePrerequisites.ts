import { useEffect, useState } from "react";
import { detectPrerequisites, type PrerequisitesReport } from "../api/backend";

export type PrerequisitesState =
  | { status: "chargement" }
  | { status: "pret"; report: PrerequisitesReport }
  | { status: "erreur"; message: string };

/** Sonde Node/npm au montage — jamais suppose (CA-I12, M-C7). */
export function usePrerequisites(): PrerequisitesState {
  const [state, setState] = useState<PrerequisitesState>({ status: "chargement" });

  useEffect(() => {
    let annule = false;
    detectPrerequisites()
      .then((report) => {
        if (!annule) setState({ status: "pret", report });
      })
      .catch((err: unknown) => {
        if (!annule) {
          setState({
            status: "erreur",
            message: err instanceof Error ? err.message : String(err),
          });
        }
      });
    return () => {
      annule = true;
    };
  }, []);

  return state;
}
