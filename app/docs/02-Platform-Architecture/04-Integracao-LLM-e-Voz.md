---
title: "Platform Architecture: Integração LLM e Voz"
version: "1.0"
date: "2026-09-20"
status: "Nova Lógica"
---

# 04. Integração LLM e Voz

**Novo componente arquitetural.** Especifica a infraestrutura de backend que permite a um assistente de IA conversacional (texto ou voz) criar, classificar e concluir itens do Core Engine em nome do usuário.

---

## 1. Visão Geral

```
[Usuário fala ou digita no chat do app]
        ↓
[Frontend captura áudio/texto → envia para Supabase Edge Function]
        ↓
[Edge Function encaminha para o LLM (Gemini API) com Function Calling habilitado]
        ↓
[LLM decide qual função de domínio chamar: criar / classificar / dar check]
        ↓
[Edge Function executa a função contra o Core Engine (mesmas regras de sempre)]
        ↓
[Resposta estruturada retorna ao usuário (texto e/ou voz sintetizada)]
```

O LLM **nunca** escreve diretamente no banco de dados — ele só pode invocar um conjunto fechado de funções (tools) que passam pelas mesmas validações e pelo mesmo Motor de Pontuação usados pela UI manual. Isso garante que nenhuma regra do domínio (Parte [01-Domain-Core](../01-Domain-Core/)) seja contornada por texto livre.

---

## 2. Infraestrutura de Backend

- **Runtime:** Supabase Edge Functions (Deno), uma função dedicada por responsabilidade (`assistant-chat`, `assistant-transcribe`, `assistant-execute-tool`).
- **Modelo:** Gemini API (texto e multimodal/áudio), com **Function Calling** configurado contra um schema fixo de ferramentas (seção 3).
- **Autenticação:** a Edge Function recebe o JWT do Supabase Auth do usuário e propaga o `user_id` para todas as tool calls — o LLM nunca opera fora do escopo do usuário autenticado.
- **Áudio:** upload de áudio vai para Supabase Storage; a função de transcrição (Gemini multimodal ou STT dedicado) converte para texto antes de entrar no fluxo de Function Calling.

```
Tabela lógica de funções (Edge Functions):

assistant-transcribe    → recebe áudio, retorna texto transcrito
assistant-chat          → recebe texto (ou transcrição), mantém contexto de conversa,
                           decide se/quais tools chamar via Gemini Function Calling
assistant-execute-tool  → executa a tool escolhida contra o Core Engine e retorna o resultado
```

---

## 3. Function Calling — Ferramentas Expostas ao LLM

O assistente só pode agir através de um conjunto fechado de funções, cada uma mapeada 1:1 para uma operação já existente do Core Engine (mesma validação, mesmo Motor de Pontuação):

```typescript
// Schema de tools exposto ao Gemini (Function Calling)
const tools = [
  {
    name: 'create_draft_item',
    description: 'Cria um Rascunho (lifecycle_type=null) a partir de um título dito/escrito pelo usuário.',
    parameters: { title: 'string' },
  },
  {
    name: 'classify_item',
    description: 'Classifica um item existente (Rascunho → ACTION/HABIT/QUEST/PROJECT/MISSION), atribuindo área, esforço e tempo.',
    parameters: {
      item_id: 'string',
      lifecycle_type: "'ACTION' | 'HABIT' | 'QUEST' | 'PROJECT' | 'MISSION'",
      area_primary_id: 'string',
      effort_level: 'number (1-5, opcional)',
      planned_time_minutes: 'number (opcional)',
    },
  },
  {
    name: 'complete_item',
    description: 'Marca um item classificado como concluído, opcionalmente com tempo real informado por voz.',
    parameters: { item_id: 'string', actual_time_minutes: 'number (opcional)' },
  },
  {
    name: 'query_daily_list',
    description: 'Retorna os itens da Lista Diária do usuário para leitura em voz alta ou resumo em texto.',
    parameters: { date: 'string (YYYY-MM-DD, opcional, default hoje)' },
  },
];
```

### Regras de Execução (Não Contornam o Domínio)

- ✅ `create_draft_item` sempre cria com `lifecycle_type = null`, `area_primary_id = null` — segue exatamente a regra de Rascunhos ([01-Hierarquia-e-Tipos.md](../01-Domain-Core/01-Hierarquia-e-Tipos.md)).
- ✅ `classify_item` exige `area_primary_id` explícito — o LLM deve perguntar ao usuário se a área não estiver clara na fala/texto (nunca infere área silenciosamente, mesma regra de não-inferência do domínio).
- ✅ `complete_item` dispara o mesmo cálculo de `ExecutionLog` do Motor de Pontuação/Energia — inclusive débito/recuperação de Prana quando aplicável.
- ✅ Toda tool call é auditada (log de qual função foi chamada, com quais parâmetros, por qual `user_id` e a partir de qual mensagem de chat).
- ❌ Não existe tool genérica de "executar SQL" ou "editar qualquer campo" — o LLM só acessa as operações de domínio explicitamente expostas.

---

## 4. Fluxo de Exemplo (Voz)

```
Usuário (áudio): "Acabei de meditar por 20 minutos"
        ↓
assistant-transcribe → texto: "Acabei de meditar por 20 minutos"
        ↓
assistant-chat (Gemini) interpreta:
  - Busca item existente com título semelhante a "Meditar" no Hábitos do usuário
  - Se encontrado: chama complete_item({ item_id, actual_time_minutes: 20 })
  - Se não encontrado: chama create_draft_item({ title: "Meditar" }) e pergunta
    ao usuário se deseja classificar como Hábito recorrente
        ↓
assistant-execute-tool roda contra o Core Engine
  → ExecutionLog criado, Prana recuperado (task_energy_type='RESTORATIVE')
        ↓
Resposta ao usuário: "Registrado! Você meditou 20 minutos e recuperou +20 de Prana."
```

---

## 5. Referências

- Regras de criação/classificação (Rascunho → Classificado) → [../01-Domain-Core/01-Hierarquia-e-Tipos.md](../01-Domain-Core/01-Hierarquia-e-Tipos.md)
- Cálculo de execução, Prana e `task_energy_type` → [../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md](../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md)
- Webhook de retorno para Módulos Nativos (mecanismo de evento reaproveitado) → [03-A-Lista-Diaria.md](./03-A-Lista-Diaria.md)
