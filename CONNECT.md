# CONNECT.md — AI MASTER Connection Registry

Last verified: 2026-09-03 JST

このファイルは **接続状態と実確認できた能力だけ** を管理します。

Project進捗、Issue/PR番号、詳細仕様、認証情報、秘密値、接続用の秘密情報名は保存しません。

## Status Definitions

- `CONNECTED` — 実アクセスで接続確認済み
- `READ` — 読み取り確認済み
- `WRITE` — 書き込み確認済み
- `VERIFY_ON_START` — 新しいセッションで再確認が必要
- `DISCONNECTED` — 現在利用不可
- `BLOCKED` — 権限・認証等で利用不可
- `UNKNOWN` — 未確認

## GitHub Master Repository

Repository: `oosaka0123-sudo/ai-master`

Visibility: `PUBLIC`

Status: `CONNECTED / READ / WRITE`

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

Verified: 2026-09-03 JST

Confirmed in this environment:
- Repository / file read
- File write
- Branch operations
- Issue operations
- Pull Request operations
- Commit / CI state read

Known limitation:
- この接続から新規GitHub Repositoryそのものを作成する機能は現在利用できない。

## Claude Code → GitHub

Status: `VERIFY_ON_START`

Masterでは全Project共通の接続済み状態を推測しない。新しいClaude Code sessionで対象Repositoryへの実アクセスを確認する。

## Google Jules → GitHub

Status: `VERIFY_ON_START`

Masterでは全Project共通の接続済み状態を推測しない。実行時に対象Repositoryへのアクセスと必要権限を確認する。

## GitHub Copilot

Status: `VERIFY_ON_START`

レビュー・補助能力を利用する場合は、対象Projectで実際に利用可能か確認する。Copilotの状態をProject進捗の正本にしない。

## Gemini

Status: `VERIFY_ON_START`

Projectごとに連携方式が異なる可能性があるため、Masterでは全Project共通の接続済み状態を宣言しない。必要なProjectでActions / workflow等の実態を確認する。

## Cross-Repository Rule

どのProjectで作業中でも、必要に応じて `oosaka0123-sudo/ai-master` を参照できます。

MasterとProjectは別Repositoryのまま維持し、進捗・仕様をコピー同期しません。

## Public / Private Boundary

`ai-master` はPublicです。

Private Repositoryの名前・存在・内部情報は、明示承認なしにこのPublic Masterへ記録しません。

## Update Rule

`CONNECT.md` を更新するのは、接続状態または実確認できた能力が変わった時だけです。

更新しない例:
- PRがマージされた
- Issueが増えた
- Project機能が完成した
- 実装が進んだ

これらは各Project Repositoryで管理します。
