import { ArcaneIcon, ElementIcon } from '@/components/elemental/ArcaneIcon';
import type { ElementId } from '@/types';
import './entry.css';

export function EntryBrand() {
  return <a className="entry-brand" href="/?progresso=inicio" aria-label="Conselho Elemental — início">
    <ArcaneIcon name="santuario" size={34} />
    <span>Conselho<span>Elemental</span></span>
  </a>;
}

/** Existing artwork; a quiet introduction, with no artificial progress or animation loop. */
export function EntryArtwork({ welcome = false }: { welcome?: boolean }) {
  const elements: ElementId[] = ['terra', 'fogo', 'agua', 'ar'];
  return <aside className={`entry-artwork ${welcome ? 'entry-artwork-welcome' : ''}`} aria-label="Os quatro elementos da sua jornada">
    <div className="entry-portrait" aria-hidden="true">
      <div className="entry-halo" />
      <img className="entry-character" src="/sanctuary/elemental-body-v1.png" alt="" loading={welcome ? 'eager' : 'lazy'} width={296} height={420} />
      {elements.map(element => <img className={`entry-orb entry-orb-${element}`} key={element} src={`/sanctuary/elements/${element}-v1.webp`} alt="" loading={welcome ? 'eager' : 'lazy'} width={88} height={88} />)}
    </div>
    <dl className="entry-elements">
      {elements.map((element, index) => <div key={element} style={{ color: `var(--element-${element})` }}>
        <dt><ElementIcon element={element} size={20} />{['Terra', 'Fogo', 'Água', 'Ar'][index]}</dt>
        <dd>{['Sua base', 'Sua iniciativa', 'Suas conexões', 'Seu conhecimento'][index]}</dd>
      </div>)}
    </dl>
  </aside>;
}
