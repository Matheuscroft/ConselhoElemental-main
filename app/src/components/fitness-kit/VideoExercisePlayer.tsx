import React, { useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoExercisePlayerProps {
  title: string;
  /** Vídeo real do exercício (se existir). */
  src?: string;
  /** Imagem de capa real (se existir). */
  poster?: string;
  className?: string;
}

/**
 * Mídia do exercício (16:10). Não inventa conteúdo: sem `src` e sem `poster`
 * o componente não renderiza nada, e o botão Play só aparece quando há vídeo.
 */
export const VideoExercisePlayer: React.FC<VideoExercisePlayerProps> = ({ title, src, poster, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);

  const showPoster = Boolean(poster) && !posterFailed;
  if (!src && !showPoster) return null;

  const handlePlay = () => {
    setPlaying(true);
    void videoRef.current?.play();
  };

  return (
    <div className={cn('relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-fitness-canvas shadow-fitness-card', className)}>
      {src ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          preload="metadata"
          playsInline
          controls={playing}
          onEnded={() => setPlaying(false)}
          aria-label={`Vídeo: ${title}`}
          className="h-full w-full object-cover"
        />
      ) : (
        <img
          src={poster}
          alt={`Demonstração: ${title}`}
          loading="lazy"
          onError={() => setPosterFailed(true)}
          className="h-full w-full object-contain"
        />
      )}

      {src && !playing && (
        <>
          <div aria-hidden="true" className="absolute inset-0 bg-black/35" />
          <button
            type="button"
            onClick={handlePlay}
            aria-label={`Reproduzir vídeo: ${title}`}
            className="absolute left-1/2 top-1/2 grid h-[68px] w-[68px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white backdrop-blur-md outline-none transition-transform duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-fitness-primary"
          >
            <Play className="ml-1 h-8 w-8 fill-white" aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
};
