# I03 — sugestão de rascunho

Data: 09/10/2026. Checkout principal. Protótipo local; não implantado nem validado com provedor real.

## Uso e contrato

Em Invocar, escolher Rascunho → Continuar. A seção Ajuda para escrever recebe até 2.000 caracteres e exige consentimento para enviar somente esse texto à Cloudflare. A resposta preenche Nome/Descrição, que continuam editáveis. Continuar apenas apresenta o resumo; o botão Invocar chama o `addDraft(title, notes)` existente. A função não executa ferramentas de escrita, não lê o perfil e não altera pontuação, áreas, esforço ou histórico.

Sem Supabase Auth habilitado, a sugestão fica indisponível e o formulário manual permanece utilizável. Sessão ausente/anônima, quota, provedor indisponível ou resposta inválida não gravam dados nem apagam os campos. Texto e consentimento ficam apenas no estado da tela; prompts não são persistidos pelo protótipo.

## Implementação e decisão

- UI: `src/pages/Invocar.tsx`; gateway: `supabase/functions/assistant-suggest/index.ts`.
- Token validado pelo serviço Supabase Auth (`GET /auth/v1/user`); nenhuma autorização por `user_metadata`, ID escolhido pelo cliente ou JWT apenas decodificado. Nenhuma chave `service_role` é usada.
- Cloudflare Chat Completions, modelo fixo `@cf/qwen/qwen3.8-27b`, raciocínio baixo, até 768 tokens de saída. Uma ferramenta fechada `suggest_draft`, com título de até 120 e descrição de até 1.000 caracteres. Parser local rejeita texto livre, ferramentas/atributos desconhecidos e respostas incompletas.
- Requisição de até 8.192 bytes; resposta de até 32.768 bytes; auth com timeout de 5s, provedor 20s, chamada UI 30s; abort ao sair da tela. CORS permite somente origens explicitamente configuradas. Respostas `no-store`.
- Limite em memória: cinco tentativas/usuário/minuto e vinte/isolate/minuto. Reinícios/isolates novos reiniciam contadores; **não é quota global nem garantia de custo**. Antes de produção, definir quota persistente e teto de uso com o proprietário em lote próprio.
- Log operacional contém somente requestId, userId autenticado, nome da ferramenta proposta e status; sem texto, token ou dados do perfil. Não constitui auditoria persistente de criação/confirmação no core. Auditoria de operações de domínio fica para etapa futura.

A fonte canônica `02-Platform-Architecture/04-Integracao-LLM-e-Voz.md` descreve Gemini e ferramentas executadas no backend. D04 propôs Cloudflare para um piloto gratuito limitado; I03 implementa somente proposta com confirmação local. Isso não comprova a arquitetura integral de conversação, voz, execução/auditoria remota ou adapters. Ver [DECISAO-PROVEDOR-IA.md](DECISAO-PROVEDOR-IA.md).

## Configuração para etapa posterior

Não inserir valores de segredo no navegador, no Git ou na conversa. Preparar no servidor:

| Nome | Finalidade |
|---|---|
| `ASSISTANT_ENABLED` | Somente `true` habilita o gateway; desligado por padrão |
| `ASSISTANT_ALLOWED_ORIGINS` | Origens completas permitidas, separadas por vírgula |
| `CLOUDFLARE_ACCOUNT_ID` | ID da conta Cloudflare, 32 caracteres hexadecimais |
| `CLOUDFLARE_API_TOKEN` | Token restrito à conta/Workers AI |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Configuração servidor/Auth existente |

Frontend reaproveita `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `VITE_ENABLE_SUPABASE_AUTH=true`; não há chave Cloudflare no frontend. Ativação do Auth pode alterar o fluxo de acesso/sincronização já existente: conferir conta e backup antes de fazê-la, em etapa dedicada. Nenhum `.env` foi lido ou alterado em I03.

Publicação da função, configuração de segredos, conta de teste, quota e uma chamada real precisam de escopo posterior. Manter a verificação JWT da plataforma e a validação Auth do handler. Não desabilitar auth para contornar erros.

## Validação reproduzível

```sh
deno test supabase/functions/assistant-suggest/index_test.ts
npm run build
npm run lint
git diff --check
```

Testes Deno usam dependências simuladas, sem rede ou segredos; validam limites, auth/consentimento, schema fechado, erros de provedor e throttle. O navegador usa app/store reais com módulos Auth/provedor interceptados em perfil temporário; isso não é uma chamada live ponta a ponta. Evidências temporárias em `/tmp/conselho-i03-20261009/`; o encerramento do lote na fila consolida o resultado.

Fontes oficiais consultadas em 09/10: [Supabase auth](https://supabase.com/docs/guides/functions/auth), [Cloudflare endpoint compatível](https://developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility/), [modelo e parâmetros](https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/). O changelog Supabase foi conferido; sem breaking change relevante encontrada para este handler.
