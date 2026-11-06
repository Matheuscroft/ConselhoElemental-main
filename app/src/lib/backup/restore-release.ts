/** Release remains closed until real-browser interruption/reload/mobile acceptance.
 * No URL, localStorage, session or environment switch can enable this release.
 * Tests replace this module, without enabling writes in the distributed app.
 */
export const RESTORE_WRITES_RELEASED = false;
