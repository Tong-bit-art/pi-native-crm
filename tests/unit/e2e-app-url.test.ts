import { describe, expect, it } from "vitest";
import { isAppEntryUrl, isAppUrl } from "../e2e/utils/app-url";

const ORIGEM = "http://127.0.0.1:3012";

describe("post-MFA URL boundary", () => {
  it.each(["/app", "/app?x=1", "/app/ai/workbench"])("recognizes protected route %s", path => {
    expect(isAppUrl(new URL(path,"http://127.0.0.1:3012"))).toBe(true);
  });
  it.each(["/login?next=/app", "/login/mfa?next=/app/inbox", "/application", "/signup"])("does not mistake anonymous %s for login success", path => {
    expect(isAppUrl(new URL(path,"http://127.0.0.1:3012"))).toBe(false);
  });
});

/**
 * A ENTRADA do app é mais estreita que `isAppUrl`: além do caminho, exige a
 * MESMA origem. O defeito que originou este bloco: dezenas de specs esperavam
 * `waitForURL(/\/app\//)` — um regex que exige a barra depois de `/app` e
 * portanto REJEITA o destino legal `/app` (a raiz pós-MFA). As telas ficavam
 * presas até o timeout e o vermelho aparecia longe da causa.
 */
describe("entrada do app — matriz da porta (caminho exato + mesma origem)", () => {
  it.each(["/app", "/app/", "/app/inbox", "/app/ai/workbench", "/app?next=/login", "/app#secao"])(
    "aceita %s",
    (path) => {
      expect(isAppEntryUrl(new URL(path, ORIGEM), ORIGEM)).toBe(true);
    },
  );

  it.each([
    "/login",
    "/login/mfa?next=/app",
    "/onboarding",
    "/onboarding/connect-whatsapp",
    "/application",
    "/app-malicious",
    "/rota-qualquer?next=/app",
    "/",
  ])("rejeita %s", (path) => {
    expect(isAppEntryUrl(new URL(path, ORIGEM), ORIGEM)).toBe(false);
  });

  it("rejeita /app de OUTRA origem (a navegação pode ser levada para fora)", () => {
    expect(isAppEntryUrl(new URL("https://exemplo.invalid/app"), ORIGEM)).toBe(false);
    expect(isAppEntryUrl(new URL("http://127.0.0.1:9999/app"), ORIGEM)).toBe(false);
  });

  it('a forma antiga (/\\/app\\//) rejeitava o destino legal "/app" — o defeito medido', () => {
    expect(/\/app\//.test(new URL(`${ORIGEM}/app`).pathname)).toBe(false);
    expect(isAppEntryUrl(new URL(`${ORIGEM}/app`), ORIGEM)).toBe(true);
  });
});
