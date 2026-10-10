# Auditoria estática — assistente e integração LLM

Data: 09/10/2026. Item D03. Checkout observado: `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`, branch `codex/fitness-ui-integration`. Esta auditoria não executa fluxos nem altera produto.

## Resultado

Na busca delimitada abaixo, não foi localizado assistente conversacional/LLM implementado em `src`, nem funções de assistente em `supabase/functions`. A arquitetura conversacional com texto/voz, Function Calling e três funções `assistant-*` aparece especificada em `docs/02-Platform-Architecture/04-Integracao-LLM-e-Voz.md:10-48`; a especificação menciona Gemini, mas isso não demonstra código, configuração ou implantação.

`Invocar` é um formulário guiado que cria ACTION, HABIT, QUEST, PROJECT ou DRAFT por chamadas ao `useAppStore` (`src/pages/Invocar.tsx:29-34,58-120`); a rota é descrita como “Criação rápida” (`src/lib/app-routes.ts:28`) e registrada em `src/App.tsx:140`. Não há entrada de conversa, transcrição ou chamada de modelo no fluxo inspecionado. O nome não deve ser tomado como prova do assistente arquitetural.

A rota `Forja` é a funcionalidade mais próxima por linguagem: sua descrição de navegação diz “Assistente e criação” (`src/lib/app-routes.ts:30`). O conteúdo observado, porém, cria rascunhos localmente e permite triagem/classificação manual via `convertDraft` (`src/pages/Forja.tsx:31-71`); não há evidência ali de LLM ou conversa. `Grimório` lê dados do `useAppStore`, calcula métricas e permite editar nome/avatar (`src/pages/Grimorio.tsx:26-55`), não um módulo nativo de leitura/retorno ao core comprovado pela rota.

O resultado é limitado aos caminhos e termos examinados. Não prova ausência global ou em serviços externos, configurações remotas, branches diferentes ou código fora deste checkout.

## Evidência de backend existente

Há duas Edge Functions no diretório local: `google-calendar-connect` e `google-calendar-sync` (além de `_shared/cors.ts`). Ambas são handlers Deno e verificam o cabeçalho Authorization e a sessão via `supabase.auth.getUser()` (`supabase/functions/google-calendar-connect/index.ts:20-51`; `google-calendar-sync/index.ts:39-60`). A primeira prepara URL de consentimento OAuth (`:54-74`); a segunda consulta conexão e busca eventos (`:63-105`). Isso comprova exemplos locais de Edge Functions e autenticação por usuário, mas não comprova implantação, execução atual ou fluxo completo. O próprio sync retorna erro informando que persistência/armazenamento do token ainda precisa ser concluído (`google-calendar-sync/index.ts:80-87`). Nenhum valor de segredo foi lido ou copiado.

O cliente de calendário depende de URLs configuradas e da combinação do recurso habilitado com Supabase Auth (`src/services/googleCalendarIntegration.ts:3-4,47-49,90-97`). O serviço lê cache/tabelas; a busca por `functions.invoke` em `src` não retornou ocorrência. Portanto, as funções locais não devem ser descritas como comprovadamente chamadas ou implantadas.

## Auth e adapters

O app já tem integração condicional com Supabase Auth: `src/lib/supabase.ts:3-12` ativa auth somente quando configuração e flag de ambiente estão presentes; `ProtectedRoute` libera as páginas sem autenticação quando essa flag efetiva está desligada (`src/App.tsx:47-88`). Assim, a existência do authStore ou de rotas protegidas não prova que auth esteja habilitada no ambiente em uso. Uma Edge Function de assistente teria de validar JWT no servidor e associar cada operação ao usuário validado, sem confiar em `user_id` enviado pelo modelo/cliente.

A busca encontrou `src/lib/fitness-kit/adapters.ts`, usado por páginas Fitness para mapear dados de apresentação. Isso não é evidência dos adapters Core↔módulos nativos descritos pela arquitetura. Não foi localizado, no escopo pesquisado, fluxo comprovado de retorno de módulo ao Core/webhook; a ausência é somente uma limitação da busca.

## Pré-requisitos para protótipo consentido

- Consentimento explícito antes de enviar texto/áudio ao serviço externo; explicar dados enviados, finalidade, retenção e como interromper/remover a sessão.
- Autenticação validada no servidor em toda requisição; escopo por usuário aplicado também às leituras, ferramentas e logs. O modo de auth do app é condicional e deve ser confirmado no ambiente do protótipo.
- Lista fechada e versionada de tools, cada uma chamando operações de domínio existentes com validações do Core. Sem SQL livre ou edição genérica; exigir confirmação do usuário antes de qualquer escrita/classificação que altere dados.
- Chave do provedor guardada somente como secret server-side/Edge Function; nunca em `VITE_*`, bundle, navegador, logs ou relatório. Rotacionar/limitar acesso e consumo.
- Auditoria com usuário, tool, parâmetros mínimos e resultado; evitar gravar prompts/áudio sensíveis sem necessidade e definir retenção/acesso.
- Testes em conta/perfil temporário com dados criados pela UI, cobrindo auth ausente/inválida, isolamento entre usuários, tool rejeitada, confirmação/cancelamento, duplicação/retry, erro/timeout do provedor e ausência de regressão no fluxo manual. Não usar dados reais de saúde ou inventados como se fossem reais.
- Comportamento explícito quando integração estiver desabilitada ou indisponível, além de limites de taxa, tamanho de entrada e custo antes de um piloto.

## Integração e decisões pendentes

Há mais de um recorte possível de protótipo (por exemplo, consulta textual sem escrita ou criação de rascunho com confirmação), e opções de integração/provedores precisam ser avaliadas como decisão posterior. Este relatório não recomenda provedor, modelo, plano gratuito ou arquitetura final; disponibilidade, custo e credenciais precisam ser verificados na etapa própria. Voz/transcrição e ferramentas de escrita ampliam o escopo e não são comprovadas pelo código encontrado.

## Método e limites

Inspeção estática de rotas, páginas `Invocar`, `Forja`, `Grimório`, serviços, lib/configuração Supabase e árvore `supabase/functions`; busca lexical em `src` e `supabase/functions` por `assistant`, `assistente`, `gemini`, `openai`, `anthropic`, `llm`, `function calling`, `transcri`, `invocar`, `google-calendar` e `supabase.functions.invoke`. Não foram lidos arquivos `.env` ou valores de secrets. Nenhum build, lint, teste, navegador, chamada remota ou verificação de implantação foi executado.

O checkout já tinha alterações preexistentes em código e documentos antes deste relatório. Nenhuma foi alterada por D03; o único arquivo de workspace criado neste lote é este relatório. A inspeção e o diretório de evidências temporárias não mudam a classificação de funcionalidade implementada.
