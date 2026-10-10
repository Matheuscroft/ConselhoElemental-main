# P01 — auditoria de pastas e publicação

10/10/2026. Astro Boy, Sol médio. Repositório: Matheuscroft/ConselhoElemental-main; base 03f0588, main remoto igual após fetch. Fábio autorizou revisão/publicação de todo o estado acumulado do projeto, preservando alterações anteriores.

## Revisão estrutural

Inventário recursivo por `npm run astro:audit`, abrangendo todas as pastas de arquivos do projeto (inclusive skills/regras). Dependências, builds, caches, configurações pessoais e perfis locais aparecem como excluídos; seu conteúdo não é fonte para publicação. Não foram encontrados arquivos idênticos por SHA-256. Nenhuma remoção de telas/rotas foi inferida pela idade do arquivo: páginas legadas, assets de avatar e PNG Yoga ainda têm consumidores/fallbacks. Documentos históricos ficam preservados como histórico, subordinados ao ponto de retomada vigente.

O root .codex contém um lançador pessoal ligado ao caminho/perfil de Fábio; .claude contém configuração local. Não são uma equipe portável. Seu papel foi substituído para colaboração por regras raiz, skill Astro Boy, perfil explícito e comandos locais, sem transportar estado privado da IDE.

Otimizações efetivas: remoção dos metadados macOS (incluindo .DS_Store rastreado na raiz); remoção de regra node_modules duplicada; remoção do dev plugin kimi-plugin-inspect-react sem consumidores no código/configuração. Lockfile perdeu 99 pacotes, sem novos pacotes ou mudança de versões das dependências restantes. Não foi usado npm audit fix/force.

A skill webapp-testing inclui helper e três exemplos; --help e sintaxe dos quatro arquivos Python foram verificados. Isso não comprova Python Playwright/browsers instalados no executor de Matheus; Puppeteer existente permanece disponível no app.

Git ignorava SKILL.md e referências dentro de .agents. Agora as oito skills e seus arquivos auxiliares estão versionáveis. Perfis .astro-boy, .env.* (exceto example), node_modules/dist e caches continuam excluídos. README corrigido para clone/execução do repositório atual. Os 12 capítulos canônicos de Overview/Core/Platform/ADRs foram comparados por SHA-256 com a fonte de Fábio: todos idênticos antes de publicar; nenhuma regra canônica foi reescrita.

## Pastas inspecionadas

Contagem recursiva: os totais dos pais incluem os filhos. Bytes são arquivos de projeto, sem dependências/build/configuração local.

| Pasta | Arquivos | Bytes |
|---|---:|---:|
| `.cursor/rules` | 1 | 414 |
| `.cursor` | 1 | 414 |
| `app/.agents/skills/astro-boy` | 1 | 2213 |
| `app/.agents/skills/auto-versionamento` | 1 | 1975 |
| `app/.agents/skills/backend-conselho` | 1 | 2387 |
| `app/.agents/skills/composition-patterns/rules` | 10 | 22156 |
| `app/.agents/skills/composition-patterns` | 14 | 50339 |
| `app/.agents/skills/frontend-design` | 1 | 9390 |
| `app/.agents/skills/improve-animations` | 3 | 18695 |
| `app/.agents/skills/web-design-guidelines` | 1 | 1231 |
| `app/.agents/skills/webapp-testing/examples` | 3 | 3443 |
| `app/.agents/skills/webapp-testing/scripts` | 1 | 3693 |
| `app/.agents/skills/webapp-testing` | 6 | 22394 |
| `app/.agents/skills` | 28 | 108624 |
| `app/.agents` | 28 | 108624 |
| `app/.cursor/rules` | 1 | 484 |
| `app/.cursor` | 1 | 484 |
| `app/docs/00-Overview` | 2 | 12345 |
| `app/docs/01-Domain-Core` | 3 | 32853 |
| `app/docs/02-Platform-Architecture` | 4 | 33138 |
| `app/docs/03-ADRs` | 3 | 10008 |
| `app/docs` | 41 | 393325 |
| `app/public/fitness-kit` | 1 | 216956 |
| `app/public/yoga/poses/full` | 6 | 147616 |
| `app/public/yoga/poses/thumb` | 6 | 21130 |
| `app/public/yoga/poses` | 18 | 31737724 |
| `app/public/yoga` | 18 | 31737724 |
| `app/public` | 22 | 41760291 |
| `app/scripts` | 4 | 12235 |
| `app/src/components/3d` | 1 | 10240 |
| `app/src/components/cards` | 6 | 31664 |
| `app/src/components/fitness` | 16 | 36536 |
| `app/src/components/fitness-kit` | 31 | 63222 |
| `app/src/components/layout` | 7 | 40967 |
| `app/src/components/sanctuary` | 1 | 3118 |
| `app/src/components/temporal` | 1 | 4429 |
| `app/src/components/ui` | 56 | 185287 |
| `app/src/components/workout` | 14 | 67826 |
| `app/src/components` | 133 | 443289 |
| `app/src/constants` | 6 | 83157 |
| `app/src/hooks` | 1 | 565 |
| `app/src/lib/fitness` | 2 | 6298 |
| `app/src/lib/fitness-kit` | 4 | 11742 |
| `app/src/lib/temporal` | 5 | 18583 |
| `app/src/lib/workout` | 5 | 8799 |
| `app/src/lib` | 20 | 58037 |
| `app/src/pages/fitness` | 9 | 57566 |
| `app/src/pages/temporal` | 6 | 75362 |
| `app/src/pages` | 46 | 591709 |
| `app/src/services` | 3 | 40010 |
| `app/src/stores` | 3 | 248979 |
| `app/src/types` | 2 | 17874 |
| `app/src` | 218 | 1503071 |
| `app/supabase/.temp` | 1 | 8 |
| `app/supabase/functions/_shared` | 1 | 471 |
| `app/supabase/functions/assistant-suggest` | 2 | 16923 |
| `app/supabase/functions/google-calendar-connect` | 1 | 2344 |
| `app/supabase/functions/google-calendar-sync` | 1 | 5480 |
| `app/supabase/functions` | 5 | 25218 |
| `app/supabase/migrations` | 2 | 20293 |
| `app/supabase` | 8 | 45519 |
| `app` | 350 | 46688099 |
| `.` | 355 | 46694515 |

