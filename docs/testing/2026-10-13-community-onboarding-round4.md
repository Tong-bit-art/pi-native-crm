# 第四轮 — e2e 共同前置契约：入口 `/app` 与匿名错误页语言（2026-10-13）

> 任务单：`OPENCODE-FOURTH-BATCH-2026-10-12.md`。复核：`REVIEW-THIRD-BATCH-2026-10-12.md` 的四项裁决。执行：OpenCode（DeepSeek）。
> 本文件只记录实际执行过的命令与输出；本地日志在仓库外（`%TEMP%\opencode\r4-*.log`），CI 证据为 run URL 与工件（error-context 已下载核对）。

## 0. 逐项状态

| 任务 | 状态 | 摘要 |
| --- | --- | --- |
| 00 同树与证据复用 | ✅ | head `31b546f`、工作区干净；采纳 Codex 的分片分类修正（part-4 = 11 pass / 1 fail / 1 未运行、exit 1；part-1 = 红存在后 exit 124） |
| 01 入口判定 helper | ✅ | `76a15c6`：`isAppEntryUrl` / `waitForAppEntry`；TDD 红 → 绿 23/23 |
| 02 "登录成功"判定全量替换 | ✅ | `9699395`：52 处逐处审查 + 5 处归并；typecheck 0 / lint 0（456 warnings 同基线） |
| 03 匿名错误页语言契约 | ✅ | `c187c71`：404/500/503 → zh-CN 精确字符串 + 路径守卫 + 返回链接；403/legal 原样 |
| 04 一次同树测量与交回 | ✅ | 推送 `31b546f..27266cd`（4 提交）；测量见 §5；测量后又补三处同型修复（§6）并随本报告推送 |

## 1. 起点、分类修正与环境

- 树：head `31b546f`（PR #8、Draft）；工作区干净。GitHub 命令全部显式 `-R Tong-bit-art/pi-native-crm`。
- **分类修正（采纳 Codex）**：part-4 的红不是 30 分钟预算截断——是 `vps-fresh-onboarding` J1.10 卡在 `waitForURL(/\/app\//)`（实际已导航到 `/app`）；part-1 的红在截断前已存在。不得再写"五个分片都被预算截断"。
- 主机重启后恢复本地工具链：解压产物丢失，重新解压 node22（**v22.23.3**）与 ripgrep（**15.2.0**）；`D:\Git` 未受影响。
- 本地无 Docker 栈：e2e 执行按任务单标注**待 CI**；本地执行 typecheck / lint / 单测 / 字符串一致性。

## 2. 任务 01 — 入口判定（`76a15c6`）

- 复用既有 `tests/e2e/utils/app-url.ts`，新增任务单接口：`isAppEntryUrl(url, expectedOrigin)`（路径语义 + 同源）与 `waitForAppEntry(page, options?)`（origin 取自调用时的页面 URL；timeout 透传；`Page` 仅 type import）。
- **TDD 红→绿**：先写矩阵 → `TypeError: isAppEntryUrl is not a function`；实现后 **23/23**。
- 矩阵：正例 6（`/app`、`/app/`、`/app/inbox`、`/app/ai/workbench`、query、hash）；反例 8（`/login`、`/login/mfa?next=/app`、`/onboarding`、`/onboarding/connect-whatsapp`、`/application`、`/app-malicious`、query 含 `/app`、`/`）；异源 2；旧形态失败固化 1。

## 3. 任务 02 — "登录成功"判定的审查与替换（`9699395`）

- **审查方法**：导出所有 `/\/app\//` 出现处的 ±3 行上下文（385 行），逐处分类。结论：`waitForURL(/\/app\//)` 的 **52 处代码**（44 文件）全部是"登录成功"见证；**没有一处**是指定页面等待。指定页面等待（`/app/inbox`、`/app/ai/...`、settings、`toHaveURL`、`new RegExp`）未动。
- **替换**：按精确字面量脚本替换为 `waitForAppEntry(receiver`，**逐处保留原 timeout 与结构**；45 文件加 import。
- **归并 5 处**：`invite-lifecycle` 的 post-timeout 复检改 `isAppUrl`（保留 `MFA em estado inesperado` throw）；`inbox-scope`、`rbac-roles`×2（含 8s MFA 循环）、`risk-radar` 的 `waitForURL(isAppUrl)` 改 `waitForAppEntry`；`login-admin.tentarMfa` 同改（10s 保留）。`auth.spec` 保留负向 `isAppUrl`。
- **验证**：残留仅 3 处历史注释；typecheck 0；lint 0（456 warnings）；重复 import 无。

