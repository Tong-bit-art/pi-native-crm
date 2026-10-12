# 第三轮 — 确定性测试与真实 Linux CI（2026-10-11/12）

> 任务单：`OPENCODE-THIRD-BATCH-2026-10-11.md`。复核：`REVIEW-SECOND-BATCH-2026-10-11.md` 的四项裁决。执行：OpenCode（DeepSeek）。
> 本文件只记录实际执行过的命令与输出；原始日志位于本机 `%TEMP%\opencode\`（仓库外）与 CI run 链接中。

## 0. 逐项状态

| 任务 | 状态 | 摘要 |
| --- | --- | --- |
| 00 起点与审查分支 | ✅ | 从 `afeea26` 建 `community/reproducible-checks`，合并已前进的 `origin/main`（干净），他人分支未动 |
| 01 URL 例外的完整 token 边界 | ✅ | 先红（4 形态嵌入被原谅）后绿；矩阵永久化；57/57 |
| 02 env 解析与模型隔离 | ✅ | `parse-test-env`（parseEnv + 测量过的空格边界）；模型逐案隔离 + 优先级；三种环境均稳定 |
| 03 日期测试 locale | ✅ | 先复现（zh-CN）后绿；spy 保持真实日期参与格式化；6/6 |
| 04 启用验证 CI + 分支 + Draft PR + Topics | ✅ | vigia/relogio 先禁用；Actions 开启；分支推送；**Draft PR #8**；Topics 六项；首轮 CI 结果见 §4 |
| 05 CI 残余失败最小复现 + 修复 | ✅ | 六处确定性缺陷已修：`rg`×2（§5.1）、`GITHUB_REF` 与 `lint:channels`（§5.5）、Kit 的 `loop/hooks` 与 README 跨平台调用（§5.6）；镜像 tag 不匹配与 e2e 两项留裁决（§5.2–5.3）；Windows 残留全部在 Linux 通过（§5.4） |

## 1. 起点、远端现状与工具

- 本地起点 `afeea26`（前两轮成果）。**远端 main 已前进**到 `82c60c1`：Dependabot PR #1（42 项 minor/patch，含 jsdom 30.1.2）、#4（@types/jest 30）已合并，另有 jsdom 回归规避提交 `0267567`（只动 `tests/unit/upload-templates-media-security.test.ts`）。#2/#5/#6/#7 仍开放（未动）。
- 本地还存在其他会话的分支（`pr1-fix`、`verify/accepted-1-4`、`verify/deps-2026-10-11`）——**均未纳入、未修改**。
- 审查分支从 `afeea26` 建立后 **合并 `origin/main`**（`a91f044`，无冲突，`git merge-tree` 预演验证）——PR 的差异因此只含本轮成果。合并后 `pnpm install --frozen-lockfile` 同步依赖（vite 8.3.0→8.3.3 等）。
- 测试子进程可见：ripgrep 15.2.0（官方二进制）+ Git for Windows（`D:\Git` 的 bash/grep 位于 PATH 前部）；未改系统 PATH、未改用户 `.env`。
- **fork 陷阱（安全相关）**：本仓库配置了 `upstream` 远端，`gh` 的 PR 类命令默认解析到**上游仓库**；本轮所有远端操作均显式 `-R Tong-bit-art/pi-native-crm` 或显式 API 路径。

## 2. 任务 01–03：结果与证据（均先红后绿）

### 01 — 来源例外的完整 token　`ba57e0f`

- 永久矩阵加入后的**红**：旧实现只查右边界，`作为路径 / 作为 query 值 / 作为 fragment / 粘在标签后` 4 个负例被原谅（`4 failed / 53 passed`）。
- 修复：双边界 + 内容解析（grep 前缀先剥离）；PASS 6 形态全过；FAIL 10 形态 + 同 URL 在别的文件全拦。
- 终态：branding **57/57**；与 `documentacao`、`namespace-das-imagens` 合计 **77/77**。ORIGIN.md 措辞同步（"extended or embedded URLs"）。

### 02 — env 解析与模型隔离　`cc73248` + `4357ef3`

- 复现的缺陷形态：`.env.local`（从 example 复制）里 `OPENROUTER_BASE_URL=    # vazio = …`，旧解析器把注释当值；模型测试曾以该文本为 endpoint。
- 新模块 `tests/setup/parse-test-env.ts`：`node:util.parseEnv`（Node 22 内置）+ 逐行 `trimEnd`——**测量过**的边界：`"A=   \nB=valor"` 在裸 parseEnv 下会变成 `A="B=valor"`。
- `vitest.setup.ts` 改用该模块，保留既有优先级（进程 > `.env` > `.env.local`）；`parse-test-env.test.ts` 固定 10 条输入矩阵。
- `model-adapter.test.ts`：逐案隔离 `OPENROUTER_BASE_URL`，补优先级用例（env 胜默认、binding 胜 env、空白 env 落默认、override 仅限 OpenRouter）；**生产 adapter 未动**。
- 三种环境实测：正常 **12/12**；虚构 override **12/12**；缺陷文本注入 **12/12**。模板点 **7/7**。
- `4357ef3`：`parseTestEnv` 过滤 `undefined`（首轮 typecheck TS2322，修后 typecheck=0）。

