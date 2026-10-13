import { describe, expect, it } from "vitest";

import { parseTestEnv } from "../setup/parse-test-env";

/**
 * A ENTRADA FIXA do parser de `.env` de teste — cada linha aqui é um modo de
 * falha medido ou uma regra que o loader de `vitest.setup.ts` já tinha.
 */
describe("parseTestEnv — o parser de .env dos testes", () => {
  it("VAZIA com comentário de fim de linha vira string vazia (o defeito medido)", () => {
    const r = parseTestEnv(
      "OPENROUTER_BASE_URL=                     # vazio = https://openrouter.ai/api/v1",
    );
    expect(r.OPENROUTER_BASE_URL).toBe("");
  });

  it("comentário de fim de linha sai do valor", () => {
    expect(parseTestEnv("A=valor # comentário").A).toBe("valor");
  });

  it("aspas (duplas e simples) saem, com o conteúdo intacto", () => {
    expect(parseTestEnv('A="https://x.test/v1"').A).toBe("https://x.test/v1");
    expect(parseTestEnv("A='a b'").A).toBe("a b");
  });

  it("`#` e `=` DENTRO de aspas não são comentário nem corte", () => {
    expect(parseTestEnv('A="a # b"').A).toBe("a # b");
    expect(parseTestEnv('A="a=b"').A).toBe("a=b");
  });

  it("`=` no valor sem aspas sobrevive", () => {
    expect(parseTestEnv("A=a=b").A).toBe("a=b");
  });

  it("URL customizada válida atravessa inteira", () => {
    expect(parseTestEnv("A=https://homolog.example.test/v1").A).toBe(
      "https://homolog.example.test/v1",
    );
  });

  it("linha `CHAVE=` seguida de outra NÃO funde a próxima (defeito do parseEnv)", () => {
    const r = parseTestEnv("A=   \nB=valor");
    expect(r.A).toBe("");
    expect(r.B).toBe("valor");
  });

  it("linhas em branco e comentários (inclusive indentados) não viram chave", () => {
    const r = parseTestEnv("\n# comentário\n   \n  # indentado\nA=1\n");
    expect(Object.keys(r)).toEqual(["A"]);
  });

  it("CRLF não deixa `\\r` no valor", () => {
    const r = parseTestEnv("A=valor\r\nB=outro\r\n");
    expect(r.A).toBe("valor");
    expect(r.B).toBe("outro");
  });

  it("conteúdo vazio devolve mapa vazio", () => {
    expect(parseTestEnv("")).toEqual({});
  });
});
