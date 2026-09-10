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
- モバイル向けダッシュボード
- `continue` / `resume` は `repository_dispatch(event_type=ai-control)` を送信
- `retry_failed` は最新の失敗Workflowについてfailed jobsだけ再実行
- LINE Messaging APIのpostback webhook受信と署名検証

## 重要な設計

`ai-master` には動的なSTATUSコピーを保存しません。画面を開いた時にGitHub APIから現在状態を取得します。Private Repository名や状態をPublic Masterへ永続化しません。

## 必要な環境変数

```text
CONTROL_GITHUB_TOKEN=...
GITHUB_API_MODE=user
GITHUB_OWNER=oosaka0123-sudo
STALLED_MINUTES=45
PORT=8787
PUBLIC_BASE_URL=https://your-control.example.com
LINE_CHANNEL_SECRET=...
LINE_CHANNEL_ACCESS_TOKEN=...
```

### CONTROL_GITHUB_TOKEN

推奨は専用GitHub Appまたは必要最小権限のfine-grained tokenです。Repository一覧/metadata/contents/Issues/PR/Actionsの読み取りに加え、LINEから操作するRepositoryにはrepository dispatchとActions再実行に必要なwrite権限が必要です。

SecretはRepositoryファイル、Issue、PR本文へ書かず、デプロイ先のSecret/Environment Variablesへ保存してください。

## 起動

```bash
cd line-control
npm test
npm start
```

ブラウザで `/` を開くとライブ管制盤、`/api/status` でJSON、`/health` でヘルスチェックを確認できます。

## LINE設定

1. LINE DevelopersでMessaging API Channelを作成
2. Webhook URLを `https://<host>/webhook/line` に設定
3. Channel SecretとChannel Access Tokenをデプロイ環境のSecretに設定
4. LIFF Endpoint URLを `https://<host>/` に設定
5. LINE公式アカウントのリッチメニューからLIFFを開く

Secret/IAM変更はHuman Gateです。このRepositoryでは秘密値そのものを保存しません。

## Project側の再開受口

`continue` / `resume` は各Projectへ `repository_dispatch` を送ります。Project側で実作業を再開するには、各Repositoryへ次のようなWorkflowを置き、そのProjectの実行Agentへ橋渡しします。

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

外部Agent呼び出しは各Projectの権限・Secret・Human Gateを尊重し、無条件の破壊的自動操作にはしません。

## 信号判定の誤検知対策

単に「最終commitが古い」だけでは停止扱いにしません。open Issue / PR / 実行中Workflowなどのopen workが存在するときだけ停滞判定を行います。これにより完成済み・休止中Repositoryが大量に黄色になるのを避けます。

## 次段階

- デプロイ先を決定してHTTPS公開
- LINE Channel Secret / Access TokenをHuman Gateで設定
- GitHub専用credentialをHuman Gateで設定
- 対象Projectへ `repository_dispatch` listenerを段階的に配布
- 実Agentごとの「進めて」ブリッジを追加
- 停止時のLINE Push通知を追加
