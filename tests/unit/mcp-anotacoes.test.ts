/**
 * As tools MCP dizem ao host o que vão fazer ANTES de fazerem.
 *
 * O protocolo MCP define quatro hints por tool — `readOnlyHint`,
 * `destructiveHint`, `idempotentHint` e `openWorldHint`. Sem eles o host não
 * sabe se pode pré-aprovar uma leitura, se deve pedir confirmação antes de
 * encerrar um negócio, nem se repetir a chamada duplica coisa — então assume o
 * pior (ou nada). O índice M8ven mediu em 2026-10-12 (commit 82c60c1): as
 * tools do `tools/list` saíam SEM hint nenhum — o `registerTool` não os
 * passava — e o diretório de conectores da OpenAI recusa exatamente isso:
 * hint ausente ou não-boolean.
 *
 * O QUE ESTE GATE COBRA:
 *
 *   1. toda tool publica OS QUATRO, como boolean de verdade;
 *   2. `readOnlyHint` espelha duas classificações que JÁ existiam — a
 *      `category: "read"` do handler e o `risco: "seguro"` do catálogo. Se
 *      divergirem, uma das duas mentiu para alguém: o catálogo para quem
 *      configura o agente, ou o hint para o host que chama;
 *   3. os CONJUNTOS FECHADOS abaixo. As listas são decisão, não consequência
 *      do nome: acrescentar um membro é decisão de produto, e o comentário de
 *      cada linha diz por quê.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { describe, expect, it, vi } from "vitest";

import { allTools } from "@/lib/mcp/tools";
import { TOOL_CATALOG, catalogEntry } from "@/lib/mcp/tools/catalog";
import type { McpToolDefinition } from "@/lib/mcp/types";

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({}) }));
vi.mock("@/lib/mcp/audit", () => ({ auditMcpToolCall: vi.fn() }));

const { createMcpServer } = await import("@/lib/mcp/server");

/**
 * DESTRUTIVAS — encerram ou removem algo que existia, sem volta pela tela.
 * (Atualizar campo, mover de etapa e ligar/desligar configuração são
 * reversíveis — ficam de fora, mesmo as criticas do catálogo.)
 */
const DESTRUTIVAS: ReadonlyArray<string> = [
  // A etapa sai do quadro e não há desarquivar por tool.
  "crm_archive_stage",
  // Cancela o compromisso: o horário volta para a fila na hora, e "isso não dá para desfazer".
  "crm_cancel_appointment",
  // Encerra a demanda (ganho/perdido): sai do radar de risco; voltar é trabalho manual.
  "crm_close_demand",
  // Fecha o chamado humano — não há reabertura por esta capacidade.
  "crm_close_human_case",
];

/**
 * MUNDO ABERTO — a chamada alcança gente de fora da empresa (mensagem real no
 * WhatsApp). Ler agenda, wiki ou banco interno NÃO abre o mundo: é domínio
 * fechado, mesmo quando a fonte é um serviço integrado.
 */
const MUNDO_ABERTO: ReadonlyArray<string> = [
  // Manda a mensagem ao cliente agora.
  "crm_send_whatsapp_message",
  // Abre conversa nova num canal e manda a primeira mensagem.
  "crm_start_conversation_and_send",
  // O orquestrador AVISA o lead no passo 0, antes de atribuir a um humano.
  "crm_request_human_handoff",
];

/**
 * NÃO IDEMPOTENTES — repetir com os MESMOS argumentos produz OUTRO registro de
 * domínio: um negócio a mais, um recado a mais, uma primeira mensagem a mais.
 *
 * A régua é o que o chamador PEDIU, não o rastro do chamado: escrita que
 * converge (mover para a etapa X, salvar os mesmos campos, ligar/desligar
 * configuração) fica de fora mesmo reemitindo evento, e quem recusa duplicata
 * (etapa por nome, proposta viva, retorno vivo, horário já reservado) também —
 * repetir não muda o resultado e é seguro para retry.
 */
const NAO_IDEMPOTENTES: ReadonlyArray<string> = [
  // Cada chamada é um recado novo no chamado.
  "crm_add_case_note",
  // Cria outro negócio.
  "crm_create_lead",
  // Cria outra entrada, com token próprio.
  "crm_create_webhook_source",
  // Grava outro trecho de memória da organização.
  "crm_save_org_memory",
  // O idempotency_key é opcional — sem ele, reenvio manda de novo.
  "crm_send_whatsapp_message",
  // Idem: a primeira mensagem sairia duas vezes.
  "crm_start_conversation_and_send",
];

