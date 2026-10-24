import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const app = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(app, '..');
const stateDir = process.env.ASTRO_BOY_STATE_DIR || resolve(app, '.astro-boy');
const stateFile = resolve(stateDir, 'profile.json');
const briefingId = 'repaginacao-elemental-r14-2026-10-23';
const handoffDocument = 'app/docs/REPASSE-FRONTEND-PARA-BACKEND.md';
const roles = ['frontend', 'backend', 'documentacao', 'fullstack'];
const args = process.argv.slice(2);
const command = args.shift() || 'status';
const option = (name) => {
  const index = args.indexOf(`--${name}`);
  return index < 0 ? undefined : args[index + 1];
};
const git = (...values) => {
  try { return execFileSync('git', values, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return null; }
};
const readProfile = () => {
  if (!existsSync(stateFile)) return null;
  const profile = JSON.parse(readFileSync(stateFile, 'utf8'));
  if (profile.schema !== 1 || typeof profile.name !== 'string' || !profile.name.trim() || !roles.includes(profile.role)) {
    throw new Error('Perfil inválido. Execute setup com nome e papel explícitos.');
  }
  return profile;
};
const save = (profile) => {
  mkdirSync(stateDir, { recursive: true });
  writeFileSync(stateFile, JSON.stringify(profile, null, 2) + '\n', { mode: 0o600 });
};
const status = () => {
  const profile = readProfile();
  return {
    coordinator: 'Astro Boy', project: 'Domínio do Mago',
    version: JSON.parse(readFileSync(resolve(app, 'package.json'), 'utf8')).version,
    profile, suggestedGitAuthor: git('config', 'user.name'),
    onboardingRequired: !profile?.introducedAt || profile?.briefingAcknowledged !== briefingId,
    updateBriefingRequired: profile?.briefingAcknowledged !== briefingId,
    briefingId, handoffDocument,
    branch: git('branch', '--show-current'), commit: git('rev-parse', '--short', 'HEAD'),
    workingTree: git('status', '--short'),
    continuity: 'app/docs/CONTINUIDADE.md', queue: 'app/docs/FILA-ENTREGAS.md',
    welcomeGuide: 'app/docs/ASTRO-BOY-BOAS-VINDAS.md',
  };
};
const welcome = () => {
  const current = status();
  console.log(`Olá, ${current.profile?.name || 'colaborador'}! Sou Astro Boy, coordenador do Domínio do Mago.`);
  console.log(`Versão ${current.version} | ${current.branch || 'sem branch'} | revisão ${current.commit || 'não disponível'}.`);
  console.log('Posso planejar etapas, implementar frontend/backend, revisar contratos, testar, versionar e manter a documentação, conforme as ferramentas desta IDE.');
  console.log('Equipe: Astro Boy coordena; Interface cuida da UX; Backend/Regras cuida de contratos e integrações; Validação verifica evidências; Versionamento/Documentação mantém versões e continuidade. Papéis executados em série ou delegados quando autorizado.');
  console.log('Base Fitness anterior (F59): unificamos Treinos, Terra e aliases numa experiência Fitness; criação livre de exercícios e mídia, prévia e execução com pausa, notas e distância; recompensa de sessão consolidada ER×0.10 restaurada por Matheus, sem recalcular histórico; resumo com avaliação e detalhes; Histórico, Saúde, Semana, Corpo e Evolução ligados aos registros existentes. O Astro Boy também recebeu continuidade, fila e onboarding portáveis.');
  console.log('Limites conhecidos: GPS/mapa, sensores, calorias, sono/água automáticos, widgets configuráveis e sincronização remota não foram implementados neste lote. Mídia remota e execução legada completa ainda precisam de validação. Não há agentes continuamente ativos: a coordenação depende desta IDE, das instruções e das ferramentas disponíveis.');
  console.log('Repaginação R01–R11: identidade elemental compartilhada; Santuário novo com corpo e quatro elementos animados em órbita; páginas de elementos e Pilares; navegação/cabeçalhos, ícones, cartões Showcase e expansões; Ciclos com calendário e composição; cronômetro elemental; Lua 3D e Temporal; Grimório com recursos/histórico; quests em Rituais ligadas a Jornadas/Grandes Obras e próximas etapas no Santuário.');
  console.log('Atualização R12–R14: trilhas com runas elementais, celebração e métricas registradas; criação contextual nos catálogos; Rituais como lista de tarefas, Ciclos como hábitos recorrentes, Jornadas como quests e Grandes Obras como projetos. Rituais recebeu capas Showcase com ações separadas e evolução compacta. Fragmentos e nova regra de streak ainda não foram implementados; contratos seguem pendentes com Matheus.');
  console.log('I03 permanece limitado a consentimento, texto mínimo/JWT, sugestão editável e confirmação pelo addDraft existente; sem ativação remota ou novos secrets.');
  console.log('Papéis: Fábio segue no frontend/UX e nas pendências visuais; Matheus responde pelo backend, contratos, auth, persistência e sincronização. Stores e fórmulas de Matheus foram preservados.');
  console.log('Atenção: etapas de quests leem tarefas atuais por ID, mas não reescrevem progresso/bônus macro; equipamentos são visuais. QA visual/fluxo de navegador e integração remota continuam pendentes. Consulte o relatório para testes realmente executados.');
  console.log(`Repasse completo: ${handoffDocument}. Leia também CONTINUIDADE.md e FILA-ENTREGAS.md antes de editar.`);
  console.log(`Próximo passo: ${current.profile?.role === 'backend' || current.profile?.role === 'documentacao' ? 'ler o repasse, conferir contratos e divergências de snapshots/progresso macro, reversão/idempotência e isolamento/sincronização; não reintroduzir recompensa por blocos nem alterar fórmula sob escopo visual.' : 'retomar QA de Santuário, Ciclos, Grimório e quests em 360/390/768/1440; continuar as telas restantes e refinamentos de UX pela fila, preservando backend e dados.'}`);
  console.log('Preview local: na raiz do repositório, entre em app, rode npm ci e npm run dev; abra a URL exibida pelo Vite e confira /santuario, /rituais, /ciclos, /grimorio e /lua; o Fitness permanece em /treinos.');
  console.log('Guia: app/docs/ASTRO-BOY-BOAS-VINDAS.md. Consulte continuidade para o estado vigente; esta saída não executa testes nem inicia agentes.');
};

try {
  if (command === 'setup') {
    const name = option('name')?.trim();
    const role = option('role') || (name === 'Matheus' ? 'backend' : ['Fábio', 'Fabio'].includes(name) ? 'frontend' : null);
    if (!name || name.length > 80 || /[\x00-\x1f\x7f]/u.test(name) || !roles.includes(role)) {
      throw new Error('Use setup --name "Matheus" --role backend. Papéis: ' + roles.join(', '));
    }
    const previous = readProfile();
    save(previous?.name === name && previous.role === role ? previous : { schema: 1, name, role, introducedAt: null });
    welcome();
    console.log('Perfil salvo somente nesta máquina. Na IDE, peça: Astro Boy, continue o projeto.');
  } else if (command === 'ack') {
    const profile = readProfile();
    if (!profile) throw new Error('Configure o perfil com setup antes de confirmar a apresentação.');
    save({ ...profile, introducedAt: profile.introducedAt || new Date().toISOString(), briefingAcknowledged: briefingId });
    console.log('Apresentação registrada nesta máquina.');
  } else if (command === 'welcome') welcome();
  else if (command === 'status') {
    const current = status();
    if (args.includes('--json')) console.log(JSON.stringify(current, null, 2));
    else {
      console.log(`${current.project} ${current.version} | ${current.branch} | ${current.commit}`);
      console.log(`Perfil: ${current.profile ? `${current.profile.name} / ${current.profile.role}` : 'não configurado; execute astro:setup'}`);
      console.log(`Boas-vindas pendentes: ${current.onboardingRequired ? 'sim' : 'não'}`);
      console.log(current.workingTree || 'Árvore de trabalho limpa.');
      console.log(`Retomada: ${current.continuity}`);
    }
  } else throw new Error('Comandos: setup, status [--json], welcome, ack.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
