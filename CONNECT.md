# CONNECT.md — AI MASTER Connection Registry

Last updated: 2026-09-03 JST

## Purpose

このファイルは、AI MASTER環境における **接続状態と利用可能な能力だけ** を管理する。

ここにはプロジェクト進捗、Issue番号、PR番号、実装状況、詳細仕様を保存しない。
各プロジェクトの現在状態は、それぞれのProject Repositoryを正本とする。

## Source of Truth Boundary

- `CONNECT.md` = 誰が、どこへ、何ができるか
- `PROJECTS.md` = どのProjectが、どのRepositoryにあるか
- `AGENTS.md` = AI共通運用ルール
- 各Project Repository = そのProjectの仕様・進捗・Issue・PR・コードの正本

同じ動的情報をMASTERとProject Repositoryの両方に保存しない。

## Status Definitions

- `CONNECTED` = 実アクセスで接続確認済み
- `READ` = 読み取り確認済み
- `WRITE` = 書き込み確認済み
- `VERIFY_ON_START` = 過去実績はあっても新しいセッション開始時に再確認する
- `DISCONNECTED` = 現在利用不可
- `BLOCKED` = 認証・権限・設定等で利用不可
- `UNKNOWN` = 未確認

---

# GitHub Master Repository

Repository:

`oosaka0123-sudo/ai-master`

Visibility:

`PUBLIC`

Default branch:

`main`

Role:

全AI・全Project共通の入口。

Status:

`CONNECTED / READ / WRITE`

Verified:

2026-09-03 JST

重要:

このMaster Repositoryは各Project Repositoryの代わりの正本ではない。
Masterは案内所・共通ルール・接続レジストリとして使用する。

---

# ChatGPT → GitHub

Status:

`CONNECTED / READ / WRITE`

Verified:

2026-09-03 JST

実アクセスで確認済みの能力:

- Repository metadata read
- Markdown / text file read
- File create / update
- Branch read / create
- Commit read
- Issue read / create / update
- Pull Request read / create / merge
- GitHub Actions / CI state read

Current limitation:

- 現在のChatGPT GitHub接続では、新規GitHub Repositoryそのものの作成機能は利用できない。
- 既存Repository作成後のファイル構築・運用は可能。

Rule:

新しいChatGPTチャットでは、過去の接続状態を信用せず、最初に `ai-master` への実アクセスを確認する。

---

# Claude Code → GitHub

Status:

`VERIFY_ON_START`

Primary role:

Implementation Agent

Expected use:

- Repository read
- Source code edit
- Branch work
- Commit
- Pull Request
- Tests

Rule:

新しいClaude Code sessionでは、接続済みと推測せず対象RepositoryへのGitHub accessを確認する。

---

# Google Jules → GitHub

Status:

`VERIFY_ON_START`

Primary role:

Implementation / Parallel Task Agent

Expected use:

- 軽量修正
- 大量処理
- Issue単位の実装
- Tests
- Pull Request

Rule:

実行開始時に対象Repositoryへの実アクセスと権限を確認する。

---

# GitHub Copilot

Status:

`VERIFY_ON_START`

Primary role:

- Pull Request review
- Code review
- Implementation support
- Lightweight fixes

Rule:

Copilotの状態をProjectの正本として使用しない。

---

# Gemini

Status:

`VERIFY_ON_START`

Primary role:

Heavy analysis / CI failure analysis / architecture analysis

Known project-specific integration may exist through GitHub Actions and Secrets, but MASTERでは「全Projectで接続済み」と推測しない。

Rule:

各ProjectでGemini integrationが必要な場合、そのProject RepositoryのActions / workflow / Secret nameの存在を実確認する。
Secret値は絶対に読み出し・表示・保存しない。

---

# Cross-Repository Access Rule

AI MASTERの目的は、どのProject Repositoryで作業中でも、必要に応じて

`oosaka0123-sudo/ai-master`

を参照し、共通ルールと接続状態を確認できること。

Project RepositoryとMASTER Repositoryは別Repositoryのまま維持する。
ファイルコピーによる進捗同期は原則行わない。

---

# New Session Startup Protocol

新しいChatGPT / Claude / Jules等のセッションでは、過去チャットの接続状態を前提にしない。

基本順序:

1. GitHub接続を実アクセスで確認
2. `oosaka0123-sudo/ai-master/CONNECT.md`
3. `oosaka0123-sudo/ai-master/AGENTS.md`
4. `oosaka0123-sudo/ai-master/PROJECTS.md`
5. 対象Project Repositoryへ移動
6. Project側の開始ファイルを読む
7. Open Issues
8. Open Pull Requests
9. Latest CI

存在しないMASTERファイルは推測で補わず、未整備として扱う。

---

# Project Repository Rule

各Project Repositoryには、MASTERへの入口だけを記録してよい。

Master Repository:

`oosaka0123-sudo/ai-master`

MASTER側へProjectの進捗をコピーしない。

---

# Security Rule

`CONNECT.md` に以下を絶対に保存しない。

- API Key
- GitHub Token
- OAuth Token
- Password
- FTP Password
- SSH Private Key
- Secret value
- Cookie
- Session ID
- 個人認証情報

保存してよいのは:

- 接続先名称
- Repository名
- Secretの名前（必要な場合のみ）
- 利用可能能力
- 接続状態
- 最終確認日

---

# Update Rule

`CONNECT.md` は **接続方式・接続状態・利用可能能力が変わったときだけ** 更新する。

更新する例:

- AI AgentのGitHub接続が実確認できた
- 書き込み権限が変わった
- 新しいAgentを追加した
- Connectorが利用不可になった

更新しない例:

- PRがマージされた
- Issueが増えた
- サイトが完成した
- プロジェクト機能が追加された

これらは各Project Repositoryで管理する。

---

## Core Principle

**MASTER = 地図と共通ルール**

**PROJECT REPOSITORY = 現在地と実作業**

この境界を崩さない。
