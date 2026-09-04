/**
 * manifest.ts — GENERE par scripts/sync-chartes.sh. NE PAS EDITER A LA MAIN.
 *
 * UNE seule charte (AR-I3) : pas de selecteur, ce catalogue documente
 * simplement l'origine des tokens appliques a :root dans chartes.css.
 */
export interface CharteInfo {
  id: string;
  name: string;
  /** Apercu : [fond global, carte, accent]. */
  swatches: [string, string, string];
}

export const CHARTE_ACTIVE: CharteInfo = {
  id: "studio-clair",
  name: "Studio clair",
  swatches: ["#fbfbfc", "#ffffff", "#5b5bd6"],
};