### 03 — 日期测试固定 locale　`e36be74`

- 复现：本机 locale `zh-CN` → 渲染 `2026/10/8`，断言只接受 `08/10/2026|10/8/2026` → `1 failed / 5 passed`。
- 修复：测试内 spy 固定 **pt-BR**，仍格式化真实日期（无常量 Date、无万能正则）；`afterEach` 还原。业务断言原样。
- 终态：**6/6**。

## 3. 推送前本地整体检查与推送后补充修复

| 检查 | 结果 |
| --- | --- |
| `typecheck`（Node 22） | **exit 0** |
| `lint`（Node 22） | **exit 0；456 warnings / 0 errors**（如实记录，未清 warning） |
| 20 文件定向验收批 | **336/336** |
| `pi-runtime-architecture` 单独 | **17/17** |
| （§5.1 的 rg 修复）无 rg 环境复现 | branding+knobs **3 failed / 57 passed**（与 CI 相同形态） |
| （§5.1 的 rg 修复）修复后 | **60/60**（无 rg 环境）；正常环境 **60/60**；文件名负向探针仍命中 |

发布片段：`.changes/2026-10-11-rodada3-cercas-deterministicas.md`（`nada_mudou`）。

## 4. 任务 04：远端操作与 CI 首轮结果

### 只读复核与执行（操作前核对 → 按授权执行 → 读回）

| 操作 | 命令（显式 -R / 显式 API 路径） | 读回 |
| --- | --- | --- |
| 禁用调度评论工作流 | `PUT actions/workflows/vigia-de-colisao.yml/disable` | `disabled_manually` ✅ |
| 禁用时钟工作流 | `PUT actions/workflows/relogio.yml/disable` | `disabled_manually` ✅ |
| 开启 Actions | `PUT actions/permissions {"enabled":true}` | `{"enabled":true,"allowed_actions":"all"}` ✅ |
| 推送审查分支 | `git push -u origin community/reproducible-checks` | `[new branch]`（仅该分支，main 未动） |
| 创建 Draft PR | `gh pr create -R Tong-bit-art/pi-native-crm --draft --base main --head community/reproducible-checks` | **https://github.com/Tong-bit-art/pi-native-crm/pull/8** |
| 设置 Topics | `PUT topics {"names":[…]}` | `ai-agents, crm, mcp, nextjs, self-hosted, supabase` ✅ |

只读复核（操作前）：工作流 9 个（含 `release`/`publish-image`/`relogio`/`vigia-de-colisao`）；仓库变量 **0**（`EXECUTOR_PROPRIO` 未设 → 托管 runner）；`enabled=false`。release / publish-image 保持原手动事件，未派发；未合并、未发布、未评论。

