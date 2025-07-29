import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// マーカーアイコンの設定
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// カスタムアイコン（選択されたマーカー用）
const selectedIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjUgMEMyMC41IDAgMjUgNS41IDI1IDEyLjVDMjUgMjEuNSAxMi41IDQxIDEyLjUgNDFDMTIuNSA0MSAwIDIxLjUgMCAxMi41QzAgNS41IDQuNSAwIDEyLjUgMFoiIGZpbGw9IiNGRjQ0NDQiLz4KPGNpcmNsZSBjeD0iMTIuNSIgY3k9IjEyLjUiIHI9IjQiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function MapComponent({ supermarkets, selectedSupermarket, onSelectSupermarket, userLocation }) {
  const mapRef = React.useRef();

  useEffect(() => {
    if (selectedSupermarket && mapRef.current) {
      const map = mapRef.current;
      map.flyTo([selectedSupermarket.lat, selectedSupermarket.lng], 16);
    }
  }, [selectedSupermarket]);

  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={13}
      ref={mapRef}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* ユーザーの現在位置 */}
      <Marker position={[userLocation.lat, userLocation.lng]}>
        <Popup>現在地</Popup>
      </Marker>
      
      {/* スーパーマーケットのマーカー */}
      {supermarkets.map((supermarket) => (
        <Marker
          key={supermarket.id}
          position={[supermarket.lat, supermarket.lng]}
          icon={selectedSupermarket?.id === supermarket.id ? selectedIcon : DefaultIcon}
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

export default MapComponent;