## 4. 任务 03 — 匿名错误页语言契约（`c187c71`）

- 机制（读源码）：`not-found.tsx`/`500` → `normalizarIdioma(null)` = `IDIOMA_PADRAO`；`503` 固定默认；`403` 无会话走 `idiomaDoVisitante`（浏览器语言）——这就是 403 不红、404/500/503 红的原因。
- 三用例改为精确 zh-CN 契约（heading + 正文句 + `pathname` 守卫 + 返回链接与 `href`），字符串取自 `lib/i18n/traducoes/zh-CN.json`；403/legal 原样。
- 本地一致性：`tsx` 脚本确认 spec 字面量 == `traduzir(k,"zh-CN")` 8/8、无 PT 原文、全在 spec 内。

## 5. 测量（head `27266cd`）

### 5.1 工作流

| Workflow | 结论 | Run URL |
| --- | --- | --- |
| ci | ✅ success | https://github.com/Tong-bit-art/pi-native-crm/actions/runs/38401226096 |
| perf | ✅ success | https://github.com/Tong-bit-art/pi-native-crm/actions/runs/38401226076 |
| publish-image | ✅ success | https://github.com/Tong-bit-art/pi-native-crm/actions/runs/38401226091 |
| e2e | ❌ failure（结构大幅改善） | https://github.com/Tong-bit-art/pi-native-crm/actions/runs/38401226145 |

### 5.2 e2e 分片（按 job 时间戳）

| 分片 | 结果 | 时长 | 备注 |
| --- | --- | --- | --- |
| 4 | ✅ **success** | ~6m07s（含准备） | **J1.10（MFA 注册+恢复码）与 J1.13 全流程走通**——此前卡 30 分钟预算 |
| 1 | ❌ 131 passed / 5 failed / 14 did not run | 18.8m（自然结束） | 失败见 5.3 |
| 2 | ❌ 100 passed / 7 failed | 14.4m | |
| 5 | ❌ 52 passed / 11 failed | 13.8m | 含 catalog.py 缺失类（§6 已修） |
| 3 | ❌ **exit 124（预算截断）** | suite 1331s（preparo 349s） | 截断前有红（含 2×180s 语言等待）；**覆盖不完整，不得当全集** |

**修复生效的验证**：此前红名单的 `error-pages`×3、`followup-linguagem`、`followup-ramos`、`importar-leads-planilha`、`inbox-responder-citando`×2、`j20`×3 在 round-8 **全部消失（转绿）**；part-4 整体转绿。

### 5.3 残余失败的分类（按 error-context 工件逐项）

**语言契约漂移（zh-CN 默认 vs PT 断言）——压倒性主类**：
| 分片 | 用例 | 实际断言 vs 现场 |
| --- | --- | --- |
| 1 | `primeiro-acesso-sem-organizacao` ×3 | 断言 PT（"Configure sua organização"/"Configurar minha organização"/"Nome da empresa"），页面实为"配置您的组织"/"配置我的组织"(href `/get-started` 正确)/"公司名称"——功能链路完好 |
| 2 | `painel-de-configuracao` ×4 | 断言 PT（heading/按钮/toast），面板实为 zh（平台模式页面快照）；其一为布局检查命中 zh 标签元素 |
| 2 | `navegacao:158` | 断言 `Montar o agente`，实为 zh |
| 2 | `conversa-do-caso:229` | 断言 PT 文本 `a política permite até 10%`（页面 zh） |
| 2 | `aviso-de-caso-no-whatsapp:153` | 断言字体栈 `/Atkinson/`，实收 zh 字体栈（`Noto Sans SC…`）——语言驱动的排版 |
| 3 | `agenda-presenca` ×2 | 登录标签 `/e-?mail/i` 对 zh"邮箱"永不匹配 → **180s 挂起**（part-3 截断的主因之一） |
| 3 | `email-da-instalacao` ×4 | 断言 PT toast/menu（"servidor de e-mail salvo"/"E-mail"），面板 zh；其(3)为 serial 依赖级联 |
| 3 | `interface-por-vinculo:34` | 240s 超时（同型标签等待） |
| 3 | `logo-moldura:379`、`marca-logo` ×5 | 断言 PT toast `logo atualizado`，面板 zh |
| 5 | `extensoes-da-instalacao` ×2 | 断言 PT（`/extensões/i`、`de onde vêm as extensões`），面板 zh——**导航里"扩展"链接实际存在** |

