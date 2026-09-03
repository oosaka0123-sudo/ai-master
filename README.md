# AI Master

`oosaka0123-sudo/ai-master` は、複数のAI・複数のGitHubプロジェクトをまたいで作業を再開するための **共通入口（bootstrap）と共通ガバナンス** です。

このRepositoryは各Projectの進捗・仕様・コードを複製する場所ではありません。Project固有の事実は、常にそのProject Repositoryを正本とします。

## New Session — 最短の読み込み順

新しいChatGPT / Claude Code / Jules / Gemini / Copilot等のセッションでは、次の順で遅延ロードします。

1. この `README.md`
2. `AGENTS.md` — 全AI共通の不変ルール
3. `PROJECTS.md` — 対象Project Repositoryを特定
4. 対象Project Repositoryへ移動
5. Project側の `AGENTS.md` / `DECISIONS.md` / `RUNBOOK.md` / README等、実在する開始ファイルを読む
6. Open Issues / Open PRs / Latest Actions / current codeを確認
7. 作業開始

`CONNECT.md` は接続状態を確認するときだけ、`DECISIONS.md` はMaster設計の理由を確認するときだけ読みます。最初から全ファイルを一括ロードしません。

## Source of Truth

- **Master**: 共通安全ルール、共通運用原則、Repositoryへの案内、接続状態
- **Project Repository**: Project固有の仕様、コード、Issue、PR、CI、実装状態、設計判断
- **チャット履歴 / LLMの記憶**: 参考情報。正本ではない

MasterへProject固有の進捗や仕様をコピーしません。

## Conflict / Precedence

競合時は「情報の種類」で正本を決めます。

1. **Security / Secret protection / SSOT / No fabrication**: `ai-master/AGENTS.md` の GLOBAL MUST / MUST NOT が最優先。Project側から緩められません。
2. **Project固有の仕様・コード・実装状態**: 対象Project Repositoryが正本です。
3. **Projectローカル運用ルール**: Project側 `AGENTS.md` 等が、Masterの `DEFAULT` をそのProject内だけ上書きできます。
4. **現在状態**: current code / Issue / PR / Actions等のGitHub実態を優先し、古い文書は修正対象として扱います。
5. **過去チャット・LLMの記憶**: GitHubと矛盾する場合は採用しません。

重大な矛盾で安全に解決できない場合は、差分を明示して人間へエスカレーションします。

## Files

- `README.md` — 入口、読み込み順、優先順位
- `AGENTS.md` — 全AI共通の憲法（GLOBAL MUST / MUST NOT / DEFAULT）
- `CONNECT.md` — 接続状態・確認済み能力のみ
- `PROJECTS.md` — 公開Project Repositoryの住所録のみ
- `DECISIONS.md` — Master設計判断の理由（ADR）。日常命令の正本ではない

## Deliberately Not Created

二重管理を避けるため、Masterには原則として次を作りません。

- `MASTER.md`
- `GLOBAL_RULES.md`
- `STATUS.md`
- `AI_CONTEXT.md`
- Projectごとの進捗コピー
- PR / Issue番号を使った手動ステータス一覧

GitHubそのもの（Issue / PR / Actions / Commit）を現在状態の記録に使います。

## Cross-Repository Rule

MasterからProjectへは `PROJECTS.md` のRepository名で移動します。特定commitへ固定した古いpermalinkを起動経路として使わず、原則として **現在のdefault branch** を取得します。

Project側からMasterを参照する場合の固定入口は:

`oosaka0123-sudo/ai-master`

情報をコピーして同期するのではなく、Repository間を参照して正本を1つに保ちます。

## Public Master

このRepositoryはPublicです。Private Repositoryの存在・名前・内部情報は、明示承認なしに `PROJECTS.md` 等へ掲載しません。
