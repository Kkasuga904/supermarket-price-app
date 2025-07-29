# UniversalMapView 使用方法

プラットフォーム別の地図コンポーネントを統一インターフェースで使用できるコンポーネントです。

## 概要

- **Web**: OpenStreetMap (Leaflet)
- **iOS/Android**: Google Maps (react-native-maps)
- **共通インターフェース**: 同じPropsでどちらでも使用可能

## インストール

```bash
npm install react-leaflet leaflet react-native-maps
```

## 基本的な使用方法

```jsx
import React, { useState } from 'react';
import { View } from 'react-native';
import UniversalMapView from './src/components/UniversalMapView';

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
      title: '東京駅',
      description: '日本の鉄道の中心駅',
      emoji: '🚉', // オプション: マーカーに表示する絵文字
      id: 'tokyo-station'
    }
  ];

  const handleMarkerPress = (marker) => {
    console.log('Marker pressed:', marker);
  };

  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
  };

  return (
    <View style={{ flex: 1 }}>
      <UniversalMapView
        region={region}
        markers={markers}
        onMarkerPress={handleMarkerPress}
        onRegionChangeComplete={handleRegionChange}
        showsUserLocation={true}
        zoomEnabled={true}
        scrollEnabled={true}
        style={{ flex: 1 }}
      />
    </View>
  );
};
```

## Props仕様

### region (必須)
地図の中心座標と表示範囲を指定します。
```javascript
{
  latitude: number,     // 緯度
  longitude: number,    // 経度
  latitudeDelta: number,  // 緯度の表示範囲
  longitudeDelta: number  // 経度の表示範囲
}
```

### markers (オプション)
地図上に表示するマーカーの配列です。
```javascript
[
  {
    coordinate: {
      latitude: number,   // マーカーの緯度
      longitude: number   // マーカーの経度
    },
    title: string,        // マーカーのタイトル
    description: string,  // マーカーの説明（オプション）
    emoji: string,        // マーカーに表示する絵文字（オプション、デフォルト: 🏪）
    id: string           // マーカーの一意ID（オプション）
  }
]
```

### イベントハンドラー

#### onMarkerPress (オプション)
マーカーが押された時に呼び出されます。
```javascript
(marker) => {
  // マーカーオブジェクトが渡される
  console.log(marker.title, marker.description);
}
```

#### onRegionChangeComplete (オプション)
地図の表示範囲が変更された時に呼び出されます。
```javascript
(newRegion) => {
  // 新しい地域情報が渡される
  setRegion(newRegion);
}
```

### その他のProps

- `showsUserLocation` (boolean): ユーザーの現在地を表示するか (デフォルト: false)
- `zoomEnabled` (boolean): ズーム操作を有効にするか (デフォルト: true)
- `scrollEnabled` (boolean): スクロール操作を有効にするか (デフォルト: true)
- `style` (Object): コンポーネントのスタイル

## 実用例: スーパーマーケット検索

```jsx
import React, { useState, useEffect } from 'react';
import { View, Alert, Platform } from 'react-native';
import UniversalMapView from './src/components/UniversalMapView';

const SupermarketMap = () => {
  const [region, setRegion] = useState({
    latitude: 35.6762,
    longitude: 139.6503,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [supermarkets, setSupermarkets] = useState([]);

  useEffect(() => {
    // API からスーパーマーケットデータを取得
    fetchSupermarkets();
  }, []);

  const fetchSupermarkets = async () => {
    try {
      const response = await fetch('/api/supermarkets-nearby');
      const data = await response.json();
      
      // APIデータをマーカー形式に変換
      const markers = data.map(store => ({
        coordinate: {
          latitude: store.latitude,
          longitude: store.longitude,
        },
        title: store.name,
        description: `${store.address} (${store.distance_km}km)`,
        emoji: '🏪',
        id: store.id,
        // 元のデータも保持
        ...store
      }));
      
      setSupermarkets(markers);
    } catch (error) {
      console.error('Failed to fetch supermarkets:', error);
    }
  };

  const handleSupermarketPress = (supermarket) => {
    const message = `${supermarket.name}\n${supermarket.address}\n距離: ${supermarket.distance_km}km`;
    
    if (Platform.OS === 'web') {
      alert(message);
    } else {
      Alert.alert(
        supermarket.name,
        `${supermarket.address}\n距離: ${supermarket.distance_km}km`,
        [
          { text: 'キャンセル', style: 'cancel' },
          { text: '詳細を見る', onPress: () => navigateToDetails(supermarket) }
        ]
      );
    }
  };

  const navigateToDetails = (supermarket) => {
    // 詳細画面への遷移処理
    console.log('Navigate to details:', supermarket);
  };

  return (
    <View style={{ flex: 1 }}>
      <UniversalMapView
        region={region}
        markers={supermarkets}
        onMarkerPress={handleSupermarketPress}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        style={{ flex: 1 }}
      />
    </View>
  );
};

export default SupermarketMap;
```

## トラブルシューティング

### Web版でエラーが発生する場合

1. Metro設定が正しく設定されているか確認
2. ブラウザの開発者コンソールでエラーを確認
3. Leafletのスタイルが正しく読み込まれているか確認

### モバイル版でエラーが発生する場合

1. react-native-mapsが正しくインストールされているか確認
2. Google Maps APIキーが設定されているか確認
3. プラットフォーム固有の設定が完了しているか確認

### 共通の問題

- マーカーが表示されない場合は、coordinateプロパティが正しく設定されているか確認
- 地図が表示されない場合は、regionプロパティが有効な座標を含んでいるか確認

## サンプルアプリ

完全な動作例は `MapExample.js` を参照してください。