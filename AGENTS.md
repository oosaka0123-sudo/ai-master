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
9. コンテキスト使用率が40%以上になった場合、または40%到達を検知できない環境でも会話・作業履歴が長大化して引き継ぎ損失の危険が高いと判断した場合は、作業を止めずに、対象Project Repository内へ「完全版引き継ぎファイル」を作成または更新してから作業を継続する。Claude Codeについては `Claude Code Special Rule — Autocompact First` を優先し、初回は `/autocompact` による圧縮を先に試す。詳細は `Context Handoff Protocol` に従う。
10. 通常の実装Taskは、原則として1 Taskにつき1 Active Ownerとする。Task開始前に、同一スコープの既存Issue / Branch / Pull Requestがないか確認する。他AgentはReview / Test / Research / Alternative Proposal等を担当し、同じ実装を無断で重複しない。意図的な競争モードでは、Agentごとに別Branchで独立実装する。
11. Agent / Tool / MCP / Connectorの一部が利用不能でも、独立して安全に進められる作業まで停止しない。ただしSecurity、SSOT、仕様の重大衝突、不可逆操作など、人間判断が必要な条件では停止して確認する。未完了部分は対象Project側のIssueまたはHANDOFFへ残す。
12. Taskの担当Agentは、製品名やベンダー名に固定せず、`CONNECT.md` と対象Projectで実確認できた能力・権限・実績に基づいて選択する。未確認の能力を前提にTaskを割り当てない。
13. 完了判定はEVIDENCEを伴うこと。コード生成または編集だけで「完成」と報告してはならない。Taskに該当する範囲で Implementation / Test / Review / PR / CI / Merge / Deploy / Live Verification / Documentation を確認する。未確認項目は未確認と明記する。
14. AIが実行可能な操作は、Projectルールと安全境界の範囲内で可能な限りAIが実行する。ただし、default branchへのforce-push、Repository削除またはVisibility変更、Secret / Credential / IAM変更、Billing / 有料契約 / 課金上限変更、本番データの削除・破壊的Migration、ロールバック困難な不可逆操作、Project側でHuman Approval必須と定義された操作は、人間の明示承認なしに実行しない。通常のMergeやDeployは一律にHuman-onlyとはせず、Project側ルール、Branch Protection、CI結果、ユーザー方針で許可されている場合は実行可能とする。
15. 秘密値がCommit / Issue / PR / Actions Log / 公開ファイルへ誤って記録された可能性を検知した場合は放置しない。秘密値そのものを再掲せず、直ちにユーザーへ報告し、Key / Token / Credentialの失効・再発行等の対応要否を確認する。
16. 作業中に新しいAgent / LLM / MCP / Plugin / Connector / API等の接続または新しい能力を実アクセス・実ツール呼び出しで確認し、`CONNECT.md` が未記載または古い場合は、重複とPublic / Private境界を確認したうえで、そのSession内に短く更新する。`ai-master` へのWRITE権限がない場合は、未記載であることと追記すべき内容をユーザーへ報告する。

## GLOBAL MUST NOT

1. `STATUS.md`、`AI_CONTEXT.md`、`TASK_QUEUE.json` 等を、Issue / PR / Actionsの動的状態コピーとしてMasterへ作らない。
2. `MASTER.md`、`GLOBAL_RULES.md` 等、READMEやAGENTSと責務が重なる上位ルールファイルを増やさない。
3. Project固有の仕様、TODO、完成度、最新PR番号、最新Issue番号をMasterへ保存しない。
4. Project間で同じ情報をコピー同期して共通記憶を作らない。
5. 特定commitのpermalinkを通常の起動入口として固定しない。原則として現在default branchを読む。
6. 確認していないAI接続、権限、レビュー、テストを実施済みとして記録しない。
7. Security、SSOT、No fabrication等のGLOBALルールをProject都合で無効化しない。
8. `AGENTS.md` または `DECISIONS.md` の根幹方針を、ユーザーの明示的な方針変更なしに変更しない。
9. 同一原因・同一手段で失敗を無限に繰り返さない。同一アプローチで2回連続して失敗した場合は、OBSERVED / HYPOTHESIS / NEXT ACTIONを整理し、別手段・別Agent・別Tool・人間確認のいずれかへ切り替える。
10. 新しい外部依存Package、Action、CDN、MCP、外部Serviceを、出所・必要性・安全性を確認せず自律的に導入しない。

