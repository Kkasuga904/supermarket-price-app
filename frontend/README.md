# スーパーマーケット検索アプリ

純粋なReactで作成された、地図表示機能付きのスーパーマーケット検索アプリです。

## 特徴

- 🗺️ Leaflet（OpenStreetMap）を使用した地図表示
- 📍 現在地の表示
- 🔍 店名・住所での検索機能
- 📱 レスポンシブデザイン
- 🚀 Vercelでのデプロイ対応

## セットアップ

### 必要な環境

- Node.js 16.x 以上
- npm 7.x 以上

### インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm start
```

アプリは http://localhost:3000 で起動します。

### ビルド

```bash
npm run build
```

## Vercelへのデプロイ

1. GitHubリポジトリにプッシュ
2. Vercelで新規プロジェクトを作成
3. GitHubリポジトリを選択
4. Root Directory: `frontend` を指定
5. Deploy をクリック

## 使用技術

- React 18.2.0
- React Leaflet 4.2.1
- Leaflet 1.9.4
- Axios 1.6.5

## ディレクトリ構造

```
src/
├── components/
│   ├── MapComponent.js      # 地図コンポーネント
│   ├── SearchBar.js         # 検索バー
│   └── SupermarketList.js   # スーパーマーケットリスト
├── App.js                   # メインアプリケーション
├── App.css                  # アプリケーションスタイル
└── index.js                 # エントリーポイント
```