### CI 首轮结果（head `4357ef3`，pull_request 事件）

| Workflow | 结论 | Run URL | 备注 |
| --- | --- | --- | --- |
| ci | ❌ failure | https://github.com/Tong-bit-art/pi-native-crm/actions/runs/38200062003 | **invariants 全部 ✅**（含 pg17 矩阵）；`verify-parte (1)` 仅 "Cercas estruturais" 一个文件失败；`verify-parte (2)` 仅一个文件失败（根因见 §5.1） |
| e2e | ❌ failure | https://github.com/Tong-bit-art/pi-native-crm/actions/runs/38200061979 | 五个 parte 全部失败：存在红色 spec + 被 30 分钟预算截断（exit 124，准备 5–6 分钟）（§5.3） |
| perf | ✅ success | https://github.com/Tong-bit-art/pi-native-crm/actions/runs/38200062030 | 3m33s |
| publish-image | ❌ failure | https://github.com/Tong-bit-art/pi-native-crm/actions/runs/38200062016 | 背景镜像（worker/scheduler/voice）✅；app 镜像构建 ✅；冒烟步骤因 tag 不匹配失败（§5.2）；`build-and-push`/`promover-stable` 按 PR 语义跳过（不推送） |
| acolhida | ⏭ skipped | https://github.com/Tong-bit-art/pi-native-crm/actions/runs/38200062022 | owner 门，符合预期 |

- PR #8：`draft=true`、`mergeable=true`、`mergeable_state=unstable`；head `4357ef3`、base `82c60c1`、**merge SHA `c28617638855ba5d366b322ad51cb6ef183040b5`**（pull_request 运行测 merge 构建；run 的 head 字段记录分支尖端）。
- 未运行：release（手动专属）、vigia/relogio（已禁用）。无取消。
- **关键结论**：cercas 在 Linux 上 **1384/1386 通过**（唯一失败 = `knobs`），unit 分片 **5869/5870 通过**（唯一失败 = `branding`）——两个失败同一根因（runner 无 `rg`，§5.1）；**前两轮的全部修复已在 Linux 上通过**。

### CI 第二轮结果（head `53500b1`，修复 rg 后）

| Workflow | 结论 | Run URL | 备注 |
| --- | --- | --- | --- |
| ci | ❌ failure | https://github.com/Tong-bit-art/pi-native-crm/actions/runs/38202330049 | **cercas ✅ / typecheck ✅ / lint ✅ / unit parte 2/2 ✅**；新暴露下游两处（§5.5）：`Channel provider leak` ❌ 与 `Kit self-host (bash)` ❌ |
| e2e | ❌ failure | https://github.com/Tong-bit-art/pi-native-crm/actions/runs/38202330082 | 与首轮同类（红 + 预算） |
| perf | ✅ success | https://github.com/Tong-bit-art/pi-native-crm/actions/runs/38202330044 | |
| publish-image | ❌ failure | https://github.com/Tong-bit-art/pi-native-crm/actions/runs/38202330054 | 同 §5.2 的 tag 不匹配 |

- 通过 `--failed` 定向重跑确认两处红为**确定性**（同步骤、同断言、同 SHA）。
- **步骤级事实（重要）**：`verify-parte (1)` 在 `lint:channels` 失败后，其后的 Role rank / Colisão de migration / 主树检查 / **Unit parte 1/2** / `.changes` / Kit **全部被 skip**——这些步骤在修复前**从未在 CI 上运行过**；`verify-parte (2)` 走到了 unit 2/2 ✅ 与 Kit ❌。下一轮 CI 将首次真正测量被 skip 的步骤。

### CI 第三轮结果（head `659b897`，rg/lint/GITHUB_REF 修复后）

