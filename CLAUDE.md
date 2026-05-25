# REIMS - 不動産投資シミュレーター

## プロジェクト概要
不動産投資初心者向けのWebアプリ。無料で使ってもらいデータを収集し、会計ツールと組み合わせて実際の収益データを集めることが目標。

## 参考資料
- `~/Downloads/不動産投資分析サービス概要_20250622.pdf`
- `~/Downloads/不動産投資分析サービス概要_20250710.pdf`
- プロジェクト名：REIMS（Real Estate Investment Management Services）/ バラマキプロジェクト

## 公開URL
https://reims-mvp.vercel.app/

## リポジトリ
https://github.com/okiharuto0301-blip/reims-mvp

## 技術スタック
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS
- Recharts（グラフ）
- Vercel（ホスティング）

## 現在の実装（MVP）
- 物件情報・ローン条件の入力フォーム（スライダー付き）
- 表面利回り・実質利回り・月間CF・CF利回りの計算
- 30年間のキャッシュフロー・ローン残高グラフ
- プラス/マイナス収支の判定コメント
- PC・スマホ対応（レスポンシブ）

## 今後の実装候補
- [ ] ユーザー登録・ログイン（Supabase）
- [ ] 複数物件の比較・ポートフォリオ機能
- [ ] 会計機能（実績家賃・経費の記録）
- [ ] 管理者向けデータ分析ダッシュボード
