import React from 'react';
import './SupermarketList.css';

function SupermarketList({ supermarkets, selectedSupermarket, onSelectSupermarket }) {
  return (
    <div className="supermarket-list">
      <h2>検索結果 ({supermarkets.length}件)</h2>
      {supermarkets.length === 0 ? (
        <p className="no-results">スーパーマーケットが見つかりませんでした</p>
      ) : (
        <ul className="list">
          {supermarkets.map((supermarket) => (
            <li
              key={supermarket.id}
              className={`list-item ${selectedSupermarket?.id === supermarket.id ? 'selected' : ''}`}
              onClick={() => onSelectSupermarket(supermarket)}
            >
              <h3>{supermarket.name}</h3>
              <p className="address">{supermarket.address}</p>
              <p className="distance">約 {supermarket.distance} km</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SupermarketList;