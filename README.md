# pi-exa

Minimal web search for the [pi coding agent](https://github.com/earendil-works/pi-coding-agent).

One `/exa` command, one search engine (Exa), one API call. No tools, no providers, no dependencies — just results in your conversation, lean on context.

## Install

```bash
pi install git:github.com/kartikkabadi/pi-exa@v0.1.0
```

Then restart pi or run `/reload`. To try it without installing: `pi -e git:github.com/kartikkabadi/pi-exa`.

## Usage

```bash
/exa <query>
```

Posts the top 5 results (title, url, date, key excerpt) into the conversation.

Requires an Exa API key in the environment:

```bash
export EXA_API_KEY=your-key
```

Get a key at [dashboard.exa.ai/api-keys](https://dashboard.exa.ai/api-keys). The command shows clear instructions if the key is missing.

## Context budget

Each result carries at most a 400-character excerpt — capped at the API level via `contents.highlights.maxCharacters`, per Exa's token-efficiency guidance for agent workflows. A full search posts roughly 2.5 KB into the session.

## Notes for developers

Single file, no runtime dependencies — plain `fetch` against `POST https://api.exa.ai/search` with `Authorization: Bearer`. `@earendil-works/pi-coding-agent` is provided by pi (peer dependency).

## License

MIT
