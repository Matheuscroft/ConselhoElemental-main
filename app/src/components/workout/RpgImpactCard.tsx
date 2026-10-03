import React from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import type { WorkoutImpactPreview } from '@/stores/workoutStore';
import type { WorkoutResourceSnapshot } from '@/types/workout';

interface RpgImpactCardProps {
  preview?: WorkoutImpactPreview;
  resourceSnapshot: WorkoutResourceSnapshot;
}

export const RpgImpactCard: React.FC<RpgImpactCardProps> = ({ preview, resourceSnapshot }) => {
  return (
    <GlassCard className="p-4">
      <h3 className="font-mystic text-sm mb-3">Impacto Arcano (potencial)</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-lg font-mono text-mystic-gold">{Math.round(preview?.earthPoints ?? 0)}</p>
          <p className="text-[10px] text-white/45">Terra (potencial)</p>
        </div>
        <div>
          <p className="text-lg font-mono text-emerald-300">+{Math.round(preview?.strengthGain ?? 0)}</p>
          <p className="text-[10px] text-white/45">Força (potencial)</p>
        </div>
        <div>
          <p className="text-lg font-mono text-amber-300">{Math.round(preview?.staminaCost ?? 0)}</p>
          <p className="text-[10px] text-white/45">Custo de Stamina</p>
        </div>
        <div>
          <p className="text-lg font-mono text-mystic-cyan">{Math.round(preview?.pranaCost ?? 0)}</p>
          <p className="text-[10px] text-white/45">Custo de Prana</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10 text-[11px] text-white/50">
        <span>Prana disponível: {resourceSnapshot.currentPrana}/{resourceSnapshot.basePrana}</span>
        <span>Stamina disponível: {resourceSnapshot.currentStamina}/{resourceSnapshot.baseStamina}</span>
      </div>
      <p className="text-[10px] text-white/35 mt-2">Valores potenciais — confirmados apenas ao finalizar o treino.</p>
    </GlassCard>
  );
};
