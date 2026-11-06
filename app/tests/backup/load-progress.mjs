import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { webcrypto } from 'node:crypto';
const bundled=await build({stdin:{contents:`export {useAppStore as core} from './src/stores/appStore'; export {useWorkoutStore as fitness} from './src/stores/workoutStore'; export * from './src/lib/backup/progress-backup'; export * from './src/lib/backup/capture-progress'; export * from './src/lib/backup/restore-comparison'; export * from './src/lib/backup/critical-progress'; export * from './src/lib/backup/workspace-preview';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',write:false,alias:{'@':`${process.cwd()}/src`},logLevel:'silent'});
export function fixture(entries=[], sharedMemory) {
  // Optional map connects independent simulated documents without a browser/profile.
  const memory=sharedMemory??new Map(entries), reads=[]; const storage={getItem:key=>{reads.push(key);return memory.get(key)??null;},setItem:(key,value)=>memory.set(key,value),removeItem:key=>memory.delete(key)};
  const mod={exports:{}};
  new Function('require','module','exports','window','localStorage','crypto',bundled.outputFiles[0].text)(createRequire(import.meta.url),mod,mod.exports,{localStorage:storage},storage,webcrypto);
  return {...mod.exports,memory,reads};
}
