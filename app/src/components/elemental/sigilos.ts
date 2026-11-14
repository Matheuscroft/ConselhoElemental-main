/**
 * Sigilos arcanos: grade 24x24, area viva 20. Tudo e <path d>, sem <circle> (o circulo e dois arcos).
 * `ornamento` (moldura, cantoneiras, gemas, runas; traco 1px) e desenhado primeiro e some em size <= 16;
 * `traco` e a forma principal (unico por sigilo); `nucleo` so e preenchido no estado ativo, com brilho.
 * Comandos usados: M m L l H h V v A a Z (o teste de limites le so estes). Pontos sao 'h.01' (ponta redonda).
 */
export interface Sigilo { traco: string; nucleo?: string; ornamento?: string }

/** Circulo r8 em (12,12). */
const C8 = 'M12 4a8 8 0 1 0 0 16 8 8 0 1 0 0-16Z';
/** Aneis de calendario e tabua base da familia temporal. */
const TABUA = 'M4.5 6h15v14h-15Z M8.5 3.5v4 M15.5 3.5v4';
/** Estrela de 4 pontas centrada em (12,12). */
const ESTRELA = 'M12 7.5 13.3 10.7 16.5 12 13.3 13.3 12 16.5 10.7 13.3 7.5 12 10.7 10.7Z';
/** Cantoneiras nos 4 cantos da grade. */
const CANT = 'M3.6 3.6h.01 M20.4 3.6h.01 M20.4 20.4h.01 M3.6 20.4h.01';
/** Arco duplo: circulo r9.8 inteiro. */
const ANEL = 'M12 2.2a9.8 9.8 0 1 0 0 19.6 9.8 9.8 0 1 0 0-19.6Z';
/** Fio duplo da familia temporal. */
const FIO_TABUA = 'M4.5 10h15';