| Workflow | 结论 | Run URL | 备注 |
| --- | --- | --- | --- |
| ci | ❌ failure | https://github.com/Tong-bit-art/pi-native-crm/actions/runs/38205435107 | **`verify-parte (1)` 全绿**（cercas、typecheck、lint、`lint:channels`、Role rank、Colisão、主树检查、**Unit 1/2 首次执行**、`.changes`）；`verify-parte (2)` 在 Kit 的 `guard-hooks-atualizados`（7/7）失败——`colisao-de-migration` 已 **102/102 绿**（GITHUB_REF 修复在 CI 得到验证） |
| e2e | ❌ failure | https://github.com/Tong-bit-art/pi-native-crm/actions/runs/38205435104 | 同前（红 + 预算） |
| perf | ✅ success | https://github.com/Tong-bit-art/pi-native-crm/actions/runs/38205435144 | |
| publish-image | ❌ failure | https://github.com/Tong-bit-art/pi-native-crm/actions/runs/38205435113 | 同 §5.2 |

## 5. 任务 05：CI 残余失败最小复现与修复

### 5.1 已修：两个 `rg` 依赖（跨平台根因）

- CI 证据：`branding.test.ts` 文件名扫描 `spawnSync rg ENOENT`；`knobs-…test.ts` 的 `consumidoresDe` 因 rg 缺失被 catch 成空列表 → "nem o system_prompt foi encontrado" + 28 个孤儿字段。均**确定性、两平台同因**（本机此前也红——当时缺 rg；装上 rg 后本机变绿掩盖了它）。
- 本机复现（模拟 CI：PATH 去掉 ripgrep）：branding+knobs = **3 failed / 57 passed**，与 CI 完全同形。
- 修复（单主题）：文件名扫描改 `git ls-files -z`；`consumidoresDe` 改 `git grep -l -F`（扩展名过滤移到 JS）。git 在任何 checkout 都可用，且守卫的目标本就是"被跟踪的文件"。
- 验证：无 rg 环境 **60/60**；正常环境 **60/60**；负向控制（staging 一个带旧品牌词的文件名）仍精确命中并恢复；提交 `4332945`（本报告提交前的修复提交）。
- 对既有清单的更正：第一/二轮把 `knobs` 记作"扫描在 Windows 失效"、把 `branding` 记作"rg 缺失（环境类）"——正确表述是**两个测试对 rg 的硬依赖在无 rg 的 runner 上确定性失败**；两平台同因，现已修复。

### 5.2 已确认缺陷、未修（需要裁决）：publish-image 的 tag 不匹配

- CI 证据：构建步骤产出 **`pi-native-crm-smoke:pr`**（`publish-image.yml:321`），冒烟步骤运行 **`pi-native-smoke:pr`**（`:341`，PDF 探针同样 `:397`）→ "Unable to find image locally" → 尝试 pull → `pull access denied` → exit 125。
- 确认：不一致存在于**快照文件本身**（本轮未改过该工作流）。
- 最小修复提案：将 `:341` 与 `:397` 的引用改为 `pi-native-crm-smoke:pr`（两行，属 packaging 域，等待裁决后实施）。

### 5.3 e2e：红色 spec + 30 分钟预算

- 五个 parte 均在 30 分钟上限被截断（exit 124；准备耗时 5–6 分钟），且**截断前已有红色**（工作流自带的哨兵消息："o corte veio … mas a suíte NÃO estava só grande"）。
- parte 1 的红色样例（完整清单在 run 日志）：`error-pages.spec.ts`（404/500/503 ×3）、`followup-linguagem`、`followup-ramos`、`importar-leads-planilha`、`inbox-responder-citando`（×2，各 30s）、`invite-lifecycle`、`j20-elegibilidade-atendimento-manual` 等。
- 判定：规格断言类问题 + 预算不足并存；**不属本轮测试/辅助脚本修复范围**，留给 Codex 裁决（产品行为对照 / 分片预算）。

### 5.4 Windows 残留清单与 Linux 对照（全部平台类）

