# Domínio do Mago — Conselho Elemental

Aplicativo de gestão pessoal gamificada, React/Vite/TypeScript, com prioridade para celular e tablet. Fábio conduz frontend; Matheus conduz backend e documentação. Astro Boy coordena o trabalho pela fila, contratos e evidências do repositório.

## Matheus: começar

```sh
git clone https://github.com/Matheuscroft/ConselhoElemental-main.git
cd ConselhoElemental-main
node app/scripts/astro-boy.mjs setup --name Matheus --role backend
cd app
npm ci
npm run dev
```

Na IDE, abra a raiz do repositório e peça: **“Astro Boy, apresente o projeto e me guie no primeiro lote de backend.”** Codex lê AGENTS.md; Cursor tem regra de entrada; Claude Code tem CLAUDE.md. Se a IDE não carregar regras de projeto, peça explicitamente para ler AGENTS.md. O script funciona sem dependências npm, identifica apenas o perfil informado e apresenta uma orientação no terminal. A conversa e execução precisam de uma IDE com agente; não há processo autônomo ativado por IP.

Abra a URL exibida pelo Vite: `/treinos` para seleção e `/treinos/painel` para Saúde. Auth remoto é opcional, via `app/.env.example`; segredos não estão neste repositório.

## Onde continuar

- [Boas-vindas e equipe](app/docs/ASTRO-BOY-BOAS-VINDAS.md)
- [Estado vigente](app/docs/CONTINUIDADE.md) e [fila única](app/docs/FILA-ENTREGAS.md)
- [Manual de engenharia](app/docs/MANUAL-ENGENHARIA.md) e [dossiê](app/docs/DOSSIE-TECNICO.md)
- [Índice de arquitetura e contratos](app/docs/README.md)
- [Auditoria de publicação e pastas](app/docs/AUDITORIA-PUBLICACAO.md)

Versão publicada por este lote: **0.1.21**. Fitness ganhou modalidades contextualizadas, registro de tempo/esforço/distância e UI móvel coerente. Assistente é protótipo local, ainda sem ativação remota validada. Percentuais musculares são estimativas editoriais ajustáveis; integração completa dos módulos com o core permanece em reconciliação. Consulte continuidade antes de escolher trabalho.

## Comandos Astro Boy (dentro de app)

```sh
npm run astro:status -- --json
npm run astro:welcome
npm run astro:test
npm run astro:audit
npm run build
npm run lint
```

Para Fábio: `npm run astro:setup -- --name Fábio --role frontend`. Perfis locais ficam em `app/.astro-boy/`, ignorados pelo Git. Skills e documentação são versionadas; configuração global, tokens, históricos e sessões da IDE não são transportados.
