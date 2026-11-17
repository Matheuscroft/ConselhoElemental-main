import test from 'node:test';
import assert from 'node:assert/strict';
import { loadComponent } from '../elemental/load-component.mjs';

const P = loadComponent('src/lib/workout/progressao.ts');

let n = 0;
const set = (o) => ({ id: `s${n++}`, setNumber: 1, completed: true, measureMode: 'reps', ...o });
const sessao = (id, day, sets, extra = {}) => ({
  id, nameSnapshot: 'Treino', status: 'completed', startedAt: `${day}T09:00:00`, completedAt: `${day}T10:00:00`, durationSeconds: 3600,
  exerciseResults: [{ exerciseId: 'sup', exerciseNameSnapshot: 'Supino', order: 0, sets }], ...extra,
});
const reps3 = (carga, reps, rpe) => [0, 1, 2].map(() => set({ loadKg: carga, reps, perceivedExertion: rpe }));

test('histórico: mais recente primeiro, ignora puladas, incompletas e canceladas', () => {
  const a = sessao('a', '2026-11-01', reps3(40, 10, 7));
  const b = sessao('b', '2026-11-08', [set({ loadKg: 40, reps: 10 }), set({ loadKg: 40, reps: 10, skipped: true }), set({ loadKg: 40, reps: 10, completed: false })]);
  const c = sessao('c', '2026-11-09', reps3(50, 5), { status: 'cancelled' });
  const h = P.historicoDoExercicio([a, b, c], 'sup');
  assert.deepEqual(h.map((e) => e.sessaoId), ['b', 'a']);
  assert.equal(h[0].series.length, 1);
  assert.deepEqual(P.historicoDoExercicio([a], 'outro'), []);
});

test('sugestão: primeira vez', () => {
  assert.equal(P.sugestaoDeProgressao([]).motivo, 'primeira-vez');
});

test('sugestão: subir carga com +2,5% arredondado a 0,5 kg', () => {
  const h = P.historicoDoExercicio([sessao('a', '2026-11-01', reps3(40, 10, 7))], 'sup');
  const s = P.sugestaoDeProgressao(h, { repsMax: 10 });
  assert.equal(s.motivo, 'subir-carga');
  assert.equal(s.cargaKg, 41); // 2.5% of 40 = 1.0
  const h2 = P.historicoDoExercicio([sessao('a', '2026-11-01', reps3(10, 10, 7))], 'sup');
  assert.equal(P.sugestaoDeProgressao(h2, { repsMax: 10 }).cargaKg, 10.5); // minimum +0.5
  const h3 = P.historicoDoExercicio([sessao('a', '2026-11-01', reps3(100, 10, 7))], 'sup');
  assert.equal(P.sugestaoDeProgressao(h3, { repsMax: 10 }).cargaKg, 102.5);
  assert.match(s.texto, /Última vez: 3 × 10 · 40 kg\. Hoje: 41 kg\./);
});

test('sugestão: manter quando não bateu o topo ou RPE alto', () => {
  const h = P.historicoDoExercicio([sessao('a', '2026-11-01', reps3(40, 8, 7))], 'sup');
  assert.equal(P.sugestaoDeProgressao(h, { repsMax: 10 }).motivo, 'manter');
  const alto = P.historicoDoExercicio([sessao('a', '2026-11-01', reps3(40, 10, 9))], 'sup');
  assert.equal(P.sugestaoDeProgressao(alto, { repsMax: 10 }).motivo, 'manter');
});

test('sugestão: sem alvo usa a maior repetição feita', () => {
  const h = P.historicoDoExercicio([sessao('a', '2026-11-01', [set({ loadKg: 20, reps: 10 }), set({ loadKg: 20, reps: 8 })])], 'sup');
  assert.equal(P.sugestaoDeProgressao(h).motivo, 'manter');
  const ok = P.historicoDoExercicio([sessao('a', '2026-11-01', reps3(20, 10))], 'sup');
  assert.equal(P.sugestaoDeProgressao(ok).motivo, 'subir-carga');
});

