# WEB_DEVELOPMENT.md

## 目的

この文書は、`oosaka0123-sudo/ai-master` 配下で扱う **すべてのWeb制作案件に共通する制作標準** を定義する。

Project固有の仕様・進捗・URL・実装状態は各Project Repositoryを正本とし、この文書にはコピーしない。

この文書の目的は、AIや担当者が変わっても、Web制作の品質・進め方・確認基準を一定に保つこと。

---

## 1. 基本原則

Web制作は次の優先順位で判断する。

1. **User Value** — 初見ユーザーが目的を達成できること
2. **Usability** — モバイルを含め迷わず使えること
3. **Content Quality** — 内容が正確で、十分に深く、理解しやすいこと
4. **Performance** — 表示が速く、操作が軽いこと
5. **Accessibility** — 年齢・端末・環境に左右されにくいこと
6. **SEO / Discoverability** — 検索エンジンと人の両方が内容を理解できること
7. **Visual Quality** — 信頼感・専門性・ブランド性を損なわないこと
8. **Maintainability** — 後から安全に修正・拡張できること

見た目だけを先に作り込み、情報設計・導線・コンテンツを後回しにしない。

---

## 2. Astro採用方針

### DEFAULT

**コンテンツ中心の新規WebサイトではAstroを第一選択とする。**

対象例:

- コーポレートサイト
- メディア
- ブログ
- 情報サイト
- ガイド
- LP
- ポートフォリオ
- ドキュメント
- イベント・大会情報
- 静的コンテンツ比率の高いサービスサイト

### 例外

Astroを絶対条件にはしない。

以下のような案件では、要件に応じて別構成を選択できる。

- 高度なクライアント状態管理が中心
- SPAそのものが主目的
- リアルタイム共同編集
- 常時接続型アプリ
- 複雑な管理画面
- 既存フレームワークへの強い依存がある

例外採用時は、Project側に理由を残す。

### Version

MasterではAstroの特定メジャーバージョン番号を固定しない。

新規Project開始時に:

1. 現行安定版を確認
2. 採用バージョンをProject側へ記録
3. lockfileで依存関係を固定
4. 公式Upgrade Guideを確認して更新

古い記法をMasterへ恒久ルールとして固定しない。

---

## 3. Astroの基本設計

### Static First

原則として **静的生成を最初に検討する**。

静的で実現できるページを、理由なくSSRへしない。

ただし、次の要件ではSSR / on-demand rendering / server endpoint等を選択できる。

- 認証
- ユーザー別表示
- パーソナライズ
- リクエスト時に変化するデータ
- 秘密鍵を必要とするAPI処理
- リアルタイム性が必要
- サーバー側処理が合理的

「静的が善、SSRが悪」と固定化しない。要件で選ぶ。

### Zero-JS by Default

クライアントJavaScriptを送らなくても成立するページは、JavaScriptなしで構築する。

- HTML / CSS / `.astro` を優先
- JavaScriptは機能上必要な箇所だけ
- ページ全体を理由なくSPA化しない
- UIライブラリをデザイン目的だけで導入しない

### Islands Architecture

React / Vue / Svelte / Preact等を利用する場合、インタラクションが必要な局所UIへ限定する。

例:

- 検索
- フィルター
- モーダル
- タブ
- 地図
- 複雑なフォーム
- リアルタイム更新

Hydrationは必要性に応じて選択する。

- 即時操作が必要 → load系を検討
- 初期表示後でよい → idle系を検討
- 画面内に来てからでよい → visible系を検討

ディレクティブ名やAPI仕様は、採用Astro版の公式仕様を正本とする。

クライアントUIフレームワークを複数混在させる場合は、バンドル重複の利点とコストを確認する。原則として、理由なく複数フレームワークを導入しない。

---

## 4. 標準構成

Astro Projectでは、可能な限り責務を分離する。

推奨:

- `src/pages/` — ルーティング
- `src/layouts/` — 共通レイアウト
- `src/components/` — 再利用UI
- `src/content/` または採用版の公式Content構成 — 記事・構造化コンテンツ
- `src/styles/` — 共通スタイル
- `public/` — 変換不要の静的ファイル

Project要件により変更可能だが、理由なく独自構成を乱立させない。

共通Head、Header、Footer、SEO、Navigation等を各ページへ複製しない。

---

## 5. Content Collections / Content Layer

