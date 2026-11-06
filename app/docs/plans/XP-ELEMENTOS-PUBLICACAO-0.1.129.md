# T05 — XP e elementos coloridos; publicação para main — 0.1.129

06/11/2026. Astro Boy, execução/custódia sequenciais. Pedido de Fábio: redesenhar o símbolo de XP/elemento com cor/padrão do app, resolver pendências e dar push para a main indicada. Base local c0e4827; T04/0.1.128 ainda local na entrada, preservada e incluída neste pacote. Fetch/preflight confirmaram origin/main be78b1e e sem commits novos de Matheus para mesclar; main não protegida na consulta. Autorização atual cobre publicação em main, sem deploy ou SQL remoto.

## Apresentação entregue

- **XP:** medalhão original em ouro com brilho/facetas vetoriais e centro turquesa, repetido nas projeções e recibos. Nenhuma imagem externa ou dependência nova.
- **Elementos:** Terra mineral verde, Fogo laranja/dourado, Água azul/ciano e Ar azul-claro/prateado. Mesmo padrão de miniatura, gradientes SVG nativos e contorno legível. ElementIcon usa a apresentação colorida por padrão e preserva opção outline para compatibilidade.
- **Selo de XP:** valor fornecido pelo chamador, marca XP e elemento identificado por símbolo/nome. Versão compacta mantém o nome no rótulo acessível. Sem depender apenas de cor; sem animação contínua ou efeito pesado de blur.
- **Consistência:** biblioteca de treinos, criar/editar, prévia, histórico, widget integrado em Ciclos e feedback de conclusão usam o selo. RewardSummary compartilhado recebe o medalhão; os marcadores de elementos dos demais módulos herdam os símbolos coloridos pela API existente.
- **Estados preservados:** estimativa continua explicitamente estimativa; acumulado/planejado, indisponível, resultado parcial, meta superada, zero e reversão não geram novos valores. Dados/IDs/cálculos/recibos/stores permanecem os anteriores.

[Prancha dos quatro elementos e XP](evidence/xp-colorido-0.1.129/prancha.png), [SVG original](evidence/xp-colorido-0.1.129/prancha.svg). Renderização local em Sharp e inspeção dos desenhos; amostra com valor ilustrativo. Isso não é captura do app nem teste de fluidez/scroll em celular. A captura do usuário orientou o diagnóstico do selo anterior; nenhum progresso pessoal foi lido/exportado.

O símbolo de elemento identifica a natureza do XP. **Não é saldo de fragmentos**, nem implementação de inventário. F6/conta pessoal, associação do progresso e fragmentos continuam pendentes.

## Correção adicional — ícone da atividade criada

A captura enviada na continuação mostrou um treino cadastrado em Ciclismo com halter. Causa no código: o cartão tentava obter foco muscular e usava musculação como fallback. A apresentação agora prioriza a modalidade salva: bicicleta, nadador, corredor, kimono, Yoga, mobilidade e demais símbolos correspondentes. Nomes livres não são usados para adivinhar modalidade ou alterar dados.

Um resolvedor de apresentação compartilhado cobre biblioteca, exercícios expandidos, catálogo, editor e widget em Ciclos. Nos treinos de musculação/hipertrofia/calistenia, o foco muscular permanece quando disponível; sem foco, usa o símbolo da modalidade. Misto/personalizado mantêm sua categoria explícita. Referência de exercício ausente usa a modalidade conhecida; sem nenhuma informação, usa Misto. Ficha, histórico, execução e resumo já usavam categoria/modalidade e não precisaram dessa correção.

Dois testes de regressão cobrem todas as 12 modalidades, músculos associados em esportes, nome livre, lista vazia/ID removido, fallback desconhecido e preservação dos objetos/callbacks. Não houve migração de treinos, leitura do storage pessoal ou mudança de XP. O treino já criado será apresentado com o ícone correto ao carregar esta versão, sem precisar recriá-lo, desde que tenha a modalidade Ciclismo cadastrada.

## Pendências para publicação tratadas

