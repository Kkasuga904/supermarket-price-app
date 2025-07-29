import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// react-native-mapsはWeb環境では使用できないため、条件付きインポート
let MapView, Marker, PROVIDER_GOOGLE;
try {
  if (Platform.OS !== 'web') {
    const RNMaps = require('react-native-maps');
    MapView = RNMaps.default;
    Marker = RNMaps.Marker;
    PROVIDER_GOOGLE = RNMaps.PROVIDER_GOOGLE;
  }
} catch (error) {
  // Web環境では無視
  console.log('react-native-maps not available on web');
}

const NativeMap = ({ 
  region, 
  markers = [], 
  onMarkerPress, 
  showsUserLocation = false,
  style,
  onRegionChangeComplete
}) => {
  // Web環境では何も表示しない
  if (Platform.OS === 'web' || !MapView) {
    return null;
  }
  
  const mapRef = useRef(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: region.latitude,
    longitude: region.longitude,
    latitudeDelta: region.latitudeDelta || 0.0922,
    longitudeDelta: region.longitudeDelta || 0.0421,
  });

  // 初回のみregionを設定（スクロールを妨げないため、useEffectは使わない）

  const handleRegionChange = (newRegion) => {
    setMapRegion(newRegion);
    if (onRegionChangeComplete) {
      onRegionChangeComplete(newRegion);
    }
  };

  const handleMyLocationPress = () => {
    const newRegion = {
      latitude: region.latitude,
      longitude: region.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    setMapRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 1000);
  };

  const handleMarkerPress = (marker) => {
    if (onMarkerPress) {
      onMarkerPress(marker);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={mapRegion}
        onRegionChangeComplete={handleRegionChange}
        showsUserLocation={showsUserLocation}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
        mapType="standard"
        loadingEnabled={true}
        loadingIndicatorColor="#007AFF"
        loadingBackgroundColor="#ffffff"
        moveOnMarkerPress={false}
      >
        {markers.map((marker, index) => {
          if (!marker.coordinate) return null;
          
          return (
            <Marker
              key={marker.id || `marker-${index}`}
              coordinate={{
                latitude: marker.coordinate.latitude,
                longitude: marker.coordinate.longitude,
              }}
              title={marker.title || marker.name || 'スーパーマーケット'}
              description={marker.description || marker.address || ''}
              onPress={() => handleMarkerPress(marker)}
            >
              <View style={styles.customMarker}>
                <View style={styles.markerInner}>
                  <Ionicons name="storefront" size={20} color="white" />
                </View>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* 現在地ボタン */}
      {showsUserLocation && (
        <TouchableOpacity
          style={styles.myLocationButton}
          onPress={handleMyLocationPress}
        >
          <Ionicons name="locate" size={24} color="#007AFF" />
        </TouchableOpacity>
      )}

      {/* 店舗数表示 */}
      <View style={styles.counterContainer}>
        <Ionicons name="pin" size={16} color="#007AFF" />
        <View style={styles.counterText}>
          <Ionicons name="storefront" size={14} color="#666" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerInner: {
    backgroundColor: '#FF4444',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  counterContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
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
  counterText: {
    marginLeft: 6,
  },
});

export default NativeMap;