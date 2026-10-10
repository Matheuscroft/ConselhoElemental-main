import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const app = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(app, '..');
const stateDir = process.env.ASTRO_BOY_STATE_DIR || resolve(app, '.astro-boy');
const stateFile = resolve(stateDir, 'profile.json');
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
    onboardingRequired: !profile?.introducedAt,
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
  console.log('Fábio: frontend. Matheus: backend e documentação. Entregas: seleção/criação/execução Fitness, contextos esportivos e métricas declaradas; protótipo local do assistente. Integração remota e aderência integral do core ainda têm pendências.');
  console.log(`Próximo passo: ${current.profile?.role === 'backend' ? 'ler a auditoria de contratos e propor um teste reproduzível antes de alterar regras.' : 'ler continuidade e selecionar um lote da fila com critério de aceite.'}`);
  console.log('Preview: cd app, npm ci, npm run dev; abra a URL exibida pelo Vite, /treinos e /treinos/painel.');
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
    save({ ...profile, introducedAt: profile.introducedAt || new Date().toISOString() });
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
