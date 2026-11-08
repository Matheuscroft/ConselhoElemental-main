/** Public browser configuration only. Fail a hosted build rather than ship an
 * account screen whose SDK cannot connect. No values appear in error messages. */
export function assertAccountBuildConfig(env: Record<string, string | undefined>, hosted: boolean) {
  if (!hosted) return;
  let url: URL;
  try { url = new URL(env.VITE_SUPABASE_URL ?? ''); } catch { throw new Error('Configure a URL pública do Supabase no build da Vercel.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error('A URL pública do Supabase precisa de revisão.');
  const key = env.VITE_SUPABASE_ANON_KEY ?? '';
  let publicKey = key.startsWith('sb_publishable_') && key.length >= 24;
  if (!publicKey && key.split('.').length === 3) {
    try { publicKey = JSON.parse(atob(key.split('.')[1].replaceAll('-', '+').replaceAll('_', '/'))).role === 'anon'; } catch { publicKey = false; }
  }
  if (!publicKey) throw new Error('Configure somente a chave publicável do Supabase no build. Chaves privadas não são aceitas.');
  if (env.VITE_ENABLE_SUPABASE_AUTH !== 'false' || env.VITE_FORCE_BOOTSTRAP_CLOUD_SYNC !== 'false') throw new Error('A conta integral exige que o bootstrap e o escritor de progresso legados permaneçam desativados.');
}
