import React, { useState, useEffect } from 'react';
import './App.css';
import MapView from './components/MapView';
import SearchBar from './components/SearchBar';
import SupermarketList from './components/SupermarketList';
import api from './services/api';

function App() {
  const [supermarkets, setSupermarkets] = useState([]);
  const [selectedSupermarket, setSelectedSupermarket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState({ lat: 35.6762, lng: 139.6503 }); // 東京駅をデフォルト
  const [loading, setLoading] = useState(false);

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
          console.error('位置情報の取得に失敗しました:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    // 初期データを読み込む
    loadSupermarkets();
  }, [userLocation]);

  const loadSupermarkets = async () => {
    setLoading(true);
    try {
      const response = await api.getSupermarketsNearby(userLocation.lat, userLocation.lng);
      setSupermarkets(response.data);
    } catch (error) {
      console.error('スーパーマーケットの読み込みに失敗しました:', error);
      // デモデータを使用
      setSupermarkets(getDemoData());
    } finally {
      setLoading(false);
    }
  };

  const getDemoData = () => {
    return [
      {
        id: 1,
        name: 'イオン 東京店',
        address: '東京都千代田区丸の内1-1-1',
        latitude: 35.6812,
        longitude: 139.7671,
        distance: 0.5
      },
      {
        id: 2,
        name: 'ライフ 銀座店',
        address: '東京都中央区銀座1-1-1',
        latitude: 35.6721,
        longitude: 139.7696,
        distance: 0.8
      },
      {
        id: 3,
        name: '西友 日本橋店',
        address: '東京都中央区日本橋1-1-1',
        latitude: 35.6838,
        longitude: 139.7746,
        distance: 1.2
      }
    ];
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    // 検索ロジックを実装
    if (term) {
      const filtered = supermarkets.filter(s => 
        s.name.toLowerCase().includes(term.toLowerCase()) ||
        s.address.toLowerCase().includes(term.toLowerCase())
      );
      setSupermarkets(filtered);
    } else {
      loadSupermarkets();
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>スーパーマーケット検索</h1>
        <SearchBar onSearch={handleSearch} />
      </header>
      <div className="App-content">
        <div className="map-container">
          <MapView 
            supermarkets={supermarkets}
            selectedSupermarket={selectedSupermarket}
            onSelectSupermarket={setSelectedSupermarket}
            userLocation={userLocation}
          />
        </div>
        <div className="list-container">
          <SupermarketList 
            supermarkets={supermarkets}
            selectedSupermarket={selectedSupermarket}
            onSelectSupermarket={setSelectedSupermarket}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

export default App;