## DEFAULT — Project側で上書き可能

1. 変更は小さくレビュー可能な単位にする。
2. 可能なら Issue → Branch → Implementation → Test → PR → Review → Merge の順で進める。
3. default branchへの直接変更よりPR経由を優先する。
4. Project側の `AGENTS.md` / `DECISIONS.md` / `RUNBOOK.md` / README等のローカル運用を尊重する。
5. 複数AIが同じファイルを同時に独立編集しない。
6. AIは実際に確認・実行した範囲だけを完了として報告する。
7. 初回復元では全履歴を一括で読まず、必要情報を遅延ロードする。
8. 長時間または複数AIが関与するTaskは、必要に応じてGitHub Issueを作業アンカーとして利用する。小さな単発修正まで一律にIssue必須とはしない。
9. 進捗報告は必要に応じて COMPLETED / CURRENT / NEXT / BLOCKER / EVIDENCE の順で簡潔に行う。「作業中です」だけで終わらず、可能な操作を実行したうえで実確認済みの状態を報告する。
10. 新規Projectでは規模に応じて文書を作る。最小構成はREADME.mdと必要なProjectローカルルールとし、DECISIONS.md / RUNBOOK.md / HANDOFF.md等は必要になった時点で作成する。形式だけの空ファイルを増やさない。
11. ユーザーから「このチャット内容をリポジトリに保存して」または同等の保存指示を受けた場合、会話ログをそのまま保存しない。内容を確定仕様・重要な設計判断・再利用可能な運用手順・未完了の引き継ぎに分類し、対象Projectの既存の正本へ差分反映する。仕様はProjectの仕様書/README等、設計理由は必要時のみDECISIONS、手順は必要時のみRUNBOOK、一時状態はProject既定のHANDOFFへ保存する。Issue / PR / Actions / Commitで復元できる作業履歴はMarkdownへ重複保存しない。空ファイルを先回りで作らず、保存後は変更先と省略した情報をユーザーへ要約する。

## Context Handoff Protocol — 40% Rule

このルールは ChatGPT / Claude / Gemini / Jules / Codex / Copilot、および本Masterを参照して作業するその他のLLM・AIエージェントすべてに適用します。

### Trigger

次のいずれかに該当したら、引き継ぎ作成を必須とします。

1. 実行環境で確認できるコンテキスト使用率が **40%以上** になった。
2. 使用率を直接確認できない環境でも、長時間セッション、大量の会話履歴、多数のファイル変更、複数Issue/PR、複数エージェント連携などにより、現在の文脈を次のセッションへ安全に渡せない危険が高いと判断した。
3. セッション終了、モデル切替、別AIへの担当変更、別チャットへの移動、長時間中断など、文脈が切れる可能性がある。

40%到達は「作業終了」の意味ではありません。**先に完全版引き継ぎを保存し、その後も安全に作業を続行します。** ただしClaude Codeの初回到達時は、直後の特例を先に適用します。

### Claude Code Special Rule — Autocompact First

Claude Codeでは、長時間作業をできるだけ同一セッション内で継続するため、コンテキスト管理を二段階で行います。

1. **初回の40%到達時は `/autocompact` を最優先で積極的に使用する。**
   - いきなりセッション終了や完全版引き継ぎへ移行せず、まずコンテキストを圧縮して作業継続を試みる。
   - `/autocompact` が利用可能な環境では、Claude Code自身が保持している重要な作業文脈を圧縮し、残りコンテキストを確保する目的で使用する。
   - 圧縮後は、現在のbranch、未コミット変更、Issue / PR、直近の実装目的を再確認してから作業を続行する。

2. **一度 `/autocompact` を使用した後、再び40%以上になった場合は完全版引き継ぎを作成または更新する。**
   - 2回目以降は圧縮だけに依存せず、Project Repository内の `HANDOFF.md` またはProject既定の引き継ぎファイルへ完全版を保存する。
   - 引き継ぎ保存後も、コンテキストに余裕があり安全に続行できる場合は作業を止めない。

3. 次の場合は「初回」であっても `/autocompact` だけに依存せず、完全版引き継ぎを作成する。
   - `/autocompact` が利用できない、失敗した、または十分な圧縮効果を確認できない。
   - セッション終了、別AIへの担当変更、モデル切替、別チャット移動が予定されている。
   - 大量の未コミット変更、複数の重要判断、長時間作業などにより、圧縮だけでは復元不能になる危険が高い。

