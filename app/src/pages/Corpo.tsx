import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Dumbbell,
  Droplet,
  Droplets,
  HeartPulse,
  Moon,
  Percent,
  Plus,
  Ruler,
  Scale,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { AppLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { BODY_MEASUREMENT_FIELDS, BodyMeasurementDialog } from '@/components/workout';
import { useWorkoutStore } from '@/stores/workoutStore';
import { formatWorkoutDateTime } from '@/lib/workout';
import type { BodyMeasurementInput } from '@/types/workout';

const FIELD_ICONS: Partial<Record<keyof BodyMeasurementInput, LucideIcon>> = {
  heightCm: Ruler,
  weightKg: Scale,
  waterPercent: Droplet,
  bodyFatPercent: Percent,
  muscleMassKg: Dumbbell,
  waistCm: Ruler,
  chestCm: Ruler,
  armCm: Ruler,
  thighCm: Ruler,
};

const COMING_SOON = [
  { key: 'sleep', label: 'Sono', icon: Moon },
  { key: 'heart', label: 'Frequência cardíaca', icon: HeartPulse },
  { key: 'hydration', label: 'Hidratação', icon: Droplets },
];

const AXIS_TICK_STYLE = { fill: 'rgba(255,255,255,0.55)', fontSize: 11 };
const GRID_STROKE = 'rgba(255,255,255,0.08)';

const weightChartConfig: ChartConfig = {
  weightKg: { label: 'Peso (kg)', color: '#00D9FF' },
};

export const Corpo: React.FC = () => {
  const navigate = useNavigate();
  const { getLatestBodyMeasurement, getBodyMeasurementHistory, deleteBodyMeasurement } = useWorkoutStore();
  const [dialogOpen, setDialogOpen] = useState(false);

  const latest = getLatestBodyMeasurement();
  const history = getBodyMeasurementHistory();
  const visibleFields = latest ? BODY_MEASUREMENT_FIELDS.filter((field) => typeof latest[field.key] === 'number') : [];

  const weightTrend = useMemo(
    () =>
      history
        .filter((measurement) => measurement.weightKg != null)
        .map((measurement) => ({
          label: new Date(measurement.measuredAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          weightKg: measurement.weightKg as number,
        })),
    [history]
  );

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="border-white/20" aria-label="Voltar para Treinos" onClick={() => navigate('/treinos')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="font-mystic text-xl">Corpo</h2>
            <p className="text-sm text-white/50">Acompanhamento corporal</p>
          </div>
        </div>
        <Button className="bg-mystic-arcane hover:bg-mystic-arcane/80" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
          Registrar
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <GlassCard className="p-4">
          <h3 className="font-mystic text-sm mb-3">Última avaliação</h3>
          {latest ? (
            <>
              <p className="text-[11px] text-white/45 mb-3">{formatWorkoutDateTime(latest.measuredAt)}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {visibleFields.map((field) => {
                  const Icon = FIELD_ICONS[field.key] ?? Ruler;
                  return (
                    <div key={field.key} className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-mystic-arcane/15 border border-mystic-arcane/30 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-mystic-arcane" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-mono text-white truncate">
                          {latest[field.key]}
                          <span className="text-[10px] text-white/40 ml-0.5">{field.unit}</span>
                        </p>
                        <p className="text-[10px] text-white/45 truncate">{field.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-xs text-white/50">
              Nenhuma avaliação registrada ainda. Registre a primeira para começar a acompanhar sua evolução.
            </p>
          )}
        </GlassCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-4">
        <GlassCard className="p-4">
          <h3 className="font-mystic text-sm mb-3">Evolução do peso</h3>
          {weightTrend.length >= 2 ? (
            <ChartContainer config={weightChartConfig} className="h-52 w-full">
              <LineChart data={weightTrend} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={GRID_STROKE} />
                <XAxis dataKey="label" tick={AXIS_TICK_STYLE} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_TICK_STYLE} axisLine={false} tickLine={false} width={36} domain={['auto', 'auto']} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="weightKg"
                  stroke="var(--color-weightKg)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: 'var(--color-weightKg)' }}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <p className="text-xs text-white/50 py-6 text-center">
              {weightTrend.length === 0
                ? 'Nenhum registro de peso ainda.'
                : 'Registre pelo menos 2 avaliações com peso para ver a evolução.'}
            </p>
          )}
        </GlassCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4">
        <GlassCard className="p-4">
          <h3 className="font-mystic text-sm mb-3">Em breve</h3>
          <div className="grid grid-cols-3 gap-3">
            {COMING_SOON.map((item) => (
              <div key={item.key} className="rounded-xl border border-dashed border-white/15 p-3 text-center">
                <item.icon className="w-5 h-5 text-white/40 mx-auto mb-1.5" aria-hidden="true" />
                <p className="text-xs text-white/60">{item.label}</p>
                <p className="text-[10px] text-white/35 mt-0.5">Em breve</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-6">
        <GlassCard className="p-4">
          <h3 className="font-mystic text-sm mb-3">Histórico de avaliações</h3>
          {history.length === 0 ? (
            <p className="text-xs text-white/50">Nenhuma avaliação registrada.</p>
          ) : (
            <div className="space-y-2">
              {[...history].reverse().map((measurement) => {
                const fields = BODY_MEASUREMENT_FIELDS.filter((field) => typeof measurement[field.key] === 'number');
                return (
                  <div key={measurement.id} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-white/50">{formatWorkoutDateTime(measurement.measuredAt)}</span>
                      <button
                        type="button"
                        aria-label="Excluir avaliação"
                        onClick={() => deleteBodyMeasurement(measurement.id)}
                        className="text-white/30 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                    {fields.length > 0 && (
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {fields.map((field) => (
                          <span key={field.key} className="text-[11px] text-white/70">
                            {field.label}: <span className="font-mono text-white">{measurement[field.key]}{field.unit}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </motion.div>

      <BodyMeasurementDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </AppLayout>
  );
};