## Arquivos grandes mantidos

- `app/Mago_app.jpeg`: 2502966 bytes.
- `app/public/avatar_fabio.glb`: 3589240 bytes.
- `app/public/icon.png`: 6215568 bytes.
- `app/public/yoga/poses/adho-mukha-svanasana.png`: 5174108 bytes.
- `app/public/yoga/poses/bhujangasana.png`: 5210507 bytes.
- `app/public/yoga/poses/tadasana.png`: 5319191 bytes.
- `app/public/yoga/poses/uttanasana.png`: 5300869 bytes.
- `app/public/yoga/poses/virabhadrasana-ii.png`: 5214899 bytes.
- `app/public/yoga/poses/vrksasana.png`: 5349404 bytes.

São referências/assets com uso atual. A otimização de imagens originais/avatar e divisão adicional do bundle exige lote próprio e comparação visual; build ainda avisa chunks acima de 500 kB. Não alegar otimização global da performance do app.

## Verificações executadas

- Build 0.1.21 passou. Lint: zero erros, quatro avisos preexistentes em Ciclos/temporal.
- `astro:test`: perfil explícito, nome com acento, apresentação/ack, idempotência, troca de colaborador e rejeição de input inválido passaram em diretório temporário.
- `git diff --check` passou. Busca limitada de padrões de segredo nos arquivos candidatos não encontrou chaves privadas/tokens desses padrões; não é auditoria completa de segurança.
- npm audit executado; apontou {'info': 0, 'low': 1, 'moderate': 4, 'high': 20, 'critical': 0, 'total': 25}. Resolver em lote específico com testes de compatibilidade; não aplicar atualização incompatível automática.
- Cópia limpa do índice: `npm ci --ignore-scripts --no-audit --no-fund` instalou 482 pacotes; build e astro:test passaram. Hooks de instalação foram desabilitados nesta verificação.
- Oito skills, regras de entrada e documentos conferidos na cópia limpa; setup Matheus exibiu saudação/equipe/estado, mantendo apresentação pendente para a IDE. Deno: 7/7 testes do gateway passaram com mocks, sem rede.
- Fluxos visuais/funcionais M01 e I03: evidências históricas nos relatórios correspondentes, não revalidados por este inventário. Apresentação em IDE de Matheus e integração real de backend ainda precisam de verificação naquele ambiente.

## Publicação confirmada

Push sem force aceito pelo GitHub: main avançou de 03f0588 para 4f180f9 em 10/10/2026. Commit contém o estado acumulado autorizado de Fitness/Saúde/assistente e os arquivos portáveis de Astro Boy. A documentação de encerramento acompanha esse commit em atualização posterior. Nenhum deployment ou chamada remota do assistente foi realizado.