test('sugestão: sem carga sobe uma repetição', () => {
  const h = P.historicoDoExercicio([sessao('a', '2026-11-01', [12, 12, 12].map((r) => set({ reps: r, perceivedExertion: 7 })))], 'sup');
  const s = P.sugestaoDeProgressao(h);
  assert.equal(s.motivo, 'subir-reps');
  assert.equal(s.reps, 13);
  assert.equal(s.cargaKg, undefined);
});

test('sugestão: aliviar só com RPE >= 9,5 em duas sessões seguidas', () => {
  const duas = P.historicoDoExercicio([sessao('a', '2026-11-01', reps3(40, 10, 10)), sessao('b', '2026-11-08', reps3(40, 10, 9.5))], 'sup');
  const s = P.sugestaoDeProgressao(duas, { repsMax: 10 });
  assert.equal(s.motivo, 'aliviar');
  assert.equal(s.cargaKg, 38);
  const uma = P.historicoDoExercicio([sessao('a', '2026-11-01', reps3(40, 10, 6)), sessao('b', '2026-11-08', reps3(40, 10, 10))], 'sup');
  assert.notEqual(P.sugestaoDeProgressao(uma, { repsMax: 10 }).motivo, 'aliviar');
});

test('sugestão: duração +5% do tempo', () => {
  const dur = (s, rpe) => set({ measureMode: 'duration', durationSeconds: s, perceivedExertion: rpe });
  const h = P.historicoDoExercicio([sessao('a', '2026-11-01', [dur(60, 7), dur(60, 7)])], 'sup');
  const s = P.sugestaoDeProgressao(h, { segundos: 60 });
  assert.equal(s.motivo, 'subir-reps');
  assert.equal(s.segundos, 63);
  const curto = P.historicoDoExercicio([sessao('a', '2026-11-01', [dur(45, 7)])], 'sup');
  assert.equal(P.sugestaoDeProgressao(curto, { segundos: 60 }).motivo, 'manter');
});

test('recordes: carga, reps, volume, 1RM estimado, duração e distância', () => {
  const a = sessao('a', '2026-11-01', [set({ loadKg: 40, reps: 10 }), set({ loadKg: 40, reps: 10 })]);
  const b = sessao('b', '2026-11-08', [set({ loadKg: 50, reps: 5, distanceMeters: 100 }), set({ measureMode: 'duration', durationSeconds: 90 })]);
  const r = P.recordesDoExercicio(P.historicoDoExercicio([a, b], 'sup'));
  assert.deepEqual(r.cargaMaximaKg, { valor: 50, data: '2026-11-08T10:00:00', sessaoId: 'b' });
  assert.equal(r.repsMaximas.valor, 10);
  assert.equal(r.repsMaximas.sessaoId, 'a');
  assert.equal(r.volumeMaximo.valor, 800);
  assert.equal(r.melhor1RMEstimado.valor, 58.3); // 50 × (1 + 5/30)
  assert.equal(r.duracaoMaximaS.valor, 90);
  assert.equal(r.distanciaMaximaM.valor, 100);
});

test('recordes: empate fica com a data mais antiga', () => {
  const a = sessao('a', '2026-11-01', [set({ loadKg: 40, reps: 10 })]);
  const b = sessao('b', '2026-11-08', [set({ loadKg: 40, reps: 10 })]);
  assert.equal(P.recordesDoExercicio(P.historicoDoExercicio([b, a], 'sup')).cargaMaximaKg.sessaoId, 'a');
});

