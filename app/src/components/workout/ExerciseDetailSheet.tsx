import React from 'react';
import { AlertCircle, Lightbulb, ListChecks, Plus, Wind } from 'lucide-react';
import './exercise-detail.css';
import { MuscleBars } from '@/components/fitness-kit/MuscleBars';
import { FitnessButton } from '@/components/fitness-kit/FitnessButton';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { MuscleDistributionBars } from './MuscleDistributionBars';
import {
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  LEVEL_LABELS,
  MUSCLE_LABELS,
  getInstructionsLabel,
} from '@/lib/workout/workout-labels';
import type { WorkoutExercise } from '@/types/workout';
import { STRENGTH_EQUIPMENT_LABELS } from '@/constants/strength-training-exercises';

const YogaProfileDetails: React.FC<{ exercise: WorkoutExercise; compact?: boolean }> = ({ exercise, compact = false }) => {
  const profile = exercise.yogaProfile;
  if (!profile) return null;
  const sectionClass = compact ? '' : 'rounded-2xl border border-white/10 bg-black/20 p-4';
  const categoryLabels: Record<string, string> = {
    standing: 'Em pé', seated: 'Sentada', supine: 'Deitada de costas', prone: 'De bruços',
    kneeling: 'Ajoelhada', balance: 'Equilíbrio', inversion: 'Invertida', restorative: 'Restaurativa', flow: 'Fluxo',
  };
  const energyLabels: Record<string, string> = {
    RESTORATIVE: 'Restaurativa', STRENGTH: 'Força', FLEXIBILITY: 'Flexibilidade', MOBILITY: 'Mobilidade',
  };
  const hasDetails = profile.pillars?.length || profile.jointsInvolved?.length || profile.muscleActivation?.length || profile.props?.length || profile.safetyNotes?.length || profile.sourceReferences?.length;
  if (!hasDetails) return null;

  return (
    <section className={sectionClass}>
      <h3 className={compact ? '' : 'font-mystic text-sm mb-3'}>Perfil detalhado da postura</h3>
      <div className="space-y-3 text-sm text-fitness-muted">
        <p className="text-xs text-fitness-muted">Classificação e anatomia são referências descritivas; ativações musculares são estimativas provisórias, não medições.</p>
        <div className="flex flex-wrap gap-1.5">
          {profile.poseCategory && <Badge variant="outline">{categoryLabels[profile.poseCategory] ?? profile.poseCategory}</Badge>}
          {profile.energyFocus && <Badge variant="outline">{energyLabels[profile.energyFocus] ?? profile.energyFocus}</Badge>}
          {profile.dataConfidence && <Badge variant="outline">{profile.dataConfidence === 'provisional' ? 'Dados provisórios' : 'Curadoria'}</Badge>}
        </div>
        {profile.pillars?.length ? <p><strong className="text-fitness-text">Focos:</strong> {profile.pillars.join(' · ')}</p> : null}
        {profile.jointsInvolved?.length ? <p><strong className="text-fitness-text">Articulações e regiões:</strong> {profile.jointsInvolved.join(' · ')}</p> : null}
        {profile.muscleActivation?.length ? (
          <div>
            <p className="mb-1"><strong className="text-fitness-text">Ativação estimada por região</strong></p>
            <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {profile.muscleActivation.map((item) => <li key={item.muscleGroup} className="flex justify-between gap-3"><span>{item.muscleGroup}</span><span>{item.percentage}%</span></li>)}
            </ul>
          </div>
        ) : null}
        {profile.props?.length ? <p><strong className="text-fitness-text">Apoios:</strong> {profile.props.join(' · ')}</p> : null}
        {profile.safetyNotes?.length ? <p><strong className="text-fitness-text">Observações de segurança:</strong> {profile.safetyNotes.join(' · ')}</p> : null}
        {profile.sourceReferences?.length ? <p><strong className="text-fitness-text">Referências:</strong> {profile.sourceReferences.map((source, index) => <React.Fragment key={`${source.label}-${index}`}>{index > 0 ? ' · ' : ''}{source.url ? <a className="underline underline-offset-2" href={source.url} target="_blank" rel="noreferrer">{source.label}</a> : source.label}</React.Fragment>)}</p> : null}
      </div>
    </section>
  );
};

