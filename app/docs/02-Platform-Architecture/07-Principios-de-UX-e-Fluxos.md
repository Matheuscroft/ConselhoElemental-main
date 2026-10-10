---
title: "Platform Architecture: Princípios de UX e Fluxos"
version: "1.0"
date: "2026-10-09"
status: "Canonical — integridade de apresentação e fluxos de interface"
---

# 07. Princípios de UX e Fluxos de Interface

Este documento consolida requisitos transversais de apresentação e fluxos de UI registrados nos antigos diagramas e briefs de Fitness. Regras de domínio permanecem nos documentos de `01-Domain-Core`; esta especificação não substitui esses contratos.

## 1. Integridade da informação

- A interface deve apresentar dados realmente persistidos ou calculados por uma regra documentada. Não criar métricas de saúde, categorias, progresso ou histórico fictícios para preencher a tela.
- Valores ausentes devem ser apresentados como indisponíveis ou em estado vazio, não como zero. Estimativas, metas de interface e medidas observadas precisam ser identificadas de forma distinta.
- Prana, XP e outras grandezas de jogo não são indicadores clínicos. A interface não deve sugerir diagnóstico, tratamento ou recomendação médica; apoio emocional não substitui cuidado profissional.
- Registros emocionais são voluntários, pertencem ao usuário e não devem ser inferidos automaticamente por gamificação ou pelo assistente. Controles de consulta, edição e remoção devem seguir a política geral de privacidade e dados do produto.
- Não apresentar água corporal como água ingerida, nem inferir frequência cardíaca, calorias, sono, distância ou GPS sem fonte de dados correspondente.
- Todo botão ou CTA visível deve executar uma ação real, estar desabilitado com motivo compreensível ou não ser exibido. Loading e retry só se aplicam quando há operação assíncrona e tentativa real.
- Um controle de timer que apenas congela a apresentação do relógio deve ser rotulado como pausa visual/congelamento do relógio. Só declarar pausa de treino quando duração e estado estiverem persistidos conforme regra de domínio.

## 2. Acessibilidade e apresentação responsiva

- Fluxos essenciais devem ser operáveis por teclado, com foco visível, rótulos acessíveis e ordem de foco previsível.
- Alvos de toque devem ter pelo menos 44 × 44 CSS px, salvo controles compactos com alternativa acessível equivalente.
- Respeitar `prefers-reduced-motion`; animação não pode ser a única forma de comunicar estado.
- Layouts devem acomodar telas móveis, tablets e desktop, texto longo, zoom e safe areas. Navegação fixa não pode cobrir conteúdo, ações ou elementos focados.
- Gráficos devem ter rótulos/legendas ou alternativa textual; a cor isolada não pode ser a única codificação de dados.
- A identidade elemental e os tokens de cor canônicos vêm do [Glossário](../00-Overview/Glossario.md). Módulos podem usar tokens próprios de apresentação, sem mudar a semântica das cores elementais ou a lógica de domínio.
- Refinamento visual deve preservar fluxos, rotas, dados, persistência e comportamento de domínio existentes. Não remover uma função para aproximar uma captura estática; diferenças justificadas pelo produto devem permanecer acessíveis e ser documentadas.
- Validação responsiva deve cobrir larguras de celular compacto, celular padrão, tablet e desktop (referências usuais: 360, 390, 768 e 1440 CSS px), com conteúdo longo, estados vazio/preenchido, teclado e rolagem.
- Fixtures e dados demonstrativos devem ficar em perfil isolado de teste; não gravar registros fictícios na conta real do usuário.

### 2.1 Referências visuais legadas

O diagrama histórico também propunha fundo `#0A0A0F`, cartões `#1A1025`, destaque dourado `#FFD700`, violeta `#9D4EDD`, fontes Cinzel/Playfair/Inter/Roboto e glows, partículas e auras. Esses itens foram preservados como referência de conceito, mas não foram ratificados como tokens globais nem como requisito de movimento. A implementação deve seguir os tokens atuais do produto, manter legibilidade e movimento reduzido; uma futura decisão de design system pode ratificar ou substituir essas propostas.

## 3. Fluxo de onboarding registrado

O fluxo visual de onboarding do produto contém estas etapas conceituais:

1. Boas-vindas ao Conselho Elemental.
2. Escolha ou configuração inicial do avatar.
3. Apresentação dos quatro Elementos.
4. Seleção das áreas de vida iniciais.
5. Primeira criação contextual de Action ou Habit.
6. Entrada no Santuário com as áreas escolhidas.

Um diagrama antigo propunha exigir pelo menos uma área por Elemento. Essa obrigatoriedade não está definida nos contratos atuais de domínio e não deve bloquear onboarding até ser ratificada pelo Produto. Onboarding não deve criar pontuação, Prana ou entidades classificadas sem ação explícita do usuário.

