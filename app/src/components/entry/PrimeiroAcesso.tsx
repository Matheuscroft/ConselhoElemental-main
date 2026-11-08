import { lazy, Suspense, useCallback, useState } from 'react';
import { EntryWelcome } from '@/components/entry/EntryWelcome';
import { PesquisaInicial } from '@/components/entry/PesquisaInicial';
import {
  type FirstRunStep,
  initialFirstRunStep,
  nextFirstRunStep,
  rememberAwakeningSeen,
  setOpeningName,
} from '@/lib/sanctuary/first-run';
import {
  getSanctuaryCityPreference,
  setSanctuaryCityPreference,
  type SanctuaryCityId,
} from '@/lib/temporal/sanctuary-city';
import './primeiro-acesso.css';

/** The awakening is the heaviest part of the opening, so it loads on its own. */
const DespertarCena = lazy(() => import('@/components/sanctuary/DespertarCena'));

/**
 * The first open, in order: the awakening, two questions, then the entry that
 * already existed. Someone who has seen the awakening lands straight on the
 * entry, and every auth, import and session guard behind it is untouched.
 */
export function PrimeiroAcesso() {
  const [step, setStep] = useState<FirstRunStep>(() => initialFirstRunStep());

  const avancar = useCallback(() => {
    rememberAwakeningSeen();
    setStep((atual) => nextFirstRunStep(atual));
  }, []);

  const responder = useCallback(
    ({ nome, cidade }: { nome: string; cidade: SanctuaryCityId }) => {
      setOpeningName(nome);
      setSanctuaryCityPreference(cidade);
      setStep('entrada');
    },
    [],
  );

  if (step === 'despertar') {
    return (
      <Suspense fallback={<div className="primeiro-acesso-carregando" role="status">Abrindo o santuário…</div>}>
        <DespertarCena onComplete={avancar} onSkip={avancar} />
      </Suspense>
    );
  }

  if (step === 'pesquisa') {
    return (
      <PesquisaInicial
        cidadeInicial={getSanctuaryCityPreference()}
        onConcluir={responder}
        onPular={() => setStep('entrada')}
      />
    );
  }

  return <EntryWelcome />;
}

export default PrimeiroAcesso;
