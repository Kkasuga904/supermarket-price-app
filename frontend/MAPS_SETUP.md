# Google Maps API 設定手順

## 1. Google Maps API キーの取得

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクトを作成または選択
3. 「API とサービス」→「ライブラリ」から以下のAPIを有効化：
   - Maps JavaScript API（Web用）
   - Maps SDK for iOS（iOS用）
   - Maps SDK for Android（Android用）
4. 「認証情報」からAPIキーを作成
5. APIキーの制限を設定（推奨）：
   - アプリケーションの制限：HTTPリファラー
   - APIの制限：上記の3つのAPIのみ

## 2. 環境変数の設定

`.env`ファイルを編集して、APIキーを設定：

```bash
# Google Maps API Key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**注意:**
- `EXPO_PUBLIC_`プレフィックスが必要です
- `.env`ファイルは`.gitignore`に追加してください（セキュリティのため）

## 3. 動作確認

### Web版
- ブラウザの開発者ツールのコンソールを確認
- `🗺️ Loading Google Maps API...` が表示される
- APIキーが正しく設定されていれば `✅ Google Maps API loaded successfully` が表示される

### モバイル版（iOS/Android）
- Expo Goまたはビルドしたアプリで確認
- 地図がスクロール・ズーム可能
- マーカーがタップ可能

## 4. トラブルシューティング

### コンソールコマンド（Web版のみ）
```javascript
// エラー情報の確認
debugMaps.getErrorInfo()

// 地図の状態確認
debugMaps.logMapsStatus()

// システム情報の確認
debugMaps.logSystemInfo()

// エラー情報のクリア
debugMaps.clearErrorInfo()
```

### よくあるエラー

1. **API key not configured**
   - `.env`ファイルにAPIキーが設定されていない
   - `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`を設定してください

2. **Authentication failed**
   - APIキーが無効
   - APIの有効化が不十分
   - APIキーの制限設定を確認

3. **Script loading failed**
   - ネットワーク接続の問題
   - Google Maps APIサービスの障害

## 5. フォールバック機能

Google Maps APIが利用できない場合、自動的にOpenStreetMapに切り替わります：
- Leafletライブラリを使用
- 基本的な地図表示・マーカー機能を提供
- ユーザーには透明に切り替わり