| 文件 | Windows 最小报错 | Linux（CI） |
| --- | --- | --- |
| `e2e-parte-4-fala-com-os-servicos-do-runner` | bash 吞路径（中文用户名 + `\`）：`No such file` | ✅ 通过（cercas 绿） |
| `executor-proprio-so-roda-o-que-e-nosso` | guard exit 1 vs 0 | ✅ 通过 |
| `guarda-da-release-confere-identidade` | guard exit 0 vs 1 | ✅ 通过 |
| `guarda-da-release-reconhece-o-corte` | `(nenhuma decisão)` vs `sim` | ✅ 通过 |
| `indice-de-contato-ignora-ficha-mesclada` | `expected false to be true` | ✅ 通过 |
| `lgpd-pdf-meet` / `lgpd-pdf-replies` | pdfjs 6.4.299 在 `.pnpm` Windows 路径 `Invalid factory url` | ✅ 通过 |
| `release-chega-na-lp` | 单测 30s 超时 | ✅ 通过 |
| `tailwind-tokens` | 断言命中 2 处 | ✅ 通过 |
| （此前还有 `imagens-ok` / `main-sem-migration` / `gateway`） | 第 2 轮红 → 本轮已自愈 | ✅ 通过 |

- 负载/hook 敏感组（`pi-runtime-architecture`、`pr-mexe-na-imagem`、`sem-marcador-de-conflito`、`lib/theme.test.tsx`、`create-or-move-lead`）：本机全量下曾超时（含全局 afterEach 10s）；受控 `--maxWorkers=1` 复跑记录在案；**Linux CI 全部通过**。未统一加超时、未加自动重试、未跳过任何失败。

### 5.5 二轮 CI 揭示的两处（已修，均先红后绿）

**a) `lint:channels` — 注释里出现 provider 名　`929b0fa`**

- CI：`verify-parte (1)` 在 `Channel provider leak` 步骤失败；唯一违规 = `lib/agent-runtime/pi/model-adapter.test.ts` 第 10 行——这是 02 里我写的注释，引用了含 provider 名的测试文件路径（`tests/unit/canal-…-base-url-vazia.test.ts`）。
- 本机复现：`pnpm lint:channels` exit 1，同一行。该棘轮**故意不区分注释与代码**（脚本自己的说明：分离会产生别类的假阴性）。
- 修复：注释改指"测试 irmão（文件名后缀 `-base-url-vazia.test.ts`）"，不写 provider 名。
- 验证：修复后 `pnpm lint:channels` = exit 0（"62 arquivos de dívida conhecida, nenhum novo"）。

**b) `colisao-de-migration` — 测试继承了 runner 的 `GITHUB_REF`　`96228e3`**

- CI：`Kit self-host (bash)` 里 `colisao-de-migration: 1 de 102 casos vermelhos`；唯一失败断言 = 用例 18 的 `NÃO MEDIDO: #8`。
- 根因：gate 用 `${GITHUB_REF:-}`（`refs/pull/N/merge`）把"自己的 PR"剔出开放列表；测试脚本控制了所有输入（fake gh、夹具 PR 7/8/9/11）却**没有中和这一环境变量**——CI 上 `GITHUB_REF=refs/pull/8/merge`（正是本 PR！）使 #8 被当作"自己的 PR"剔除。卖家 CI 的 PR 编号在 1300+，从未撞上夹具号码，所以该泄漏从未被发现。
- 复现（本机）：`GITHUB_REF=refs/pull/8/merge bash tests/shell/colisao-de-migration.test.sh` → `1 de 102`（与 CI 同一断言）。
- 修复：隔离区 `unset GITHUB_REF`（含测量注释）。其余 shell 测试不读 `GITHUB_*`。
- 验证：修复后带/不带该变量均 **102/102**。

### 5.6 三轮后 Kit 的剩余阻塞（已修：`loop/hooks` 与 README）

**a) `guard-hooks-atualizados` 7/7 红 → `loop/hooks` 恢复　`71c523a`**

