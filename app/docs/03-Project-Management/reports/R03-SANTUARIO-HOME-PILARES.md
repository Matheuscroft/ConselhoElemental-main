# Santuário como home e exploração de Pilares — 0.1.41

22/10/2026, America/Recife. Checkout principal; branch `codex/fitness-ui-integration`, base `f07292f`. Astro Boy executou, revisou código e registrou continuidade sequencialmente. Alterações I03/R01–R04 anteriores preservadas. Fila única em [FILA-ENTREGAS.md](../../FILA-ENTREGAS.md).

## Decisão e escopo

O usuário aprovou a composição com personagem/órbita e pediu que substituísse a home antiga. A autorização atual permite a promoção local, superando a espera descrita nos registros históricos; não equivale a QA renderizado do executor. A captura fornecida mostra a antiga prévia, com faixa informativa, cabeçalho e identidade ocupando muito espaço antes do personagem. Ela orientou a compactação; não foi fornecida captura de Pilares neste lote.

Paleta e fontes aprovadas mantidas (obsidiana, dourado, Cinzel/Inter e acentos elementais). Personagem/órbita continuam protagonistas. O cabeçalho compacto permanece acessível durante a rolagem. Pilares separa leitura do equilíbrio e exploração dos elementos, sem repetir quatro cartões de detalhe e um modal.

## Implementação e preservação funcional

- `/santuario` agora apresenta a composição elemental. `/santuario/elementos/:elementId` é o destino canônico. Links `/previa-elemental` e seus elementos redirecionam com substituição do histórico, preservando consultas/filtros. Elemento inválido continua exibindo recuperação para os quatro elementos.
- Home clássica preservada em `/santuario/classico`, acessível no rodapé. Arquivo antigo intacto. A home principal mantém criação de ritual, Cassino, Grimório, módulos e menu global de busca.
- `TopBar accountOnly` reutiliza o botão e todo o diálogo existente de conta. Hooks, handlers de conta/auth/calendário e conteúdo do diálogo foram comparados com a cópia anterior e permaneceram idênticos. Não há uma nova implementação de conta.
- HP volta à apresentação com a mesma expressão existente em CharacterStage; XP, nível, Stamina e Prana continuam provenientes dos getters existentes. Nenhuma fórmula de domínio alterada.
- `SanctuaryRituals` mostra quatro pendências e a sessão atual. Abrir o mesmo ritual preserva seu tempo e pausa; iniciar outro ritual, mesmo diante de sessão pausada ou HABIT, não substitui a sessão. HABIT continua pelo destino Ciclos.
- Helper `sanctuary-timer.ts` contém somente proteções da UI e delegação: `startTimer`, `pauseTimer`, `resumeTimer`, `stopTimer`, `completeTask`. Conclusão TASK usa exatamente `elapsedSeconds / 60`, como Rituais. Não calcula recompensas, não cria persistência nem outro relógio. Snapshot atual protege contra troca de conta, exclusão/conclusão externa e clique repetido. Estado local da seção é reiniciado por chave de conta. Fechar o modal não pausa, informado na própria janela.
- Um único intervalo da casca elemental continua chamando o `tickTimer` existente; o novo componente de rituais e o componente visual não criam intervalos. AppLayout não é montado junto com essa casca. Fluxo visual de pausa/retomada e transições entre cascas ainda depende do QA em navegador.
- Pilares tem resumo de equilíbrio com percentuais existentes, áreas ativas e cartões expansíveis que abrem páginas próprias. Descrições, pontuação e contagem de rituais por área estão nas páginas elementais. Áreas personalizadas passam a ser incluídas na exploração. IDs e destinos existentes mantidos; Exercício Físico continua `area-saude`, com Treinos e acesso às subáreas.
- Cabeçalho/identidade mobile foram compactados e a faixa de prévia foi removida. Os quatro elementos e controles de órbita não foram redesenhados neste lote. Foco, botões semânticos e rótulos são verificações de código, não aceite visual.

## Arquivos do lote

`src/App.tsx`, `src/components/layout/TopBar.tsx`, `src/components/elemental/navigation.ts`, novos `SanctuaryRituals.tsx`/`sanctuary-timer.ts`, `src/pages/ElementalPreview.tsx`, `elemental-preview.css`, `Pilares.tsx`/`pilares.css`, testes de navegação e de proteção do cronômetro. Manifests, changelog e documentação atualizados.

## Evidências executadas

- `npx tsc -b`: passou.
- ESLint delimitado aos sete arquivos TS/TSX do lote: passou sem erros nem avisos.
- `node --test tests/elemental/*.test.mjs`: 19/19 passaram. Sete testes de navegação/filtros/redirect em memória; seis de delegação/proteções do cronômetro com owner descartável; três de apresentação SSR/callbacks; três numéricos de materiais. Não usam perfil ou dados reais, não testam persistência remota nem renderização no navegador.
- Build Vite pela API com `envDir:false`: passou, com avisos de Browserslist e chunks grandes. Sem leitura de secrets pelo comando de build.
- SHA-256: 63 arquivos de stores, tipos, constantes, bibliotecas, serviços e Supabase local idênticos à linha de base deste lote. Hooks/handlers e diálogo de conta em TopBar idênticos. Artefatos locais `/tmp/r041-domain-before.json` e `/tmp/r041-preservation.json`.
- Diff-check, espaços finais/conflitos dos novos arquivos, versões dos três campos de manifests e links documentais conferidos no fechamento.

## Limites e próximo passo

A preferência salva do navegador continuava bloqueando localhost no último teste. Neste lote não houve nova tentativa nem contorno. Não executados: screenshots do produto, matriz 360/390/768/1440, hitboxes, navegação por teclado renderizada, troca real de conta, ciclo de cronômetro na UI, FPS ou auditoria de contraste renderizado. A captura e o aceite do usuário são evidências de direção visual, não substituem essas verificações.

Próximo: validar home/Pilares nas quatro larguras quando o acesso efetivo estiver disponível; conferir conta, redirects, pausa/fechamento/retomada/conclusão e navegação entre cascas sem duplicação de tick. Continuar acabamento das famílias R04–R08 e avaliar variantes menores dos assets, sem alterar seus originais ou a identidade aprovada. Cronômetro Fitness e execução avançada de Ciclos seguem preservados.

Sem backend, dados, regras de pontuação, secrets, migrações, dependências novas, deploy, commit ou push. Revisão documental pelo coordenador; revisão independente e aceite visual final pendentes.
