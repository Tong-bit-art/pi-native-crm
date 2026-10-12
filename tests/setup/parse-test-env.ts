import { parseEnv } from "node:util";

/**
 * Lê um arquivo `.env` DE TESTE com a semântica do dotenv do Node.
 *
 * ─── Por que não um split em `=` ───────────────────────────────────────────
 *
 * O `.env.local` desta casa nasce de `cp .env.example .env.local`, e o exemplo
 * carrega linhas como
 *
 *     OPENROUTER_BASE_URL=                     # vazio = https://openrouter.ai/api/v1
 *
 * O parser anterior (em `vitest.setup.ts` até a rodada 2) cortava por `=` e só
 * removia aspas inteiras: o comentário de fim de linha virava VALOR de ambiente
 * — e um teste de unidade mediu esse texto como se fosse o endpoint da
 * organização. `node:util.parseEnv` (Node 22, builtin — sem dependência nova)
 * resolve comentários, aspas simples/duplas e `=`/`#` dentro de aspas; aspas
 * que o `install.sh` grava (`NEXT_PUBLIC_APP_URL="https://…"` na VPS do
 * self-hoster) continuam sendo removidas nativamente.
 *
 * ─── A exceção MEDIDA ──────────────────────────────────────────────────────
 *
 * Uma linha `CHAVE=` seguida de espaços em branco e OUTRA linha faz o parseEnv
 * fundir a linha seguinte no valor:
 *
 *     "A=   \nB=valor"  →  { A: "B=valor" }   (o parser pula espaços — inclusive
 *                                              o \n — depois do `=`)
 *
 * Aparar os espaços no FIM de cada linha antes da chamada fecha esse modo de
 * falha sem tocar em `=`, `#` ou aspas dentro do valor.
 */
export function parseTestEnv(content: string): Record<string, string> {
  const semEspacosNaBorda = content
    .split(/\r?\n/)
    .map((linha) => linha.replace(/\s+$/, ""))
    .join("\n");
  return parseEnv(semEspacosNaBorda);
}
