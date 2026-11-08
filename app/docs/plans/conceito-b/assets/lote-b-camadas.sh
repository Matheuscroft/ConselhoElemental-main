#!/bin/bash
# Lote B — camadas de produção do Despertar Elemental (M11).
# Gera a placa-base (sem Sol e sem Lua) e o sprite da Lua a partir da arte original
# do conceito A. Sol e Lua passam a ser posicionados em tempo de execução pelo app.
#
# Uso: bash lote-b-camadas.sh [base.png] [pasta-de-saida]
# Notas de ffmpeg: geq exige format=gbrp (com rgb24 a saída sai branca);
# fontes "color=" precisam de :d=1 e a saída de -frames:v 1 -update 1.
set -e
BASE="${1:-$HOME/.codex/generated_images/01a15a72-aaea-73f2-ab5c-961629c8b9dd/exec-bd0e6139-b962-4d0d-ab2a-3a8c5f156c49.png}"
OUT="${2:-.}"

# Cancelamento do halo da Lua original, centrada em (768,100)
HD='hypot(X-768,Y-100)'
HC="(1-0.34*exp(-pow(${HD}/95,2))-0.11*exp(-pow(${HD}/175,2)))"
# Realce do ar e da terra
AIR='hypot((X-760)/115,(Y-575)/105)'
EA='hypot((X-320)/150,(Y-300)/130)'
# Vinheta e escurecimento do terço inferior (faixa dos controles)
V='(1-0.52*clip((Y-1180)/356,0,1))*(1-0.34*clip((hypot((X-512)/660,(Y-700)/920)-0.72)/0.6,0,1))'
# Queda radial do sprite da Lua (170x170, centro em 85,85)
M='clip(1.35-1.65*hypot((X-85)/85,(Y-85)/85),0,1)'

echo "[1/2] placa-base.png (sem Sol e sem Lua)"
ffmpeg -y -v error -i "$BASE" -filter_complex "
[0:v]format=gbrp,split=2[s0][s1];
[s0]geq=r='r(X,Y)*${HC}':g='g(X,Y)*${HC}':b='b(X,Y)*${HC}',format=gbrp[h];

[s1]crop=170:170:440:20,gblur=sigma=45,format=rgba[psrc];
color=c=black:s=170x170:d=1,format=gray,geq=lum='255*clip((1-hypot((X-85)/85,(Y-85)/85))/0.22,0,1)'[pmask];
[psrc][pmask]alphamerge[patch];
[h][patch]overlay=683:13,format=gbrp[b1];

color=c=black:s=1024x1536:d=1,format=gbrp,
geq=r='255*(0.24*exp(-pow(${AIR},2))+0.06*exp(-pow(${EA},2)))':
    g='255*(0.28*exp(-pow(${AIR},2))+0.14*exp(-pow(${EA},2)))':
    b='255*(0.29*exp(-pow(${AIR},2))+0.07*exp(-pow(${EA},2)))'[lift];
[b1][lift]blend=all_mode=screen,format=gbrp[b2];

[b2]eq=contrast=1.07:saturation=1.10,format=gbrp,
geq=r='r(X,Y)*${V}':g='g(X,Y)*${V}':b='b(X,Y)*${V}'[out]
" -map "[out]" -frames:v 1 -update 1 "$OUT/placa-base.png"

echo "[2/2] sprite-lua.png (RGB sobre preto, para blend screen)"
ffmpeg -y -v error -i "$BASE" -filter_complex "
[0:v]format=gbrp,crop=170:170:683:15,
geq=r='r(X,Y)*${M}':g='g(X,Y)*${M}':b='b(X,Y)*${M}',format=gbrp[out]
" -map "[out]" -frames:v 1 -update 1 "$OUT/sprite-lua.png"

echo "pronto"
