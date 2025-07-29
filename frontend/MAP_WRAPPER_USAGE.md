# MapWrapper 使用方法

react-native-mapsのWeb互換性問題を解決するプラットフォーム別地図コンポーネントです。

## 📋 概要

- **Web**: Leaflet + OpenStreetMap を使用
- **iOS/Android**: react-native-maps + Google Maps を使用
- **共通インターフェース**: 同じPropsでどのプラットフォームでも動作

## 🏗️ アーキテクチャ

```
MapWrapper (共通インターフェース)
├── Web → WebMap (Leaflet + OpenStreetMap)
└── Native → NativeMap (react-native-maps + Google Maps)
```

## 📦 必要なパッケージ

```bash
npm install react-native-maps leaflet
```

## 🚀 基本的な使用方法

### 1. MapWrapperをインポート

```jsx
import MapWrapper from '../components/MapWrapper';
```

### 2. 基本的な実装

```jsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapWrapper from '../components/MapWrapper';

const MyMapScreen = () => {
  const [region, setRegion] = useState({
    latitude: 35.6762,  // 東京駅
    longitude: 139.6503,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const markers = [
    {
      coordinate: {
        latitude: 35.6762,
        longitude: 139.6503,
      },
      name: '業務スーパー 東京駅前店',
      address: '東京都千代田区丸の内1-1-1',
      distance_km: '0.5',
      id: 'supermarket-1'
    }
  ];

  const handleMarkerPress = (marker) => {
    console.log('Marker pressed:', marker.name);
  };

  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
  };

  return (
    <View style={styles.container}>
      <MapWrapper
        region={region}
        markers={markers}
        onMarkerPress={handleMarkerPress}
        onRegionChangeComplete={handleRegionChange}
        showsUserLocation={true}
        style={styles.map}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 }
});
```

## 📚 Props仕様

### region (必須)
地図の中心座標と表示範囲
```javascript
{
  latitude: number,         // 緯度
  longitude: number,        // 経度
  latitudeDelta: number,    // 緯度の表示範囲（オプション）
  longitudeDelta: number    // 経度の表示範囲（オプション）
}
```

### markers (オプション)
地図上に表示するマーカーの配列
```javascript
[
  {
    coordinate: {
      latitude: number,     // マーカーの緯度
      longitude: number     // マーカーの経度
    },
    name: string,          // マーカーの名前
    title: string,         // マーカーのタイトル（nameの代替）
    address: string,       // マーカーの住所
    description: string,   // マーカーの説明（addressの代替）
    distance_km: string,   // 距離（オプション）
    id: string            // 一意ID（オプション、自動生成）
  }
]
```

### イベントハンドラー

#### onMarkerPress (オプション)
```javascript
(marker) => {
  console.log('Pressed marker:', marker.name);
  // マーカーオブジェクト全体が渡される
}
```

#### onRegionChangeComplete (オプション)
```javascript
(newRegion) => {
  setRegion(newRegion);
  // 新しい地域情報が渡される
}
```

### その他のProps
- `showsUserLocation` (boolean): 現在地表示 (デフォルト: false)
- `style` (Object): コンポーネントのスタイル

## 🛠️ コンポーネント構成

### 1. WebMap.js (Web用)
- Leafletを動的に読み込み
- OpenStreetMapタイルを使用
- カスタムマーカーとポップアップ

### 2. NativeMap.js (モバイル用)
- react-native-mapsを使用
- Google Mapsプロバイダー
- ネイティブマーカー機能

### 3. MapWrapper.js (共通インターフェース)
- プラットフォーム自動判定
- データ正規化
- エラーハンドリング

## 🔧 トラブルシューティング

### Web版で "codegenNativeCommands" エラーが出る場合

Metro設定が正しく設定されているか確認：

```javascript
// metro.config.js
if (process.env.EXPO_PLATFORM === 'web') {
  config.resolver.blockList = [
    /node_modules\/react-native-maps\/.*/,
  ];
  config.resolver.alias = {
    'react-native-maps': false,
  };
}
```

### マーカーが表示されない場合

1. **座標の確認**: coordinate.latitude/longitudeが数値型か確認
2. **データ形式**: name/title, address/descriptionが正しく設定されているか
3. **コンソールログ**: エラーメッセージを確認

### 地図が表示されない場合

1. **regionプロパティ**: 有効な緯度・経度が設定されているか
2. **ネットワーク**: タイルサーバーへの接続が可能か
3. **権限**: 位置情報の権限が必要な機能を使用している場合

## 🌏 実際のスーパーマーケットアプリでの使用例

```jsx
// MapScreen.js での実装例
const MapScreen = ({ navigation }) => {
  const [region, setRegion] = useState({
    latitude: 35.6762,
    longitude: 139.6503,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [supermarkets, setSupermarkets] = useState([]);

  // APIからスーパーマーケットデータを取得
  const loadSupermarkets = async () => {
    const response = await supermarketAPI.getNearby(
      region.latitude, 
      region.longitude, 
      10
    );
    setSupermarkets(response.data);
  };

  // スーパーマーケットデータをマーカー形式に変換
  const markers = supermarkets.map((supermarket, index) => ({
    coordinate: {
      latitude: supermarket.latitude,
      longitude: supermarket.longitude,
    },
    name: supermarket.name,
    address: supermarket.address,
    distance_km: supermarket.distance_km,
    id: supermarket.id || `supermarket-${index}`,
    ...supermarket // 元のデータも保持
  }));

  const handleMarkerPress = (marker) => {
    navigation.navigate('SupermarketDetail', { supermarket: marker });
  };

  return (
    <MapWrapper
      region={region}
      markers={markers}
      onMarkerPress={handleMarkerPress}
      onRegionChangeComplete={setRegion}
      showsUserLocation={true}
      style={{ flex: 1 }}
    />
  );
};
```

## 📱 プラットフォーム別の特徴

### Web版 (Leaflet)
- ✅ ネットワーク接続のみで動作
- ✅ OpenStreetMapで無料利用
- ✅ カスタマイズ可能なマーカー
- ❌ 衛星画像なし

### ネイティブ版 (react-native-maps)
- ✅ ネイティブパフォーマンス
- ✅ Google Mapsの高機能
- ✅ 衛星画像対応
- ❌ Google Maps APIキーが必要

## 🔄 データ正規化

MapWrapperは自動的にデータを正規化します：

- `name` ← `title` のフォールバック
- `address` ← `description` のフォールバック  
- `id` の自動生成（未設定時）
- 無効なマーカーの除外

これにより、どちらのプラットフォームでも一貫した動作を保証します。