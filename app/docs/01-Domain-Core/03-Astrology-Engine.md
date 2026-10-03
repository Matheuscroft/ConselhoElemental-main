---
title: "Domain Core: Motor Astrológico (Astrology Engine)"
version: "1.0"
date: "2026-09-20"
status: "Nova Lógica — Serviço Passivo"
---

# 03. Motor Astrológico (Astrology Engine)

**Novo componente do domínio.** Um serviço passivo e determinístico que calcula o "clima astrológico" do dia e aplica modificadores globais discretos sobre a regeneração de Prana e os bônus elementais — sem nunca substituir ou empilhar sobre os multiplicadores já definidos em [02-Motor-de-Pontuacao-e-Energia.md](./02-Motor-de-Pontuacao-e-Energia.md).

---

## 1. Papel do Serviço

O Motor Astrológico **não pontua ações diretamente**. Ele produz, uma vez por dia, um **estado astrológico global** (`DailyAstroState`) que é consultado pelo Motor de Pontuação como um fator adicional, opcional e não-cumulativo.

```
[Job diário / cron]
       ↓
[Calcula fase lunar + trânsitos planetários relevantes do dia]
       ↓
[Gera DailyAstroState: modificadores de Prana + modificadores por Elemento]
       ↓
[Cacheia em daily_astro_state (1 registro por dia, por timezone do usuário)]
       ↓
[Motor de Pontuação consulta o registro do dia ao calcular execuções]
```

## 2. Modelo de Dados

```typescript
interface DailyAstroState {
  date: string;                 // YYYY-MM-DD (por timezone do usuário)
  moon_phase: MoonPhase;        // 'NEW' | 'WAXING' | 'FULL' | 'WANING'
  moon_sign: ElementSign;       // signo dominante da lua no dia (mapeado a um Elemento)
  dominant_transits: string[];  // ex.: ['mercury_retrograde', 'venus_trine_jupiter']
  prana_regen_modifier: number; // fator multiplicativo sobre recuperação de Prana (seç. 4.5 do Motor de Pontuação)
  element_modifiers: {
    earth: number;  // ×fator aplicado ao final_value de Tasks cuja área é do Elemento Terra
    fire: number;
    water: number;
    air: number;
  };
  generated_at: string;         // ISO timestamp de quando o job rodou
}

type MoonPhase = 'NEW' | 'WAXING' | 'FULL' | 'WANING';
type ElementSign = 'earth' | 'fire' | 'water' | 'air';
```

## 3. Regras de Geração (Determinísticas, Não-Inferidas)

O cálculo astrológico usa **efemérides reais** (posição da lua e planetas), não é aleatório nem editorial — mas os *efeitos de jogo* (quanto cada fase/trânsito modifica) são constantes de sistema, documentadas e versionadas aqui, nunca inventadas em tempo de execução.

### 3.1 Fase Lunar → Regeneração de Prana

| Fase da Lua | `prana_regen_modifier` | Racional narrativo |
|---|---|---|
| Lua Nova | ×0.9 | Introspecção, energia contida |
| Lua Crescente | ×1.0 | Neutro |
| Lua Cheia | ×1.2 | Pico de energia, recuperação amplificada |
| Lua Minguante | ×0.95 | Encerramento de ciclo |

Este modificador se aplica **apenas** à recuperação de Prana de tarefas `RESTORATIVE` (seção 4.5 do Motor de Pontuação):

```
prana_recovery_final = prana_recovery(actual_time_minutes) × daily_astro_state.prana_regen_modifier
```

### 3.2 Signo Lunar Dominante → Bônus Passivo por Elemento

O signo em que a Lua transita no dia é mapeado a um dos 4 Elementos (mapeamento fixo de signo astrológico → elemento clássico: Fogo = Áries/Leão/Sagitário, Terra = Touro/Virgem/Capricórnio, Ar = Gêmeos/Libra/Aquário, Água = Câncer/Escorpião/Peixes). O elemento dominante do dia recebe um bônus passivo fixo:

| Situação | `element_modifiers[elemento_dominante]` | Demais elementos |
|---|---|---|
| Lua no elemento X | ×1.1 | ×1.0 (sem alteração) |

### 3.3 Trânsitos Planetários → Penalidades/Bônus Pontuais (Opcional)

Trânsitos notáveis podem ajustar modificadores específicos. Apenas trânsitos com efeito de sistema pré-definido têm impacto — trânsitos não mapeados são armazenados em `dominant_transits` apenas para exibição narrativa (não afetam cálculo):

| Trânsito | Efeito |
|---|---|
| `mercury_retrograde` | `element_modifiers.air ×0.9` (comunicação/tecnologia mais custosas) |
| `venus_trine_jupiter` | `element_modifiers.water ×1.15` (bônus em relacionamentos/espiritualidade) |

Novos trânsitos só passam a ter efeito de sistema após serem adicionados explicitamente a esta tabela — nunca inferidos.

## 4. Integração com o Motor de Pontuação (Não-Stacking)

O `element_modifiers[elemento_da_área_primária]` é lido **uma vez** no momento do cálculo da folha (mesmo ponto onde `exhaustion_multiplier` é lido) e aplicado como fator adicional final, **antes** da distribuição multi-área:

```
astro_modifier = daily_astro_state.element_modifiers[element_of(leaf.area_primary_id)]

projected_leaf = base_value
               × (1 + presence_bonus)
               × effort_multiplier
               × time_multiplier
               × exhaustion_multiplier   // Motor de Energia
               × astro_modifier          // Motor Astrológico (NOVO)
```

Regras de não-quebra:
- **Não-stacking:** `astro_modifier` é resolvido uma vez, na folha, e nunca reaplicado por agregadores (mesma regra de todos os outros multiplicadores).
- **Read-only para o usuário:** `DailyAstroState` nunca é editável — é gerado pelo job e consumido como dado de sistema.
- **Cacheado por dia:** o job roda uma vez por dia (por timezone), evitando recomputar efemérides a cada execução de Task.
- **Não substitui nada:** é um fator multiplicativo adicional, não uma alternativa ao modelo de esforço/tempo/presença.
- **Opcional/togglable:** o usuário pode desativar a influência astrológica nas configurações; se desativado, `astro_modifier = 1.0` sempre.

## 5. Fora de Escopo (Explícito)

- ❌ Não define regras de magia ritualística complexa (fora do MVP).
- ❌ Não infere eventos astrológicos personalizados por usuário (mesma efeméride vale para todos, ajustada só por timezone).
- ❌ Não altera `base_value`, `effort_level`, ou distribuição percentual (100/60/30%) — atua exclusivamente como multiplicador adicional e como modificador de regeneração de Prana.

## 6. Referências

- Fórmula completa de cálculo por folha e Prana → [02-Motor-de-Pontuacao-e-Energia.md](./02-Motor-de-Pontuacao-e-Energia.md)
- Hierarquia e tipos semânticos → [01-Hierarquia-e-Tipos.md](./01-Hierarquia-e-Tipos.md)
