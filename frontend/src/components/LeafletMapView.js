import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';

// Web用のLeafletマップコンポーネント
const LeafletMapView = ({ 
  region, 
  markers = [], 
  onMarkerPress, 
  showsUserLocation = false,
  style,
  onRegionChangeComplete,
  zoomEnabled = true,
  scrollEnabled = true
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Leaflet CSSの動的読み込み
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Leafletライブラリの動的読み込み
    if (typeof window !== 'undefined' && !window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else if (window.L) {
      initializeMap();
    }

    return () => {
      // クリーンアップ
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const L = window.L;
    
    // マップインスタンスを作成
    mapInstanceRef.current = L.map(mapRef.current, {
      zoomControl: zoomEnabled,
      scrollWheelZoom: scrollEnabled,
      dragging: scrollEnabled,
      touchZoom: zoomEnabled,
      doubleClickZoom: zoomEnabled,
      boxZoom: zoomEnabled,
    }).setView([region.latitude, region.longitude], 13);

    // OpenStreetMapタイルレイヤーを追加
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    // 地域変更イベントリスナー
    if (onRegionChangeComplete) {
      mapInstanceRef.current.on('moveend', () => {
        const center = mapInstanceRef.current.getCenter();
        const bounds = mapInstanceRef.current.getBounds();
        
        // ズームレベルから緯度・経度のデルタを概算
        const latDelta = bounds.getNorth() - bounds.getSouth();
        const lngDelta = bounds.getEast() - bounds.getWest();
        
        onRegionChangeComplete({
          latitude: center.lat,
          longitude: center.lng,
          latitudeDelta: latDelta,
          longitudeDelta: lngDelta,
        });
      });
    }

    updateMarkers();
  };

  const updateMarkers = () => {
    if (!mapInstanceRef.current || !window.L) return;

    const L = window.L;

    // 既存のマーカーをクリア
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // ユーザー位置マーカー（別のレイヤーで管理）
    if (showsUserLocation && region) {
      const userIcon = L.divIcon({
        html: '<div style="background: #007AFF; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.5); position: relative; z-index: 1000;"></div>',
        className: 'user-location-marker',
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });
      
      // 固定位置のユーザーマーカー
      const userMarker = L.marker([region.latitude, region.longitude], { 
        icon: userIcon,
        zIndexOffset: 1000 // 他のマーカーより上に表示
      }).addTo(mapInstanceRef.current);
      
      userMarker.bindPopup('現在地');
      markersRef.current.push(userMarker);
    }

    // カスタムマーカーを追加
    markers.forEach((marker, index) => {
      const customIcon = L.divIcon({
        html: `<div style="
          background: #FF4444; 
          color: white; 
          width: 32px; 
          height: 32px; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 16px; 
          font-weight: bold; 
          border: 2px solid white; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: pointer;
        ">${marker.emoji || '🏪'}</div>`,
        className: 'custom-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const leafletMarker = L.marker(
        [marker.coordinate.latitude, marker.coordinate.longitude], 
        { icon: customIcon }
      ).addTo(mapInstanceRef.current);

      // ポップアップコンテンツ
      const popupContent = `
        <div style="min-width: 200px; padding: 8px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333;">${marker.title || 'マーカー'}</h3>
          ${marker.description ? `<p style="margin: 4px 0; font-size: 14px; color: #666;">${marker.description}</p>` : ''}
          ${onMarkerPress ? `
            <button 
              onclick="window.dispatchEvent(new CustomEvent('marker-click-${index}', { detail: ${JSON.stringify({...marker, index}).replace(/"/g, '&quot;')} }))"
              style="
                background: #007AFF; 
                color: white; 
                border: none; 
                padding: 6px 12px; 
                border-radius: 4px; 
                cursor: pointer; 
                margin-top: 8px;
                font-size: 14px;
              "
            >
              詳細を見る
            </button>
          ` : ''}
        </div>
      `;
      
      leafletMarker.bindPopup(popupContent);
      markersRef.current.push(leafletMarker);
    });
  };

  // マーカークリックイベントの処理
  useEffect(() => {
    const handleMarkerClick = (event) => {
      if (onMarkerPress) {
        onMarkerPress(event.detail);
      }
    };

    // 各マーカーに対してイベントリスナーを追加（重複を避けるため）
    const listeners = [];
    markers.forEach((_, index) => {
      const eventName = `marker-click-${index}`;
      window.addEventListener(eventName, handleMarkerClick);
      listeners.push(eventName);
    });

    return () => {
      // クリーンアップ時にイベントリスナーを削除
      listeners.forEach(eventName => {
        window.removeEventListener(eventName, handleMarkerClick);
      });
    };
  }, [onMarkerPress, markers]);

  // マーカーの更新
  useEffect(() => {
    updateMarkers();
  }, [markers, showsUserLocation, region]);

  // 地域の更新
  useEffect(() => {
    if (mapInstanceRef.current && region) {
      mapInstanceRef.current.setView([region.latitude, region.longitude], 13);
    }
  }, [region]);

  return (
    <View style={[styles.container, style]}>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 8,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 400,
  },
});

export default LeafletMapView;