import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { FitnessGlyph } from './FitnessGlyph';

interface WorkoutPreviewHeroProps {
  title: string;
  /** Imagem real do treino (opcional). Sem imagem, usa fundo elemental em ouro e vidro escuro. */
  heroImage?: string;
  onBack: () => void;
}

/** Hero elemental da pré-visualização (≈220px) com seta de voltar e título centralizado. */
export const WorkoutPreviewHero: React.FC<WorkoutPreviewHeroProps> = ({ title, heroImage, onBack }) => (
  <div className="relative h-[calc(13.75rem+env(safe-area-inset-top))] w-full overflow-hidden bg-fitness-canvas">
    {heroImage ? (
      <img src={heroImage} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
    ) : (
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(213,182,111,0.14),transparent_55%),radial-gradient(circle_at_85%_75%,rgba(71,135,139,0.10),transparent_60%)]"
      />
    )}
    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-fitness-canvas via-fitness-canvas/25 to-transparent" />
    {!heroImage && <FitnessGlyph name="mixed" size={150} className="absolute -bottom-5 right-4 text-[rgb(var(--el-gold)/0.09)]" />}
    <div className="relative grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2 px-6 pt-[calc(1.5rem+env(safe-area-inset-top))]">
      <button
        type="button"
        onClick={onBack}
        aria-label="Voltar"
        className="grid h-11 w-11 place-items-center rounded-xl text-[rgb(var(--el-gold))] outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
      >
        <ArrowLeft className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
      </button>
      <h1 className="break-words text-center font-display text-[28px] font-medium leading-tight text-white">{title}</h1>
      <span aria-hidden="true" />
    </div>
  </div>
);
