import { Component, type ReactNode } from 'react';

/**
 * The opening must never leave the screen empty. If its own code fails to load or to render (a chunk lost on
 * a bad network, an exception in the shell), this calls the same way out as Skip, once, and renders nothing,
 * so the person lands on the next step exactly as if they had skipped. The 3D inside has its own fallback
 * (the static version); this only covers the shell itself.
 */
export class AberturaSegura extends Component<{ readonly aoFalhar: () => void; readonly children: ReactNode }, { falhou: boolean }> {
  state = { falhou: false };

  static getDerivedStateFromError() { return { falhou: true }; }

  componentDidCatch(erro: unknown) {
    console.warn('[abertura] não carregou; seguindo como se tivesse pulado', erro);
    this.props.aoFalhar();
  }

  render() { return this.state.falhou ? null : this.props.children; }
}

export default AberturaSegura;
