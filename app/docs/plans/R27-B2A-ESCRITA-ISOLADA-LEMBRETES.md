# R27-B2A — Escrita isolada de metadados — 0.1.113

30/10/2026 · Astro Boy sequencial · Sol Alto confirmado · checkout `codex/fitness-ui-integration`, base `b11ed9d`. Continuação de [B1](R27-B1-PERSISTENCIA-LEMBRETES.md). **Coordenador implementado e testado, release de escrita de lembretes permanece false; sem interface/timer/push nem gravação pessoal. Não equivale ao fechamento de toda a B2.**

## Decisão de arquitetura

As abas existentes mantêm lease compartilhado do progresso até destruir o documento. Solicitar o exclusivo dentro da aba hidratada não é seguro nem pode ignorar os demais usuários da persistência. Este lote implementa caminho isolado **pré-bootstrap**, sem imports runtime de stores, serviços ou planner de domínio. Não adiciona journal/armazenamento de atividade paralelo.

- `reminder-write-plan.ts`: prepara plano a partir dos bytes de progresso fornecidos, confirma conta/personagem/revisão e calcula metadados pela projeção existente. Não lê storage, não grava. Módulo de domínio fica fora do coordenador de startup.
- `exclusive-reminder-write.ts`: gate fechado, confirmação específica do aviso, cópia de consentimento/plano antes dos awaits, validação das duas projeções e construção interna do alvo. Só substitui `core.state.user.reminderState`; XP, atividades, contas e Treinos são copiados da origem validada, nunca de um alvo arbitrário enviado pelo chamador.
- Reutiliza `PROGRESS_SESSION_LOCK` e `runExclusiveRestore`/`prepareRestoreJournal`: lease exclusivo, confirmação de outras abas fechadas, recusa após app importado, comparação com cópia anterior, bytes de baseline, intenção/resolução de conta, readback e diário de recuperação existentes. Nenhum desses módulos preexistentes foi alterado.
- `reminder-release.ts`: `REMINDER_WRITES_RELEASED=false`, sem seletor por URL/storage/env. Só testes substituem o módulo. Não abre os gates de conta/restauração.

Mesmo após sucesso, diário permanece como barreira ao startup até concluir conferência/recuperação/retomada explícitas existentes. **Não há limpeza automática nem retry cego.** UI futura não pode chamar esse método como se fosse uma gravação interativa comum. Interrupção antes do primeiro journal deixa origem intacta; após journal, startup bloqueia hidratação; recuperação explícita mantém alvo confirmado ou retorna à origem, recusando mudanças alheias.

A serialização de destino do diário existente pode normalizar espaços/formatação JSON dos envelopes, incluindo Fitness. Isso não é preservação byte a byte de todo envelope no sucesso: testes conferem igualdade dos dados, IDs, números e arrays. O baseline anterior mantém bytes originais para recuperação. Nenhuma alteração de dado Fitness é autorizada por essa normalização.

## Verificações executadas

- Sete testes novos de coordenação; **21 testes de lembretes aprovados** em `/tmp/r27-b2-reminders-final.log`. Última expansão do teste inclui envelope Fitness formatado; **7/7 coordenador repetidos** em `/tmp/r27-b2-coordinator-final.log`.
- **565 globais aprovados**, zero falhas, 26,48s: `/tmp/r27-b2-all.log`. A expansão posterior de fixture foi conferida no conjunto do coordenador; não implica nova global depois dela.
- TypeScript/lint exit 0 (`/tmp/r27-b2-types.log`, `...-lint.log`); Vite `envDir:false` exit 0 em **27,78s** (`...-build.log`). Avisos existentes de chunks/Browserslist mantidos.
- Cenários: gate/consentimento/locks ausentes sem I/O; perfil/revisão/baseline cancelados; intenção de conta; aba concorrente cooperativa; app já hidratado; mutação do plano/consentimento após despacho; interrupção antes/depois de cada uma das quatro gravações; recuperação explícita e startup bloqueado; grafo sem stores/services/planner.
- Primeira direcionada 5/6: harness usava `hasUnrelatedChanges`, propriedade inexistente; corrigida a expectativa para `outcome !== conflict`. Não alterado o produto para atender ao teste nem enfraquecida proteção. Evidência em `/tmp/r27-b2-targeted.log`.

Mocks de locks/storage e processo Node, sem navegador/abas reais, quota física ou serviços remotos. Não provam interoperabilidade de cliente antigo/aba que ignora leases, BFCache, disco cheio real, foco, teclado ou fluidez. Confirmação de fechar abas é precondição humana, não descoberta técnica de clientes antigos.

## Preservação e custódia

Baseline `/tmp/r27-b2-before.json`; fontes preexistentes protegidas intactas, salvo whitelist de versão. SQL NÃO aplicado só aceita 0.1.113; sem schema/policy/gate novo no servidor. Não houve leitura de dados reais, secrets, Auth, rede do app, migração, deploy, commit/push, subagentes ou nova tentativa de navegador bloqueado. Custódia documental sequencial pelo Astro Boy. Versões, links, diff-check e hashes conferidos no fechamento.

## Próximo R27-B2B — manter Sol Alto

Fechar o handoff e a recuperação de um aviso na experiência do produto: preparação/autorização do plano, retenção segura antes de sair da aba, abertura pré-bootstrap, confirmação de retorno, comportamento se usuário cancelar e falhas antes/depois da entrega ao workspace. Não transformar o gate em true neste lote. Resolver ergonomia sem pedir reload por ação ou inventar persistência paralela; compatibilizar com sync/conta e fuso/offline antes de ativação.

Enquanto isso, comando síncrono B1 não oferece essas garantias e não deve ganhar botão na UI. Corpo-ecossistema/fragmentos/push e conta hospedada continuam separados. Somente depois dos contratos/handoff e testes, avisar para Médio na interface. QA visual mobile/tablet permanece pendente.
