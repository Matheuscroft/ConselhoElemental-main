/** Only an explicit in-page step selection may retain scroll. Incoming links still start normally. */
export function preserveQuestStepScroll(previousPath: string | undefined, pathname: string, state: unknown) {
  return previousPath === '/rituais' && pathname === '/rituais'
    && typeof state === 'object' && state !== null
    && 'questStepSelection' in state && state.questStepSelection === true;
}
