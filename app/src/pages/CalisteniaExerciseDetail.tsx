import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

// Mantém o URL legado funcionando, abrindo o detalhe do exercício dentro do WorkoutHub.
export const CalisteniaExerciseDetail: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const query = exerciseId ? `?source=calistenia&exercise=${encodeURIComponent(exerciseId)}` : '?source=calistenia';
  return <Navigate to={`/treinos${query}`} replace />;
};