export const SIGILOS: Record<string, Sigilo> = {
  // Navegacao
  santuario: {
    traco: `${C8} ${ESTRELA}`,
    nucleo: ESTRELA,
    ornamento: `${CANT} M12 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 1 0 0-12.4Z M12 1.6h.01 M12 22.4h.01 M1.6 12h.01 M22.4 12h.01`,
  },
  // Frontao com duas linhas, capiteis, tres colunas e degrau; gema sobre o vertice.
  pilares: {
    traco: 'M3.5 9.5 12 4l8.5 5.5Z M5.5 12h13 M8 14v5 M12 14v5 M16 14v5 M4.5 21h15',
    nucleo: 'M3.5 9.5 12 4l8.5 5.5Z',
    ornamento: `${CANT} M12 1.4l.9.9-.9.9-.9-.9Z M3 23h18`,
  },
  ciclo: {
    traco: 'M12 4.5a7.5 7.5 0 1 1-7.5 7.5 M2.8 12 4.5 8.6 6.2 12Z M12 12h.01',
    nucleo: 'M2.8 12 4.5 8.6 6.2 12Z',
    ornamento: `${CANT} M12 7a5 5 0 1 1-5 5`,
  },
  explorar: {
    traco: 'M12 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6Z M12 3.3l1.2 1.2-1.2 1.2-1.2-1.2Z M12 18.3l1.2 1.2-1.2 1.2-1.2-1.2Z M3.3 12l1.2-1.2 1.2 1.2-1.2 1.2Z M18.3 12l1.2-1.2 1.2 1.2-1.2 1.2Z',
    nucleo: 'M12 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6Z',
    ornamento: `${CANT} M6.5 6.5 8 8 M17.5 6.5 16 8 M17.5 17.5 16 16 M6.5 17.5 8 16`,
  },
  conta: {
    traco: 'M12 3 19.5 7.5v9L12 21 4.5 16.5v-9Z M12 8.5a2 2 0 1 0 0 4 2 2 0 1 0 0-4Z M8.5 17a3.5 3.5 0 0 1 7 0',
    nucleo: 'M12 8.5a2 2 0 1 0 0 4 2 2 0 1 0 0-4Z',
    ornamento: `${CANT} M12 1.5h.01 M12 22.5h.01`,
  },

  // Recursos
  ofensiva: {
    traco: 'M12 3.5 18 14H6Z M6 16.5h12 M8 19h8 M10 21.5h4',
    nucleo: 'M12 3.5 18 14H6Z',
    ornamento: 'M5.5 6.5 7 8 M18.5 6.5 17 8 M2.5 12.5h.01 M21.5 12.5h.01 M12 1.5h.01',
  },
  vida: {
    traco: 'M5 5h14l-7 15Z M8.2 10.5h7.6',
    nucleo: 'M8.2 10.5h7.6L12 20Z',
    ornamento: 'M3 3h2 M19 3h2 M12 22.4h.01 M3 7.5h.01 M21 7.5h.01',
  },
  // Gema em losango com raio fechado dentro: resistencia contida, legivel a 24px.
  stamina: {
    traco: 'M12 3 20 12 12 21 4 12Z M13.5 6.8 8.6 13h3.4l-1.5 4.2 5-6.2H12Z',
    nucleo: 'M13.5 6.8 8.6 13h3.4l-1.5 4.2 5-6.2H12Z',
    ornamento: 'M12 1.2h.01 M12 22.8h.01 M1.2 12h.01 M22.8 12h.01 M6.5 5.5h.01 M17.5 5.5h.01 M6.5 18.5h.01 M17.5 18.5h.01',
  },
  // Taijitu: circulo com curva em S e dois pontos; o sopro vital em equilibrio.
  prana: {
    traco: `${C8} M12 4a4 4 0 0 1 0 8 4 4 0 0 0 0 8 M12 8h.01 M12 16h.01`,
    nucleo: 'M12 4a8 8 0 0 0 0 16 4 4 0 0 1 0-8 4 4 0 0 0 0-8Z',
    ornamento: 'M12 2.4a9.6 9.6 0 1 0 0 19.2 9.6 9.6 0 1 0 0-19.2Z M1.6 12h.01 M22.4 12h.01',
  },

  // Acoes (mais limpas: so um acento)
  // Cruz alquimica de bracos iguais, losango central e travessas nas quatro pontas.
  criar: {
    traco: 'M12 4v16 M4 12h16 M12 9.5 14.5 12 12 14.5 9.5 12Z',
    nucleo: 'M12 9.5 14.5 12 12 14.5 9.5 12Z',
    ornamento: 'M10 4h4 M10 20h4 M4 10v4 M20 10v4 M12 2h.01 M12 22h.01 M2 12h.01 M22 12h.01',
  },
  editar: {
    traco: 'M15 4.5 19.5 9 11 17.5 6.5 13Z M6.5 13 11 17.5 4.5 19.5Z M13 20.5h7',
    nucleo: 'M6.5 13 11 17.5 4.5 19.5Z',
    ornamento: 'M19 2.5v3 M17.5 4h3',
  },
  buscar: {
    traco: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 1 0 0-13Z M15.5 15.5 20.5 20.5 M10.5 7.5 11.4 9.6 13.5 10.5 11.4 11.4 10.5 13.5 9.6 11.4 7.5 10.5 9.6 9.6Z',
    nucleo: 'M10.5 7.5 11.4 9.6 13.5 10.5 11.4 11.4 10.5 13.5 9.6 11.4 7.5 10.5 9.6 9.6Z',
    ornamento: 'M10.5 5.7a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 1 0 0-9.6Z',
  },
  filtrar: {
    traco: 'M10.5 3.5v6L5.5 19.5h13l-5-10v-6 M9.5 3.5h5 M8.3 15h7.4',
    nucleo: 'M8.3 15h7.4l2.8 4.5H5.5Z',
    ornamento: 'M4 3.5h3 M17 3.5h3 M12 22h.01',
  },
  concluir: { traco: `${C8} M8.3 12.3 11 15 16 9.3`, ornamento: ANEL },
  iniciar: {
    traco: `${C8} M10 8.5 16 12 10 15.5Z`,
    nucleo: 'M10 8.5 16 12 10 15.5Z',
    ornamento: 'M12 2.2h.01 M21.8 12h.01 M12 21.8h.01 M2.2 12h.01',
  },
  pausar: {
    traco: `${C8} M10 9v6 M14 9v6`,
    ornamento: 'M4 4h.01 M20 4h.01 M4 20h.01 M20 20h.01',
  },
  contador: {
    traco: 'M6 6v12 M10 6v12 M14 6v12 M18 6v12 M3.5 15.5 20.5 8.5',
    ornamento: 'M5 3.5h14 M5 20.5h14',
  },
  calendario: {
    traco: `${TABUA} M9 13h.01 M15 13h.01 M9 17h.01 M15 17h.01`,
    ornamento: `${FIO_TABUA} M8.5 1.8h.01 M15.5 1.8h.01`,
  },
  lua: {
    traco: 'M10 4A8 8 0 1 0 20 14 7.5 7.5 0 0 1 10 4Z M17 5.5 17.6 7 19 7.5 17.6 8 17 9.5 16.4 8 15 7.5 16.4 7Z',
    nucleo: 'M17 5.5 17.6 7 19 7.5 17.6 8 17 9.5 16.4 8 15 7.5 16.4 7Z',
    ornamento: 'M4.5 6.5h.01 M20.5 11h.01 M19 19.5h.01',
  },
  estacoes: {
    traco: `${C8} M12 4v16 M4 12h16 M8 8h.01 M16 8h.01 M8 16h.01 M16 16h.01`,
    ornamento: 'M12 1.5v1.5 M12 21v1.5 M1.5 12H3 M21 12h1.5',
  },

  // Dominios
  // Haltere: 2 anilhas de cada lado, barra no meio.
  treino: {
    traco: 'M2.5 9.5h2.5v5H2.5Z M6 7h3v10H6Z M9 12h6 M15 7h3v10h-3Z M19 9.5h2.5v5H19Z',
    nucleo: 'M6 7h3v10H6Z M15 7h3v10h-3Z',
    ornamento: `${CANT} M12 3.5h.01 M12 20.5h.01`,
  },
  // Figura vitruviana: cabeca, bracos abertos, tronco, pernas, no circulo.
  corpo: {
    traco: `${C8} M12 7.2a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 1 0 0-2.6Z M7.5 11.7h9 M12 11v4 M9.5 18 12 15 14.5 18`,
    nucleo: 'M12 7.2a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 1 0 0-2.6Z',
    ornamento: `${CANT} M12 1.6h.01 M12 22.4h.01`,
  },
  grimorio: {
    traco: 'M12 6.5 4 5.5v13l8 1 8-1v-13Z M12 9 14.5 13h-5Z M12 13v6.5',
    nucleo: 'M12 9 14.5 13h-5Z',
    ornamento: `${CANT} M6.5 9h1.5 M6.5 11.5h1.5 M16 9h1.5 M16 11.5h1.5`,
  },
  ritual: {
    traco: 'M5 20.5h14 M7.5 20.5v-3h9v3 M10.5 17.5v-8h3v8 M12 3.5 13.6 7.5h-3.2Z',
    nucleo: 'M12 3.5 13.6 7.5h-3.2Z',
    ornamento: 'M8.5 4.5 7 3 M15.5 4.5 17 3 M3 22.5h18 M12 1.6h.01',
  },
  invocar: {
    traco: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 1 0 0-17Z M12 5 18.06 15.5H5.94Z M12 19 18.06 8.5H5.94Z',
    ornamento: 'M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20Z',
  },
  forja: {
    traco: 'M3.5 9.5h17l-3 3.5H14v3.5l2.5 3h-9l2.5-3V13H8Z M12 3 13.5 6.5h-3Z',
    nucleo: 'M12 3 13.5 6.5h-3Z',
    ornamento: 'M17 5h.01 M19.5 7h.01 M6 5.5h.01 M5 22h14',
  },
  dominios: {
    traco: 'M12 2.5 14.5 5 12 7.5 9.5 5Z M5.5 15l2.5 2.5-2.5 2.5-2.5-2.5Z M18.5 15l2.5 2.5-2.5 2.5-2.5-2.5Z M12 7.5v5.5l-4 3.5 M12 13l4 3.5',
    ornamento: 'M2.5 12.5h.01 M21.5 12.5h.01 M5.5 5.5h.01 M18.5 5.5h.01 M12 22h.01',
  },
  astrolabio: {
    traco: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 1 0 0-17Z M12 7a5 5 0 1 0 0 10 5 5 0 1 0 0-10Z M12 12 17.5 6.5',
    ornamento: 'M12 1.5v1.5 M12 21v1.5 M1.5 12H3 M21 12h1.5 M5.6 5.6 6.6 6.6 M18.4 5.6 17.4 6.6 M5.6 18.4 6.6 17.4 M18.4 18.4 17.4 17.4',
  },
  mapa: {
    traco: 'M6 4 8.5 8.5h-5Z M18 15.5 20.5 20h-5Z M10.5 7.5h.01 M13.5 8.5h.01 M14 11.5h.01 M11.5 13.5h.01 M14.5 15.5h.01',
    nucleo: 'M6 4 8.5 8.5h-5Z',
    ornamento: 'M2.5 2.5h19v19h-19Z',
  },
  // Dois picos com bandeira no cume mais alto.
  jornada: {
    traco: 'M3.5 20.5 9.5 11 12.5 15.5 15.5 10 20.5 20.5Z M15.5 10V4 M15.5 4 18.5 5.5 15.5 7',
    nucleo: 'M15.5 4 18.5 5.5 15.5 7Z',
    ornamento: 'M3 22.5h18 M5.5 5h.01 M9 3.5h.01',
  },
  // Zigurate de tres degraus com gema de coroa.
  obra: {
    traco: 'M3.5 20.5h17V17h-17Z M6.5 17v-3.5h11V17 M9.5 13.5V10h5v3.5 M12 2.8l1.6 2.6L12 8l-1.6-2.6Z',
    nucleo: 'M12 2.8l1.6 2.6L12 8l-1.6-2.6Z',
    ornamento: 'M7 5.5 8.5 7 M17 5.5 15.5 7 M12 1.4h.01 M3 22.5h18',
  },
  historico: {
    traco: 'M6.5 4h11L12 12Z M6.5 20h11L12 12Z',
    nucleo: 'M9 20h6l-3-4.5Z',
    ornamento: 'M5 2.5h14 M5 21.5h14',
  },
  configuracoes: {
    traco: 'M12 6.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 1 0 0-11Z M12 2.5v2 M12 19.5v2 M2.5 12h2 M19.5 12h2 M17.3 6.7 18.7 5.3 M17.3 17.3 18.7 18.7 M6.7 17.3 5.3 18.7 M6.7 6.7 5.3 5.3 M12 9.5 14.2 13.3H9.8Z',
    nucleo: 'M12 9.5 14.2 13.3H9.8Z',
    ornamento: 'M12 7.7a4.3 4.3 0 1 0 0 8.6 4.3 4.3 0 1 0 0-8.6Z',
  },
  som: {
    traco: 'M8.5 5 13.5 16h-10Z M7 19h3 M16 8.5a5 5 0 0 1 0 6 M19 6.5a8 8 0 0 1 0 10',
    nucleo: 'M8.5 5 13.5 16h-10Z',
    ornamento: 'M8.5 2.8h.01 M21.5 4.5h.01 M22 11.5h.01 M21.5 18.5h.01',
  },
  vibracao: {
    traco: 'M12 6 17 12 12 18 7 12Z M3 9.5v5 M5.5 8v8 M18.5 8v8 M21 9.5v5',
    nucleo: 'M12 6 17 12 12 18 7 12Z',
    ornamento: 'M1.5 12h.01 M22.5 12h.01 M12 2.5h.01 M12 21.5h.01',
  },
  conquista: {
    traco: 'M12 8a6 6 0 1 0 0 12 6 6 0 1 0 0-12Z M8 3.5 10 9.3 M16 3.5 14 9.3 M12 11 12.9 13.1 15 14 12.9 14.9 12 17 11.1 14.9 9 14 11.1 13.1Z',
    nucleo: 'M12 11 12.9 13.1 15 14 12.9 14.9 12 17 11.1 14.9 9 14 11.1 13.1Z',
    ornamento: 'M12 9.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 1 0 0-9Z M12 21.8h.01',
  },
  alerta: {
    traco: 'M12 5 20 19H4Z M12 10.5v3.5 M12 16.5h.01',
    ornamento: 'M12 2.3h.01 M2.5 21.5h.01 M21.5 21.5h.01',
  },

  // Elementos: mesmos triangulos de CycleSigil, agora com fio duplo interno e pontos nos vertices.
  fogo: {
    traco: 'M12 4.3 19.7 18H4.3Z',
    nucleo: 'M12 4.3 19.7 18H4.3Z',
    ornamento: 'M12 7 17.4 16.6H6.6Z M12 2.4h.01 M21.6 19.2h.01 M2.4 19.2h.01',
  },
  ar: {
    traco: 'M12 4.3 19.7 18H4.3Z M7.5 13h9',
    nucleo: 'M12 4.3 19.7 18H4.3Z',
    ornamento: 'M12 7 17.4 16.6H6.6Z M12 2.4h.01 M21.6 19.2h.01 M2.4 19.2h.01 M12 21.6h.01',
  },
  agua: {
    traco: 'M4.3 6h15.4L12 19.7Z',
    nucleo: 'M4.3 6h15.4L12 19.7Z',
    ornamento: 'M6.6 7.4h10.8L12 17Z M2.4 4.8h.01 M21.6 4.8h.01 M12 21.6h.01',
  },
  terra: {
    traco: 'M4.3 6h15.4L12 19.7Z M7.5 13h9',
    nucleo: 'M4.3 6h15.4L12 19.7Z',
    ornamento: 'M6.6 7.4h10.8L12 17Z M2.4 4.8h.01 M21.6 4.8h.01 M12 21.6h.01 M12 2.4h.01',
  },

  // Variantes de rota
  semana: { traco: `${TABUA} M7.5 14h9`, ornamento: `${FIO_TABUA} M7.5 17.5h5` },
  ano: {
    traco: `${TABUA} M8 13h.01 M12 13h.01 M16 13h.01 M8 17h.01 M12 17h.01 M16 17h.01`,
    ornamento: `${FIO_TABUA} M12 2.3h.01 M10.5 22h3`,
  },
  agenda: {
    traco: `${TABUA} M7.5 12h.01 M10 12h6.5 M7.5 16h.01 M10 16h4`,
    ornamento: `${FIO_TABUA} M3 3.5h.01 M21 3.5h.01`,
  },
  treinoSemana: {
    traco: `${TABUA} M12 11.5 14.5 14.5 12 17.5 9.5 14.5Z`,
    nucleo: 'M12 11.5 14.5 14.5 12 17.5 9.5 14.5Z',
    ornamento: `${FIO_TABUA} M4 22h16`,
  },
  painel: {
    traco: 'M4 17a8 8 0 0 1 16 0Z M12 17 16 11.5 M12 17h.01',
    nucleo: 'M4 17a8 8 0 0 1 16 0Z',
    ornamento: 'M12 6v1.5 M5.8 8.8 6.9 9.9 M18.2 8.8 17.1 9.9 M3 12.5h1.5 M19.5 12.5H21 M5 20h14',
  },
  tendencias: {
    traco: 'M4.5 4v16h15 M8 15.5 11.5 11.5 14.5 14 19 8',
    ornamento: 'M7 4.5h3 M7 7h5 M3 22h.01',
  },
  modalidades: {
    traco: 'M2.5 12 5 9.5 7.5 12 5 14.5Z M9.5 12 12 9.5 14.5 12 12 14.5Z M16.5 12 19 9.5 21.5 12 19 14.5Z M4.5 18.5h15',
    ornamento: 'M5 6.5h.01 M12 6.5h.01 M19 6.5h.01 M4.5 21.5h15',
  },
  cassino: {
    traco: 'M12 3.5 20.5 12 12 20.5 3.5 12Z M12 8.5h.01 M12 12h.01 M12 15.5h.01',
    ornamento: 'M12 1.5h.01 M12 22.5h.01 M1.5 12h.01 M22.5 12h.01',
  },
  arquivo: {
    traco: 'M4.5 5h15v4h-15Z M6 9v10.5h12V9 M10 13h4',
    ornamento: 'M3 2.5h18 M8 21.5h8',
  },
  meteoro: {
    traco: 'M16 13.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5Z M14 14 5 5 M10.5 16 5.5 11 M16 10.5 11 5.5',
    nucleo: 'M16 13.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5Z',
    ornamento: 'M19 4h.01 M21 8.5h.01 M5 20.5h.01 M2.5 17h.01',
  },
};
