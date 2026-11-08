#!/bin/bash
# Lote B — exportação e compressão das camadas (M11).
# Requer: ffmpeg (com libsvtav1 e o muxer avif) e cwebp.
# Uso: bash lote-b-exportar.sh
set -e
C="../conceito-c-fotorrealista.png"   # conceito C inteiro, para a imagem de reserva
P="placa-base.png"                    # placa sem Sol e sem Lua
L="sprite-lua.png"                    # Lua aditiva (blend screen)

# A arte-base tem 1024 px de largura. 390 = 1x, 780 = 2x.
# 1170 (3x) exigiria arte acima de 1024 px: não é exportado para não inventar detalhe.
for W in 390 780 1024; do
  H=$(( W * 3 / 2 ))
  cwebp -quiet -q 80 -m 6 -resize $W $H "$P" -o "placa-base-${W}w.webp"
  ffmpeg -y -v error -i "$P" -vf "scale=${W}:${H}" -c:v libsvtav1 -crf 34 -frames:v 1 "placa-base-${W}w.avif" 2>/dev/null
done

# Sprite da Lua: 170 px é o tamanho nativo; o app escala conforme a largura da placa.
cwebp -quiet -q 90 -m 6 "$L" -o "sprite-lua.webp"

# Imagem estática de reserva (sem WebGL / durante o carregamento)
for W in 390 780; do
  H=$(( W * 3 / 2 ))
  ffmpeg -y -v error -i "$C" -vf "scale=${W}:${H}" -q:v 4 -frames:v 1 -update 1 "reserva-${W}w.jpg"
  cwebp -quiet -q 78 -m 6 -resize $W $H "$C" -o "reserva-${W}w.webp"
done
