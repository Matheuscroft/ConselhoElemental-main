# 001 — Refinar seleção e conclusão das quests

- Status: parcialmente implementado em R12-A/B (0.1.50); QA visual, fragmentos e constância enriquecida pendentes. Ver [entrega e limites](R12-B-MOVIMENTO.md).
- As linhas e descrições abaixo registram o diagnóstico original; não representam nova inspeção do código atual.
- Commit: `987e09e`.
- Severity: MEDIUM.
- Category: interruptibilidade, coesão e feedback.
- Escopo estimado: CSS de quests, mapa/painel/recibo e tokens; fragmentos dependem do contrato R12.

## Problema confirmado no código

Raiz do projeto: `/Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app`.

Em `src/components/quests/quests.css:51`, `.quest-step-detail` usa `animation: quest-reveal .18s ease-out`. O keyframe de `:121` é:

```css
@keyframes quest-reveal { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
```

`QuestTrailMap.tsx` monta/desmonta o painel na seleção. A animação de entrada reinicia quando outro painel é montado. O código não tem transição espacial entre seleções. Isso é limitação estrutural observada, não comprovação de travamento percebido no navegador.

Em `quests.css:11`, botões usam `transition: background .18s,box-shadow .18s,transform .18s`; linha 49 usa `transform .2s` para chevron. Tempos/curvas ficam locais. A implementação já respeita reduced motion nas linhas 139–149; preservar essa cobertura.

`QuestHub.tsx` mostra recibo com check e métricas registradas. Oportunidade aditiva: conclusão rara pode comunicar aquisição e retorno à trilha com clareza. Não há contrato de fragmentos atual; não inventar saldo para animar.

## Alvo proposto (não valores medidos do vídeo)

Consolidar tokens na superfície elemental existente, com escopo de quests:

```css
--quest-ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--quest-ease-move: cubic-bezier(0.77, 0, 0.175, 1);
--quest-ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
--quest-motion-press: 160ms;
--quest-motion-panel: 180ms;
--quest-motion-sheet: 250ms;
--quest-motion-counter: 250ms;
--quest-motion-stagger: 40ms;
```

1. Pressão: face desce 2px sobre base fixa, resposta até 160ms; não animar box-shadow a cada frame. Botão acionável por teclado sem entrada decorativa antes da resposta.
2. Seleção: painel usa opacity 0→1 e scale(.97)→1 por 180ms, origem junto ao selo. Fechamento não deve prender foco no conteúdo oculto; seleção rápida substitui o alvo a partir do estado atual, sem fila de animações.
3. Sheet mobile, se escolhido: translateY(100%)→0 e opacity por 250ms, curva drawer. Reutilizar primitivo existente com foco/escape/scroll lock. Não montar dois modais concorrentes para uma conclusão.
4. Selo concluído: troca para check e realce de 250ms. Barra usa scaleX no preenchimento com origem esquerda; valor acessível reflete imediatamente o estado confirmado. Não animar largura de layout nem recalcular progresso no frame.
5. Resultado: conteúdo legível imediatamente; entrada opacity/scale(.97) por 180ms, até três métricas com intervalo 40ms, sem atrasar botão. Valores acessíveis finais; contagem decorativa aria-hidden se usada.
6. Fragmento, **após R12-D**: giro de reveal em transform (de -70deg a 0, 250ms), brilho independente opacity 180ms, deslocamento para coleção por transform 250ms. Total decorativo até 800ms, nunca bloqueia navegação. Não forçar morph entre imagens realistas; quatro assets pequenos próprios. Sem rotação infinita, som automático ou efeito na tela inteira.
7. Constância: animar mudança do número 250ms e check do dia quando o recibo confirma novo dia. Não animar em todo render nem abrir celebração por cada tarefa do mesmo dia. O antes/depois vem de domínio; não calcular `streak + 1` no componente.
8. Redução de movimento: sem viagem, rotação, salto ou stagger; mostrar resultado estático com fade opcional de até 120ms. Não desativar indicador de estado, foco ou anúncio.

Esses tempos são metas do app. O vídeo foi amostrado, não medido com precisão de frames/taps; validar sensibilidade em dispositivo real.

## Convenções e passos

1. Conferir drift da base e fila; manter alterações alheias. Reservar os arquivos do lote visual.
2. Reutilizar `.quest-primary`, `ArcaneIcon`, Dialog/Popover e CSS elemental; não trazer CSS absoluto do mockup 430px. Tokens semânticos herdados da identidade atual.
3. Evoluir mapa/seleção no piloto com dados existentes. Separar wrapper de posicionamento (offset da trilha) da face animada; não sobrescrever transforms um do outro.
4. Usar transitions para estados reversíveis; ao montar/desmontar, usar ciclo de presença existente ou CSS de entrada, com fallback e fechamento correto. Framer Motion já instalado pode tratar presença; não adicionar biblioteca nem rAF para movimentos predefinidos.
5. Retorno da conclusão conserva deep link/rolagem e restaura foco no próximo selo. Seleção não inicia timer. Se não houver próxima etapa, retorno ao cabeçalho da trilha; não concluir macro no frontend.
6. Painel não precisa virar fullscreen a cada ação. Detalhe inline ou lateral conforme largura; reservar espaço e conter overflow para título longo.
7. Só conectar fragmento/constância enriquecida após recibo confiável. Fixtures de demonstração, se necessárias, ficam explicitamente em ambiente de teste, nunca no saldo real.

## Limites

Não editar stores, tipos de domínio, fórmulas, regras de streak, recorrência, XP/Prana ou Supabase neste plano visual. Não reaplicar prêmio no final da animação. Sem cópia de personagens/áudio/identidade Duolingo. Não inferir fluidez a partir da simples compilação.

## Verificação futura

- Mecânica: `node --test tests/quests/*.test.mjs tests/elemental/*.test.mjs`; `npx tsc -b`; `npm run lint`; build Vite com `envDir:false`. Executar só na rodada de implementação, registrando resultados reais.
- Interação: selecionar dez vezes rapidamente, interromper abertura, fechar/voltar, teclado, título longo, scroll e CTA abaixo da dobra. Sem painel antigo ativo sobre outro nem foco perdido.
- Fluxo: concluir uma vez, fechar imediatamente o recibo, consultar histórico, recarregar, Undo. Animação não altera estado econômico; anúncio uma vez por evento.
- Visual: 360/390/768/1440px, reduced motion e zoom 200%; reprodução a 10% de velocidade; dispositivo real. Nenhuma colisão com nav, perda de texto, frames longos relevantes ou movimento obrigatório.
- Pronto quando: piloto aprovado visualmente por Fábio e critérios de navegação/estado passam, com evidências. Se navegador continuar bloqueado, registrar QA pendente; não contornar restrição.
