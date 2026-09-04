/**
 * coverage.ts — couverture REELLE des etapes 3/4 par plateforme (M-C6).
 * Fait declaratif mesure au cadrage : `cleManifestePlateforme` (cote CLI,
 * `cli/src/lib/app-bundle.js`) ne rend une cle que pour darwin/arm64 et
 * darwin/x64 — `null` partout ailleurs, et `etapeApp` refuse explicitement.
 * Ce module ne reimplemente PAS cette logique (AR-3) : il ne fait que
 * DECLARER le fait mesure, pour que l'ecran ne simule jamais une couverture
 * qui n'existe pas (CA-I10, R-I2).
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
