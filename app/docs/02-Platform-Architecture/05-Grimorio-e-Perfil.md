---
title: "Platform Architecture: Grimório e Perfil"
version: "1.0"
date: "2026-10-09"
status: "Canonical — projeção de progressão e perfil"
---

# 05. Grimório e Perfil do Usuário

O Grimório é a interface de perfil e maestria do usuário. Ele apresenta dados de progressão derivados do XP Elemental persistido; não calcula nem grava níveis por conta própria. O cálculo canônico pertence ao `LevelingCalculatorService`, conforme [02-Motor-de-Pontuacao-e-Energia.md](../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md#10-progressão-infinita-e-cálculo-de-níveis).

## 1. Modelo duplo de progressão

O perfil exibe um nível geral do Avatar e um nível individual para cada Elemento:

| Componente | Entrada canônica | Significado |
|---|---|---|
| Avatar Geral (`avatar_level`) | Soma do XP bruto de Terra, Fogo, Água e Ar | Dedicação global do usuário ao sistema. |
| Nível Elemental (`skill_level`) | XP bruto do Elemento correspondente | Maestria individual naquele domínio elemental. |

```text
avatar_xp = exact_decimal_sum(terra_xp, fogo_xp, agua_xp, ar_xp)
avatar_level = LevelingCalculatorService.level_for(avatar_xp)
element_level[e] = LevelingCalculatorService.level_for(element_xp[e])
```

Não existe teto de nível. XP Elemental pode ser fracionário por distribuição multiárea ou bônus percentuais; o somatório deve usar aritmética decimal exata na precisão canônica, sem arredondamento de apresentação. O nível é uma projeção calculada sobre o XP bruto, não um campo persistido autoritativo. O Perfil pode usar cache de resposta, desde que o cache seja reconstruível a partir dos saldos e da versão de regras.

## 2. Títulos de maestria

O mesmo mapa de títulos aplica-se ao Avatar Geral e aos quatro Elementos:

| Nível | Título apresentado |
|---:|---|
| 1–9 | Iniciado |
| 10–24 | Aprendiz |
| 25–49 | Adepto |
| 50–74 | Especialista |
| 75–99 | Mestre |
| 100–149 | Grão-Mestre |
| 150–199 | Ancião |
| 200+ | Lenda |

A aplicação deve manter limites inclusivos e sem lacunas; a partir do nível 200, o título apresentado é “Lenda”.

## 3. Conteúdo e contrato de leitura

O Grimório deve apresentar:

- identidade/avatar do usuário;
- nível, título e XP do Avatar Geral;
- XP, nível e título de cada Elemento;
- progresso até o próximo nível, incluindo XP atual no nível e XP restante;
- marcos de consistência e badges já conquistados;
- estatísticas e histórico visual de evolução, identificados como métricas derivadas.

Contrato conceitual da projeção:

```typescript
interface GrimoireProfile {
  avatar: LevelProgress;
  elements: Record<'TERRA' | 'FOGO' | 'AGUA' | 'AR', LevelProgress>;
  consistency_milestones: ConsistencyMilestone[];
  ruleset_version: string;
}
```

`LevelProgress` é definido no contrato do `LevelingCalculatorService`. `consistency_milestones` é uma leitura do histórico de conquistas e não altera XP ou Prana por renderização. A tela não deve fazer consultas individuais por nível nem replicar a fórmula em componentes.

## 4. Invariantes

1. XP Elemental bruto é a fonte de verdade. O nível geral é derivado da soma dos quatro saldos; nível elemental é derivado do saldo correspondente.
2. Alterações de balanceamento são identificadas por `ruleset_version`; mudança de curva não reescreve XP já concedido.
3. Não há `level_cap`, reset de nível ou reinício de XP na troca de título.
4. Nível, título, badges e elementos visuais do Grimório não concedem nem recuperam Prana. A recuperação de Prana continua restrita a execuções `RESTORATIVE`.
5. Pontos concedidos e removidos por Undo devem refletir-se nas projeções após atualização dos saldos canônicos; o Grimório não mantém uma contabilidade paralela.

## 5. Questões de produto pendentes

- Definir o esquema canônico de persistência do XP bruto por usuário e Elemento, incluindo precisão decimal, idempotência, compatibilidade com Undo e estratégia de saldo versus ledger. Os documentos de domínio definem a regra de cálculo, mas ainda não escolhem a tabela/contrato físico.
- Definir `BASE_XP`, `EXPONENT` e os multiplicadores de cada bracket por meio de calibração do Game Design. Até essa decisão, a forma funcional é normativa, mas os limiares numéricos não podem ser apresentados como finalizados.
- Definir limites de precisão, transporte e exibição para XP extremamente alto sem perda de exatidão.

## Referências

- Fórmula, brackets e contrato do serviço → [Motor de Pontuação e Energia](../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md#10-progressão-infinita-e-cálculo-de-níveis).
- Ciclos Concluídos e Marcos de Consistência → [Ações e Hábitos](./02-Acoes-e-Habitos.md#marcos-de-consistência-do-hábito).
- Bônus de Harmonia diário → [Lista Diária](./03-A-Lista-Diaria.md).
