# Matheus — repasse de frontend e integração — 0.1.127

06/11/2026. H02, Astro Boy. Este é o ponto de entrada do pacote de Fábio para continuar o backend. Fábio conduz frontend/mobile UX; Matheus conduz backend/documentação; Astro Boy coordena a fila e continuidade. Não é uma autorização para deploy, ativação de escrita ou migração pessoal.

## Recebimento

A entrega segue na branch `codex/fitness-ui-integration`, para revisão contra `main`. Base integrada `be78b1e`; a main remota foi conferida por fetch. Não há force push nem reaplicação do stash antigo `c41b2bd`. Hash efetivamente enviado e PR serão registrados ao concluir a publicação.

Com seu trabalho local preservado, na raiz Git:

```sh
git status --short
git fetch origin
git switch -c codex/backend-revisao-0-1-127 origin/codex/fitness-ui-integration
node app/scripts/astro-boy.mjs setup --name Matheus --role backend
cd app
npm ci
npm run astro:status -- --json
```

O switch exige que esse novo nome ainda não exista; não substitui ou descarta sua branch. Comece por este documento, `docs/CONTINUIDADE.md`, `docs/FILA-ENTREGAS.md` e `docs/README.md`. A referência canônica original de Fábio tem cópia versionada nos capítulos; o caminho absoluto da máquina dele não é requisito de execução. Configure apenas seu ambiente local pelos exemplos existentes, sem receber chaves, perfil ou sessões de Fábio.

## O que este pacote entrega

- **Identidade elemental/mobile:** navegação/Santuário, Pilares, Domínios, Mapa, Grimório, Forja, Invocar, Lua/Estações/Temporal e feedback de ações. Movimento reduzido/estados/foco tratados nos lotes documentados; ainda existem aceites de celular/tablet pendentes.
- **Ciclos:** execução diária, subitens, contadores genéricos de quantidade separados da conclusão, agenda por datas programadas e continuidade nas URLs. Dias de descanso respeitam a agenda; não são reset de histórico. [Rotina](R26-A-CICLOS-ROTINA.md), [execução](R26-B-CICLOS-EXECUCAO.md), [quantidades](R27-QUANTIDADES-DIARIAS.md).
- **Rituais/Jornadas/Grandes Obras:** trilhas sugerem a próxima etapa, mantendo acesso livre. Conclusões e bônus usam recibos, reversão e guardas; animações refletem o retorno do comando. [XP e recompensas](R29-XP-E-RECOMPENSAS.md), [recuperação explícita](R29-RECUPERACAO-E-RITUAIS.md), [conquistas](R29-C-CONQUISTAS.md). As integrações em appStore/tipos fazem parte dos lotes anteriores autorizados, não de uma nova fórmula criada neste push.
- **Treinos:** catálogos/editor de Matheus da main foram preservados e integrados. 45 ilustrações SVG próprias, tema de ouro/vidro escuro, filtros e busca. Os 124 exercícios de força estão em Peito 17, Costas 19, Ombros 13, Braços 35, Abdômen 5 e Pernas 35, sem duplicação/reescrita de IDs; grupos recolhidos, lotes de oito e lista/busca em lotes de 12. [Catálogo](TREINOS-CATALOGO-AGRUPADO-0.1.126.md). H02 troca artes marciais por kimono com faixa; [prévia dos desenhos](evidence/repasse-0.1.127/artes-marciais.png).
- **Temporal/lembretes:** datas/recorrência compartilhadas e retorno ao mês/dia, preparação e recuperação de avisos. Aviso não conclui atividade. Persistência preparada não significa entrega de notificações em segundo plano.
- **Preservação/conta:** backup Core+Fitness, verificação de checksum, auditoria, conferência/recuperação por journal, intenção/recibo/versão e isolamento do sync legado. Correção de hidratação do WorkoutStore e preservação da identidade do personagem ao salvar perfil. SDK real com teste sintético não equivale a associação pessoal concluída.

## Onde o backend precisa continuar, em ordem

