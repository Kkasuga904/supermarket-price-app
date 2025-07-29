import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leafletのデフォルトアイコンの問題を修正
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// カスタムアイコン
const supermarketIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function MapView({ supermarkets, selectedSupermarket, onSelectSupermarket, userLocation }) {
  const mapRef = useRef();

  useEffect(() => {
    if (selectedSupermarket && mapRef.current) {
      const map = mapRef.current;
      map.setView([selectedSupermarket.latitude, selectedSupermarket.longitude], 16);
    }
  }, [selectedSupermarket]);

  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={14}
      style={{ width: '100%', height: '100%' }}
      ref={mapRef}
    >
      <ChangeView center={[userLocation.lat, userLocation.lng]} zoom={14} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* 現在地マーカー */}
      <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
        <Popup>
          <strong>現在地</strong>
        </Popup>
      </Marker>
      
      {/* スーパーマーケットマーカー */}
      {supermarkets.map((supermarket) => (
        <Marker
          key={supermarket.id}
          position={[supermarket.latitude, supermarket.longitude]}
          icon={supermarketIcon}
          eventHandlers={{
            click: () => onSelectSupermarket(supermarket),
          }}
        >
          <Popup>
            <div>
              <strong>{supermarket.name}</strong>
              <br />
              {supermarket.address}
              <br />
              距離: {supermarket.distance}km
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapView;