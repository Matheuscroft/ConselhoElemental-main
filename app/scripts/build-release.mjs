import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const publicConfig = JSON.parse(readFileSync(new URL('../config/supabase-public.json', import.meta.url), 'utf8'));

// Public feature flags, not credentials. The integral account coordinator owns
// progress writes; a hosting project's old flags must not restart legacy writers.
const env = { ...process.env,
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || publicConfig.url,
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || publicConfig.publishableKey,
  VITE_ENABLE_SUPABASE_AUTH: 'false', VITE_FORCE_BOOTSTRAP_CLOUD_SYNC: 'false',
};
for (const script of ['verify:release', 'build']) {
  const result = spawnSync('npm', ['run', script], { stdio: 'inherit', env });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
