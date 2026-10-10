# Modalidades e registro executado — M01 / 0.1.20

## Escopo e fontes

Implementação em 10/10/2026 no checkout principal, Astro Boy/Sol médio. Capturas 23.37.17/26: modalidade marcial com catálogo Yoga/Calistenia sem contexto. 23.37.38: preview com grande hero vazio e título duplicado. 23.37.52/58: ficha antiga com cores e organização diferentes do kit. 23.38.20: todas as séries abertas e controles de execução cobertos pelo rodapé. 23.38.43: recursos sem configuração e números potenciais pouco claros. 23.39.05: volume misturado e unidade kg inadequada para duração.

Base: documentação canônica de módulos/adapters, pontuação e ADR-002. Divergência preexistente: o módulo Workout pontua diretamente por ledger local/score, enquanto a documentação projeta integração por Action/ExecutionLog. Não criar outro motor nem reescrever o core neste lote. A distribuição elemental efetiva deste módulo é Terra; não inferir outro elemento pela modalidade.

Modalidades presentes em programas brasileiros, sem alegar ranking nacional: Taekwondo, Jiu-jitsu, Judô, Karatê, Boxe, Muay Thai, Capoeira. Fontes: [oficinas esportivas de Goiás](https://agencia.go.gov.br/projeto-construindo-campeoes-capacita-300-professores/), [debate do Ministério do Esporte](https://www.gov.br/esporte/pt-br/noticias-e-conteudos/esporte/ministerio-do-esporte-debate-papel-educacional-das-artes-marciais-durante-audiencia-na-camara). Esforço percebido é um relato subjetivo, conforme [CDC](https://www.cdc.gov/physical-activity-basics/measuring/); a fórmula de carga abaixo é convenção de acompanhamento do app, não cálculo de calorias ou diagnóstico.

## Base de atividade

21 registros nativos adicionados ao getter do catálogo, sem sobrescrever os 24 anteriores: corrida contínua/intervalada; crawl/peito/costas; pedalada externa/ergométrica; prática técnica e rounds para sete artes. São modelos para registro, não prescrição de técnica ou treino. Default de dez minutos é planejamento editável, não execução inferida. Estimativa planejada considera a duração de cada bloco + descanso; corrigido fallback fixo de 45s que mostrava 5 min mesmo com bloco de 10 min. Repetições sem tempo mantêm o fallback anterior.

Criação filtra categoria e arte; catálogo misto fica disponível apenas em Treino misto/Personalizado. Mudar modalidade com itens incompatíveis bloqueia salvar e orienta remover/trocar para misto, sem apagar escolhas silenciosamente. Registros legados incompatíveis não são migrados ou excluídos.

## Medidas, distribuição e recompensas

- Cada bloco pode registrar tempo ativo real, esforço percebido 1–10, distância opcional (metros na natação, km convertidos para metros na corrida/ciclismo) e descrição. Native exige tempo >0 e esforço válido na UI e store; descrição não é interpretada automaticamente.
- `activityLoad = tempoAtivoSegundos / 60 × esforço`, em unidades arbitrárias (u.a.). Somente concluídos/não pulados entram. Intervalos e relógio da sessão são medidas separadas. Notas não aumentam pontos.
- Native não produz volume de carga externa nem recorde de 1RM. Perfis musculares editoriais aproximados variam por nado/arte. Usuário pode ajustar os 14 grupos no planejamento; soma precisa ser 100%, snapshot preservado na sessão. Isso distribui trabalho estimado, não mede ativação ou desenvolvimento muscular.
- Distribuição usa carga percebida quando há observações, excluindo séries sem essas observações. Sem elas, mantém o índice legado. Métodos não são somados num percentual global; faltam dados históricos para uma conversão física legítima.
- A base de recompensa soma carga percebida das séries observadas e volume legado das séries sem observações (somente legado, nunca Native sem esforço). Terra = floor(base/10), mínimo 1 se base >0; XP = round(Terra/2). Convenção de jogo, não comparação física entre modalidades. Recursos usam tempo ativo declarado nas novas observações; sessão sem observações mantém tempo do relógio e regra anterior. Native sem blocos concluídos gera zero custos/recompensas.
- Fórmula nova marcada `workout-activity-v2` no ledger/sessão; histórico existente não é recalculado. Finalizar/reaplicar usa a proteção idempotente existente. Terra efetiva, Fogo/Água/Ar zero neste módulo; mudar essa taxonomia exige integração coerente com áreas/ações canônicas, não uma associação automática ao esporte.
- Saúde usa carga percebida nos gráficos quando existem observações nessa semana; caso contrário, mostra índice de volume legado. Minutos de atividade usam tempo ativo declarado quando disponível, senão duração legada. Resumo mantém tempo do relógio e deixa sua diferença explícita. Gráfico de carga não mistura kg, repetições e minutos.

## UI e limites

Preview/ativo/resumo usam composição mobile dark/Inter/violeta e largura tablet, sem hero vazio/aurora ou sidebar neste fluxo. Mapa e compartilhar não se sobrepõem. Ficha técnica tem header estável, instruções priorizadas, corpo rolável, benefícios/variações/perfil recolhíveis e targets de fechamento. Ativo mostra um bloco pendente por vez; concluídos compactos; tempo em minutos para atividades, detalhes de esforço/distância/notas. Rodapé compacto com reserva de espaço e rótulo Ocultar relógio, sem prometer pausa real.

Sem GPS/sensores/IA interpretando texto; registro manual. Sem medição clínica, calorias inventadas ou estimativa automática de intensidade. Ganho de Força permanece exclusivamente na regra existente de recordes; Native por duração não cria recorde fictício. Evolução de regras de elementos no core permanece separada da implementação física deste lote.

## Evidências

`/Users/fabioandre/Developer/conselheiro-backups/fitness-modalities-20261010/`: store anterior; verify.mjs/verify.json e capturas create/preview/detail/active/summary/health em 360/390/768; edge.mjs/edge.json; profile.mjs/profile.json; distance.mjs/distance.json e distance-comma.mjs/distance-comma.json; logs build/lint. Testes com perfil temporário; artefatos de testes não são dados do usuário. Fluxo Yoga legado reexecutado com criação/continuar/reload/finalização/histórico (evidências em fitness-create-20261009, substituídas pelo teste atual). Nenhuma publicação ou commit.


## Fechamento verificado

Build 0.1.20 passou; lint 0 erros/quatro avisos preexistentes; git diff --check passou. Catálogos de quatro esportes sem Yoga/Calistenia indevidas; Taekwondo criado pela UI, ficha/preview/ativo/resumo e Saúde capturados em 360/390/768. Registro 10min × esforço6 =60u.a., Terra6, força0, um ledger após reaplicar. Reload preserva observações; Saúde recebe 10min e gráfico de carga. Testes adicionais: falta de esforço bloqueia Native; blocos pulados geram zero; esforço2/8 modifica previsão para2/8; perfil editado soma100% e persiste; 1.5/1,5km digitados pela UI convertem a1500m, carga40 com esforço4 e estimativa planejada11min. Campos decimais corrigidos após teste reproduzir distância5000m indevida. Fluxo Yoga legado retestado após mudança dos campos.
