# GymMane: avaliação e plano de evolução de Treinos

Início 05/11, conclusão 06/11/2026 · G01 · Astro Boy sequencial · produto local mantido em 0.1.123. Este documento registra a análise solicitada; não autoriza nem comprova uma implementação do GymMane no app. Fila operacional: [FILA-ENTREGAS](../FILA-ENTREGAS.md). O repasse [H01](REPASSE-BACKEND-0.1.123.md) continua referência para o código atual ainda sem publicação.

## Parecer

GymMane é uma referência funcional adequada para elevar Treinos: sessão guiada, descanso, último desempenho, progressão, biblioteca, rotinas, métricas e ferramentas têm implementação rastreável. Recomendação: reproduzir a experiência funcional em React/TypeScript sobre os stores e adapters existentes. Não migrar o app inteiro para Flutter, embarcar um segundo estado Fitness ou trocar economia/conta para obter o layout.

É um port de produto com paridade verificável, não instalação de biblioteca React nem aplicação de CSS. Paridade web do núcleo de treino é viável; paridade de widgets/sensores/alarmes de sistema exige uma decisão separada de plataforma. A licença precisa ser tratada antes de incorporar material.

## Fontes e versão da análise

- Público: https://github.com/InlitX/GymMane
- Main inspecionada: **129349d23c154639125006e4473ed2808daec258**, commit de 05/11 que adiciona sessão leve e repetições por lado.
- Base estável recomendada: **v2.0.0 / 7579501c6c69c7b459f5be84a1dc9aa6d5da3db6**, publicada em 03/11/2026. Main tem 19 arquivos alterados depois da tag; não tratar o CI da tag como aceite da main atual.
- CI observado: https://github.com/InlitX/GymMane/actions/runs/41724111321 . API de jobs confirmou Analyze, Test e Build split APKs com success. Não executados por este executor.
- Clone temporário somente para leitura, fora do app: `/tmp/gymmane-audit.y1sekg/repo`, partial/sparse clone. Recriar pela URL/tag se /tmp for removido. Nada do código, APK ou assets foi instalado/incorporado no app.
- Foram encontrados 1.581 arquivos rastreados, 299 Dart e 96 arquivos *_test.dart na main. Esses números são inventário de arquivos, não testes executados/aprovados. São 388 arquivos de poses em assets/art; 466 construtores Exercise identificados por padrão textual, o que não mede o catálogo final gerado. README anuncia mais de 500 exercícios.

O link é suficiente: o executor pode obter fontes, licença, testes e screenshots pelo repositório público. Download manual/ZIP, API key, conta do usuário ou sessão pessoal não são necessários para esta análise. APK/gravação de uso em Android é opcional e útil apenas para confirmar gestos, áudio e transições nativas.

## Stack e arquitetura encontradas

Flutter/Dart, SDK Dart ^3.11.5 no pubspec, Flutter 3.41.9 fixado no workflow. Estado FitState/FitCore organizado em numerosos mixins (treino, estatísticas, biblioteca, rotinas, nutrição, saúde etc.). Sessão principal com aproximadamente 3.529 linhas de Dart; port deve decompor componentes, sem traduzir esse arquivo mecanicamente.

Store.instance usa SharedPreferences com envelope JSON gymmane_v1; serviços distintos tratam mídia, ZIP, importadores, alarmes e dispositivos. Há dependências e chamadas nativas como flutter_local_notifications, home_widget, path_provider, image_picker, share_plus e MethodChannel/dart:io. Foram identificados 41 arquivos que fazem referência a APIs/condições de plataforma; isso é indicador de fronteira, não contagem de funcionalidades incompatíveis.

A base observada não tem a integração online de conta necessária ao Conselho. Não substitui F6, Supabase/RLS/recibos, importação integral entre origens ou rollout de conta. Não adicionar outro Auth, outro motor de XP nem saldo de treino paralelo.

## Experiência visual examinada

Foram abertas as screenshots de referência 01-home, 04-session e 02-progress no clone, disponibilizadas pelo próprio repositório. Não são inspeção do APK em execução nem prova de fluidez.

- Home: rotina de hoje ocupa o destaque; um CTA grande; semana e métricas antes das pastas de rotina.
- Sessão: um exercício em foco; último resultado e próximo alvo próximos; animação; descanso com ajustes rápidos; tabela de séries com controles diretos de repetição/carga e conclusão.
- Evolução: seletor de período, métricas legíveis, curvas e heatmap. Dados detalhados ficam progressivos, fora da ação principal.
- Navegação: shell próprio para treino/estatísticas/biblioteca/perfil. No Conselho deve conviver com a navegação global; não sobrepor duas barras inferiores concorrentes.

