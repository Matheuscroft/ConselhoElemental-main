import { Check } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { ArcaneIcon, type ArcaneIconName } from '@/components/elemental/ArcaneIcon';

export const INVOCATION_TYPES = [
  { id: 'ACTION', name: 'Ritual', icon: 'ritual', description: 'Uma ação com começo e fim.', example: 'Ler um capítulo, resolver uma pendência.' },
  { id: 'HABIT', name: 'Ciclo', icon: 'ciclo', description: 'Um hábito para cultivar.', example: 'Meditar, estudar ou cuidar da casa.' },
  { id: 'QUEST', name: 'Jornada', icon: 'jornada', description: 'Uma conquista em etapas.', example: 'Aprender uma habilidade, concluir um curso.' },
  { id: 'PROJECT', name: 'Grande Obra', icon: 'obra', description: 'Um projeto que reúne conquistas.', example: 'Organizar uma mudança, construir um projeto.' },
  { id: 'DRAFT', name: 'Rascunho', icon: 'grimorio', description: 'Uma ideia para guardar e lapidar depois.', example: 'Salve sem pontuação. A decisão vem depois.' },
] as const satisfies readonly { id: string; name: string; icon: ArcaneIconName; description: string; example: string }[];

export type InvocationType = typeof INVOCATION_TYPES[number]['id'];

export function InvocationStepTitle({ children, description, focus = true }: { children: ReactNode; description: string; focus?: boolean }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (focus) heading.current?.focus({ preventScroll: true }); }, [focus]);
  return <div className="invocation-step-title"><h2 ref={heading} tabIndex={-1}>{children}</h2><p>{description}</p></div>;
}

/** Native radios provide a single selection and arrow-key navigation. No domain writes. */
export function InvocationChoices({ value, onChange }: { value: InvocationType; onChange: (value: InvocationType) => void }) {
  return <fieldset className="invocation-choices">
    <legend className="sr-only">O que deseja invocar?</legend>
    {INVOCATION_TYPES.map(choice => <label key={choice.id} className="invocation-choice" data-draft={choice.id === 'DRAFT'}>
      <input type="radio" name="invocation-type" value={choice.id} checked={value === choice.id} onChange={() => onChange(choice.id)} aria-describedby={`invocation-example-${choice.id}`} />
      <span className="invocation-choice-face">
        <span className="invocation-choice-sigil" aria-hidden="true"><ArcaneIcon name={choice.icon} size={34} /></span>
        <Check className="invocation-choice-check" size={18} aria-hidden="true" />
        <strong>{choice.name}</strong><span>{choice.description}</span>
        <small id={`invocation-example-${choice.id}`}>{choice.example}</small>
      </span>
    </label>)}
  </fieldset>;
}

export function InvocationProgress({ step }: { step: number }) {
  return <ol className="invocation-progress" aria-label="Etapas da invocação">
    {['Escolher', 'Dar forma', 'Revisar'].map((label, index) => <li key={label} aria-current={step === index + 1 ? 'step' : undefined} data-complete={step > index + 1}>
      <span aria-hidden="true">{step > index + 1 ? <Check size={16} /> : index + 1}</span>
      <strong>{label}</strong>{step > index + 1 && <span className="sr-only">Concluída</span>}
    </li>)}
  </ol>;
}
