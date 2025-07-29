import React from 'react';
import './SupermarketList.css';

function SupermarketList({ supermarkets, selectedSupermarket, onSelectSupermarket, loading }) {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!supermarkets || supermarkets.length === 0) {
    return (
      <div className="empty-state">
        <p>スーパーマーケットが見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className="supermarket-list">
      <h2>近くのスーパーマーケット</h2>
      <div className="list-items">
        {supermarkets.map((supermarket) => (
          <div
            key={supermarket.id}
            className={`supermarket-item ${selectedSupermarket?.id === supermarket.id ? 'selected' : ''}`}
            onClick={() => onSelectSupermarket(supermarket)}
          >
            <h3>{supermarket.name}</h3>
            <p className="address">{supermarket.address}</p>
            <p className="distance">約 {supermarket.distance} km</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SupermarketList;