Aplicar a identidade elemental sobre essa organização: superfície escura e vidro existente, dourado, acentos por contexto, ícones próprios, tipografia de leitura nos números, efeitos de confirmação após sucesso. Os fluxos GymMane guiam a organização; a direção visual de Fábio continua vigente. Preservar legibilidade e campos visíveis durante o treino; efeitos não devem ocultar séries ou bloquear registro.

## Recursos: reutilização, lacuna e destino

### Núcleo de Treinos e execução

Referências: lib/screens/home_screen.dart, train_screen.dart, session_screen.dart; lib/models/workout.dart e live_session.dart; lib/state/workout_state.dart.

Hoje, começar/retomar, execução por exercício, histórico da última sessão, carga/repetições/duração, descanso, pular/trocar exercício, notas e resumo devem formar o piloto. No Conselho já há templates, sessão ativa/pausa/recarga, séries, RPE, observações e histórico. Manter ActiveFitnessSession, WorkoutStore e IDs existentes; reorganizar apresentação e ações. Continuidade de relógio deve usar a fonte temporal atual, sem trocar fórmula de recompensa.

Tipos de série do GymMane: normal, warmup, drop, failure, restPause e cluster. Há supersets e configuração RPE/RIR; main adiciona repetições por lado e sessão leve. Conselho hoje não representa todo esse conjunto nos tipos WorkoutSet/PerformedSet. Adicionar campos opcionais/versionados, estados de execução e métricas somente após definir seus efeitos; não reclassificar séries antigas por suposição.

Aquecimento não entra no volume de trabalho da mesma forma no GymMane; esse comportamento pode divergir dos seletores atuais. Preservar métricas históricas e tratar a alteração explicitamente, sem normalização silenciosa. Nenhuma mudança de XP/Prana, fatores, tetos ou fonte de tempo é autorizada pela escolha de UI de referência.

### Catálogo, animações e anatomia

Referências: lib/catalog/exercise_catalog.dart, body_svg.dart/body_svg_female.dart, merged_exercises.dart; widgets/body_map.dart e exercise_art.dart.

GymMane fornece instruções, grupos musculares, equipamentos, níveis, exercícios próprios e poses. As artes estão em texto de paths SVG, com duas ou três poses; Flutter as interpreta e colore pelo tema. Podemos criar renderer React/SVG e cache/lazy loading após conferir licenças e traçabilidade. Não são modelos 3D realistas; recolorir não muda a natureza da arte.

Conselho já possui catálogos recentes de Matheus, anatomia/filtros, variantes e exercícios customizados. Preservá-los. Fazer catálogo de correspondência por identidade externa/versão e vínculo ao UUID existente, com revisão de nomes/equipamentos/unidades. Não importar por nome automaticamente, nem gerar novos UUIDs a cada abertura. A origem/licença/campos novos devem entrar nos tipos, auditor de backup e persistência compatível.

Mapa muscular deve oferecer toque e alternativa por lista/teclado; seleção produz sugestão de treino editável antes de começar. Corpo ilustrativo atual não é informação biométrica nem justificativa para inventar métricas.

### Progressão, estatísticas e conquistas

Referências: models/progression.dart, state/stats_state.dart, awards_state.dart e testes progression/calculators/records.

Estratégias manual, linear, dupla, volume e AMRAP, estagnação e deload são recursos novos relevantes. Primeira implantação como sugestão compreensível baseada no histórico; alteração automática de carga só com escolha explícita. Não tratar algoritmo como avaliação clínica ou adequação individual.

Volume, PRs, estimativa de 1RM, força relativa, heatmap e mapas de treino entram em Saúde/Evolução usando seletores com origem clara. Parte das medições/recordes já existe no Conselho; comparar unidades e definição de séries de trabalho antes de alterar resultados.

Medalhas, níveis, celebrações e compartilhamento devem ser traduzidos para o personagem e suas regras atuais, sem copiar uma segunda progressão. Conclusão de série não vira uma recompensa Core adicional; completeFitnessSession continua responsável por consolidar uma ocorrência com recibo. Importação não concede XP retroativo automaticamente.

