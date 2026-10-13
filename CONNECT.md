# CONNECT.md — AI MASTER Connection Registry

Last verified: 2026-10-14 JST

このファイルは **接続状態と実確認できた能力だけ** を管理します。

Project進捗、Issue/PR番号、詳細仕様、認証情報、秘密値、接続用の秘密情報名は保存しません。

## Status Definitions

- `CONNECTED` — 実アクセスまたは実動作で接続確認済み
- `READ` — 読み取り確認済み
- `WRITE` — 書き込み確認済み
- `CONFIGURED` — 接続先や設定はRepository上で確認済みだが、このセッションでの実呼び出しは未確認
- `VERIFY_ON_START` — 新しいセッションや新しいProjectでは再確認が必要
- `DISCONNECTED` — 現在利用不可
- `BLOCKED` — 権限・認証等で利用不可
- `UNKNOWN` — 未確認

## Interpretation Rule

- `CONNECTED` は **確認できた範囲・Project・時点だけ** に適用します。1つのProjectで接続できたからといって、全Projectで同じ権限があるとは扱いません。
- Agent / MCP / LLMの名前を混同しません。Claude Code、Jules、Codex、Copilot等は主にAgent / 開発サービスとして記録し、裏側の正確なLLMモデル名はセッションごとに変わり得るため、実確認できた場合だけ補足します。
- 過去に接続できていても、新しいセッションでは必要に応じて再確認します。
- 「設定済み」と「実際にツール呼び出し成功」は分けて記録します。
- 接続確認のためだけに不要なユーザーデータ変更を行いません。能力確認はタスクに必要な範囲のread-only probeを優先し、`WRITE` は許可された実書き込み成功または同等の実Evidenceがある場合だけ記録します。

## GitHub Master Repository

Repository: `oosaka0123-sudo/ai-master`

Visibility: `PUBLIC`

Status: `CONNECTED / READ / WRITE`

Verified: 2026-09-04 JST

Verified capabilities:
- Repository metadata read
- Markdown / text file read
- File create / update
- Branch read / create
- Issue read / create / update
- Pull Request read / create / merge
- Commit / GitHub Actions state read

Rule:
- 新しいセッションでは過去の接続状態を信用せず、必要なら実アクセスで再確認する。
- Masterは接続レジストリであり、Projectの進捗正本ではない。

## ChatGPT → GitHub

Status: `CONNECTED / READ / WRITE`

Verified: 2026-09-04 JST

Session re-verification: Repository read and branch creation succeeded in this ChatGPT session.

Confirmed in this environment:
- Repository / file read
- File write
- Branch operations
- Issue operations
- Pull Request operations
- Commit / CI state read

Operational note:
- ChatGPTはGitHub操作が可能な場合、Project側ルールと安全境界を守ったうえで、読み取りだけで止めず、Branch / PR / Merge / Actions確認など可能な操作を最後まで進める。

Known limitation:
- この接続から新規GitHub Repositoryそのものを作成する機能は現在利用できない。
- 個別の書き込みpayloadは接続・安全レイヤーで拒否される場合がある。RepositoryのWRITE権限確認済みでも、特定操作の拒否を全体の接続断と解釈せず、対象操作だけをBLOCKEDとして別の安全な手段へ切り替える。

## ChatGPT → Gmail Connector

Type: Connector

Status: `CONNECTED / READ`

Verified: 2026-09-04 JST

Verified capabilities:
- 認証済みGmailへの実アクセス
- Mailbox label metadata / message countの読み取り

Limitations:
- この棚卸しではメール送信・ラベル変更・アーカイブ等のWRITE操作は実行していないため、`WRITE` は宣言しません。
- メールアドレス、本文、個人情報、認証情報はMasterへ保存しません。

## Browser automation — PC03 (current)

Status: `CONNECTED / CONFIGURED / VERIFY_ON_START` (2026-10-12 JST, device-scoped)

