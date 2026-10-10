import React from 'react';
import { AlertCircle, Lightbulb, ListChecks, Plus, Wind } from 'lucide-react';
import './exercise-detail.css';
import { MuscleBars } from '@/components/fitness-kit';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MuscleDistributionBars } from './MuscleDistributionBars';
import {
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  LEVEL_BADGE_CLASSES,
  LEVEL_LABELS,
  getInstructionsLabel,
} from '@/lib/workout';
import type { WorkoutExercise } from '@/types/workout';

interface ExerciseDetailSheetProps {
  variant?: 'default' | 'fitness';
  exercise: WorkoutExercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToWorkout?: (exercise: WorkoutExercise) => void;
}

export const ExerciseDetailSheet: React.FC<ExerciseDetailSheetProps> = ({
  exercise,
  variant = 'default',
  open,
  onOpenChange,
  onAddToWorkout,
}) => {
  const Icon = exercise ? CATEGORY_ICONS[exercise.category] ?? CATEGORY_ICONS.mixed : CATEGORY_ICONS.mixed;

  if (variant === 'fitness') return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="fitness-exercise-detail">
        {exercise && <>
          <header className="fitness-exercise-detail-header"><span className="fitness-exercise-symbol"><Icon size={24} aria-hidden="true" /></span><div><SheetTitle className="fitness-exercise-title">{exercise.name}</SheetTitle><p>{CATEGORY_LABELS[exercise.category]}{exercise.family ? ` · ${exercise.family}` : ''}</p></div></header>
          <div className="fitness-exercise-detail-body">
            <p className="fitness-exercise-description">{exercise.description || exercise.focus}</p>
            <div className="fitness-exercise-tags"><span>{LEVEL_LABELS[exercise.level]}</span><span>{exercise.measureMode === 'duration' ? 'Registro por tempo' : 'Registro por repetições'}</span></div>
            <section><h3>Como executar / registrar</h3><ol>{exercise.instructions.map((instruction,index)=><li key={instruction}><span>{index+1}</span>{instruction}</li>)}</ol></section>
            {exercise.breathing && <section><h3>Respiração</h3><p>{exercise.breathing}</p></section>}
            {exercise.benefits.length > 0 && <details><summary>Benefícios</summary><ul>{exercise.benefits.map((item)=><li key={item}>{item}</li>)}</ul></details>}
            {exercise.variations.length > 0 && <details><summary>Variações</summary><ul>{exercise.variations.map((item)=><li key={item}>{item}</li>)}</ul></details>}
            {exercise.contraindications.length > 0 && <details><summary>Cuidados</summary><ul>{exercise.contraindications.map((item)=><li key={item}>{item}</li>)}</ul></details>}
            <details><summary>Perfil muscular estimado</summary><p>Referência do cadastro para distribuir o trabalho registrado. Não mede ativação muscular nem considera automaticamente a descrição livre.</p><MuscleBars distribution={exercise.muscleDistribution} emptyMessage="Sem perfil cadastrado." /></details>
            {onAddToWorkout && <Button className="fitness-exercise-add" onClick={()=>onAddToWorkout(exercise)}>Adicionar ao treino</Button>}
          </div>
        </>}
      </SheetContent>
    </Sheet>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={`bg-void border-white/10 rounded-t-3xl max-h-[88dvh] overflow-y-auto px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6`}
      >
        {exercise && (
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-full bg-mystic-arcane/15 border border-mystic-arcane/30 flex items-center justify-center shrink-0">
                <Icon className="w-7 h-7 text-mystic-arcane" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="font-mystic text-xl text-white break-words">{exercise.name}</h2>
                {exercise.nameAlternate && (
                  <p className="text-sm text-mystic-gold italic break-words">{exercise.nameAlternate}</p>
                )}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <Badge variant="outline" className="text-[10px] bg-mystic-purple/10 text-mystic-purple border-mystic-purple/40">
                    {CATEGORY_LABELS[exercise.category]}
                  </Badge>
                  <Badge variant="outline" className={`text-[10px] ${LEVEL_BADGE_CLASSES[exercise.level]}`}>
                    {LEVEL_LABELS[exercise.level]}
                  </Badge>
                  {exercise.durationLabel && (
                    <Badge variant="outline" className="text-[10px] bg-white/5 text-white/70 border-white/20">
                      {exercise.durationLabel}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {exercise.focus && (
              <p className="text-sm text-white/70">Foco: <span className="text-white">{exercise.focus}</span></p>
            )}

            {exercise.benefits.length > 0 && (
              <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-mystic-gold" aria-hidden="true" />
                  <h3 className="font-mystic text-sm">Benefícios</h3>
                </div>
                <ul className="space-y-1.5 text-sm text-white/80">
                  {exercise.benefits.map((benefit) => (
                    <li key={benefit} className="flex gap-2">
                      <span className="text-mystic-gold mt-1" aria-hidden="true">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {exercise.instructions.length > 0 && (
              <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ListChecks className="w-4 h-4 text-mystic-gold" aria-hidden="true" />
                  <h3 className="font-mystic text-sm">{getInstructionsLabel(exercise.source)}</h3>
                </div>
                <ul className="space-y-1.5 text-sm text-white/80">
                  {exercise.instructions.map((instruction) => (
                    <li key={instruction} className="flex gap-2">
                      <span className="text-mystic-gold mt-1" aria-hidden="true">•</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {exercise.breathing && (
              <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wind className="w-4 h-4 text-mystic-gold" aria-hidden="true" />
                  <h3 className="font-mystic text-sm">Respiração</h3>
                </div>
                <p className="text-sm text-white/80">{exercise.breathing}</p>
              </section>
            )}

            {exercise.contraindications.length > 0 && (
              <section className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-orange-400" aria-hidden="true" />
                  <h3 className="font-mystic text-sm text-orange-300">Contraindicações</h3>
                </div>
                <ul className="space-y-1.5 text-sm text-orange-200/80">
                  {exercise.contraindications.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-orange-400 mt-1" aria-hidden="true">⚠</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {exercise.variations.length > 0 && (
              <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <h3 className="font-mystic text-sm mb-2">Variações</h3>
                <div className="space-y-1.5">
                  {exercise.variations.map((variation, idx) => (
                    <div key={variation} className="flex gap-2 items-start text-sm">
                      <Badge variant="outline" className="text-[10px] bg-mystic-gold/20 text-mystic-gold border-mystic-gold/40 shrink-0 mt-0.5">
                        {idx + 1}
                      </Badge>
                      <span className="text-white/80">{variation}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <h3 className="font-mystic text-sm mb-3">Músculos envolvidos</h3>
              <MuscleDistributionBars distribution={exercise.muscleDistribution} emptyMessage="Sem dados musculares cadastrados." />
            </section>

            {onAddToWorkout && (
              <Button
                className="w-full bg-mystic-arcane hover:bg-mystic-arcane/80"
                onClick={() => onAddToWorkout(exercise)}
              >
                <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
                Adicionar ao treino
              </Button>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
