/**
 * Sigilos arcanos: grade 24x24, area viva 20, traco fino. Tudo e <path d>, sem <circle>
 * (o circulo e dois arcos). `traco` e sempre desenhado; `nucleo` so e preenchido no estado ativo.
 * Comandos usados: M m L l H h V v A a Z (o teste de limites le so estes).
 */
export interface Sigilo { traco: string; nucleo?: string }

/** Circulo r8 em (12,12). */
const C8 = 'M12 4a8 8 0 1 0 0 16 8 8 0 1 0 0-16Z';
/** Aneis de calendario e tabua base da familia temporal. */
const TABUA = 'M4.5 6h15v14h-15Z M8.5 3.5v4 M15.5 3.5v4';
/** Estrela de 4 pontas centrada em (12,12). */
const ESTRELA = 'M12 7.5 13.3 10.7 16.5 12 13.3 13.3 12 16.5 10.7 13.3 7.5 12 10.7 10.7Z';

export const SIGILOS: Record<string, Sigilo> = {
  // Navegacao
  santuario: { traco: `${C8} ${ESTRELA}`, nucleo: ESTRELA },
  pilares: { traco: 'M3.5 9 12 4 20.5 9Z M8 11.5v7 M16 11.5v7 M4.5 20.5h15' },
  ciclo: { traco: 'M12 4.5a7.5 7.5 0 1 1-7.5 7.5 M2.8 12 4.5 8.6 6.2 12Z M12 12h.01', nucleo: 'M2.8 12 4.5 8.6 6.2 12Z' },
  explorar: {
    traco: 'M12 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6Z M12 3.3l1.2 1.2-1.2 1.2-1.2-1.2Z M12 18.3l1.2 1.2-1.2 1.2-1.2-1.2Z M3.3 12l1.2-1.2 1.2 1.2-1.2 1.2Z M18.3 12l1.2-1.2 1.2 1.2-1.2 1.2Z',
    nucleo: 'M12 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6Z',
  },
  conta: { traco: 'M12 3 19.5 7.5v9L12 21 4.5 16.5v-9Z M12 8.5a2 2 0 1 0 0 4 2 2 0 1 0 0-4Z M8.5 17a3.5 3.5 0 0 1 7 0', nucleo: 'M12 8.5a2 2 0 1 0 0 4 2 2 0 1 0 0-4Z' },

  // Recursos
  ofensiva: { traco: 'M12 3.5 18 14H6Z M6 16.5h12 M8 19h8 M10 21.5h4', nucleo: 'M12 3.5 18 14H6Z' },
  vida: { traco: 'M5 5h14l-7 15Z M8.2 10.5h7.6', nucleo: 'M8.2 10.5h7.6L12 20Z' },
  stamina: { traco: 'M13.5 5 8 12.5h8l-5.5 7 M7 3h10 M7 21h10' },
  prana: { traco: 'M10 13a2 2 0 0 1 4 0 4 4 0 0 1-8 0 6 6 0 0 1 12 0' },

  // Acoes
  criar: { traco: 'M12 3.5v17 M5 12h14 M9 7h6' },
  editar: { traco: 'M15 4.5 19.5 9 11 17.5 6.5 13Z M6.5 13 11 17.5 4.5 19.5Z M13 20.5h7', nucleo: 'M6.5 13 11 17.5 4.5 19.5Z' },
  buscar: {
    traco: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 1 0 0-13Z M15.5 15.5 20.5 20.5 M10.5 7.5 11.4 9.6 13.5 10.5 11.4 11.4 10.5 13.5 9.6 11.4 7.5 10.5 9.6 9.6Z',
    nucleo: 'M10.5 7.5 11.4 9.6 13.5 10.5 11.4 11.4 10.5 13.5 9.6 11.4 7.5 10.5 9.6 9.6Z',
  },
  filtrar: { traco: 'M10.5 3.5v6L5.5 19.5h13l-5-10v-6 M9.5 3.5h5 M8.3 15h7.4', nucleo: 'M8.3 15h7.4l2.8 4.5H5.5Z' },
  concluir: { traco: `${C8} M8.3 12.3 11 15 16 9.3` },
  iniciar: { traco: `${C8} M10 8.5 16 12 10 15.5Z`, nucleo: 'M10 8.5 16 12 10 15.5Z' },
  pausar: { traco: `${C8} M10 9v6 M14 9v6` },
  contador: { traco: 'M6 6v12 M10 6v12 M14 6v12 M18 6v12 M3.5 15.5 20.5 8.5' },
  calendario: { traco: `${TABUA} M9 13h.01 M15 13h.01 M9 17h.01 M15 17h.01` },
  lua: {
    traco: 'M10 4A8 8 0 1 0 20 14 7.5 7.5 0 0 1 10 4Z M17 5.5 17.6 7 19 7.5 17.6 8 17 9.5 16.4 8 15 7.5 16.4 7Z',
    nucleo: 'M17 5.5 17.6 7 19 7.5 17.6 8 17 9.5 16.4 8 15 7.5 16.4 7Z',
  },
  estacoes: { traco: `${C8} M12 4v16 M4 12h16 M8 8h.01 M16 8h.01 M8 16h.01 M16 16h.01` },

  // Dominios
  treino: { traco: 'M12 3.5 15.5 7.5 12 11.5 8.5 7.5Z M12 12.5 15.5 16.5 12 20.5 8.5 16.5Z M4 12h16' },
  corpo: { traco: `${C8} M8 9.5 12 13 16 9.5 M9 17.5 12 13 15 17.5 M12 6.3a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 1 0 0-2.4Z` },
  grimorio: { traco: 'M12 6.5 4 5.5v13l8 1 8-1v-13Z M12 9 14.5 13h-5Z M12 13v6.5', nucleo: 'M12 9 14.5 13h-5Z' },
  ritual: { traco: 'M5 20.5h14 M7.5 20.5v-3h9v3 M10.5 17.5v-8h3v8 M12 3.5 13.6 7.5h-3.2Z', nucleo: 'M12 3.5 13.6 7.5h-3.2Z' },
  invocar: { traco: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 1 0 0-17Z M12 5 18.06 15.5H5.94Z M12 19 18.06 8.5H5.94Z' },
  forja: { traco: 'M3.5 9.5h17l-3 3.5H14v3.5l2.5 3h-9l2.5-3V13H8Z M12 3 13.5 6.5h-3Z', nucleo: 'M12 3 13.5 6.5h-3Z' },
  dominios: { traco: 'M12 2.5 14.5 5 12 7.5 9.5 5Z M5.5 15l2.5 2.5-2.5 2.5-2.5-2.5Z M18.5 15l2.5 2.5-2.5 2.5-2.5-2.5Z M12 7.5v5.5l-4 3.5 M12 13l4 3.5' },
  astrolabio: { traco: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 1 0 0-17Z M12 7a5 5 0 1 0 0 10 5 5 0 1 0 0-10Z M12 12 17.5 6.5' },
  mapa: { traco: 'M6 4 8.5 8.5h-5Z M18 15.5 20.5 20h-5Z M10.5 7.5h.01 M13.5 8.5h.01 M14 11.5h.01 M11.5 13.5h.01 M14.5 15.5h.01', nucleo: 'M6 4 8.5 8.5h-5Z' },
  jornada: { traco: 'M3.5 20 12 5 20.5 20Z M9 18.5 15 16 9.5 12.5 13.5 10 12 7.5' },
  obra: { traco: 'M3.5 20.5v-4h3.5v-4h3v-4h4v4h3v4h3.5v4Z' },
  historico: { traco: 'M6.5 4h11L12 12Z M6.5 20h11L12 12Z', nucleo: 'M9 20h6l-3-4.5Z' },
  configuracoes: {
    traco: 'M12 6.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 1 0 0-11Z M12 2.5v2 M12 19.5v2 M2.5 12h2 M19.5 12h2 M17.3 6.7 18.7 5.3 M17.3 17.3 18.7 18.7 M6.7 17.3 5.3 18.7 M6.7 6.7 5.3 5.3 M12 9.5 14.2 13.3H9.8Z',
    nucleo: 'M12 9.5 14.2 13.3H9.8Z',
  },
  som: { traco: 'M8.5 5 13.5 16h-10Z M7 19h3 M16 8.5a5 5 0 0 1 0 6 M19 6.5a8 8 0 0 1 0 10', nucleo: 'M8.5 5 13.5 16h-10Z' },
  vibracao: { traco: 'M12 6 17 12 12 18 7 12Z M3 9.5v5 M5.5 8v8 M18.5 8v8 M21 9.5v5', nucleo: 'M12 6 17 12 12 18 7 12Z' },
  conquista: {
    traco: 'M12 8a6 6 0 1 0 0 12 6 6 0 1 0 0-12Z M8 3.5 10 9.3 M16 3.5 14 9.3 M12 11 12.9 13.1 15 14 12.9 14.9 12 17 11.1 14.9 9 14 11.1 13.1Z',
    nucleo: 'M12 11 12.9 13.1 15 14 12.9 14.9 12 17 11.1 14.9 9 14 11.1 13.1Z',
  },
  alerta: { traco: 'M12 5 20 19H4Z M12 10.5v3.5 M12 16.5h.01' },

  // Elementos: mesmos triangulos de CycleSigil (viewBox 14 ampliado para 24); ar e terra levam a barra.
  fogo: { traco: 'M12 4.3 19.7 18H4.3Z', nucleo: 'M12 4.3 19.7 18H4.3Z' },
  ar: { traco: 'M12 4.3 19.7 18H4.3Z M7.5 13h9', nucleo: 'M12 4.3 19.7 18H4.3Z' },
  agua: { traco: 'M4.3 6h15.4L12 19.7Z', nucleo: 'M4.3 6h15.4L12 19.7Z' },
  terra: { traco: 'M4.3 6h15.4L12 19.7Z M7.5 13h9', nucleo: 'M4.3 6h15.4L12 19.7Z' },

  // Variantes de rota
  semana: { traco: `${TABUA} M7.5 14h9` },
  ano: { traco: `${TABUA} M8 13h.01 M12 13h.01 M16 13h.01 M8 17h.01 M12 17h.01 M16 17h.01` },
  agenda: { traco: `${TABUA} M7.5 12h.01 M10 12h6.5 M7.5 16h.01 M10 16h4` },
  treinoSemana: { traco: `${TABUA} M12 11.5 14.5 14.5 12 17.5 9.5 14.5Z`, nucleo: 'M12 11.5 14.5 14.5 12 17.5 9.5 14.5Z' },
  painel: { traco: 'M4 17a8 8 0 0 1 16 0Z M12 17 16 11.5 M12 17h.01', nucleo: 'M4 17a8 8 0 0 1 16 0Z' },
  tendencias: { traco: 'M4.5 4v16h15 M8 15.5 11.5 11.5 14.5 14 19 8' },
  modalidades: { traco: 'M2.5 12 5 9.5 7.5 12 5 14.5Z M9.5 12 12 9.5 14.5 12 12 14.5Z M16.5 12 19 9.5 21.5 12 19 14.5Z M4.5 18.5h15' },
  cassino: { traco: 'M12 3.5 20.5 12 12 20.5 3.5 12Z M12 8.5h.01 M12 12h.01 M12 15.5h.01' },
  arquivo: { traco: 'M4.5 5h15v4h-15Z M6 9v10.5h12V9 M10 13h4' },
  meteoro: { traco: 'M16 13.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5Z M14 14 5 5 M10.5 16 5.5 11 M16 10.5 11 5.5', nucleo: 'M16 13.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5Z' },
};
