/**
 * The new post-MFA landing page is /app, not necessarily /app/inbox.
 * Match pathname only: /login?next=/app must never count as authenticated.
 */
import type { Page } from "@playwright/test";

export function isAppUrl(url: URL): boolean {
  return url.pathname === "/app" || url.pathname.startsWith("/app/");
}

/**
 * A PORTA DE ENTRADA do app — o que `isAppUrl` mede, mais a origem.
 *
 * Por que a origem importa: `waitForURL` com predicado vê a URL para onde a
 * página navegou; um destino fora do host sob teste com caminho `/app` não é
 * "entrou no app". A entrada só vale quando caminho E origem conferem.
 */
export function isAppEntryUrl(url: URL, expectedOrigin: string): boolean {
  return url.origin === expectedOrigin && isAppUrl(url);
}

/**
 * Espera a ENTRADA do app (login/MFA concluídos), preservando o timeout do
 * chamador. A origem esperada é a da PRÓPRIA PÁGINA no momento da chamada —
 * quem chama está na tela de login/MFA do host sob teste.
 *
 * Existe porque dezenas de specs esperavam `waitForURL(/\/app\//)`, um regex
 * que exige uma barra depois de `/app` e portanto REJEITA o destino legal
 * `/app` (a raiz pós-MFA): a espera estourava sem nada estar errado na tela
 * (medido no PR #8 deste fork).
 *
 * Este helper mede SÓ o destino da navegação; autenticação, MFA e o estado da
 * tela continuam por conta das asserções de cada caso.
 */
export async function waitForAppEntry(
  page: Page,
  options?: { timeout?: number },
): Promise<void> {
  const expectedOrigin = new URL(page.url()).origin;
  await page.waitForURL((url) => isAppEntryUrl(url, expectedOrigin), options);
}