const StrengthProfileDetails: React.FC<{ exercise: WorkoutExercise; compact?: boolean }> = ({ exercise, compact = false }) => {
  const profile = exercise.strengthProfile;
  if (!profile) return null;
  const patternLabels: Record<string, string> = {
    horizontal_push:'Empurrar horizontal',vertical_push:'Empurrar vertical',horizontal_pull:'Puxar horizontal',vertical_pull:'Puxar vertical',
    elbow_flexion:'Flexão de cotovelo',elbow_extension:'Extensão de cotovelo',squat:'Agachar',hinge:'Dobradiça de quadril',
    hip_extension:'Extensão de quadril',hip_abduction:'Abdução de quadril',hip_adduction:'Adução de quadril',
    knee_extension:'Extensão de joelho',knee_flexion:'Flexão de joelho',calf_raise:'Flexão plantar',trunk_flexion:'Flexão de tronco',
    anti_rotation:'Antirrotação',carry:'Transporte',shrug:'Elevação escapular',wrist_flexion:'Flexão de punho',wrist_extension:'Extensão de punho',isometric_hold:'Sustentação isométrica',
  };
  const areaNames = (ids: typeof exercise.primaryMuscles) => ids?.map((id) => MUSCLE_LABELS[id]).join(' · ');
  const content = <div className="space-y-3 text-sm text-fitness-muted">
    <div className="flex flex-wrap gap-1.5">
      <Badge variant="outline">{patternLabels[profile.movementPattern]}</Badge>
      <Badge variant="outline">{profile.contraction === 'isometric' ? 'Isometria · tempo' : 'Dinâmico · repetições'}</Badge>
      <Badge variant="outline">{profile.exerciseType === 'compound' ? 'Multiarticular' : 'Isolamento'}</Badge>
      <Badge variant="outline">{profile.laterality === 'unilateral' ? 'Unilateral' : profile.laterality === 'alternating' ? 'Alternado' : 'Bilateral'}</Badge>
      {profile.grip && <Badge variant="outline">Pegada: {profile.grip === 'varied' ? 'variável' : profile.grip === 'neutral' ? 'neutra' : profile.grip === 'supinated' ? 'supinada' : 'pronada'}</Badge>}
    </div>
    <p><strong className="text-fitness-text">Equipamento:</strong> {profile.equipmentIds.map((id) => STRENGTH_EQUIPMENT_LABELS[id]).join(' · ')}</p>
    {exercise.primaryMuscles?.length ? <p><strong className="text-fitness-text">Foco principal:</strong> {areaNames(exercise.primaryMuscles)}</p> : null}
    {exercise.secondaryMuscles?.length ? <p><strong className="text-fitness-text">Músculos auxiliares:</strong> {areaNames(exercise.secondaryMuscles)}</p> : null}
    <details><summary>Preparação e execução</summary><ul>{[...profile.setupNotes,...profile.executionCues].map((item,index)=><li key={`${item}-${index}`}>{item}</li>)}</ul></details>
    {profile.commonMistakes.length > 0 && <details><summary>Erros comuns a evitar</summary><ul>{profile.commonMistakes.map((item)=><li key={item}>{item}</li>)}</ul></details>}
    {profile.safetyNotes.length > 0 && <details><summary>Cuidados</summary><ul>{profile.safetyNotes.map((item)=><li key={item}>{item}</li>)}</ul></details>}
    {profile.variations.length > 0 && <details><summary>Variações e alternativas</summary><ul>{profile.variations.map((item)=><li key={item}>{item}</li>)}</ul></details>}
    {profile.sourceReferences?.length ? <p className="text-xs text-fitness-muted">Referência de nomenclatura: {profile.sourceReferences.map((source,index)=><React.Fragment key={`${source.label}-${index}`}>{index ? ' · ' : ''}<a className="underline underline-offset-2" href={source.url} target="_blank" rel="noreferrer">{source.label}</a></React.Fragment>)}</p> : null}
    <p className="text-xs text-fitness-muted">Fichas para descoberta e planejamento; ajuste cargas e execução às suas condições e orientação profissional quando necessária.</p>
  </div>;
  return compact ? <section className="mt-4 border-t border-white/10 pt-3"><h3 className="mb-3 text-sm font-semibold">Ficha de musculação</h3>{content}</section> : <section className="rounded-2xl border border-white/10 bg-black/20 p-4"><h3 className="font-mystic mb-3 text-sm">Ficha de musculação</h3>{content}</section>;
};