- Primary browser: **dedicated Chrome profile**, isolated from the personal Chrome profile. Connect Chrome DevTools MCP via local `--browser-url`, not `--autoConnect` to the personal session.
- Claude Code → Chrome DevTools MCP: **CONNECTED** (MCP health check succeeded on ks-03).
- Antigravity CLI `agy` → Chrome DevTools MCP: **CONFIGURED** (server enabled/listed); real headless MCP call **BLOCKED** pending narrow tool permission. Do not bypass all permissions.
- Standalone Gemini CLI: MCP registered, but trusted workspace and CLI authentication not yet established. **CONFIGURED only**; do not confuse with `agy`.
- Browser operations across agents must be serialized (one worker/queue) or use separately isolated browser contexts. Do not share a personal browser profile or expose CDP to a network.
- **Opera Browser Connector is excluded from the active browser automation path.** Do not add Opera connection recovery, watchdogs, or tab-opening steps to the default workflow. Prior connection history is superseded; this change does not uninstall Opera or alter user data.

### Search Console / public-site monitoring — PC03

- Public-site read-only check: **CONNECTED / tested** for `sixty-guide` (homepage, robots.txt, sitemap.xml all HTTP 200; sitemap 11 URLs; canonical present; no noindex on homepage).
- Windows scheduled task `PC03-SixtyGuide-PublicHealth`: **CONFIGURED / execution tested**, daily 07:00 JST; last manual run on 2026-10-12 returned task result 0.
- Google Search Console API monitor: **CONFIGURED / BLOCKED**. Existing local Google Cloud ADC token lacks `webmasters.readonly` scope; live `sites.list` returned HTTP 403 `ACCESS_TOKEN_SCOPE_INSUFFICIENT`. This is **not evidence that the Search Console property is unregistered**.
- Do not modify existing Google registrations, sitemaps, DNS, OAuth credentials or Chrome sessions. API monitoring must remain read-only and must not be scheduled as successful until properly authorized and verified.
- Local implementation details and recovery procedure are documented on PC03 in the AI_Agent workspace; do not store secrets or local credentials in this public repository.

## ChatGPT → Remote Desktop Commander → Google Cloud CLI

Type: Remote computer bridge / local CLI execution path

Status: `CONNECTED / READ / WRITE / VERIFY_ON_START`（device-scoped evidence）

Verified: 2026-09-08 JST

Verified scope / capabilities:
- ChatGPTからRemote Desktop Commander経由で、ユーザーが許可したWindows端末上のterminal command実行に成功
- 同端末でGoogle Cloud SDK / `gcloud` CLIの実行を確認
- `gcloud` からactive Google Cloud projectが `rss7-ai-media` であることを非秘密情報として確認
- 認証済みGoogle accountがactiveであることを確認したが、account identifierやcredential/token自体はMasterへ保存しない

Current interpretation:
- PC依存処理が必要な場合の実行ブリッジとして利用可能。ただしGLOBAL方針ではCloud Firstを優先し、GitHub Actions / Remote HTTP MCP等へ移せる処理はクラウド側を優先する。
- 新しいdevice/sessionでは接続、端末権限、`gcloud` authentication/configurationを `VERIFY_ON_START` として再確認する。
- Secret / Token / Credential / local user path等はMasterへ記録しない。

## ChatGPT → Remote Desktop Commander → ks-03

Type: Remote computer bridge / 24x7 Windows development node

Status: `CONNECTED / READ / WRITE / VERIFY_ON_START`（device-scoped evidence）

Verified: 2026-10-09 JST

Verified scope / capabilities:
- ChatGPTからRemote Desktop Commander経由で `ks-03` へのlive接続、PowerShell command実行、file read / writeを確認
- Tailscale serviceとWindows OpenSSH `sshd` が `Running / Automatic` であることを確認
- GitHub CLIの認証とRepository一覧取得、Git HTTPS `ls-remote` を実確認
- Claude Codeの認証と実プロンプト応答を確認
- Antigravity CLI `agy` version `1.3.2` とGemini実プロンプト応答を確認
- Google Cloud CLIの認証とFirebase CLIからのProject accessを確認
- Desktop Commander / 24x7 Guard / local watchdog / Antigravity remote-control daemonのuser-session起動を実確認