test('recorde quebrado vs estreia', () => {
  const a = sessao('a', '2026-11-01', [set({ loadKg: 40, reps: 10 })]);
  const b = sessao('b', '2026-11-08', [set({ loadKg: 45, reps: 10 })]);
  assert.deepEqual(P.recordesQuebradosNaSessao(a, []), [{ exerciseId: 'sup', nome: 'Supino', tipo: 'estreia' }]);
  const quebrados = P.recordesQuebradosNaSessao(b, [a]);
  assert.ok(!quebrados.some((q) => q.tipo === 'estreia'));
  const carga = quebrados.find((q) => q.tipo === 'carga');
  assert.equal(carga.valorNovo, 45);
  assert.equal(carga.valorAnterior, 40);
  assert.ok(quebrados.some((q) => q.tipo === 'volume') && quebrados.some((q) => q.tipo === '1rm'));
  assert.ok(!quebrados.some((q) => q.tipo === 'reps')); // 10 = 10, not a record
  assert.deepEqual(P.recordesQuebradosNaSessao(a, [b]), []); // lower than before
  assert.deepEqual(P.recordesQuebradosNaSessao(b, [a, b]).map((q) => q.tipo), quebrados.map((q) => q.tipo)); // itself ignored
});

test('recordes da modalidade e sequência de semanas', () => {
  const tpl = [{ id: 't1', modality: 'running' }];
  const run = (id, day, dist, active) => sessao(id, day, [set({ measureMode: 'duration', durationSeconds: 600, distanceMeters: dist })], { templateId: 't1', activeDurationSeconds: active });
  const sessoes = [run('a', '2026-10-27', 3000, 1500), run('b', '2026-11-03', 5000, 2400), run('c', '2026-11-10', 4000, 1800), run('x', '2026-11-12', 9999, 9999)].map((s, i) => (i === 3 ? { ...s, templateId: undefined } : s));
  const r = P.recordesDaModalidade(sessoes, 'running', { templates: tpl, hoje: new Date('2026-11-12T12:00:00'), comecoDaSemana: 1 });
  assert.equal(r.treinos, 3);
  assert.equal(r.maiorDistanciaM.valor, 5000);
  assert.equal(r.maiorTempoAtivoS.valor, 2400);
  assert.equal(r.maisSeries.valor, 1);
  assert.equal(r.semanasAtivasSeguidas, 3);
  assert.equal(r.melhorSequenciaDeSemanas, 3);
  // current week empty: streak still counts up to last week
  const r2 = P.recordesDaModalidade(sessoes, 'running', { templates: tpl, hoje: new Date('2026-11-18T12:00:00'), comecoDaSemana: 1 });
  assert.equal(r2.semanasAtivasSeguidas, 3);
  const r3 = P.recordesDaModalidade(sessoes, 'running', { templates: tpl, hoje: new Date('2026-12-02T12:00:00'), comecoDaSemana: 1 });
  assert.equal(r3.semanasAtivasSeguidas, 0);
  assert.equal(r3.melhorSequenciaDeSemanas, 3);
});

// 2026-11-18 is a Wednesday.
const hoje = new Date('2026-11-18T12:00:00');
const templates = [
  { id: 'tA', name: 'Peito', modality: 'strength' },
  { id: 'tB', name: 'Corrida', modality: 'running' },
  { id: 'tC', name: 'Yoga', modality: 'yoga', scheduledAt: '2026-11-20T08:00:00' },
];
const habito = (ref, days) => ({ sourceModule: 'modulo_treino', sourceRefId: ref, recurrenceType: 'WEEKLY', recurrenceConfig: { daysOfWeek: days }, createdAt: new Date('2026-01-01T00:00:00') });
const feito = (id, day, tpl, secs = 1800) => sessao(id, day, [set({ reps: 5 })], { templateId: tpl, nameSnapshot: tpl, durationSeconds: secs });

