import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { supermarketAPI } from '../services/api';
import MapWrapper from '../components/MapWrapper';

const MapScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [supermarkets, setSupermarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: 35.7227,  // 市川駅付近
    longitude: 139.9259,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (location) {
      console.log('Loading supermarkets for location:', location);
      loadNearbySupermarkets();
    }
  }, [location]);

  useEffect(() => {
    console.log('Supermarkets updated:', supermarkets.length, 'items');
    supermarkets.forEach(s => {
      console.log(`- ${s.name}: ${s.latitude}, ${s.longitude}`);
    });
  }, [supermarkets]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          '位置情報の許可が必要です',
          '近くのスーパーマーケットを表示するために位置情報の許可が必要です。'
        );
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setLocation(newLocation);
      setRegion({
        ...newLocation,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (error) {
      console.error('位置情報の取得に失敗しました:', error);
      Alert.alert('エラー', '位置情報の取得に失敗しました');
      setLoading(false);
    }
  };

  const loadNearbySupermarkets = async (centerLat, centerLng, radius = 20.0) => {
    try {
      setLoading(true);
      const latitude = centerLat || location.latitude;
      const longitude = centerLng || location.longitude;
      
      console.log('API call:', { latitude, longitude, radius });
      const response = await supermarketAPI.getNearby(
        latitude,
        longitude,
        radius
      );
      console.log('API response:', response.data?.length, 'supermarkets');
      setSupermarkets(response.data || []);
    } catch (error) {
      console.error('スーパーマーケットの取得に失敗しました:', error);
      Alert.alert('エラー', 'スーパーマーケット情報の取得に失敗しました');
      setSupermarkets([]); // エラー時は空配列をセット
    } finally {
      setLoading(false);
    }
  };

  const onMarkerPress = (supermarket) => {
    console.log('Marker pressed:', supermarket.name);
    try {
      navigation.navigate('SupermarketDetail', { supermarket });
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('エラー', '店舗詳細画面への移動に失敗しました');
    }
  };

  const onRegionChangeComplete = (newRegion) => {
    setRegion(newRegion);
  };

  const onMyLocationPress = () => {
    if (location) {
      const newRegion = {
        ...location,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setRegion(newRegion);
      loadNearbySupermarkets(location.latitude, location.longitude, 10.0);
    } else {
      getCurrentLocation();
    }
  };

  const onSearchThisAreaPress = () => {
    console.log('Searching area:', region);
    // 現在表示されている地図の範囲から検索半径を計算
    const radius = Math.max(
      region.latitudeDelta * 111, // 緯度1度 ≈ 111km
      region.longitudeDelta * 111 * Math.cos(region.latitude * Math.PI / 180)
    ) / 2;
    
    loadNearbySupermarkets(region.latitude, region.longitude, Math.min(radius, 50)); // 最大50km
  };

  console.log('MapScreen render - location:', location);
  console.log('MapScreen render - supermarkets:', supermarkets.length);
  console.log('MapScreen render - loading:', loading);

  if (loading && !location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>位置情報を取得中...</Text>
      </View>
    );
  }

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
    // 元のデータも保持
    ...supermarket
  }));

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>スーパーマーケット検索</Text>
          <Text style={styles.headerSubtitle}>
            {Platform.OS === 'web' ? 'OpenStreetMap' : 'Google Maps'} • {markers.length}件
          </Text>
        </View>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={onMyLocationPress}
          disabled={loading}
        >
          <Ionicons 
            name={loading ? 'hourglass' : 'locate'} 
            size={24} 
            color={location ? '#007AFF' : '#999'} 
          />
        </TouchableOpacity>
      </View>

      {/* 地図 */}
      <View style={styles.mapContainer}>
        <MapWrapper
          region={region}
          markers={markers}
          onMarkerPress={onMarkerPress}
          onRegionChangeComplete={onRegionChangeComplete}
          showsUserLocation={!!location}
          style={styles.map}
        />

        {/* 読み込み中オーバーレイ */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingOverlayText}>読み込み中...</Text>
          </View>
        )}
      </View>

      {/* この地域を検索ボタン */}
      <View style={styles.bottomControls}>
        <TouchableOpacity 
          style={styles.searchAreaButton} 
          onPress={onSearchThisAreaPress}
          disabled={loading}
        >
          <Ionicons name="search" size={20} color="#007AFF" />
          <Text style={styles.searchAreaButtonText}>この地域を検索</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  locationButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    padding: 10,
  },
  mapContainer: {
    flex: 1,
    margin: Platform.OS === 'ios' ? 0 : 16, // iOSではマージンを削除
    borderRadius: Platform.OS === 'ios' ? 0 : 12, // iOSでは角丸を削除
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: Platform.OS === 'ios' ? 0 : 0.25, // iOSでは影を削除
    shadowRadius: 3.84,
    elevation: Platform.OS === 'android' ? 5 : 0,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingOverlayText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  bottomControls: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchAreaButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchAreaButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default MapScreen;