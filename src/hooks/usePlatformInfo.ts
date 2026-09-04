import { useEffect, useState } from "react";
import { getPlatformInfo, type PlatformInfo } from "../api/backend";

export type PlatformInfoState =
  | { status: "chargement" }
  | { status: "pret"; info: PlatformInfo }
  | { status: "erreur"; message: string };

/** OS/arch courants — pour afficher la couverture reelle (CA-I10, M-C6). */
export function usePlatformInfo(): PlatformInfoState {
  const [state, setState] = useState<PlatformInfoState>({ status: "chargement" });

  useEffect(() => {
    let annule = false;
    getPlatformInfo()
      .then((info) => {
        if (!annule) setState({ status: "pret", info });
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
