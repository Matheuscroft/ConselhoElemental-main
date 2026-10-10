---
name: backend-conselho
description: Orienta Matheus e Astro Boy na auditoria, implementação e documentação do backend do Conselho Elemental, preservando contratos core, autenticação, persistência e adapters. Use para APIs, sincronização e funções de servidor deste projeto.
---

# Backend do Conselho

Comece por docs/README.md, BASE-CANONICA-E-EVOLUCAO, AUDITORIA-CONTRATOS-CORE e AUDITORIA-ASSISTENTE. Documentação descreve intenção; inspecione stores, services, types e supabase antes de propor mudanças. Se faltar ferramenta para execução remota, faça diagnóstico local e registre o bloqueio real.

1. Reproduza um caso e descreva contrato existente × canônico × resultado esperado. Primeiro lote sugerido: teste de idempotência/reversão do core sem alterar fórmula nem migrar dados.
2. Reserve arquivos na fila. Aproveite persistência, auth, adapters e motor existentes; evite caminhos paralelos de pontuação e histórico. Proteja isolamento por usuário e limites do input. Campos VITE são públicos: segredos só no servidor.
3. Para Supabase, leia a skill oficial disponível no executor; se ausente, sinalize que precisa instalá-la/configurá-la antes de usar ferramentas remotas. Migrações precisam de análise de compatibilidade, backup e plano de retorno. Não habilite I04 automaticamente: ainda depende de conta, quota, secrets e escopo de deployment.
4. Para Cloudflare, siga a skill correspondente quando instalada; use cf CLI salvo projeto com configuração Wrangler. Não copiar configuração global, sessões ou credenciais do computador de Fábio.
5. Teste isolamento, auth, entrada inválida, repetição, persistência/reload e falhas conforme o contrato alterado. Separe mocks de chamadas reais; testes do assistente: `deno test supabase/functions/assistant-suggest/index_test.ts` (Deno necessário).
6. Atualize auditoria/ADR quando uma divergência for reconciliada. Entregue a Astro Boy objetivo, diff, testes executados, impacto frontend e próximo passo. Versionamento revisa manifests e changelog; validação não aceita o próprio trabalho sem revisão do coordenador.

Se uma rotina reaparecer, crie uma skill local em `.agents/skills/<nome>/SKILL.md` com nome/descrição, pré-condições, passos, verificação e limitações. Confirme descoberta no executor; não trate um arquivo como integração automática.