ブログ、ニュース、FAQ、人物、商品情報、スポット、イベント等の **反復する構造化コンテンツ** は、AstroのContent Collectionsまたは採用バージョンの公式Content機構を優先する。

スキーマで最低限以下を管理する。

- title
- description
- publish / update date
- slugまたは識別子
- draft / published状態
- OGP画像
- category / tag
- 必要なSEO属性

型・必須値・日付等をビルド時に検証する。

### 過剰適用禁止

Home / About / Privacy等の少数固定ページまで、理由なくContent Collectionsへ押し込まない。

Projectの規模と更新方法で判断する。

---

## 6. 画像・動画

画像・動画は装飾ではなく、理解・信頼・訴求を高める目的で使う。

### Astro画像

Astroで最適化可能な画像は、原則として公式画像機能を優先する。

- `astro:assets`
- `<Image />`
- `<Picture />`

目的:

- 適切なサイズ
- width / height確保
- CLS抑制
- modern format活用
- responsive配信
- 不要な大容量画像削減

外部CDNやHeadless CMSの画像では、外部配信側の最適化機能とAstro側設定を比較し、二重変換やビルド肥大化を避ける。

### 動画

- 不要な4Kを標準にしない
- モバイル通信量を考慮する
- autoplayを乱用しない
- 音声付きautoplayは原則避ける
- Posterを設定する
- 必要に応じて外部配信・ストリーミングを使う

生成AIで作成した素材も、著作権、事実性、ブランド整合、容量を確認してから公開する。

特定の生成AI・MCP・ベンダーをMasterの必須依存にしない。

---

## 7. 制作開始前

実装前に最低限、以下を明確にする。

- サイトの目的
- 想定ユーザー
- ユーザーが達成したいこと
- 競合・代替サイト
- サイトの強み
- 必要ページ
- 主要導線
- CTA
- 更新頻度
- データ取得元
- 公開方式
- 静的 / SSR判断
- 収益化の有無
- 将来の拡張可能性

曖昧なまま実装へ進まず、まず構造を決める。

---

## 8. 情報設計

### MUST

- TOPページだけでサイトの目的が理解できる
- 重要情報へ3操作以内を目安に到達できる
- グローバルナビゲーションを一貫させる
- モバイルで分かりやすいメニューを用意する
- パンくず、関連ページ、戻り導線を必要に応じて設ける
- 404や空データ状態を放置しない

### DEFAULT

- Home
- Guide / Service / Main Content
- Blog / News / Articles
- About
- FAQ
- Contact
- Privacy / Terms等の必要な法的ページ

ページ数を増やすこと自体を目的にしない。

---

## 9. コンテンツ品質

検索順位だけを狙った薄い文章を大量生成しない。

各主要ページは、可能な限り以下を満たす。

- 初心者が理解できる導入
- 結論や要点が早い段階で分かる
- 専門用語の説明
- 具体例
- 比較・判断基準
- よくある失敗や注意点
- 関連ページへの導線
- 根拠が必要な内容には出典
- 更新日または情報鮮度の管理

AI生成文はそのまま量産せず、重複・誤情報・不自然な表現を確認する。

---

## 10. UI / UX

### Mobile First

スマートフォンを最初の基準にする。

- 横スクロールを発生させない
- タップ領域を狭くしすぎない
- 本文文字を小さくしすぎない
- 固定ヘッダーや固定CTAがコンテンツを邪魔しない
- モーダルや広告で画面を覆いすぎない

### Visual

- 色数・フォント数を増やしすぎない
- 余白を十分に取る
- 見出し階層を明確にする
- 同一コンポーネントは同じ見た目・挙動にする
- 装飾より可読性を優先する

無意味なグラデーション、過剰なカード、同じテンプレ構成の連続等、「AI生成テンプレート感」が強いUIを避ける。

Motion / View Transition等は目的がある場合のみ使用し、操作性・酔い・Performanceを悪化させない。

---

## 11. Styling / Dependencies

Astro標準機能とWeb標準を最優先し、外部依存は必要な分だけ追加する。

### 原則

1. Astro標準で実現できるか確認
2. HTML / CSS / TypeScript等のWeb標準で実現できるか確認
3. 小さなライブラリで解決できるか確認
4. 大型ライブラリ・UI Frameworkは最後に検討

CSS frameworkやUI kitはProject要件で採用できるが、流行だけを理由に標準化しない。

使用していない依存を残さない。

