import { Flame, Heart, Sparkles, Zap } from 'lucide-react';
import { Contagem } from '@/components/motion/Contagem';
import { Conjurar } from '@/components/motion/Conjurar';
import { hpDoDia } from '@/lib/recursos/vitalidade';
import { useAppStore } from '@/stores/appStore';
import { useWorkoutStore } from '@/stores/workoutStore';

/**
 * The resources, kept on screen wherever you are.
 *
 * They used to live only on the Sanctuary, which meant that everywhere else
 * in the app they simply did not exist — and a resource you cannot see while
 * you spend it is not a resource, it is a number on another page.
 *
 * Every figure counts to its new value rather than swapping, so a change
 * made on one screen is visible from whichever screen you are on.
 */
export function HudRecursos() {
  const { getLevelProgress, getStreak, getCompletedHabitsToday } = useAppStore();
  const { getResourceSnapshot } = useWorkoutStore();

  const nivel = getLevelProgress();
  const recursos = getResourceSnapshot();
  const ofensiva = getStreak();
  const hp = hpDoDia({ habitosHoje: getCompletedHabitsToday(), ofensiva });
  const xpNoNivel = nivel.xpTotal - nivel.xpAtLevelStart;
  const porcento = Math.max(0, Math.min(100, Math.round(nivel.progressFraction * 100)));

  return (
    <div className="hud-recursos" role="group" aria-label="Seus recursos">
      {/* The level is the one figure allowed to pop: it is the earned one. */}
      <Conjurar marca={nivel.level} className="hud-nivel">
        <span className="hud-selo" aria-hidden="true">{nivel.level}</span>
      </Conjurar>

      <div className="hud-xp">
        <div
          className="hud-xp-trilho"
          role="progressbar"
          aria-label="Progresso para o próximo nível"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={porcento}
        >
          <span style={{ inlineSize: `${porcento}%` }} />
        </div>
        <small>
          <Contagem valor={xpNoNivel} beat="settle" /> / {nivel.xpToNextLevel} XP
        </small>
      </div>

      <ul className="hud-marcas">
        <li title="Ofensiva">
          <Flame size={14} aria-hidden="true" />
          <Contagem valor={ofensiva} beat="settle" />
          <span className="sr-only">dias de ofensiva</span>
        </li>
        <li title="HP">
          <Heart size={14} aria-hidden="true" />
          <Contagem valor={hp} beat="settle" />
          <span className="sr-only">de vida</span>
        </li>
        <li title="Stamina">
          <Zap size={14} aria-hidden="true" />
          <Contagem valor={Math.round(recursos.currentStamina)} beat="settle" />
          <span className="sr-only">de stamina</span>
        </li>
        <li title="Prana">
          <Sparkles size={14} aria-hidden="true" />
          <Contagem valor={Math.round(recursos.currentPrana)} beat="settle" />
          <span className="sr-only">de prana</span>
        </li>
      </ul>
    </div>
  );
}

export default HudRecursos;
