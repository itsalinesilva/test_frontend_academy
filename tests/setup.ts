import '@testing-library/jest-dom/vitest';

/**
 * Sem servidor, a API responde como um servidor que não está no ar.
 *
 * No jsdom, `fetch('/api/v1/…')` (URL relativa) estourava "Failed to parse
 * URL" — um erro que o app real nunca vê — e enchia o log da suíte de ruído
 * que escondia erro de verdade. Aqui a chamada relativa recebe um 503 em JSON,
 * que é o que as telas precisam saber tratar. Teste que quer o servidor de
 * verdade troca o `fetch` pelo `handleApiRequest` (ver salas-na-tela.test.tsx).
 */
if (typeof window !== 'undefined' && typeof globalThis.fetch === 'function') {
  const original = globalThis.fetch.bind(globalThis);
  globalThis.fetch = ((entrada: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof entrada === 'string' ? entrada : entrada instanceof URL ? entrada.href : entrada.url;
    if (url.startsWith('/api/')) {
      return Promise.resolve(
        new Response(JSON.stringify({ error: { code: 'SEM_SERVIDOR', message: 'Sem conexão com o servidor.' } }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    }
    return original(entrada, init);
  }) as typeof fetch;
}
