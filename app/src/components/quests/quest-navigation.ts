/** Tasks are the default. Existing trail deep links keep their explicit destination. */
export function ritualView(params: URLSearchParams): 'lista' | 'trilhas' {
  if (params.get('view') === 'lista') return 'lista';
  return params.get('view') === 'trilhas' || !!params.get('trilha') ? 'trilhas' : 'lista';
}

/** Only an explicit in-page step selection may retain scroll. Incoming links still start normally. */
export function preserveQuestStepScroll(previousPath: string | undefined, pathname: string, state: unknown) {
  return previousPath === '/rituais' && pathname === '/rituais'
    && typeof state === 'object' && state !== null
    && 'questStepSelection' in state && state.questStepSelection === true;
}
