# AI Master Docs

このディレクトリは、rootの共通ガバナンスを補助する **詳細標準・運用記録・技術文書** の置き場です。

rootの正本は `README.md` / `AGENTS.md` / `CONNECT.md` / `PROJECTS.md` / `DECISIONS.md` / `AI_COUNCIL.md` です。新しい上位ルールを `docs/` に増やさないでください。

## Active Standards

- [Web Development Standard](standards/WEB_DEVELOPMENT.md) — 全Web制作案件の共通制作・品質・レビュー標準
  - 旧root path WEB_DEVELOPMENT.md は外部参照保護のため互換shimとして残します。新規参照はcanonical pathを使用します。

## Operations

- [KS03 Current State](operations/KS03_CURRENT_STATE.md) — Primary Local Windows NodeであるKS03の移行・運用スナップショット

## Application

- [LINE Control](../line-control/README.md) — このRepository内の実装コンポーネント

## Protocol Note

Continuous AI ProtocolのMasterコピーは保持しません。Git history上、`docs/CONTINUOUS-AI-PROTOCOL.md` は「project-localに保つ」方針で意図的にrevertされています。Project固有の実行詳細は各Project RepositoryのAGENTS / DECISIONS / RUNBOOK等を正本とします。

## Placement Rule

- root: 共通入口・必須ガバナンス・接続レジストリ・Project住所録・ADR・Council gate
- `docs/standards/`: 複数Projectで使う詳細標準
- `docs/operations/`: 端末・運用のスナップショットや引き継ぎ記録
- Project固有情報: 各Project Repository
