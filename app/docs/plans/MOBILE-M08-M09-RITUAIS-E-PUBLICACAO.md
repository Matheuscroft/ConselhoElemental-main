# M08–M09 — rituais, cronômetro e publicação Git — 0.1.143

## Resultado e diagnóstico

Rituais: criação rápida não permitia selecionar elemento; rituais sem área eram excluídos do filtro por elemento. Ao adicionar ou editar uma área primária, o elemento interno podia ficar no default Terra: a apresentação por área e o pagamento pelo elemento interno divergiam. Agora criação rápida tem quatro opções explícitas, filtros incluem rituais sem área e classificação por área alinha elemento em Task/Action e subitens. Editar sem área permite corrigir explicitamente o elemento. Invocar preserva o elemento escolhido; no fallback de Ciclo/Jornada/Obra usa área do mesmo elemento, em vez da primeira área global de Terra.

Não houve migração de atividades existentes nem recomposição de XP. Recibos anteriores e desfazer continuam usando o elemento/valor originalmente pagos. Fórmulas, multiplicadores, tempo e economia intactos. Para um ritual já cadastrado incorretamente, editar e selecionar o elemento/área corretos, sem remarcação retroativa automática.

M08: cena material própria por elemento: Terra estável com relevo e luz discreta, Água com ondulações, Fogo com calor/duas brasas e Ar com correntes suaves. Removidos cristais flutuantes, miniícones duplicados e anéis redundantes. Efeitos pausáveis/reduced motion; arte, controles e fonte do tempo preservados. Metas ausentes deixam de aparecer como 0s/30min fictícios só na apresentação.

## Publicação e mudança de rumo

Pedido inicial: origin `Matheuscroft/ConselhoElemental-main`, produção main. Em seguida Fábio pediu novo repositório e aprovou nome escolhido: criado `fabiorodrigues-tech-dev/grimorio-elemental` privado, convite write para Matheuscroft. A conexão desse repositório ao Vercel anterior foi comprovada, mas nenhum código foi enviado. Fábio então mudou o destino para o repositório de Matheus e forneceu **https://conselho-elemental-main.vercel.app**. Esta é a decisão vigente.

Vercel anterior `conselho-elemental-testes` teve ligação/configuração temporárias revertidas ao baseline (sem Git, rootDirectory null, criação de deploys Git desativada). Um comando CLI sem project explícito criou incidentalmente `fr-prodiction/app`; foi removido após confirmar projeto recém-criado, sem conexão Git e zero deployments. A versão anterior142 permaneceu servida; nenhum dado de app foi alterado. Identificador explícito é obrigatório nas próximas operações.

Novo link: HTTP200, bundle129; commit status do origin/main aponta para `matheuscrofts-projects/conselho-elemental-main`. Esta equipe não está disponível na conexão CLI/MCP atual; não afirmar configuração administrativa feita nela. Repositório novo segue vazio e não é o destino ativo. Origin preservado; pushDefault voltou a origin.

## CI e entrega para Matheus

`vercel.json` habilita main, desabilita demais branches e executa `npm run build:release` (testes/lint + tipos/build). O projeto hospedado precisa apontar rootDirectory para `app`, dist para saída e branch de produção main. O workflow `.github/workflows/quality.yml` executa os mesmos checks em pushes/PRs main, com Node26 e actions fixadas por SHA, sem credenciais. O deploy é da integração Git do Vercel, não de um token no GitHub Actions. Testes/lint falhando bloqueiam o build hospedado. Não existe commit por salvar arquivo nem daemon Codex.

`npm run publish:main` exige árvore limpa, remoto origin exato, fetch e ancestralidade da main, valida testes/lint/build e faz push normal dos commits já revisados. Não faz staging, commit, force push, limpeza ou migração SQL. Depois de cada lote autorizado, Astro Boy revisa/commita/publica; Matheus pode fazer push normal na mesma main.

Configuração de conta: `config/supabase-public.json` contém somente URL e chave PUBLICÁVEL existente do DominioDoMagoDB, obtida pela ferramenta oficial get_publishable_keys; chave existente/ativa, não criada. São identificadores públicos destinados ao navegador; RLS/RPC mantêm autorização. O build aceita override por `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`; não lê chaves privadas ou arquivos de sessão. Flags públicas `VITE_ENABLE_SUPABASE_AUTH=false` e `VITE_FORCE_BOOTSTRAP_CLOUD_SYNC=false`. O wrapper de release fixa as duas flags públicas em false para não herdar o bootstrap legado de um projeto antigo. Não lê nem gera chaves. Isso preserva a conta integral e impede escritores legados concorrentes. O build recusa URL/chave inválidas; não enfraquecer guardas para passar deploy. Ver [N10](FECHAMENTO-F6-N10-CONTA-CONECTADA.md). Novo domínio também precisa de redirects de confirmação/recuperação autorizados no Supabase; entrega de e-mail/aceite pessoal permanecem pendentes. Não afirmar conta pública pronta.

