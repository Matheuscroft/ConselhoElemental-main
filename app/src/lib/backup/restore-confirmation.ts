import { inspectProgressBackup } from './progress-backup';
import { progressFingerprint } from './restore-comparison';
import { prepareRestoreJournal } from './restore-journal';
import { assertWorkspaceBaseline, createWorkspaceSafetyCopy, type PreviewStorage, type WorkspaceBaseline, prepareWorkspacePreview } from './workspace-preview';

export type WorkspacePreview = Awaited<ReturnType<typeof prepareWorkspacePreview>>;
/** Readback of the saved safety file, matched to the exact current projection. */
export async function verifyPreviousSafetyCopy(text: string, baseline: WorkspaceBaseline, storage: PreviewStorage, origin: string): Promise<void> {
  if (!baseline.snapshot) throw new Error('Esta origem não possui progresso anterior para conferir.');
  const frozen = { ...baseline, pair: { ...baseline.pair } };
  const expected = progressFingerprint(baseline.snapshot);
  const { backup } = await inspectProgressBackup(text);
  if (backup.source.origin !== origin || progressFingerprint(backup) !== expected) throw new Error('A cópia anterior não corresponde ao progresso atual. Baixe e confira uma cópia atualizada.');
  assertWorkspaceBaseline(storage, frozen);
}
/** No writes; final execution revalidates under an exclusive lease. */
export async function prepareConfirmedRestore(preview: WorkspacePreview, previousCopy: string | null, storage: PreviewStorage, origin: string): Promise<string> {
  const baseline = { ...preview.baseline, pair: { ...preview.baseline.pair } }, text = preview.text;
  assertWorkspaceBaseline(storage, baseline);
  if (preview.audit.issues.length || preview.audit.truncated) throw new Error('A cópia precisa de revisão antes da restauração.');
  if (baseline.snapshot) {
    if (!previousCopy) throw new Error('Confira o arquivo salvo da cópia anterior.');
    await verifyPreviousSafetyCopy(previousCopy, baseline, storage, origin);
  } else if (previousCopy !== null) throw new Error('Esta origem não possuía progresso anterior.');
  const journal = await prepareRestoreJournal(baseline.pair, text, origin);
  assertWorkspaceBaseline(storage, baseline);
  return journal;
}

/** User-confirmed local import. Prepare/read back the current projection internally;
 * the journal retains both versions during the write. No second file picker,
 * download, Auth or domain command is required. Success intentionally replaces
 * the old destination; this is not a permanent backup retained after completion. */
export async function prepareLocalImport(preview: WorkspacePreview, storage: PreviewStorage, origin: string): Promise<{ journal: string; previousBackup: string | null }> {
  const selected = { ...preview, baseline: { ...preview.baseline, pair: { ...preview.baseline.pair } } };
  assertWorkspaceBaseline(storage, selected.baseline);
  const previousBackup = selected.baseline.snapshot ? (await createWorkspaceSafetyCopy(storage, origin)).text : null;
  const journal = await prepareConfirmedRestore(selected, previousBackup, storage, origin);
  assertWorkspaceBaseline(storage, selected.baseline);
  return { journal, previousBackup };
}
