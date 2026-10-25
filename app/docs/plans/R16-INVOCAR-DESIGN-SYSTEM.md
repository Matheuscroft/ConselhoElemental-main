# R16 — Invocar e design system elemental

24/10/2026 · versão 0.1.56 local · base publicada 91fa5a5 · Astro Boy sequencial.

## Direção e escopo

Fábio priorizou Invocar durante a retomada de R15 e solicitou avaliação de bibliotecas, instalação de oito skills e preparação do Sleek. O trabalho inicialmente previsto em detalhes de Jornadas/vínculos de Grandes Obras foi mantido na fila. As alterações de R15 foram preservadas.

A identidade continua magia elemental aplicada à gestão pessoal: base noturna, ouro envelhecido, Cinzel nos títulos, Inter em leitura/formulários e runas autorais. A assinatura visual de Invocar é o selo do tipo escolhido, com uma resposta breve à seleção; demais elementos ficam estáveis. Sem animações contínuas concorrentes. A tela não associa tipo de entidade a elemento arbitrariamente: o usuário continua escolhendo o elemento no segundo passo.

Paleta existente: canvas #080b12; superfície #141b27; elevada #202b3a; texto #f2efe7; secundário #aab4c4; ouro #d5b66f. Não foi criada uma segunda paleta.

## Entrega

- Seleção dos cinco tipos com radios nativos, runas, descrição e exemplos; mesma enumeração ACTION/HABIT/QUEST/PROJECT/DRAFT. Remove promessas fixas de pontos da escolha inicial, sem mudar cálculo ou payload.
- Indicador de etapas nomeadas: Escolher, Dar forma, Revisar; etapa atual semântica e foco nos títulos ao montar cada etapa (nome recebe foco na segunda).
- Campos e ações com receitas reutilizáveis, estados selecionados expostos, rótulos ligados aos campos e controle nativo de tempo com o mesmo intervalo 5–120 min/passo 5.
- Revisão mostra nome e descrição também nos quatro tipos que não são rascunho. Rascunho mantém revisão explícita antes do addDraft.
- Confirmação com runa, sem emojis genéricos; transições finitas e preferência de movimento reduzido respeitada.
- Base incremental do design system em `src/styles/elemental-design-system.css`: aplicação opt-in por `.elemental-system`, tokens de forma/tipografia/tempo, ações, campos e foco. Piloto em Invocar; não implica migração completa das outras páginas.

## Proteção de domínio

Comparação dos inicializadores AST antes/depois confirmou `handleSubmit`, `requestSuggestion` e `canProceed` idênticos. Payloads dos cinco comandos, fórmulas, retorno automático ao Santuário e consentimento/JWT/texto mínimo da IA permanecem como estavam. Sem gravação de dados durante testes.

Divergências preexistentes observadas, não corrigidas por autorização de UI: fallback de área para AREAS[0] em Ciclos/Jornadas/Obras quando “Sem categoria”; valores de pontos mostrados na revisão são calculados localmente e precisam ser confrontados com os contratos pelo backend antes de serem tratados como recompensa definitiva. O lote não valida nem altera essas regras. Matheus continua responsável pelo domínio.

## Bibliotecas: decisão técnica

O artigo da Builder é útil como catálogo, mas a decisão considera o código real e documentação primária. O app já contém React 19, Tailwind 3, Radix, componentes em `src/components/ui`, Framer Motion e tokens elementais.

