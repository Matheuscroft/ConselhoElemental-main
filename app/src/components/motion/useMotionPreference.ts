import { useSyncExternalStore } from 'react';

export const motionPreferenceQuery = '(prefers-reduced-motion: reduce)';
export function subscribeMotionPreference(notify: () => void) {
  const media = window.matchMedia(motionPreferenceQuery);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
}
export function readMotionPreference() {
  return typeof window !== 'undefined' && window.matchMedia(motionPreferenceQuery).matches;
}
/** Reacts to OS changes without removing textual feedback or delaying commands. */
export function useMotionPreference() {
  return useSyncExternalStore(subscribeMotionPreference, readMotionPreference, () => true);
}
