import React, { useState, useEffect } from 'react';
import './App.css';
import MapComponent from './components/MapComponent';
import SearchBar from './components/SearchBar';
import SupermarketList from './components/SupermarketList';

function App() {
  const [supermarkets, setSupermarkets] = useState([]);
  const [filteredSupermarkets, setFilteredSupermarkets] = useState([]);
  const [selectedSupermarket, setSelectedSupermarket] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: 35.6762, lng: 139.6503 });

  useEffect(() => {
    // ユーザーの現在位置を取得
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('位置情報の取得に失敗しました');
        }
      );
    }

    // デモデータ
    const demoData = [
      {
        id: 1,
        name: 'イオン 東京店',
        address: '東京都千代田区丸の内1-1-1',
        lat: 35.6812,
        lng: 139.7671,
        distance: 0.5
      },
      {
        id: 2,
        name: 'ライフ 銀座店',
        address: '東京都中央区銀座1-1-1',
        lat: 35.6721,
        lng: 139.7696,
        distance: 0.8
      },
      {
        id: 3,
        name: '西友 日本橋店',
        address: '東京都中央区日本橋1-1-1',
        lat: 35.6838,
        lng: 139.7746,
        distance: 1.2
      },
      {
        id: 4,
        name: 'マルエツ 新橋店',
        address: '東京都港区新橋2-2-2',
        lat: 35.6665,
        lng: 139.7568,
        distance: 1.5
      }
    ];

    setSupermarkets(demoData);
    setFilteredSupermarkets(demoData);
  }, []);

  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      setFilteredSupermarkets(supermarkets);
    } else {
      const filtered = supermarkets.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSupermarkets(filtered);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>スーパーマーケット検索</h1>
        <SearchBar onSearch={handleSearch} />
      </header>
      <div className="app-content">
        <div className="map-container">
          <MapComponent
            supermarkets={filteredSupermarkets}
            selectedSupermarket={selectedSupermarket}
            onSelectSupermarket={setSelectedSupermarket}
            userLocation={userLocation}
          />
        </div>
        <div className="list-container">
          <SupermarketList
            supermarkets={filteredSupermarkets}
            selectedSupermarket={selectedSupermarket}
            onSelectSupermarket={setSelectedSupermarket}
          />
        </div>
      </div>
    </div>
  );
}

export default App;