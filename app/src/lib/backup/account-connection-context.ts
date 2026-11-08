import { createContext } from 'react';
import type { LiveAccountSync } from './account-live-sync';

/** Session presentation only; no domain values, tokens or parallel store. */
export const AccountConnectionContext = createContext<LiveAccountSync | null>(null);
