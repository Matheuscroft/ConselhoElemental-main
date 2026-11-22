import { lazy, Suspense, useCallback, useState } from 'react';
import { EntryWelcome } from '@/components/entry/EntryWelcome';
import { FocoInicial } from '@/components/entry/FocoInicial';
import { PesquisaInicial } from '@/components/entry/PesquisaInicial';
import { AberturaSegura } from '@/components/intro/AberturaSegura';
import {
  type FirstRunStep,
  initialFirstRunStep,
  nextFirstRunStep,
  getOpeningAreas,
  rememberAwakeningSeen,
  setOpeningAreas,
  setOpeningName,
} from '@/lib/sanctuary/first-run';
import {
  getSanctuaryCityPreference,
  setSanctuaryCityPreference,
  type SanctuaryCityId,
} from '@/lib/temporal/sanctuary-city';
import { setBirthDatePreference } from '@/lib/sanctuary/zodiac';
import './primeiro-acesso.css';

/** The awakening (the grimoire) is the heaviest part of the opening, so it loads on its own; its 3D loads later still. */
const GrimorioCena = lazy(() => import('@/components/intro/GrimorioCena'));

/**
 * The first open, in order: the awakening, four questions (name, sky, birth, focus), then the entry that
 * already existed. Someone who has seen the awakening lands straight on the
 * entry, and every auth, import and session guard behind it is untouched.
 */
export function PrimeiroAcesso() {
  const [step, setStep] = useState<FirstRunStep>(() => initialFirstRunStep());
  /** Only what was actually watched may be spoken of as having happened. */
  const [despertou, setDespertou] = useState(false);

  const avancar = useCallback((viuTudo: boolean) => {
    rememberAwakeningSeen();
    setDespertou(viuTudo);
    setStep((atual) => nextFirstRunStep(atual));
  }, []);

  const responder = useCallback(
    ({ nome, cidade, nascimento }: { nome: string; cidade: SanctuaryCityId; nascimento: string }) => {
      setOpeningName(nome);
      setSanctuaryCityPreference(cidade);
      setBirthDatePreference(nascimento || null);
      setStep('foco');
    },
    [],
  );

  if (step === 'despertar') {
    return (
      <AberturaSegura aoFalhar={() => avancar(false)}>
        <Suspense
          fallback={(
            <div className="primeiro-acesso-carregando" role="status">
              <span className="primeiro-acesso-brasa" aria-hidden="true" />
              Abrindo o santuário…
            </div>
          )}
        >
          <GrimorioCena onComplete={() => avancar(true)} onSkip={() => avancar(false)} />
        </Suspense>
      </AberturaSegura>
    );
  }

  if (step === 'foco') {
    return (
      <FocoInicial
        iniciais={getOpeningAreas()}
        despertou={despertou}
        aoConcluir={(areas) => { setOpeningAreas(areas); setStep('entrada'); }}
        aoVoltar={() => setStep('pesquisa')}
      />
    );
  }

  if (step === 'pesquisa') {
    return (
      <PesquisaInicial
        cidadeInicial={getSanctuaryCityPreference()}
        despertou={despertou}
        onConcluir={responder}
        onPular={() => setStep('entrada')}
      />
    );
  }

  return <EntryWelcome />;
}

export default PrimeiroAcesso;
