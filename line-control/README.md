# LINE Project Control Center

GitHubを正本のまま、LINEから複数Projectの状態確認・再開操作・停止通知を行うための管制塔です。

## できること

- GitHub APIからアクセス可能Repositoryを毎回取得し、新規Repositoryを自動検出
- archived Repositoryは既定で除外
- `GITHUB_OWNER` を設定した場合はそのOwnerだけに絞り込み
- Issue / PR / Actions / Commitのライブ情報から信号判定
  - 🟢 green: 正常
  - 🟡 yellow: open workがあり、一定時間活動なし
  - 🔴 red: 最新CIが失敗・cancel・timeout等
  - 🔵 blue: `needs-approval` 等のHuman Gate、またはActions `action_required`
- LINEで「管制盤」と送るとFlexメッセージの一覧を返信
- 各Repositoryに `▶ 進めて` / `↻ 再開` / `🔧 再実行` ボタン
- 一括操作: `黄色を全部進める` / `赤を全部再実行`
- 停止・CI失敗・Human Gateを定期監視し、条件成立直後だけLINE Push通知
- `continue` / `resume` は中央 `rss7-ai-control-runner` Cloud Run Jobを起動し、Claude実装を別実行として開始
- `retry_failed` は対象Project自身の最新失敗Workflowについてfailed jobsだけ再実行
- LINE webhook署名検証 + 許可ユーザーID allowlist

## 重要な設計

`ai-master` には動的なSTATUSコピーを保存しません。LINEで管制盤を要求された時点、または監視チェック時点でGitHub APIから現在状態を取得します。Private Repository名や状態をPublic Masterへ永続化しません。

公開Web画面から操作する方式はMVPでは採用しません。制御命令はLINE Platformが署名したWebhook経由だけで受け付け、さらに `LINE_ALLOWED_USER_IDS` に一致するユーザーだけを許可します。

長時間のClaude実装をLINE webhook内で待たせません。LINEはCloud Run Jobを起動した時点ですぐ返信し、実装は独立したJob executionで継続します。

## 必要な環境変数

```text
CONTROL_GITHUB_TOKEN=...
GITHUB_API_MODE=user
GITHUB_OWNER=oosaka0123-sudo
CONTROL_JOB_PROJECT=rss7-ai-orchestrator
CONTROL_JOB_REGION=asia-northeast1
CONTROL_JOB_NAME=rss7-ai-control-runner
STALLED_MINUTES=45
MONITOR_INTERVAL_MINUTES=15
PORT=8787
LINE_CHANNEL_SECRET=...
LINE_CHANNEL_ACCESS_TOKEN=...
LINE_ALLOWED_USER_IDS=Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

複数人を許可する場合は `LINE_ALLOWED_USER_IDS` をカンマ区切りにします。

### CONTROL_GITHUB_TOKEN

推奨は専用GitHub Appまたは必要最小権限のfine-grained tokenです。Repository一覧/metadata/Issues/PR/Actionsの読み取りと、対象Projectの失敗Actions再実行に必要な権限を持たせます。再開Jobの起動はGoogle Cloudのサービスアカウント権限で行います。

SecretはRepositoryファイル、Issue、PR本文へ書かず、デプロイ先のSecret/Environment Variablesへ保存してください。

## 起動

```bash
cd line-control
npm test
npm start
```

`npm start` でWebhookサーバーと自動監視が同時に起動します。`GET /health` が `{"ok":true}` を返せばプロセスは稼働しています。LINE webhookは `POST /webhook/line` です。

## 自動通知

監視間隔は `MONITOR_INTERVAL_MINUTES`、停滞判定は `STALLED_MINUTES` で調整します。

通知対象:

- 🟡 停滞: `STALLED_MINUTES` を越えた直後の監視窓だけ通知
- 🔴 CI失敗: 最新Workflow失敗直後だけ通知
- 🔵 Human Gate: 承認待ち・人間操作待ちが発生した直後だけ通知

古い停止状態を毎回通知し続けないよう、永続的な通知履歴を保存せず「条件成立直後の時間窓」で判定します。サービス再起動時も古い障害を大量再通知しにくい設計です。

## LINE設定

1. LINE DevelopersでMessaging API Channelを作成
2. Webhook URLを `https://<host>/webhook/line` に設定
3. Channel Secret / Channel Access Tokenをデプロイ環境のSecretへ設定
4. 自分のLINE user IDを `LINE_ALLOWED_USER_IDS` に設定
5. LINE公式アカウントへ `管制盤` と送信
6. 表示されたFlexカードから操作

Secret/IAM変更はHuman Gateです。このRepositoryでは秘密値そのものを保存しません。

## 一括操作の安全境界

- `黄色を全部進める`: 停滞判定されたRepositoryだけを中央Cloud Run Jobへ投入
- `赤を全部再実行`: CI失敗判定されたRepositoryだけでfailed jobsを再実行
- 🔵 Human Gateは一括自動処理しない
- 🟢 正常Projectは一括操作対象にしない
- Repository削除、Visibility変更、Secret/IAM/Billing変更、force-push等の破壊的操作は実装しない

## 中央Cloud Run Jobによる再開

`continue` / `resume` は対象Project自身へdispatchせず、`rss7-ai-orchestrator` Projectの `rss7-ai-control-runner` Jobを実行します。

Job起動時に `CONTROL_REPOSITORY=<target owner/repo>` と `CONTROL_COMMAND=continue|resume` だけをoverrideし、GitHub tokenとAnthropic API keyはJob側のSecret Manager参照を使用します。LINE側へ秘密値を渡しません。

中央Jobは対象Repositoryのcurrent default branch、Projectルール、Open Issues、Open PRs、最新Actions、現在コードを確認し、明確で安全な未完了作業だけをClaude Agentへ再委任します。結果は新規branch + Pull Requestまでで停止し、自動merge・本番deployは行いません。

対象Project側のlistenerは不要です。新しいRepositoryも中央JobのGitHub credentialがアクセスできれば、個別セットアップなしで「進めて」「再開」の対象になります。LINE管制塔のサービスアカウントにはJob単位で `roles/run.jobsExecutorWithOverrides` のみ付与します。

## 信号判定の誤検知対策

単に「最終commitが古い」だけでは停止扱いにしません。open Issue / PR / 実行中Workflowなどのopen workが存在するときだけ停滞判定を行います。完成済み・休止中Repositoryが大量に黄色になるのを避けます。

## 新規Repository

固定リストは使いません。GitHub APIのアクセス可能Repository集合を毎回取得するため、新しいRepositoryが増えると次回の監視・`管制盤` 更新から自動で表示対象になります。archived Repositoryは除外されます。

「表示だけ自動」ではなく、中央Orchestratorキューを使うため再開操作もProject側listenerなしで自動対応します。ただし、中央Orchestratorの専用GitHub credentialがそのRepositoryへアクセスできることが前提です。

## 残る本番設定

- HTTPSで常時起動できるLINE管制塔のデプロイ先
- LINE Channel Secret / Access Token / allowlist
- LINE管制塔用GitHub credential
- 中央Orchestrator Actions用 `ORCHESTRATOR_GITHUB_TOKEN` / `ANTHROPIC_API_KEY`

これらSecret/IAM設定はHuman Gateで行い、値そのものはRepositoryへ保存しません。
