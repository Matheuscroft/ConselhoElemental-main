/** Access can be reviewed before progress transfer is released.
 * Only the isolated Auth forms use this gate. It grants no progress writes,
 * legacy session adoption, account binding or automatic synchronization.
 * No URL, environment or storage override.
 */
export const ACCOUNT_ACCESS_RELEASED = true;
