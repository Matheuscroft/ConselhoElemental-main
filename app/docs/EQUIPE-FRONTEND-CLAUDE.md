# Equipe de frontend com Claude — 09/11/2026

Equivalente Claude do [POLITICA-MODELOS.md](POLITICA-MODELOS.md) e dos papéis de [COORDENACAO-AGENTES.md](COORDENACAO-AGENTES.md), que foram escritos para o Codex. Aqueles documentos continuam valendo para quem trabalha no Codex; este vale para quem trabalha no Claude Code com Fábio. Nada aqui altera regra de produto, pontuação, backend ou os documentos do Matheus.

## Por que existe

O uso semanal de Fábio chegou a 61% com o frontend rodando sempre no Opus. A equipe existe para rotear cada trabalho ao modelo mais barato que o resolve bem, e não para "ter mais agentes". Agente novo começa sem contexto e relê o que precisa: três agentes custam mais que um. A economia vem de modelo certo, briefing curto e relatório curto.

## Elenco

O modelo e o esforço de cada papel vêm da definição em `.claude/agents/` (local, ignorada pelo git). O orquestrador é a própria sessão principal.

| Papel | Modelo | Esforço | Faz |
|---|---|---|---|
| **Orquestrador** (Astro Boy) | Sonnet 5.5 | médio; alto ao arbitrar conflito | Lê a fila, delega, revisa diffs, mescla e publica |
| **Líder de design** | Opus 5.5 | alto | Só decisão visual nova. Entrega briefing em texto, não código |
| **Implementador de tela** | Sonnet 5.5 | médio | Aplica o design system a uma tela. Até 3 em paralelo, em telas disjuntas |
| **Movimento** | Sonnet 5.5 | médio | Aplica `beat()`, `Contagem` e `Conjurar` |
| **QA visual e acessibilidade** | Sonnet 5.5 | médio | Navegador a 390 e 768px, foco, movimento reduzido, contraste. Só reporta |
| **Verificador** | Haiku 5.5 | baixo | Roda `verify:release`, build e checagem de estouro. Devolve só o veredito |
| **Versionamento e documentação** | Haiku 5.5 | baixo | Atualiza continuidade, fila e changelog, conforme [AGENTE-VERSIONAMENTO-DOCUMENTACAO.md](AGENTE-VERSIONAMENTO-DOCUMENTACAO.md) |

Opus só entra como Líder de design, um briefing por vez, depois do aviso. Se o uso semanal estiver alto, o orquestrador decide em Sonnet com esforço alto.

## Troca de modelo e esforço

- **Subagentes:** o modelo e o esforço já vêm da definição. A sessão principal não precisa trocar.
- **Sempre agentes novos, nunca forks.** Um fork herda o contexto inteiro e não aceita troca de modelo.
- **Sessão principal:** só se um trabalho interativo longo pedir outro modelo, com `set_session_model` e `set_session_effort`. Confirmar antes que a troca funcionou, e nunca relatar uma troca não confirmada.
- **Escalar um nível** só depois de resultado insuficiente com evidência. Nunca repetir a mesma tentativa. Voltar ao modelo barato quando a parte difícil acabar.
- **Falta de acesso, serviço fora do ar ou limite de uso não se resolvem com modelo maior.**
- **Não criar agente** quando coordenar custa mais que fazer.

## Aviso antes de agir

Toda delegação e toda troca é anunciada ao Fábio antes, neste formato:

`▶ [papel] · [modelo] · [esforço] · [tarefa] · [arquivos]`

Fábio deu autonomia para trocar; o aviso é a contrapartida.

## Regras de escrita

- **Um único escritor por arquivo.** O protocolo de [COORDENACAO-AGENTES.md](COORDENACAO-AGENTES.md) vale: contexto separado não isola alterações. Os arquivos compartilhados abaixo ficam reservados ao orquestrador:
  `src/stores/*`, `src/types/*`, `src/App.tsx`, `src/index.css`, `src/components/layout/*`, manifests, lockfile e documentos de status.
