// Reviewed classification of the EXISTING client projection, not a new cloud schema
// or migration implementation. Key coverage is checked against real persist outputs.
export const cloudCoverage = {
 core: {
  executionLogs: ['local-only','Livro de execuções do core sem tabela neste serviço.'],
  accounts: ['local-only','Catálogo de perfis locais sem vínculo remoto.'],
  currentAccountId: ['local-only','Seleção local não identifica o usuário autenticado.'],
  accountDataById: ['local-only','Snapshots de outros perfis não são publicados.'],
  user: ['partial','profiles recebe apenas id remoto, display_name e avatar; XP e recursos não entram.'],
  onboarding: ['partial','Seleções influenciam projeções de áreas; objeto completo não retorna.'],
  customAreas: ['partial','Metadados passam por deduplicação e filtragem de linhas sintéticas.'],
  customSubareas: ['partial','Metadados são agrupados pelo parentId; linhas sintéticas são filtradas.'],
  linkedSubareasByAreaId: ['partial','Mapa é projetado em metadados de áreas base, com fallback do catálogo.'],
  actions: ['local-only','Coleção canônica não é uma tabela do sync legado.'],
  tasks: ['payload','Árvore e recibos seguem no payload, com deduplicação por id.'],
  habits: ['payload','Agenda, subitens, quantidades e recibos seguem no payload.'],
  cycleSequences: ['payload','Sequências seguem no payload; vínculos são saneados ao hidratar.'],
  sequenceMemberships: ['payload','Vínculos válidos seguem no payload; posição é normalizada ao hidratar.'],
  commitments: ['local-only','Compromissos não fazem parte deste serviço.'],
  projects: ['payload','Projetos, descendentes e recibo de bônus seguem no payload.'],
  quests: ['payload','Jornadas, referências e recibo de bônus seguem no payload.'],
  drafts: ['payload','Rascunhos seguem no payload.'],
 },
 fitness: {
  currentAccountId: ['local-only','Seleção local de Treinos sem vínculo neste serviço.'],
  accountDataById: ['local-only','Histórico legado e medidas de todas as contas ficam fora.'],
  nativeDataById: ['local-only','Templates, sessões, avaliações, recordes e recibos nativos ficam fora.'],
 },
};
