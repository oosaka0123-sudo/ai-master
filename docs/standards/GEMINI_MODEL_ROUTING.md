# Gemini Model Routing Standard

Antigravity CLI (`agy`) を使うGemini cross-checkでは、特定のmodel slugを恒久固定しない。

## Selection rule

1. 各review開始時に `agy models` を実行し、その時点で利用可能なGemini系modelを取得する。
2. model slugに含まれるGemini世代・バージョンを数値として比較し、最も新しい世代を第一候補にする。
3. 同一世代・同一familyに複数のreasoning tierがある場合は `high`、次に `medium`、次に `low` / unspecified を優先する。
4. CLIが `--effort` を受け付ける場合、cross-checkでは原則 `--effort high` を使う。
5. 第一候補がplan制限、quota、model unavailable、実呼出しエラー等で使えない場合だけ、同じ `agy models` 出力内の次点Geminiへfallbackする。
6. review結果には、実際に使用したmodel slugを必ず記録する。fallbackした場合は理由も記録する。
7. 過去に使用した具体的なGemini model名は履歴としてのみ扱い、現在の選択を固定する設定値にはしない。

## Fail-closed rule

`agy models` から最新候補を安全に判定できない場合、またはGemini候補の実呼出しがすべて失敗した場合、必須Gemini reviewを完了扱いにしない。

## Current interpretation

「最新版Gemini」とは、Masterに書かれた固定名ではなく、実行時の `agy models` に表示される候補のうち上記ルールで選ばれるmodelを指す。新しいGemini世代が追加されても、この文書のmodel名を書き換えず追従できることを設計要件とする。