interface ExerciseDetailSheetProps {
  variant?: 'default' | 'fitness';
  exercise: WorkoutExercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToWorkout?: (exercise: WorkoutExercise) => void;
}

/** Same exercise and commands in every entry point; one visual sheet. */
export const ExerciseDetailSheet: React.FC<ExerciseDetailSheetProps> = ({exercise, variant = 'default', open, onOpenChange, onAddToWorkout}) => {
  if (!exercise) return null;
  const Icon = CATEGORY_ICONS[exercise.category] ?? CATEGORY_ICONS.mixed;
  const category = CATEGORY_LABELS[exercise.category] ?? 'Exercício';
  const family = exercise.family?.trim();
  const subtitle = family && family.toLocaleLowerCase('pt-BR') !== category.toLocaleLowerCase('pt-BR') ? `${category} · ${family}` : category;
  return <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="bottom" className="fitness-exercise-detail" closeLabel="Fechar ficha do exercício">
      <header className="fitness-exercise-detail-header">
        <span className="fitness-exercise-symbol"><Icon size={32} aria-hidden="true" /></span>
        <div className="min-w-0"><p className="fitness-exercise-eyebrow">{subtitle}</p><SheetTitle className="fitness-exercise-title">{exercise.name}</SheetTitle>
          {exercise.nameAlternate && <p className="fitness-exercise-alternate">{exercise.nameAlternate}</p>}
        </div>
        <SheetDescription className="sr-only">Informações e orientações de registro de {exercise.name}.</SheetDescription>
      </header>
      <div className="fitness-exercise-detail-body">
        {(exercise.description || exercise.focus) && <p className="fitness-exercise-description">{exercise.description || exercise.focus}</p>}
        {exercise.focus && exercise.description && exercise.focus !== exercise.description && <p className="fitness-exercise-focus">Foco: {exercise.focus}</p>}
        <div className="fitness-exercise-tags"><span>{LEVEL_LABELS[exercise.level]}</span><span>{exercise.measureMode === 'duration' ? 'Registro por tempo' : 'Registro por repetições'}</span>{exercise.durationLabel && <span>{exercise.durationLabel}</span>}</div>
        {exercise.instructions.length > 0 && <section className="fitness-exercise-instructions"><h3><ListChecks size={18} aria-hidden="true" />{getInstructionsLabel(exercise.source)}</h3><ol>{exercise.instructions.map((instruction,index)=><li key={`${index}-${instruction}`}><span aria-hidden="true">{index+1}</span><p>{instruction}</p></li>)}</ol></section>}
        {exercise.breathing && <section><h3><Wind size={18} aria-hidden="true" />Respiração</h3><p className="fitness-exercise-description">{exercise.breathing}</p></section>}
        {exercise.benefits.length > 0 && <details><summary><Lightbulb size={17} aria-hidden="true" />Benefícios</summary><ul>{exercise.benefits.map((item,index)=><li key={`${index}-${item}`}>{item}</li>)}</ul></details>}
        {exercise.variations.length > 0 && <details><summary>Variações</summary><ul>{exercise.variations.map((item,index)=><li key={`${index}-${item}`}>{item}</li>)}</ul></details>}
        {exercise.contraindications.length > 0 && <details className="fitness-exercise-cautions"><summary><AlertCircle size={17} aria-hidden="true" />Cuidados e contraindicações</summary><ul>{exercise.contraindications.map((item,index)=><li key={`${index}-${item}`}>{item}</li>)}</ul></details>}
        <YogaProfileDetails exercise={exercise} compact />
        <StrengthProfileDetails exercise={exercise} compact />
        {!exercise.strengthProfile && <details><summary>Perfil muscular estimado</summary><p>Referência do cadastro para distribuir o trabalho registrado. Não mede ativação muscular nem considera automaticamente a descrição livre.</p>{variant === 'fitness' ? <MuscleBars distribution={exercise.muscleDistribution} emptyMessage="Sem perfil cadastrado." /> : <MuscleDistributionBars distribution={exercise.muscleDistribution} emptyMessage="Sem dados musculares cadastrados." />}</details>}
      </div>
      {onAddToWorkout && <footer className="fitness-exercise-detail-footer"><FitnessButton size="md" className="fitness-exercise-add" onClick={()=>onAddToWorkout(exercise)}><Plus size={18} aria-hidden="true" />Adicionar ao treino</FitnessButton></footer>}
    </SheetContent>
  </Sheet>;
};
