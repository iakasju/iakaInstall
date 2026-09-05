import { ETAPES_ANNONCEES, NB_ETAPES } from "./steps";
import { etapes34Couvertes, normaliserOs } from "./coverage";
import { usePrerequisites } from "./hooks/usePrerequisites";
import { usePlatformInfo } from "./hooks/usePlatformInfo";
import { usePilotageInstallation, type EtatPilotage } from "./hooks/usePilotageInstallation";
import EcranPilotage from "./components/EcranPilotage";
import "./App.css";

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

function SectionCouverture({ etapes }: { etapes: EtatPilotage["modele"]["etapes"] }) {
  const state = usePlatformInfo();

  // M-F6 / § 5 etape 6 — APRES un flux, la verite vient de `etape-terminee`
  // (M-C6), jamais de l'indice declaratif de coverage.ts. Une seule etape
  // (3 ou 4) deja tentee suffit a trancher : ni l'une ni l'autre ne sont
  // refusees/echouees => couvert ; sinon => refuse, avec le detail RECU.
  const etape3 = etapes[3];
  const etape4 = etapes[4];
  const etatFlux = etape3?.etat ?? etape4?.etat ?? null;
  if (etatFlux) {
    const refuse = etatFlux === "refusee" || etatFlux === "echouee";
    const detail = etape3?.detail ?? etape4?.detail ?? null;
    return (
      <p className={refuse ? "couverture-refus" : "couverture-ok"}>
        D'après le flux, les étapes 3 et 4 sont {refuse ? "REFUSÉES" : "couvertes"}
        {detail ? ` (${detail})` : ""}.
      </p>
    );
  }

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
  const pilotage = usePilotageInstallation();

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
            <span className="etape-compteur" aria-hidden="true">
              {"●".repeat(etape.n)}
              {"○".repeat(NB_ETAPES - etape.n)}
            </span>
            <strong>
              Étape {etape.n} sur {NB_ETAPES} — {etape.nom}
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
        <SectionCouverture etapes={pilotage.modele.etapes} />
      </section>

      <section aria-label="lancement">
        {pilotage.phase === "avant-tout-flux" && (
          <button type="button" onClick={pilotage.lancerApercu}>
            Voir ce qui sera fait (aperçu)
          </button>
        )}
        {pilotage.peutLancerReel && (
          <button type="button" onClick={pilotage.lancerReel}>
            Lancer l'installation
          </button>
        )}
      </section>

      <EcranPilotage etat={pilotage} />
    </main>
  );
}