lockfileをRepositoryへ含める。

---

## 12. Performance

Core Web Vitalsの目安:

- LCP: **2.5秒以下**
- INP: **200ms以下**
- CLS: **0.1以下**

Lighthouseは、Performance / Accessibility / Best Practices / SEOについて **90以上を目安** とする。

ただし、これらは品質改善の指標であり、案件固有の必要機能を壊して数字だけを上げない。

### 実装方針

- 不要なJavaScriptを送らない
- 巨大ライブラリを安易に追加しない
- 画像を最適化する
- Above the foldの重要画像は適切に優先する
- 外部Scriptを増やしすぎない
- Fontの読み込みを確認する
- Cache戦略を確認する
- SSR時はTTFBも確認する

認証・個別化ページでは、private dataを誤ってpublic cacheしない。

静的部分と動的部分を分離できる場合は、ページ全体をSSR化する前にIsland/API等による局所動的化を検討する。

---

## 13. Accessibility

最低限確認する。

- semantic HTML
- 見出し順序
- label付きフォーム
- キーボード操作
- focus表示
- 色コントラスト
- alt
- ariaの適切な使用
- ボタンとリンクの意味の区別
- エラー表示を色だけに依存しない
- `prefers-reduced-motion` 等への配慮

ARIAで壊れたHTMLを補修するのではなく、まずネイティブHTMLを優先する。

WCAG等の基準がProject要件として指定されている場合は、その基準をProject側で明示する。

---

## 14. SEO

### Technical

- title
- meta description
- canonical
- robots
- sitemap
- structured data
- OGP
- favicon
- 404
- redirect
- index / noindex
- RSS等、案件に必要なFeed
- 多言語案件ではhreflang等

Head情報は共通Layout / SEO component等へ集約し、ページごとの手作業コピーを減らす。

### Content

- 検索意図とページ目的を一致させる
- 1ページ1テーマを基本にする
- 重複ページを乱造しない
- 内部リンクを設計する
- 実体験・一次情報・独自情報を優先する

公開後はSearch Console等の実データで改善する。

---

## 15. Security / Privacy

`AGENTS.md` のSecurity / Secret protectionを最優先とする。

Web案件では特に以下を守る。

- API Key / Token / PasswordをRepositoryへコミットしない
- `.env` を公開しない
- private keyをコードへ埋め込まない
- clientへ公開される環境変数とserver-only secretを分離する
- build-time変数とruntime変数の違いを把握する
- 入力値を信用しない
- XSS / CSRF / SQL Injection等を考慮する
- Upload機能では拡張子だけで判定しない
- 管理画面を無条件公開しない
- 個人情報を必要以上に取得しない
- analytics / cookie / form送信先を把握する

### Supply Chain

- 依存を必要最小限にする
- 既知の重大脆弱性を放置しない
- package更新時にBreaking Changeを確認する
- ライセンス上問題のある依存を導入しない
- audit結果を機械的に全件blockするかはProjectのリスク基準で決める

---

## 16. Environment / Preview / Deploy

環境は最低限区別する。

- Local
- Preview / Staging
- Production

必要な場合のみ追加する。

秘密情報をPreviewへ無条件コピーしない。

### Preview

PRまたは公開前にPreview相当で確認できる構成を優先する。

最低限:

- PC
- Mobile
- Navigation
- Form
- API
- 404
- SEO metadata
- Console error
- responsive layout

### Rollback / Recovery

特定Hostingの機能をMasterでは強制しない。

少なくとも以下のどちらかで安全に以前の状態へ戻せること。

- Platformのrollback機能
- Git commitのrevert + 再deploy

ステートフルなDB等を含むProjectでは、Project側で別途backup / migration / rollbackを定義する。

---

## 17. CI / Build Gate

Astro Projectでは、PR / Deploy前に最低限以下の確認を行う。

- dependency install成功
- lint（導入している場合）
- format check（運用している場合）
- type / Astro check
- Astro build
- test（存在する場合）

標準コマンド名はProjectのpackage scriptsへ集約する。

例:

- `check`
- `build`
- `test`

Masterではpackage managerを固定しない。

CI失敗を無視して本番反映しない。

---

## 18. 開発フロー

原則:

1. Repositoryと既存ルールを読む
2. current code / Issues / PRs / Actionsを確認
3. 要件を整理
4. Astro適合性と例外要件を判断
5. static / SSR境界を決める
6. 情報設計
7. UI構成
8. 実装
9. check / build / test
10. LocalまたはPreview確認
11. PC / Mobile目視確認
12. PR
13. Review
14. CI成功確認
15. Merge
16. Deploy成功確認
17. 公開URLで最終確認

「コードを書いた」で完了にしない。

---

## 19. AIを使った制作

AIは作業速度と検証密度を上げるために使うが、事実確認と最終品質を丸投げしない。

特定AI製品名を恒久ルールとして固定しない。

必要に応じて役割を分離する。

- **Primary implementation** — 主実装
- **Independent review** — 独立レビュー
- **Security / QA review** — セキュリティ・QA
- **Content / SEO review** — コンテンツ・SEO
- **Visual review** — UI / UX

複数AIでクロスチェックする場合:

1. Round 1 — 独立レビュー
2. Round 2 — 相互反論・補強
3. Round 3 — 修正版レビュー
4. Round 4 — 最終監査

ただし、軽微な変更に毎回4 Roundを強制しない。重大変更、新規標準、Architecture変更等で利用する。

実際に外部AIへ問い合わせた結果と、単なる擬似視点レビューを混同しない。

---

## 20. Review基準

レビューでは「動くか」だけでなく以下を見る。

- 目的を達成できるか
- 初見で意味が分かるか
- Mobileで崩れないか
- 不要なJavaScriptがないか
- 不要なSSRがないか
- Island境界が妥当か
- Dependencyが過剰でないか
- Security問題がないか
- SEO上の重大問題がないか
- Accessibilityを壊していないか
- Core Web Vitalsを悪化させていないか
- 既存機能を壊していないか
- 将来修正しやすいか

重大問題があれば、見た目が完成していても完成扱いにしない。

---

## 21. Definition of Done

最低限、以下を満たして完了とする。

- 要件を満たす
- 主要導線が機能する
- PC / Mobileを確認
- Consoleの重大エラーなし
- リンク切れを確認
- Form等の主要機能を確認
- Astro check相当成功
- Astro build成功
- 必要なtest成功
- CI成功
- Deploy成功
- 公開URL確認
- title / description / OGP確認
- noindex事故がない
- Secret混入なし
- 重大な既知脆弱性を放置していない
- 必要なProject文書を更新

確認していない項目を「確認済み」と書かない。

---

## 22. Project側へ残すもの

Web案件固有の以下はMasterへコピーせず、対象Project Repositoryに残す。

- 要件
- サイトマップ
- デザイン仕様
- Astro採用version
- package manager
- adapter / Hosting
- static / SSR境界
- API仕様
- データソース
- Domain情報
- Project固有のSEO方針
- Environment構成
- Release / Rollback手順
- 現在のIssue / PR / Actions状態
- HANDOFF / RUNBOOK

Masterは共通原則、Projectは実態、GitHubは現在状態の正本とする。

---

## 23. 禁止事項

- 根拠なく「日本一」「No.1」等を事実として掲載する
- ダミー情報を本番へ残す
- 存在しない実績・レビュー・顧客数を生成する
- 他社サイトの文章・画像を無断コピーする
- Secretをコミットする
- 不要なSPA化
- 不要なclient-side JavaScript
- 理由のないSSR化
- 理由のない巨大dependency導入
- UI frameworkの無秩序な混在
- CI失敗を無視して本番反映する
- Mobile確認なしで完成扱いする
- 本番URL未確認で公開完了とする
- Project固有情報をMasterへ大量複製する

---

## 24. 判断に迷った場合

次の順で確認する。

1. `AGENTS.md`
2. この `WEB_DEVELOPMENT.md`
3. 対象Projectの `AGENTS.md` / README / RUNBOOK / DECISIONS
4. 採用Astro versionの公式Documentation
5. current code / Issue / PR / Actions
6. 必要なら複数AIまたは人間レビュー

競合時は `README.md` のConflict / Precedenceに従う。

---

## 25. 最重要原則

Astroを採用する目的は「Astroを使うこと」ではない。

**速く、軽く、読みやすく、安全で、保守しやすいWebサイトを、不要な複雑化なしで作ること。**

Astro標準機能で十分なら追加しない。

静的で十分なら動的にしない。

HTMLで十分ならJavaScriptを足さない。

小さく作れるなら大きくしない。

ただし、要件が必要とする複雑さまで削らない。