4. `/autocompact` はGitHubのSSOTや `HANDOFF.md` の代替ではない。
   - `/autocompact` は「同一Claude Codeセッションを長く安全に使うためのコンテキスト圧縮手段」として扱う。
   - Projectの現在状態は常にGitHubのcurrent code / Issue / PR / Actions / Commitを正とする。

Claude Codeの標準フローは、原則として **初回40% → `/autocompact` → 作業継続 → 再度40% → 完全版HANDOFF作成/更新 → 必要に応じて作業継続** とします。

### Where to save

- 引き継ぎファイルは **現在作業中の対象Project Repository内** に保存する。
- `ai-master` へProject固有の進捗や仕様をコピーしない。
- Project側に既存の引き継ぎファイル名・保存場所のルールがある場合は、それを最優先する。
- 既存ルールがない場合は、Project Repository内の `HANDOFF.md` を標準名とする。
- 複数AIが同時作業して競合する場合は、`docs/handoffs/<YYYY-MM-DD-HHMM>_<agent>_HANDOFF.md` のように衝突しない名前を使用し、必要に応じてProject側の `HANDOFF.md` から最新ファイルを案内する。

### What the complete handoff must contain

「完全版引き継ぎ」は、次の担当AIが過去チャットを読めなくても、安全に作業再開できる内容にする。

1. **Project識別**
   - Repository名
   - current default branch
   - 現在作業ブランチ
   - 関連Issue / PR（実確認できたものだけ）

2. **目的と現在のゴール**
   - ユーザーが最終的に実現したいこと
   - 今回の作業範囲
   - 完了条件

3. **現在状態（OBSERVED）**
   - 実際に確認したコード、設定、Issue、PR、Actions、テスト結果
   - 完了済み作業
   - 未完了作業
   - 現在のブロッカー

4. **変更内容**
   - 変更したファイル
   - 変更理由
   - 重要な実装判断
   - 互換性や影響範囲

5. **ユーザー確定事項・禁止事項**
   - ユーザーが明示的に決めた仕様
   - 変更してはいけない条件
   - 優先順位
   - 表記・デザイン・運用上の固定ルール

6. **検証状況**
   - 実行したテスト
   - 成功 / 失敗
   - 未実施の検証
   - CI / Actionsの状態

7. **次にやること**
   - 次の担当AIが最初に読むファイル
   - 最初に確認するGitHub実態
   - 次の具体的な1〜5ステップ
   - 途中で止まっている作業の再開地点

8. **リスク・注意点**
   - 壊れやすい箇所
   - 未確認事項
   - 推測が混じる箇所は `HYPOTHESIS` と明記
   - 認証・秘密情報・本番影響に関する注意

9. **再開用最短メッセージ**
   - 新しいチャットや別AIに、そのまま渡せる短い再開指示を最後に付ける。
   - 例: 「`ai-master` を読み、対象Projectの `HANDOFF.md` とGitHub current stateを確認して、未完了の次ステップから再開する。」

### Accuracy rules

- 引き継ぎ作成前に、可能な範囲でGitHubのcurrent code / Issue / PR / Actions / Commitを再確認する。
- 過去チャットだけを根拠に「完了」「接続済み」「テスト成功」と書かない。
- 確認済み事実は `OBSERVED`、推測や未確認事項は `HYPOTHESIS` と分ける。
- パスワード、APIキー、Token、Cookie、秘密鍵、認証ヘッダー、個人情報等の秘密値は絶対に引き継ぎファイルへ書かない。
- 引き継ぎファイル自体はSSOTではない。GitHubのcurrent code / Issue / PR / Actions等と矛盾した場合は、GitHub実態を優先して引き継ぎを更新する。

### Refresh rule

40%到達時に1回作って終わりではなく、その後に次の大きな変化があった場合は引き継ぎを更新する。

- 重要な設計判断をした
- 大きな実装を完了した
- Issue / PRの状態が変わった
- テスト結果が変わった
- ブロッカーが発生または解消した
- 別AIへ担当を渡す
- セッション終了前

目的は「文章を残すこと」ではなく、**どのLLM・どのAIエージェントに切り替わっても、GitHubを確認しながら迷わず安全に作業を再開できる状態を維持すること**です。

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