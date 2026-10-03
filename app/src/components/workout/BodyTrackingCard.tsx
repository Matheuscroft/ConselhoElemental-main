import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Plus } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { useWorkoutStore } from '@/stores/workoutStore';
import { formatWorkoutDateTime } from '@/lib/workout';
import { BODY_MEASUREMENT_FIELDS, BodyMeasurementDialog } from './BodyMeasurementDialog';

export const BodyTrackingCard: React.FC = () => {
  const navigate = useNavigate();
  const { getLatestBodyMeasurement } = useWorkoutStore();
  const latest = getLatestBodyMeasurement();
  const [open, setOpen] = useState(false);

  const visibleFields = latest ? BODY_MEASUREMENT_FIELDS.filter((field) => typeof latest[field.key] === 'number') : [];

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => navigate('/treinos/corpo')}
          className="flex items-center gap-1 text-left group"
          aria-label="Ver página completa de Corpo"
        >
          <div>
            <h3 className="font-mystic text-sm group-hover:text-mystic-gold transition-colors">Corpo</h3>
            {latest && <p className="text-[11px] text-white/45">{formatWorkoutDateTime(latest.measuredAt)}</p>}
          </div>
          <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-mystic-gold transition-colors shrink-0" aria-hidden="true" />
        </button>
        <Button size="sm" variant="outline" className="h-8 border-white/15 shrink-0" onClick={() => setOpen(true)}>
          <Plus className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
          Registrar avaliação
        </Button>
      </div>

      {visibleFields.length > 0 && latest ? (
        <div className="grid grid-cols-3 gap-3">
          {visibleFields.map((field) => (
            <div key={field.key}>
              <p className="text-sm font-mono text-white">
                {latest[field.key]}
                <span className="text-[10px] text-white/40 ml-0.5">{field.unit}</span>
              </p>
              <p className="text-[10px] text-white/45">{field.label}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-white/50">Nenhuma avaliação registrada.</p>
      )}

      <BodyMeasurementDialog open={open} onOpenChange={setOpen} />
    </GlassCard>
  );
};
