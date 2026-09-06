# iakaInstall

**iakaInstall** est l'application d'installation de bureau de la suite **iaka** : une façade
Tauri qui pose, via une interface graphique, le CLI `@naonedge/iakaframe` (verbe `install`) sur
le poste de l'utilisateur — jamais une seconde implémentation de sa logique. Elle sonde les
prérequis (Node/npm), annonce ce qui va être posé, puis pilote la chaîne réelle du CLI (feux
verts par étape, journal, retour arrière) jusqu'à sa fin.

4 étapes / 3 téléchargements

## Ce que fait — et ne fait pas — l'installeur (`.dmg` / `.msi`)

Le `.dmg` et le `.msi` **posent** l'application d'installation ; c'est **elle** qui enchaîne les
quatre étapes. Ni un DMG ni un MSI ne peuvent enchaîner : un DMG n'exécute rien, et Windows
Installer n'exécute qu'un seul MSI à la fois (les installations imbriquées sont dépréciées et
déconseillées pour le public par Microsoft). **Ils amorcent ce qui enchaîne.**

## Installation

<!-- vitrine:debut:binaires -->
La version scellée courante est **[v0.1.2](https://github.com/iakasju/iakaInstall/releases/tag/v0.1.2)** — voir
[toutes les versions](https://github.com/iakasju/iakaInstall/releases).

### Binaires prêts à l'emploi

Tous les systèmes sont couverts. Prenez le fichier de votre plateforme sur la
[page de la release](https://github.com/iakasju/iakaInstall/releases/tag/v0.1.2) :

| Système | Fichier à télécharger |
|---|---|
| **Windows (installeur)** | `iakaInstall_0.1.2_x64-setup.exe` |
| **Windows (MSI)** | `iakaInstall_0.1.2_x64_en-US.msi` |
| **macOS Apple Silicon** | `iakaInstall_0.1.2_aarch64.dmg` |
| **macOS Intel** | `iakaInstall_0.1.2_x64.dmg` |
| **Linux (Debian/Ubuntu)** | `iakaInstall_0.1.2_amd64.deb` |
| **Linux (Fedora/RHEL)** | `iakaInstall-0.1.2-1.x86_64.rpm` |
| **Linux (portable)** | `iakaInstall_0.1.2_amd64.AppImage` |
<!-- vitrine:fin:binaires -->

<!-- vitrine:debut:securite -->
### Sécurité — ce que cette version ne signe pas (encore)

Les binaires ci-dessus **existent** — ce n'est pas une plateforme manquante, c'est une
étape de signature non encore posée. Chaque absence est déclarée, datée et levable :

> **⚠️ Non signé — macOS — notarisation Apple, depuis 2026-09-05.**
> Aucun certificat Apple Developer ID ni adhésion au Apple Developer Program (99 $/an) : les bundles macOS (`.dmg`) ne portent qu'une signature AD HOC. Mesuré sur l'asset RÉEL de la release v0.1.1 le 2026-09-05 (`iakaInstall_0.1.1_aarch64.dmg`, téléchargé, monté, `codesign -dv --verbose=4` : `Signature=adhoc`, `TeamIdentifier=not set` ; `spctl -a -vv` : rejeté, exit non nul). Confirmé côté fabrication : `.github/workflows/release.yml` ne pose aucun secret `APPLE_*`, `src-tauri/tauri.conf.json` ne porte aucune section `bundle.macOS`.
>
> **Levée :** Adhésion Apple Developer Program acquise ET secrets `APPLE_CERTIFICATE`/`APPLE_CERTIFICATE_PASSWORD` (plus `APPLE_ID`/`APPLE_PASSWORD`/`APPLE_TEAM_ID` ou `APPLE_API_*`) posés par le décideur dans les réglages du dépôt — acte refusé aux agents. Le jour où ce câblage devient ACTIF dans `release.yml`, le cliquet offline de ce fichier force le retrait de CETTE entrée.
>
> **Procédure :** Lancer l'application : macOS affiche « Not Opened ». Aller dans Réglages Système -> Confidentialité et sécurité, trouver l'application dans la section du bas, cliquer « Ouvrir quand même », confirmer, puis s'authentifier avec le mot de passe administrateur. Ce geste doit être fait DANS L'HEURE qui suit le message, et UNE SEULE FOIS par application. Depuis macOS 15 Sequoia, c'est la SEULE voie : aucun autre geste ne contourne ce message.
>
> **⚠️ Non signé — Windows — signature de code, depuis 2026-09-05.**
> Aucun certificat de signature de code n'est posé : le `.msi` et le `.exe` (NSIS) de la release ne sont pas signés. Confirmé côté fabrication : `.github/workflows/release.yml` ne pose aucun secret de signature Windows, `src-tauri/tauri.conf.json` ne porte aucune section `bundle.windows.certificateThumbprint`.
>
> **Levée :** Certificat de signature de code acquis (idéalement EV) ET posé par le décideur — acte refusé aux agents. À dire sans le farder : un certificat NEUF ne fait PAS disparaître SmartScreen immédiatement, la réputation se construit avec le nombre d'installations dans le temps.
>
> **Procédure :** Au lancement de l'installeur, Windows affiche « Windows a protégé votre ordinateur » (Microsoft Defender SmartScreen). Cliquer « Informations complémentaires », puis « Exécuter quand même ».
<!-- vitrine:fin:securite -->

## Prérequis

Node.js et npm doivent être présents sur le poste où l'installation sera jouée : l'écran
d'annonce de l'application les sonde avant de démarrer, indépendamment l'un de l'autre, et
affiche un état par prérequis.

## Construire depuis les sources

<!-- vitrine:debut:sources -->
```bash
# 1. Recuperer l'archive de la version depuis la page des releases
#    (Assets > Source code), puis la decompresser
cd iakaInstall-0.1.2

# 2. Installer les dependances
npm ci

# 3. Lancer en developpement (necessite IAKAINSTALL_SANDBOX, voir CLAUDE.md)
npm run embarquer && npm run tauri dev

# 4. Ou produire l'executable de votre plateforme
npm run tauri build
```
<!-- vitrine:fin:sources -->
