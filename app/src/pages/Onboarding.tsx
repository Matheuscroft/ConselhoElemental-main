import { useMemo, type CSSProperties } from 'react';
import { Navigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { EntryArtwork, EntryBrand } from '@/components/entry/EntryVisuals';
import { ElementIcon } from '@/components/elemental/ArcaneIcon';
import { ELEMENTS, getAreasByElement } from '@/constants';
import type { ElementId } from '@/types';
import { useAppStore } from '@/stores/appStore';

const ELEMENT_ORDER: ElementId[] = ['terra', 'fogo', 'agua', 'ar'];
const examples = { terra: 'Corpo, saúde, casa e recursos.', fogo: 'Trabalho, iniciativa e projetos.', agua: 'Relações, emoções e cuidado.', ar: 'Estudo, ideias e conhecimento.' };

export function Onboarding() {
  const onboarding = useAppStore(state => state.onboarding);
  const hasDomainData = useAppStore(state => state.tasks.length + state.habits.length + state.projects.length + state.quests.length + state.drafts.length + state.cycleSequences.length > 0);
  const setOnboardingStep = useAppStore(state => state.setOnboardingStep);
  const selectArea = useAppStore(state => state.selectArea);
  const deselectArea = useAppStore(state => state.deselectArea);
  const completeOnboarding = useAppStore(state => state.completeOnboarding);
  const selectedAreaSet = useMemo(() => new Set(onboarding.selectedAreas), [onboarding.selectedAreas]);

  if (onboarding.isComplete || hasDomainData) return <Navigate to="/santuario" replace />;
  const toggle = (id: string) => selectedAreaSet.has(id) ? deselectArea(id) : selectArea(id);
  const choosing = onboarding.step >= 1;

  return <div className="entry-shell entry-onboarding">
    <a className="entry-skip" href="#onboarding-title">Ir para seu primeiro passo</a>
    <div className="entry-masthead"><EntryBrand /><a className="entry-top-link" href="/santuario">Fazer isso depois</a></div>
    <div className="entry-layout"><EntryArtwork />
      <main className="restore-workspace entry-main" aria-labelledby="onboarding-title">
        <ol className="entry-steps" aria-label="Apresentação do app"><li aria-current={!choosing ? 'step' : undefined}>Conhecer os elementos</li><li aria-current={choosing ? 'step' : undefined}>Escolher seu foco</li></ol>
        <header><h1 id="onboarding-title">{choosing ? 'O que você quer cuidar?' : 'Quatro elementos. Sua vida.'}</h1></header>
        <p>{choosing ? 'Escolha uma ou mais áreas para começar. Seus rituais e hábitos podem pertencer a esses caminhos.' : 'Os elementos ajudam a organizar o que faz parte do seu dia. Cada atividade pode contribuir com um deles.'}</p>
        {!choosing ? <>
          <div className="entry-element-stories">
            {ELEMENT_ORDER.map(id => <article key={id} style={{ '--onboarding-element': `var(--element-${id})` } as CSSProperties}>
              <ElementIcon element={id} size={30} /><div><h2>{ELEMENTS[id].name}</h2><p>{examples[id]}</p></div>
            </article>)}
          </div>
          <button className="entry-primary entry-next" type="button" onClick={() => setOnboardingStep(1)}>Escolher minhas áreas <ArrowRight size={18} aria-hidden="true" /></button>
        </> : <>
          <div className="entry-area-groups">
            {ELEMENT_ORDER.map((id, index) => {
              const areas = getAreasByElement(id);
              const chosen = areas.filter(area => selectedAreaSet.has(area.id)).length;
              return <details key={id} name="onboarding-areas" open={index === 0} style={{ '--onboarding-element': `var(--element-${id})` } as CSSProperties}>
                <summary><ElementIcon element={id} size={24} /><span>{ELEMENTS[id].name}</span><small>{chosen ? `${chosen} ${chosen === 1 ? 'selecionada' : 'selecionadas'}` : `${areas.length} áreas`}</small></summary>
                <div>{areas.map(area => <button key={area.id} type="button" aria-pressed={selectedAreaSet.has(area.id)} onClick={() => toggle(area.id)}><span>{area.name}</span>{selectedAreaSet.has(area.id) && <Check size={17} aria-hidden="true" />}</button>)}</div>
              </details>;
            })}
          </div>
          <p className="entry-selection-count" role="status" aria-live="polite">{selectedAreaSet.size ? `${selectedAreaSet.size} ${selectedAreaSet.size === 1 ? 'área selecionada' : 'áreas selecionadas'}` : 'Selecione ao menos uma área para continuar.'}</p>
          <div className="entry-onboarding-actions"><button className="entry-secondary" type="button" onClick={() => setOnboardingStep(0)}><ArrowLeft size={17} aria-hidden="true" />Voltar</button><button className="entry-primary" type="button" disabled={!selectedAreaSet.size} onClick={completeOnboarding}>Abrir meu Santuário <ArrowRight size={17} aria-hidden="true" /></button></div>
        </>}
      </main>
    </div>
  </div>;
}

export default Onboarding;
