// Convergence-locale.test.mjs — FACE LOCALE du registre de convergence à trois (successeur
// CONVERGENCE-TROIS-FRERES, lot 2, cadré 2026-09-08).
//
// ┌─ CE QUE CETTE FACE FAIT, ET CE QU'ELLE NE FAIT PAS ────────────────────────────────────────────┐
// │ Elle recalcule l'empreinte de chaque fichier LISTÉ dans `fixtures/convergence.sha256` et NOMME │
// │ celui qui a dérivé. Sans elle, ce registre ne serait qu'un fichier de texte : rien ne l'aurait │
// │ jamais recalculé. Elle attrape l'ÉDITION EN PLACE d'une copie, ici.                            │
// │                                                                                                  │
// │ HORS-COUVERTURE DÉCLARÉ — ce qu'elle NE VOIT PAS : une modification COORDONNÉE du fichier ET   │
// │ de son empreinte, faite d'un seul côté (le sien restant juste ici). Seule la FACE CROISÉE       │
// │ (`npm run test:convergence`, HORS gate, dépend du dépôt frère) la voit.                        │
// │                                                                                                  │
// │ ⚠️ CE REGISTRE-CI EST DÉLIBÉRÉMENT PETIT (AR-C3=b) : ce dépôt n'inscrit QUE le sous-ensemble    │
// │ mesuré byte-identique avec au moins une sœur — jamais les 26 chemins des sœurs. `npm run        │
// │ test:convergence` (hors gate) compare sur l'INTERSECTION des deux registres et déclare          │
// │ explicitement ce qui est hors comparaison ; ce n'est PAS un écart de cette face-ci.             │
// └──────────────────────────────────────────────────────────────────────────────────────────────┘
import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const EMPREINTES = "fixtures/convergence.sha256";

function lireLignes() {
  return readFileSync(resolve(ROOT, EMPREINTES), "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"));
}

describe("registre de convergence — face locale", () => {
  it("CA-C5 — aucun fichier inscrit n'a dérivé (empreinte recalculée = empreinte du registre)", () => {
    const lignes = lireLignes();
    const derives = [];
    for (const ligne of lignes) {
      const m = ligne.match(/^([0-9a-f]{64})\s+(.+)$/);
      expect(m, `ligne illisible dans le registre : « ${ligne} »`).toBeTruthy();
      const [, attendu, chemin] = m;
      let obtenu;
      try {
        obtenu = createHash("sha256").update(readFileSync(resolve(ROOT, chemin))).digest("hex");
      } catch {
        derives.push(`${chemin} : ABSENT`);
        continue;
      }
      if (obtenu !== attendu) {
        derives.push(`${chemin} : ${attendu.slice(0, 12)}… → ${obtenu.slice(0, 12)}…`);
      }
    }
    expect(
      derives.join("\n"),
      "fichier(s) du registre modifié(s) EN PLACE. Tout fichier de ce registre se modifie DANS " +
        "TOUS LES DÉPÔTS QUI L'INSCRIVENT au même commit logique, puis on régénère les empreintes " +
        "(commande en tête de fixtures/convergence.sha256) et on rejoue `npm run test:convergence`.",
    ).toBe("");
  });

  it("CA-C6 — le cliquet de complétude ne descend que sur décision (≥ 9 entrées)", () => {
    // CLIQUET — posé à la valeur MESURÉE le 2026-09-08 (lot 2 de CONVERGENCE-TROIS-FRERES, 7),
    // relevé le 2026-09-09 (CONVERGENCE-RELEASE-YML-ALIGNEMENT, 7 → 9 : deps-linux.mjs +
    // deps-linux.test.mjs). Ce nombre ne descend que sur décision explicite, portée dans le
    // même commit que celui qui retire une ligne du registre.
    const lignes = lireLignes();
    expect(
      lignes.length,
      "le registre de convergence a PERDU des entrées sans que rien ne le dise. Si le retrait " +
        "est délibéré, baisser ce plancher DANS LE MÊME COMMIT.",
    ).toBeGreaterThanOrEqual(9);
  });
});