const HINTS = ["readOnlyHint", "destructiveHint", "idempotentHint", "openWorldHint"] as const;

function nomes(escopo: (tool: McpToolDefinition) => boolean): Array<string> {
  return allTools.filter(escopo).map((tool) => tool.name).sort();
}

describe("anotações das tools MCP — os quatro hints publicados no tools/list", () => {
  it("toda tool publica os quatro hints, como boolean", () => {
    for (const tool of allTools) {
      const anot = tool.annotations;
      expect(anot, `${tool.name}: sem annotations`).toBeDefined();
      expect(Object.keys(anot).sort(), `${tool.name}: só os quatro campos`).toEqual(
        [...HINTS].sort(),
      );
      for (const hint of HINTS) {
        expect(typeof anot[hint], `${tool.name}.${hint}`).toBe("boolean");
      }
    }
  });

  it("readOnlyHint espelha a categoria do handler e o risco do catálogo", () => {
    for (const tool of allTools) {
      const entrada = catalogEntry(tool.name);
      expect(entrada, `${tool.name}: sem entrada no catálogo`).toBeDefined();
      expect(tool.annotations.readOnlyHint, tool.name).toBe(tool.category === "read");
      expect(tool.annotations.readOnlyHint, tool.name).toBe(entrada?.risco === "seguro");
      if (tool.annotations.readOnlyHint) {
        // Leitura pura não tem o que destruir, é seguro repetir e não fala com o mundo.
        expect(tool.annotations.destructiveHint, tool.name).toBe(false);
        expect(tool.annotations.idempotentHint, tool.name).toBe(true);
        expect(tool.annotations.openWorldHint, tool.name).toBe(false);
      }
    }
  });

  it('risco "atencao" (desfazível pela tela) nunca é declarada destrutiva', () => {
    const atencao = TOOL_CATALOG.filter((entrada) => entrada.risco === "atencao");
    expect(atencao.length).toBeGreaterThan(0);
    for (const entrada of atencao) {
      const tool = allTools.find((t) => t.name === entrada.name);
      expect(tool, entrada.name).toBeDefined();
      expect(tool?.annotations.destructiveHint, entrada.name).toBe(false);
    }
  });

  it("conjunto fechado: só as destrutivas se declaram destrutivas", () => {
    expect(nomes((tool) => tool.annotations.destructiveHint)).toEqual([...DESTRUTIVAS].sort());
  });

  it("conjunto fechado: só as listadas se declaram não idempotentes", () => {
    expect(nomes((tool) => !tool.annotations.idempotentHint)).toEqual([...NAO_IDEMPOTENTES].sort());
  });

  it("conjunto fechado: só as que falam com o cliente são de mundo aberto", () => {
    expect(nomes((tool) => tool.annotations.openWorldHint)).toEqual([...MUNDO_ABERTO].sort());
  });

  it("tools/list do servidor publica os quatro hints em toda tool", async () => {
    const server = createMcpServer(
      {
        organizationId: "00000000-0000-4000-8000-000000000001",
        role: "admin",
        actor: { type: "user", id: "00000000-0000-4000-8000-000000000002" },
        apiTokenId: "tok",
        scopes: ["mcp:read", "mcp:write"],
      },
      "req-anotacoes",
    );
    const [cliente, servidor] = InMemoryTransport.createLinkedPair();
    await server.connect(servidor);
    const client = new Client({ name: "teste-anotacoes", version: "0.0.0" });
    await client.connect(cliente);
    try {
      const { tools } = await client.listTools();
      expect(tools).toHaveLength(allTools.length);
      for (const ferramenta of tools) {
        const anot = ferramenta.annotations as Record<string, unknown> | undefined;
        expect(anot, `${ferramenta.name}: tools/list sem annotations`).toBeDefined();
        expect(Object.keys(anot ?? {}).sort(), ferramenta.name).toEqual([...HINTS].sort());
        for (const hint of HINTS) {
          expect(typeof anot?.[hint], `${ferramenta.name}.${hint}`).toBe("boolean");
        }
      }
      const envio = tools.find((t) => t.name === "crm_send_whatsapp_message");
      expect(envio?.annotations).toEqual({
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      });
    } finally {
      await client.close();
      await server.close();
    }
  });
});