- **Os tetos dos guardas são só do orquestrador:** `TETO_TAMANHOS` em `tests/design/fundacao.test.mjs` e `TETO_VIDRO` em `tests/design/superficie.test.mjs`. Se um agente precisar subir um, reporta e espera.
- **Só o Verificador roda a suíte completa, e só depois que todos os escritores terminarem.** Rodar `verify:release` durante a edição gera falhas fantasma.
- **Os escritores podem rodar** `npx tsc --noEmit -p tsconfig.app.json` e `npx eslint <os próprios arquivos>`.
- **Só o orquestrador commita e publica**, depois de `git fetch` e merge. O Matheus também empurra na main. Instrução permanente de Fábio: sempre publicar na main, porque empurrar a branch não dispara o CI nem o Vercel.
- **Fora do escopo do frontend:** pontuação, XP, Prana, fórmulas; stores; backup, auth e `supabase/`. Mudar regra de pontuação exige aprovação explícita de Fábio ([../AGENTS.md](../AGENTS.md)).

## Aceite de uma tela

Uma tela só é aceita quando:

1. Superfícies usam `.ds-pane` ou `.ds-glass`. Nenhum `backdrop-filter` novo sem justificativa, e sempre com o par `-webkit-`.
2. Tipografia pelos degraus `--ds-text-*` e `--ds-fluid-*`. Nenhum `font-size` literal novo.
3. Movimento por `beat()` ou pelos tokens `--ds-duration-*`. Nenhuma duração escrita à mão.
4. Nenhum teto de guarda subiu.
5. Zero estouro horizontal a 390px.
6. Nada de pontuação, dados ou persistência alterado.
7. `verify:release` verde e `build` verde, rodados pelo Verificador.

Checagem de estouro, para colar no console do navegador a 390px de largura:

```js
const rotas = ['/santuario', '/ciclos', '/grimorio', '/pilares', '/jornadas', '/mapa'];
const saida = [];
for (const rota of rotas) {
  history.pushState({}, '', rota);
  window.dispatchEvent(new PopStateEvent('popstate'));
  await new Promise(r => setTimeout(r, 1400));
  const d = document.documentElement;
  saida.push({ rota, estouroPx: d.scrollWidth - d.clientWidth });
}
JSON.stringify(saida)
```

## Fluxo

`fila → em execução → em revisão → aceita`, como em [COORDENACAO-AGENTES.md](COORDENACAO-AGENTES.md). Só o orquestrador marca "aceita". Teste pendente nunca vira aceite.

## Relatório de um agente

Curto, e só isto: item e papel; arquivos alterados (caminhos absolutos); evidência atual (comando e resultado, separando inspeção estática de execução); limites e o que não foi testado; próximo passo ou decisão necessária. Sem porcentagens subjetivas.

## O que o design system já guarda

Quatro camadas, cada uma com um teste que falha se alguém sair dela: movimento (`tests/motion/`), cor e tipografia (`tests/design/fundacao.test.mjs`), superfície e vidro (`tests/design/superficie.test.mjs`). É isso que torna seguro delegar a um modelo mais barato: o teste reprova quem sair do sistema, mesmo sem bom gosto.

Documentos de cada camada: [SISTEMA-DE-MOVIMENTO](plans/SISTEMA-DE-MOVIMENTO.md), [FUNDACAO-COR-E-TIPOGRAFIA](plans/FUNDACAO-COR-E-TIPOGRAFIA.md), [REDESIGN-SUPERFICIE-E-ELEMENTOS](plans/REDESIGN-SUPERFICIE-E-ELEMENTOS.md).

## Limites

Nada do frontend recente foi visto em WebKit nem em aparelho real. `set_session_model` ainda não foi confirmado sobre a própria sessão: até alguém confirmar, a troca automática vale só para subagentes.
