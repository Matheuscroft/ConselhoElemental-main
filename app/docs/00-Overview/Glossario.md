---
title: "Glossário — Elementos, Corpos e Áreas"
version: "1.0"
date: "2026-09-20"
status: "Canonical"
---

# Glossário: Elementos, Corpos e Áreas

Este documento consolida a taxonomia de vida do Conselho Elemental: os 4 **Elementos**, os 4 **Corpos** (domínios pessoais) e a biblioteca de **Áreas** — incluindo a regra especial do `SEM_CATEGORIA`.

---

## 1. Elementos

Os valores desta seção são `element_code` estáveis, não chaves primárias. Cada linha de elemento tem `id` UUID v4 textual; FKs como `element_id` armazenam o UUID.

Cada Área do sistema pertence a exatamente um elemento arquetípico. O elemento determina a cor-base e o tom narrativo. O Motor Astrológico atualmente oferece apenas contextualização e não altera a mecânica (ver [03-Astrology-Engine.md](../01-Domain-Core/03-Astrology-Engine.md)).

| `element_code` | Nome | Significado | Cor Base |
|----|------|-------------|----------|
| `earth` | **Terra** | Estrutura, corpo, base material | `#3E5F44` |
| `fire`  | **Fogo**  | Expansão, ação, impacto | `#D14900` |
| `water` | **Água**  | Emoção, conexão, interior | `#1B4965` |
| `air`   | **Ar**    | Intelecto, comunicação, ideias | `#A8DADC` |

> Nota de implementação: a coluna FK `element_id` armazena UUID v4 textual. Códigos semânticos como `earth` e `fire` não devem ser gravados como PK/FK.

---

## 2. Corpos (Domínios Pessoais)

Um "Corpo" é um eixo paralelo e opcional de classificação, ortogonal ao Elemento — representa **em qual dimensão da vida pessoal** aquela ação/hábito investe.

| Corpo | Foco | Exemplos |
|-------|------|----------|
| **Self** | Desenvolvimento pessoal, saúde, bem-estar | Meditação, exercício, leitura |
| **Craft** | Habilidades, projetos, produção criativa | Código, escrita, arte, música |
| **Care** | Relacionamentos, responsabilidade, serviço | Família, amigos, comunidade |
| **Ascent** | Crescimento, aprendizado, avanço | Carreira, educação, maestria |

Cada Action/Habit pode ter um `body_primary_id` associado (opcional). Diferente do Elemento (obrigatório após classificação), o Corpo é um refinamento opcional de contexto.

---

## 3. Áreas (Esferas de Vida)

Os valores `area-*` listados abaixo são `area_code` semânticos estáveis para seed, exibição e configuração, não IDs de linha. Cada área persistida tem `id` UUID v4 textual; as FKs de área armazenam esses UUIDs.

Áreas são as categorias nomeadas de vida do usuário, sempre associadas a um Elemento. O sistema nasce com 4 grupos de áreas pré-definidas (seed data) — o usuário pode ativar/desativar ou criar áreas customizadas, mas não pode editar/apagar as pré-definidas.

### 🌱 Terra — Estrutura, Corpo e Base Material

| ID | Nome | Cor |
|----|------|-----|
| area-saude-fisica | Saúde Física | #4CAF50 |
| area-nutricao | Nutrição | #66BB6A |
| area-sono-recuperacao | Sono & Recuperação | #8DAA91 |
| area-exercicio-ar-livre | Atividades ao ar livre | #7CB342 |
| area-financas | Finanças | #2E7D32 |
| area-casa-ambiente | Casa & Ambiente | #5E8C61 |
| area-logistica-vida-pratica | Logística & Vida Prática | #4A5D23 |
| area-disciplina-rotina | Disciplina & Rotina | #556B2F |

Subáreas principais: Musculação, Calistenia, Yoga, Pilates, Corrida, Natação, Artes marciais, Alongamento, Fisioterapia, Mobilidade · Alimentação saudável, Hidratação, Planejamento alimentar, Suplementação · Rotina de sono, Higiene do sono, Descanso ativo · Caminhadas, Exposição solar, Respiração · Orçamento, Investimentos, Reserva de emergência · Limpeza, Organização, Reforma, Jardinagem · Documentação, Compras, Transporte · Rotina matinal/noturna, Construção de hábitos.

### 🔥 Fogo — Expansão, Ação e Impacto

| ID | Nome | Cor |
|----|------|-----|
| area-carreira | Carreira | #F25C05 |
| area-profissao | Profissão | #D9480F |
| area-empreendedorismo | Empreendedorismo | #E85D04 |
| area-projetos-pessoais | Projetos Pessoais | #FF7F11 |
| area-lideranca | Liderança | #C1121F |
| area-alta-performance | Alta Performance | #9D0208 |
| area-arte-expressao | Arte & Expressão | #E63946 |
| area-marca-pessoal | Marca Pessoal | #FF4D6D |