**已由 §6 修复（同型/同类）**：`invite-lifecycle` 接受后落点；`extensoes-declarativas`、`extensoes-versao`、`extensoes-portas-novas`、`extensoes-recuperacao`（catalog.py 缺失）；`system-update:577`（匿名 404 的 PT 断言）。

**真实行为差异（首次到达，交回裁决）**：
- `i18n-espanhol-na-tela:282`：ES→PT 后 `/app/metrics` 快照与控制组不一致（收到侧多出 60 行、少 26 行内容；差异包含 "Automação"、"Clientes que repetiram…" 等条目）。需要一次带 trace 的定向深读判断是动态内容/状态残留还是真实回归——本轮不修生产。
- `degradacao-silenciosa`：一次尝试失败（未计入 5 failed，疑似 retry 后过）——其收到文本里导航混有 zh 片段（"Agent–CRM 工作台"），是 i18n 缺口的旁证，记录待查。
- `suporte-temporario:23`：click 20s 超时（现场未展开，工件在 run 38401226145 的 part-5 报告）。
- `email-da-instalacao (3)`：`smtp-host` 值空 vs 期望——serial 级联自 (2) 的语言红；语言类修复后应复测。

## 6. 测量后的同型修复（本轮追加，均附证据）

1. `791ddc6` **invite-lifecycle 接受后落点**：三处 `waitForURL(/\/app\/inbox/)`（接受邀请后的登录落点）改 `waitForAppEntry`——文件自己的注释早已写"já é membro → cai no `/app`"；标题随契约更新；令牌/权限断言未动。
2. `0db4149` **恢复 `experiments/extensoes/catalog/`**：四组扩展 spec 执行 `python3 experiments/extensoes/catalog/catalog.py init|serve`，干净检出报 `[Errno 2]`；该目录**上游公开**（只读 API 核对）、内容干净（无 PII/旧品牌）、CLI 为 python stdlib 自包含。与 loop/hooks 同型：`/experiments/*` + 逐级放行 `!/experiments/extensoes/catalog/`；其余 `experiments/` 继续不发布。
3. `d6138cf` **system-update:577**：非 owner 的 404 断言 `404 — Página não encontrada`（PT）→ 精确 zh 契约；权限语义不变。属"匿名错误页语言预期"授权类。

## 7. 与验收对照

- 只改测试/工具/文档：生产 `app/`、`lib/`、`workers/`、`supabase/`、根 `package.json`/`pnpm-lock.yaml` 的 diff 为**空**（`git diff --name-only` 命令证据；本轮全部变更在 `tests/e2e`、`tests/unit`、`.changes/`、`.gitignore`、`experiments/extensoes/catalog/`）。
- 新 SHA 的完整 e2e **未全绿**：按任务单交回具体残余（§5.3）与下一步提案（§8），未新增重试。
- typecheck 0 / lint 0（456 warnings 同基线）/ 定向单测 165 项全绿（含 hygiene、branding、documentacao、fragmentos、e2e-app-url）。

## 8. 下一步提案（交 Codex 裁决）

1. **授权"默认语言契约"扩展到剩余已认证页面**：主类清晰、逐处最小（把 PT 断言换成精确 zh 字符串；不引入宽松多语言正则）。涉及 spec：`primeiro-acesso-sem-organizacao`、`painel-de-configuracao`、`extensoes-da-instalacao`、`email-da-instalacao-pela-tela`、`marca-logo`、`logo-moldura-no-tema-escuro`、`navegacao`、`conversa-do-caso`、`aviso-de-caso-no-whatsapp`（字体栈断言按 zh 栈校正）、`agenda-presenca-recuperacao`、`interface-por-vinculo`。修完后 part-3 的两个 180s 挂起消失，健康时长才可被真实测量。
2. **`i18n-espanhol-na-tela:282` 的深读**（带 trace）——可能是测试状态问题也可能是真实回归；本轮不扩到产品修复。
3. **预算/分片**：本轮**不提案重平衡**——part-3 仍有截断且其时长被语言等待污染，不符合"健康时长"依据；待第 1 项落地后按正常时长重测再议。
4. `system-update:567` 文案已修；`experiments/catalog` 已恢复——如同意，这两类在下一轮 CI 复验。
