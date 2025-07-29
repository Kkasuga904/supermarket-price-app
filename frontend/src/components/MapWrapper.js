import React from 'react';
import { Platform } from 'react-native';
import WebMap from './WebMap';
import NativeMap from './NativeMap';

/**
 * プラットフォーム共通の地図コンポーネント
 * 
 * Web環境では react-leaflet (OpenStreetMap)を使用
 * ネイティブ環境では react-native-maps (Google Maps)を使用
 * 
 * @param {Object} props - MapWrapperのプロパティ
 * @param {Object} props.region - 地図の中心座標と表示範囲
 * @param {number} props.region.latitude - 緯度
 * @param {number} props.region.longitude - 経度
 * @param {number} props.region.latitudeDelta - 緯度の表示範囲（オプション）
 * @param {number} props.region.longitudeDelta - 経度の表示範囲（オプション）
 * @param {Array} props.markers - マーカーの配列
 * @param {Object} props.markers[].coordinate - マーカーの座標
 * @param {number} props.markers[].coordinate.latitude - マーカーの緯度
 * @param {number} props.markers[].coordinate.longitude - マーカーの経度
 * @param {string} props.markers[].title - マーカーのタイトル（オプション）
 * @param {string} props.markers[].description - マーカーの説明（オプション）
 * @param {string} props.markers[].name - マーカーの名前（titleの代替、オプション）
 * @param {string} props.markers[].address - マーカーの住所（descriptionの代替、オプション）
 * @param {string} props.markers[].distance_km - 距離（オプション）
 * @param {string} props.markers[].id - マーカーの一意ID（オプション）
 * @param {Function} props.onMarkerPress - マーカーが押された時のコールバック
 * @param {boolean} props.showsUserLocation - ユーザーの現在地を表示するかどうか（デフォルト: false）
 * @param {Function} props.onRegionChangeComplete - 地図の表示範囲が変更された時のコールバック
 * @param {Object} props.style - スタイル
 */
const MapWrapper = ({
  region,
  markers = [],
  onMarkerPress,
  showsUserLocation = false,
  onRegionChangeComplete,
  style,
  ...otherProps
}) => {
  // 入力データの検証
  if (!region || typeof region.latitude !== 'number' || typeof region.longitude !== 'number') {
    console.warn('MapWrapper: Invalid region prop. Expected object with latitude and longitude numbers.');
    return null;
  }

  // マーカーデータの正規化
  const normalizedMarkers = markers.map((marker, index) => {
    if (!marker.coordinate || 
        typeof marker.coordinate.latitude !== 'number' || 
        typeof marker.coordinate.longitude !== 'number') {
      console.warn(`MapWrapper: Invalid marker at index ${index}. Skipping.`);
      return null;
    }

    return {
      ...marker,
      // title/nameの正規化
      title: marker.title || marker.name || 'マーカー',
      // description/addressの正規化
      description: marker.description || marker.address || '',
      // IDの設定（なければindexを使用）
      id: marker.id || `marker-${index}`,
    };
  }).filter(Boolean); // null/undefinedを除去

  // 共通のprops
  const commonProps = {
    region,
    markers: normalizedMarkers,
    onMarkerPress,
    showsUserLocation,
    onRegionChangeComplete,
    style,
    ...otherProps
  };

  // プラットフォーム別の分岐
  if (Platform.OS === 'web') {
    // Web環境: Leaflet + OpenStreetMap
    return <WebMap {...commonProps} />;
  } else {
    // ネイティブ環境: react-native-maps + Google Maps
    return <NativeMap {...commonProps} />;
  }
};

export default MapWrapper;