# AI Master

`oosaka0123-sudo/ai-master` は、複数のAI・複数のGitHub Projectをまたいで作業を再開するための **共通入口（bootstrap）と共通ガバナンス** です。

Project固有の仕様・進捗・コードは各Project Repositoryを正本とし、このMasterへ複製しません。

## New Session — 最短の読み込み順

1. `README.md`
2. `AGENTS.md` — 全AI共通の不変ルール
3. `PROJECTS.md` — 対象Project Repositoryを特定
4. 対象Project Repositoryへ移動
5. Project側の実在する開始ファイル（AGENTS / DECISIONS / RUNBOOK / README等）を読む
6. Open Issues / Open PRs / Latest Actions / current codeを確認
7. 作業開始

必要なときだけ追加で読みます。

- 接続・利用可能能力: `CONNECT.md`
- Master設計理由: `DECISIONS.md`
- 停止Projectの再開 / Council: `AI_COUNCIL.md`
- Web制作共通標準: `docs/standards/WEB_DEVELOPMENT.md`
- 補助文書の索引: `docs/README.md`

一度停止したProjectを `resume` する場合は、実装再開前に `AI_COUNCIL.md` のClaude・Gemini・ChatGPT Council gateを通します。Council実行エンジンの正本は `oosaka0123-sudo/ai-development-orchestrator` です。

## Source of Truth

- **Master**: 共通安全ルール、共通運用原則、Repository案内、接続状態、Council共通ポリシー、共通標準
- **Project Repository**: Project固有の仕様、コード、Issue、PR、CI、実装状態、設計判断
- **チャット履歴 / LLMの記憶**: 参考情報。正本ではない

## Conflict / Precedence

1. **Security / Secret protection / SSOT / No fabrication**: `AGENTS.md` の GLOBAL MUST / MUST NOT
2. **Project固有の仕様・コード・実装状態**: 対象Project Repository
3. **停止Projectのresume policy**: `AI_COUNCIL.md`
4. **Projectローカル運用**: Project側AGENTS等。ただし上位Securityと必須resume gateは緩和不可
5. **Web制作共通標準**: `docs/standards/WEB_DEVELOPMENT.md`
6. **現在状態**: current code / Issue / PR / Actions等のGitHub実態
7. **過去チャット・LLM記憶**: GitHubと矛盾する場合は採用しない

重大な矛盾を安全に解消できない場合は、差分を明示して人間へエスカレーションします。

## Root Files

ADR-002の基本構成を維持します。

- `README.md` — 入口
- `AGENTS.md` — 全AI共通ルール
- `CONNECT.md` — 接続状態・確認済み能力
- `PROJECTS.md` — 公開Project Repository住所録
- `DECISIONS.md` — Master設計判断（ADR）
- `AI_COUNCIL.md` — Council / resume gate

詳細標準・運用スナップショット等は `docs/` に置き、rootを増やしません。

## Deliberately Not Created

二重管理を避けるため、Masterには原則として `MASTER.md` / `GLOBAL_RULES.md` / `STATUS.md` / `AI_CONTEXT.md`、Projectごとの進捗コピー、手動ステータス一覧を作りません。

GitHubのIssue / PR / Actions / Commitを現在状態の記録に使います。

## Cross-Repository Rule

MasterからProjectへは `PROJECTS.md` のRepository名で移動し、原則として現在のdefault branchを取得します。Project側からMasterを参照する固定入口は `oosaka0123-sudo/ai-master` です。

## Public Master

このRepositoryはPublicです。Private Repositoryの存在・名前・内部情報は、明示承認なしに掲載しません。