- 根因：清洁副本把 `loop/` 整目录排除（`.gitignore` `/loop/`），而 `tests/shell/guard-hooks-atualizados.test.sh` 与 `hooks-nao-acusam-a-main.test.sh` 直接拷贝 `$RAIZ/loop/hooks/` 的脚本——本机与 CI 都没有它。**上游公开仓库经只读 API 核对就是公开跟踪 `loop/hooks/` 的**，且 `CONTRIBUTING.md` 等公开文档以它为主语；脚本无 PII、无旧品牌词。
- 处理：恢复快照版 8 个脚本（来自 `_excluded_backup/loop/hooks`，即当年被排除的原件）；`.gitignore` 的买家说明区由 `/loop/` 收窄为 `/loop/*` + `!/loop/hooks/`；`loop/` 其余内容（checkpoints、INBOX、LOOP.md）继续不发布。
- 验证：`guard-hooks-atualizados` **7/7**（此前 7/7 红）；`hooks-nao-acusam-a-main` 128 用例，15 项本机红全部为 Windows 环境类（`core.filemode=false` 的 MODO/COMENTARIO-MODO、文件名含 `"` 的 CITADO、`python3` 为 Store 存根使夹具空转的 F-A/F-B+/F-BIG+）——Linux 实测待第四轮 CI。
- 插曲：品牌守卫当场抓住我在 `.gitignore` 注释里直写上游仓库名（含旧品牌词）；注释改写后 branding **57/57**——守卫按预期工作。

**b) README 缺"跨平台调用" → 平台无关的真红（已修　`c3f79ae`）**

- `instalar-guias.test.sh` 断言 `README.md` 含 `$pi-native-instalar` 且无 `digite …/pi-native-` 形式；快照导入以来 README 从未有过该子串（`git log -S` 为空）——CI 上同样会红。
- 修复：README.md 增加"内置助理指南（Skills）"小节，措辞全部取自仓库既有原文（`scripts/instalar-guias.sh:275`、`hostgator-setup-kit/README.md:16`、`AGENTS.md`）。
- 验证：该用例转绿（本机 10→9 红）；其余 9 项为 symlink 类（Git Bash 的 `ln -s` 退化为拷贝）；`extensao-nao-instala` 的 2 项为无 `jq`——均为 Windows 本机类（CI 有 symlink 与 jq）。

## 6. 与验收对照

- 任务 01–03 断言未弱化；末段两处修复（§5.5）同样先红后绿，未弱化任何断言；样本与根依赖约束未变（本轮提交未改 `package.json`/`pnpm-lock.yaml`/overrides，仅合并 main 既有 bump）。
- 工作区无临时违规、无真实配置残留（探针均清理；`tests/fixtures/agent-projection` 为已审查样本）。
- Draft PR 与真实 run URL：§4；runner/权限问题未发生（托管 runner 启动正常）。
- 整体状态：**未宣称整体通过**——ci 的 invariants 全绿、cercas/unit 各剩一处已修（待下一轮 CI 复验）；e2e 与镜像两项确认缺陷待裁决。

## 7. 需要 Codex 决策 / 下一步

1. **第四轮复验**：第三轮（`659b897`）已把 `verify-parte (1)` 全部跑绿（含首次执行的 Unit 1/2）；part 2 的 Kit 随后又暴露两处（§5.6，已修：`71c523a` 恢复 `loop/hooks`、`c3f79ae` README 指南小节）。第四轮 CI（head 为随后推送的新 SHA）将首次在 Linux 上测量 `hooks-nao-acusam-a-main`、`instalar-guias` 的 symlink 组、`extensao-nao-instala` 等此前从未跑到的用例；不预设全绿。
2. **publish-image tag 不匹配**（§5.2）：是否按最小提案修两行（packaging 域）。
3. **e2e**（§5.3）：红色 spec 列表的处置（产品对照 vs 分片预算调整）不在本轮范围，请裁决下一轮范围。
4. **负载/hook 组**：Linux CI 全绿 + 本机受控记录在案 → 建议按"Windows 平台/负载类"归档，不再列为待复现产品问题。
5. PR #8 保持 Draft，等待上述裁决后决定合并节奏。
