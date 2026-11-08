set -e
# A arte original do conceito A, versionada ao lado dos scripts. Antes isto
# era um base.png solto no diretório de trabalho, vindo de um cache fora do
# repositório: a composição não era refazível em outra máquina.
BASE="${1:-$(cd "$(dirname "$0")" && pwd)/assets/original-conceito-a.png}"
HD='hypot(X-768,Y-100)'
HC="(1-0.34*exp(-pow(${HD}/95,2))-0.11*exp(-pow(${HD}/175,2)))"
D='hypot(X-855,Y-632)'
AIR='hypot((X-760)/115,(Y-575)/105)'
EA='hypot((X-320)/150,(Y-300)/130)'
V='(1-0.52*clip((Y-1180)/356,0,1))*(1-0.34*clip((hypot((X-512)/660,(Y-700)/920)-0.72)/0.6,0,1))'
M='clip(1.35-1.65*hypot((X-85)/85,(Y-85)/85),0,1)'
ffmpeg -y -v error -i "$BASE" -filter_complex "
[0:v]format=gbrp,split=3[s0][s1][s2];
[s0]geq=r='r(X,Y)*${HC}':g='g(X,Y)*${HC}':b='b(X,Y)*${HC}',format=gbrp[h];

[s1]crop=170:170:440:20,gblur=sigma=45,format=rgba[psrc];
color=c=black:s=170x170:d=1,format=gray,geq=lum='255*clip((1-hypot((X-85)/85,(Y-85)/85))/0.22,0,1)'[pmask];
[psrc][pmask]alphamerge[patch];
[h][patch]overlay=683:13,format=gbrp[b1];

[s2]crop=170:170:683:15,format=gbrp,
geq=r='r(X,Y)*${M}':g='g(X,Y)*${M}':b='b(X,Y)*${M}',
pad=1024:1536:320:30:color=black,format=gbrp[moonlayer];
[b1][moonlayer]blend=all_mode=screen,format=gbrp[b2];

color=c=black:s=1024x1536:d=1,format=gbrp,
geq=r='255*min(1,clip((23-${D})/5,0,1)+0.85*exp(-pow(${D}/88,2))+0.34*exp(-pow(${D}/230,2)))':
    g='255*min(1,0.97*clip((23-${D})/5,0,1)+0.66*exp(-pow(${D}/88,2))+0.22*exp(-pow(${D}/230,2)))':
    b='255*min(1,0.88*clip((23-${D})/5,0,1)+0.32*exp(-pow(${D}/88,2))+0.09*exp(-pow(${D}/230,2)))'[sunlayer];
[b2][sunlayer]blend=all_mode=screen,format=gbrp[b3];

color=c=black:s=1024x1536:d=1,format=gbrp,
geq=r='255*(0.24*exp(-pow(${AIR},2))+0.06*exp(-pow(${EA},2)))':
    g='255*(0.28*exp(-pow(${AIR},2))+0.14*exp(-pow(${EA},2)))':
    b='255*(0.29*exp(-pow(${AIR},2))+0.07*exp(-pow(${EA},2)))'[lift];
[b3][lift]blend=all_mode=screen,format=gbrp[b4];

[b4]eq=contrast=1.07:saturation=1.10,format=gbrp,
geq=r='r(X,Y)*${V}':g='g(X,Y)*${V}':b='b(X,Y)*${V}'[out]
" -map "[out]" -frames:v 1 -update 1 conceito-c.png
