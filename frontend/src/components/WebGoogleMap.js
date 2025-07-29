import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { logSystemInfo, logGoogleMapsStatus } from '../utils/debugUtils';

const WebGoogleMap = ({ region, supermarkets, onMarkerPress, showsUserLocation }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // デバッグ情報をログ出力
      logSystemInfo();
      logGoogleMapsStatus();
      
      // Google Maps JavaScript APIを使用
      loadGoogleMaps();
    }
  }, []);

  const loadGoogleMaps = () => {
    // .envからGoogle Maps APIキーを取得
    const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    console.log('🗺️ Loading Google Maps API...');
    console.log('🔑 API Key:', API_KEY ? 'Loaded from .env' : 'Missing');
    
    // APIキーが設定されていない場合はOpenStreetMapにフォールバック
    if (!API_KEY || API_KEY === 'your_google_maps_api_key_here') {
      console.warn('⚠️ Google Maps API key not configured, falling back to OpenStreetMap');
      handleGoogleMapsError('NO_API_KEY');
      return;
    }
    
    if (window.google && window.google.maps) {
      console.log('✅ Google Maps API already loaded');
      initializeGoogleMap();
    } else {
      console.log('📥 Loading Google Maps API script...');
      
      // 既存のスクリプトがあれば削除
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.remove();
      }
      
      // Google Maps APIエラーハンドラーを設定
      window.gm_authFailure = () => {
        console.error('❌ Google Maps API authentication failed');
        console.error('🔑 API key is invalid or has insufficient permissions');
        handleGoogleMapsError('AUTHENTICATION_FAILED');
      };
      
      // グローバルコールバック関数を設定（重複を避けるため先に設定）
      const callbackName = `initGoogleMapsCallback_${Date.now()}`;
      window[callbackName] = () => {
        console.log('✅ Google Maps API loaded successfully');
        delete window[callbackName]; // コールバック関数をクリーンアップ
        initializeGoogleMap();
      };
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&callback=${callbackName}`;
      script.async = true;
      script.defer = true;
      
      script.onerror = (error) => {
        console.error('❌ Google Maps API script loading failed:', error);
        delete window[callbackName];
        handleGoogleMapsError('SCRIPT_LOAD_FAILED');
      };
      
      // タイムアウト処理
      const timeout = setTimeout(() => {
        console.error('⏰ Google Maps API loading timeout');
        delete window[callbackName];
        handleGoogleMapsError('TIMEOUT');
      }, 15000); // 15秒タイムアウト
      
      // 成功時にタイムアウトをクリア
      const originalCallback = window[callbackName];
      window[callbackName] = () => {
        clearTimeout(timeout);
        originalCallback();
      };
      
      document.head.appendChild(script);
    }
  };
  
  const handleGoogleMapsError = (errorType) => {
    console.error(`🚨 Google Maps Error: ${errorType}`);
    
    // エラータイプに応じた詳細メッセージ
    const errorMessages = {
      NO_API_KEY: '🔑 .envファイルにEXPO_PUBLIC_GOOGLE_MAPS_API_KEYを設定してください',
      AUTHENTICATION_FAILED: '🚫 APIキーが無効または権限が不足しています',
      SCRIPT_LOAD_FAILED: '📡 Google Maps APIスクリプトの読み込みに失敗しました',
      TIMEOUT: '⏰ Google Maps APIの読み込みがタイムアウトしました',
      API_NOT_AVAILABLE: '❌ Google Maps APIが利用できません',
      INITIALIZATION_FAILED: '🔧 Google Mapの初期化に失敗しました',
      NO_CONTAINER: '📦 地図コンテナが見つかりません'
    };
    
    const message = errorMessages[errorType] || '❓ 不明なエラーが発生しました';
    console.log(message);
    console.log('🔄 Falling back to OpenStreetMap...');
    
    // エラー情報をローカルストレージに保存（デバッグ用）
    const errorInfo = {
      timestamp: new Date().toISOString(),
      errorType,
      message,
      apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing',
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    try {
      localStorage.setItem('googleMapsError', JSON.stringify(errorInfo));
      console.log('💾 Error info saved to localStorage');
    } catch (e) {
      console.warn('⚠️ Could not save error info to localStorage:', e);
    }
    
    setLoadError(true);
    loadOpenStreetMap();
  };

  const initializeGoogleMap = () => {
    console.log('🎯 Initializing Google Map...');
    
    if (!mapRef.current) {
      console.error('❌ Map container ref is null');
      handleGoogleMapsError('NO_CONTAINER');
      return;
    }
    
    if (mapInstanceRef.current) {
      console.log('⚠️ Map already initialized');
      return;
    }
    
    if (!window.google || !window.google.maps) {
      console.error('❌ Google Maps API not available');
      handleGoogleMapsError('API_NOT_AVAILABLE');
      return;
    }
    
    try {
      console.log('🗺️ Creating Google Map instance...');
      
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: region.latitude, lng: region.longitude },
        zoom: 13,
        mapTypeId: 'roadmap',
        gestureHandling: 'greedy',
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true
      });

      console.log('✅ Google Map initialized successfully');
      setIsLoaded(true);
      
    } catch (error) {
      console.error('❌ Error initializing Google Map:', error);
      handleGoogleMapsError('INITIALIZATION_FAILED');
    }
  };

  const loadOpenStreetMap = () => {
    console.log('🌍 Loading OpenStreetMap fallback...');
    
    // Fallback to Leaflet/OpenStreetMap
    import('leaflet').then((L) => {
      console.log('📦 Leaflet library loaded');
      
      // LeafletのCSSを動的に追加
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        console.log('🎨 Adding Leaflet CSS...');
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      initializeOpenStreetMap(L);
    }).catch((error) => {
      console.error('❌ Leaflet loading error:', error);
      
      // Leafletも失敗した場合の最終フォールバック
      setLoadError(true);
      setIsLoaded(false);
    });
  };

  const initializeOpenStreetMap = (L) => {
    console.log('🗺️ Initializing OpenStreetMap...');
    
    if (!mapRef.current) {
      console.error('❌ Map container ref is null for OpenStreetMap');
      return;
    }
    
    if (mapInstanceRef.current) {
      console.log('⚠️ Map already initialized');
      return;
    }
    
    try {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [region.latitude, region.longitude], 
        13
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      console.log('✅ OpenStreetMap initialized successfully');
      setIsLoaded(true);
      
    } catch (error) {
      console.error('❌ Error initializing OpenStreetMap:', error);
      setLoadError(true);
      setIsLoaded(false);
    }
  };

  useEffect(() => {
    if (isLoaded && mapInstanceRef.current) {
      if (window.google && window.google.maps && !loadError) {
        // Google Maps用のマーカー処理
        updateGoogleMapsMarkers();
      } else {
        // OpenStreetMap用のマーカー処理
        import('leaflet').then((L) => {
          updateOpenStreetMapMarkers(L);
        });
      }
    }
  }, [region, supermarkets, showsUserLocation, isLoaded, loadError]);

  const updateGoogleMapsMarkers = () => {
    // 既存のマーカーをクリア
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current = [];

    // 現在位置マーカー
    if (showsUserLocation && region) {
      const userMarker = new window.google.maps.Marker({
        position: { lat: region.latitude, lng: region.longitude },
        map: mapInstanceRef.current,
        title: '現在地',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#007AFF',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2
        }
      });

      const userInfoWindow = new window.google.maps.InfoWindow({
        content: '<div style="padding: 8px;">現在地</div>'
      });

      userMarker.addListener('click', () => {
        userInfoWindow.open(mapInstanceRef.current, userMarker);
      });

      markersRef.current.push(userMarker);
    }

    // スーパーマーケットマーカーを追加
    supermarkets.forEach((supermarket) => {
      const marker = new window.google.maps.Marker({
        position: { lat: supermarket.latitude, lng: supermarket.longitude },
        map: mapInstanceRef.current,
        title: supermarket.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="#FF4444" stroke="white" stroke-width="2"/>
              <text x="16" y="20" font-family="Arial" font-size="16" text-anchor="middle" fill="white">🏪</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16)
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="min-width: 200px; padding: 12px;">
            <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">${supermarket.name}</h3>
            <p style="margin: 4px 0; color: #666; font-size: 14px;">${supermarket.address}</p>
            ${supermarket.distance_km ? `<p style="margin: 4px 0; color: #007AFF; font-size: 12px;">距離: ${supermarket.distance_km}km</p>` : ''}
            <button 
              style="
                background: #007AFF; 
                color: white; 
                border: none; 
                padding: 8px 16px; 
                border-radius: 4px; 
                cursor: pointer; 
                margin-top: 8px;
                font-size: 14px;
              "
              onclick="window.dispatchEvent(new CustomEvent('supermarket-click', { detail: ${JSON.stringify(supermarket).replace(/"/g, '&quot;')} }))"
            >
              店舗詳細
            </button>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
    });

    // 地図の中心を更新
    mapInstanceRef.current.setCenter({ lat: region.latitude, lng: region.longitude });
  };

  const updateOpenStreetMapMarkers = (L) => {
    // 既存のマーカーをクリア
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // 現在位置マーカー
    if (showsUserLocation && region) {
      const userIcon = L.divIcon({
        html: '<div style="background: #007AFF; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>',
        className: 'user-location-marker',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      
      const userMarker = L.marker([region.latitude, region.longitude], { icon: userIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup('現在地');
      
      markersRef.current.push(userMarker);
    }

    // スーパーマーケットマーカーを追加
    supermarkets.forEach((supermarket) => {
      const storeIcon = L.divIcon({
        html: `<div style="background: #FF4444; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🏪</div>`,
        className: 'supermarket-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([supermarket.latitude, supermarket.longitude], { 
        icon: storeIcon
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #333;">${supermarket.name}</h3>
            <p style="margin: 4px 0; color: #666; font-size: 14px;">${supermarket.address}</p>
            ${supermarket.distance_km ? `<p style="margin: 4px 0; color: #007AFF; font-size: 12px;">距離: ${supermarket.distance_km}km</p>` : ''}
            <button 
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
              onclick="window.dispatchEvent(new CustomEvent('supermarket-click', { detail: ${JSON.stringify(supermarket)} }))"
            >
              店舗詳細
            </button>
          </div>
        `);

      markersRef.current.push(marker);
    });

    // 地図の中心を更新
    mapInstanceRef.current.setView([region.latitude, region.longitude], 13);
  };

  // カスタムイベントリスナーでマーカークリックを処理
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleSupermarketClick = (event) => {
        if (onMarkerPress) {
          onMarkerPress(event.detail);
        }
      };

      window.addEventListener('supermarket-click', handleSupermarketClick);
      return () => {
        window.removeEventListener('supermarket-click', handleSupermarketClick);
      };
    }
  }, [onMarkerPress]);

  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={styles.container}>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '8px',
        }}
      />
      {!isLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '300px'
        }}>
          {loadError ? (
            <div>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                🌍 OpenStreetMapを読み込み中...
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Google Maps APIが利用できないため、代替マップを使用しています
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                🗺️ Google Mapsを読み込み中...
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                しばらくお待ちください
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* デバッグ情報表示（開発時のみ） */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          maxWidth: '200px',
          zIndex: 1000
        }}>
          <div>Maps: {window.google ? '✅' : '❌'}</div>
          <div>Loaded: {isLoaded ? '✅' : '❌'}</div>
          <div>Error: {loadError ? '❌' : '✅'}</div>
          {loadError && (
            <div style={{ marginTop: '4px', fontSize: '10px' }}>
              コンソールでエラー詳細を確認してください
            </div>
          )}
        </div>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
  },
});

export default WebGoogleMap;