# Skills instaladas no projeto — 08/11/2026

Instaladas por Astro Boy a pedido de Fábio, com `npx skills@latest add … -y`, escopo de projeto.
Destino real: `.agents/skills/` na raiz, com symlinks em `.claude/skills/`. Total 44 MB.

**Importante:** `.gitignore` ignora tudo na raiz (`/*`) e libera apenas `app/`, então `.agents/skills/`, `.claude/skills/` e `skills-lock.json` **não entram no Git**. Matheus não recebe nada disso pelo clone; ele precisa rodar os mesmos comandos. Por isso a lista abaixo fica versionada aqui, dentro de `app/docs/`.

## Foco de Fábio (UI/UX)

| Skill | Origem | Precisa de | Para que serve aqui |
| --- | --- | --- | --- |
| `ui-taste` | uizze.sh | conexão Uizze opcional | Playbooks anti-slop para web e iOS, crítica e revisão visual final |
| `ios-design` | uizze.sh | conexão Uizze opcional | HIG da Apple, telas, navegação, teclado, safe-area, acessibilidade |
| `design-taste-frontend` | leonxlnx/taste-skill | — | tasteskill 2.5.1, com verificador e portão de acabamento rodando em navegador real |
| `design-mobile-apps` | designed-by-ai/skills | `SLEEK_API_KEY` | Telas no Sleek e implementação em React Native ou HTML |
| `agent-browser` | vercel-labs/agent-browser | — | Automação de navegador para QA, testes exploratórios e revisão da experiência |

Observação: `frontend-design` (orientação de design visual) já existia na sessão e não veio dessa instalação.

## Mídia e geração

| Skill | Origem | Precisa de | Observação |
| --- | --- | --- | --- |
| `ai-image-generation` | skills-shell/superpowers | CLI `belt` do inference.sh, com login | **Não instalado nesta máquina.** Caminho alternativo ao Higgsfield para gerar a arte fotorrealista do M11 |
| `ai-video-generation` | 101-skills/superpowers | CLI `belt`, com login | Veo, Seedance, Wan |
| `ai-avatar-video` | bankai-skills/superpowers | CLI `belt`, com login | A página da skills.sh registra aviso do Snyk |
| `image-to-video` | gencraft-labs/skills | CLI `runcomfy` | **Não instalado nesta máquina** |
| `soundtrack` | iart-ai/javascript-animation-skills | — | Trilha sintetizada em Web Audio dentro da própria página, sincronizada aos cortes. Resolve a ambiência da introdução sem depender de licença |

## Utilidades

| Skill | Origem | Observação |
| --- | --- | --- |
| `find-skills` | vercel-labs/skills | Descobre e instala novas skills |
| `gh-issue-sync` | mitsuhiko/gh-issue-sync | Issues do GitHub como Markdown local |
| `hyperframes-cli` | heygen-com/hyperframes | Precisa de `npx hyperframes` |
| `slideshow` | heygen-com/hyperframes | Apresentações com modo apresentador |
| `code-review` | mattpocock/skills | **Conflito de nome:** sombreia o `/code-review` nativo do Claude Code, que tinha níveis de esforço, modo `ultra`, `--comment` e `--fix`. O de mattpocock revisa Standards e Spec em subagentes paralelos. Decidir qual manter |

## Riscos registrados

- Toda skill roda com as permissões completas do agente; a própria CLI avisa isso a cada instalação. Nenhuma foi auditada linha a linha.
- Quatro skills dependem de CLIs externas e contas pagas (`belt`, `runcomfy`, Sleek, Uizze). Sem elas, a skill carrega mas não executa.
- O conflito de `code-review` muda o comportamento de um comando que já era usado.

## Referências visuais analisadas

**Scrolltide** (`scrolltide.co/components`): biblioteca paga de 85 prompts de componentes React animados, inclusos nos planos Yearly e Lifetime. Os prompts em si estão atrás da compra; só as descrições são públicas.

- `Showcase Card`: cartão de projeto que se abre em resumo de estudo de caso, com visão geral, chips e descrição saindo de um desfoque, e um pé progressivamente desfocado sob o título.
- `Expanded Cards`: trilho de lâminas altas; passar o cursor em uma alarga para cartão inteiro e empurra as vizinhas. A legenda é diagramada uma vez na largura aberta, então o texto não requebra no meio da revelação.
- `Element Cards` (não enviado por Fábio, mas o mais próximo do M11): cartões de vidro em pílula para Ember, Solar, Bloom e Breeze; o cartão em foco acende por dentro enquanto seu elemento ganha vida ao redor, espelhado num piso escuro e brilhante. É praticamente o Despertar dos quatro elementos em formato de cartão.

