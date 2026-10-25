# R17 — Forja: captura, lapidação e classificação

24/10/2026 · versão 0.1.57 local · base publicada 91fa5a5 · branch codex/fitness-ui-integration. Astro Boy executou frontend e revisão documental sequencialmente. Fábio conduz UX; Matheus mantém backend. R15/R16 preservados.

## Implementação

- Cabeçalho com runa própria de Forja, substituindo o emoji; paleta elemental compartilhada e receitas opt-in do design system.
- Captura com rótulo, envio por formulário e anotações opcionais multilinha expansíveis. Mantém os argumentos anteriores de `addDraft(title.trim(), notes.trim())`.
- Rascunhos com divulgação progressiva das anotações completas, data real, busca por título/anotação e estados vazios distintos. Ordem original preservada.
- Ações disponíveis fora da expansão, sem depender de hover. O antigo Editar era inoperante; agora abre nome/anotações e chama `updateDraft(id, { title, notes })`.
- Classificação por seleção nativa de Ritual/Ciclo/Jornada/Grande Obra e confirmação explícita antes de `convertDraft(id, type)`. Feedback permanece até dispensar e oferece acesso ao catálogo correspondente. Não é link direto ao item.
- Exclusão confirmada antes de `deleteDraft(id)`. Seleção resolve o registro atual por ID; troca de conta remonta o estado de interface.
- Layout com uma coluna em telas estreitas, duas em desktop; controles de 48 px, foco visível e movimento reduzido. Estes são atributos do código, ainda sem aceite renderizado.

Arquivos principais: `src/pages/Forja.tsx`, `src/components/forge/ForgeDraftCard.tsx`, `src/components/forge/forge.css`, `src/components/elemental/ArcaneIcon.tsx`. Nenhuma dependência adicionada.

## Contrato preservado e divergências

Inspeção de `src/stores/appStore.ts`, comandos a partir de `addDraft`: a conversão já cria uma atividade com padrões próprios, define elemento Terra, remove o rascunho e retorna ID. Essa implementação não foi alterada, nem reproduzida na página. Não foi criado classificador de IA, saldo ou persistência paralela.

O capítulo `docs/02-Platform-Architecture/03-A-Lista-Diaria.md`, seção 3.1, descreve inbox exclusivo, payload inicial apenas com título, classificação com área/dispatcher e Wizard incluindo MISSION. O app atual já aceita notas e criação de rascunho em Invocar; `convertDraft` suporta quatro tipos e padrões fixos. R17 preserva o código existente, registra a diferença e não declara esse contrato completo implementado. A edição de texto aqui não equivale ao Quick Edit de classificação descrito no capítulo.

Para Matheus: revisar essa divergência na fila existente antes de integrar área, módulos, MISSION ou classificação com regras novas. Fábio pode continuar o polimento visual sem modificar esses contratos.

## Verificações executadas

- `node --test scripts/astro-boy.test.mjs tests/**/*.test.mjs`: **110/110**, incluindo três novos testes da Forja (SSR da divulgação/anotações e ações acessíveis; callbacks com identidade original; data inválida/notas ausentes). Não são testes de navegador nem de persistência.
- `./node_modules/.bin/tsc -b`: passou, repetido após revisão de seletores e rótulos do diálogo.
- `npm run lint`: passou, repetido após revisão final de TSX.
- Build via API Vite com `envDir:false`: passou em **10,81 s**. Permanecem avisos de chunks grandes e Browserslist antigo.
- `git diff -- src/stores src/lib src/types src/services src/constants supabase`: vazio. Inspeção dos comandos/payloads manteve criação/conversão anteriores; edição usa comando existente. Sem escrita em dados reais durante a verificação.
- Versões de package.json/package-lock.json e changelog sincronizadas; `git diff --check` passou.

Logs locais temporários: `/tmp/conselho-r17-tests.log`, `/tmp/conselho-r17-tsc.log`, `/tmp/conselho-r17-lint.log`, `/tmp/conselho-r17-build.log`. Fonte anterior de Forja preservada para comparação em `/tmp/conselho-forja-r17-before.tsx`; esses arquivos não fazem parte da entrega versionada.

## Pendências e retomada

QA real de criação, edição, busca, expansão, cancelamento, exclusão, conversão dos quatro tipos, mudança de conta, teclado, foco após diálogo e 360/390/768 px. Navegador local permanece bloqueado pela preferência informada anteriormente; nenhum contorno foi usado. Build e SSR não comprovam fidelidade visual, ausência de sobreposição com a navegação ou persistência end-to-end.

Sleek: após o usuário informar aprovação da etapa 2, a consulta ainda retornou `pending`. Autenticação não confirmada; nenhuma chave persistida ou geração realizada. Não registrar código de autenticação no Git. A Forja foi implementada localmente sem dependência dessa integração.

Reservas encerradas. Revisão documental feita pelo coordenador; revisão independente e aceite visual pendentes. Sem commit/push, deploy ou migração. Estado operacional e próximos lotes permanecem em `docs/FILA-ENTREGAS.md`.
