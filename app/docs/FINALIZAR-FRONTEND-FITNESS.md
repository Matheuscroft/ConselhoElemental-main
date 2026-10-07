# Missão atual: terminar o frontend do Fitness Kit

O usuário quer concluir o frontend de treinos e saúde seguindo as capturas locais, preservando funcionalidades. Continue a implementação existente. Este é o roteiro atual; roteiros antigos de auditoria são histórico. docs/PROMPT-NVIDIA-FITNESS.md é a especificação detalhada de design, subordinada à preservação funcional.

## Ambiente preparado

- Projeto: /Users/fabioandre/Developer/Conselheiro_Elemental_MAIN/app; branch codex/fitness-ui-integration; base 0.1.6. Confirme antes de editar.
- Fontes: src/pages/fitness, src/components/fitness-kit, src/lib/fitness-kit; tokens em tailwind.config.cjs. Não confunda com a versão extraída /Users/fabioandre/Developer/app.
- Servidor: http://127.0.0.1:5174. Dependências instaladas. Não reinstale tudo nem reconfigure IA, proxy, Figma ou Supabase.
- Referências: /Users/fabioandre/Pictures/PRINT/Fitness-app/. As capturas são suficientes; não espere desbloqueio do Figma.
- Backup: /Users/fabioandre/Developer/conselheiro-backups/frontend-handoff-016/workspace-before-handoff.tar.gz, sem remover arquivos do checkout.
- Smoke reutilizável: `node /Users/fabioandre/Developer/conselheiro-backups/frontend-handoff-016/smoke-frontend.mjs 5174`. Cria treino pela UI em Chrome temporário, verifica persistência, captura preview/sessão ainda ativa/resumo em quatro larguras e confere histórico. Leia o resultado antes de declarar aprovado.
- Chrome: /Applications/Google Chrome.app/Contents/MacOS/Google Chrome. Puppeteer instalado no node_modules do projeto. Nunca use dados do perfil real.

## Base pronta e pendências

A base funcional foi integrada. O Codex verificou o fluxo crítico e as correções do acesso à sessão ativa, catálogo e atalhos/contexto do painel. Build/lint anteriores passaram com quatro warnings preexistentes. O relatório de 42 imagens não é aprovação final: sessão responsiva mostrava Resumo, continuar foi testado depois de finalizar e catálogo usou seletor errado.

Agora termine o acabamento visual, incluindo dados reais, interações e superfícies ainda com estilo antigo. Não repita auditorias gerais antes de implementar. Para cada tela, abra a referência e capture o estado atual correto; registre até três diferenças concretas prioritárias e corrija-as. Se já atender aos critérios, preserve e mostre a evidência.

## Sequência de implementação

| Bloco | Referência: Captura de Tela 2026-10-02 às… | Entrega |
|---|---|---|
| A: seleção e preview | 21.26.22 e 21.27.06 | Duas colunas e ritmo de cards adaptado às duas categorias reais, seleção violeta, CTA pill; hero, painel curvo, metadados e lista do preview proporcionados ao kit. Preserve planos, sessão ativa, catálogo e criação. Use assets existentes pertinentes; documente fallback quando não houver imagem adequada. |
| B: sessão e resumo | 21.27.20 e 21.27.31 | Cards expansíveis, mídia existente, estados concluído/pulado/ativo, progresso verde e séries legíveis; resumo com hierarquia de métricas, identidade, avaliação, compartilhar e salvar. Capture sessão antes de finalizar. |
| C: saúde | 21.28.29, 21.28.41, 21.28.56 e 21.29.13 | Anéis dominantes e widgets reais; corpo com silhueta/medidas; tendência e semana com dados e cartões diários; histórico com badge, nome, métrica e data. Navegação coerente. |
| D: superfícies e acabamento | conjunto | Harmonize Novo treino, detalhe do exercício, avaliação corporal e estrelas com tokens do kit, mantendo campos, validações e ações. Revise estados vazios, teclado/foco, textos longos e desktop. |

A referência 21.27.48 é outdoor condicional. Não invente GPS, mapas, sensores, calorias ou métricas ausentes. Não transforme Stamina/Prana em métricas médicas. Preserve explicação da referência visual de 30min.

## Limites

Edite páginas/componentes do módulo e estilos/tokens necessários. Prefira componentes compartilhados fitness-kit a duplicar CSS por tela. Para diálogos compartilhados de components/workout, use variante visual opcional ou wrapper local, preservando APIs e valores padrão fora do módulo. Não mude stores, persistência, serviços, autenticação, backend, recompensas ou tipos do domínio. Registre dependências fora do frontend e siga com itens independentes.

Não retire recursos para aproximar o desenho. Não invente categorias. Não use git stash/reset/clean/checkout para checkpoint; faça backup externo. Nenhum commit, push ou deploy. Testes históricos pendentes não impedem implementar visual, mas não podem ser declarados aprovados.

## Execução e encerramento

1. Execute um bloco por vez, lendo imagens de referência com ferramenta de imagem e capturando os estados correspondentes. Registre diferenças específicas, não apenas "estrutura correta". Se não puder ler imagens, registre o impedimento sem fingir comparação.
2. Implemente as alterações e teste ações afetadas em 390 e 360px. Registre arquivos, antes/depois e evidências em docs/STATUS-FRONTEND-FITNESS.md. Versione ao concluir um lote revisável, não a cada ajuste mínimo. Sincronize package.json, os dois campos raiz do lockfile e changelog.
3. Ao terminar os blocos, rode smoke-frontend.mjs, build e lint. Complete casos de INSTRUCOES_VALIDACAO_FINAL.md usando INSTRUCOES_REPARAR_EVIDENCIAS.md. Corrija scripts de teste, não o frontend para compensar seletores errados.
4. Valide oito telas em 360/390/768/1440px com dados, rodapé após scroll, nomes longos e teclado nas ações principais. Confirme URL efetiva, título e estado por captura. Não atribua fidelidade percentual sem medição.
5. Entregue matriz por tela: implementado, evidência visual, ações verificadas e diferenças legítimas. Informe pendências reais; não declare conclusão com testes obrigatórios ausentes.

Continue A → B → C → D sem pedir autorização a cada ajuste deste escopo. Perto do limite de contexto, registre próximo item exato e arquivos em STATUS-FRONTEND-FITNESS.md e retome após compactação. Se usar agentes, mantenha um editor do frontend e um revisor somente leitura, sem edições concorrentes dos mesmos arquivos.
