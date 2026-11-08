# M06 — importação e descoberta mobile — 0.1.134

06/11/2026. Pedido: retomar a evolução mobile, corrigir importação bloqueada no iPhone e avançar para conta com progresso individual salvo. Autorização continuada P04 cobre atualização verificada do mesmo projeto de testes. Não é autorização para modificar dados pessoais ou ativar escrita no banco.

## Causa reproduzida e correção

Capturas do usuário: cópia 0.1.130 lida, com 9 rituais, 14 ciclos, 3 jornadas/obras e 1 sessão de treino. Destino sem progresso; auditoria impede confirmar por “As projeções da atividade discordam sobre seu vínculo”. Não houve leitura do JSON pessoal; a causa foi reproduzida com addTask/addTaskItem reais em dados sintéticos.

O TaskItem direto criado pela store usa parentId=null e taskId=ID da tarefa, enquanto a Action canônica do mesmo ID aponta parentId=ID da tarefa. A auditoria comparava as duas representações literalmente. Agora compara o pai efetivo somente quando o item é TASK_ITEM, está em childItems, tem pai nulo/ausente e seu taskId corresponde ao ID do contêiner. Pais explícitos conflitantes, taskId errado, referências ausentes e ciclos continuam impedindo restauração. Não há correção automática do arquivo, reatribuição de IDs ou nova fórmula de XP.

Regressão: criar tarefa/subitem/neto pela store; concluir hábito para produzir XP não zero; gerar cópia como produtor 0.1.130; conferir, restaurar core/Fitness e hidratar novamente. Estados persistidos correspondem ao arquivo, usuário/XP e ID do filho permanecem iguais. Arquivo original preservado e conflitos artificiais rejeitados.

## Mobile

Menu global mais compacto: selos e espaços menores; descrição em fonte de leitura e linha única; fechar com alvo mínimo de 44px; busca em 16px. Ao abrir, foco no título (sem abrir teclado automaticamente). Quando usuário ativa busca, sheet acompanha altura/deslocamento do visualViewport e mantém lista com rolagem própria. Alteração restrita ao menu, não a todos os cards do app. Aceite em iPhone físico dependerá do usuário; navegador interno responsivo é evidência separada.

## Dados e limites

Somente auditoria, menu/CSS, versão e testes/documentação alterados neste lote. Comparação por bytes da fonte contra staging 133 mostrou exatamente AllRoutesSheet.tsx, elemental-theme.css, critical-progress.ts e progress-links.ts. Stores, motores de recompensa, catálogos, IDs e dados reais não modificados. Gate local de restore continua true; conta e lembretes false.

Candidato 20261107024439_account_archive_version_134.sql gerado pela CLI (data UTC), valida produtor 134 após 133 com hash de revisão e gate fechado. Exercitado apenas em PGlite; nenhuma migração remota aplicada. Cadeia 123–134 continua candidata local, não prova de compatibilidade hospedada.

## Verificações executadas

- 21 testes direcionados: compatibilidade, workspace e candidato SQL; passaram (7,73s).
- Suíte completa: 680 testes, zero falhas/pulos, 90,25s.
- Depois, ampliado somente o teste de regressão com cópia 130, XP não zero, restauração e hidratação: sete testes de compatibilidade repetidos e aprovados (4,09s). Nenhuma fonte de produto mudou depois da suíte.
- TypeScript, ESLint e build Vite envDir:false passaram; build 49,46s. Avisos de Browserslist/chunks permanecem, não são falhas.
- git diff --check passou. Sem acesso a secrets, .env, exportação de storage pessoal ou push.

## Publicação e inspeção final

Deployment dpl_8D6uVVJ7Jceatavv2THJPbBseT8N READY/production no projeto conselho-elemental-testes, domínio fixo mantido. Build remoto passou (26,57s Vite / 58s etapa de build). HTML/entry no domínio fixo responderam 200 e entry confirma versão 0.1.134. Upload de fonte isolada, sem dados pessoais/SQL/ambiente.

Navegador interno, origem imutável isolada do deployment: arquivo sintético 130 com TaskItem direto e 4 XP de Ar passou pela conferência, consentimentos, aplicação, conferência da operação e continuação local. Depois da recarga, Santuário ainda mostrou 4/100 XP e Ritual sintético M06. Não houve acesso a storage pessoal ou teste com arquivo do usuário.

Menu inspecionado em 390×844, 360×800 e 768×1024; foco inicial no título, grupos e busca funcionam. Busca “treino” exibiu sete destinos e navegação para Treinos fechou o menu. Fechar medido 44×44 dentro da tela de 360px. Em 390×460, altura reduzida (não teclado físico), diálogo ficou entre top27,59 e bottom459,98, com lista rolável. Override removido ao terminar. Isso não comprova comportamento do teclado do iPhone; precisa de reteste pelo usuário.

[Evidências selecionadas](evidence/importacao-mobile-0.1.134/verificacoes.json), [menu 390px](evidence/importacao-mobile-0.1.134/menu-390.jpg) e [XP após recarga](evidence/importacao-mobile-0.1.134/xp-sintetico-apos-recarga.jpg). Capturas contêm apenas dados sintéticos. Revisão/custódia sequenciais concluídas; reservas encerradas. Próximo: arquivo pessoal no celular e F6/conta em Sol Alto.

## Próxima frente: conta F6 e associação

Prioridade renovada pelo pedido atual, sem depender de um novo repasse para começar a revisão de código. Sol Alto para Auth, persistência integral e concorrência; Sol Médio apenas depois, no polimento delimitado.

1. Fechar F6 no código: conta nova com progresso vazio isolado; login/confirmar e-mail/recuperação; retomada e expiração após recarga/saída, sem adotar outro perfil. Há helpers implementados em account-session, resume-account-session, mount-account-resume e AccountWorkspace; o gate permanece false e não representam funcionalidade liberada.
2. Preparar pacote hospedado único revisado para o produtor atual, redirects de Auth do domínio fixo e teste essencial de duas contas separadas. Aplicação remota/abertura de escrita exige escopo explícito e evidências; não publicar chaves ou backups.
3. Associar a cópia pessoal à identidade confirmada com backup anterior, recibo/readback e comparação integral. Validar segundo aparelho, recarga, saída e conflito, conservando XP/histórico sem executar recompensas novamente.
4. Simplificar o fluxo final de acesso/salvamento para o usuário; só anunciar sincronização pronta depois do percurso real.

## Reteste simples pelo usuário

No MESMO navegador/app instalado do celular: abrir domínio fixo, importar o MESMO JSON original, conferir contagens, confirmar substituição e continuar local; recarregar e conferir atividades/XP. Se houver outro motivo de revisão, preservar cópia e relatar a mensagem. Não limpar dados ou reinstalar. Até associar a conta, os dois aparelhos têm armazenamentos separados. Corrigir esta causa não comprova que o arquivo particular não contenha outras divergências.
