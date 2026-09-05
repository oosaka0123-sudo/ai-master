# DECISIONS.md — AI Master Architecture Decisions

このファイルは **なぜこのMaster設計を採用したか** を記録するADRです。

日常の操作命令は `AGENTS.md` を正本とします。ここへ進捗やProject固有判断を記録しません。

## ADR-001: Masterは案内所と共通ガバナンスに限定する

- Status: Accepted
- Decision: `ai-master` は共通入口、共通安全ルール、接続レジストリ、公開Repository住所録だけを持つ。
- Reason: Project固有情報をMasterへ複製すると二重管理になり、どちらが最新かLLMが判断できなくなるため。

## ADR-002: 最小5ファイル構成を採用する

- Status: Accepted
- Decision: `README.md` / `AGENTS.md` / `CONNECT.md` / `PROJECTS.md` / `DECISIONS.md` の5ファイルを基本構成とする。
- Reason: 入口、操作ルール、接続状態、住所録、設計理由の責務を分離しつつ、上位ルールファイルを増やしすぎないため。

## ADR-003: MASTER.md / GLOBAL_RULES.mdを作らない

- Status: Accepted
- Decision: READMEとAGENTSに責務が重なる上位ファイルを追加しない。
- Reason: 同じルールが複数箇所に存在すると優先順位が曖昧になり、更新漏れが起こるため。

## ADR-004: MasterにSTATUS.md / AI_CONTEXT.mdを作らない

- Status: Accepted
- Decision: 動的な進捗の手動コピーをMasterに保持しない。
- Reason: GitHubのIssue / PR / Actions / Commitが現在状態の正本として既に存在するため。

## ADR-005: Project固有情報は各Project Repositoryだけで管理する

- Status: Accepted
- Decision: 仕様、コード、進捗、TODO、Project固有の設計判断は対象Project Repositoryを正本とする。
- Reason: Cross-Repository環境でもSSOTを維持するため。

## ADR-006: 新規セッションは遅延ロードする

- Status: Accepted
- Decision: README → AGENTS → PROJECTS → 対象Project → Project側の正本、の順で必要な情報だけ読む。CONNECTとDECISIONSはオンデマンド。
- Reason: Project数が増えても初回コンテキストを小さく保つため。

## ADR-007: 優先順位は情報のスコープで決める

- Status: Accepted
- Decision:
  - Global safety / SSOT / No fabricationはMaster AGENTSのGLOBALルールを優先する。
  - Project固有の仕様・コード・進捗はProject Repositoryを優先する。
  - Project側ルールはMaster AGENTSのDEFAULTだけをローカル上書きできる。
  - 現在状態はGitHub実態を優先し、過去チャットは正本にしない。
- Reason: 単純なファイル順ではなく、責務の境界で競合を解決するため。

## ADR-008: Cross-Repositoryはコピーではなく参照する

- Status: Accepted
- Decision: MasterはRepository名を案内し、Projectは必要に応じてMasterを参照する。同じ仕様や進捗をコピー同期しない。
- Reason: 同期処理そのものを不要にし、情報乖離を防ぐため。

## ADR-009: 起動時は現在default branchを読む

- Status: Accepted
- Decision: 通常起動の参照先を特定commit permalinkへ固定しない。
- Reason: permalink固定では古いルールを読み続ける可能性があるため。

## ADR-010: Public MasterからPrivate Repository情報を保護する

- Status: Accepted
- Decision: Private Repositoryの名前・存在・内部情報を、明示承認なしにPublic Masterへ登録しない。
- Reason: Masterを誰でも読めるPublic入口として維持しながら、Private Projectのメタデータ露出を避けるため。

## ADR-011: 根幹ガバナンス変更は人間方針を必要とする

- Status: Accepted
- Decision: `AGENTS.md` と本ファイルの根幹方針は、ユーザーの明示的な方針変更を根拠に更新する。
- Reason: AIが自分の統制ルールを黙って緩める構造を避けるため。

## ADR-012: Multi-Agent Execution Boundariesを採用する

- Status: Accepted
- Decision:
  - 通常の実装Taskは原則として `1 Task = 1 Active Owner` とし、競争モードのみ別Branchでの独立実装を許可する。
  - Task担当は特定Agent名へ固定せず、`CONNECT.md` と対象Projectで実確認できた能力・権限・実績に基づく Capability-based Routing を採用する。
  - 完了判定はコード生成ではなく、Taskに該当する Test / Review / PR / CI / Merge / Deploy / Live Verification 等のEVIDENCEに基づく。
  - AIが安全に実行可能な通常操作は可能な限りAIが完遂し、不可逆・秘密・権限・課金・破壊的操作にはHuman Gateを維持する。
  - 同一原因・同一手段の失敗を繰り返さず、一定回数で別手段・別Agent・人間確認へ切り替えるCircuit Breakerを採用する。
- Reason: Agent数・Project数が増えても、重複作業、古い能力前提、無限リトライ、未検証の完了報告、過度な人間操作、破壊的自動実行を防ぎながら、安全に可能な作業は自律継続できる状態を維持するため。
- Agent Mapping: Claude Code / Jules / Codex / Copilot / Gemini等の製品名と役割はMasterの不変ルールとして固定しない。現在の能力と接続状態は `CONNECT.md` と対象ProjectのGitHub実態を正とする。
- Automation Boundary: 通常のGitHub操作はProjectルール・Branch Protection・CI・ユーザー方針で許可される範囲に限りAI実行を許可する。force-push、Repository削除・Visibility変更、Secret / IAM / Billing変更、本番データ削除・破壊的Migration等の不可逆または高リスク操作は人間の明示承認を必要とする。

## ADR-013: PC電源OFF運用はGitHub Actions / API優先とする

- Status: Accepted
- Decision:
  - 定型処理、監視、データ取得、更新、デプロイ、検証など、ブラウザUI操作を必要としない作業は GitHub Actions / API / Connector / MCP を第一選択とする。
  - ブラウザ操作は API や GitHub 操作で代替できない場合の補助経路とし、PCローカルのブラウザや常時起動PCを24/7運用の必須依存にしない。
  - Opera Browser Connector はPC起動時の補助経路として利用可能だが、全Project共通の常時運用基盤とはみなさない。
  - ChatGPT Work / Cloud Browser等のクラウドブラウザも、ブラウザ操作が必要な場合の補助経路とし、常用を前提にしない。
  - Secrets / Credential / IAM / Billingなどの既存Human Gateはこの方針変更によって緩和しない。
- Reason: PC電源OFFでも継続可能な自動化を増やし、ローカル端末・ブラウザセッション・UI変更への依存を減らしつつ、トークン・運用コスト・障害点を抑えるため。
- Execution Preference: Project側で同等の目的を達成できる場合は、GitHub Actions / API / Connector / MCP → クラウドブラウザ → ローカルブラウザの順で優先度を判断する。ただし、対象ProjectのSecurity・規約・API制約・コスト・実装難易度に応じてProject側で安全に上書き可能とする。