1. **F6 e bootstrap integral da conta:** revisar entrada/cadastro/recuperação, refresh/identidade, retomada após reload e reconciliação local/online. O código e testes de retomada foram preservados durante o pull, mas F6 continua parcial. Ler os relatórios F3/F4/F5 e helpers em `src/lib/backup/` e `src/mount-account-*`.
2. **Compatibilidade hospedada:** confrontar o banco real/histórico com os arquivos. Relatórios anteriores registram instalação 120/121/122; este lote não reconsultou nem alterou o banco. As revisões 123, 124, 125, 126 e 127 são candidatas locais para aceitar os produtores, cada uma exigindo o hash da anterior e gate fechado. Não reaplicar as instaladas, não editar seus bytes, não executar `db push` da pasta inteira. A base hospedada diverge legitimamente do init legado.
3. **Aceite de concorrência/isolamento e escrita:** verificar CAS/idempotência, proprietário autenticado, rollback e recibos no ambiente de homologação autorizado. RLS/ACLs e sync legado precisam da revisão backend. Não ativar por query string, env ou storage.
4. **Associação do progresso pessoal:** somente depois de conta estável, com cópia integral conferida, consentimento, recibo/readback e plano de retorno. Git e Vercel levam código, não localStorage. Origem 127.0.0.1 e domínio Vercel são diferentes. Nenhuma atividade real foi exportada ou alterada para esta entrega.
5. **Fragmentos/inventário:** contrato aprovado de um fragmento por conclusão válida conforme elemento, com persistência e antiduplicação, ainda não implementado. Preservar XP/Prana e evitar segundo motor. [Próximos passos](../PROGRESSO-ATUAL-E-PROXIMOS-PASSOS.md).
6. **GymMane:** somente análise G01, sem código/assets incorporados. Port Flutter→React depende de escopo, licença e piloto; [avaliação](GYMMANE-AVALIACAO-INTEGRACAO-2026-11-05.md). Não confundir redesign de Treinos com esse port concluído.

Os três gates estáticos continuam **false**: `ACCOUNT_TRANSFER_WRITES_RELEASED`, `RESTORE_WRITES_RELEASED`, `REMINDER_WRITES_RELEASED`. Este pacote pode ser revisado sem habilitar funcionalidades experimentais.

## Publicação e higiene

Inventário integral atualizado: [arquivos/status/SHA](evidence/repasse-0.1.127/inventario.json). Inclui arquivos novos necessários; não apenas o diff rastreado. O cache `supabase/.temp/cli-latest` foi retirado do índice e o diretório ignorado, preservando o arquivo na máquina. Sem .env, perfis .astro-boy, sessões, backup pessoal, build ou node_modules no pacote.

Configuração `git.deploymentEnabled` desativa **somente esta branch** em `app/vercel.json`, conforme [documentação Vercel](https://vercel.com/docs/project-configuration/git-configuration). Outras branches mantêm o padrão. GitHub não listou Actions ou deployments do repo no preflight; a leitura detalhada dos projetos Vercel foi recusada (403 de escopo), por isso o vínculo não foi presumido. Não houve tentativa de contorno ou deploy por CLI.

## Verificações e limites

**668 testes completos passaram**, zero falhas/pulados, concorrência 4 (66,40s). `tsc -b`, `npm run lint` e build Vite com `envDir:false` (30,09s) passaram; avisos preexistentes de chunks grandes/Browserslist mantidos. Diff-check e referências documentais conferidos. A seleção dos arquivos novos detectou uma linha vazia excedente no EOF de profile-reminder-codec.ts; corrigida sem alterar lógica antes do commit. Metadados de verificação e hashes em [verificacoes.json](evidence/repasse-0.1.127/verificacoes.json).

Comandos no app:

```sh
node --test --test-concurrency=4 tests/**/*.test.mjs scripts/astro-boy.test.mjs
npx tsc -b
npm run lint
node --input-type=module -e 'import {build} from "vite"; await build({envDir:false});'
```

Revisão de fontes/contratos e busca por padrões de credenciais no inventário: sem ocorrências nos arquivos de publicação. Isso é uma verificação delimitada por padrões, não certificação exaustiva de segurança. Destino público/branch/main inspecionados. A inspeção do navegador local continua negada por permissão salva; nenhum driver alternativo, screenshot do app ou aceite mobile foi usado/inventado. A imagem do ícone é renderização vetorial própria, não captura do app.

## Modelos e próximo lote

Sol Alto para fechar F6/contratos/CAS e compatibilidade hospedada; Sol Médio para aceite mobile/polimento delimitado. Matheus continua do estado real da branch e da fila; documentos não trocam modelos nem iniciam agentes. Não abrir gates/publicar Vercel por inferência deste push.
