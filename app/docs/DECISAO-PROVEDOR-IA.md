# D04 — avaliação inicial de provedor para assistente

Data: 09/10/2026. Avaliação documental de fontes oficiais; sem conta criada, chamada de API, credencial ou alteração no produto. Revalidar preços/termos antes da integração.

## Recomendação provisória

Para um protótipo de texto com ferramentas fechadas, avaliar Cloudflare Workers AI como primeira opção de custo zero limitado: a página oficial anuncia 10.000 Neurons por dia no plano Workers Free e bloqueio de chamadas quando a cota se esgota; uso acima exige Workers Paid. O catálogo indica modelos com function calling, inclusive Qwen 3.8 27B. A política de dados diz que Cloudflare não usa Customer Content para treinar modelos nem melhorar serviços sem consentimento explícito; pode armazenar conteúdo se o cliente usar armazenamento associado. Isso não é garantia de retenção zero, adequação automática a dados sensíveis nem gratuidade sem limites. Confirmar licenças do modelo e capacidade/limites antes de piloto.

Aproveitar Supabase Edge Functions já usado pelo app como gateway autenticado: segredo Cloudflare apenas server-side, JWT validado no servidor e lista de tools fechada. Para começar, protótipo textual de consulta ou rascunho com confirmação; sem voz, leitura ampla de saúde/humor nem ações de escrita silenciosas. Não armazenar prompts no provedor/app por padrão.

## Comparação atual

| Opção | O que fontes oficiais dizem | Implicação |
|---|---|---|
| Cloudflare Workers AI | 10.000 Neurons/dia sem cobrança no Workers Free; além da cota exige Workers Paid. Conteúdo não é usado para treinar/melhorar sem consentimento. Há modelos marcados com function calling. | Candidato mais adequado a protótipo gratuito; há teto diário, conta/secret necessários, conteúdo é processado e termos/licença do modelo ainda se aplicam. Cota não é promessa de volume suficiente. |
| Gemini API não paga | Preço oficial: acesso gratuito limitado; termos oficiais definem uso de prompts/respostas para melhoria de produtos e possível revisão humana. | Não enviar dados pessoais/sensíveis de usuários ao tier não pago. |
| Gemini API paga | Prompts/respostas não são usados para melhoria segundo a documentação; há registro limitado para monitoramento de abuso. | Opção paga e não “zero retenção” por padrão; avaliar orçamento e termos. |
| Azure AI Foundry | Documentação Microsoft diz que prompts/respostas não são usados para treinar ou melhorar modelos vendidos pelo Azure; inferência do modelo é cobrada. Dados stateful têm armazenamento conforme recurso/configuração. | Controles corporativos atraentes, mas custo e setup precisam ser avaliados; não presumir cota gratuita. |

## Fontes consultadas

- Cloudflare, preços Workers AI (consulta 09/10/2026): https://developers.cloudflare.com/workers-ai/platform/pricing/ — 10.000 Neurons/dia e cobrança acima do limite.
- Cloudflare, uso de dados: https://developers.cloudflare.com/workers-ai/platform/data-usage/ — conteúdo e política de treinamento/armazenamento.
- Cloudflare, function calling: https://developers.cloudflare.com/workers-ai/features/function-calling/ e catálogo: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/.
- Google, preços: https://ai.google.dev/gemini-api/docs/pricing e termos da camada não paga: https://ai.google.dev/gemini-api/terms.
- Azure, privacidade: https://learn.microsoft.com/en-us/azure/ai-foundry/responsible-ai/openai/data-privacy; custos de Agent Service: https://learn.microsoft.com/en-us/azure/foundry/agents/faq.

## Próxima etapa proposta: I03 — protótipo seguro

Antes de integrar, ler a skill instalada `/Users/fabioandre/.codex/plugins/cache/openai-curated-remote/supabase/1.0.0/skills/supabase/SKILL.md` e validar os fluxos atuais de auth/funções. Desenhar gateway provider-adapter numa Edge Function e UI explícita de consentimento. Nunca enviar `user_id` escolhido pelo modelo; derivar do JWT. Tools estritas, começando por rascunho e confirmação, com limites de entrada, tempo, frequência, logs sem conteúdo sensível e falha fechada se faltar auth/secret. Usar testes com dados temporários e mock local; chamadas reais somente com secret configurado pelo proprietário e dentro da cota/limite acordado. Não publicar/deploy nesta etapa sem escopo próprio.

Este relatório não afirma que Cloudflare foi contratado, habilitado ou implantado. A decisão de provedor é recomendação para piloto, sujeita a conta/região, disponibilidade do modelo, licença e revisão de privacidade.