Operational notes:
- Windows自動ログインは設定していない。再起動後はWindows sign-in画面で停止してよい。
- Tailscale / `sshd` はsystem serviceとしてuser sign-in前に起動可能だが、Desktop Commander、AI CLI daemon、ChatGPT等のuser-session項目はWindows sign-in後に起動する。
- 新しいsessionではRemote Desktop CommanderまたはTailscale + OpenSSH経路をread-only probeから再確認する。
- Token / Credential / account identifier / local secretはMasterへ保存しない。
- Local executionの優先順位は接続Evidenceではなく `DECISIONS.md` ADR-017 / `AGENTS.md` が定義する。`CONNECT.md` は能力と接続状態のEvidence registryとして扱う。

## ChatGPT → Remote Desktop Commander → ks04 (dedicated account)

Type: Remote computer bridge / secondary Windows execution node

Status: `CONNECTED / VERIFY_ON_START` (device- and account-scoped evidence)

Verified: 2026-10-13 JST

Account / device routing:
- PC04 (`ks04`) のRemote Desktop Commanderは **`info@rss7.net` 専用**。ChatGPTの別接続として「いんふぉ０４」を選び、旧アカウント接続とは混同しない。
- PC03は従来のDesktop Commanderアカウントを使用。PC03/PC02の既存設定は変更しない。
- ユーザーが「04で進めて」と明示指示したときにPC04を使用し、「03に戻して」でPC03に戻す。**利用上限による自動切り替えは行わない**。
- アカウント表示名やdevice IDは永続識別子として決め打ちせず、実行ごとに利用可能な接続と対象deviceを照合する。

Verified scope / evidence:
- `info@rss7.net` へのPC04側のログイン・デバイス認証完了（ユーザー提示画面）。
- ChatGPTのRemote Desktop Commanderで別アカウント接続が登録済み。
- `info@rss7.net` 側の接続を指定した `list_devices` で `ks04` Online を確認し、同接続で `ping` が `pong` を返した（2026-10-13 JST）。
- 同専用接続でPC04のWindows PowerShell `start_process` が実際に `hostname=ks04` を返し、遠隔CLI実行に成功（2026-10-13/14 JST）。
- PC04から `git --version` (2.56.0.windows.2)、`claude.cmd --version` (2.1.296)、`agy --version` (1.3.3) の取得に成功。
- PC04から `git ls-remote` で公開GitHubリポジトリのHEADを取得し、Tailscale上のPC03に対するTCPポート22への到達も確認。
- PC04ローカルのGitで `ai-master` を `--depth 1` クローン成功、HEAD `3bc1f7b` / クリーンな `git status` を確認。`line-control` はPowerShellで `NODE_ENV=test` を指定した `node --test` が **32/32 PASS、exit 0**（2026-10-14 JST）。

Limitations / handoff:
- PC04でClaude Codeの対話ログインが成立し、`claude.cmd auth status` の `loggedIn=true` と、Claude Sonnetへの実プロンプト応答を確認。独立レビューの結論は「GitHubクローンとテストは可能だが、PC03の未コミット状態未確認につき完全引継ぎ未合格」。
- Gemini（Antigravity CLI）は PC04 の `agy models` で正しいモデルID `gemini-3.8-flash-high` を確認（旧 `gemini-3.1-pro-high` は未登録）。`agy --version` は **1.3.4**。同モデルへの独立レビュー実プロンプト呼出しが exit 0 で完了し、日本語の実回答を取得（2026-10-14 JST）。
- ChatGPT・Claude Sonnet・Gemini 3.8 Flash High の**実Providerによる独立評価**を取得済み。共通見解は「PC04のGitHub同期済み作業・開発テストは可能だが、PC03の未commit/未push差分の存在は未確認のため完全引き継ぎは未合格」。
- SSH: PC04からPC03へのTCP22到達は確認したが、SSHコマンドは終了コード255でログイン失敗。PC04のOpenSSHコマンドは `ssh -V` でも255を返した。原因未確定のため接続成功扱いにしない。
- PC04側GitHubの書き込み認証・push、PC03の未コミット差分確認、実ProjectのPC03→PC04完全引き継ぎは未検証。公開GitHub repoのclone成功だけでpush成功とは言えない。
- PC04にはWindows Startupの `DesktopCommanderRemote.vbs` と起動用PowerShellスクリプトが存在するが、再ログイン後の自動起動結果は未検証。
- PC03のDesktop Commander利用上限に達しても、PC03本体が停止するわけではない。PC04を使う場合、まずGitHubの対象Project正本と最新の引き継ぎ内容を確認し、必要ならTailscale + SSH等の実確認済み経路を使う。
- アカウントごとの呼出し制限が独立して見えるケースがあるが、上限値・復旧日時や継続利用可能性を推測で確定しない。
- Secret、token、device credentials、認証コードは記録しない。