## 4. Fluxos de interface do Módulo de Treino

O Módulo de Treino mantém dados específicos no próprio domínio e encaminha `base_value`, esforço e execução ao Core conforme [Ações e Hábitos](./02-Acoes-e-Habitos.md) e [Motor de Pontuação](../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md). As superfícies abaixo não autorizam o módulo a duplicar pontuação ou Prana.

| Superfície | Fluxo de usuário e requisitos de apresentação |
|---|---|
| Seleção/catálogo | Exibir categorias e planos existentes, estado de seleção claro e ação para abrir/criar o treino. Preservar filtros e sessão ativa; não limitar catálogo artificialmente. |
| Prévia | Apresentar nome, duração e dificuldade quando disponíveis, programa de exercícios e ação iniciar/continuar. Mídia tem fallback visual; não exibir controle de reprodução sem fonte válida. |
| Sessão ativa | Exibir estado real dos exercícios e das séries, progresso baseado em registros reais e comandos acessíveis de concluir/pular. Confirmação é necessária antes de finalizar uma sessão incompleta quando a ação descarta ou encerra progresso não resolvido. |
| Resumo | Apresentar métricas disponíveis, horário e exercícios concluídos/pulados. Salvar, compartilhar e recarregar não podem aplicar recompensas duplicadas. |
| Painel | Priorizar métricas reais do módulo e explicar escala/meta contextual. Stamina e Prana devem ser identificados como recursos de jogo, não sinais fisiológicos. |
| Insights e semana | Mostrar tendências, séries e períodos apenas quando houver dados correspondentes; estados vazios devem permanecer honestos. Preferências de calendário e datas locais devem ser respeitadas. |
| Histórico | Agrupar por período local, permitir abrir sessões existentes e oferecer ações úteis para estados vazios ou mês sem registros. |

### 4.1 Referência visual do Fitness

Os valores abaixo consolidam a direção visual registrada nos briefs do módulo. São referências de design, não medições certificadas de Figma nem dados de domínio; tokens implementados devem permanecer nomeados e centralizados no sistema de estilos do projeto.

| Token/recurso | Referência visual |
|---|---|
| Canvas | `#101011`; fundos profundos `#0B0B0C` / `#080809` |
| Superfícies | `#252B3A`, variações `#292F3E`, `#303646`, `#202532` |
| Primária | `#8582F2`; hover `#9491FA`; lavanda `#D9D8FF` |
| Texto | `#F5F5F7`; secundário `#9A9AA4`; discreto `#72727D` |
| Estados | verde `#00C99A`, vermelho `#FF4F55`, coral `#EF7D7D`, laranja `#FF9B52`, azul `#6697F2` |
| Forma e tipografia | cartões com raios de 18–32 px; sheets ~36 px; sans-serif do projeto; títulos 28–34 px e corpo 15–17 px como referências |

Composição responsiva de referência: margens móveis próximas de 24 px; cartões e navegação não podem se estender sem limite em desktop; botão primário deve ter alvo de pelo menos 44 px. Prévia pode usar hero de 200–230 px e curva superior aproximada de 52 px; cards de exercício, 76–88 px; progresso de série, 4–6 px. Essas dimensões são orientativas e devem ceder a conteúdo, zoom, acessibilidade e largura disponível.

Para navegação principal, preservar cinco regiões e ação central apenas quando corresponderem às rotas existentes. Em telas menores, controles fixos devem respeitar safe areas e nunca cobrir o último item rolável ou o foco do teclado.

## 5. Confirmação de ações e assistente

O assistente de texto/voz usa as mesmas operações de domínio da interface. Consultas e criações reversíveis podem seguir a intenção explícita do usuário; comandos destrutivos, externos ou que descartem progresso sem possibilidade de Undo exigem confirmação clara antes da execução. O assistente deve distinguir sugestão de comando, comunicar dados ausentes e não inferir silenciosamente tipo, área, esforço ou tempo. Ver [Integração LLM e Voz](./04-Integracao-LLM-e-Voz.md).

## 6. Referências

- Identidade e cores dos Elementos → [Glossário](../00-Overview/Glossario.md).
- Lista Diária, estados vazios e eventos de módulo → [A Lista Diária](./03-A-Lista-Diaria.md).
- Cálculo e fonte canônica dos pontos/Prana → [Motor de Pontuação e Energia](../01-Domain-Core/02-Motor-de-Pontuacao-e-Energia.md).
- Mapeamento visual e entidades → [Diagramas e Fluxos](./06-Diagramas-e-Fluxos.md).
