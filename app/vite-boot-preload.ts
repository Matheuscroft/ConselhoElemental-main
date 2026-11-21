import type { Plugin } from 'vite';

/**
 * While the app checks the saved session over the network, the browser is idle. This lets it download
 * (never run) the chunks the opening will need next, so they are already here when the checks end.
 * Preloading executes nothing: no store is created and no progress is read before the startup guards.
 */
const CHUNKS = ['bootstrap-app', 'mount-account-resume', 'mount-account-app'];

export function bootPreload(): Plugin {
  return {
    name: 'conselho-boot-preload',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html;
        const links = Object.values(ctx.bundle)
          .filter((item) => item.type === 'chunk' && CHUNKS.some((name) => item.fileName.includes(`/${name}-`)))
          .map((item) => `    <link rel="modulepreload" crossorigin href="/${item.fileName}">`);
        return links.length ? html.replace('</head>', `${links.join('\n')}\n  </head>`) : html;
      },
    },
  };
}