Subáreas principais: Desenvolvimento profissional, Promoção, Networking · Especializações, Aprendizado técnico · Produto, Vendas, Marketing, Lançamentos · Gestão de equipe, Mentoria, Oratória · Competição, Superação · Música, Teatro, Pintura, Escrita artística, Dança · Redes sociais, Posicionamento, Branding pessoal.

### 🌊 Água — Emoção, Conexão e Interior

| ID | Nome | Cor |
|----|------|-----|
| area-relacionamentos | Relacionamentos | #0077B6 |
| area-familia | Família | #48CAE4 |
| area-espiritualidade | Espiritualidade | #023E8A |
| area-desenvolvimento-pessoal | Desenvolvimento pessoal | #3A86FF |
| area-emocoes-saude-mental | Emoções & Saúde Mental | #00B4D8 |
| area-comunidade-impacto-social | Comunidade & Impacto Social | #0096C7 |

Subáreas principais: Parceiro(a), Amizades, Vida social · Pais, Filhos, Parentes · Meditação, Oração, Ritos espirituais, Magia, Estudo espiritual · Terapia, Journaling, Reflexão · Regulação emocional, Autocuidado, Mindfulness · Voluntariado, Grupos, Causas, Ativismo.

### 🌬️ Ar — Intelecto, Comunicação e Ideias

| ID | Nome | Cor |
|----|------|-----|
| area-estudos | Estudos | #90E0EF |
| area-leitura-conteudo | Leitura & Conteúdo | #8ECAE6 |
| area-comunicacao | Comunicação | #219EBC |
| area-tecnologia | Tecnologia | #3A86FF |
| area-pesquisa-analise | Pesquisa & Análise | #5C7AEA |
| area-planejamento-estrategia | Planejamento & Estratégia | #A8DADC |
| area-criatividade-intelectual | Criatividade Intelectual | #BDE0FE |

Subáreas principais: Faculdade, Cursos, Certificações · Livros, Artigos · Escrita, Oratória, Idiomas, Storytelling · Programação, IA, Automação · Investigação, Análise estratégica · Metas, Planejamento anual · Brainstorm, Escrita criativa.

---

## 4. Regra Especial: `SEM_CATEGORIA` (Área Invisível Padrão)

`SEM_CATEGORIA` ("Sem Categoria" / "No Category") é uma Área especial de fallback temporário, nunca exibida nas listas de seleção. `area-sem-categoria` é seu `area_code`, não uma chave primária. O `id` persistido da área é UUID v4 textual.

**Propósito:** valor padrão para entidades criadas já classificadas pelos botões contextuais das telas Ciclos, Tarefas, Quests e Projetos, antes que o usuário atribua uma área de vida real. Rascunhos são criados exclusivamente no Inbox e permanecem sem área até a classificação.

**Regras:**
- ✅ Criada sob demanda (`getOrCreateSemCategoria()`), não faz parte do seed inicial.
- ✅ **Invisível** na UI: nunca aparece em telas de gestão de área nem em dropdowns de seleção.
- ✅ Badge visual: `"+1 Sem Categoria"` em cinza (`#9CA3AF`).
- ❌ **Rascunhos (`lifecycle_type = null`) NUNCA recebem `SEM_CATEGORIA`** — rascunhos têm `area_primary_id = null` até serem classificados. Só itens já classificados (`lifecycle_type` definido) recebem o fallback `area-sem-categoria`.

```typescript
export const SEM_CATEGORIA_AREA_CODE = 'area-sem-categoria';

async function getOrCreateSemCategoria(): Promise<Area> {
  const existing = await getAreaByCode(SEM_CATEGORIA_AREA_CODE);
  if (existing) return existing;

  return createArea({
    id: uuid_v4(),
    area_code: SEM_CATEGORIA_AREA_CODE,
    name: 'Sem Categoria',
    element_id: earth_element_uuid, // UUID v4 resolvido pelo element_code='earth'
    color_hex: '#9CA3AF',
    is_primary: false,
  });
}

// Sempre filtrar da UI:
areas.filter(area => area.area_code !== SEM_CATEGORIA_AREA_CODE);
```

| Contexto de criação | `area_primary_id` (UUID v4 da área) |
|---|---|
| Rascunho criado no Inbox | `null` (nenhuma área) |
| Entidade criada diretamente por botão contextual | UUID v4 da área com `area_code = 'area-sem-categoria'` (temporário) |
| Após Quick Edit ou Wizard de classificação | `<área real selecionada pelo usuário>` |

Ver a árvore completa de tipos e o fluxo de classificação em [01-Domain-Core/01-Hierarquia-e-Tipos.md](../01-Domain-Core/01-Hierarquia-e-Tipos.md).