## Claude Code → GitHub

Status: `CONNECTED / READ / WRITE`（Project-scoped evidence）

Last observed: 2026-09-06 JST

Verified scope:
- `oosaka0123-sudo/ai-agent` で実作業を確認
  - Repository内容の確認
  - 専用branchでの実装
  - commit / Pull Request作成
  - テスト結果を伴う開発フロー
- `oosaka0123-sudo/ai-master` で実作業を確認（2026-09-06 JST追加）
  - clone・Repository全文読み取り
  - 専用branch（`claude-code/mobile-first-cloud-first-adr`）でのADR追加・commit・push

Rule:
- 上記は確認できたProject・時点での実績です。
- 新しいClaude Code sessionや別Projectでは `VERIFY_ON_START` として対象Repositoryへの実アクセスを確認します。

## GitHub Actions → Anthropic Claude API

Type: API / GitHub Actions integration

Status: `CONNECTED`（Project-scoped evidence）

Verified: 2026-09-06 JST

Verified scope:
- `oosaka0123-sudo/rss7-ai-works` のGitHub ActionsからAnthropic側の認証確認が成功
- 同Workflow内でClaudeによる独立レビュー処理の開始を実確認

Limitations:
- このEvidenceは上記Projectと確認時点に限定する。他Repositoryで利用する場合は、そのRepository側で必要な認証・Workflow設定を別途確認する。
- API利用は従量課金になり得るため、全PRへ常時自動実行する前提にはしない。利用判断は `AGENTS.md` の選択的な有料独立レビュー方針に従う。
- 認証情報、秘密値、秘密情報名はMasterへ保存しない。

## Google Jules → GitHub

Status: `CONNECTED / READ / WRITE`（Project-scoped evidence）

Last observed: 2026-09-04 JST

Verified scope:
- `oosaka0123-sudo/ai-agent` でJulesによる実装を確認
- GitHub Issue / taskを起点にした作業
- 専用branchでの変更
- commit / Pull Request作成
- `oosaka0123-sudo/osaka-nextbus` でGitHub Issueへの `jules` ラベル付与により、Jules botの開始コメントとJules task起動を実確認
- `oosaka0123-sudo/osaka-nextbus` でJules bot自身による専用branch作成とcommit pushを実確認

Rule:
- JulesはGoogleの開発Agentとして記録し、Gemini一般利用とは分けて扱います。
- 新しいJules sessionや別Projectでは `VERIFY_ON_START` として再確認します。

## GitHub Copilot

Status: `CONNECTED`（PR review capability verified）

Last observed: 2026-08-30 JST

Verified scope:
- `oosaka0123-sudo/ai-agent` のPull Requestを実際にレビュー
- 初回レビューと再レビュー
- 変更点に対する指摘
- 修正後のApproval recommendation

Not claimed:
- Copilot自身によるRepository全体への常時WRITE権限は、この記録だけでは宣言しません。

Rule:
- 新しいProjectでレビュー・補助能力を利用する場合は `VERIFY_ON_START` として実際に利用可能か確認します。
- Copilotの状態をProject進捗の正本にしません。

## OpenAI Codex → GitHub

Status: `VERIFY_ON_START`

