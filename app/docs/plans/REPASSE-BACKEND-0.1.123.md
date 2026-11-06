# Repasse para Matheus — 0.1.123 / 05/11/2026

## Resultado e limites

H01 na [fila operacional](../FILA-ENTREGAS.md), Astro Boy sequencial. Pacote documental para Matheus continuar o backend sobre as atualizações de Fábio; não cria outra fila. Sem alteração de código/versão, commit, push, deploy, dados pessoais ou SQL remoto neste lote.

Servidor reiniciado via API Vite com envDir:false, host 127.0.0.1, porta 5173. HTTP 200 no Santuário. open_in_codex respondeu queued para abertura no painel direito; a ferramenta CUA negou observação pela permissão salva da origem. Abertura solicitada não é confirmação visual. Não foi usado outro navegador/driver para contornar o bloqueio.

## Onde paramos

- Produto local 0.1.123, branch codex/fitness-ui-integration, HEAD be78b1e. Main remota também be78b1e na consulta deste lote. Branch remota codex/fitness-ui-integration ainda em 03f05886e5c8afbc8d28dc8ff54da4945d44f626: ela não contém automaticamente estas alterações locais.
- [Pull e mescla](INTEGRACAO-MAIN-2026-11-05.md) concluídos: catálogos/editor remotos de Matheus integrados aos contadores, recorrência/URL, recibos de XP, feedback e preservação locais. Snapshot anterior c41b2bd mantido; não reaplicar sobre a mescla.
- A suíte da integração passou com 661 testes, TypeScript, lint e build. Resultado da rodada anterior, sem nova execução/revalidação visual aqui. O build mantinha avisos de tamanho de chunk e Browserslist.
- F6 (retomar acesso após reload) tem código e testes sintéticos, mas foi interrompida para o pull. Continua parcial. Conta pessoal integral e migração do progresso de Fábio ainda não liberadas.
- Controles de conta integral, restauração e lembretes têm gates estáticos false. Preparação/armazenamento local de avisos não equivale à entrega de notificações.
- Fragmentos e inventário correspondente ainda não implementados. Não confundir XP/recibo ou elementos visuais com um saldo de fragmentos.

## O que Matheus recebe neste pacote

1. Identidade/movimento já construídos: Santuário/elementos, navegação e descoberta, páginas e cronômetro elementais; aprimoramentos de Domínios, Pilares, Mapa, Forja, Invocar, Grimório, calendário/Lua/Estações e demais fluxos descritos nos relatórios. Existem pontos de aceite mobile pendentes; não é declaração de 100% de acabamento.
2. Atividades: trilhas de Rituais/Jornadas/Grandes Obras, subitens por semântica, constância por agenda, contadores genéricos por ocorrência e conclusão separada. Ciclos agora usa a simplificação visual remota com os comandos locais preservados.
3. Recompensas: XP por conclusão válida e reversão por recibo; recuperação retroativa explícita, sem recompensar novamente em reload/importação/contagem extra. Animações recebem o resultado do comando; não criam recompensas.
4. Treinos: catálogo ampliado remoto com anatomia/perfis descritivos, biblioteca/editor e feedback local. Auditor de backup aceita os novos grupos/tipos, mantendo recusa de dados inválidos. Não recalcular sessões/recibos antigos.
5. Preservação/conta: backup conjunto Core/Fitness, checksums/auditoria, conferência/recuperação isolada, versões/recibos/CAS e isolamento do sync legado. Métodos experimentais de escrita continuam protegidos e não autorizam transferência pessoal.
6. Avisos: protocolo de ocorrência/revisão, metadados por perfil, conferência e recuperação sintética. Entrega em segundo plano/dispositivo fechado ainda exige solução própria e autorização de configuração.

## Frentes em ordem de dependência

| Ordem | Frente | Dono principal | Critério para encerrar |
| --- | --- | --- | --- |
| 1 | Revisar/fechar F6 e jornada de conta nova | Matheus, com Astro Boy; Sol Alto nos contratos | Cadastro/confirmação/login/recuperação/reload/expiração/saída e conta nova vazia coerentes; nenhuma adoção silenciosa de dados locais ou legado |
| 2 | Compatibilidade e aceite hospedado | Matheus; Sol Alto | Revisão 123 aplicada somente no escopo autorizado, RLS/JWT/isolamento A/B e CAS/recibos comprovados; gates só após critérios |
| 3 | Migração pessoal e continuidade entre dispositivos | Matheus + aceite de Fábio; Sol Alto | Cópia pessoal integral conferida, associação deliberada e readback com mesmos IDs/histórico/XP/Prana/Core/Fitness, sem repetir conclusões |
| 4 | Aceite mobile, acessibilidade e movimento | Fábio; Sol Médio | Fluxos essenciais a 360/390 px e tablet, retorno/foco/toque, erro/recarga e movimento reduzido; separar emulação de dispositivo real |
| 5 | Fragmentos e inventário correspondente | Contrato com Matheus; UX com Fábio | Regra aprovada: um fragmento por conclusão válida, elemento da atividade, saldo separado, idempotência/reversão/persistência/backup definidos antes do efeito visual |

