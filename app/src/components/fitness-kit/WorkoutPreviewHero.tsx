import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface WorkoutPreviewHeroProps {
  title: string;
  /** Imagem real do treino (opcional). Sem imagem, usa fundo abstrato em violeta. */
  heroImage?: string;
  onBack: () => void;
}

/** Hero violeta da pré-visualização (≈220px) com seta de voltar e título centralizado. */
export const WorkoutPreviewHero: React.FC<WorkoutPreviewHeroProps> = ({ title, heroImage, onBack }) => (
  <div className="relative h-[calc(13.75rem+env(safe-area-inset-top))] w-full overflow-hidden bg-fitness-primary-dark">
    {heroImage ? (
      <img src={heroImage} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
    ) : (
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,216,255,0.35),transparent_55%),radial-gradient(circle_at_85%_75%,rgba(11,11,12,0.55),transparent_60%)]"
      />
    )}
    <div aria-hidden="true" className="absolute inset-0 bg-fitness-primary/70 mix-blend-multiply" />
    <div className="relative grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2 px-6 pt-[calc(1.5rem+env(safe-area-inset-top))]">
      <button
        type="button"
        onClick={onBack}
        aria-label="Voltar"
        className="grid h-11 w-11 place-items-center rounded-full text-white outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
      >
        <ArrowLeft className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
      </button>
      <h1 className="break-words text-center font-sans text-[28px] font-semibold leading-tight text-white">{title}</h1>
      <span aria-hidden="true" />
    </div>
  </div>
);
