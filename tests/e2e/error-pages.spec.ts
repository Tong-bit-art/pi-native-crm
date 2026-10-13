import { test, expect } from "@playwright/test";

test.describe("error pages", () => {
  // 404/500/503 são resolvidas SEM sessão, e a cadeia de idioma delas é:
  //   - not-found.tsx e 500/page.tsx: normalizarIdioma(user?.locale ?? null)
  //   - 503/page.tsx: IDIOMA_PADRAO fixo (manutenção pode derrubar o Supabase)
  // Sem sessão, os três caem no IDIOMA_PADRAO da instalação — `zh-CN`
  // (lib/i18n/idiomas.ts). O locale do BROWSER não manda aqui; quem o escuta é
  // o /403 (`idiomaDoVisitante`, Accept-Language), e por isso o caso dele
  // segue em pt-BR. As strings esperadas vêm de
  // lib/i18n/traducoes/zh-CN.json — mesmo texto que a tela renderiza.
  test("/404 fala o idioma padrão anônimo e oferece voltar", async ({ page }) => {
    const res = await page.goto("/404");
    // Next renders the not-found.tsx component; status may be 404 or 200 depending on routing.
    expect([200, 404]).toContain(res?.status() ?? 0);
    // E não é o login disfarçado: o proxy não redireciona esta rota pública.
    expect(new URL(page.url()).pathname).toBe("/404");
    await expect(page.getByRole("heading", { name: "404 — 页面未找到", exact: true })).toBeVisible();
    await expect(page.getByText("请检查链接，或返回会话收件箱。", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "返回", exact: true })).toHaveAttribute("href", "/");
    await expect(page.getByRole("link", { name: "返回会话收件箱", exact: true })).toHaveAttribute(
      "href",
      "/app/inbox",
    );
  });

  test("/403 renders sem permissão", async ({ page }) => {
    await page.goto("/403");
    await expect(page.getByText(/sem permissão/i)).toBeVisible();
  });

  test("/500 fala o idioma padrão anônimo e oferece voltar", async ({ page }) => {
    await page.goto("/500");
    expect(new URL(page.url()).pathname).toBe("/500");
    await expect(page.getByRole("heading", { name: "500 — 内部错误", exact: true })).toBeVisible();
    await expect(
      page.getByText("我们这边出了点问题。我们已记录该情况；请稍后重试。", { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "返回", exact: true })).toHaveAttribute("href", "/");
  });

  test("/503 fala o idioma padrão anônimo e oferece voltar", async ({ page }) => {
    await page.goto("/503");
    expect(new URL(page.url()).pathname).toBe("/503");
    await expect(page.getByRole("heading", { name: "503 — 维护中", exact: true })).toBeVisible();
    await expect(page.getByText("我们将在几分钟后恢复。", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "返回", exact: true })).toHaveAttribute("href", "/");
  });
});

/**
 * Os documentos legais moram aqui, e não numa spec nova, por dois motivos: esta
 * já navega deslogada (que é a condição sob teste) e já está declarada no
 * workflow — spec nova sem entrada em `.github/workflows/e2e.yml` reprova
 * `tests/unit/e2e-cobertura-completa.test.ts` no check obrigatório.
 *
 * O que se prova: o checkbox de aceite da PRIMEIRA tela do produto linka estes
 * dois endereços, e eles respondiam 404. Um aceite obrigatório apontando para o
 * vazio é o pior defeito de confiança que uma instalação nova pode ter.
 */
test.describe("documentos legais", () => {
  test("/legal/terms abre SEM sessão — é o que o aceite do onboarding linka", async ({ page }) => {
    const res = await page.goto("/legal/terms");
    expect(res?.status()).toBe(200);
    // E não é o login disfarçado: o proxy manda anônimo para /login?next=...
    expect(new URL(page.url()).pathname).toBe("/legal/terms");
    await expect(page.getByRole("heading", { name: /termos de uso/i })).toBeVisible();
  });

  test("/legal/privacy abre SEM sessão e nomeia o responsável", async ({ page }) => {
    const res = await page.goto("/legal/privacy");
    expect(res?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe("/legal/privacy");
    await expect(page.getByRole("heading", { name: /política de privacidade/i })).toBeVisible();
    // Sem sessão não dá para saber a razão social, mas o documento não pode
    // fingir que quem responde pelos dados é o projeto de software.
    await expect(page.getByText(/operador desta instalação/i).first()).toBeVisible();
  });

  test("o vizinho de /legal continua fechado — a liberação é dos dois, não do prefixo", async ({
    page,
  }) => {
    await page.goto("/legal/qualquer-outra");
    await expect(page).toHaveURL(/\/login/);
  });
});
