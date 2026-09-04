#!/usr/bin/env bash
# sync-chartes.sh — embarque LA charte (AR-I3 : studio-clair, UNE seule, aucun
# selecteur) depuis le reservoir iakagraph. Copie RESTREINTE du geste
# d'IakaCockpit (scripts/sync-chartes.sh, pont de 23 variables) : meme
# contrat de tokens, mais UNE seule entree au lieu de dix, et le CSS s'applique
# a `:root` (pas de `data-theme` a selectionner : il n'y a rien a selectionner).
#
# Lit ~/work/iakagraph/theme/studio/clair/tokens.css et genere DEUX fichiers
# COMMITES, servis en 'self' (bundle Vite) -> CSP intacte, zero inline runtime,
# 100% offline :
#   - src/assets/chartes/chartes.css : un bloc :root{...}
#   - src/assets/chartes/manifest.ts : { id, name, swatches } — une entree
#
# Usage :
#   scripts/sync-chartes.sh
#   IAKAGRAPH_ROOT=~/work/iakagraph scripts/sync-chartes.sh
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IAKAGRAPH_ROOT="${IAKAGRAPH_ROOT:-$HOME/work/iakagraph}"
THEME_ROOT="${IAKAGRAPH_ROOT}/theme"

DEST="${HERE}/src/assets/chartes"
CSS_OUT="${DEST}/chartes.css"
MANIFEST="${DEST}/manifest.ts"

SRC="${THEME_ROOT}/studio/clair/tokens.css"
ID="studio-clair"
NAME="Studio clair"

[ -f "$SRC" ] || { echo "ERREUR: introuvable $SRC (IAKAGRAPH_ROOT?)"; exit 1; }

# Pont iakagraph -> app : "<var-app>|<var-iakagraph>". Meme contrat que les soeurs.
BRIDGE=(
  "--bg|bg-primary"
  "--surf|bg-card"
  "--surf-2|line"
  "--surf-3|bg-deep"
  "--field|bg-deep"
  "--text|text-primary"
  "--text-2|text-secondary"
  "--text-3|text-muted"
  "--accent|accent-gold"
  "--accent-2|accent-gold-light"
  "--accent-rgb|accent-rgb"
  "--on-accent|on-accent"
  "--red|red"
  "--green|green"
  "--blue|blue"
  "--orange|orange"
  "--cyan|cyan"
  "--purple|purple"
  "--r|radius-md"
  "--r-lg|radius-lg"
  "--font-sans|font-sans"
  "--font-serif|font-serif"
  "--mono|mono"
)

extract() {
  grep -oE -- "--$2 *:[^;]*" "$1" | head -1 | sed -E "s/^--$2 *: *//"
}

mkdir -p "$DEST"
echo "== sync-chartes : ${ID} depuis ${SRC} =="

{
  echo "/* chartes.css — GENERE par scripts/sync-chartes.sh. NE PAS EDITER A LA MAIN."
  echo "   UNE seule charte (AR-I3 : studio-clair), appliquee a :root — aucun"
  echo "   selecteur de charte dans cette application. Pont iakagraph -> app,"
  echo "   memes noms de variables que le contrat de tokens.css. Servi en 'self'"
  echo "   (bundle Vite) -> CSP intacte, aucun inline-style runtime. */"
  echo ""
  echo ":root {"
  for b in "${BRIDGE[@]}"; do
    app_var="${b%%|*}"; iaka_var="${b#*|}"
    val="$(extract "$SRC" "$iaka_var")"
    [ -n "$val" ] && echo "  ${app_var}: ${val};"
  done
  echo "}"
} > "$CSS_OUT"

bg="$(extract "$SRC" bg-primary)"
card="$(extract "$SRC" bg-card)"
accent="$(extract "$SRC" accent-gold)"

{
  echo "/**"
  echo " * manifest.ts — GENERE par scripts/sync-chartes.sh. NE PAS EDITER A LA MAIN."
  echo " *"
  echo " * UNE seule charte (AR-I3) : pas de selecteur, ce catalogue documente"
  echo " * simplement l'origine des tokens appliques a :root dans chartes.css."
  echo " */"
  echo "export interface CharteInfo {"
  echo "  id: string;"
  echo "  name: string;"
  echo "  /** Apercu : [fond global, carte, accent]. */"
  echo "  swatches: [string, string, string];"
  echo "}"
  echo ""
  echo "export const CHARTE_ACTIVE: CharteInfo = {"
  echo "  id: \"${ID}\","
  echo "  name: \"${NAME}\","
  echo "  swatches: [\"${bg}\", \"${card}\", \"${accent}\"],"
  echo "};"
} > "$MANIFEST"

echo "== chartes.css + manifest.ts generes dans ${DEST} =="
