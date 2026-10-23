# R08 — Cabeçalhos, Santuário e criação de Ciclos / 0.1.45

22/10/2026. Astro Boy, execução e revisão sequenciais no checkout principal, branch `codex/fitness-ui-integration`, base `f07292f`. Pedido baseado nas três capturas do usuário (14:45–14:50): aposentar Santuário clássico, melhorar expansão de datas e formulários, substituir barra superior antiga nas áreas gerais. Sem publicação.

## Diagnóstico e decisão

As capturas mostram a versão anterior do calendário e o diálogo de criação, além de uma barra superior com título duplicado, emoji de mago e sino. A inspeção confirmou que o sino não tinha callback e exibia um indicador fixo. A seleção de uma data também deslocava o centro da janela para essa data, reconstruindo a faixa a cada escolha: isso dificultava perceber a expansão do cartão. Não houve reprodução do defeito em navegador nesta etapa; a conclusão parte do código e do relato do usuário.

Aplicada a direção visual já aprovada: obsidiana, superfície azul escura, ouro, Cinzel em títulos e Inter em controles. Marca do Conselho e navegação funcional no cabeçalho; dia selecionado expande em seu lugar; criação apresenta nome, início e frequência numa composição única. Não atribuir fidelidade visual ou fluidez medida a essa revisão estática.

## Mudanças

- **Santuário definitivo:** removidos link clássico, página `Santuario.tsx`, seu export, `CharacterStage.tsx` exclusivo e respectivo bloco CSS em index.css. `/santuario/classico` redireciona com replace para `/santuario`; links salvos não abrem mais a UI antiga. Rodapé leva ao Mapa. Recursos compartilhados como AuraAvatar3D continuam onde ainda são usados. Nenhum dado, inventário, getter ou regra de domínio apagado.
- **Cabeçalho compartilhado:** novo ElementalTopBar com marca que volta à home, contexto da página, Explorar conectado ao AllRoutesSheet e conta com selo vetorial. Voltar e rightAction preservados. Título continua disponível para tecnologia assistiva no mobile, sem repetir visualmente o título da página. Removidos sino sem ação e indicador fictício. TopBar atende às páginas com AppLayout; Fitness não recebeu alterações. Conta na home também usa o selo, sem modificar avatar salvo.
- **Calendário:** escolher um dia altera somente a seleção, mantendo a janela visível estável; setas ainda deslocam sete dias, calendário completo/Hoje ainda reposicionam a janela. Cartão declara expansão e revela até dois nomes reais da rotina, além das contagens existentes. Centralização continua restrita à rolagem horizontal; movimento reduzido permanece respeitado no CSS. Sem inferir ciclos, recompensas ou classificação por elemento.
- **Criação:** CycleCreationForm controlado para ciclos/sequências, prévia do nome e início, campo com rótulo visível, dias em fieldset e ações no rodapé. Último dia selecionado fica desabilitado para refletir a proteção já existente. Tipo de sequência conserva ANY/WORKOUT. Submit nativo/Enter chama o handler existente; cancelar não grava. Ciclo criado retorna à Rotina e limpa filtros da apresentação. Diálogos retornam foco aos botões de criação.
- **Edição e detalhes:** criação/edição usam painel inferior no mobile e superfície elemental no desktop. Campos, seções e membros recebem acabamento comum; operações de adicionar/remover/reordenar, regras de agregadores, pontuação e tempo continuam intactas. Botões de reordenar/remover membros ganham nome acessível. Texto informa que os controles da sequência salvam imediatamente, comportamento anterior preservado.

Os componentes novos só apresentam estado e chamam callbacks. Não foi criado um motor de hábitos, armazenamento, modelo de pontuação ou serviço paralelo. A fonte canônica consultada foi o índice docs-conselho-master e o capítulo de Ações e Hábitos; não houve tentativa de reconciliar divergências históricas do modelo nesta entrega visual.

## Verificações executadas

- `npx tsc -b`: passou.
- ESLint delimitado em Ciclos, TopBar, ElementalTopBar, componentes cycles, App e ElementalPreview: zero erros, dois avisos anteriores de hooks em Ciclos, sem supressão.
- `node --test tests/cycles/*.test.mjs tests/elemental/*.test.mjs tests/temporal/*.test.mjs`: 49/49 testes. Oito casos novos cobrem submit/whitespace/cancelar/edição de campo, dias e proteção do último, composição de sequência, ações do cabeçalho/selo, conteúdo do cartão expandido e seleção real de data atravessando o ano sem recentrar a janela. Testes de unidade/SSR/navegação em memória; nenhum browser ou conta real foi usado. Uma asserção do SVG inicialmente esperava booleano em vez do texto ARIA válido; corrigida no teste.
- Build Vite via API com `envDir:false`: passou, última execução em 17,88 s. Avisos existentes de Browserslist e chunks grandes permanecem. Não é medição de performance no dispositivo.
- SHA-256: 64 arquivos de stores/lib/constants/services/types/Supabase idênticos ao início do lote. AST: 59 de 60 funções nomeadas sem JSX de Ciclos idênticas; única alteração é `selectRelativeVisibleDay`, exclusivamente estado visual. Bloco de composição/conclusão/ordenação preservado. Diálogo de conta idêntico byte a byte, operações de conta preservadas; home alterada somente no link do rodapé.
- Diff-check passou. Package e as duas versões do lockfile sincronizados em 0.1.45. Sem dependências novas.

Evidências temporárias: `/tmp/r045-before.json`, `/tmp/r045-preserve.cjs`, `/tmp/r045-{tests,tsc,lint,build}.log` e cópias iniciais em `/tmp/r045-*.tsx`. Podem não existir em outra máquina/sessão. A revisão React delimitada conferiu componentes controlados, labels, estado derivado e separação das operações existentes.

## Limites e próximo passo

As imagens fornecidas são evidência da versão anterior; não são QA visual do resultado deste lote. O bloqueio salvo de acesso ao app local já foi retornado pela ferramenta em etapa anterior. Nesta etapa não houve nova tentativa nem contorno por outra superfície, porta ou execução indireta.

Pendente: validar 360/390/768/1440, teclado virtual, safe area, foco após fechar os painéis, seleção de datas por toque/teclado, frequência e filtros na criação real, edição com agregadores, membros da sequência e integração com Fitness. Também conferir Explorar, voltar, rightAction e conta em consumidores do cabeçalho. Não declarar todos os fluxos ou toda a repaginação aceitos. Usuário aprovou Showcase anterior e direção da home; este resultado aguarda revisão visual.

Preservados backend, dados e regras de Matheus. Sem secrets, migração, deploy, commit ou push. Reservas encerradas; continuidade atualizada pelo coordenador, revisão independente pendente.
