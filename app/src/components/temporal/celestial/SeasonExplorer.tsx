import { useId, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Leaf, Snowflake, Sprout, Sun } from 'lucide-react';
import { SEASON_STORIES, type seasonCycle } from './season-presentation';

const ICONS = { spring: Sprout, summer: Sun, autumn: Leaf, winter: Snowflake };
const COLORS = { spring: '#a3ce9b', summer: '#d5b66f', autumn: '#f5ad83', winter: '#8bcee3' };
const period = (date: Date) => date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });

export function SeasonExplorer({ seasons }: { seasons: ReturnType<typeof seasonCycle> }) {
  const [selected, setSelected] = useState(seasons[0]?.name);
  const prefix = useId();
  return <div className="season-explorer">{seasons.map((season, index) => {
    const story = SEASON_STORIES[season.name];
    if (!story) return null;
    const tone = story.tone as keyof typeof ICONS;
    const Icon = ICONS[tone];
    const open = selected === season.name;
    const lastDay = new Date(season.end); lastDay.setDate(lastDay.getDate() - 1);
    return <section key={season.name} className={`season-panel season-${tone}`} data-open={open} style={{ '--season-accent': COLORS[tone] } as CSSProperties}>
      <button className="season-trigger" type="button" aria-expanded={open} aria-controls={`${prefix}-${tone}`} onClick={() => setSelected(season.name)}><Icon size={23} aria-hidden="true" /><span>{season.name}<small>{index === 0 ? 'Agora' : 'A seguir'}</small></span><ChevronDown size={18} aria-hidden="true" /></button>
      <div id={`${prefix}-${tone}`} hidden={!open} className="season-content">
        <div className="season-landscape" aria-hidden="true"><span className="season-sun" /><span className="season-mountain season-mountain-far" /><span className="season-mountain" /><Icon size={58} strokeWidth={1} /></div>
        <p className="season-period">{period(season.start)} — {period(lastDay)}</p><h4>{story.title}</h4><p>{story.description}</p><p className="season-prompt">{story.prompt}</p>
        <Link to="/jornadas">Explorar suas jornadas<ArrowRight size={16} /></Link>
      </div>
    </section>;
  })}</div>;
}