1. Incluída a T04 local: fichas/editor/diálogos/controles/gráficos modernizados, com os testes e relatório preservados.
2. Versões/lock/changelog alinhados em 0.1.129; compatibilidades locais 128/129 adicionadas à cadeia de teste sem reescrever migrações anteriores ou mudar schemaVersion:1. Ambas continuam candidatas locais; não rodar db push da pasta histórica.
3. Atualizado o ponto de entrada de Matheus para main e o repasse atual; inventário inclui novos arquivos e evidências. Checagem por padrões de credenciais, nomes de paths, seleção de stage, diff e testes executados.
4. Configuração versionada desativa auto-deploy Git da branch de integração **e da main**, conforme a restrição de não fazer deploy. Outras branches mantêm seu comportamento anterior. H02 já documentou recusa 403 de metadados Vercel; não houve contorno ou comando de deploy. Release Vercel futura exige autorização e revisão dessa opção.
5. Push previsto como fast-forward, sem force, preservando backend da main. Hash efetivo/ref remota/estado do PR #1 serão registrados após publicação. Até isso ocorrer, estas alterações são locais.

## Verificações

**674 testes completos passaram**, zero falhas/pulados, concorrência 4 (65,74s), após a correção de modalidade. Nove testes direcionados de identidade/modalidades/catálogo passaram (0,45s); os direcionados anteriores de símbolos/recibos/navegação/compatibilidade também passaram antes desta rodada. `tsc -b`, ESLint e build Vite `envDir:false` (26,33s) passaram; avisos anteriores de chunks grandes/Browserslist permanecem. Diff-check, links, valores de versão e guardas estáticos conferidos.

A comparação de fonte confirmou intactos os blocos de cálculo de valor/progresso de RewardSummary e de XP/estado do widget. A mudança do widget move somente a formatação já existente para um nome local e troca a apresentação. Stores/tipos/catálogos/helpers de cálculo e migrações anteriores estão preservados por SHA.

Dois testes novos verificam IDs/referências dos gradientes em múltiplos símbolos na mesma árvore, nomes acessíveis/modo outline e preservação de valores formatados (frações, progresso, reversão e indisponível). O teste anterior de trilhos de elementos contava todos os IDs como painéis; foi ajustado para identificar painéis por seu prefixo, mantendo a verificação de unicidade de **todos** os IDs e de aria-controls. Não se afrouxou a regra do produto.

Loader SSR ignora imports CSS para conferir conteúdo, como esperado nesse harness; isso não comprova estilo/layout real. Os testes de UI são sintéticos, sem perfil real ou browser.

Comparações e seleção em [verificacoes.json](evidence/xp-colorido-0.1.129/verificacoes.json) e [inventário](evidence/xp-colorido-0.1.129/inventario.json). Inspeção visual do app/mobile permanece pendente por permissão salva; não houve nova tentativa/contorno.

## Backend e recebimento por Matheus

Fábio continua com frontend/mobile; Matheus com backend/documentação; Astro Boy coordena. Na raiz, com seu trabalho preservado:

```sh
git status --short
git fetch origin
git switch -c codex/backend-0-1-129 origin/main
node app/scripts/astro-boy.mjs setup --name Matheus --role backend
cd app
npm ci
```

Escolher outro nome se essa branch já existir; nunca descartar alterações locais para executar o exemplo. Ler CONTINUIDADE, FILA-ENTREGAS e este relatório, depois o [repasse estrutural H02](REPASSE-BACKEND-0.1.127.md), que descreve o conjunto anterior. Este relatório altera o destino de recebimento para main e acrescenta T04/T05; o plano H02 continua histórico.

Próximo backend: fechar F6/bootstrap/retomada, revisar compatibilidade hospedada e CAS/recibos/isolamento; só então associação pessoal com cópia e readback. Os relatórios F3–F5 registraram instalações 120/121/122, não reconsultadas aqui. Candidatos 123–129 exigem revisão do banco/histórico e guardas de hash/gate antes de eventual aplicação. Gates de conta/restauração/lembretes continuam false. Não recalcular XP, limpar storage ou aplicar SQL por inferência deste push. Publicar código não move localStorage para a conta/Vercel. GymMane continua análise, sem port/código/assets incorporados.
