import { createHandler } from './index.ts';

function assert(
  condition: unknown,
  message = 'assertion failed',
): asserts condition {
  if (!condition) throw new Error(message);
}
const envValues: Record<string, string> = {
  ASSISTANT_ENABLED: 'true',
  ASSISTANT_ALLOWED_ORIGINS: 'http://localhost:5173',
  SUPABASE_URL: 'https://auth.example.test',
  SUPABASE_ANON_KEY: 'test-public-key',
  CLOUDFLARE_ACCOUNT_ID: 'a'.repeat(32),
  CLOUDFLARE_API_TOKEN: 'test-server-token',
};
const output = (
  args: unknown = {
    title: 'Organizar materiais',
    description: 'Separar os materiais de estudo.',
  },
  name = 'suggest_draft',
) => ({
  choices: [{
    finish_reason: 'tool_calls',
    message: {
      tool_calls: [{
        type: 'function',
        function: { name, arguments: JSON.stringify(args) },
      }],
    },
  }],
});
function fixture(
  provider: () => Response | Promise<Response> = () => Response.json(output()),
  overrides: Record<string, string> = {},
) {
  const calls: { url: string; init?: RequestInit }[] = [];
  const audit: Record<string, unknown>[] = [];
  let now = 1000;
  const handler = createHandler({
    env: (name) => ({ ...envValues, ...overrides })[name],
    now: () => now,
    audit: (event) => audit.push(event),
    fetch: (async (url, init) => {
      calls.push({ url: String(url), init });
      return String(url).includes('/auth/v1/user')
        ? Response.json({ id: 'test-user', is_anonymous: false })
        : provider();
    }) as typeof fetch,
  });
  return {
    handler,
    calls,
    audit,
    advance: () => {
      now += 60_001;
    },
  };
}
function request(
  body: unknown = {
    message: 'Organizar meus materiais de estudo',
    consent: true,
  },
  headers: Record<string, string> = {},
) {
  return new Request('http://localhost/assistant-suggest', {
    method: 'POST',
    headers: {
      authorization: 'Bearer test-user-token',
      origin: 'http://localhost:5173',
      'content-type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}
Deno.test('auth/consent/config/origin fail closed before contacting provider', async () => {
  for (
    const [req, overrides, expected] of [
      [request(undefined, { authorization: '' }), {}, 401],
      [request({ message: 'test', consent: false }), {}, 400],
      [request({ message: 'test', consent: true, user_id: 'other' }), {}, 400],
      [request({ message: 'x'.repeat(2001), consent: true }), {}, 400],
      [request({ message: 'á'.repeat(9000), consent: true }), {}, 400],
      [request(undefined, { origin: 'https://other.example' }), {}, 403],
      [request(), { CLOUDFLARE_API_TOKEN: '' }, 503],
      [request(), { ASSISTANT_ENABLED: 'false' }, 503],
    ] as const
  ) {
    const f = fixture(undefined, overrides);
    assert((await f.handler(req)).status === expected);
    assert(f.calls.length === 0);
  }
});
Deno.test('only authenticated user may reach provider; auth failure/anonymous rejected', async () => {
  for (
    const authReply of [
      new Response(null, { status: 401 }),
      Response.json({ id: 'guest', is_anonymous: true }),
      Response.json({}),
    ]
  ) {
    let calls = 0;
    const handler = createHandler({
      env: (name) => envValues[name],
      now: Date.now,
      audit: () => {},
      fetch: (async () => {
        calls++;
        return authReply;
      }) as typeof fetch,
    });
    assert((await handler(request())).status === 401);
    assert(calls === 1);
  }
});
Deno.test('valid suggestion is returned without writes, profile data, JWT or prompt logs', async () => {
  const f = fixture();
  const response = await f.handler(request());
  const result = await response.json();
  assert(
    response.status === 200 &&
      result.suggestion.title === 'Organizar materiais',
  );
  assert(f.calls.length === 2 && f.calls[0].init?.method === undefined);
  const sent = JSON.parse(String(f.calls[1].init?.body));
  assert(
    sent.messages.length === 2 &&
      sent.messages[1].content === 'Organizar meus materiais de estudo',
  );
  assert(
    sent.tools.length === 1 && sent.tools[0].function.name === 'suggest_draft',
  );
  assert(
    sent.store === false && sent.max_completion_tokens === 768 &&
      sent.reasoning_effort === 'low',
  );
  assert(
    !JSON.stringify(sent).includes('test-user-token') &&
      !JSON.stringify(sent).includes('test-user'),
  );
  assert(f.audit.length === 1 && f.audit[0].status === 200);
  assert(
    !JSON.stringify(f.audit).includes('Organizar') &&
      !JSON.stringify(f.audit).includes('token'),
  );
  assert(response.headers.get('cache-control') === 'no-store');
  assert(
    response.headers.get('access-control-allow-origin') ===
      'http://localhost:5173',
  );
});
Deno.test('unexpected tools/fields, incomplete/truncated/text output rejected', async () => {
  const variants = [
    output({ title: 'x', description: '', user_id: 'other' }),
    output({ title: '', description: '' }),
    output({ title: 'x'.repeat(121), description: '' }),
    output({ title: 'x', description: 'd'.repeat(1001) }),
    output({ title: 'x', description: '' }, 'execute_sql'),
    output({ title: 'x' }),
    { choices: [{ finish_reason: 'length', message: { content: 'text' } }] },
    {
      choices: [{ finish_reason: 'stop', message: { content: 'plain text' } }],
    },
    {
      choices: [{
        finish_reason: 'tool_calls',
        message: {
          tool_calls: [{
            type: 'function',
            function: { name: 'suggest_draft', arguments: '{invalid' },
          }],
        },
      }],
    },
  ];
  for (const value of variants) {
    const f = fixture(() => Response.json(value));
    const response = await f.handler(request());
    assert(
      response.status === 502 &&
        (await response.json()).code === 'invalid_suggestion',
    );
  }
});
Deno.test('provider quota/outage/timeout/oversized response produce bounded generic errors', async () => {
  for (
    const [provider, status, code] of [
      [
        () => new Response('private provider diagnostic', { status: 429 }),
        429,
        'provider_limit',
      ],
      [
        () => new Response('private provider diagnostic', { status: 500 }),
        502,
        'provider_unavailable',
      ],
      [
        () => {
          throw new DOMException('private diagnostic', 'TimeoutError');
        },
        504,
        'provider_timeout',
      ],
      [() => new Response('x'.repeat(32769)), 502, 'provider_unavailable'],
    ] as const
  ) {
    const f = fixture(provider);
    const response = await f.handler(request());
    const body = await response.json();
    assert(
      response.status === status && body.code === code &&
        !JSON.stringify(body).includes('private'),
    );
  }
});
Deno.test('per-isolate user throttle blocks sixth request and resets after a minute', async () => {
  const f = fixture();
  for (let n = 0; n < 5; n++) {
    assert((await f.handler(request())).status === 200);
  }
  assert((await f.handler(request())).status === 429);
  assert(f.calls.filter((c) => c.url.includes('cloudflare')).length === 5);
  f.advance();
  assert((await f.handler(request())).status === 200);
});
Deno.test('preflight allows configured origin and methods only', async () => {
  const f = fixture();
  const response = await f.handler(
    new Request('http://localhost', {
      method: 'OPTIONS',
      headers: { origin: 'http://localhost:5173' },
    }),
  );
  assert(
    response.status === 204 &&
      response.headers.get('access-control-allow-methods') === 'POST, OPTIONS',
  );
  assert(f.calls.length === 0);
  assert(
    (await f.handler(new Request('http://localhost', { method: 'GET' })))
      .status === 405,
  );
});