Last observed: 2026-08-30 JST

Verified:
- Codex taskによる実装成果物の作成は確認済み
- Codex担当成果がGitHub側へ統合された実績あり

Important limitation observed:
- そのCodex実行環境からの直接push / Pull Request作成は、認証・ネットワーク制約で失敗した記録があります。
- したがって、MasterではCodexのGitHub `WRITE` を接続済みとして固定しません。

Rule:
- 新しいCodex sessionでは、対象RepositoryのREAD / WRITE / PR作成能力を実アクセスで再確認します。

## Gemini / Antigravity CLI

Type: Local CLI / model access path

Status: `CONNECTED / VERIFY_ON_START`（device-scoped evidence）

Last verified: 2026-10-09 JST

GeminiはJulesとは別枠で扱います。

Verified scope:
- Windows端末 `ks-pc02` 上で Antigravity CLI `agy` の実行を確認
- `ks-pc02` で `agy --version` version `1.2.7` を確認（過去Evidence）
- Windows端末 `ks-03` 上でも Antigravity CLI `agy` の実行を確認（2026-10-09 JST）
- `ks-03` で `agy --version` version `1.3.2` を確認
- `agy models` で Gemini 3.1 Pro / Gemini 3.8 Flash 系、および Claude Sonnet 4.6 / Claude Opus 4.6 Thinking 等の利用可能モデル一覧取得に成功
- `agy --model gemini-3.1-pro-high --print ...` による実プロンプト呼び出しに成功し、日本語応答を確認
- 現行の個人向け運用では旧 `gemini` CLIより Antigravity CLI `agy` を優先する

Operational rule:
- ChatGPTからRemote Desktop Commander経由で、そのsessionでlive確認済みの `ks-pc02` または `ks-03` の `agy` を呼び出し、Geminiを実Providerとして利用できる
- 3人クロスチェック時は、ChatGPT内の擬似的な3視点ではなく、Claude・Gemini・ChatGPTの実Providerを実際に呼び出す
- Antigravity CLI上でClaudeモデルを利用できる場合でも、ClaudeとGeminiは別Provider回答として個別に取得・比較する
- 新しいdevice/sessionでは `agy models` と短い実プロンプトで `VERIFY_ON_START` を行う
- Secret / Token / Credential / account identifierはMasterへ保存しない

Current limitation:
- Gemini単体のGitHub READ / WRITE、Actions、MCP利用等は、必要なProjectで実際に確認してから追記する。

## Google Media Remote HTTP MCP

Status: `CONNECTED / READ / WRITE / VERIFY_ON_START`（production + Project-scoped evidence）

Last verified: 2026-09-08 JST

Verified configuration and live evidence:
- Remote HTTP MCP endpoint: `https://google-media-mcp-518404402696.us-central1.run.app/mcp`
- Production Cloud Run revision `google-media-mcp-00008-f7r` is Ready / ContainerHealthy and serving 100% traffic.
- `/readyz` returned HTTP 200 with `{"ready":true}`.
- Authenticated MCP `initialize` and tool discovery succeeded against production.
- Verified tool set: `generate_image`, `generate_video`, `start_video_generation`, `check_video_generation`.
- `generate_image` succeeded with `gemini-2.5-flash-image` and persisted its output to the shared GCS bucket.
- The generated image GCS URI was used as the actual input to `start_video_generation`.
- Async Veo flow completed via `check_video_generation` (`processing` -> `processing` -> `success`) using `veo-3.1-fast-generate-001`.
- Final image and video objects were independently verified to exist in GCS.
- The async image-to-video acceptance completed in about 50 seconds and avoided the prior client-side ~60 second timeout failure mode.
- Claude Code on the authorized Windows development device loaded the Project-scoped `google-media` entry and reported `Connected` after Secret Manager-backed environment injection; no secret value was persisted in this repository.

Current interpretation:
- The previous Claude Code cloud egress/token blocker recorded on 2026-09-06 is no longer the current production state.
- Production Google Media MCP is live and has passed end-to-end image -> real image-to-video -> GCS persistence acceptance.
- New Claude Code sessions/projects must still be treated as `VERIFY_ON_START` because their network policy, environment variables, and MCP loading are session/project scoped.
- Secret / Token / Credential values are never stored in Master.

