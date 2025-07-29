# スーパーマーケット検索アプリ

OpenStreetMapを使用した、スーパーマーケット検索・価格比較のReactアプリケーションです。

## 機能

- 🗺️ OpenStreetMapを使用した地図表示
- 📍 現在地周辺のスーパーマーケット検索
- 🔍 名前・住所によるスーパーマーケット検索
- 📱 レスポンシブデザイン

## セットアップ

### 必要な環境

- Node.js 18.x 以上
- npm または yarn

### インストール

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集してAPI URLを設定
```

### 開発サーバーの起動

```bash
npm start
```

ブラウザで http://localhost:3000 を開いてください。

### ビルド

```bash
npm run build
```

## Vercelへのデプロイ

1. Vercelアカウントにログイン
2. "New Project"をクリック
3. GitHubリポジトリを選択
4. Root Directory: `frontend-react`を指定
5. 環境変数を設定:
   - `REACT_APP_API_URL`: バックエンドAPIのURL
6. Deployをクリック

## 技術スタック

- React 18.2.0
- React Leaflet (OpenStreetMap)
- Axios
- React Router DOM

## ディレクトリ構造

```
src/
├── components/       # Reactコンポーネント
│   ├── MapView.js   # 地図表示コンポーネント
│   ├── SearchBar.js # 検索バー
│   └── SupermarketList.js # スーパーマーケットリスト
├── services/        # APIサービス
│   └── api.js      # API通信
├── App.js          # メインアプリケーション
└── index.js        # エントリーポイント
```