// vitrine-en-ligne.test.mjs — F-3 REOUVERT PAR LA COPIE, ET REFERME ICI (successeur
// GARDE-FACE-EN-LIGNE-VITRINE-INSTALL, inscrit § 8 du cadrage `convergence-trois-freres.md`,
// M-C5).
//
// ┌─ FICHIER CONVERGENT (chez les soeurs) — COPIE STRICTE ICI, AUCUNE DIVERGENCE FONCTIONNELLE ───┐
// │ Byte-identique entre IakaCockpit et iakaFrameGUI (mesure : `diff` des deux copies vide),      │
// │ inscrit dans LEUR `fixtures/convergence.sha256`. `iakaInstall` N'ENTRE PAS a ce registre       │
// │ (AR-V4=(a), successeur CONVERGENCE-TROIS-FRERES) : cette copie n'a RECU AUCUNE MODIFICATION   │
// │ DE LOGIQUE — seul ce cartouche differe du texte des soeurs (mesure ci-dessous).                │
// └──────────────────────────────────────────────────────────────────────────────────────────────┘
//
// LE DEFAUT REOUVERT PAR LA COPIE (M-C5, cadrage CONVERGENCE-TROIS-FRERES, 2026-09-08).
// `scripts/vitrine-en-ligne.mjs` a ete copie des soeurs le 2026-09-05 (lot C.3 + B'-b) AVEC son
// cartouche « aucune divergence fonctionnelle » — mais SANS la garde qui l'exerce, fermee chez
// les soeurs le MEME jour (F-3, lot « gardes de la vitrine »). La copie rouvrait donc, dans un
// TROISIEME depot, exactement le defaut que les soeurs venaient de fermer : le script pouvait
// etre desarme EN PLACE, dans `iakaInstall`, sans qu'aucune face ne bronge — tout restait vert.
//
// MESURE AVANT D'ECRIRE (etape 0 du successeur). `diff` entre le
// `scripts/vitrine-en-ligne.mjs` d'`iakaFrameGUI` et sa copie dans ce depot ne porte QUE sur le
// bloc de cartouche (lignes 4-11 de chaque fichier) : confirme que « aucune divergence
// fonctionnelle » est VRAI ici, pas seulement declare. Ce fichier de garde est donc repris
// VERBATIM des soeurs (mesure : `diff` vide entre la copie d'IakaCockpit et celle d'iakaFrameGUI),
// adapte UNIQUEMENT sur ce cartouche — rien d'autre, aucune assertion changee, aucun cas ajoute
// ni retire.
//
// ┌─ CE QUE CE FICHIER PROUVE, ET CE QU'IL NE PROUVE PAS — a lire ICI, PAS SEULEMENT au rapport ──┐
// │                                                                                                │
// │ CE QU'IL PROUVE. Que `scripts/vitrine-en-ligne.mjs` S'EXECUTE et TRAITE CORRECTEMENT ce qu'il  │
// │ RECOIT : que les cinq egalites (E-1..E-5) rendent le bon verdict sur des entrees CONNUES —     │
// │ E-5 comprise, meme si le registre REEL (`fixtures/vitrine-locale.json`) est vide des deux      │
// │ cotes (`absents: []`) — que les TROIS codes de sortie sont poses aux bons endroits, que le     │
// │ chemin SKIP sort en 3 et non en 0, et que la logique de verdict extraite dans                  │
// │ `scripts/lib/vitrine.mjs` (`evaluerCanalEnLigne`) est REELLEMENT BRANCHEE dans le script.      │
// │                                                                                                │
// │ CE QU'IL NE PROUVE PAS, ET QU'IL NE FAUT PAS LAISSER CROIRE.                                   │
// │  1. Que le STUB ait la FORME de l'API reelle. Il est construit sur ce que le script LIT        │
// │     (`tag_name`, `assets[].name`, `t.name`), pas sur ce que GitHub REND. Si l'API changeait de │
// │     forme, TOUS ces tests resteraient verts et la face en ligne REELLE rendrait un verdict     │
// │     FAUX.                                                                                       │
// │  2. Que la vitrine dise VRAI. Seule l'execution REELLE de `scripts/vitrine-en-ligne.mjs`        │
// │     (`npm run vitrine:en-ligne`, HORS gate, reseau requis, INCHANGEE par ce lot) repond a       │
// │     cette question.                                                                             │
// │  3. Que la release EXISTE. Un stub sert ce qu'on lui dit de servir.                             │
// │                                                                                                  │
// │ Le dispositif garde donc TROIS niveaux, et non deux : la face locale (deux derives de la meme  │
// │ table, `vitrine.test.mjs`), CE fichier (traitement correct de ce qui est recu), et la face en   │
// │ ligne reelle (confrontation au monde). AUCUN ne subsume les autres.                             │
// └──────────────────────────────────────────────────────────────────────────────────────────────────┘
import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { evaluerCanalEnLigne, tagAnnonceDe, nomsAttendus } from "../lib/vitrine.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const lireJson = (rel) => JSON.parse(readFileSync(resolve(ROOT, rel), "utf8"));

