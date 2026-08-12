/**
 * pi-exa - /exa <query> web search via Exa. One command, one API call.
 *
 * Reads EXA_API_KEY from the environment. Posts 5 results (title, url,
 * date, capped highlight) into the conversation. Highlights are capped at
 * 400 chars per result at the API level to keep context lean.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

type ExaResult = {
  title: string;
  url: string;
  publishedDate?: string | null;
  highlights?: string[];
};

export default function (pi: ExtensionAPI) {
  pi.registerCommand("exa", {
    description: "Search the web with Exa",
    handler: async (args, ctx) => {
      const query = args.trim();
      if (!query) {
        ctx.ui.notify("Usage: /exa <query>", "warning");
        return;
      }
      const key = process.env.EXA_API_KEY;
      if (!key) {
        ctx.ui.notify(
          "EXA_API_KEY is not set. Get a key at https://dashboard.exa.ai/api-keys, then export EXA_API_KEY=... in your shell profile and restart pi.",
          "error",
        );
        return;
      }
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
        ctx.ui.notify(`Exa error ${res.status}: ${(await res.text()).slice(0, 300)}`, "error");
        return;
      }
      const data = (await res.json()) as { results: ExaResult[] };
      if (data.results.length === 0) {
        ctx.ui.notify(`No results for "${query}"`, "info");
        return;
      }
      const text = data.results
        .map((r, i) => {
          const date = r.publishedDate ? ` (${r.publishedDate.slice(0, 10)})` : "";
          const hl = r.highlights?.[0] ? `\n   ${r.highlights[0]}` : "";
          return `${i + 1}. ${r.title}\n   ${r.url}${date}${hl}`;
        })
        .join("\n");
      pi.sendMessage({
        customType: "exa-results",
        content: `Exa results for "${query}":\n\n${text}`,
        display: true,
      });
    },
  });
}
