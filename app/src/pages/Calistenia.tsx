import React from 'react';
import { Navigate } from 'react-router-dom';

// Calistenia agora vive dentro do WorkoutHub; mantemos a URL antiga como redirecionamento.
export const Calistenia: React.FC = () => <Navigate to="/treinos?source=calistenia" replace />;
