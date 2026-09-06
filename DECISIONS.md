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

## ADR-014: 従量課金型の外部独立レビューは重要変更へ選択的に使う

- Status: Accepted
- Decision:
  - 従量課金型の外部AIレビューを全PRへ常時自動実行せず、変更リスクと独立レビューの価値が高い場合に選択的に利用する。
  - PHP / API / JavaScript等の障害に直結しやすい変更、複数ページにまたがる大規模テンプレート変更、クライアント納品前・本番公開前、原因不明エラーや再発問題、Security / 認証周辺の重要変更では利用を優先する。
  - 単純な誤字、1行だけのテキスト変更、軽微なCSS調整、制作途中の下書き保存では原則利用しない。
  - 標準フローは「要件整理・指示 → 実装Agent → PR → リスクに応じて有料独立レビュー → 最終判断 → Merge」とする。
  - 特定ベンダーを恒久固定せず、現在利用可能なClaude API等を `CONNECT.md` とProject実態に基づいて選ぶ。Project側でより厳しいレビュー要件がある場合はそれを優先する。
- Reason: 独立レビューの品質メリットを残しながら、低リスク変更への不要なAPI呼び出し、トークン消費、従量課金、待ち時間を抑え、重要な変更へレビュー予算を集中するため。

## ADR-015: Mobile First / Cloud First を開発原則として正式化する

- Status: Accepted（ユーザーの明示的な方針決定に基づく。`AGENTS.md` GLOBAL MUST NOT 8の
  「根幹方針はユーザーの明示的な方針変更なしに変更しない」の例外条件を満たす）
- Decision:
  - 原則として、ユーザーがスマートフォンだけから
    「指示 → AI作業 → GitHub変更 → テスト → 承認 → デプロイ」まで完結できる環境を目指す。
  - 以下をMobile First / Cloud Firstの共通原則として扱う。
    1. ローカルPC依存を可能な限り排除する。
    2. GitHubを開発の中心（SSOT・作業場所）にする。
    3. Claude Codeは可能な限りクラウド実行（Claude Code on the web等）を利用する。
    4. Coworkはクラウド上のオーケストレーションを担当する。
    5. MCPはRemote HTTP / cloud-compatible構成を優先する。
    6. localhost依存のMCPは、可能ならRemote MCPへ移行する。
    7. テスト・ビルド・デプロイはGitHub Actions等のクラウド実行基盤へ移す。
    8. Secretは `.env` 直書きではなくGitHub Secrets / 環境変数等のクラウド側Secret管理で扱う。
    9. PCでしか実行できない処理を発見した場合、まずクラウド化・Remote化できないか検討する。
    10. スマートフォンから最終承認できるワークフロー（PRレビュー・承認・マージ・デプロイの
        承認操作等）を優先する。
  - この原則は既存のADR-013（PC電源OFF運用はGitHub Actions/API優先とする）を否定・置換せず、
    その適用範囲を「PC電源OFF時の運用」から「開発ライフサイクル全体のスマートフォン完結」へ
    明示的に拡張したものとして扱う。ADR-013はそのまま有効とする。
  - この原則はDEFAULT相当（Project側で安全に上書き可能）とし、`AGENTS.md` のDEFAULT節に
    要約と本ADRへのポインタを追記する。ハードウェア制約・規約・安全境界等、正当な理由が
    Project側にある場合はProjectローカルルールで上書きできる。
  - この原則は既存のHuman Gate / Automation Boundary（ADR-012、`AGENTS.md` GLOBAL MUST 14）を
    緩和しない。スマートフォンからの「最終承認」は承認操作を行う端末の柔軟性を指すものであり、
    force-push、Repository削除・Visibility変更、Secret/IAM/Billing変更、本番データ削除・
    破壊的Migration等、人間の明示承認が必要な操作の対象範囲自体を変更するものではない。
- Reason: ユーザーがPCを常時起動・携行しなくても、スマートフォンだけでAI開発の主要な
  サイクル（指示・実装・テスト・承認・デプロイ）を完結できる状態を、個別プロジェクトごとの
  場当たり的な対応ではなく、AI開発基盤全体の明示的な共通原則として位置づけるため。
- Impact:
  - 新規MCP・Connectorはlocalhost/常時稼働PC依存を避け、Remote HTTP MCPまたはクラウド
    ホスティングを優先して設計・提案する。
  - 既存のlocalhost依存MCP・ローカル専用スクリプトは、対象Project側で棚卸しし、
    Remote化・クラウド化の可否を評価する（このADR自体はMasterへ進捗を記録しない。
    棚卸し結果・実装状況は各Project Repository側で管理する）。
  - 本ADRはMasterの共通原則を追加するものであり、Project固有の棚卸し表・進捗・
    実装状況をMasterへコピーしない（ADR-001/ADR-005と整合）。
