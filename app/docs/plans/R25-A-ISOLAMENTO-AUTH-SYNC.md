## Atualização R25-1A — continuação local implementada, 0.1.98

29/10/2026. O caminho local proposto abaixo foi implementado: marcador operacional validado por origem antes de App/auth; `src/lib/supabase.ts` recebe a decisão imutável do documento e retorna cliente nulo/auth desabilitada. O estado normal sem marcador mantém comportamento anterior. O diário committed só é removido após gravar/verificar o marcador, sob exclusividade e consentimento explícito. Não há remoção/associação de identidade online. Sessões persistidas não são lidas nem apagadas nesse caminho.

`local-continuation.test.mjs` avalia startup + módulo real do cliente frontend + authStore real com SDK substituto e stores reais em memória. Demonstra ausência de construção do cliente/getSession nos cenários locais, edições persistidas em recargas simuladas e manutenção do modo numa segunda restauração/rollback; não testa Supabase/SDK real ou escrita remota. A suíte integral teve 399 testes aprovados. UI permanece com trava estática fechada até QA real isolado.

A auditoria abaixo preserva achados históricos e continua pertinente ao caminho online, que não foi modificado. Reconciliação/vínculo de conta, cobertura integral, invalidação de I/O tardio e novo fluxo de associação são 1B, em coordenação com Matheus. [Evidências e roteiro de aceite](R25-A-BACKUP-DO-PROGRESSO.md).

## Atualização R25-A2b11 — barreira inicial implementada, 0.1.97

29/10/2026. O commit do protocolo local agora mantém o diário existente, impedindo imports de App/auth/cliente na recarga. Revisão/exportação/recuperação committed não o removem; prepared só limpa depois do rollback verificado. Isso implementa a barreira anterior ao grafo, sem alterar authStore/serviço cloud. Continuação local, associação de conta, I/O tardio e cobertura online abaixo ainda são propostas/pendências. [Evidências](R25-A-BACKUP-DO-PROGRESSO.md). Nenhum writer de UI liberado.

# R25-A2b10 — isolamento de autenticação/sync após restauração

29/10/2026. **Auditoria e testes locais; proposta de integração, não implementação.** Versão 0.1.96 mantida. Checkout `codex/fitness-ui-integration`, base `b11ed9d`; Astro Boy executou em Sol Alto, sequencialmente. Fontes do produto, contratos de Matheus, manifests e fórmulas preservados. Estado operacional e próximo lote somente na [fila única](../FILA-ENTREGAS.md).

## Conclusão

A recuperação dos dois envelopes em memória não demonstra segurança ao carregar a aplicação completa. `App` chama `authStore.initialize`; com sessão salva e auth habilitada, o fluxo atual lê a nuvem e pode substituir o domínio local antes de qualquer escolha sobre o arquivo restaurado. Ao fim, instala sincronização automática. Não há marca durável de isolamento pós-restauração nesse caminho.

A conferência isolada atual continua segura dentro de seu escopo porque não importa App/stores/auth e não executa recuperação. **Não habilitar a gravação e encaminhar diretamente ao App como consequência destes testes.** Eles caracterizam riscos, não são critérios de aceite para manter os comportamentos indesejados em uma futura implementação.

Não foi verificada a configuração efetiva de auth do app do usuário. Todos os cenários abaixo usam auth habilitada/desabilitada explicitamente no cliente sintético, sem ler .env, tokens ou sessões reais. Nenhuma perda pessoal ou escrita remota real foi observada.

## Método reproduzível

`tests/backup/load-auth-sync.mjs` empacota **authStore e supabaseCloudSync reais**, substituindo somente o cliente Supabase e a referência ao core por instâncias sintéticas. Usa stores de domínio reais, respostas de tabelas em Map, consultas encadeadas simuladas, relógio/eventos controlados e fetch proibido no harness. `src/lib/supabase.ts` real e seu cliente não são avaliados. Flags são definidas no bundle do teste, sem carregar arquivos de ambiente.

O cliente simula select/eq/in/limit/maybeSingle/upsert/delete e respostas/erros suficientes para esses caminhos. Isso não simula o servidor Auth, JWT, RLS, PostgREST completo, rede, abort real, CORS, schema remoto, constraints ou o SDK. Oito casos iniciais e um caso adicional de troca de perfil passaram; nove casos no estado final.

Comando: `node --test tests/backup/auth-bootstrap-audit.test.mjs`. Toda a suíte local de backup: `node --test tests/backup/*.test.mjs`.

## Achados e impacto para R25

