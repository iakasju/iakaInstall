import { ETAPES_ANNONCEES, NB_ETAPES } from "./steps";
import { etapes34Couvertes, normaliserOs } from "./coverage";
import { usePrerequisites } from "./hooks/usePrerequisites";
import { usePlatformInfo } from "./hooks/usePlatformInfo";
import "./App.css";

const CAUSE_DESARMEMENT =
  "Le lancement est desactive : le moteur d'installation ne fournit pas encore, " +
  "aujourd'hui, de moyen pour un programme de valider chaque etape sans terminal. " +
  "Cette application n'installe rien pour l'instant — elle annonce ce qu'elle fera " +
  "une fois ce prerequis livre (successeur CONTRAT-MACHINE-DU-VERBE-INSTALL).";

function SectionPrerequis() {
  const state = usePrerequisites();

  if (state.status === "chargement") {
    return <p className="prereq-ligne">Verification des prerequis…</p>;
  }
  if (state.status === "erreur") {
    return (
      <p className="prereq-ligne prereq-absent">
        Impossible de verifier les prerequis ({state.message}).
      </p>
    );
  }

  const { node, npm } = state.report;
  return (
    <ul className="prereq-liste">
      <li className={node.present ? "prereq-present" : "prereq-absent"}>
        Node.js : {node.present ? `present (${node.version ?? "version inconnue"})` : "absent"}
      </li>
      <li className={npm.present ? "prereq-present" : "prereq-absent"}>
        npm : {npm.present ? `present (${npm.version ?? "version inconnue"})` : "absent"}
      </li>
    </ul>
  );
}

function SectionCouverture() {
  const state = usePlatformInfo();

  if (state.status === "chargement") {
    return <p>Detection de la plateforme…</p>;
  }
  if (state.status === "erreur") {
    return <p className="prereq-absent">Impossible de detecter la plateforme ({state.message}).</p>;
  }

  const famille = normaliserOs(state.info.os);
  const couverte = etapes34Couvertes(famille);

  return (
    <p className={couverte ? "couverture-ok" : "couverture-refus"}>
      Sur cette machine ({state.info.os} / {state.info.arch}), les etapes 3 et 4 (IakaCockpit,
      iakaFrameGUI) sont {couverte ? "couvertes." : "REFUSEES : seule macOS est couverte aujourd'hui."}
    </p>
  );
}

export default function App() {
  return (
    <main className="ecran-annonce">
      <h1>iakaInstall</h1>
      {/* Le texte est litteral (grep CA-I9) ; l'invariant NB_ETAPES===4 /
          NB_TELECHARGEMENTS===3 est garde par un test qui rougirait si
          steps.ts derivait (src/__tests__/comptage-ar-a.test.tsx). */}
      <p className="comptage">4 étapes / 3 téléchargements</p>

      <ol className="liste-etapes">
        {ETAPES_ANNONCEES.map((etape) => (
          <li key={etape.n}>
            <strong>
              [{etape.n}/{NB_ETAPES}] {etape.nom}
            </strong>
            <p>{etape.quoi}</p>
            <p>
              <em>Où :</em> {etape.ou}
            </p>
            <p>
              <em>Fusion :</em> {etape.fusionne}
            </p>
          </li>
        ))}
      </ol>

      <section aria-label="prerequis">
        <h2>Prérequis détectés</h2>
        <SectionPrerequis />
      </section>

      <section aria-label="couverture">
        <h2>Couverture réelle de cette machine</h2>
        <SectionCouverture />
      </section>

      <section aria-label="lancement">
        <button type="button" disabled>
          Lancer l'installation
        </button>
        <p className="cause-desarmement">{CAUSE_DESARMEMENT}</p>
      </section>
    </main>
  );
}
