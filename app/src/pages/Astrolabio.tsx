import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { buildGrimoireHistory } from '@/components/grimorio/history';
import { recordedHistorySeries } from '@/components/grimorio/recorded-history-series';
import { useLiveDate } from '@/components/temporal/celestial/useLiveDate';
import { ArcaneIcon, ElementIcon } from '@/components/elemental/ArcaneIcon';
import { ElementReading, RecordedDaysTable } from '@/components/astrolabio/AstrolabioReadings';
import { AppLayout } from '@/components/layout';
import { useAppStore } from '@/stores/appStore';
import { ELEMENTS, type ElementId } from '@/constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import '@/styles/elemental-design-system.css';
import '@/components/astrolabio/astrolabio.css';

const format = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
const tooltipStyle = { backgroundColor: 'rgb(var(--el-surface))', border: '1px solid rgb(var(--el-gold) / .3)', borderRadius: '12px', color: 'rgb(var(--el-text))' };

export function Astrolabio() {
  const accountId = useAppStore(state => state.currentAccountId);
  return <AppLayout><AstrolabioWorkspace key={accountId ?? 'local'} /></AppLayout>;
}

function AstrolabioWorkspace() {
  const { getElementScores, tasks, habits, actions, executionLogs, user } = useAppStore();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const elementScores = getElementScores();
  const { now } = useLiveDate();
  const entries = useMemo(() => buildGrimoireHistory({ actions, tasks, habits, logs: executionLogs }), [actions, tasks, habits, executionLogs]);
  const series = useMemo(() => recordedHistorySeries(entries, timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365, now), [entries, timeRange, now]);
  const historyData = series.days;
  const pieData = elementScores.map(score => ({ name: ELEMENTS[score.elementId].name, value: score.score, color: ELEMENTS[score.elementId].color }));
  const taskByElement = (Object.keys(ELEMENTS) as ElementId[]).map(elementId => {
    const elementTasks = tasks.filter(t => t.elementId === elementId && t.isCompleted);
    return { elementId, element: ELEMENTS[elementId].name, count: elementTasks.length, color: ELEMENTS[elementId].color };
  });
  const hasScores = pieData.some(entry => entry.value > 0);
  const maxTasks = Math.max(1, ...taskByElement.map(entry => entry.count));

  return <div className="elemental-system astrolabe-workspace">
    <header className="astrolabe-heading"><span className="astrolabe-seal" aria-hidden="true"><ArcaneIcon name="astrolabio" size={38} /></span>
      <div><h1>Astrolábio</h1><p>Observe sua constância e o equilíbrio dos elementos.</p></div>
      <Link to="/grimorio#grimoire-history">Abrir histórico<ArcaneIcon name="arquivo" size={18} /></Link>
    </header>

    <section className="astrolabe-overview" aria-labelledby="astrolabe-overview-title">
      <h2 id="astrolabe-overview-title">Seu panorama atual</h2><p>Totais atuais da sua jornada, sem filtro de período.</p>
      <dl>
        <div><dt><ArcaneIcon name="ritual" size={21} />Rituais</dt><dd>{tasks.length}<small>{tasks.filter(t => t.isCompleted).length} concluídos</small></dd></div>
        <div><dt><ArcaneIcon name="conquista" size={21} />Pontuação</dt><dd>{format(user.totalScore)}<small>pontos totais</small></dd></div>
        <div><dt><ArcaneIcon name="ciclo" size={21} />Ciclos</dt><dd>{habits.length}<small>hábitos cadastrados</small></dd></div>
        <div><dt><ElementIcon element="fogo" size={21} />Constância</dt><dd>{user.streak}<small>{user.streak === 1 ? 'dia de streak registrado' : 'dias de streak registrados'}</small></dd></div>
      </dl>
    </section>

    <Tabs defaultValue="evolution" className="astrolabe-tabs">
      <TabsList aria-label="Leituras do Astrolábio"><TabsTrigger value="evolution">Evolução</TabsTrigger><TabsTrigger value="distribution">Equilíbrio</TabsTrigger><TabsTrigger value="elements">Elementos</TabsTrigger></TabsList>
      <TabsContent value="evolution">
        <section className="astrolabe-panel" aria-labelledby="astrolabe-evolution-title">
          <div className="astrolabe-panel-heading"><div><h2 id="astrolabe-evolution-title">Seu ritmo ao longo dos dias</h2><p>Pontuação registrada por dia</p></div>
            <div className="astrolabe-period" role="group" aria-label="Período da evolução">{(['week', 'month', 'year'] as const).map(range => <button key={range} type="button" aria-pressed={timeRange === range} onClick={() => setTimeRange(range)}>{range === 'week' ? '7 dias' : range === 'month' ? '30 dias' : '365 dias'}</button>)}</div>
          </div>
          <p className="astrolabe-period-caption" aria-live="polite">{new Date(historyData[0].stamp).toLocaleDateString('pt-BR')} a {new Date(historyData[historyData.length - 1].stamp).toLocaleDateString('pt-BR')} · {series.recordedCount} registros com pontuação</p>
          {series.recordedCount > 0 ? <>
            <div className="astrolabe-chart" role="img" aria-label="Gráfico de pontuação diária. Valores completos na tabela a seguir.">
              <ResponsiveContainer width="100%" height="100%"><LineChart data={historyData} margin={{ left: -20, right: 16, top: 16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 6" stroke="rgb(var(--el-muted) / .12)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: 'rgb(var(--el-muted))', fontSize: 11 }} stroke="rgb(var(--el-muted) / .3)" minTickGap={28} />
                <YAxis tick={{ fill: 'rgb(var(--el-muted))', fontSize: 11 }} stroke="rgb(var(--el-muted) / .3)" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="linear" name="Pontos registrados" dataKey="points" stroke="rgb(var(--el-gold))" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} isAnimationActive={false} />
              </LineChart></ResponsiveContainer>
            </div><RecordedDaysTable days={historyData} />
          </> : <div className="astrolabe-empty"><ArcaneIcon name="calendario" size={38} /><h3>Seu ritmo ainda vai aparecer aqui</h3><p>Não há pontuações com data registrada neste período. Consulte outro intervalo ou acompanhe suas atividades.</p><Link to="/rituais" className="elemental-action elemental-action-secondary">Ver meus Rituais</Link></div>}
          <p className="astrolabe-note">O período filtra apenas esta evolução. O gráfico usa os registros disponíveis; não reconstrói pontuações antigas ausentes.</p>
        </section>
      </TabsContent>
      <TabsContent value="distribution">
        <section className="astrolabe-panel" aria-labelledby="astrolabe-distribution-title"><h2 id="astrolabe-distribution-title">Seu equilíbrio elemental</h2><p className="astrolabe-note">Distribuição atual dos pontos. Não é uma meta nem uma distribuição histórica por período.</p>
          <div className="astrolabe-balance">
            {hasScores ? <div className="astrolabe-donut" aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={68} outerRadius={90} paddingAngle={3} dataKey="value" isAnimationActive={false}>{pieData.map(entry => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip contentStyle={tooltipStyle} /></PieChart></ResponsiveContainer></div>
              : <div className="astrolabe-balance-empty"><ArcaneIcon name="dominios" size={52} /><p>A distribuição aparece quando houver pontuação elemental.</p></div>}
            <dl className="astrolabe-legend">{elementScores.map(score => <div key={score.elementId}><dt><ElementIcon element={score.elementId} size={22} />{ELEMENTS[score.elementId].name}</dt><dd>{format(score.score)} pts <small>{score.percentage}%</small></dd></div>)}</dl>
          </div>
        </section>
      </TabsContent>
      <TabsContent value="elements"><section aria-labelledby="astrolabe-elements-title"><h2 id="astrolabe-elements-title">Conheça cada elemento</h2><p className="astrolabe-note">Abra um elemento para explorar o que ele representa e acessar suas áreas.</p><div className="astrolabe-elements">{elementScores.map(score => <ElementReading key={score.elementId} {...score} />)}</div></section></TabsContent>
    </Tabs>

    <section className="astrolabe-completions" aria-labelledby="astrolabe-completions-title"><div><h2 id="astrolabe-completions-title">Rituais concluídos por elemento</h2><p>Contagem dos Rituais atualmente marcados como concluídos, sem filtro de período.</p></div>
      <ul>{taskByElement.map(entry => <li key={entry.elementId}><ElementIcon element={entry.elementId} size={22} /><span>{entry.element}</span><strong>{entry.count}</strong><span className="astrolabe-task-meter" aria-hidden="true"><span style={{ width: `${entry.count / maxTasks * 100}%`, backgroundColor: entry.color }} /></span></li>)}</ul>
      <Link to="/rituais">Consultar Rituais<ArcaneIcon name="ritual" size={18} /></Link>
    </section>
  </div>;
}
