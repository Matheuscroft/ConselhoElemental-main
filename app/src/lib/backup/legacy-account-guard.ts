import { ACCOUNT_TRANSFER_WRITES_RELEASED } from './account-release';
import type { AccountRpcClient } from './account-transport';

/** Installed before the first rollout. Never treat RPC/auth failure as legacy.
 * With release closed, existing non-opted-in installations remain unchanged. */
export async function assertLegacyAccountAccess(client: AccountRpcClient, userId: string): Promise<void> {
  if (!ACCOUNT_TRANSFER_WRITES_RELEASED) return;
  const identity = await client.auth.getUser();
  if (identity.error || identity.data.user?.id !== userId) throw new Error('Valide novamente a conta antes de carregar o progresso.');
  const response = await client.rpc('progress_account_read',{p_expected_user_id:userId});
  if (response.error || !response.data || typeof response.data !== 'object') throw new Error('Não foi possível conferir o formato da conta. O carregamento parcial foi pausado.');
  const value = response.data as Record<string,unknown>;
  if (value.userId !== userId) throw new Error('A conta de destino mudou.');
  if (value.kind === 'snapshot') throw new Error('Esta conta usa progresso integral. Abra a conferência de conta no Grimório; o carregamento parcial foi bloqueado.');
  if (!((value.kind === 'empty' && value.complete === true && value.revision === 'empty' && value.archive === null)
    || (value.kind === 'legacy' && value.complete === false && value.revision === 'legacy'))) throw new Error('Formato de conta desconhecido. Preserve o progresso antes de continuar.');
}
