import React, { useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import './treino-uau.css';

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
  const [videoFailed, setVideoFailed] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);

  const showPoster = Boolean(poster) && !posterFailed;
  if (!src && !showPoster) return null;

  const handlePlay = () => {
    setPlaying(true);
    void videoRef.current?.play().catch(() => { setPlaying(false); setVideoFailed(true); });
  };

  if (videoFailed) return <div className="treino-video-erro" role="status">Não foi possível reproduzir este vídeo. Confira o endereço na edição do treino.<button type="button" onClick={() => { setVideoFailed(false); setPlaying(false); }}>Tentar novamente</button></div>;
  return (
    <div className={cn('treino-video', className)}>
      {src ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          preload="metadata"
          playsInline
          controls={playing}
          onError={() => setVideoFailed(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          aria-label={`Vídeo: ${title}`}
          className="object-cover"
        />
      ) : (
        <img
          src={poster}
          alt={`Demonstração: ${title}`}
          loading="lazy"
          onError={() => setPosterFailed(true)}
          className="object-contain"
        />
      )}

      {src && !playing && (
        <>
          <div aria-hidden="true" className="treino-video-veu" />
          <button type="button" onClick={handlePlay} aria-label={`Reproduzir vídeo: ${title}`} className="treino-video-play">
            <Play className="ml-1 h-9 w-9 fill-current" aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
};
