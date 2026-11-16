import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { FitnessGlyph } from './FitnessGlyph';
import './treino-uau.css';

interface WorkoutPreviewHeroProps {
  title: string;
  /** Imagem real do treino (opcional). Sem imagem, usa a luz do elemento e o glifo. */
  heroImage?: string;
  onBack: () => void;
  /** Ação à direita do topo (ex.: editar). */
  action?: React.ReactNode;
  /** Chips do treino (duração, volume, XP previsto), dentro de uma lista. */
  children?: React.ReactNode;
}

/**
 * Herói da pré-visualização: a luz do elemento da semana, o nome do treino em
 * destaque e os números que importam antes de começar. Só apresentação.
 */
export const WorkoutPreviewHero: React.FC<WorkoutPreviewHeroProps> = ({ title, heroImage, onBack, action, children }) => (
  <div className="treino-hero">
    {heroImage && <img src={heroImage} alt="" loading="lazy" className="treino-hero-imagem" />}
    <div aria-hidden="true" className="treino-hero-luz" />
    {!heroImage && <FitnessGlyph name="mixed" size={150} className="treino-hero-glifo" />}
    <div className="treino-hero-topo">
      <button type="button" onClick={onBack} aria-label="Voltar" className="treino-voltar">
        <ArrowLeft className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
      </button>
      {action}
    </div>
    <div className="treino-hero-corpo">
      <h1 className="treino-hero-titulo treino-entra" style={{ '--i': 1 } as React.CSSProperties}>{title}</h1>
      {children && <ul className="treino-hero-meta treino-entra" style={{ '--i': 2 } as React.CSSProperties}>{children}</ul>}
    </div>
  </div>
);
