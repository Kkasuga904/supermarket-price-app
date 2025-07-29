# スーパーマーケット価格比較アプリ

地図機能付きのスーパーマーケット価格比較スマートフォンアプリ

## 機能概要

- **地図表示**: スーパーマーケットの位置をマップ上で確認
- **価格記録**: 商品価格の登録・更新
- **価格比較**: 複数店舗間での価格比較
- **検索機能**: 商品名、店舗名での検索
- **お気に入り**: よく利用する店舗や商品の管理

## 技術スタック

### バックエンド
- **FastAPI**: Python製の高速WebAPIフレームワーク
- **SQLite**: 軽量データベース
- **SQLAlchemy**: ORMライブラリ
- **uvicorn**: ASGIサーバー

### フロントエンド
- **React Native**: クロスプラットフォーム対応
- **Expo**: 開発環境とツールチェーン
- **React Navigation**: ナビゲーション管理
- **React Native Maps**: 地図機能

### インフラ
- **Docker**: コンテナ化
- **AWS**: クラウドインフラ（予定）

## アーキテクチャ

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │    FastAPI      │    │     SQLite      │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                        │
        │                        │
        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐
│   Map Service   │    │   Price Data    │
│   (Google Maps) │    │   Management    │
└─────────────────┘    └─────────────────┘
```

## セットアップ方法

### 前提条件
- Node.js (v14以上)
- Python (v3.8以上)
- Docker
- Expo CLI

### バックエンド起動
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### フロントエンド起動
```bash
cd frontend
npm install
expo start
```

### Docker起動
```bash
docker-compose up
```