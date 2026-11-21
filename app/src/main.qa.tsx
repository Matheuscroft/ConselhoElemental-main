/**
 * An entry for looking at screens while sign-in is being worked on. It is not
 * part of the app: the dev server serves it in place of main.tsx only when
 * app/.env.local asks for it (see vite.config.ts), and a production build
 * never reaches this file because it is not imported by anything.
 *
 * main.tsx is left alone on purpose. It guards the account startup and the
 * startup tests pin the modules it may load, so the way past it lives
 * beside it, not inside it.
 *
 * It mounts the local app exactly as it ran before sign-in was required. It
 * creates no session and reads no credentials.
 */
import './index.css'
import './styles/elemental-fundacao.css'
import './styles/elemental-blocos.css'
import { mountApp } from './bootstrap-app'

if (import.meta.env.DEV !== true) {
  throw new Error('main.qa.tsx só roda no servidor de desenvolvimento.')
}

// Same as main.tsx: the dark class turns on the design system's tokens.
document.documentElement.classList.add('dark')
const root = document.getElementById('root')
if (!root) throw new Error('Elemento #root ausente.')
mountApp(root)

import { useAppStore } from './stores/appStore'
;(window as unknown as { __store: typeof useAppStore }).__store = useAppStore
