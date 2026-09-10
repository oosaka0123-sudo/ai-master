# LINE Project Control Center

GitHubを正本のまま、LINEから複数Projectの状態確認と安全な再開操作を行うための最小実装です。

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
- `continue` / `resume` は `repository_dispatch(event_type=ai-control)` を送信
- `retry_failed` は最新の失敗Workflowについてfailed jobsだけ再実行
- LINE webhook署名検証 + 許可ユーザーID allowlist

## 重要な設計

`ai-master` には動的なSTATUSコピーを保存しません。LINEで管制盤を要求された時点でGitHub APIから現在状態を取得します。Private Repository名や状態をPublic Masterへ永続化しません。

公開Web画面から操作する方式はMVPでは採用しません。制御命令はLINE Platformが署名したWebhook経由だけで受け付け、さらに `LINE_ALLOWED_USER_IDS` に一致するユーザーだけを許可します。

## 必要な環境変数

```text
CONTROL_GITHUB_TOKEN=...
GITHUB_API_MODE=user
GITHUB_OWNER=oosaka0123-sudo
STALLED_MINUTES=45
PORT=8787
LINE_CHANNEL_SECRET=...
LINE_CHANNEL_ACCESS_TOKEN=...
LINE_ALLOWED_USER_IDS=Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

複数人を許可する場合は `LINE_ALLOWED_USER_IDS` をカンマ区切りにします。

### CONTROL_GITHUB_TOKEN

推奨は専用GitHub Appまたは必要最小権限のfine-grained tokenです。Repository一覧/metadata/Issues/PR/Actionsの読み取りに加え、LINEから操作するRepositoryにはrepository dispatchとActions再実行に必要なwrite権限が必要です。

SecretはRepositoryファイル、Issue、PR本文へ書かず、デプロイ先のSecret/Environment Variablesへ保存してください。

## 起動

```bash
cd line-control
npm test
npm start
```

`GET /health` が `{"ok":true}` を返せばプロセスは稼働しています。LINE webhookは `POST /webhook/line` です。

## LINE設定

1. LINE DevelopersでMessaging API Channelを作成
2. Webhook URLを `https://<host>/webhook/line` に設定
3. Channel Secret / Channel Access Tokenをデプロイ環境のSecretへ設定
4. 自分のLINE user IDを `LINE_ALLOWED_USER_IDS` に設定
5. LINE公式アカウントへ `管制盤` と送信
6. 表示されたFlexカードから操作

Secret/IAM変更はHuman Gateです。このRepositoryでは秘密値そのものを保存しません。

## 一括操作の安全境界

- `黄色を全部進める`: 停滞判定されたRepositoryだけに `continue` を送る
- `赤を全部再実行`: CI失敗判定されたRepositoryだけでfailed jobsを再実行
- 🔵 Human Gateは一括自動処理しない
- 🟢 正常Projectは一括操作対象にしない
- Repository削除、Visibility変更、Secret/IAM/Billing変更、force-push等の破壊的操作は実装しない

## Project側の再開受口

`continue` / `resume` は各Projectへ `repository_dispatch` を送ります。Project側で実作業を再開するには、そのRepositoryに `repository_dispatch: ai-control` を受けるWorkflowまたはAgent bridgeが必要です。

最小例:

```yaml
name: AI Control
on:
  repository_dispatch:
    types: [ai-control]

jobs:
  control:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Show command
        run: echo "command=${{ github.event.client_payload.command }}"
      # Project固有Agentへの安全な橋渡しをここへ追加
```

外部Agent呼び出しは各Projectの権限・Secret・Human Gateを尊重します。

## 信号判定の誤検知対策

単に「最終commitが古い」だけでは停止扱いにしません。open Issue / PR / 実行中Workflowなどのopen workが存在するときだけ停滞判定を行います。完成済み・休止中Repositoryが大量に黄色になるのを避けます。

## 新規Repository

固定リストは使いません。GitHub APIのアクセス可能Repository集合を毎回取得するため、新しいRepositoryが増えると次回の `管制盤` 更新から自動で表示対象になります。archived Repositoryは除外されます。

## 次段階

- HTTPSで常時起動できるデプロイ先を決定
- LINE Channel Secret / Access Token / allowlistをHuman Gateで設定
- GitHub専用credentialをHuman Gateで設定
- 対象Projectへ `repository_dispatch` listenerを段階的に配布
- Claude Code / Codex / Jules等、Projectごとの実Agent bridgeを追加
- 停止条件を定期監視し、異常時だけLINE Push通知する