## Dados do celular

Outro domínio usa storage distinto. Exportar a cópia mais recente NO APP/APARELHO com o progresso diário atual; depois de143 publicada, importar no novo domínio e conferir atividades/XP e recarga. Não apagar/reinstalar o app antigo nem presumir que o backup antigo do computador contém registros recentes do telefone. Sem soma de XP, associação ou transferência pessoal automática.

Compatibilidade143 aditiva aplicada no DominioDoMagoDB com histórico real `20261108003620_account_archive_version_143`, SHA de validador35514778593a6cd20ec4c73cab93f7604f7f58b6711d30e5e1a28eff5efbceb6. Gate true preservado e zero contas integrais antes/depois. SQL troca exclusivamente allowlist do validador142 por143, preservando privilégios/dados. Advisors sem novos avisos; anteriores registrados no readback. Arquivo renomeado ao histórico real, bytes preservados. Nenhum progresso pessoal lido/enviado, secret ou configuração Auth alterados.

## Evidência executada

- `npm run verify:release`: **746 testes, zero falhas**, lint passou; 106,55s para testes. Inclui quatro elementos, pagamento único, reidratação e reversão exata, área customizada/subitem e preservação de recibo histórico.
- TypeScript e build passaram (12,10s). Aviso existente de chunks maiores que500kB não é erro.
- Dois testes de compatibilidade142/143 repetidos após alinhamento do nome da migração: passaram; SQL hospedado/readback/advisors antes/depois executados.
- Chromium descartável com build local de produção, dados sintéticos/API real da store: criação pela UI dos quatro elementos e reidratação, layout360/390/768, botões≥44px, zero erro/chamada Supabase. Invocar também conferido com ritual Água. Não é Safari/iPhone, conta hospedada ou prova de transferência pessoal.
- Timer integrado143 no build local/Chromium sintético: quatro animações, toque, pausa independente dos efeitos, reduced motion,360/390/768 com alvos≥44px; aba real em segundo plano3,1s, recuperação após recarga pausada e atualização manual com sessão em andamento. Zero erro/chamada Supabase. Complemento de composição390px com Terra inspecionada. Não prova bloqueio físico do iPhone.
- Evidências em [evidence/rituais-publicacao-0.1.143](evidence/rituais-publicacao-0.1.143). Logs não contêm storage pessoal/credenciais.

## Publicação

Push fast-forward confirmado: `67bb6e5 → a603e4c9f5d14eee754b54800508bac62b75ca7e`, main do repositório de Matheus. A integração recebeu o commit e abriu deployment `9Ac7tqVawuwDGa46kpTSTr6NS8YY`; CI App quality42431085415 em execução. Não anunciar o site143 antes de conferir conclusão e metadados/bundle público. Aceite de uso físico, importação no novo domínio e conta/SMTP seguem abertos.

### Primeiro push e correção do CI

Primeiro commit a603e4c acionou Vercel/GitHub automaticamente. GitHub executou746testes com sucesso (167,03s), mas lint Linux apontou react-hooks/preserve-manual-memoization no formulário de rituais, ausente no lint local. Declaração useMemo de áreas foi movida antes dos callbacks que a capturam, sem mudar cálculo/lista. A regra não foi desativada. A publicação falhou e o site129 permaneceu disponível. Wrapper público de build também fixa os flags legadosfalse já exigidos pela arquitetura integral; mantém validação de URL/chave publicável e testes. Reteste/publicação em andamento.

A tentativa local de build com VERCEL=1 e sem URL pública confirmou que o guard recusa build incompleto (falha esperada, não aceite de hospedagem). O wrapper usa a configuração pública versionada como fallback para instalações novas, mantém os overrides existentes e a rejeição de chaves privadas. O app continua com um único SDK/coordenador de conta. Nenhum env privado publicado. O primeiro gate de lint foi corrigido movendo a declaração antes das capturas dos callbacks; reteste local em modo CI/production passou.
