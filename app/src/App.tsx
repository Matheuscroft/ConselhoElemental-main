import { FitnessRoot } from '@/pages/fitness/FitnessRoot';
import { ActiveFitnessSession } from '@/pages/fitness/ActiveFitnessSession';
import { WorkoutPreview } from '@/pages/fitness/WorkoutPreview';
import { ActiveWorkout } from '@/pages/fitness/ActiveWorkout';
import { WorkoutSummary } from '@/pages/fitness/WorkoutSummary';
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/sonner';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { isSupabaseAuthEnabled } from '@/lib/supabase';
import { Onboarding } from '@/pages/Onboarding';
import {
  Santuario,
  Auth,
  Rituais,
  Invocar,
  Grimorio,
  Astrolabio,
  Lua,
  Estacoes,
  Ciclos,
  Jornadas,
  GrandesObras,
  Forja,
  Pilares,
  Dominios,
  DominioDetalhe,
  YogaPoseDetail,
  CalisteniaExerciseDetail,
  CassinoArcano,
  Mapa,
  TemporalWeekPage,
  TemporalMonthPage,
  TemporalYearPage,
  TemporalCalendarPage,
} from '@/pages';
import './App.css';
import { ScrollToTop } from '@/components/layout/ScrollToTop';

function ProtectedRoute() {
  const location = useLocation();
  const { isInitialized, user } = useAuthStore();
  const onboarding = useAppStore((state) => state.onboarding);
  const hasDomainData = useAppStore(
    (state) =>
      state.tasks.length +
      state.habits.length +
      state.projects.length +
      state.quests.length +
      state.drafts.length +
      state.cycleSequences.length >
      0
  );

  if (!isSupabaseAuthEnabled) {
    return <Outlet />;
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-transparent text-white grid place-items-center">
        <p className="text-white/70">Preparando sessao...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  const shouldShowOnboarding = !onboarding.isComplete && !hasDomainData;
  if (shouldShowOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (!shouldShowOnboarding && location.pathname === '/onboarding') {
    return <Navigate to="/santuario" replace />;
  }

  return <Outlet />;
}

function PublicAuthRoute() {
  const location = useLocation();
  const { isInitialized, user } = useAuthStore();

  if (!isSupabaseAuthEnabled) {
    return <Navigate to="/santuario" replace />;
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-transparent text-white grid place-items-center">
        <p className="text-white/70">Preparando sessao...</p>
      </div>
    );
  }

  if (user) {
    const from = (location.state as { from?: string } | null)?.from || '/santuario';
    return <Navigate to={from} replace />;
  }

  return <Auth />;
}

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes>
          {/* Redirect root to Santuário */}
          <Route path="/" element={<Navigate to="/santuario" replace />} />

          {/* Auth */}
          <Route path="/auth" element={<PublicAuthRoute />} />
          
          {/* Main Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/santuario" element={<Santuario />} />
            <Route path="/rituais" element={<Rituais />} />
            <Route path="/ciclos" element={<Ciclos />} />
            <Route path="/jornadas" element={<Jornadas />} />
            <Route path="/grandes-obras" element={<GrandesObras />} />
            <Route path="/forja" element={<Forja />} />
            <Route path="/invocar" element={<Invocar />} />
            <Route path="/grimorio" element={<Grimorio />} />
            <Route path="/astrolabio" element={<Astrolabio />} />
            <Route path="/lua" element={<Lua />} />
            <Route path="/estacoes" element={<Estacoes />} />
            <Route path="/temporal" element={<Navigate to="/temporal/semana" replace />} />
            <Route path="/temporal/semana" element={<TemporalWeekPage />} />
            <Route path="/temporal/mes" element={<TemporalMonthPage />} />
            <Route path="/temporal/ano" element={<TemporalYearPage />} />
            <Route path="/temporal/calendario" element={<TemporalCalendarPage />} />
            <Route path="/pilares" element={<Pilares />} />
            <Route path="/treinos" element={<FitnessRoot />} />
            <Route path="/treinos/legado" element={<FitnessRoot />} />
            <Route path="/fitness" element={<FitnessRoot />} />
            <Route path="/fitness/ativo/:sessionId" element={<ActiveFitnessSession />} />
            <Route path="/treinos/painel" element={<Navigate to="/treinos?tab=health" replace />} />
            <Route path="/treinos/plano/:workoutId" element={<WorkoutPreview />} />
            <Route path="/treinos/preview/:workoutId" element={<WorkoutPreview />} />
            <Route path="/treinos/historico" element={<Navigate to="/treinos?tab=history" replace />} />
            <Route path="/treinos/semana" element={<Navigate to="/treinos?tab=health&view=week" replace />} />
            <Route path="/treinos/insights" element={<Navigate to="/treinos?tab=health&view=insights" replace />} />
            <Route path="/mapa" element={<Mapa />} />
            <Route path="/treinos/corpo" element={<Navigate to="/treinos?tab=body" replace />} />
            <Route path="/treinos/ativo/:sessionId" element={<ActiveWorkout />} />
            <Route path="/treinos/resumo/:sessionId" element={<WorkoutSummary />} />
            <Route path="/dominios" element={<Dominios />} />
            <Route path="/dominios/yoga" element={<Navigate to="/fitness?modalidade=yoga" replace />} />
            <Route path="/dominios/yoga/:poseId" element={<YogaPoseDetail />} />
            <Route path="/dominios/calistenia" element={<Navigate to="/fitness?modalidade=calisthenics" replace />} />
            <Route path="/dominios/calistenia/:exerciseId" element={<CalisteniaExerciseDetail />} />
            <Route path="/dominios/:areaId" element={<DominioDetalhe />} />
            {/* Fase 4: Cassino Arcano — navegação ativa, lógica na Fase 5 */}
            <Route path="/cassino-arcano" element={<CassinoArcano />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/santuario" replace />} />
        </Routes>
      </AnimatePresence>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#1A1025',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white',
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