/** Chaque ecart porte son CODE en tete (« E-3 : ... ») : on ne teste jamais « au moins un ecart »,
 *  toujours LE code attendu (CA-5, verrou). */
const codes = (ecarts) => ecarts.map((e) => e.split(" : ")[0]);

// ══════════════════════════════════════════════════════════════════════════════════════════════
// CA-5/CA-6 — les CINQ EGALITES, sur des entrees FABRIQUEES.
//
// AR-4 — E-5 SANS ETRE VACUOUS. `absentsLocaux` est ici un litteral ecrit DANS ce test, JAMAIS une
// lecture de `fixtures/vitrine-locale.json` (dont `absents` est VIDE dans ce depot — l'y piloter
// itererait sur RIEN, le defaut I4bis rejoue dans le lot dont c'est le sujet).
// ══════════════════════════════════════════════════════════════════════════════════════════════
describe("CA-5/CA-6 — evaluerCanalEnLigne : les cinq egalites rendent le verdict attendu", () => {
  const APP_T = "AcmeApp";
  const VERSION_T = "1.2.3";
  const TABLE_T = {
    plateformes: [
      { cle: "win", libelle: "Windows", motif: "{APP}_{V}_win.exe" },
      { cle: "mac", libelle: "macOS", motif: "{APP}_{V}_mac.dmg" },
    ],
    hors_vitrine: { "*.sig": "signature minisign, pas un installeur" },
  };
  const NOMS_T = nomsAttendus(TABLE_T.plateformes, { app: APP_T, version: VERSION_T });

  const README_OK = [
    "<!-- vitrine:debut:binaires -->",
    `La version scellée courante est **[v${VERSION_T}](https://example.test/tag)** — voir`,
    "[toutes les versions](https://example.test/releases).",
    "",
    "| Système | Fichier à télécharger |",
    "|---|---|",
    `| **Windows** | \`${NOMS_T.win}\` |`,
    `| **macOS** | \`${NOMS_T.mac}\` |`,
    "<!-- vitrine:fin:binaires -->",
  ].join("\n");

  /** Base NOMINALE : les cinq egalites concordent. Chaque cas ci-dessous s'ecarte d'UN seul champ. */
  const BASE = {
    depot: "acme/test",
    app: APP_T,
    version: VERSION_T,
    table: TABLE_T,
    absentsLocaux: [],
    readme: README_OK,
    latest: `v${VERSION_T}`,
    latestAbsent: false,
    tagsBruts: [`v${VERSION_T}`, "v1.0.0", "archive/feat/x"],
    releaseAnnoncee: { corps: { assets: [{ name: NOMS_T.win }, { name: NOMS_T.mac }] } },
  };

  it("cas nominal : ZERO ecart, les cinq egalites concordent", () => {
    const { ecarts } = evaluerCanalEnLigne(BASE);
    expect(ecarts).toEqual([]);
  });

  it("E-1 — `latest` n'expose AUCUNE release pour un visiteur anonyme", () => {
    const { ecarts } = evaluerCanalEnLigne({ ...BASE, latest: null, latestAbsent: true });
    expect(codes(ecarts)).toContain("E-1");
    const e1 = ecarts.find((e) => e.startsWith("E-1"));
    expect(e1).toMatch(/AUCUNE release/);
  });

  it("E-1 — `latest` ne designe PAS le plus haut tag semver publie", () => {
    const { ecarts } = evaluerCanalEnLigne({ ...BASE, tagsBruts: [...BASE.tagsBruts, "v9.9.9"] });
    expect(codes(ecarts)).toContain("E-1");
    const e1 = ecarts.find((e) => e.startsWith("E-1"));
    expect(e1).toMatch(/v9\.9\.9/);
    // Les tags NON-semver (`archive/feat/x`) ne comptent pas comme un tag de version plus haut.
    expect(e1).not.toMatch(/archive/);
  });

  it("E-2 — le README annonce une version differente de celle que GitHub presente", () => {
    const readmeDesaligne = README_OK.replace(`v${VERSION_T}`, "v9.9.9");
    const { ecarts } = evaluerCanalEnLigne({ ...BASE, readme: readmeDesaligne, releaseAnnoncee: null });
    expect(codes(ecarts)).toContain("E-2");
    const e2 = ecarts.find((e) => e.startsWith("E-2"));
    expect(e2).toMatch(/v9\.9\.9/);
    expect(e2).toMatch(new RegExp(`v${VERSION_T}`));
  });

  it("E-3 — un fichier PROMIS par le README n'est PAS un asset de la release", () => {
    const { ecarts } = evaluerCanalEnLigne({
      ...BASE,
      releaseAnnoncee: { corps: { assets: [{ name: NOMS_T.win }] } }, // le .dmg manque
    });
    expect(codes(ecarts)).toContain("E-3");
    const e3 = ecarts.find((e) => e.startsWith("E-3"));
    expect(e3).toContain(NOMS_T.mac);
  });

  it("E-3 — la release ANNONCEE par le README N'EXISTE PAS (404 anonyme)", () => {
    const { ecarts } = evaluerCanalEnLigne({ ...BASE, releaseAnnoncee: { absent: true } });
    expect(codes(ecarts)).toContain("E-3");
    const e3 = ecarts.find((e) => e.startsWith("E-3"));
    expect(e3).toMatch(/N'EXISTE PAS/);
  });

  it("E-4 — un asset INSTALLABLE de la release n'est annonce NULLE PART dans le README", () => {
    const { ecarts } = evaluerCanalEnLigne({
      ...BASE,
      releaseAnnoncee: {
        corps: { assets: [{ name: NOMS_T.win }, { name: NOMS_T.mac }, { name: "extra.exe" }] },
      },
    });
    expect(codes(ecarts)).toContain("E-4");
    const e4 = ecarts.find((e) => e.startsWith("E-4"));
    expect(e4).toContain("extra.exe");
  });

  it("E-4 — un asset HORS VITRINE (signature) n'est PAS exige au README", () => {
    const { ecarts } = evaluerCanalEnLigne({
      ...BASE,
      releaseAnnoncee: {
        corps: {
          assets: [{ name: NOMS_T.win }, { name: NOMS_T.mac }, { name: `${NOMS_T.win}.sig` }],
        },
      },
    });
    expect(ecarts).toEqual([]);
  });

  it("E-5 — une absence declaree FABRIQUEE redevient fausse : l'artefact EST present", () => {
    const { ecarts } = evaluerCanalEnLigne({
      ...BASE,
      absentsLocaux: [{ cle: "mac", depuis: "2026-01-01" }],
    });
    expect(codes(ecarts)).toContain("E-5");
    const e5 = ecarts.find((e) => e.startsWith("E-5"));
    expect(e5).toContain(NOMS_T.mac);
    expect(e5).toMatch(/survecu a sa raison d'etre/);
  });

  it("E-5 — une absence declaree TOUJOURS VRAIE (l'asset manque bien) ne rougit PAS", () => {
    const { ecarts } = evaluerCanalEnLigne({
      ...BASE,
      absentsLocaux: [{ cle: "mac", depuis: "2026-01-01" }],
      releaseAnnoncee: { corps: { assets: [{ name: NOMS_T.win }] } },
    });
    expect(codes(ecarts)).not.toContain("E-5");
  });

  it("tagAnnonce introuvable (README illisible, latest absent) : aucun crash, aucun E-3/E-4/E-5", () => {
    const { ecarts } = evaluerCanalEnLigne({
      ...BASE,
      readme: "# rien de lisible ici",
      latest: null,
      releaseAnnoncee: null,
    });
    expect(codes(ecarts).some((c) => ["E-3", "E-4", "E-5"].includes(c))).toBe(false);
  });

  it("tagAnnonceDe — le README prime sur `latest` quand il annonce une version lisible", () => {
    expect(tagAnnonceDe(README_OK, "v9.9.9")).toBe(`v${VERSION_T}`);
    expect(tagAnnonceDe("# illisible", "v9.9.9")).toBe("v9.9.9");
    expect(tagAnnonceDe("# illisible", null)).toBe(null);
  });
});

// ══════════════════════════════════════════════════════════════════════════════════════════════
// CA-3/CA-4/CA-6 — LE SCRIPT s'execute, en SOUS-PROCESSUS, reseau NEUTRALISE (§ 1.5 du cadrage
// d'origine : `scripts/vitrine-en-ligne.mjs` est TOP-LEVEL INTEGRAL, l'IMPORTER l'executerait).
//
// Ces tests s'executent contre les fichiers REELS de CE depot (README.md, package.json,
// tauri.conf.json, fixtures/vitrine-assets.json) : seul le RESEAU est simule.
// ══════════════════════════════════════════════════════════════════════════════════════════════
const README = readFileSync(resolve(ROOT, "README.md"), "utf8");
const TABLE = lireJson("fixtures/vitrine-assets.json");
const LOCALE = lireJson("fixtures/vitrine-locale.json");
const APP = lireJson("src-tauri/tauri.conf.json").productName;
const VERSION = lireJson("package.json").version;
const TAG = tagAnnonceDe(README, `v${VERSION}`);
const NOMS = nomsAttendus(TABLE.plateformes, { app: APP, version: VERSION });
const TOUS_LES_NOMS = Object.values(NOMS);

/** Un `fetch` de substitution PARAMETRABLE par variables d'environnement : jamais de connexion
 *  sortante. Il ECRIT UN COMPTEUR D'APPELS dans un fichier — c'est le VERROU (CA-3) : sans lui, un
 *  script qui sortirait AVANT tout `fetch` satisferait un test sur le seul code de sortie. */
const STUB = `
import { writeFileSync, existsSync, readFileSync } from "node:fs";
const MODE = process.env.IAKA_STUB_MODE;
const COUNTER_FILE = process.env.IAKA_STUB_COUNTER_FILE;
const DEPOT = process.env.IAKA_STUB_DEPOT;
const TAG = process.env.IAKA_STUB_TAG;
const ASSETS = JSON.parse(process.env.IAKA_STUB_ASSETS);
const TAGS = JSON.parse(process.env.IAKA_STUB_TAGS);
function record(chemin) {
  const etat = existsSync(COUNTER_FILE)
    ? JSON.parse(readFileSync(COUNTER_FILE, "utf8"))
    : { count: 0, chemins: [] };
  etat.count += 1;
  etat.chemins.push(chemin);
  writeFileSync(COUNTER_FILE, JSON.stringify(etat));
}
globalThis.fetch = async (url) => {
  const u = new URL(url);
  const chemin = u.pathname + u.search;
  record(chemin);
  if (MODE === "network-error") throw new Error("stub : reseau indisponible (fixture)");
  if (MODE === "http-403") return { status: 403, ok: false, json: async () => ({}) };
  if (chemin === \`/repos/\${DEPOT}/releases/latest\`) {
    return { status: 200, ok: true, json: async () => ({ tag_name: TAG }) };
  }
  if (chemin.startsWith(\`/repos/\${DEPOT}/tags\`)) {
    return { status: 200, ok: true, json: async () => TAGS.map((name) => ({ name })) };
  }
  if (chemin === \`/repos/\${DEPOT}/releases/tags/\${TAG}\`) {
    return { status: 200, ok: true, json: async () => ({ assets: ASSETS.map((name) => ({ name })) }) };
  }
  return { status: 404, ok: false, json: async () => ({}) };
};
`;

function lancer({ mode, assets, tags }) {
  const dir = mkdtempSync(join(tmpdir(), "iaka-vitrine-en-ligne-"));
  const stub = join(dir, "stub-fetch.mjs");
  const compteur = join(dir, "compteur.json");
  writeFileSync(stub, STUB, "utf8");
  try {
    const r = spawnSync(process.execPath, ["--import", stub, "scripts/vitrine-en-ligne.mjs"], {
      cwd: ROOT,
      encoding: "utf8",
      env: {
        ...process.env,
        IAKA_STUB_MODE: mode,
        IAKA_STUB_COUNTER_FILE: compteur,
        IAKA_STUB_DEPOT: LOCALE.depot,
        IAKA_STUB_TAG: TAG,
        IAKA_STUB_ASSETS: JSON.stringify(assets ?? []),
        IAKA_STUB_TAGS: JSON.stringify(tags ?? []),
      },
    });
    const compte = existsSync(compteur) ? JSON.parse(readFileSync(compteur, "utf8")) : { count: 0, chemins: [] };
    return { status: r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "", compte };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("vitrine-en-ligne.mjs — le script S'EXECUTE, reseau neutralise", () => {
  it("CA-3/CA-6 — cas CONCORDE (code 0) : le stub A ETE APPELE, sur les TROIS chemins attendus", () => {
    const r = lancer({ mode: "match", assets: TOUS_LES_NOMS, tags: [TAG, "v0.0.1"] });
    expect(r.status, `sortie inattendue :\nSTDOUT:\n${r.stdout}\nSTDERR:\n${r.stderr}`).toBe(0);
    // LE VERROU : sans le compteur, un script qui sortirait avant tout `fetch` satisferait déjà le
    // code 0 si `ecarts` restait vide par défaut — ce test-ci prouve que le réseau simulé a été
    // TRAVERSÉ, pas seulement que le code de sortie tombe juste.
    expect(r.compte.count, "le script n'est jamais passe par le fetch simule").toBeGreaterThan(0);
    expect(r.compte.chemins.some((c) => c.includes("releases/latest"))).toBe(true);
    expect(r.compte.chemins.some((c) => c.includes("/tags"))).toBe(true);
    expect(r.compte.chemins.some((c) => c.includes(`releases/tags/${TAG}`))).toBe(true);
    expect(r.stdout).toContain("OK — la vitrine et l'etagere concordent");
  });

  it("CA-4 — cas ECART (code 1) : la sortie NOMME le fichier manquant, pas seulement le code", () => {
    const manquant = TOUS_LES_NOMS[0];
    const incomplet = TOUS_LES_NOMS.filter((n) => n !== manquant);
    const r = lancer({ mode: "match", assets: incomplet, tags: [TAG] });
    expect(r.status).toBe(1);
    expect(r.stderr, "le fichier manquant n'est pas nomme dans la sortie").toContain(manquant);
    expect(r.stderr).toMatch(/E-3/);
  });

  it("CA-4 — cas NON MESURE (code 3), par un `fetch` qui JETTE", () => {
    const r = lancer({ mode: "network-error", assets: TOUS_LES_NOMS, tags: [TAG] });
    expect(r.status).toBe(3);
    expect(r.stdout).toMatch(/NON MESURE/);
    expect(r.stdout).not.toMatch(/OK —/);
  });

  it("CA-4 — cas NON MESURE (code 3), par un HTTP 403 (quota anonyme)", () => {
    const r = lancer({ mode: "http-403", assets: TOUS_LES_NOMS, tags: [TAG] });
    expect(r.status).toBe(3);
    expect(r.stdout).toMatch(/NON MESURE/);
  });
});

// ══════════════════════════════════════════════════════════════════════════════════════════════
// CONTREFACTUEL DEMANDE PAR L'ORDRE DE MISSION — « retire l'assertion de SKIP → un faux vert doit
// etre detecte ». Preuve que le verrou CA-4 (code 3 = NON MESURE, jamais 0) N'EST PAS UN TEMOIN
// VIDE : sans lui, un script qui rendrait 0 sur un `fetch` en echec passerait la suite ci-dessus
// en silence. Ce bloc-ci FIXE le contrefactuel (ce que verifierait un test AMPUTE de son assertion
// de SKIP) puis ATTESTE qu'il rougit contre ce dispositif — jamais l'inverse.
// ══════════════════════════════════════════════════════════════════════════════════════════════
describe("Contrefactuel — un SKIP travesti en succes doit etre detectable", () => {
  it("CA — RETIRER L'ASSERTION DE SKIP LAISSERAIT PASSER UN FAUX VERT : formule ecrite en NEGATIF, "
    + "elle-meme geree comme un verrou", () => {
    const r = lancer({ mode: "network-error", assets: TOUS_LES_NOMS, tags: [TAG] });
    // Ceci est EXACTEMENT l'assertion qu'un test AMPUTE de son verrou de SKIP (celui du bloc
    // precedent, "cas NON MESURE (code 3), par un `fetch` qui JETTE") laisserait passer PAR ERREUR
    // s'il ne verifiait que l'absence de crash — par exemple `expect(r.status).not.toBe(1)`, qui
    // resterait vrai meme si le script rendait 0. Ecrite ici en NEGATIF, elle EST le contrefactuel
    // demande : si un jour le SKIP se travestissait en succes (code 0 ET/OU texte `OK —` a cote de
    // `NON MESURE`), CE test rougit lui-meme, nommement — il ne se contente pas de dupliquer le cas
    // nominal du bloc precedent, il verrouille le COUPLE code+texte contre une regression future.
    const seraitUnFauxVertSiVrai = r.status === 0 && r.stdout.includes("OK —");
    expect(seraitUnFauxVertSiVrai, "un SKIP ne doit JAMAIS produire un succes").toBe(false);
    // Le double-verrou : code ET texte disent la meme chose, jamais un `OK —` a cote de `NON MESURE`.
    expect(r.status).toBe(3);
    expect(r.stdout).toMatch(/NON MESURE/);
    expect(r.stdout).not.toMatch(/OK —/);
  });

  it("temoin de contraste : les DEUX frangins presents (mesure complete) restent verts, "
    + "jamais un SKIP muet", () => {
    // CA-C3 (forme reprise du cadrage-frere) : verrou contre le temoin VIDE — sans ce temoin
    // positif a cote du SKIP, rien ne prouverait que la clause de SKIP n'est pas devenue
    // INCONDITIONNELLE (auquel cas le cas nominal rougirait lui aussi en NON MESURE ; il ne
    // rougit pas, la mesure REELLE a bien lieu quand le reseau repond).
    const r = lancer({ mode: "match", assets: TOUS_LES_NOMS, tags: [TAG, "v0.0.1"] });
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("OK — la vitrine et l'etagere concordent");
    expect(r.stdout).not.toMatch(/NON MESURE/);
  });
});
