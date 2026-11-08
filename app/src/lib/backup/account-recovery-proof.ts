export const RECOVERY_PROOF_KEY = 'conselho-elemental-password-recovery-v1';
const MAX_AGE = 60 * 60 * 1000;

/** A recovery callback may lose its query route at the provider. Only adopt it
 * when this browser still holds the unexpired, same-origin PKCE recovery proof. */
export function matchesPasswordRecoveryProof(raw: string | null, origin: string, projectUrl: string | undefined, now = Date.now()) {
  if (!raw || raw.length > 4096 || !projectUrl) return false;
  try {
    const page = new URL(origin), project = new URL(projectUrl);
    if (page.origin !== origin || page.username || page.password || project.username || project.password) return false;
    if ((page.protocol !== 'https:' && !(page.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(page.hostname)))
      || (project.protocol !== 'https:' && !(project.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(project.hostname)))) return false;
    const proof = JSON.parse(raw);
    if (proof?.kind !== 'password-recovery' || proof.project !== project.origin || proof.origin !== page.origin
      || typeof proof.createdAt !== 'number' || !Number.isFinite(proof.createdAt) || now < proof.createdAt || now - proof.createdAt >= MAX_AGE
      || typeof proof.verifier !== 'string' || proof.verifier.length > 2048) return false;
    const verifier = JSON.parse(proof.verifier);
    return typeof verifier === 'string' && verifier.endsWith('/PASSWORD_RECOVERY');
  } catch { return false; }
}