Não é preciso esperar todo o polimento para entregar a branch de revisão do backend. Ela deve se apresentar como código integrado com funcionalidades ainda desativadas, e não como release de conta pronta para produção.

## Pontos concretos para Matheus

- Começar por AccountWorkspace, account-live-access, account-tab-access, resume-account-session, mount-account-app e main. Retomada opt-in usa sessionStorage por até 12h; validar expiração real, renovação, logout e cópia de aba. Web Locks protege documentos cooperativos, não todo escritor externo.
- Revisar nova conta vazia: login não significa importar as atividades deste computador. A conta não pode receber dados de outro usuário por default; perfil local e identidade de Auth são fronteiras distintas.
- Confirmar o caminho oficial de conta integral e o isolamento de Auth/authStore/supabaseCloudSync legados. O sync parcial legado não é garantia de salvar todos os recursos/treinos/perfis.
- Candidato local `supabase/migrations/20261106022901_account_archive_version_123.sql`: somente compatibilidade do produtor, condicionado ao corpo 122 e escrita false. Não aplicado neste lote. Confirmar banco/histórico antes de aplicar; não editar migrações instaladas nem rodar db push da pasta histórica.
- Última evidência hospedada de 30/10 suporta até 122 e gates false; não foi atualizada nesta análise. Evidências versionadas em docs/plans/evidence/CONTA-*.json. URL pública/callback/templates e variáveis precisam ser configurados por ambiente, sem copiar .env/sessão pessoal.
- Aceite essencial agrupado: conta A/B, fresh device, cadastro/confirmação/recuperação, offline, resposta perdida, conflito, recarga no meio da escrita e retomada sem duplicar. Usar contas/dados sintéticos em ambiente autorizado; não refazer longas rodadas manuais de microinterações.
- Nunca reconstituir XP/Prana por replay de tarefas. Nunca mesclar snapshots automaticamente nem usar reset/clean para integrar o trabalho de alguém.

## Preparação do push

No início deste lote eram **86 modificados rastreados + 257 arquivos novos**, todos sob app. Um push de HEAD sem commit desses arquivos não os entrega a Matheus. O [inventário complementar](evidence/REPASSE-0.1.123-INVENTARIO.json) foi gerado ao encerrar, com paths/status/SHA; não inclui arquivos ignorados ou dados do navegador. A própria entrada do inventário fica sem hash para evitar autorreferência. Checagem por nome não substitui revisão de conteúdo sensível antes da publicação.

Sequência recomendada, ainda sem execução de commit/push:

1. Revisar o inventário e o diff completo, incluindo os arquivos novos indispensáveis (bootstrap, helpers, componentes, testes e SQL). Não usar somente git diff de rastreados.
2. Preparar um commit de integração coerente com as dependências de stores/tipos/consumidores. Evitar dividir esses contratos em commits que não compilam. Custódia documental pode ficar em commit posterior. Manter F6 marcada parcial e gates false.
3. Selecionar paths revisados explicitamente; excluir .env, perfis .astro-boy, sessões, credenciais, arquivos de progresso pessoal e caches. Rever git diff --cached --stat, git diff --cached --check e conteúdo antes do commit.
4. Confirmar que as verificações registradas correspondem ao conteúdo publicado. A integração 0.1.123 já tem 661 testes/checks aprovados; repetir somente se o código/contrato mudar ou houver nova falha.
5. Publicar a branch codex/fitness-ui-integration e abrir revisão para main, conforme autorização de publicação. Preservar o histórico e não usar force push. Conferir se o repositório gera deployments automáticos antes do push; configuração não foi inspecionada aqui.
6. Registrar o hash efetivamente enviado e o resultado remoto; até isso ocorrer, Matheus não tem este pacote pelo GitHub.

### Recebimento por Matheus após a branch ser publicada

Com checkout limpo ou mudanças dele já preservadas, executar na raiz Git:

```sh
git status --short
git fetch origin
git switch -c codex/backend-conta-0-1-123 origin/codex/fitness-ui-integration
```

O comando switch pressupõe que esse novo nome de branch ainda não exista. Não executá-lo para descartar alterações locais. No app, ler primeiro CONTINUIDADE, REPASSE-FRONTEND-PARA-BACKEND e este documento; depois usar o lockfile nas dependências e rodar as verificações pertinentes. Variáveis do ambiente ficam fora do Git. Matheus mantém seu perfil local de onboarding; não versionar o perfil desta máquina.

## Preservação do progresso de Fábio

Push/Vercel publicam código; não transportam localStorage. 127.0.0.1 e o domínio futuro da Vercel são origens distintas. O progresso atual só estará na conta após exportação integral conferida e associação autenticada com recibo, dentro do fluxo aceito. Este pacote de código não é uma cópia das atividades pessoais. Não limpar storage, reinstalar o perfil de navegador ou concluir/excluir atividades reais para testar.
