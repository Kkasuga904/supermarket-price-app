import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';

const WebMap = ({ 
  region, 
  markers = [], 
  onMarkerPress, 
  showsUserLocation = false,
  style,
  onRegionChangeComplete
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Web環境でのみ実行
    if (typeof window === 'undefined') return;

    // Leaflet CSSの動的読み込み
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Leafletライブラリの動的読み込み
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
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
    if (!mapRef.current || mapInstanceRef.current || !window.L) return;

    const L = window.L;

    // Leafletのデフォルトアイコンの問題を修正
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    // マップインスタンスを作成
    mapInstanceRef.current = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      dragging: true,
      touchZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
    }).setView([region.latitude, region.longitude], 13);

    // OpenStreetMapタイルレイヤーを追加
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    // 地域変更イベントリスナー
    if (onRegionChangeComplete) {
      mapInstanceRef.current.on('moveend', () => {
        const center = mapInstanceRef.current.getCenter();
        const bounds = mapInstanceRef.current.getBounds();
        
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

    // 既存のマーカーをクリア（安全にチェック）
    markersRef.current.forEach(marker => {
      try {
        if (marker && mapInstanceRef.current.hasLayer(marker)) {
          mapInstanceRef.current.removeLayer(marker);
        }
      } catch (e) {
        console.log('Marker removal error:', e);
      }
    });
    markersRef.current = [];

    // ユーザー位置マーカー（初回の位置で固定）
    if (showsUserLocation && region && !mapInstanceRef.current._userLocationSet) {
      const userIcon = L.divIcon({
        html: `<div style="
          background: #007AFF; 
          width: 16px; 
          height: 16px; 
          border-radius: 50%; 
          border: 3px solid white; 
          box-shadow: 0 0 8px rgba(0,0,0,0.3);
        "></div>`,
        className: 'user-location-marker',
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });
      
      const userMarker = L.marker([region.latitude, region.longitude], { 
        icon: userIcon 
      }).addTo(mapInstanceRef.current);
      
      userMarker.bindPopup('<div style="text-align: center; padding: 4px;"><strong>現在地</strong></div>');
      // 現在地マーカーは別で管理（通常のマーカーと分ける）
      mapInstanceRef.current._userLocationMarker = userMarker;
      mapInstanceRef.current._userLocationSet = true;
    }

    // カスタムマーカーを追加
    markers.forEach((marker, index) => {
      if (!marker.coordinate) return;

      const customIcon = L.divIcon({
        html: `<div style="
          background: #FF4444; 
          color: white; 
          width: 36px; 
          height: 36px; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 18px; 
          font-weight: bold; 
          border: 3px solid white; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: transform 0.2s;
        " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">🏪</div>`,
        className: 'custom-marker',
        iconSize: [42, 42],
        iconAnchor: [21, 21]
      });

      const leafletMarker = L.marker(
        [marker.coordinate.latitude, marker.coordinate.longitude], 
        { icon: customIcon }
      ).addTo(mapInstanceRef.current);

      // ポップアップコンテンツ
      const popupContent = `
        <div style="min-width: 220px; padding: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333; font-weight: 600;">
            ${marker.title || marker.name || 'スーパーマーケット'}
          </h3>
          ${marker.description || marker.address ? `
            <p style="margin: 4px 0 8px 0; font-size: 14px; color: #666; line-height: 1.4;">
              ${marker.description || marker.address}
            </p>
          ` : ''}
          ${marker.distance_km ? `
            <p style="margin: 4px 0 8px 0; font-size: 12px; color: #007AFF; font-weight: 500;">
              📍 距離: ${marker.distance_km}km
            </p>
          ` : ''}
          ${onMarkerPress ? `
            <button 
              onclick="window.handleMarkerClick(${index})"
              style="
                background: #007AFF; 
                color: white; 
                border: none; 
                padding: 8px 16px; 
                border-radius: 6px; 
                cursor: pointer; 
                font-size: 14px;
                font-weight: 500;
                width: 100%;
                transition: background-color 0.2s;
              "
              onmouseover="this.style.backgroundColor='#0056b3'"
              onmouseout="this.style.backgroundColor='#007AFF'"
            >
              📋 詳細を見る
            </button>
          ` : ''}
        </div>
      `;
      
      leafletMarker.bindPopup(popupContent, {
        maxWidth: 280,
        className: 'custom-popup'
      });

      markersRef.current.push(leafletMarker);
    });
  };

  // マーカークリック用のグローバルハンドラー
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.handleMarkerClick = (index) => {
      if (onMarkerPress && markers[index]) {
        onMarkerPress(markers[index]);
      }
    };

    return () => {
      if (window.handleMarkerClick) {
        delete window.handleMarkerClick;
      }
    };
  }, [onMarkerPress, markers]);

  // マーカーの更新
  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMarkers();
    }
  }, [markers, showsUserLocation]);

  // 地域の更新（初回のみ）
  useEffect(() => {
    if (mapInstanceRef.current && region && !mapInstanceRef.current._userHasMovedMap) {
      mapInstanceRef.current.setView([region.latitude, region.longitude], 13);
      // ユーザーが地図を操作したらフラグを立てる
      mapInstanceRef.current.once('dragstart', () => {
        mapInstanceRef.current._userHasMovedMap = true;
      });
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
          position: 'relative',
          zIndex: 0,
        }}
      />
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
        .leaflet-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
      `}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 300,
    backgroundColor: '#f0f0f0',
  },
});

export default WebMap;