### Rotinas, locais e planejamento

Referências: state/routines_state.dart, places_state.dart, catalog/program_templates.dart e screens/routines_screen.dart/routine_edit_screen.dart/places_screen.dart.

Pastas/agrupamentos, semana, rotação, descanso por exercício e modelos guiados podem melhorar a Biblioteca. No Conselho templates e sequências já integram Ciclos via scheduleWorkoutAsHabit/scheduleSequenceAsRotation. Reutilizar essa ponte; não introduzir um segundo hábito/rotador.

Locais/casa/academia com equipamento disponível e sugestões compatíveis são expansão de metadados e filtro. Não inventar GPS/localização real. Programas prontos entram como modelos editáveis, sem ativar calendário ou atividades automaticamente.

### Dados, mídia, ferramentas e extensões

Referências: services/workout_import.dart, fitnotes_backup.dart, backup_zip.dart, fit_export.dart; state/tools_state.dart, models/progress_shot.dart, models/nutrition.dart.

CSV, ZIP e importadores Hevy/Strong/Lyfta/FitNotes/openGym exigem mapeamento de formato, unidades, datas/fuso, validação, prévia, deduplicação e preservação de recibos. O ZIP nativo não deve ser importado diretamente pelo restaurador integral atual. Construir adapter no contrato existente e incluir mídia/metadados na estratégia de backup/conta, com cancelamento e readback antes de aplicar.

Diário, fotos, medidas, PDFs/cartões e ferramentas como anilhas/1RM/aquecimento podem entrar como lotes complementares. Mídia grande precisa de armazenamento e limites próprios revisados; não colocar binários indiscriminadamente no envelope de localStorage. As calculadoras não devem alterar pontuação ou prescrever metas automaticamente.

Nutrição é beta no projeto de origem: alimentos, refeições, água, suplementos e planejamento. Mantê-la no mapa de paridade, porém em expansão posterior ao núcleo de Treinos, sem prometer maturidade de produção ou substituir o contador geral de atividades.

## Limite de plataforma

A UI React pode reproduzir os principais fluxos de treino no navegador. Alarmes com app fechado, widgets de tela inicial, sensores/passos, integração saúde/fones, compartilhamento/arquivos e Wear OS exigem análise por plataforma. APIs de browser têm permissões/suporte distintos; renderizar um botão não entrega o serviço de sistema.

Recomendação inicial: fechar núcleo mobile web atual. Se alarmes/widgets/integrações nativas forem indispensáveis, avaliar empacotamento como Capacitor em lote próprio, com testes/permissão/distribuição Android e iOS. Não instalar wrapper nem mudar framework agora. O suporte iOS/Wear é indicado como em andamento no README do GymMane, não validado por presença de arquivos Dart.

Fontes: https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API e https://capacitorjs.com/docs/apis/local-notifications . Não há promessa de paridade nativa apenas pelo deploy na Vercel.

## Licenças: decisão necessária antes de incorporar

ADDITIONAL_TERMS.md declara **GPL-3.0-only** e requer manter “Based on GymMane by InlitX” nos avisos apropriados, como Sobre. CREDITS.md separa a arte de exercícios **CC BY-SA 4.0**, de Workout Guide/Bryl Lim/Everkinetic, e fontes **SIL OFL**. Copiar código/Dart traduzido ou assets não se torna livre de condições por receber o tema elemental.

Antes de incorporação direta, revisar compatibilidade/distribuição do projeto e os avisos/atribuições exigidos; não concluir que apenas exibir crédito resolve todas as obrigações. A alternativa de reconstruir os fluxos em React com implementação própria também exige revisar qualquer código/arte efetivamente reutilizado. Nenhuma conclusão jurídica abrangente sobre o produto combinado foi feita nesta análise.

https://github.com/InlitX/GymMane/blob/main/LICENSE
https://github.com/InlitX/GymMane/blob/main/ADDITIONAL_TERMS.md
https://github.com/InlitX/GymMane/blob/main/CREDITS.md

## Etapas de implementação recomendadas

