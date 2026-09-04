/**
 * steps.ts — donnees DECLARATIVES de l'ecran d'annonce (AR-A : 4 etapes /
 * 3 telechargements). Ce n'est PAS une implementation de la logique
 * d'installation (AR-3) : juste ce que chaque etape FERA, OU, et ce qui sera
 * FUSIONNE, pour que l'utilisateur sache a quoi s'attendre AVANT que la
 * chaine reelle (C.2-b) existe. Aucune valeur ici ne derive d'une execution.
 */
export interface AnnonceEtape {
  n: 1 | 2 | 3 | 4;
  nom: string;
  telecharge: boolean;
  quoi: string;
  ou: string;
  fusionne: string;
}

export const ETAPES_ANNONCEES: AnnonceEtape[] = [
  {
    n: 1,
    nom: "CLI",
    telecharge: true,
    quoi: "Le programme en ligne de commande qui pilote toute la chaine.",
    ou: "Installe globalement sur la machine, reperable dans le PATH.",
    fusionne: "Une version anterieure du CLI est remplacee si celle-ci est plus recente.",
  },
  {
    n: 2,
    nom: "méthode",
    telecharge: false,
    quoi: "Le kit de methode (agents, skills, gabarits) qui accompagne le CLI.",
    ou: "Copie dans le dossier de configuration de l'outil de developpement choisi.",
    fusionne: "Fusionne avec ce qui existe deja : rien n'est ecrase sans accord.",
  },
  {
    n: 3,
    nom: "IakaCockpit",
    telecharge: true,
    quoi: "L'application de pilotage du portefeuille de projets.",
    ou: "Installee dans le dossier Applications de la machine.",
    fusionne: "Remplace une version anterieure de la meme application.",
  },
  {
    n: 4,
    nom: "iakaFrameGUI",
    telecharge: true,
    quoi: "L'application de composition des frames (methode + team + bindings).",
    ou: "Installee dans le dossier Applications de la machine.",
    fusionne: "Remplace une version anterieure de la meme application.",
  },
];

export const NB_ETAPES = ETAPES_ANNONCEES.length;
export const NB_TELECHARGEMENTS = ETAPES_ANNONCEES.filter((e) => e.telecharge).length;
