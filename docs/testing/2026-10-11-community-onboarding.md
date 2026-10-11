# 社区入门轮次 — 干净克隆验证、Windows 修复与公开入口（2026-10-11）

> 任务单：`OPENCODE-FIRST-BATCH-2026-10-11.md`（任务 00 / 01 / 02）。执行：OpenCode（DeepSeek）。复核：Codex。
> 原则：本文件只记录实际执行过的命令与输出；失败与未验证逐项列明。原始日志保存在本机 `%TEMP%\opencode\`（仓库外），文件名在文中注明。

## 0. 逐项状态

| 任务 | 状态 | 摘要 |
| --- | --- | --- |
| 00 验证环境与证据 | 完成 | 干净克隆安装 / typecheck / lint / 五文件、演示访问与截图、example 检查、全量单测（含逐项归因） |
| 01 Windows 架构检查修复 | 完成 | 单点归一化 + 负向控制；主仓库与干净克隆均全绿；Linux 实跑标注待验证 |
| 02 公开入口与来源说明 | 完成 | README 三路径 + README.en + ORIGIN + CONTRIBUTING.en + 演示来源链接拆分；结构守卫冲突已处理并在 §10 上报 |

## 1. 执行环境

- 操作系统：Windows 11（NT 10.0.26200）。
- 系统默认 Node：v24.14.0（非规定环境）。为满足 `.nvmrc`（22），使用便携版 **Node v22.23.3**（nodejs.org 官方 zip，解压于 `%TEMP%\opencode\node22`；**未做 GPG 校验**，列为未验证项）。
- 包管理器：**pnpm 9.15.9**（经 corepack 解析 `packageManager` 字段；`corepack pnpm --version` → 9.15.9）。
- 干净克隆：`%TEMP%\opencode\clean-clone`（`git clone` 公开仓库；未继承任何 node_modules）。

## 2. 基线与提交

- 基线：`2bbe3c752b86e60aabf098cacc00c7c57eb0ccc5`（执行前核对：HEAD 一致、工作区干净、无他人改动）。
- 本轮提交：
  - `a1614bd` — 任务 01 修复（`tests/unit/pi-runtime-architecture.test.ts`）。
  - `534afa3` — 任务 02B 演示来源修正（`examples/chat-first-demo/**`）。
  - 文档提交（含本报告）：用 `git log --oneline 2bbe3c7..HEAD` 枚举；`git show 2bbe3c7 --stat` 查看导入。
- **未推送**：按任务单停在可审查状态；远端设置 / 发布 / 对外消息待 Codex 复核。

## 3. 改动文件与用途

| 文件 | 用途 |
| --- | --- |
| `tests/unit/pi-runtime-architecture.test.ts` | 任务 01：扫描器返回边界归一化为 `/`（+4/−2 行，无其他改动） |
| `README.md` | 三路径快速开始；克隆目录修正；历史记录加日期与范围；本分支记录；英文 / ORIGIN 入口 |
| `README.en.md`（新） | 英文入口：一句话 + 具体业务案例 + 状态 + 预览命令 + 截图 |
| `ORIGIN.md`（新） | 来源与分支状态：继承 / 本分支改动 / 待核实；保留 MIT 与原作者；不重述上游现名（见 §10-2） |
| `CONTRIBUTING.en.md`（新） | 英文贡献入口：最小预览、验证命令、贡献主题、PR 材料、规则 |
| `examples/chat-first-demo/README.md` | 源码基线措辞拆分：历史（原项目）vs 当前（本分支） |
| `examples/chat-first-demo/dist/{inspection,agent-services,demo-fixtures}.js` | 链接指向本分支导入提交；历史分支/基线以标注呈现 |
| `examples/chat-first-demo/tests/{inspection-dom,agent-services-dom}.cjs` | 断言更新为当前仓库地址；保留历史身份检查 |
| `examples/chat-first-demo/artifact-manifest.json` | 6 个变动文件的 sha256 同步 |
| `.gitignore` | 移除对 `.codex/`、`.cursor/` 的误排除（§10『与任务单不同的处理』） |
| `.cursor/rules/pi-native-guias.mdc`、`.codex/hooks.json` | 恢复（第 1 轮误排除；`skills-embutidas` 门禁要求随仓库发布） |
| `.changes/2026-10-11-onboarding-publico-e-check-no-windows.md`（新） | 发布片段：`nada_mudou`（对操作者无影响） |
| `docs/media/onboarding/{demo-workbench,demo-inspection}.png`（新） | 干净克隆演示截图（工作台首屏 + 检查面板） |
| `docs/testing/2026-10-11-community-onboarding.md`（新） | 本报告 |

## 4. 架构不变与兼容性

- **未触碰产品代码**：`app/`、`components/`、`lib/`、`workers/`、`supabase/` 与依赖版本 / 锁文件均无改动；无 schema、无迁移、无接口变化。
- 改动集合 = 1 个测试文件 + 文档 + 仓库配置（.gitignore / .changes / 演示资产）。
- 接口 / 数据兼容性：不适用（无接口变更）。回归证据：§5–§9 的测试结果；演示 DOM 套件 9/9 覆盖被改动的 dist 与测试断言。

## 5. 任务 00 — 实际命令与结果

### 干净克隆（Node 22.23.3 + pnpm 9.15.9）

| 步骤 | 命令 | 退出码 | 结果 | 日志 |
| --- | --- | --- | --- | --- |
| 克隆 | `git clone https://github.com/Tong-bit-art/pi-native-crm.git` | 0 | HEAD = 2bbe3c7 | — |
| 安装 | `corepack pnpm install --frozen-lockfile` | 0 | Done in 1m01s（pnpm 9.15.9） | install-clean.log |
| 类型检查 | `corepack pnpm typecheck` | 0 | 无输出 | clone-typecheck.log |
| Lint | `corepack pnpm lint` | 0 | 无错误 | clone-lint.log |
| 五文件（基线） | `corepack pnpm exec vitest run <五个文件>` | 1 | **25 通过 / 3 失败**；失败 = pi-runtime 三项（Windows 路径形态） | clone-five.log |
| 五文件（拉取 a1614bd+534afa3 后） | 同上 | 0 | **28/28 通过** | clone-five-final.log |
| 类型检查（拉取 79f0d38 后，终验） | `corepack pnpm typecheck` | 0 | 无输出 | clone-typecheck-final.log |
| Lint（拉取 79f0d38 后，终验） | `corepack pnpm lint` | 0 | 无错误 | clone-lint-final.log |
| 五文件（拉取 79f0d38 后，复跑） | 同上 | 0 | **28/28 通过** | clone-five-final2.log |
| example 依赖 | `npm ci` | 1 | **不可行**：example 的 `package-lock.json` 未被跟踪（§10-3） | examples-ci.log |
| example 依赖 | `npm install` | 0 | jsdom 30.0.1 + css-tree 3.2.1（精确版本） | examples-install.log |
| example 套件 | `npm test` | 0 | **9/9 PASS**（含 visual-style——Codex 参考中因缺 css-tree 未跑通的一项） | examples-test2.log |

主仓库侧同项（系统 Node 24）：五文件基线同为 **25/3**（five-baseline-main.log）；改动后的 example 套件同样 **9/9**（main-examples-test.log）；克隆拉取后 example 套件复跑 **9/9**（clone-examples-final.log）。

### 演示访问与截图

- **从干净克隆启动**：`node scripts/serve-agent-demo.mjs`（clone 目录，Node 22）→ `http://127.0.0.1:3008/` **HTTP 200**；浏览器实测加载成功（页面标题「Agent–CRM 工作台 · Pi Native CRM 演示」）。
- 服务端抽查：`GET /inspection.js` 返回的代码包含 `Tong-bit-art/pi-native-crm` 与当前提交 `2bbe3c752b…`——即**克隆提供的就是当前代码链接**。
- 截图（真实渲染，来自克隆服务）：`docs/media/onboarding/demo-workbench.png`（首屏，工具栏「更新检查 · 2bbe3c7」）、`demo-inspection.png`（检查面板「代码与配置」：历史分支 / 历史功能基线 12749ab 标注为原项目记录，当前代码基线 2bbe3c7…）。
- 与真实后端的区别（README 与页面内均有标注）：静态合成数据；不启动 Next.js / Supabase / worker / 模型；「真实模型录制」只做回放；持久化仅 localStorage；example 套件自述不构成真实后端或像素级验证。

## 6. 任务 01 — 修复与负向控制

- 改动（唯一）：`sourceFilesIn()` 返回边界 `split(sep).join("/")` 并加注释；目录允许范围、检测正则、违规拒绝、runtime seam 约束全部不变。
- 主仓库验证序列（每次单独运行该文件）：

| 场景 | 退出码 | 结果 |
| --- | --- | --- |
| 修复后（无夹具） | 0 | 17/17 通过 |
| 允许目录夹具（`lib/agent-runtime/pi/__nc-fixture-allowed.ts`，含 Pi import） | 0 | 17/17 通过（按设计被接受，证明 allowlist 未被扩大/缩小） |
| 违规目录夹具（`lib/contacts/__nc-fixture-forbidden.ts`，含 Pi import） | 1 | **被检出**：错误信息列出 `lib/contacts/__nc-fixture-forbidden.ts`（正斜杠形态——与 `/` 规则一致） |
| 清理夹具后 | 0 | 17/17 通过；`git status` 无残留 |

- 夹具为临时未提交文件，验证后删除；未修改生产逻辑、未放宽边界、未伪造通过。
- 干净克隆终验（规定环境）：五文件 **28/28**（§5）。
- **Linux CI 同一检查：未运行**（本机无 Linux）→ 标注待验证。该修复在 POSIX 上为恒等操作（`sep === "/"`）。

## 7. 任务 02 — 公开入口、来源与贡献者入口

- **02A 快速开始**：克隆目录修正（显式 `cd pi-native-crm`）；三条路径——①无密钥静态预览（1 分钟）②真实本地后端（约 60–90 分钟，macOS/Linux 与 Windows PowerShell 的环境文件命令分别给出，既有文件不覆盖）③生产自托管（状态明确：「本分支尚未完成独立发布链路」，不作开箱即生产承诺）。README.en.md 第一屏含一句话 / 具体业务案例 / 状态 / 预览命令 / 截图；在线演示**标记为未提供**，无占位链接。
- **02B 来源**：ORIGIN.md（原项目地址、MIT 与原作者保留、快照导入方式与日期、有意未导入清单、导入时脱敏、本分支改动与证据位置、待核实清单）。演示源码链接拆分：历史身份（`feat/chat-first-workbench-2026-10-01`、`12749ab…`、`fc80b14…`）以标注保留；可点击链接指向本分支当前代码。经 GitHub API 核实（2026-10-11）：`12749ab…` / `fc80b14…` / `a891934…` / `25b6f97…` **在本分支与上游现仓库均不存在**（HTTP 422）；`helsome/AiNativeCrm` 已 404。
- **02C 贡献者**：CONTRIBUTING.en.md（最小预览、验证命令、贡献主题、PR 材料、规则；葡语规范保留为参考）。
- **结构守卫核查**（发现与处理见 §10）：`documentacao-…`（报告创建后复跑通过，见 §9）；`skills-embutidas`（恢复门文件后 75/75）；`branding` 移除命名空间守卫（ORIGIN 改写，仍列为本轮需要 Codex 决策的冲突）。

## 8. 全量单测（主仓库，`pnpm test:unit`）

- 结果：**exit 1；1321 文件：30 failed / 1291 passed；12892 用例：64 failed / 12813 passed / 1 expected fail / 14 skipped**（main-test-unit.log，Node 24 环境）。
- 失败 = 15 个 cercas 文件 + 15 个 produto 文件。**执行者观察（非已证明结论）**：未发现由本轮改动引起的新失败——产品侧没有同环境同命令的"改前全量基线"；下表区分**已复现原因**与**待复现分类**，第 2 轮的复跑与修复结果见第二轮报告。

**cercas（15）**— 14 个与基线一致的环境类：`e2e-cria-o-dono`、`e2e-parte-4`、`e2e-so-aceita`、`executor-proprio`、`gerar-env-e2e-extensoes`、`guarda-da-release-*`（×2）、`imagens-ok`、`indice-de-contato`、`invariants-so-aceita`、`knobs`、`main-sem-migration`、`performed-at-um-relogio`、`release-chega-na-lp`（bash/WSL、grep/rg 缺失、Windows 分隔符、超时）；第 15 个 = `documentacao`（当时缺少本报告——创建后复跑通过，§9）。

**produto（15，本机首次全量运行）**：

| 文件 | 归因 |
| --- | --- |
| `branding` | **已复现**：`spawnSync rg ENOENT`（本机无 ripgrep）；内容半部独立核验：`git grep -i -F -e <禁词>` = 0 命中 |
| `namespace-das-imagens` | **已复现并已复跑通过**（第 2 轮补齐 Git for Windows 的 bash/grep 后 16/16） |
| `lgpd-pdf-meet` / `lgpd-pdf-replies` | **已复现现象**：pdfjs-dist 在 `.pnpm` Windows 路径下 `Invalid factory url`；修复留待裁决 |
| `gateway-destino-por-caminho` | **待复现分类**（疑 pdfjs 级联，未单独隔离确认） |
| `projecao-conversador` | **已裁决并修复**（第 2 轮）：恢复最小脱敏样本 `tests/fixtures/agent-projection/`，20/20 通过 |
| `painel-nao-promete-o-que-nao-cumpre` | **待复现分类**：扫描在 Windows 失效（控制正例为 0），级联误报 |
| `confianca-do-handoff` / `followups-de-demonstracao` / `passagem-motivo` / `rascunho-superado` | **已修复**（第 2 轮）：四组路径归一化，33/33 通过（含负向控制） |
| `tailwind-tokens` | **待复现分类**（本轮未复现） |
| `DiasBloqueados.test.tsx` | **第 2 轮单独复跑：仍失败**；最小报错：TestingLibrary 找不到 `/08\/10\/2026|10\/8\/2026/` 文本（日期 / 本机 locale 相关）——待复现分类，未修 |
| `model-adapter` | **第 2 轮单独复跑：仍失败**；最小报错：对象形状 `to match object` 差异（id `crm-test-model`）——待复现分类，未修 |
| `create-or-move-lead` | **第 2 轮单独复跑：仍失败**；最小报错：`Hook timed out in 10000ms`——待复现分类，未修 |

- 未执行：`test:db`（需 Docker）、`test:e2e`、`test:shell`、`build`（超出本机验证范围，按任务单留给后续阶段）。
- 未验证：Linux CI 实跑；便携 Node 22 zip 的 GPG 校验。

## 9. 定向检查与结构门（最终状态）

| 命令 | 退出码 | 结果 |
| --- | --- | --- |
| `pnpm exec vitest run`（fragmentos-de-release + repository-hygiene + skills-embutidas + agents-md-versoes） | 0 | **161/161 通过** |
| `pnpm cercas`（报告创建前） | 1 | 15 failed / 126 passed 文件；37/1386 失败（含 `documentacao`，预期） |
| `pnpm exec vitest run tests/unit/documentacao-aponta-para-o-que-existe.test.ts`（报告创建后复跑） | 0 | **4/4 通过**（README 链接的验证报告已存在） |
| `pnpm cercas`（报告创建后复跑） | 1 | **14 failed / 127 passed 文件；36/1386 失败**——恰为已知的 14 个环境类文件（与基线集合一致；任务 01 修复项与 `documentacao` 均已转绿） |
| `pnpm release:conferir` | 0 | 片段集有效（含本轮片段；`nada_mudou`） |
| `pnpm lint:channels` | 0 | ok（62 已知债务，无新增） |
| `pnpm lint:role-rank` | 0 | ok |

## 10. 需要 Codex 决策 / 与任务单不同的处理

1. **`projecao-conversador`（依赖 evidence/）** — ✅ **已裁决并实施（第 2 轮）**：恢复最小脱敏样本、保留测试。
2. **ORIGIN 与「移除命名空间」守卫的冲突** — ✅ **已裁决并实施（第 2 轮）**：ORIGIN 写入唯一 canonical URL；守卫仅对精确 token、仅在该文件放行，其余形态继续拦截。
3. **example 锁文件** — ✅ **已裁决并实施（第 2 轮）**：跟踪 `examples/chat-first-demo/package-lock.json`；干净克隆 `npm ci` 通过。
4. **其余扫描类测试** — ✅ **已裁决并实施（第 2 轮）**：四组同类路径扫描修复；PDF / 日期 / 对象形状 / 超时保留为待复现分类。
5. **GitHub About / Topics / Release / CI** — 第 2 轮交付 CI 启用方案与最终文本（第二轮报告）；远端操作待对外操作单。

**与任务单不同的处理（已执行，供复核）**：
- 恢复 `.cursor/rules/pi-native-guias.mdc` 与 `.codex/hooks.json`（第 1 轮清理过度排除；`skills-embutidas` 明确要求其随仓库发布），并从 `.gitignore` 移除对应两行——修复后该门禁 75/75。
- ORIGIN.md 措辞遵守移除命名空间守卫（§10-2）。

## 11. GitHub 界面材料（建议，未执行）

- **About**：双语描述已设置（现状描述）；homepage 建议暂空（无在线演示，不占位）。
- **Topics 建议**：`crm`、`ai-agents`、`self-hosted`、`nextjs`、`supabase`、`mcp`、`whatsapp`。
- **演示链接**：暂无在线演示——待静态演示发布后填写。
- **CI 证据**：仓库 Actions 当前为**禁用**状态（导入轮的防红叉措施）；本提交没有产品 CI 运行记录（仅 2 条 Dependabot）。第 2 轮交付了复用现有 `ci.yml` 的启用方案（含 runner / 工具 / secret 依赖与全量范围声明，见第二轮报告 §5）；启用后首个绿色运行须绑定真实 SHA 与 run URL 才能挂徽章。
- **Release**：暂无 tag / release；建议在阶段 4（本分支发布链路）完成后切首个版本。

## 12. 来源说明中的待核实清单（与 ORIGIN.md 一致）

- 继承内容的逐文件作者归属：未恢复上游历史，除 LICENSE 外不做声称。
- 历史提交引用（`12749ab…` / `fc80b14…` / `a891934…` / `25b6f97…`）：本分支与上游现仓库均无（已核实）；仅作历史记录保留。
- 历史测试报告（`docs/testing/*-2026-10-0*`）：原项目环境测量，本分支未复验。

## 13. 关键复现命令

```bash
# 干净克隆与基线
git clone https://github.com/Tong-bit-art/pi-native-crm.git && cd pi-native-crm
corepack pnpm install --frozen-lockfile
corepack pnpm typecheck && corepack pnpm lint
corepack pnpm exec vitest run lib/ai/agents/approved-workbench-tool.test.ts \
  lib/ai/agents/workbench-job-lease.test.ts lib/ai/agents/mission-budget.test.ts \
  lib/agent-runtime/pi/workbench-result-submission.test.ts tests/unit/pi-runtime-architecture.test.ts

# 演示（无密钥）
node scripts/serve-agent-demo.mjs          # http://127.0.0.1:3008/#/app/ai/workbench

# example 套件
cd examples/chat-first-demo && npm install && npm test

# 本轮定向门禁
pnpm exec vitest run tests/unit/fragmentos-de-release.test.ts tests/unit/repository-hygiene.test.ts \
  tests/unit/skills-embutidas.test.ts tests/unit/agents-md-versoes.test.ts
pnpm cercas && pnpm release:conferir && pnpm lint:channels && pnpm lint:role-rank
```
