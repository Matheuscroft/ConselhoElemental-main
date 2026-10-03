import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

// Mantém o URL legado funcionando, abrindo o detalhe do exercício dentro do WorkoutHub.
export const YogaPoseDetail: React.FC = () => {
  const { poseId } = useParams<{ poseId: string }>();
  const query = poseId ? `?source=yoga&exercise=${encodeURIComponent(poseId)}` : '?source=yoga';
  return <Navigate to={`/treinos${query}`} replace />;
};
