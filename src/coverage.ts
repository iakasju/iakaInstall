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
 * Fait declaratif mesure au cadrage, RE-MESURE au lot AR-P5(a) (remontee CLI
 * embarque 0.40.0 -> 0.41.0, 2026-09-06) : `cleManifestePlateforme` (cote
 * CLI, `cli/src/lib/app-bundle.js`) rend desormais une cle pour darwin/arm64,
 * darwin/x64, linux/x64 (AppImage) et windows/x64 (.exe NSIS) — `null`
 * ailleurs (linux/arm64, windows/arm64, darwin/ia32 : CA-W15, le refus
 * retrecit, il ne disparait pas). Ce module ne reimplemente PAS cette
 * logique (AR-3) : il ne fait que DECLARER le fait mesure, pour que l'ecran
 * ne simule jamais une couverture qui n'existe pas (CA-I10, R-I2), AVANT
 * qu'un flux ne rende la verite.
 */
export type OsFamily = "macos" | "windows" | "linux" | "inconnu";

export function normaliserOs(os: string): OsFamily {
  const o = os.toLowerCase();
  if (o.includes("mac") || o === "darwin") return "macos";
  if (o.includes("win")) return "windows";
  if (o.includes("linux")) return "linux";
  return "inconnu";
}

type ArchFamily = "x64" | "arm64" | "inconnu";

function normaliserArch(arch: string): ArchFamily {
  const a = arch.toLowerCase();
  if (a.includes("aarch64") || a.includes("arm64")) return "arm64";
  if (a.includes("x86_64") || a.includes("x64") || a.includes("amd64")) return "x64";
  return "inconnu";
}

/**
 * macOS (arm64 + x64) est couvert sans condition d'archi ; Linux et Windows
 * ne le sont qu'en x64 (ressource CLI 0.41.0, AppImage / .exe NSIS — M-C6,
 * re-mesure AR-P5(a)). Le reste (linux/arm64, windows/arm64, os inconnu)
 * reste REFUSE.
 */
export function etapes34Couvertes(os: OsFamily, arch: string): boolean {
  if (os === "macos") return true;
  const a = normaliserArch(arch);
  if (os === "linux" || os === "windows") return a === "x64";
  return false;
}
