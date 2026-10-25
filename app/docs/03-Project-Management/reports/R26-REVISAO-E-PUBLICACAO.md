# R26 — revisão e publicação R15–R26

25/10/2026 · versão 0.1.68 · Astro Boy · Fábio frontend/mobile; Matheus backend. Publicação autorizada explicitamente por Fábio nesta conversa para `Matheuscroft/ConselhoElemental-main`, branch `main`.

## Escopo entregue

Integra o checkpoint local `88c9021` (R15–R24, versão 0.1.64) e o lote R26-A/B/C/D (0.1.65–0.1.68) sobre a base remota `91fa5a5`. O fetch confirmou ausência de commits remotos novos antes da preparação. Mudanças detalhadas no [repasse](../../REPASSE-FRONTEND-PARA-BACKEND.md) e nos relatórios em [plans](../../plans/README.md).

- Capítulos de Grandes Obras; Invocar e base compartilhada de design; Forja; Astrolábio; Domínios, navegação contextual e catálogo agrupado; ícones próprios, Pilares e Mapa; Roda do Destino gratuita com atividades reais.
- Ciclos: filtros/contagem da rotina, ações explícitas, subitens com identidade e hierarquia, notas separadas na apresentação, formulário reutilizado, selo/histórico/animação de constância.
- Exceções de regra autorizadas: Roda sem custo/XP automático (R24) e constância por agenda (R26-D). Nenhuma fórmula de XP/Prana foi alterada. Único store alterado neste lote: `appStore.ts`, nos cálculos de streak e extração do predicado existente.
- Novo briefing Astro Boy R26, com teste para atualização de perfil que já reconheceu R14; sem publicar perfil local e sem mensagem externa ao Matheus.

## Verificações executadas nesta revisão

| Verificação | Resultado |
| --- | --- |
| `node --test scripts/astro-boy.test.mjs tests/**/*.test.mjs` | **159 testes passaram**, zero falhas na execução final |
| `./node_modules/.bin/tsc -b` | Passou |
| `npm run lint` | Passou |
| Vite via API `build({envDir:false})` | Passou, **11,13 s**; nenhuma leitura de `.env` pela configuração de build |
| Store real com storage em memória | Conclusão/Undo/reconclusão, idempotência, subitens/agenda da raiz, nativo/ledger, reload isolado e rollback de rotação passaram |
| Predicado/data | Descanso, falta programada, dias mensais inexistentes, duplicatas, entradas inválidas, início e DST testados |
| Paridade com store anterior | Pontuação, XP, Prana, streak geral e campos dos recibos iguais nos cenários comuns/nativos de conclusão e Undo; IDs aleatórios excluídos da comparação |
| Testes de apresentação | Projeção sem escrita, fallback explícito, gate sem celebração por troca de agenda; SSR não prova fluidez |
| Revisão manual | Diff de handlers e escopo de store conferidos; checklist React aplicado; cálculo/semântica e documentos reconciliados |

Logs locais: `/tmp/conselho-r26d-all-tests.log`, `-types-final.log`, `-lint-final.log`, `-build-final.log`; paridade em `/tmp/conselho-r26d-reward-parity.json`. São evidências desta máquina, não arquivos necessários à execução de Matheus. Testes reproduzíveis estão versionados. Testes Deno específicos de workout/Supabase não foram executados nesta revisão.

Checagem de publicação: versões de package/lock sincronizadas; nenhuma correspondência nos padrões de chave/JWT/token/chave privada procurados no diff e nos novos arquivos de texto, sem imprimir credenciais. Isso não equivale a auditoria completa de segurança. `git diff --cached --check` passou após remover uma linha vazia extra no fim do novo helper de agenda.

Falhas intermediárias corrigidas: fixtures inicialmente não passavam `startDate` ao criador real e não forneciam `window.localStorage`; teste de briefing ainda esperava o texto R14. Esses problemas de teste foram corrigidos, a suíte final foi repetida integralmente e passou. Nada foi silenciado para transformar falha em aprovação.

## Limitações que acompanham a publicação

- QA renderizado/toque/fluidez em 360/390/768px ainda pendente; bloqueio anterior do navegador não foi contornado. Não chamar a entrega de validação visual integral.
- Build mantém avisos de chunks grandes e Browserslist desatualizada. Medir carga no celular antes de definir particionamento do bundle.
- Streak por agenda é parcial: diário/semanal/mensal, com agenda atual e sequência até a última execução. Rotações e YEARLY mantêm cálculo anterior explicitado. Sem histórico versionado de agenda/turnos, sem atualização de atrasos à meia-noite, sem nova constância geral.
- R25-A/B (backup/restauração e associação segura à conta) continuam **não implementados**. Push de código não salva atividades pessoais. Não habilitar importação/reset de conta sob promessa de preservação.
- Fragmentos, propagação de NOTE, snapshots/progresso macro, vínculos R19 e divergência Forja continuam na fila. Não foram reescritos no escopo visual.
- Revisão e custódia documental executadas sequencialmente pelo coordenador; revisão independente não executada. Sem deploy, migração, envio de credenciais ou comunicação externa.

## Publicação

Preparação concluída. Commit, push e confirmação do SHA remoto serão registrados abaixo somente após execução bem-sucedida. O histórico desta seção prevalece sobre notas antigas de “local” dos lotes individuais.