| Achado | Implementação observada | Evidência exercitada | Implicação |
| --- | --- | --- | --- |
| Sessão salva inicia pull do domínio | `App.tsx` chama initialize; `authStore.ts:305–332` chama hydrate sem fingerprint inicial; `supabaseCloudSync.ts:758–791` aplica snapshot e chama recompute | Um rascunho local sai da projeção ativa e o remoto entra após initialize, sem chamada de confirmação; nenhum upload nesse caso | Incompatível com restaurar localmente e abrir App sem decisão sobre a nuvem. Cloud-first existente não foi silenciosamente convertido em local-first |
| Usuário remoto novo pode limpar atividades locais | `shouldResetForFreshCloudUser` e `resetAppStoreForFreshCloudUser`, chamados quando não há perfil/dados cloud | Sem perfil remoto e com identidade local diferente, arrays de atividade são limpos; mesma identidade anterior não é limpa | Associação online deve escolher o destino explicitamente e preservar cópia antes de qualquer reset. Não assumir que login equivale a vincular o progresso |
| Autosync pode escrever após alteração local | `startCloudAutoSync` observa core e agenda 900ms; foco/visibilidade também acionam leitura/escrita | Adição de rascunho provoca upsert simulado; foco e retorno à visibilidade aplicam novos snapshots cloud | Desligar somente o envio inicial não isola uma cópia importada; observar todos os gatilhos |
| Logout não cancela leitura já em andamento | stop remove listeners/timer, mas requisição de hydrate iniciada continua e não verifica geração/usuário antes de aplicar | Leitura de refresh é atrasada; signOut real conclui e zera user do authStore; ao liberar a leitura, domínio local recebe o rascunho remoto | Guardas precisam invalidar resultados tardios. Remover listeners não equivale a cancelar I/O |
| Falha de leitura não impede instalação posterior de autosync | initialize captura erro e ainda chama startCloudAutoSync | Primeira leitura falha; alteração posterior gera upsert simulado quando o cliente volta a responder | Pós-restauração deve permanecer isolado diante de falha, sem resolver divergências por publicação automática |
| Sync não cobre o backup integral | fingerprint/profile/rows incluem subconjunto ativo de domínio; não serializam XP standalone, ledger do core, mapas de todos os perfis ou Fitness | Alterar XP isolado e medida de treino não agenda sync; payload de profiles contém só id/display_name/avatar; escritas observadas não incluem tabelas de contas, treino ou execução | Não prometer que criar conta preserva integralmente atividades, conquistas e treino em outro dispositivo por esse serviço atual |
| Troca de perfil local não define novo vínculo remoto | watcher mantém `userId` da sessão autenticada e usa conteúdo ativo do core | Criar/selecionar perfil local B e adicionar ideia agenda payload de B para o mesmo usuário remoto A; A permanece no mapa local | Vínculo entre perfil local e conta online precisa de regra explícita antes de permitir associação/importação |
| Refresh de token não faz pull imediato, mas mantém gatilhos | eventos TOKEN_REFRESHED/INITIAL_SESSION reanexam autosync; SIGNED_IN/USER_UPDATED hidratam | Evento de token não consulta domínio imediatamente; foco posterior consulta | Não usar esse detalhe como garantia de isolamento permanente |
| initialize concorrente pode duplicar bootstrap | `isInitialized` só vira true após getSession; não há promise compartilhada em andamento | Duas chamadas simultâneas geram dois getSession e duas leituras de perfil no harness | Futuro fluxo deve ser idempotente e validar usuário/geração; não afirmar reprodução de StrictMode no navegador |

Esses achados são limitados ao serviço e caminhos inspecionados. Não demonstram ausência global de outra persistência remota, tabelas de XP/treinos ou garantias existentes em outros sistemas/branches. Em particular, um saldo de XP pode estar refletido indiretamente em atividades sincronizadas; isso não é cópia fiel do saldo/ledger completo.

## Pontos adicionais da inspeção estática

- `src/lib/supabase.ts` constrói cliente no módulo. Adiar apenas `App.initialize` não demonstra ausência de inicialização do SDK ao importar o grafo. O cliente real não foi executado por este lote; seu tráfego de inicialização não foi medido.
- `authStore.restoreFromLocalBackupToCloud` usa `recoverDomainDataFromLocalBackup` e persist do domínio. É uma ação legada diferente do formato de arquivo R25; não valida/restaura os dois envelopes. A função é referenciada por TopBar, mas sua exposição/reprodução visual atual não foi testada.
- `getCloudSyncFingerprint` é guarda de conteúdo parcial, não vínculo de identidade/perfil, cancelamento ou exclusão entre processos.
- Bibliotecas de Web Locks/diário impedem writers cooperativos durante a operação, mas não resolvem o que App fará depois de remover o diário e recarregar. Abas antigas, requests já enviados e SDK real continuam fora da prova em memória.

