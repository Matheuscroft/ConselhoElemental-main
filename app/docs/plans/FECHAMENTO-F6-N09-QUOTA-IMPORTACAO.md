# F6-N09 — quota na importação e retomada — 0.1.139

07/11/2026 · Astro Boy sequencial · Sol Alto · codex/fitness-ui-integration, base67bb6e5. Alterações anteriores preservadas; nenhum subagente. Pedido atual: resolver o erro “the quota has been exceeded” na importação do progresso local no celular/Vercel. A decisão anteriorN08 mantém o fluxo simples, sem segunda cópia manual ou checklists.

## Causa reproduzida e decisão

A importação tinha três volumes simultâneos em localStorage: progresso anterior, journal com before/target completos e progresso de destino. Medição do arquivo correto em memória isolada: destino2.281.066bytes UTF16, journal antigo3.969.010bytes, pico teórico6.250.076bytes; limite reproduzido5.242.880bytes. O arquivo de destino por si só cabe. A falha é do pico temporário, não falta de XP/atividades ou necessidade de comprar espaço de serviço.

O ensaio limitado reproduziu a falha antiga e conservou seu journal preparado. Uma tentativa antiga pode, portanto, continuar bloqueando o app mesmo depois de publicar um escritor menor. Por isso a correção cobre tanto importação nova quanto conclusão da tentativa pendente. **Não orientar limpar dados, reinstalar, reenviar uma cópia vazia ou repetir o roteiro manualN07.**

## Implementação

`restore-journal-codec.ts` compacta somente o payload do artefato de recuperação usando CompressionStream gzip nativo/base64 e prefixo `gzip-v1:`. O envelope permanece payload/checksum; SHA é verificado antes da descompactação e a expansão tem limite100MiB. A estrutura lógica, validação de before/target, origem e versão1 continuam iguais. Leitura de JSON legado é mantida. Sem API nativa, o escritor conserva JSON simples; o leitor avisa se não puder ler um journal compactado. Corrupção e expansão excessiva são recusadas. Sem nova dependência. Formato do JSON exportado e bytes das stores ativos não mudam.

`completePendingRestoreLocally` valida a revisão exata e o estado atual. Sob o coordenador exclusivo existente, substitui o journal legado por compacto ANTES de escrever o destino. Grava as partes que reduzem armazenamento primeiro; confere cada write, commit, marcador local e encerramento da barreira. Conflito externo/arquivo inválido/revisão desatualizada/consentimento ausente não autorizam sobrescrita. Falhas conservam recuperação, inclusive entre marcador e remoção. Rollback também passa a escrever partes que reduzem o uso primeiro.

A UI pendente oferece **Concluir importação**, com aviso adjacente de substituição, fechamento de outras abas e uso local. É ação explícita, sem efeitos no mount, segundo arquivo ou checklist. Opções avançadas de preservar/recuperar versões continuam recolhidas. A importação nova mantém escolher JSON → conferir → Importar e usar neste aparelho → Santuário. `restore-errors.ts` traduz QuotaExceeded para orientação em português sem pedir limpeza do site.

Nenhum replay de conclusão, soma de XP, ajuste de fórmula, novo store paralelo, mudança de gate ou envio de progresso. SHA comparado ao início do lote confirma stores, motores, restante de fontes e assets preservados. Fonte mudou somente codec/erro novos, journal/coordenador, duas UIs, allowlist139 e manifests. Candidato SQL139 é somente local/PGlite e aceita baselines revisados135–138; não aplicado remotamente. Compatibilidade hospedada135 e escrita integral fechada conforme última consultaN03; nenhuma consulta SQL remota neste lote.

## Verificações executadas

