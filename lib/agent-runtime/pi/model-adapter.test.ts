import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { resolvePiModel } from "./model-adapter";

/**
 * O adapter lê `OPENROUTER_BASE_URL` do ambiente como override do default do
 * provedor — e um binding explícito vence os dois (medido aqui, não presumido).
 * O ambiente de quem roda não pode decidir o resultado: cada caso controla a
 * variável, o `beforeEach` parte de ausente e o `afterEach` restaura — o mesmo
 * padrão de isolamento do teste irmão que mede base URL vazia (nome de arquivo
 * com o sufixo `-base-url-vazia.test.ts`).
 */
const CHAVE_DO_AMBIENTE = "OPENROUTER_BASE_URL";

let original: string | undefined;
beforeEach(() => {
  original = process.env[CHAVE_DO_AMBIENTE];
  delete process.env[CHAVE_DO_AMBIENTE];
});
afterEach(() => {
  if (original === undefined) delete process.env[CHAVE_DO_AMBIENTE];
  else process.env[CHAVE_DO_AMBIENTE] = original;
});

describe("Pi model adapter", () => {
  it.each([
    ["anthropic", "anthropic-messages", "https://api.anthropic.com"],
    ["openai", "openai-responses", "https://api.openai.com/v1"],
    ["google", "google-generative-ai", "https://generativelanguage.googleapis.com/v1beta"],
    ["openrouter", "openai-completions", "https://openrouter.ai/api/v1"],
    ["opencode", "openai-completions", "https://opencode.ai/zen/v1"],
    ["deepseek", "openai-completions", "https://api.deepseek.com"],
  ] as const)(
    "binds %s through Pi with its canonical API and endpoint",
    async (provider, api, baseUrl) => {
      const resolved = await resolvePiModel({
        provider,
        model: "crm-test-model",
        apiKey: "test-key",
      });

      expect(resolved.model).toMatchObject({
        id: "crm-test-model",
        provider,
        api,
        baseUrl,
      });
      expect(resolved.streamFn).toEqual(expect.any(Function));
    },
  );

  it("honors tenant-selected endpoint and request controls in the Pi binding", async () => {
    const resolved = await resolvePiModel({
      provider: "openrouter",
      model: "tenant/model",
      apiKey: "tenant-key",
      baseUrl: "https://gateway.example.test/v1",
      headers: { "X-Tenant": "org-a" },
      maxOutputTokens: 321,
      temperature: 0.2,
      topP: 0.8,
    });

    expect(resolved.model).toMatchObject({
      id: "tenant/model",
      baseUrl: "https://gateway.example.test/v1",
    });
    expect(resolved.streamFn).toEqual(expect.any(Function));
  });

  it("rejects unsupported providers before any provider request", async () => {
    await expect(
      resolvePiModel({ provider: "unsupported", model: "m", apiKey: "k" }),
    ).rejects.toThrow("Pi provider not supported by the CRM adapter");
  });

  it("o override de ambiente vence o default do provedor", async () => {
    process.env[CHAVE_DO_AMBIENTE] = "https://gateway-da-org.example.test/v1";
    const resolved = await resolvePiModel({
      provider: "openrouter",
      model: "crm-test-model",
      apiKey: "test-key",
    });
    expect(resolved.model).toMatchObject({ baseUrl: "https://gateway-da-org.example.test/v1" });
  });

  it("o binding explícito vence o override de ambiente", async () => {
    process.env[CHAVE_DO_AMBIENTE] = "https://gateway-da-org.example.test/v1";
    const resolved = await resolvePiModel({
      provider: "openrouter",
      model: "crm-test-model",
      apiKey: "test-key",
      baseUrl: "https://binding-explicito.example.test/v1",
    });
    expect(resolved.model).toMatchObject({ baseUrl: "https://binding-explicito.example.test/v1" });
  });

  it("ambiente só com espaço em branco cai no default — não vira endpoint", async () => {
    process.env[CHAVE_DO_AMBIENTE] = "   ";
    const resolved = await resolvePiModel({
      provider: "openrouter",
      model: "crm-test-model",
      apiKey: "test-key",
    });
    expect(resolved.model).toMatchObject({ baseUrl: "https://openrouter.ai/api/v1" });
  });

  it("o override é do OpenRouter — os outros provedores seguem canônicos", async () => {
    process.env[CHAVE_DO_AMBIENTE] = "https://gateway-da-org.example.test/v1";
    const resolved = await resolvePiModel({
      provider: "anthropic",
      model: "crm-test-model",
      apiKey: "test-key",
    });
    expect(resolved.model).toMatchObject({ baseUrl: "https://api.anthropic.com" });
  });
});
