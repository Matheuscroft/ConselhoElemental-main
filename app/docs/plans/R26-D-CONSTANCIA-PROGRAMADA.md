# R26-D — constância por execuções programadas

25/10/2026 · 0.1.68 · Astro Boy, execução e revisão sequenciais. Base 88c9021; R26-A/B/C preservados. Fábio autorizou: **“Contar execuções programadas: dias de descanso não quebram a sequência.”** Publicação em main autorizada separadamente nesta conversa. Matheus continua responsável pelo backend; esta é uma mudança delimitada de contrato, explicitamente aprovada.

## Implementação e semântica

- `habit-schedule.ts` extrai, sem mudar a regra, o predicado de elegibilidade que já era usado por `appStore`. Não foi criado outro motor de recorrência.
- `habit-streak.ts` calcula uma ocorrência por data local elegível. Segunda/quarta/sexta concluídas e segunda seguinte = 4. Se faltar sexta, a segunda seguinte inicia 1. Dias de descanso não quebram o intervalo. Datas mensais inexistentes não viram faltas.
- Subitens usam a agenda da raiz, mesmo quando sua cópia antiga difere. Datas anteriores ao início e conclusões fora da agenda não somam ocorrências; recibos/pontos continuam preservados.
- Conclusão/Undo de hábitos comuns e treinos vinculados usam o mesmo cálculo. Fluxos de prêmio, tempo, propagação, ledger e rotação permanecem em seus comandos existentes.
- Ciclos lê o cálculo novo imediatamente sem migrar contadores persistidos em massa. A próxima conclusão/Undo persiste o resultado no hábito. O ranking usa a mesma projeção. Recordes preservados pela política existente: hábitos comuns usam máximo registrado; Undo nativo recalcula o recorde como antes.
- `lastCompletedAt` representa a última conclusão válida registrada, inclusive fora da agenda; não confundir com última ocorrência elegível. Horário válido é preservado. Constância geral do personagem continua independente e inalterada.
- Animação exige aumento de valor E aumento do número de recibos na mesma conta/ciclo. Alterar agenda sozinho não celebra. Respeita movimento reduzido e cancela animação ao desmontar.

## Limites explícitos

É uma **sequência registrada até a última execução**, não um contador de atrasos atualizado à meia-noite. A falta entra no cálculo entre conclusões; o selo explica isso. Usa a agenda atual porque não existe histórico versionado de mudanças de agenda.

Rotações (inclusive vínculo legado identificado por membership) não têm histórico completo de qual membro deveria executar em cada dia. Recorrência YEARLY também não tem configuração anual própria no contrato atual. Esses dois casos mantêm cálculo por dias corridos e são identificados na UI; não foram presumidos turnos passados. Isso é entrega parcial da constância de todos os tipos, não implementação completa de R12-D/E.

Não houve migração de dados pessoais, alteração de schema/auth/Supabase, fragmentos, bônus novo, deploy ou cópia de credenciais. A divergência de propagação de conclusão incluindo folhas NOTE segue documentada em R26-C, sem alteração silenciosa.

## Verificação

Testes de `tests/cycles/streak.test.mjs`: dez casos, incluindo cálculo semanal/mensal, duplicatas/datas inválidas, início da agenda, herança, comandos reais do Zustand, idempotência, Undo/reconclusão, treino/ledger/prêmio, reload em memória, isolamento entre instâncias, DST em New York e rollback da rotação nativa. Nenhum acesso ao armazenamento pessoal.

Teste SSR do selo: projeção da agenda, fallback explícito e ausência de gravação. Gate da celebração testado como função; fluidez da animação no navegador não foi verificada.

Comparação executada entre store anterior e atual em memória confirmou paridade de recibos (exceto IDs gerados), totalScore, XP por elemento, Prana e streak geral nos cenários de conclusão/Undo normal e nativo. Artefato local `/tmp/conselho-r26d-reward-parity.json`; não é backup pessoal.

Resultado da suíte completa, build/lint/TypeScript e publicação: [relatório de revisão](../03-Project-Management/reports/R26-REVISAO-E-PUBLICACAO.md). QA visual/toque 360/390/768px continua pendente pelo bloqueio anterior, sem contorno.
