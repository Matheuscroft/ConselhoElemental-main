# R28-B — criação e organização

26/10/2026 · versão **0.1.71 local** · base Git `b11ed9d`, branch `codex/fitness-ui-integration`. Astro Boy executou sequencialmente após autorização para continuar. R27/R28-A preservados; nenhuma publicação neste lote.

## Entrega

- **Invocar:** avançar e voltar têm sentidos opostos, deslocamento curto de 12px/160ms e alternativa de opacidade de 120ms com movimento reduzido. Conteúdo em saída fica `inert`, impedindo toque/foco em controles antigos durante a troca. Preferência do sistema acompanha alterações em tempo real.
- **Após criar:** removido redirecionamento automático de dois segundos. Confirmação mantém título salvo, acesso à seção correspondente e retorno ao Santuário. Fechar a confirmação retorna ao Santuário. Uma guarda local impede reenviar o mesmo formulário após criação bem-sucedida. Os cinco comandos de criação permanecem iguais; nenhuma recompensa por animação.
- **Forja:** confirmação contextual com nome da ideia, resultado textual e destino após conversão. A região é estável: não remonta a cada alteração nem anima resultados de busca. Confirmação de diálogo recebe foco no resultado; cancelamento devolve ao controle de origem, com fallback no campo de captura quando o controle deixou de existir. Botões usam pressionamento compartilhado.
- **Trilhas:** respostas elementais de seleção reduzidas de 300–550ms para 160ms; giro do Ar mais contido (18 graus). Acesso livre, comandos e celebração de conclusão permanecem. Não é uma nova mecânica de progresso.

## Decisão visual

Continuidade do ouro, superfícies escuras, tipografia e ícones elementais existentes. Movimento comunica avançar/voltar e resultado de uma ação; a navegação fica disponível sem aguardar cerimônias. A celebração de conclusão permanece distinta do feedback frequente de seleção. Skills frontend-design, auto-versionamento e revisão React aplicadas; sem nova biblioteca ou dependência.

## Verificações executadas

- `node --test tests/**/*.test.mjs scripts/astro-boy.test.mjs`: **177 testes passaram**, zero falhas. Três testes novos de apresentação verificam destinos dos cinco tipos, título/resultado da Forja e sentido/movimento reduzido das transições.
- `tsc -b`: passou. `npm run lint`: passou (executado antes do incremento do manifest, portanto log identifica 0.1.70).
- Vite `build({envDir:false})`: passou em **8,34s**. Avisos de chunks grandes e Browserslist continuam; não resolvidos neste lote.
- Comparação AST com HEAD: **5 chamadas de domínio em Invocar e 4 em Forja idênticas**. SHA-256 confirma appStore, workoutStore e tipos idênticos ao início R28-B, incluindo o trabalho preexistente R27.
- Logs locais: `/tmp/conselho-r28b-{tests,types,lint,build}.log`. Testes SSR/helpers e fixtures isoladas não equivalem a navegador, FPS ou sincronização remota.

## Aceite pendente e retomada

Inspeção renderizada não executada; bloqueio anterior do navegador não contornado. Ainda validar em 360/390px e depois 768px: toque rápido/teclado entre etapas, preenchimento preservado ao voltar, confirmação sem redirecionamento, ausência de duplicação ao tocar duas vezes, fechar pelo X/Escape, foco após salvar/converter/excluir/cancelar, nomes longos, busca e preferência reduzida alterada com app aberto. Usar dados temporários isolados; não mexer nas atividades pessoais.

Próximo lote visual: **R28-C exploração e leitura** (expansão de Domínios/Pilares/Mapa e painéis de status), mantendo QA R27/R28-A/B aberto. Treinos/Roda e marcos/final QA vêm depois. **R25-A/B backup e associação à conta continuam prioritários e pendentes**: progresso local não é garantia de proteção cloud. Fragmentos, regra anual/rotações e demais contratos pendentes não foram implementados aqui.

Revisão documental pelo coordenador; revisão independente pendente. Reservas encerradas. Sem commit, push, deploy, migração ou acesso a credenciais/dados pessoais.