- Suíte Node documentada, todos os117 arquivos `.test.mjs` de tests/scripts: **716 passaram**, zero falha/skip,63,88s. Comando equivalente a `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`, lista obtida por Node para evitar glob diferente entre shells.
- TypeScript/build passaram; Vite24,59s com aviso já existente de chunks grandes. Lint passou sem avisos.
- Codec: roundtrip exato Unicode/espaços, JSON legado, API ausente, gzip inválido, expansão limitada e mensagem de quota.
- Storage sintético5MiB: falha antiga reproduzida; mesmo arquivo entra com gzip; journal legado interrompido conclui sem selecionar outro arquivo; estados exatos, XP/IDs intactos após hidratação; todas as cinco fronteiras de escrita da retomada são interrompidas e retomadas sem duplicação; conflito/consentimento ausente recusados; alvo que sozinho excede a quota permanece protegido e rollback funciona.
- UI: retomada com uma ação, retorno local-ready obrigatório, sem download/cópia manual; conflito e resultado tardio não navegam. Regressões de dois documentos, barreiras de startup, arquivo anterior, copies de recuperação e leases passaram.
- Primeira suíte parcial encontrou7 testes que faziam JSON.parse diretamente no payload antes textual; adaptados para usar o decoder mantendo suas asserções. Uma execução de autodiscovery `node --test` tentou arquivos Deno/TS fora do runner suportado e falhou por resolução de imports; corrigido o comando para a suíteMJS documentada acima. Não são registrados como aprovados nessa tentativa.

## Arquivo pessoal — somente memória

Cópia original130 autorizada, sem conteúdo/IDs no navegador, upload ou Git: falha antiga reproduzida sob5MiB; importação nova e retomada do journal antigo retornaram local-ready. Ambas as projeções conferidas integralmente iguais ao arquivo. XP de todos os elementos, pontuação, Prana e maior constância preservados após hidratação. Pico novo2.697.202bytes; journal compacto415.640bytes; pico incluindo a criação do journal legado5.058.416bytes. Arquivo original conferido por SHA antes/depois e intacto. Constância atual continua sujeita ao recálculo diário já existente; não afirmar igualdade de toda a user após hidratação. Nenhum dado do aparelho físico do usuário foi importado pelo agente.

## Publicação e navegador

Publicado READY **dpl_3EACSrNL5zvLQDz1svUvKFa8iJ3E** no mesmo projeto conselho-elemental-testes/fr-prodiction. URL imutável https://conselho-elemental-testes-debx1ph3z-fr-prodiction.vercel.app; domínio fixo https://conselho-elemental-testes.vercel.app. Staging novo512arquivos de fonte/assets/configuração conferidos por SHA, sem .env, SQL, docs/testes/QA ou backup pessoal; manifesto continuou igual à fonte depois do deploy. HTML/entry200, entry139 e cache-control no-store/no-cache/must-revalidate confirmados. Build remoto passou. Sem push ou migração remota.

Puppeteer/Chromium headless390×844, perfis descartáveis, dados sintéticos grandes35notas×20mil caracteres e catálogo real padrão. Wrapper de Storage.setItem aplica limite5MiB UTF16 na origem isolada (não altera quota real do Safari). Dois percursos no site139: (1) selecionar JSON130 e uma confirmação; (2) semear journal legado, reproduzir QuotaExceeded ao escrever destino, recarregar e tocar Concluir importação. Ambos abriram Santuário, preservaram35notas/atividade/ciclo/4XP sintéticos após recarga e encerraram journal após marcador local. Zero erro de página e zero chamada de Auth/progresso. Picos observados2.499.602 e4.418.620bytes, respectivamente; o segundo inclui a criação do journal antigo. Capturas inspecionadas: botões dourados ativos, ação de retomada visível, opções avançadas recolhidas. Primeiro script de navegador já importou, mas falhou ao ler um campo exercises inexistente na projeção persistida de Fitness; asserção do harness corrigida e os dois percursos repetidos até sucesso. Nenhuma mudança adicional de produto após build/suíte/publicação.

[Evidências](evidence/importacao-quota-0.1.139/verificacoes.json), [importação](evidence/importacao-quota-0.1.139/importacao.jpg), [retomada](evidence/importacao-quota-0.1.139/retomada.jpg). Isso prova Chromium com quota simulada e arquivo pessoal em memória separada; **não prova a importação pessoal no Safari/iPhone**.

## Próximo passo e custódia

No aparelho/origem em que falhou, recarregar a versão139. Se houver tentativa pendente, usar Concluir importação, sem outro arquivo; caso contrário, escolher o JSON correto e Importar e usar neste aparelho. Conferir atividades/XP no Santuário depois do retorno. Não limpar dados/reinstalar. JSON permanece cópia independente, não sincronização automática. Depois avançar em Sol Alto para aceite Auth real, compatibilidade136–139 hospedada e associação/sync com protocolo existente; nenhuma escrita remota foi aberta por este lote. Custódia/revisão documental feitas sequencialmente; reservas encerradas. Pendência de aceite no iPhone e integração da conta permanece explícita.
