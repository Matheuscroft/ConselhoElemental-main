/**
 * VideoExercisePlayer — exercise media player slot.
 * Renders native <video> when src is provided; falls back to a clean poster/placeholder.
 * Never fetches external videos.
 */
import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface VideoExercisePlayerProps {
  src?: string;
  poster?: string;
  title: string;
  className?: string;
}

export const VideoExercisePlayer: React.FC<VideoExercisePlayerProps> = ({
  src,
  poster,
  title,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggle = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      void videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div
      className={cn(
        'relative rounded-2xl overflow-hidden aspect-[16/10] bg-black',
        className
      )}
    >
      {src ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          preload="metadata"
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onEnded={() => setIsPlaying(false)}
          aria-label={`Vídeo demonstrativo: ${title}`}
        />
      ) : poster ? (
        <img
          src={poster}
          alt={`Demonstração: ${title}`}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        /* Fallback gradient placeholder */
        <div className="absolute inset-0 bg-gradient-to-br from-fitness-surface-muted to-fitness-surface flex items-center justify-center">
          <span className="text-fitness-muted text-sm">{title}</span>
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/35" />

      {/* Play / Pause button */}
      <button
        type="button"
        onClick={toggle}
        aria-label={isPlaying ? `Pausar ${title}` : `Reproduzir ${title}`}
        className="absolute inset-0 flex items-center justify-center focus-visible:outline-none"
      >
        <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm transition-transform hover:scale-105 active:scale-95">
          {isPlaying ? (
            /* Pause icon */
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            /* Play icon (offset by 2px for optical centering) */
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden="true" style={{ marginLeft: 3 }}>
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </div>
      </button>
    </div>
  );
};
