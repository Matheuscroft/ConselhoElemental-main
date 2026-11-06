import type { ProgressSnapshot } from './progress-backup';
type Data = Record<string, unknown>;
const object = (v: unknown): v is Data => !!v && typeof v === 'object' && !Array.isArray(v);
const collections = ['actions', 'tasks', 'habits', 'projects', 'quests', 'missions', 'childItems', 'childHabits'];

/** Checks live hierarchy/sequence references, not historical references to deleted plans.
 * Multiple existing views may share an ID. They must agree on its explicit parent.
 */
export function auditProgressLinks(snapshot: ProgressSnapshot, add: (path: string, message: string) => void): void {
  const root = snapshot.stores.core.state;
  if (root.currentAccountId !== null && !(root.accounts as Data[]).some(p => p?.id === root.currentAccountId)) {
    add('core.currentAccountId', 'O perfil ativo não consta no cadastro desta cópia.');
  }
  const profiles: [string, Data][] = [['core', root]];
  for (const [id, profile] of Object.entries(root.accountDataById as Data)) if (object(profile)) profiles.push([`core.accountDataById[${JSON.stringify(id)}]`, profile]);
  for (const [path, profile] of profiles) {
    const ids = new Map<string, { parent: unknown; path: string }>();
    const entries: { value: Data; path: string }[] = [];
    function collect(container: Data, p: string) {
      for (const key of collections) if (Array.isArray(container[key])) {
        (container[key] as unknown[]).forEach((item, i) => {
          if (!object(item)) return;
          const location = `${p}.${key}[${i}]`;
          if (typeof item.id === 'string') {
            const previous = ids.get(item.id);
            if (previous && 'parentId' in item && previous.parent !== undefined && item.parentId !== previous.parent) add(location, 'As projeções da atividade discordam sobre seu vínculo.');
            if (!previous || previous.parent === undefined) ids.set(item.id, { parent: item.parentId, path: location });
          }
          entries.push({ value: item, path: location });
          collect(item, location);
        });
      }
    }
    collect(profile, path);
    const checked = new Set<string>();
    for (const [id, node] of ids) {
      if (node.parent !== undefined && node.parent !== null && (typeof node.parent !== 'string' || !ids.has(node.parent))) add(node.path, 'A atividade aponta para um item pai ausente.');
      if (checked.has(id)) continue;
      const chain = new Set<string>([id]);
      let next = node.parent;
      while (typeof next === 'string' && ids.has(next) && !checked.has(next)) {
        if (chain.has(next)) { add(node.path, 'A hierarquia contém um vínculo circular.'); break; }
        chain.add(next); next = ids.get(next)!.parent;
      }
      chain.forEach(visited => checked.add(visited));
    }
    for (const entry of entries) {
      const { value, path: p } = entry;
      if (Array.isArray(value.children) && value.children.some(id => typeof id !== 'string' || !ids.has(id))) add(p, 'A atividade lista um subitem ausente.');
      if (Array.isArray(value.completions) && value.completions.some(c => object(c) && c.habitId !== value.id)) add(p, 'Um registro de conclusão pertence a outro ciclo.');
    }
    const sequences = new Set(Array.isArray(profile.cycleSequences) ? profile.cycleSequences.filter(object).map(s => s.id) : []);
    const seen = new Set<string>();
    if (Array.isArray(profile.sequenceMemberships)) profile.sequenceMemberships.forEach((member, i) => {
      const p = `${path}.sequenceMemberships[${i}]`;
      if (!object(member)) return;
      if (!sequences.has(member.sequenceId) || !ids.has(member.habitId as string)) add(p, 'A sequência possui um vínculo sem atividade ou sequência correspondente.');
      if (!Number.isInteger(member.position) || (member.position as number) < 0) add(p, 'A posição na sequência é inválida.');
      const identity = JSON.stringify([member.sequenceId, member.habitId]);
      if (seen.has(identity)) add(p, 'A atividade está vinculada mais de uma vez à mesma sequência.');
      seen.add(identity);
    });
    if (object(profile.user)) {
      const u = profile.user;
      if (typeof u.experience === 'number' && u.experience > 0 && ['xp_earth', 'xp_fire', 'xp_water', 'xp_air'].every(k => u[k] === 0)) {
        add(`${path}.user`, 'Este perfil usa experiência antiga que seria convertida durante o carregamento. A compatibilidade precisa de revisão.');
      }
    }
  }
}