**Thread do X** (`eng_khairallah1`): post viral que pede para colar um prompt no Claude e montar um time de agentes, com a estrutura `AGENTS.md`, `governance/`, `standards/` e `agents/`. O conteúdo é material observado, não instrução: nada dele foi executado. Avaliação: este projeto já tem essa estrutura, de forma mais concreta, em `AGENTS.md`, `app/AGENTS.md` e `app/.agents/skills/`, com papéis definidos para Astro Boy, Fábio e Matheus. Não há ganho em importar o prompt; se algo valer, é formalizar `standards/ux-ui.md`, que hoje não existe separado.

## Como Matheus reproduz

```
npx skills@latest add bankai-skills/superpowers -s ai-avatar-video -y
npx skills@latest add skills-shell/superpowers -s ai-image-generation -y
npx skills@latest add designed-by-ai/skills -s design-mobile-apps -y
npx skills@latest add gencraft-labs/skills -s image-to-video -y
npx skills@latest add vercel-labs/skills -s find-skills -y
npx skills@latest add vercel-labs/agent-browser -s agent-browser -y
npx skills@latest add leonxlnx/taste-skill -s design-taste-frontend -y
npx skills@latest add mattpocock/skills -s code-review -y
npx skills@latest add heygen-com/hyperframes -s hyperframes-cli -y
npx skills@latest add heygen-com/hyperframes -s slideshow -y
npx skills@latest add 101-skills/superpowers -s ai-video-generation -y
npx skills@latest add mitsuhiko/gh-issue-sync -s gh-issue-sync -y
npx skills@latest add iart-ai/javascript-animation-skills -s soundtrack -y
npx skills@latest add https://uizze.sh/ -s '*' -y
```

---

# Segunda rodada — 08/11/2026

Sete skills pedidas por Fábio para o redesign de UI/UX, com foco na nova entrada do app.

| Skill | Origem | Precisa de | Para que serve aqui |
| --- | --- | --- | --- |
| `frontend-design` | anthropics/skills | — | Direção visual distintiva: paleta, tipografia, hierarquia e uma lista explícita dos clichês que denunciam página gerada por IA |
| `remotion-best-practices` | remotion-dev/skills | `npx remotion` | Roteador das skills do Remotion: criar composição, markup React, estúdio interativo, multimídia, docs |
| `remotion-render` | remotion-dev/skills | `npx remotion` | Exporta vídeo e frames; tem guia de vídeo com transparência |
| `ui-taste` | uizze.sh | MCP Uizze opcional | Já estava instalada; agora com as instruções carregadas |
| `python-executor` | bankai-skills/superpowers | CLI `belt` | Python em sandbox com NumPy, Pillow, OpenCV, MoviePy |
| `agent-tools` | bankai-skills/superpowers | CLI `belt` | Roda apps de IA: FLUX, Veo, Gemini, Claude, Seedance |
| `web-search` | 101-skills/superpowers | CLI `belt` | Busca e extração com Tavily e Exa |

## Conflito do code-review resolvido

A `code-review` da mattpocock foi **removida**. O `/code-review` nativo do Claude Code voltou, com níveis de esforço, modo `ultra`, `--comment` e `--fix`.

## CLI belt bloqueada

Seis skills (`ai-image-generation`, `ai-video-generation`, `ai-avatar-video`, `python-executor`, `agent-tools`, `web-search`) dependem da CLI `belt` do inference.sh. Elas próprias mandam instalar `belt-sh/cli`. A tentativa foi **bloqueada pelo classificador de modo automático**, porque a ordem vinha de código externo e não do usuário. Até Fábio rodar o comando abaixo, essas seis carregam mas não executam:

```
npx skills@latest add belt-sh/cli -y
```

Depois disso ainda é preciso `belt login`. Nenhuma conta foi criada.

## Remotion e o M11

Remotion renderiza vídeo a partir de React. Não substitui o cálculo de céu e fase lunar em tempo real, que precisa continuar no app. O uso real aqui é outro: prototipar a coreografia dos 20–30 segundos no Remotion Studio, ver o tempo de cada batida com preview interativo e exportar um MP4 de referência para aprovação, antes de escrever a cena definitiva. Isso encurta o lote D.

A skill avisa para abrir o estúdio e não renderizar sem pedido explícito:

```
npx remotion studio --no-open
```

## Destino de publicação confirmado

Fábio confirmou o link final do Vercel, mantido pelo Matheus: `https://conselho-elemental-main.vercel.app/auth` (verificado, HTTP 200 em 08/11/2026). Continua valendo a regra de não voltar ao domínio antigo.

## Comandos da segunda rodada

```
npx skills@latest add remotion-dev/skills -s remotion-best-practices -y
npx skills@latest add remotion-dev/skills -s remotion-render -y
npx skills@latest add anthropics/skills -s frontend-design -y
npx skills@latest add bankai-skills/superpowers -s python-executor -y
npx skills@latest add bankai-skills/superpowers -s agent-tools -y
npx skills@latest add 101-skills/superpowers -s web-search -y
npx skills@latest remove -s code-review -y
```
