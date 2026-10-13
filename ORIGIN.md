# Origin & branch status

Everything a stranger needs in order to tell apart **what is inherited**, **what this branch changed**, and **what is still unverified**.

## Upstream / original project

- **Original project:** Pi Native CRM — the original distribution repository is `helsome/AiNativeCrm`, **no longer publicly reachable** (checked on 2026-10-11).
- **Current public upstream:** <https://github.com/melgarafael/DeskcommCRM> — the author's (Rafael Melgaço) successor repository, reachable and independently checked on 2026-10-11. This single canonical URL is the **only sanctioned occurrence** of the previous brand in this branch's files: the removed-namespace guard in `tests/unit/branding.test.ts` stays in force for every other form — bare text anywhere, the same URL outside `ORIGIN.md`, extended or embedded URLs (extra path, query or fragment; nested inside another address), and file names.
- **License:** MIT, Copyright (c) 2026 Rafael Melgaço — see [LICENSE](LICENSE), kept unchanged.
- Positioning and partnerships described in `VISION.md` (Brazilian market, HostGator partnership) are historical facts of the upstream project. They are **not** commitments, endorsements, or support promises of this branch.

## How this branch was imported

- **Method:** snapshot import from a purchased distribution copy of the original project. Upstream git history was **not** imported.
- **Base:** Pi Native CRM v1.41.0 (CHANGELOG head dated 2026-09-20), containing work through early October 2026.
- **Date:** 2026-10-11, as a single commit `2bbe3c7` ("initial import").
- **Deliberately not imported:** seller-internal material (`evidence/`, `loop/`, `plan/`, `tasks/`, `triagem/`, `experiments/`, `.specs/`). See the buyer's note in [.gitignore](.gitignore).
- **Redactions applied at import** (not upstream content): real phone numbers and a partial credential fragment in `docs/` and `scripts/`.
- **Upstream attribution preserved:** historical names, links, and third-party references are kept as-is by design.

## What this branch changed (so far)

- `2bbe3c7` — import, cleanup, and repository pointers.
- The commits that follow it (2026-10-11, community-onboarding round): a Windows path fix in `tests/unit/pi-runtime-architecture.test.ts`; public entry-point docs (`README.md`, `README.en.md`, this file, `CONTRIBUTING.en.md`); demo link provenance split. Evidence: `docs/testing/2026-10-11-community-onboarding.md` and the fragment in `.changes/`.
- To enumerate exactly:

  ```bash
  git log --oneline 2bbe3c7..HEAD
  git show 2bbe3c7 --stat
  ```

## What is not verifiable from this repository (待核实 / to be verified)

- **File-by-file authorship of inherited content.** This branch imported a snapshot; upstream history was not restored here. No attribution beyond the retained LICENSE is claimed or disputed.
- **Historical commit references** found in the demo and reports (`12749ab…`, `fc80b14…`, `a891934…`, `25b6f97…`) do **not** exist in this branch (single-commit history) and were not found in the upstream repository checked on 2026-10-11. They are kept strictly as historical records, clearly labeled; demo source links point to this branch's current code instead.
- **Historical test reports** (`docs/testing/*-2026-10-0*.md`) were measured in the original project's environment. They are not re-verified by this branch; current branch status lives in `docs/testing/2026-10-11-community-onboarding.md`.

## Current branch checks — where the evidence lives

- `docs/testing/2026-10-11-community-onboarding.md` — clean-clone install (Node 22 / pnpm 9.15.9), executed checks with exit codes, screenshots, and unverified items.
