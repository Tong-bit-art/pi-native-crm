import type { MeetingBookingContext } from "@/lib/agenda/meet-delivery";
/**
 * Tipos compartilhados do MCP server interno (Spec 11).
 *
 * Cada tool MCP é uma `McpToolDefinition` que declara name + description +
 * inputSchema (Zod) + handler. Handlers recebem `McpContext` resolvido pelo
 * server core (org, role, actor, supabase admin client).
 */
import type { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Actor } from "@/lib/api/handlers/types";
import type { Role } from "@/lib/auth/types";

export interface McpContext {
  /** Somente o runtime in-process fornece o job original, nunca o cliente MCP. */
  meetingBooking?: MeetingBookingContext;
  organizationId: string;
  role: Role;
  actor: Actor;
  apiTokenId: string;
  requestId: string;
  /**
   * Version-scoped knowledge corpus supplied by the Agent harness. External
   * MCP clients omit it and let the tool resolve the published Agent version.
   */
  knowledgeSourceIds?: readonly string[];
  /** Service-role admin client. Tools devem filtrar `organization_id` em toda query. */
  supabase: SupabaseClient;
}

export type McpToolCategory = "read" | "write" | "handoff";

/**
 * Os quatro hints do protocolo MCP (spec 2025-06-18), todos boolean de verdade.
 *
 * Obrigatórios de propósito: host sem hint assume o pior — não pré-aprova
 * leitura, não avisa antes de encerrar — e o diretório de conectores da OpenAI
 * recusa tool com hint ausente ou não-boolean. O gate mecânico que mantém os
 * valores fiéis ao comportamento real vive em `tests/unit/mcp-anotacoes.test.ts`.
 *
 * A régua de cada hint AQUI (o porquê de cada membro está no teste):
 *   - `readOnlyHint` — só consulta; espelha `category: "read"` e o risco
 *     "seguro" do catálogo;
 *   - `destructiveHint` — encerra ou remove algo que existia, sem volta pela
 *     tela (cancelar compromisso, arquivar etapa, fechar chamado/demanda).
 *     Atualizar campo, mover de etapa e ligar/desligar configuração são
 *     reversíveis: false;
 *   - `idempotentHint` — repetir com os mesmos argumentos converge: o estado
 *     que o chamador pediu já está lá. Quem recusa duplicata conta como
 *     idempotente; o rastro do próprio chamado (auditoria, evento) não
 *     descaracteriza uma escrita que converge. Quem cria OUTRO registro de
 *     domínio — negócio, recado, mensagem — não é;
 *   - `openWorldHint` — a chamada alcança gente de fora da empresa (mensagem
 *     real no WhatsApp); ler agenda, wiki ou banco interno é domínio fechado.
 */
export interface McpToolAnnotations {
  readOnlyHint: boolean;
  destructiveHint: boolean;
  idempotentHint: boolean;
  openWorldHint: boolean;
}

export interface McpToolDefinition<TInput extends z.ZodRawShape = z.ZodRawShape> {
  name: string;
  description: string;
  inputSchema: TInput;
  category: McpToolCategory;
  /** Hints de wire do protocolo MCP. Obrigatórios — régua em `McpToolAnnotations`. */
  annotations: McpToolAnnotations;
  /** Role mínima para invocar. Read default agent; Write default manager. */
  requiresRole: Role;
  /**
   * Scope obrigatório no `api_tokens.scopes` (ex: `mcp:read`, `mcp:write`).
   * Ausência → -32002 forbidden.
   */
  requiresScope: "mcp:read" | "mcp:write";
  /**
   * O que a tool DECLARA quando a resposta é um vazio que NÃO é sucesso.
   *
   * Uma busca que não acha nada TERMINOU bem: não houve erro, houve ausência —
   * e as duas coisas ficavam idênticas para a auditoria, que só via a chamada
   * completar e gravava `success: true`. O painel de capacidades lia `falhas: 0`
   * ("nenhuma falha") enquanto o agente nunca achava um produto: a mentira não
   * estava no número, estava no número não existir (issue #484).
   *
   * Devolver o motivo aqui é o que separa "não achei" de "falhei": quem lê este
   * campo é a auditoria em `lib/ai/runtime/tools.ts`, e o motivo desce para
   * `api_audit_log.metadata.motivo`, de onde a próxima contagem de "não achei"
   * por loja e por termo vai poder ler.
   *
   * AUSENTE = todo vazio continua sucesso, exatamente como antes. É por tool de
   * propósito: agenda sem compromissos numa janela é uma RESPOSTA ("não tem nada
   * nesse período"), não uma falha — marcar todo vazio de toda tool
   * transformaria comportamento normal em alarme.
   */
  motivoDoVazio?: (resultado: unknown) => string | null;
  handler: (input: z.infer<z.ZodObject<TInput>>, ctx: McpContext) => Promise<unknown>;
}
