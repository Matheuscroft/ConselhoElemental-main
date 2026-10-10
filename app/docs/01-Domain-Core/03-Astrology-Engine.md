---
title: "Domain Core: Motor Astrológico"
version: "2.0"
date: "2026-10-08"
status: "Opcional — Somente apresentação narrativa"
---

# Motor Astrológico

O Motor Astrológico é um serviço opcional que calcula informações do céu para contextualização narrativa da experiência. Nesta versão, seus resultados não alteram pontos, Prana, tetos de pontuação ou distribuição entre áreas.

## 1. Responsabilidade e limites

O serviço pode gerar um estado diário com fase lunar, signo lunar, trânsitos e horário de geração. A interface pode usar esse estado para textos e elementos visuais, respeitando a opção do usuário de desativar a apresentação astrológica.

```typescript
interface DailyAstroState {
  date: string;                 // YYYY-MM-DD no fuso horário do usuário
  moon_phase: 'NEW' | 'WAXING' | 'FULL' | 'WANING';
  moon_sign: 'earth' | 'fire' | 'water' | 'air';
  dominant_transits: string[];  // dados para apresentação narrativa
  generated_at: string;        // timestamp ISO-8601
}
```

O estado deve ser determinístico para a mesma fonte de efemérides e data local, imutável para consumo e armazenado em cache quando aplicável. A origem, licença e versão dos dados astronômicos devem ser registradas pela implementação.

## 2. Mapeamento de apresentação

O mapeamento clássico de signos para elementos pode orientar a narrativa:

| Elemento | Signos |
|---|---|
| Fogo | Áries, Leão, Sagitário |
| Terra | Touro, Virgem, Capricórnio |
| Ar | Gêmeos, Libra, Aquário |
| Água | Câncer, Escorpião, Peixes |

Fases e trânsitos podem ser usados para conteúdo visual ou descritivo, mas os efeitos mecânicos propostos em rascunhos anteriores não estão ativos.

## 3. Isolamento das regras de pontuação

O Motor de Pontuação **não** consulta `DailyAstroState`. A fórmula canônica continua sendo:

```text
raw_leaf_value = base_value
               × (1 + presence)
               × effort_multiplier(effort_level)
               × time_multiplier(actual_time)

projected_leaf = MIN(raw_leaf_value, effort_cap(effort_level))
```

Não aplicar modificador astrológico depois do teto: isso alteraria o limite por esforço. A distribuição multiárea continua alocando exatamente 100% do valor pontuado (100%; 70/30%; ou 60/25/15%). O Prana segue o custo e a recuperação por duração real definidos em [02-Motor-de-Pontuacao-e-Energia.md](./02-Motor-de-Pontuacao-e-Energia.md), sem multiplicador astrológico.

Qualquer proposta futura para atribuir efeitos mecânicos à astrologia exige revisão explícita das regras de pontuação, balanceamento, versionamento e consentimento do usuário antes de ser considerada vigente.

## Referências

- Pontuação, teto, distribuição e Prana → [02-Motor-de-Pontuacao-e-Energia.md](./02-Motor-de-Pontuacao-e-Energia.md)
- Estrutura de itens → [01-Hierarquia-e-Tipos.md](./01-Hierarquia-e-Tipos.md)
