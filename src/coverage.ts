/**
 * coverage.ts — RETROGRADE au rang d'INDICE AVANT TOUT FLUX (§ 5 etape 6,
 * M-F6). Ce module a existe tant que le moteur ne parlait qu'aux humains ;
 * depuis ce lot (C.2-b), APRES un flux (`--dry-run` ou reel), la couverture
 * affichee vient de `etape-terminee.etat` (M-C6) — la SEULE source de
 * verite pour une etape reellement tentee. Ce fichier ne sert donc plus
 * qu'a afficher un indice AVANT que l'utilisateur n'ait lance le moindre
 * aperçu, jamais apres (CA-P15 : le fait ne doit plus jamais etre simule
 * une fois qu'un evenement existe).
 *
 * Fait declaratif mesure au cadrage : `cleManifestePlateforme` (cote CLI,
 * `cli/src/lib/app-bundle.js`) ne rend une cle que pour darwin/arm64 et
 * darwin/x64 — `null` partout ailleurs, et `etapeApp` refuse explicitement.
 * Ce module ne reimplemente PAS cette logique (AR-3) : il ne fait que
 * DECLARER le fait mesure, pour que l'ecran ne simule jamais une couverture
 * qui n'existe pas (CA-I10, R-I2), AVANT qu'un flux ne rende la verite.
 */
export type OsFamily = "macos" | "windows" | "linux" | "inconnu";

export function normaliserOs(os: string): OsFamily {
  const o = os.toLowerCase();
  if (o.includes("mac") || o === "darwin") return "macos";
  if (o.includes("win")) return "windows";
  if (o.includes("linux")) return "linux";
  return "inconnu";
}

/** Seul macOS est couvert par les etapes 3 et 4 aujourd'hui (M-C6). */
export function etapes34Couvertes(os: OsFamily): boolean {
  return os === "macos";
}