## Steel Browser Remote HTTP MCP

Status: `CONNECTED / READ / WRITE / VERIFY_ON_START`（production + Project-scoped evidence）

Last verified: 2026-09-09 JST

Verified configuration and live evidence:
- Remote HTTP MCP canonical endpoint: `https://steel-browser-mcp-518404402696.us-central1.run.app/mcp/` (`rss7-ai-media / us-central1`).
- `/readyz` returned HTTP 200 with `{"ready":true}`.
- Authenticated MCP connection and tool discovery succeeded against production.
- Verified tool set: `create_session`, `navigate`, `extract`, `screenshot`, `release_session`.
- End-to-end browser lifecycle succeeded against `https://example.com/`.
- `extract` returned non-empty text content and `screenshot` returned a valid PNG payload.
- Claude Code on the authorized Windows development device loaded the Project-scoped `steel-browser` entry and reported `Connected` after Secret Manager-backed environment injection.
- A Claude Code `sonnet` smoke test called `create_session`, `navigate`, `extract`, and `release_session` through the MCP and returned the verified page title `Example Domain`.
- GitHub Actions can keylessly authenticate to Google Cloud, deploy the service, verify readiness, and run the real five-step acceptance lifecycle without a local PC or Cloud Shell.
- Current production acceptance result: `ALL_PASS`.

Current interpretation:
- Steel Browser Remote HTTP MCP is production-ready for the verified five-tool lifecycle.
- Deployment and acceptance follow the cloud-first automation policy and do not require a long-lived Google Cloud credential in GitHub.
- New AI sessions/projects remain `VERIFY_ON_START` because MCP loading, network policy, and environment configuration are session/project scoped.
- Secret / Token / Credential values and secret resource names are never stored in Master.

## AI Development Orchestrator MCP

Status: `VERIFY_ON_START`

Repository: `oosaka0123-sudo/ai-development-orchestrator`

Verified:
- GPTをPM、Claude Agent SDKを実装担当、GitHubを共有作業場所としてつなぐMCP server実装が存在
- `plan_repository_task` / `execute_repository_task` 等の設計・実装をRepository上で確認
- セキュリティ制御・テスト済み実装を確認

Not yet claimed in Master:
- 現在のChatGPTセッションから、そのMCPのlive endpointへ接続してtool callが成功した状態

Rule:
- 実際のMCP endpoint接続とtool call成功を確認した時点で `CONNECTED` と実能力を追記します。

## Cross-Repository Rule

どのProjectで作業中でも、必要に応じて `oosaka0123-sudo/ai-master` を参照できます。

MasterとProjectは別Repositoryのまま維持し、進捗・仕様をコピー同期しません。

## Public / Private Boundary

`ai-master` はPublicです。

Private Repositoryの名前・存在・内部情報は、明示承認なしにこのPublic Masterへ記録しません。

## Automatic Update Rule

新しいAgent / LLM / MCP / Plugin / Connector / API等の接続、または既存接続の新しい能力を実アクセス・実ツール呼び出しで確認した場合、`CONNECT.md` が未記載または古ければ、そのSession内で短く更新します。

記録する内容:
- Name / Type
- Status
- Verified date
- Verified scope / capabilities
- Limitations
- Project-scopedの場合はその旨

必須条件:
- 推測では記録しない
- `CONFIGURED` と `CONNECTED` を区別する
- Secret / Token / Credential / 接続用秘密情報名を記録しない
- 既存項目と重複させない
- 1 Projectでの成功を全Project共通と扱わない
- Public MasterへPrivate Repository情報を無断で記録しない

`ai-master` へのWRITE権限がない場合は、未記載であることと追記すべき内容をユーザーへ報告します。

更新しない例:
- PRがマージされた
- Issueが増えた
- Project機能が完成した
- 実装が進んだ

これらは各Project Repositoryで管理します。
