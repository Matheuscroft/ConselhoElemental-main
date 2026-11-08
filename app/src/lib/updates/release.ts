/** A deployment is updateable only through the same origin; no redirect comes
 * from release metadata. Ignore offline errors and older/invalid deployments. */
export function newerRelease(current: string, candidate: unknown): string | null {
  if (!candidate || typeof candidate !== 'object') return null;
  const value = candidate as Record<string, unknown>;
  if (value.format !== 'conselho-release' || typeof value.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(value.version)) return null;
  const before = current.split('.').map(Number), after = value.version.split('.').map(Number);
  for (let i = 0; i < 3; i++) { if (after[i] > before[i]) return value.version; if (after[i] < before[i]) return null; }
  return null;
}
