import React from 'react';
import { Navigate } from 'react-router-dom';

// Yoga agora vive dentro do WorkoutHub; mantemos a URL antiga como redirecionamento.
export const Yoga: React.FC = () => <Navigate to="/treinos?source=yoga" replace />;
