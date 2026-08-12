# pi-exa

Minimal web search for the [pi coding agent](https://github.com/earendil-works/pi-coding-agent).

One `/exa` command for you, one `exa` tool for the agent, one search engine (Exa), one API call. No providers, no dependencies — just results in your conversation, lean on context.

## Install

```bash
pi install git:github.com/kartikkabadi/pi-exa@v0.2.1
```

Then restart pi or run `/reload`. To try it without installing: `pi -e git:github.com/kartikkabadi/pi-exa`.

## Usage

```bash
/exa <query>
```

Posts the top 5 results (title, url, date, key excerpt) into the conversation.

The agent can also call the `exa` tool itself — just ask it to search the web. The tool appears in its `Available tools` list and returns the same lean results.

Requires an Exa API key in your shell:

```bash
export EXA_API_KEY=your-key
```

Get a key at [dashboard.exa.ai/api-keys](https://dashboard.exa.ai/api-keys). The command shows clear instructions if the key is missing.

The key is read from the environment first. If pi was launched from a GUI app (macOS launchd), the shell export never reaches the process — the extension then asks your login shell (`$SHELL -lic`) for it directly, once per pi session. No configuration needed beyond the export.

## Context budget

Each result carries at most a 400-character excerpt — capped at the API level via `contents.highlights.maxCharacters`, per Exa's token-efficiency guidance for agent workflows. A full search posts roughly 2.5 KB into the session.

## Notes for developers

Single file, no runtime dependencies — plain `fetch` against `POST https://api.exa.ai/search` with `Authorization: Bearer`. `@earendil-works/pi-coding-agent` is provided by pi (peer dependency).

When `EXA_API_KEY` is absent from the environment (pi launched from a GUI app), the extension queries the user's login shell for it — cached per pi session, 5s timeout.

## License

MIT