| Opção | Avaliação para este projeto |
| --- | --- |
| [Radix](https://www.radix-ui.com/primitives/docs/overview/introduction) + componentes próprios | Recomendado: base já presente, comportamento desacoplado da aparência, adoção incremental. |
| [Chakra](https://chakra-ui.com/docs/theming/overview) | Válido; oferece tokens/recipes/provider. Introduzi-lo agora acrescentaria outro sistema de estilo e migração sem necessidade comprovada. |
| [MUI](https://mui.com/material-ui/customization/theming/) | Válido; tema cobre paleta, tipografia, espaçamento, forma e transições. Não foi identificado um requisito que justifique migrar a interface elemental para essa base. |
| [Sleek](https://sleek.design/agents.md) | Ferramenta de design e referência, fora do runtime do app. HTML gerado precisa ser adaptado aos dados e componentes locais. |
| Scrolltide | Referência de interação de cards expansíveis/showcase; implementação autoral e integração com controles existentes. Referência visual não equivale a licença para redistribuir código premium. |

Fontes consultadas em 24/10/2026. Artigo solicitado: https://www.builder.io/blog/react-component-libraries-2026. Nenhuma biblioteca de runtime foi adicionada.

## Skills instaladas e pertinência

Instalação global pessoal com `npx skills add … --global --agent codex --yes`; fora do checkout. Entradas SKILL.md inspecionadas; isso não representa auditoria integral de todos os scripts nem execução de seus workflows.

| Skill | Resultado | Uso indicado |
| --- | --- | --- |
| improve-codebase-architecture | Instalada | Auditoria focada futura; seu fluxo completo referencia codebase-design/grilling/domain-modeling, que não foram instaladas nesta rodada. Não acionada para reescrever domínio. |
| chief-of-staff | Instalada | Coordenação quando solicitada; não substitui Astro Boy, fila única ou regras de autorização. Nenhuma automação/wiki paralela/agente iniciado. |
| design-doc-mermaid | Instalada | Diagramas e documentação técnica; não acrescenta UX no app por si só. |
| hyperframes | Instalada | Vídeos de apresentação e motion studies exportados, não motor de interações React. |
| media-use | Instalada | Produção/gestão de mídia para vídeos; nenhum modelo/CLI de geração adicional instalado. |
| design-mobile-apps | Instalada | Integração Sleek; finalidade sobreposta à oficial. |
| sleek-design-mobile-apps | Instalada | Preferida para consultar projetos/referências e gerar propostas mobile. |
| hyperframes-animation | Não encontrada | Tentativa exclusiva retornou “No matching skills found”; repositório lista motion-doctrine/seam-craft entre outras, mas nenhuma substituta foi instalada automaticamente. |

As sete skills ficam disponíveis na próxima interação do Codex. Não são dependências npm do app nem acompanham o Git para o computador de Matheus. Os alertas automatizados do instalador não foram tratados como prova de segurança; a aplicação permanece limitada ao escopo autorizado.

## Sleek — API e credenciais

`agents.md`, skill oficial, contrato dos endpoints e OpenAPI públicos foram lidos. A API documenta `/references` (catálogo curado, requer chave válida), `/projects/:id/components` (HTML/versionamento de telas do projeto), geração por chat usando `referenceId` e screenshots. Isso comprova a existência da integração, não acesso a todo template premium nem cópia direta de qualquer galeria.

Chave enviada no chat não foi persistida ou incorporada ao código. Foi recomendado revogá-la. Fluxo device iniciado para autenticar sem repetir chave; resultado final da conexão na continuidade. Nenhuma geração cobrada, envio de código/dados reais do app ou compra foi realizada. O plano documentado permite teste por créditos iniciais; uso sustentado anuncia Pro US$69/mês ou US$30/mês no anual (US$360/ano), 20.000 créditos mensais. Valores observados na documentação oficial desta data, não garantia futura.

Depois de autenticar: verificar `/projects`, listar `/references`, comparar estilos compatíveis com magia elemental e produzir uma proposta isolada de Invocar. Adaptar à implementação existente, sem substituir navegação/store por mockups e sem expor chave em variável VITE_*.

## Verificação executada

- 107/107 testes Node: `node --test scripts/astro-boy.test.mjs tests/**/*.test.mjs`; três novos casos de seleção dos cinco tipos, delegação da escolha e semântica das etapas. SSR não comprova teclado real ou layout.
- `tsc -b` e `npm run lint` passaram. Primeira execução TypeScript identificou duas comparações impossíveis no foco; corrigidas, depois repetida.
- Build Vite com `envDir:false` passou em 12,38 s; avisos de chunks grandes/Browserslist continuam pendentes. Nenhum secret foi necessário para o build.
- AST dos três handlers citados idênticos; diff de stores/types/lib/services/constants/Supabase vazio.
- Diff-check detectou linha vazia extra no fim de Invocar; removida antes do fechamento.
- Navegador local não testado devido ao bloqueio salvo anterior; nenhum contorno. QA em 360/390/768/1440, zoom, foco após transição, radios/setas, seletor de área, controle de tempo, confirmação e movimento reduzido permanece pendente.

## Próximo ponto

Acompanhar seis frentes na fila operacional, sem duplicar backlog aqui. Prioridade imediata: QA de Invocar e consolidar receitas; em seguida detalhes/vínculos de Jornadas/Obras. Sem commit/push, deploy, migração ou mudança de backend nesta rodada. Revisão documental feita pelo coordenador; revisão independente permanece pendente.
