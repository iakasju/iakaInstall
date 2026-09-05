import type { EtatPilotage } from "../hooks/usePilotageInstallation";
import type { EtapeVue } from "../events/modele";

/**
 * EcranPilotage.tsx — rend le modele de vue (§ 5 etape 5). AUCUN champ
 * recompose : tout ce qui est affiche est un champ RECU (R3). Ce fichier
 * est le SEUL, avec src/events/*, a nommer le champ `rollback` du contrat
 * machine (fixtures/vocabulaire-interdit.json, hors-couverture motivee) —
 * il le rend INTEGRALEMENT (AR-5, garde 3), il ne le reimplemente pas.
 */

function BlocAnnonce({ etape }: { etape: EtapeVue }) {
  const { annonce } = etape;
  if (!annonce) return null;
  return (
    <div className="annonce-etape">
      <p>
        <strong>Étape {annonce.etape}</strong> — {annonce.quoi}
      </p>
      <p>
        <em>Où :</em> {annonce.ou}
      </p>
      <p>
        <em>Version :</em> {annonce.version}
      </p>
      <p>
        <em>Ce qui sera fusionné :</em> {annonce.ceQuiSeraFusionne}
      </p>
      {annonce.sourceRetenue != null && (
        <p>
          <em>Source retenue :</em> {JSON.stringify(annonce.sourceRetenue)}
        </p>
      )}
      {annonce.sourcesConsultees.length > 0 && (
        <p>
          <em>Sources consultées :</em> {JSON.stringify(annonce.sourcesConsultees)}
        </p>
      )}
    </div>
  );
}

function BlocDecision({
  numero,
  etape,
  onRepondre,
}: {
  numero: number;
  etape: EtapeVue;
  onRepondre: (etape: number, reponse: "oui" | "non") => void;
}) {
  // CA-P6 : ce bloc n'existe QUE si l'annonce de CETTE etape a deja ete
  // recue ET qu'une demande de feu vert est en cours (les deux tiennent
  // deja par construction du reducteur : `demandeFeuVertEnCours` ne peut
  // etre pose que si `annonce` existe deja).
  if (!etape.demandeFeuVertEnCours || !etape.annonce) return null;
  return (
    <div className="bloc-decision" role="group" aria-label={`décision étape ${numero}`}>
      <BlocAnnonce etape={etape} />
      <p className="question-feu-vert">{etape.demandeFeuVertEnCours.question}</p>
      <button type="button" onClick={() => onRepondre(numero, "oui")}>
        Oui
      </button>
      <button type="button" onClick={() => onRepondre(numero, "non")}>
        Non (arrêter)
      </button>
    </div>
  );
}

function BlocEtapesTerminees({ etape }: { etape: EtapeVue }) {
  if (!etape.annonce) return null;
  return (
    <li className={`etape-vue etape-${etape.etat ?? "en-attente"}`}>
      <BlocAnnonce etape={etape} />
      {etape.etat && (
        <p className="etat-etape">
          <em>État :</em> {etape.etat}
          {etape.detail ? ` — ${etape.detail}` : ""}
        </p>
      )}
    </li>
  );
}

function BlocJournal({ logs }: { logs: EtatPilotage["modele"]["logsDelegues"] }) {
  if (logs.length === 0) return null;
  return (
    <details className="journal-delegue">
      <summary>Journal détaillé ({logs.length} lignes)</summary>
      <ul>
        {logs.map((l, i) => (
          <li key={i} className={`log-${l.flux}`}>
            [étape {l.etape}] [{l.flux}] {l.ligne}
          </li>
        ))}
      </ul>
    </details>
  );
}

function BlocRollback({ rollback }: { rollback: NonNullable<EtatPilotage["modele"]["rollback"]> }) {
  return (
    <section aria-label="rollback" className="bloc-rollback">
      <h3>Retour arrière</h3>
      <p>{rollback.resume}</p>
      <p>
        <em>Défaits :</em> {JSON.stringify(rollback.defaits)}
      </p>
      <p>
        <em>Non défaits :</em> {JSON.stringify(rollback.nonDefaits)}
      </p>
      <p>
        <em>Rapports :</em> {JSON.stringify(rollback.rapports)}
      </p>
    </section>
  );
}

function BlocFin({ fin }: { fin: NonNullable<EtatPilotage["modele"]["fin"]> }) {
  return (
    <section aria-label="fin" className={fin.ok ? "fin-ok" : "fin-echec"}>
      <h3>{fin.ok ? "Terminé" : "Arrêté"}</h3>
      {fin.error && <p className="fin-erreur">{fin.error}</p>}
      <p>
        Dernière étape tentée : {fin.etatAtteint.derniereEtapeTentee ?? "aucune"} — étapes faites :{" "}
        {fin.etatAtteint.etapesFaites.join(", ") || "aucune"} — étapes non tentées :{" "}
        {fin.etatAtteint.etapesNonTentees.join(", ") || "aucune"}
      </p>
      {fin.reprise && (
        <p>
          <em>Commande de reprise :</em> <code>{fin.reprise}</code>
        </p>
      )}
    </section>
  );
}

export default function EcranPilotage({ etat }: { etat: EtatPilotage }) {
  const { modele } = etat;
  if (!modele.debut) return null;

  if (modele.incompatibiliteVersion) {
    // CA-P9 : refus explicite, les DEUX valeurs nommees — rien d'autre ne
    // s'affiche (l'ecran refuse de continuer).
    return (
      <section aria-label="refus-version" className="refus-version">
        <h2>Version incompatible</h2>
        <p>
          Ressource embarquée en <code>{modele.incompatibiliteVersion.attendue}</code>, mais le
          processus lancé annonce <code>{modele.incompatibiliteVersion.recue}</code>. Installation
          refusée.
        </p>
      </section>
    );
  }

  const numerosEtapes = Object.keys(modele.etapes)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <section aria-label="pilotage" className="ecran-pilotage">
      {modele.provenance && <p className="provenance">{modele.provenance}</p>}

      {numerosEtapes.map((n) => {
        const etape = modele.etapes[n];
        if (!etape) return null;
        return (
          <div key={n}>
            <BlocDecision numero={n} etape={etape} onRepondre={etat.repondre} />
            {!etape.demandeFeuVertEnCours && (
              <ul className="liste-etapes-vue">
                <BlocEtapesTerminees etape={etape} />
              </ul>
            )}
          </div>
        );
      })}

      <BlocJournal logs={modele.logsDelegues} />

      {modele.rollback && <BlocRollback rollback={modele.rollback} />}
      {modele.fin && <BlocFin fin={modele.fin} />}

      {etat.phase.endsWith("en-cours") && (
        <p className="derniers-recours">
          <button type="button" onClick={etat.forcerArret}>
            Forcer l'arrêt (dernier recours)
          </button>{" "}
          — court-circuite le retour arrière du moteur : des traces peuvent rester non défaites.
        </p>
      )}

      {etat.ligneNonJson.length > 0 && (
        <p className="lignes-non-json">
          {etat.ligneNonJson.length} ligne(s) non JSON reçue(s) — signalées, jamais ignorées en silence.
        </p>
      )}

      {etat.erreurLancement && <p className="erreur-lancement">{etat.erreurLancement}</p>}
    </section>
  );
}
