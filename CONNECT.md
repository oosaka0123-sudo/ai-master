# AI MASTER Connection Registry

Last verified: 2026-09-04 JST

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

## Claude Code → GitHub

Status: `CONNECTED / READ / WRITE`（Project-scoped evidence）

Last observed: 2026-09-02 JST

Verified scope:
- `oosaka0123-sudo/ai-agent` で実作業を確認
- Repository内容の確認
- 専用branchでの実装
- commit / Pull Request作成
- テスト結果を伴う開発フロー

Rule:
- 上記は確認できたProject・時点での実績です。
- 新しいClaude Code sessionや別Projectでは `VERIFY_ON_START` として対象Repositoryへの実アクセスを確認します。

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

## Gemini

Status: `VERIFY_ON_START`

GeminiはJulesとは別枠で扱います。

Current rule:
- Projectごとに連携方式が異なる可能性があるため、Masterでは全Project共通の接続済み状態を宣言しません。
- Gemini単体のGitHub READ / WRITE、Actions、MCP利用等は、必要なProjectで実際に確認してから追記します。

## Google Media Remote HTTP MCP

Status: `CONFIGURED / VERIFY_ON_START`

Last configuration verified: 2026-09-04 JST

Verified configuration:
- Remote HTTP MCPのCloud Run endpointが `oosaka0123-sudo/ai-agent` のcontrol-plane設定に登録済み
- `oosaka0123-sudo/rss7-house` の `.mcp.json` に `google-media` MCPとして配布済み
- 認証付きRemote HTTP MCPとして利用する設計
- Google Vertex AIの画像・動画生成基盤へ接続する構成

Public endpoint:
- `https://google-media-mcp-518404402696.us-central1.run.app/mcp`

Important distinction:
- Repository上のendpoint / MCP設定は確認済みです。
- このChatGPTセッションからGoogle Media MCPのツールを直接呼び出して成功したことまでは、2026-09-04時点で再確認していません。
- そのため、現在の表記は `CONFIGURED / VERIFY_ON_START` とし、実ツール呼び出し成功後に `CONNECTED` へ更新します。

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
