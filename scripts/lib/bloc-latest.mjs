// bloc-latest.mjs — EXTRACTEUR DU BLOC `latest:` DU WORKFLOW DE RELEASE.
//
// COPIE de l'outil d'IakaCockpit (lot L44 la-bas, cf. CLAUDE.md de ce depot § B'-a) —
// PAS un fichier convergent au sens des soeurs : `iakaInstall` n'est PAS inscrit au
// registre `fixtures/convergence.sha256` d'IakaCockpit/iakaFrameGUI (AR-E : on ne touche
// pas leurs fichiers), et ce depot ne partage de fixture avec personne. Ici, la garde
// est PUREMENT LOCALE : elle protege CE `release.yml` d'une derive silencieuse du bloc
// `latest:` par rapport a SA PROPRE fixture (`fixtures/bloc-latest.sha256`), rien de plus.
//
// EXTRACTION PAR MARQUEUR, JAMAIS PAR NUMERO DE LIGNE — c'est toute la lecon de D-2 (un
// `chemin:ligne` ment des qu'une ligne est inseree au-dessus). Le bloc va de la ligne qui vaut
// EXACTEMENT `  latest:` jusqu'a la fin du fichier, et l'unicite de cette ligne est ASSERTEE :
//
// EXTRACTION PAR MARQUEUR, JAMAIS PAR NUMERO DE LIGNE — c'est toute la lecon de D-2 (un
// `chemin:ligne` ment des qu'une ligne est inseree au-dessus). Le bloc va de la ligne qui vaut
// EXACTEMENT `  latest:` jusqu'a la fin du fichier, et l'unicite de cette ligne est ASSERTEE :
// si un job venait a suivre, la garde doit ROUGIR plutot que de deviner (R3, CA-11).
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

/** Le marqueur d'ouverture du bloc, ancre a la ligne entiere (deux espaces d'indentation YAML). */
export const MARQUEUR = "  latest:";

/** Chemin du workflow, relatif a la racine du depot. */
export const CHEMIN_WORKFLOW = ".github/workflows/release.yml";

/** Chemin de la fixture qui porte l'empreinte du bloc, relatif a la racine du depot. */
export const CHEMIN_FIXTURE = "fixtures/bloc-latest.sha256";

/**
 * Extrait le bloc du texte d'un workflow. Leve une erreur NOMMEE si le marqueur n'apparait pas
 * exactement une fois — zero (le bloc a disparu ou a ete renomme) comme deux (un second job au
 * meme niveau : la regle « jusqu'a la fin du fichier » deviendrait fausse).
 * @param {string} texte contenu integral du workflow
 * @returns {string} le bloc, du marqueur inclus jusqu'a la fin du fichier
 */
export function extraireBloc(texte) {
  const lignes = texte.split("\n");
  const indices = [];
  lignes.forEach((l, i) => {
    if (l === MARQUEUR) indices.push(i);
  });
  if (indices.length !== 1) {
    throw new Error(
      `bloc-latest : le marqueur ${JSON.stringify(MARQUEUR)} apparait ${indices.length} fois dans ` +
        `${CHEMIN_WORKFLOW}, il en faut EXACTEMENT une. ` +
        (indices.length === 0
          ? "Zero : le bloc a disparu ou a ete renomme — la garde ne peut plus rien mesurer."
          : `Aux lignes ${indices.map((i) => i + 1).join(", ")} : la regle « du marqueur jusqu'a la ` +
            "fin du fichier » ne designe plus un bloc unique. RE-SPECIFIER la borne haute, " +
            "jamais deviner.") +
        " (R3 / CA-11, lot L44)",
    );
  }
  return lignes.slice(indices[0]).join("\n");
}

/** Lit le workflow a `racine` et en extrait le bloc. */
export function lireBloc(racine) {
  return extraireBloc(readFileSync(`${racine}/${CHEMIN_WORKFLOW}`, "utf8"));
}

/** Empreinte sha256 d'un bloc, en hexadecimal minuscule. */
export function empreinte(bloc) {
  return createHash("sha256").update(bloc, "utf8").digest("hex");
}

/**
 * Lit l'empreinte attendue depuis la fixture. Format : lignes `#` ignorees, puis une unique
 * ligne `<sha256>  <libelle>`. Une fixture illisible est une erreur, jamais un vert.
 */
export function empreinteAttendue(racine) {
  const brut = readFileSync(`${racine}/${CHEMIN_FIXTURE}`, "utf8");
  const lignes = brut
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"));
  if (lignes.length !== 1) {
    throw new Error(
      `bloc-latest : ${CHEMIN_FIXTURE} doit porter EXACTEMENT une empreinte, ` +
        `${lignes.length} trouvee(s).`,
    );
  }
  const m = lignes[0].match(/^([0-9a-f]{64})\s+(.+)$/);
  if (!m) {
    throw new Error(`bloc-latest : ligne d'empreinte illisible dans ${CHEMIN_FIXTURE} : ${lignes[0]}`);
  }
  return m[1];
}