## Contrato proposto para a próxima integração

Esta seção é proposta técnica para implementação/revisão conjunta; não registra aprovação de nova política de sincronização, migração ou schema.

1. **Estado pós-restauração durável antes de tocar o destino.** A operação deve registrar a necessidade de reconciliação/isolamento como metadado operacional do protocolo, sem criar outro store de domínio ou copiar XP para saldo paralelo. Falha entre confirmação do destino e limpeza do diário não pode liberar App para cloud-first. Revisar atomicidade/rollback desse metadado junto ao diário existente; não introduzir uma chave avulsa sem protocolo.
2. **Barreira antes do grafo App/auth/cliente.** Startup deve reconhecer destino importado ainda não associado e manter rota isolada. Pular uma função initialize depois de imports estáticos não basta para certificar isolamento. Nenhuma query, assinatura, refresh, upload ou ação legada de backup durante essa decisão.
3. **Uso local e associação são decisões distintas.** Uma futura experiência de uso local deve permitir navegar sem ativar efeitos de nuvem; não deve atribuir autorização JWT ou uma identidade remota fictícia. A associação online R25-B precisa de prévia, cópia anterior, titular/perfil de destino e decisão de substituição/mesclagem definida. Não deduzir vínculo de nome, conta ativa local ou presença de sessão salva.
4. **Respostas tardias precisam de guarda antes de aplicar.** Operações assíncronas devem vincular usuário, perfil e geração vigentes; logout/troca de conta/isolamento invalida leitura e publicação pendentes. Abort de rede, quando disponível, é complemento; uma resposta já resolvida ainda precisa da checagem. Matheus define integração com o serviço existente, preservando regras e dados.
5. **Cobertura online explícita.** Mapear backup × payload remoto, incluindo XP/recibos/histórico, outras contas locais e Fitness; definir o que transfere e o que permanece local antes de anunciar preservação integral. Schema/RLS, idempotência e migração pertencem a R25-B, com testes e escopo próprios.
6. **Aceite real posterior.** Ampliar simulação para destino confirmado → recarga isolada → escolha explícita. Depois testar em navegador com perfis sintéticos, interrupção/abas/reload e cliente real em ambiente delimitado. Só então habilitar aplicação/recuperação na UI. Nenhuma execução em dados pessoais para provar segurança.

A regra cloud-first atual deve permanecer disponível para o fluxo normal até que a integração aprovada a isole do progresso importado. Não corrigir os testes de caracterização preservando um comportamento perigoso no novo fluxo: convertê-los em testes de proteção quando a mudança correspondente for implementada, mantendo esta evidência histórica.

## Referências consultadas

- Fonte canônica: índice externo de origem e capítulo Core vs. Módulos; fonte portável em `docs/README.md`. Papéis de Fábio/Matheus e contrato de preservação em backend-conselho/AGENTS.
- Skill Supabase oficial lida. Changelog público `https://supabase.com/changelog.md` obtido; o fetch web inicial não aceitou text/markdown e a leitura pública alternativa foi salva em `/tmp/r25-a2b10-supabase-changelog.md`. Sem alteração de SDK/schema. A mudança de exposição de tabelas Data API registrada para 30/10/2026 é uma dependência a verificar por Matheus antes de testes remotos; não comprova a configuração do projeto.
- Documentação pública/MCP: [onAuthStateChange](https://supabase.com/docs/reference/javascript/auth-onauthstatechange) descreve eventos de sessão e unsubscribe. Não foi seguido o exemplo de limpar todos os storages, incompatível com a preservação deste projeto. Não existe consulta a dados do usuário neste lote.

## Verificações desta rodada

Nove testes de caracterização passaram; **125 testes de backup** passaram no conjunto final. Lint e diff-check limpos. SHA-256 de todas as fontes .ts/.tsx comparado a `/tmp/r25-a2b10-before.json`: idênticas, incluindo authStore/serviço de sync. Versão 0.1.96 mantida. Logs `/tmp/r25-a2b10-{auth-tests,backup-final,lint-final}.log`.

Sem build/TypeScript/suíte global novos por não haver alteração de produto ou dependências. Sem browser, SDK Auth real, sessão/secret pessoal, query de banco, rede do app, recuperação/associação online, crédito retroativo pessoal, comunicação externa, commit/push/deploy. Documentação pública foi consultada; não confundir com teste de integração remoto. Revisão sequencial de código de teste/documentação pelo Astro Boy.
