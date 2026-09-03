# AGENTS.md — Global AI Governance

このファイルは `ai-master` を参照する全AIの共通運用ルールです。Project固有の仕様や進捗は各Project Repositoryを正本とします。

## GLOBAL MUST

1. GitHubをSSOTとして扱う。現在状態は対象Projectのcurrent code / Issue / PR / Actions / Commit / Project内ドキュメントから確認する。
2. OBSERVEDとHYPOTHESISを分離する。未確認のRepository、URL、ID、設定、仕様、接続状態を創作しない。
3. `PROJECTS.md` から対象Repositoryを特定し、そのRepositoryの現在default branchとローカルルールを読む。
4. 認証情報や秘密値を公開ファイル・Issue・PR・チャットへ転記しない。
5. `ai-master` はPublicである。Private Repositoryの名前・存在・内部情報を明示承認なしに公開Masterへ追加しない。
6. 作業開始時は必要な範囲でGitHub実態を確認する。古い文書と実態が違う場合、実態を現在状態の正とする。
7. MasterとProjectへ同じ仕様・進捗を複製せず、Cross-Repositoryでは正本への参照を優先する。
8. GLOBALルールとProject要求が重大に衝突し、安全に解決できない場合は差分を明示して人間へ確認する。

## GLOBAL MUST NOT

1. `STATUS.md`、`AI_CONTEXT.md`、`TASK_QUEUE.json` 等を、Issue / PR / Actionsの動的状態コピーとしてMasterへ作らない。
2. `MASTER.md`、`GLOBAL_RULES.md` 等、READMEやAGENTSと責務が重なる上位ルールファイルを増やさない。
3. Project固有の仕様、TODO、完成度、最新PR番号、最新Issue番号をMasterへ保存しない。
4. Project間で同じ情報をコピー同期して共通記憶を作らない。
5. 特定commitのpermalinkを通常の起動入口として固定しない。原則として現在default branchを読む。
6. 確認していないAI接続、権限、レビュー、テストを実施済みとして記録しない。
7. Security、SSOT、No fabrication等のGLOBALルールをProject都合で無効化しない。
8. `AGENTS.md` または `DECISIONS.md` の根幹方針を、ユーザーの明示的な方針変更なしに変更しない。

## DEFAULT — Project側で上書き可能

1. 変更は小さくレビュー可能な単位にする。
2. 可能なら Issue → Branch → Implementation → Test → PR → Review → Merge の順で進める。
3. default branchへの直接変更よりPR経由を優先する。
4. Project側の `AGENTS.md` / `DECISIONS.md` / `RUNBOOK.md` / README等のローカル運用を尊重する。
5. 複数AIが同じファイルを同時に独立編集しない。
6. AIは実際に確認・実行した範囲だけを完了として報告する。
7. 初回復元では全履歴を一括で読まず、必要情報を遅延ロードする。

## Precedence

- Global safety / SSOT / No fabrication: `ai-master/AGENTS.md` の GLOBAL MUST / MUST NOT
- Project固有の仕様・コード・進捗・設計判断: 対象Project Repository
- Projectローカル運用: Project側ルールがこのファイルの DEFAULT をそのProject内だけ上書き可能
- 現在状態: GitHub上のcurrent code / Issue / PR / Actions等の実態
- 過去チャット・LLM記憶: 参考情報。GitHubと矛盾する場合は採用しない

## New Session Protocol

1. `ai-master/README.md`
2. `ai-master/AGENTS.md`
3. `ai-master/PROJECTS.md`
4. 対象Project Repository
5. Project側の実在する開始ファイル
6. Open Issues / Open PRs / Latest Actions / current code
7. 作業開始

`CONNECT.md` と `DECISIONS.md` は必要時のみ読む。

## Master File Boundary

- `README.md`: 入口と読み込み順
- `AGENTS.md`: 共通操作ルール
- `CONNECT.md`: 実確認した接続状態・能力のみ
- `PROJECTS.md`: 公開Repository住所録のみ
- `DECISIONS.md`: Master設計の理由のみ

同じ内容を複数ファイルへ詳細に重複させない。
