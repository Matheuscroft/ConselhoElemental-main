/** Local archive restoration is released with confirmed replacement/local use,
 * internal safety readback, pre-bootstrap isolation, exclusive lease and journal.
 * Account transfer and reminder writes have separate, still closed releases.
 * No URL, env or preference can toggle this static release.
 */
export const RESTORE_WRITES_RELEASED = true;
