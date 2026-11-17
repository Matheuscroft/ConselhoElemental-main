import React, { useMemo } from 'react';
import { padraoDeMovimento, type ExercicioClassificavel } from '@/lib/workout/exercise-motion';
import { regioesDoExercicio, type ExercicioComMusculos } from '@/lib/workout/exercise-muscles';
import { elementoDaModalidade } from './treinos-elementos';
import { FiguraExercicio } from './FiguraExercicio';
import { padraoExiste } from './figura-padroes';
import { VideoExercisePlayer } from './VideoExercisePlayer';

export interface MidiaDoExercicioProps {
  /** Nome mostrado (o do exercício na sessão; cai no nome do cadastro). */
  title: string;
  /** Vídeo real, se existir. */
  src?: string;
  /** Imagem real, se existir. */
  poster?: string;
  /** O exercício do catálogo (ou o que se sabe dele): decide o padrão de movimento e os músculos acesos. */
  exercicio?: ExercicioClassificavel & ExercicioComMusculos;
  className?: string;
}

/**
 * A mídia de um exercício, sem inventar nada: com vídeo ou imagem reais usa o
 * player de sempre; sem eles, se o movimento tem um padrão desenhado, mostra a
 * ilustração animada com os músculos-alvo acesos (e diz que é uma ilustração do
 * padrão, não uma gravação); senão não renderiza.
 *
 * O desenho vive num cartão 16:10 com tamanho próprio (aspect-ratio e SVG
 * posicionado por inset): cabe inteiro em qualquer contêiner. O nome fica
 * abaixo do cartão e o selo no canto, nunca sobre o desenho.
 */
export const MidiaDoExercicio: React.FC<MidiaDoExercicioProps> = ({ title, src, poster, exercicio, className }) => {
  const real = Boolean(src || poster);
  const base: ExercicioClassificavel = { ...exercicio, name: exercicio?.name ?? title };
  const padrao = padraoDeMovimento(base);
  const musculos = useMemo(() => (exercicio ? regioesDoExercicio(exercicio) : []), [exercicio]);
  if (real) return <VideoExercisePlayer title={title} src={src} poster={poster} className={className} />;
  if (!padraoExiste(padrao)) return null;
  const elemento = elementoDaModalidade(base.category ?? base.modality ?? 'strength');
  return (
    <figure className={className ? `figura-midia ${className}` : 'figura-midia'}>
      <div className="figura-cartao" data-elemento={elemento}>
        <FiguraExercicio padraoId={padrao} elemento={elemento} tamanho="cheio" musculos={musculos} />
        <span className="figura-selo">Demonstração animada</span>
      </div>
      <figcaption className="figura-nome">{title}</figcaption>
    </figure>
  );
};

export default MidiaDoExercicio;
