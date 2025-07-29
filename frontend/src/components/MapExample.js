import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import UniversalMapView from './UniversalMapView';

/**
 * UniversalMapViewの使用例
 */
const MapExample = () => {
  const [region, setRegion] = useState({
    latitude: 35.6762,  // 東京駅
    longitude: 139.6503,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    // サンプルマーカーデータ
    const sampleMarkers = [
      {
        coordinate: {
          latitude: 35.6762,
          longitude: 139.6503,
        },
        title: '東京駅',
        description: '日本の鉄道の中心駅',
        emoji: '🚉',
        id: 'tokyo-station'
      },
      {
        coordinate: {
          latitude: 35.6586,
          longitude: 139.7454,
        },
        title: '東京タワー',
        description: '東京のシンボルタワー',
        emoji: '🗼',
        id: 'tokyo-tower'
      },
      {
        coordinate: {
          latitude: 35.6785,
          longitude: 139.6823,
        },
        title: '皇居',
        description: '天皇陛下のお住まい',
        emoji: '🏯',
        id: 'imperial-palace'
      },
      {
        coordinate: {
          latitude: 35.6598,
          longitude: 139.7006,
        },
        title: '銀座',
        description: '高級ショッピング街',
        emoji: '🛍️',
        id: 'ginza'
      }
    ];

    setMarkers(sampleMarkers);
  }, []);

  const handleMarkerPress = (marker) => {
    const message = Platform.OS === 'web' 
      ? `${marker.title}\n${marker.description}` 
      : `${marker.title}: ${marker.description}`;
    
    if (Platform.OS === 'web') {
      alert(message);
    } else {
      Alert.alert(marker.title, marker.description);
    }
  };

  const handleRegionChange = (newRegion) => {
    console.log('Region changed:', newRegion);
    setRegion(newRegion);
  };

  const moveToTokyo = () => {
    const tokyoRegion = {
      latitude: 35.6762,
      longitude: 139.6503,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    setRegion(tokyoRegion);
  };

  const moveToOsaka = () => {
    const osakaRegion = {
      latitude: 34.6937,
      longitude: 135.5023,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    setRegion(osakaRegion);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>UniversalMapView Example</Text>
        <Text style={styles.platform}>Platform: {Platform.OS}</Text>
      </View>

      <View style={styles.mapContainer}>
        <UniversalMapView
          region={region}
          markers={markers}
          onMarkerPress={handleMarkerPress}
          onRegionChangeComplete={handleRegionChange}
          showsUserLocation={true}
          zoomEnabled={true}
          scrollEnabled={true}
          style={styles.map}
        />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={moveToTokyo}>
          <Text style={styles.buttonText}>東京へ移動</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={moveToOsaka}>
          <Text style={styles.buttonText}>大阪へ移動</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>
          緯度: {region.latitude.toFixed(4)}, 経度: {region.longitude.toFixed(4)}
        </Text>
        <Text style={styles.infoText}>
          マーカー数: {markers.length}
        </Text>
        <Text style={styles.infoText}>
          {Platform.OS === 'web' ? 'OpenStreetMap (Leaflet)' : 'Google Maps (react-native-maps)'}
        </Text>
      </View>
    </View>
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
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  platform: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  map: {
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  info: {
    backgroundColor: 'white',
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
});

export default MapExample;