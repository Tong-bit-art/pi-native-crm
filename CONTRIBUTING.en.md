# Contributing — short guide

This repository is a snapshot-based distribution of the original project (see [ORIGIN.md](ORIGIN.md)). Small, well-scoped fixes are welcome — you do not need to read the full internal history first.

## Run the minimal preview (no keys)

```bash
git clone https://github.com/Tong-bit-art/pi-native-crm.git
cd pi-native-crm
node scripts/serve-agent-demo.mjs   # http://127.0.0.1:3008/#/app/ai/workbench
```

## Verify your change

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test:unit                     # full unit suite
pnpm exec vitest run <file>        # a single file while iterating
pnpm cercas                        # fast structural checks (POSIX shells; on Windows, run the files you touch)
```

The demo has its own checks: `cd examples/chat-first-demo && npm ci && npm test`.

## Good contribution topics

- Chinese (zh-CN) localization of the UI and docs; English documentation fixes.
- Windows compatibility fixes for repository checks.
- Small UI/CLI papercuts with a clear reproduction.
- Docs corrections where a statement no longer matches the code.

Out of scope for this branch: stack swaps, database/auth changes, rewrites of the agent runtime, or changes that break existing interfaces — those belong upstream (see [ORIGIN.md](ORIGIN.md)).

## PR material

- What changed and why; the commands you ran and their results; a screenshot for visible UI changes; and anything you could not verify. Keep the diff focused.
- Existing mandatory checks stay in place. Do not delete, skip, or weaken a check to make a PR pass; if a check conflicts with an accurate public state, say so in the PR and ask.

## License

MIT. Keep [LICENSE](LICENSE) and the original attribution intact.