test('semana: segunda ou domingo como início, rótulos e hoje', () => {
  const seg = P.semanaDoPlano({ templates, habitos: [], sessoes: [], hoje, comecoDaSemana: 1 });
  assert.deepEqual(seg.map((d) => d.rotuloCurto), ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']);
  assert.equal(seg[0].data, '2026-11-16');
  assert.equal(seg.filter((d) => d.ehHoje).length, 1);
  assert.equal(seg[2].ehHoje, true);
  const dom = P.semanaDoPlano({ templates, habitos: [], sessoes: [], hoje, comecoDaSemana: 0 });
  assert.equal(dom[0].data, '2026-11-15');
  assert.equal(dom[0].rotuloCurto, 'dom');
});

test('semana: perdido, feito, parcial, planejado, data e vazio', () => {
  const habitos = [habito('tA', [1, 3]), habito('tB', [1, 5])]; // A: seg+qua, B: seg+sex
  const sessoes = [feito('s1', '2026-11-16', 'tA', 2700), feito('s2', '2026-11-18', 'tA'), feito('s3', '2026-11-17', 'avulso')];
  const w = P.semanaDoPlano({ templates, habitos, sessoes, hoje, comecoDaSemana: 1 });
  assert.equal(w[0].estado, 'parcial'); // seg: A done, B not
  assert.equal(w[1].estado, 'feito'); // ter: ad-hoc session only
  assert.equal(w[2].estado, 'feito'); // qua (today): A done
  assert.equal(w[3].estado, 'vazio');
  assert.equal(w[4].estado, 'planejado'); // sex: B in the future
  assert.equal(w[4].planejados[0].origem, 'habito');
  assert.equal(w[4].planejados.length, 2); // B (habit) + C (dated)
  assert.equal(w[5].estado, 'vazio'); // sáb
  const sexta = P.semanaDoPlano({ templates, habitos, sessoes, hoje: new Date('2026-11-20T12:00:00'), comecoDaSemana: 1 });
  assert.equal(sexta[4].planejados.length, 2);
  assert.equal(sexta[4].planejados.find((p) => p.templateId === 'tC').origem, 'data');
  const perdido = P.semanaDoPlano({ templates, habitos: [habito('tB', [1])], sessoes: [], hoje, comecoDaSemana: 1 });
  assert.equal(perdido[0].estado, 'perdido');
  assert.equal(w[0].feitos[0].minutos, 45);
});

test('semana: hábito sob rotação e de outro módulo não entram; sessão em outro template no dia passado é perdido', () => {
  const rot = { ...habito('tA', [0, 1, 2, 3, 4, 5, 6]), controlledBySequenceId: 'seq' };
  const outro = { ...habito('tA', [0, 1, 2, 3, 4, 5, 6]), sourceModule: undefined };
  assert.ok(P.semanaDoPlano({ templates: templates.slice(0, 2), habitos: [rot, outro], sessoes: [], hoje, comecoDaSemana: 1 }).every((d) => d.estado === 'vazio'));
  const w = P.semanaDoPlano({ templates, habitos: [habito('tA', [1])], sessoes: [feito('z', '2026-11-16', 'tB')], hoje, comecoDaSemana: 1 });
  assert.equal(w[0].estado, 'perdido');
});

test('resumo: aderência e minutos', () => {
  const habitos = [habito('tA', [1, 3]), habito('tB', [1, 5])];
  const sessoes = [feito('s1', '2026-11-16', 'tA', 2700), feito('s2', '2026-11-18', 'tA'), feito('s3', '2026-11-17', 'avulso', 600)];
  const r = P.resumoDaSemana(P.semanaDoPlano({ templates: templates.slice(0, 2), habitos, sessoes, hoje, comecoDaSemana: 1 }));
  assert.equal(r.planejados, 4);
  assert.equal(r.cumpridos, 2);
  assert.equal(r.feitos, 3);
  assert.equal(r.aderenciaPercentual, 50);
  assert.equal(r.minutosAtivos, 45 + 10 + 30);
  assert.equal(P.resumoDaSemana(P.semanaDoPlano({ templates, habitos: [], sessoes: [], hoje, comecoDaSemana: 1 })).aderenciaPercentual, 0);
});
