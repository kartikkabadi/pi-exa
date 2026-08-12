/**
 * pi-exa - Exa web search for pi. One command (/exa), one agent tool (exa).
 *
 * Reads EXA_API_KEY from the environment. Posts 5 results (title, url,
 * date, capped highlight) into the conversation. Highlights are capped at
 * 400 chars per result at the API level to keep context lean.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

type ExaResult = {
  title: string;
  url: string;
  publishedDate?: string | null;
  highlights?: string[];
};

async function searchExa(
  query: string,
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const key = process.env.EXA_API_KEY;
  if (!key) {
    return {
      ok: false,
      error:
        "EXA_API_KEY is not set. Get a key at https://dashboard.exa.ai/api-keys, then export EXA_API_KEY=... in your shell profile and restart pi.",
    };
  }
  try {
    const res = await fetch("https://api.exa.ai/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        query,
        numResults: 5,
        contents: { highlights: { maxCharacters: 400 } },
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      return { ok: false, error: `Exa error ${res.status}: ${(await res.text()).slice(0, 300)}` };
    }
    const data = (await res.json()) as { results: ExaResult[] };
    if (data.results.length === 0) {
      return { ok: false, error: `No results for "${query}"` };
    }
    const text = data.results
      .map((r, i) => {
        const date = r.publishedDate ? ` (${r.publishedDate.slice(0, 10)})` : "";
        const hl = r.highlights?.[0] ? `\n   ${r.highlights[0]}` : "";
        return `${i + 1}. ${r.title}\n   ${r.url}${date}${hl}`;
      })
      .join("\n");
    return { ok: true, text };
  } catch (e) {
    return { ok: false, error: `Exa request failed: ${e instanceof Error ? e.message : String(e)}` };
  }
}

const format = (query: string, text: string) => `Exa results for "${query}":\n\n${text}`;

export default function (pi: ExtensionAPI) {
  pi.registerCommand("exa", {
    description: "Search the web with Exa",
    handler: async (args, ctx) => {
      const query = args.trim();
      if (!query) {
        ctx.ui.notify("Usage: /exa <query>", "warning");
        return;
      }
      const result = await searchExa(query);
      if (!result.ok) {
        ctx.ui.notify(result.error, "error");
        return;
      }
      pi.sendMessage({
        customType: "exa-results",
        content: format(query, result.text),
        display: true,
      });
    },
  });

  pi.registerTool({
    name: "exa",
    label: "Exa Web Search",
    description: "Search the web with Exa and get 5 live results with URLs and highlights",
    promptSnippet: "Search the web with Exa (5 live results with URLs and highlights)",
    parameters: Type.Object({
      query: Type.String({ description: "The search query" }),
    }),
    async execute(_toolCallId, params, _signal) {
      const result = await searchExa(params.query);
      if (!result.ok) {
        return { content: [{ type: "text", text: result.error }], isError: true, details: {} };
      }
      return {
        content: [{ type: "text", text: format(params.query, result.text) }],
        details: {},
      };
    },
  });
}