1. **Contrato e decisão de portabilidade — Astra Médio; alternativa econômica Sol Alto.** Fixar tag estável, mapear paridade e diferenças da main, licenças, navegação e campos. Revisar o checkpoint/publicação H01 com Matheus antes de uma nova reestruturação grande. Saída: mapa por tela/ação, contrato de dados e matriz de aceite.
2. **Piloto completo de execução — Sol Alto nos adapters; Sol Médio na interface.** Hoje → template → execução/séries/descanso → concluir → resumo → histórico → recarregar. Reusar os stores e recibos atuais, sem migração global ou recompensa duplicada. Validar com fixture criada pelos comandos reais.
3. **Catálogo, poses, mapa corporal e filtros — Sol Médio.** IDs/atribuições, renderer, seleção acessível, busca, exercícios próprios e equipamentos. Confirmar correspondência e permanência dos catálogos existentes; sem baixar tudo para o bundle inicial.
4. **Séries e progressão avançadas — Sol Alto.** Tipos opcionais, supersets, RIR, histórico comparável e sugestões; testes de contratos e aprovação explícita quando uma regra existente precisar mudar. Não copiar fórmulas por semelhança visual.
5. **Planejamento e evolução — Sol Alto nas métricas; Sol Médio na UX.** Rotinas, locais, planos semanais/rotação, PRs/curvas/heatmap, medidas e conquistas adaptadas. Preservar as pontes Core e ausência de efeitos em leitura de histórico.
6. **Dados e plataformas — Sol Alto.** Importadores, exportação, mídia/offline, conta/backup integral e falhas/reload/conflito. F6 é dependência de conta e de rollout; pode avançar com Matheus em paralelo coordenado. Nutrição/nativo não bloqueiam o piloto, mas fazem parte de lotes próprios se a meta for todo o produto.
7. **Identidade e aceite final — Sol Médio; Alto se surgir falha de dados.** Manter tokens atuais durante os pilotos e fazer acabamento elemental completo após paridade funcional: vidro, ícones, cronômetro/descanso, poses e feedback; verificar mobile 360/390, tablet, teclado/foco/movimento reduzido, offline, erro e retomada. Finalizar por critérios, sem prometer quantidade fixa de rodadas ou zero bugs.

Esta seleção é recomendação de trabalho, não benchmark entre modelos. Documentação oficial posiciona Astra em tarefas mais exigentes e Sol em trabalho complexo com atenção a custo; esforço maior aumenta tempo/uso. Não há necessidade demonstrada de Max/Ultra nesta fase e nenhuma troca de modelo foi efetuada pelo executor.

https://learn.chatgpt.com/docs/models
https://learn.chatgpt.com/docs/model-selection

## O que é necessário do usuário

- A URL pública já resolve o acesso às fontes. Não precisa reenviar vídeos/prints, baixar ZIP ou fornecer credenciais para começar o mapeamento/piloto.
- Antes de copiar código/arte, decidir a abordagem de licenciamento do produto combinado e as condições de incorporação.
- Confirmar no planejamento se a primeira entrega continua mobile web ou exige desde já funções nativas de Android/iPhone. Padrão recomendado: mobile web, preservando o app atual.
- Aprovar a sequência do piloto e o escopo de paridade: núcleo de treino primeiro; nutrição e hardware depois. Vídeo de uso pode complementar decisões de gestos/ritmo, sem ser pré-condição para o código.
- Qualquer mudança de economia/fonte de tempo/persistência ou aplicação remota precisa de seu escopo próprio. Nenhum secret, dado pessoal ou sessão real é necessário para o desenvolvimento do piloto sintético.

## Evidências e limites desta rodada

Executado: metadados GitHub via connector, clone raso/partial e leitura de fonte/tag, inspeção de modelos/serviços/shell/testes/workflow/licenças, consulta pública de release/jobs/issues e inspeção das três screenshots de referência. Jobs observados são externos, não execução própria. Flutter/Dart não disponíveis via PATH; não executados flutter test/analyze, APK, build web ou protótipo integrado.

Tests stats_realdata_test.dart e import_real_files_test.dart pulam quando fixtures privadas não publicadas estão ausentes. Existem issues abertas; isso não prova defeito específico, mas também não autoriza declarar todos os fluxos completos/validados. Na main há mudanças posteriores ao CI da release.

Criado também painel analítico original .canvas.tsx, com matriz de paridade e etapas/modelos; TypeScript contra o SDK local passou sem erros. Canvas é relatório de planejamento, não novo frontend do app. Sem importação de fontes/assets no produto, dependências instaladas, edição de código/versão, acesso a banco/credenciais/storage pessoal, inspeção da origem local bloqueada, push ou deploy. As verificações 661 da 0.1.123 são históricas da integração anterior e não validam esta futura adaptação.
