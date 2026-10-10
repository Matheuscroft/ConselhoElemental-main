import React, { Suspense, useState } from 'react';
import { WandSparkles, BookOpen, Gem, Crown, Shield, Footprints, Heart, Zap, Sparkles } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useWorkoutStore } from '@/stores/workoutStore';

const Avatar = React.lazy(() => import('@/components/3d/AuraAvatar3D'));
const slots = [
  { label: 'Cajado', Icon: WandSparkles }, { label: 'Grimório', Icon: BookOpen },
  { label: 'Amuleto', Icon: Gem }, { label: 'Chapéu', Icon: Crown },
  { label: 'Vestes', Icon: Shield }, { label: 'Botas', Icon: Footprints },
];

export function CharacterStage() {
  const { user, getCompletedHabitsToday, getStreak } = useAppStore();
  const { getResourceSnapshot } = useWorkoutStore();
  const resources = getResourceSnapshot();
  const [selected, setSelected] = useState<string | null>(null);
  const hp = Math.min(100, 70 + getCompletedHabitsToday() * 5 + (getStreak() > 0 ? 10 : 0));
  const xp = user?.experience ?? 0;
  const target = user?.experienceToNextLevel || 100;
  return (
    <section className="character-stage" aria-label="Personagem do Santuário">
      <header className="character-hud">
        <div className="character-identity"><span className="character-level">{user?.level ?? 1}</span><div className="min-w-0"><h2>{user?.name || 'Mago Iniciante'}</h2><progress aria-label="Experiência" value={Math.min(xp, target)} max={target} /><small>{xp} / {target} XP</small></div></div>
        <div className="character-energy"><Zap aria-hidden="true"/><span><small>Stamina</small><strong>{resources.currentStamina}</strong></span></div>
        <div className="character-energy prana"><Sparkles aria-hidden="true"/><span><small>Prana</small><strong>{resources.currentPrana}</strong></span></div>
      </header>
      <div className="character-arena">
        <div className="character-platform" aria-hidden="true" />
        <Suspense fallback={<div className="character-loading">Invocando personagem…</div>}><Avatar pranaLevel={resources.currentPrana} className="character-avatar" /></Suspense>
        {[0, 1].map(side => <div key={side} className={`character-slots side-${side}`}>
          {slots.slice(side * 3, side * 3 + 3).map(({ label, Icon }) => <button key={label} type="button" className="character-slot" aria-pressed={selected === label} onClick={() => setSelected(selected === label ? null : label)} aria-label={`${label}: ver espaço de equipamento`}><span className="character-slot-mark"><Icon size={12}/></span><Icon className="character-item" strokeWidth={1.5} aria-hidden="true"/><span>{label}</span></button>)}
        </div>)}
      </div>
      <div className="character-stats"><span><Heart aria-hidden="true"/> HP <strong>{hp}/100</strong></span><span><Sparkles aria-hidden="true"/> Nível <strong>{user?.level ?? 1}</strong></span></div>
      <p className="character-note" aria-live="polite">{selected ? `${selected}: espaço visual. O inventário de equipamentos ainda não está disponível.` : 'Seu personagem evolui com suas atividades. HP, Stamina e Prana são recursos do jogo.'}</p>
    </section>
  );
}
