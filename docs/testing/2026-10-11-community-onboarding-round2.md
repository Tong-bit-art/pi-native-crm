# 第二轮 — 可复现测试与准确公开说明（2026-10-11）

> 任务单：`OPENCODE-SECOND-BATCH-2026-10-11.md`（任务 00–05）。复核：`REVIEW-FIRST-BATCH-2026-10-11.md` 的五项裁决。执行：OpenCode（DeepSeek）。
> 本文件只记录实际执行过的命令与输出；原始日志位于本机 `%TEMP%\opencode\`（仓库外），文件名在文中注明。

## 0. 逐项状态

| 任务 | 状态 | 摘要 |
| --- | --- | --- |
| 00 确认起点 | ✅ | HEAD=`14a37f2`、工作区干净、无他人改动；工具链补齐并验证 |
| 01 恢复最小泄漏回归样本 | ✅ | `tests/fixtures/agent-projection/`（2 份 JSON + README）；测试 20/20；缺失即失败 |
| 02 准确披露上游、保留命名守卫 | ✅ | ORIGIN 写入唯一 canonical URL；守卫矩阵 1 放行 + 5 拦截；branding 40/40 |
| 03 演示锁文件与工具配置允许列表 | ✅ | example `package-lock.json` 跟踪；干净克隆 `npm ci` + `npm test` 全过；根锁文件未动 |
| 04 修复四组同类路径扫描 | ✅ | 4 文件 33/33；四组负向控制全部命中并恢复 |
| 05 文案与 CI 依据 | ✅ | 英文首页去未证实措辞、首轮报告校准、CI 启用方案与 Topics/About 文本；最终全量见 §6 |

## 1. 执行环境（第二轮）

- Windows 11（NT 10.0.26200）；**Node v22.23.3**（规定环境，便携版）+ **pnpm 9.15.9**（corepack）。
- **工具链补齐**（任务 00 要求"确保测试子进程可见实际安装的 rg、Git 与必要 shell"）：
  - ripgrep **15.2.0**（官方 Windows 二进制，下载至 `%TEMP%\opencode\ripgrep`）；
  - Git for Windows 位于 `D:\Git`，其 `usr\bin`（grep/sed/awk/sh）与 `bin`（bash）在测试运行时置于 PATH 前部。
  - 未创建任何"恒返回成功"的 shim。系统级 PATH 未改动；仅测试运行的命令环境如此设置（见各命令）。
- 起点核对：HEAD=`14a37f2`、工作区干净、无他人改动；第一轮启动的演示服务保持运行并复用（未关闭他人进程）。
- 工具补齐带来的直接证据：此前无法运行的 `namespace-das-imagens` 现 **16/16 通过**；`branding` 的文件名扫描（`rg --files`）得以真实执行。

## 2. 各任务结果与提交

### 任务 01 — 最小泄漏回归样本　`ef46db1`

- **复现**：`pnpm exec vitest run tests/unit/projecao-conversador.test.ts` → exit 1；**3 failed / 17 passed**；三条失败均为 `evidência ausente`（`evidence/ia-360-w4/**`，第 1 轮有意未导入）。
- **提取**：从私有原始文件（`_excluded_backup\evidence\...\turnos\operador__7-automacoes-e-falhas.json` 与 `operador__9-quem-pode-mexer.json`）提取**必要的工具结果**，写入 `tests/fixtures/agent-projection/`（结构与 `tool_calls[].tool_calls[].result` 兼容）。
- **保留**：每条断言的正向控制——`unsafe_url:https_required` 错误码原样、UUID 形态的标识符（格式有效）。
- **脱敏**：全部 UUID → 固定虚构值 `f0000000-0000-4000-8000-…`；`final_text`、消息、期望、tokens、延迟、模型/版本等元数据不导入；自动化名称中性化。README 说明来源、裁剪与"非本分支重新测量"。
- **验证**：
  - 恢复后 **20/20 通过**；
  - 缺失即失败：临时改名 → exit 1（`amostra ausente: …`，两条依赖断言失败）→ 恢复 → 20/20；
  - 正向控制由测试自身断言（原始含错误码/UUID；投影后错误码与 UUID 消失、用户可读错误保留）。

### 任务 02 — 上游披露与命名守卫　`1d8b561`

- **ORIGIN.md**：写入唯一 canonical URL（作者后继仓库，2026-10-11 可访问性核对），明确它是本分支文件中**唯一被放行的出现**；原项目地址、MIT、导入事实保留。
- **branding.test.ts**：守卫新增**单 token、单文件、带 URL 边界**的例外——仅 `ORIGIN.md` 内容中等值匹配该精确 URL 的片段被剔除后再判定；术语仍以拆分构造（不落字面量）。
- **验证矩阵**（每步退出码 + 首条断言）：

| 场景 | 期望 | 实际 |
| --- | --- | --- |
| canonical URL 在 ORIGIN（基线） | 绿 | **exit 0，40/40** |
| 同一 URL 出现在**其他被跟踪文件** | 红 | exit 1（occurrences 命中） |
| ORIGIN 中 URL **带额外路径**（`/extra`） | 红 | exit 1 |
| ORIGIN 中**裸术语文本** | 红 | exit 1 |
| ORIGIN 中**错误域名**的 URL | 红 | exit 1 |
| **旧品牌文件名** | 红 | exit 1（`nomes` 命中 `zz-…-probe.txt`） |
| 全部恢复后 | 绿 | exit 0，40/40 |

- 附带检查：`documentacao` 4/4；`namespace-das-imagens` 16/16（镜像命名政策未动）。
- 说明：违规注入均使用**临时 staging 的被跟踪文件或可回滚的文件修改**，无残留（`git status` 仅目标文件）。

### 任务 03 — 演示锁文件与本地工具允许列表　`d5cb7e1`

- **生成**：example 子目录（Node 22 / npm）`npm install --package-lock-only` → `package-lock.json`（lockfileVersion 3，19,274 B）。未在根目录执行 npm，未动根 `package.json`/`pnpm-lock.yaml`。
- **.gitignore**：仅为 `/examples/chat-first-demo/package-lock.json` 加精确例外；`.codex/*` 与 `.cursor/*` 恢复忽略，仅逐文件放行 `.codex/hooks.json` 与 `.cursor/rules/pi-native-guias.mdc`（沿用仓库 `.claude` 的既有允许式样）。
- **忽略矩阵**（`git check-ignore --quiet --no-index` 退出码）：放行文件 3/3 `ignored=False`；`.codex/settings.local.json`、`.cursor/rules/other.mdc`、`.cursor/mcp.json`、根 `package-lock.json`、`bun.lock` → `ignored=True`。`git add` 锁文件被接受。
- **干净检出验证**（任务验收）：`git clone` 目录拉取本轮提交后 `npm ci` → exit 0；`npm test` → exit 0（**9/9**）；克隆内 `git ls-files` 显示锁文件已跟踪、根锁文件未跟踪；克隆工作区干净。
- 门禁：`skills-embutidas` + `repository-hygiene` → **116/116**；`git diff HEAD --stat` 仅 3 个文件（README/`.gitignore`/锁文件）。

### 任务 04 — 四组同类路径扫描　`2207f36`

- **复现**（任务单要求先复现）：4 文件 **4 failed / 29 passed**（与 Codex 参考一致，每文件 1 例）。
- **根因**：比较用的仓库相对路径在 Windows 呈 `\`（`readdirSync`+`join` 产出或 `path.relative` 返回），逐一与写死的 `/` 比较——失败均为形态问题，不是违规。
- **修复**（每处仅归一化"进入比较前"的表示；读取仍用原生路径；扫描根、扩展名过滤、排除与断言全保留）：
  - `confianca-do-handoff`：扫描器返回边界 + 违规诊断行；
  - `followups-de-demonstracao`：写入者列表与期望路径比较处；
  - `passagem-motivo-em-portugues`：`arquivo → código` 与 allowlist 比较处；
  - `rascunho-superado-nao-e-regravado`：调用者集合的正向控制处。
- **验证**：四文件 **33/33 通过**。
- **负向控制**（临时注入 → 必须红 → 恢复，实际结果）：

| 注入 | 结果 | 证据消息 |
| --- | --- | --- |
| `workers/ai-response-worker.ts` 追加 `payload.confidence ?? 0` | exit 1 | 违规行以 `/` 形式列出：`workers/ai-response-worker.ts:1104 … ?? 0` |
| demo 步骤改为无人写入的 `handoff_paused_zz` | exit 1 | “nenhum código que escreve a trilha grava "handoff_paused_zz"” |
| 屏幕文件追加 `requested_human` 字面量 | exit 1 | `components/connections/ChannelAiAccess.tsx → requested_human` |
| `_actions.ts` 追加无指针调用 | exit 1 | “o ponteiro veio `undefined` — a régua cai no palpite” |

- 注入全部通过 `git checkout --` 恢复；最终 `git status` 仅四个测试文件（其余为已提交内容）。
- **Linux**：本机无 Linux 环境 → 标注**待 Linux CI**（不在本机把 Windows 绿当作跨平台实测）。

### 任务 05 — 文案、CI 依据与材料

- **英文首页**：删除未实证的"完整端到端"表述与"真实后端本地可跑"的承诺，改为——源码包含相关模块、已验范围（静态预览 + 检查套件 + 干净克隆 `npm ci`）、完整实时链路"尚未在本分支复验"；审批/撤销只描述代码实际支持的动作类型。
- **README.md（中文）**：同步加注"本分支尚未复验完整实时链路"并链接第二轮报告；项目状态追加第二轮记录。
- **第一轮报告校准**：全量失败改为"执行者观察（非已证明结论）"；逐项表区分**已复现原因**与**待复现分类**；三个存疑测试更新为单独复跑结果；§10 五项裁决标记为已裁决并实施。
- **单独复跑（存疑三项）**（`r2-t05-retest.log`）：三项**仍失败**，各 1 例，最小报错：
  - `DiasBloqueados.test.tsx` — TestingLibrary 找不到 `/08\/10\/2026|10\/8\/2026/` 文本（日期/local 相关）；
  - `model-adapter.test.ts` — 对象形状 `to match object` 差异（`id: 'crm-test-model'`）；
  - `create-or-move-lead.test.ts` — `Hook timed out in 10000ms`。
  - 按要求**只报告，不修产品**；列为本轮"待复现分类"。
- **CI 启用方案（复用现有 `ci.yml`）与材料**：见 §5。

## 3. 本轮提交清单

| # | 提交 | 内容 |
| --- | --- | --- |
| 1 | `ef46db1` | 任务 01：投影样本恢复 |
| 2 | `1d8b561` | 任务 02：上游 URL 与守卫例外 |
| 3 | `d5cb7e1` | 任务 03：锁文件与允许列表 |
| 4 | `2207f36` | 任务 04：四组路径扫描 |
| 5 | 文档提交（含本报告与发布片段）：`git log --oneline 14a37f2..HEAD` 枚举 | 任务 05 |

## 4. 架构不变与兼容性

- 未触碰产品运行代码、数据库 schema / 迁移、依赖版本与服务拓扑；改动为**测试、文档、仓库配置与独立 example 资产**。
- 根 `package.json`、`pnpm-lock.yaml` 与安全 overrides 保持不动（任务 03 验证）；主项目包管理器仍为 `pnpm@9.15.9`。
- 测试保护力度：只增强可运行性，未删检查、未降断言、未扩豁免；四处修复均附负向控制。

## 5. GitHub 门面材料（供对外操作单；本轮不执行）

**CI 启用具体步骤（复用现有工作流，非子集替代）：**

1. 仓库 `Settings → Actions → General`：由 **Disabled** 改为 **Allow all actions and reusable workflows**。
2. 无需新增 secret 即可运行主检查：`ci.yml`（`push: main` + `pull_request`）在 GitHub 托管 runner（`ubuntu-latest`；`vars.EXECUTOR_PROPRIO` 未设置时自动如此）上执行——`GITHUB_TOKEN` 为自动提供，工作流已声明 `permissions: contents: read`，仅少数步骤以 `GH_TOKEN` 显式使用。
3. `ci.yml` 覆盖：**cercas 结构门**、typecheck、lint、channel 泄漏、role-rank、迁移号冲突、**完整 unit（2 片）**、`.changes` 容量、自托管 kit（bash）。`invariants` 矩阵在 runner 的 Docker 上跑 pgvector 容器（RLS/治理 + `test:db:update`）。
4. `e2e.yml`/`perf.yml`：同为托管 runner；e2e 起本地 Supabase（应用 `baseline.sql`）+ Redis，无外部 secret；perf 为构建体积。
5. 不启用：`release.yml`（需 `RELEASE_APP_ID/PRIVATE_KEY`，未配置，且为手动）、`relogio.yml`（需变量）、`publish-image.yml`（仅手动派发才推送镜像；PR 只构建）。`acolhida.yml` 有 owner 门，本仓库静默跳过。
6. **首绿规则**：第一个可用结果必须绑定真实 SHA 与 run URL；局部工作流通过只能标注为"部分检查通过"，不得挂"整体通过"徽章。当前状态：**未运行**。
7. 触发方式（复核后）：推送一个提交或开一个 PR 即可获得首轮结果；从本轮起避免为本机重复跑全量套件（改由 CI 承担）。

**About / Topics 最终文本（建议，待对外操作单执行）：**

- About（维持现状文本）：`Pi Native CRM — 以真实 CRM 为状态空间的 Agent 原生工作台：自托管、多租户、LGPD by-design，WhatsApp 原生。Open-source AI sales OS (MIT).`
- Topics：`crm`、`ai-agents`、`self-hosted`、`nextjs`、`supabase`、`mcp`。
- Homepage：**留空**（在线演示尚不存在，不放占位）。
- Release：**后置**。版本关系待整理：继承的 `CHANGELOG` 最高为 `1.41.0`（原项目历史），而根 `package.json` 为 `0.1.0`；本分支尚无版本号。切 Release 的前置：先完成本分支镜像/安装/发布链路（阶段 4）并明确版本从属关系。

## 6. 最终检查（冻结树上，Node 22 + pnpm 9.15.9，工具链就位）

| 命令 | 退出码 | 结果 | 日志 |
| --- | --- | --- | --- |
| `corepack pnpm typecheck` | 0 | — | r2-final-typecheck.log |
| `corepack pnpm lint` | 0 | — | r2-final-lint.log |
| `corepack pnpm test:unit`（全量，一次） | 1 | **1321 文件：19 failed / 1302 passed；12893 用例：28 failed / 12855 passed / 1 expected / 9 skipped** | r2-final-unit.log |

**与第一轮对照（同一台机器）**：第一轮 Node 24、工具链不全 → 30 文件 / 64 用例失败；本轮 Node 22 + rg/Git-bash/grep 就位 + 本轮修复 → **19 文件 / 28 用例**。第一轮 30 个中**已转绿 15 个**：documentacao、projecao、四组路径扫描、branding、namespace-das-imagens、painel-nao-promete-o-que-nao-cumpre（后三者为工具链就位后真实运行通过）、e2e-cria-o-dono、e2e-so-aceita、gerar-env-e2e-extensoes、invariants-so-aceita、knobs、performed-at-um-relogio。

**剩余 19 个失败文件逐项分类：**

| 组 | 文件 | 判定 |
| --- | --- | --- |
| 并发负载超时（**单跑已复验通过**） | `pi-runtime-architecture`（全树 I/O 扫描）、`pr-mexe-na-imagem`、`sem-marcador-de-conflito`、`lib/theme.test.tsx`（hook 10s） | 全量并发下 30s/10s 超时；前三者单独批次 3/4 文件通过（r2-final-flakes.log），theme 单跑 3/3（r2-theme-alone.log）；建议由 CI 复核（runner 资源更好） |
| bash/git/网络类（待复现分类） | `e2e-parte-4`、`executor-proprio`、`guarda-da-release-confere-identidade`、`guarda-da-release-reconhece-o-corte`、`imagens-ok`、`main-sem-migration-duplicada`、`release-chega-na-lp` | 涉及临时 git 仓库 / bash 脚本 / 网络（LP 检查）；工具就位后仍红，未逐一复现 |
| 内容类（待复现分类） | `indice-de-contato-ignora-ficha-mesclada`、`tailwind-tokens`、`lgpd-pdf-meet`、`lgpd-pdf-replies`、`gateway-destino-por-caminho` | 未逐一复现；pdfjs 的 Windows 路径现象已有记录 |
| 三个已知仍失败（§2-05 单独复跑） | `DiasBloqueados.test.tsx`、`model-adapter`、`create-or-move-lead` | 最小报错见 §2-05；待复现分类 |

## 7. 残余失败 / 未验证

- 全量最终失败 19 文件 / 28 用例，逐项分类见 §6：4 个为并发负载超时（单跑已复验通过）、7 个为 bash/git/网络类、5 个为内容类、3 个为已知单独复跑仍红。
- `painel-nao-promete-o-que-nao-cumpre` 在本轮终态中**已转绿**（工具就位后真实运行）——第一轮表已按此更新。
- Linux CI 未运行（待启用后由真实 runner 验证）。
- 便携 Node 22 zip 未做 GPG 校验（沿用第一轮未验证项）。

## 8. 需要 Codex 决策

1. 三个仍失败测试的处置：建议**先在 CI 复现**（`model-adapter` 的差异可能是真实缺陷；`DiasBloqueados` 疑测试对 locale 敏感；`create-or-move-lead` 的超时可能与本机负载有关），再决定是否进入产品修复轮。
2. CI 启用时机与"首绿"操作（§5 步骤 1–7 是否照此执行）。
3. 待复现分类（pdfjs ×2、gateway、painel、tailwind）是否列入下一轮的最小复现任务。
