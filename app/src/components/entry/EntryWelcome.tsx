import { ArrowRight, FileUp, LogIn } from 'lucide-react';
import { EntryArtwork, EntryBrand } from './EntryVisuals';

export function EntryWelcome() {
  return <div className="entry-shell entry-welcome">
    <a className="entry-skip" href="#welcome-title">Ir para a apresentação</a>
    <div className="entry-masthead"><EntryBrand /><a className="entry-top-link" href="/auth">Entrar <LogIn size={16} aria-hidden="true" /></a></div>
    <main className="entry-layout" aria-labelledby="welcome-title">
      <EntryArtwork welcome />
      <div className="entry-welcome-copy">
        <h1 id="welcome-title">Seu cotidiano.<br />Uma nova jornada.</h1>
        <p>Organize hábitos, conclua tarefas e acompanhe a evolução do seu personagem. Um passo de cada vez.</p>
        <div className="entry-welcome-actions">
          <a className="entry-primary" href="/auth?modo=cadastro">Criar minha conta <ArrowRight size={20} aria-hidden="true" /></a>
          <a className="entry-secondary" href="/auth">Já tenho conta</a>
        </div>
        <a className="entry-guest" href="/santuario">Experimentar sem conta</a>
        <small>Ao experimentar, o progresso fica neste aparelho. Você pode conectar uma conta depois.</small>
        <div className="entry-import"><FileUp size={19} aria-hidden="true" /><a href="/?progresso=restaurar">Já uso o app. Quero trazer meu progresso.</a></div>
      </div>
    </main>
    <footer className="entry-footer"><a href="/onboarding">Conhecer os quatro elementos</a></footer>
  </div>;
}
