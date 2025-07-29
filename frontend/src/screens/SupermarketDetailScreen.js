import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { priceAPI } from '../services/api';

const SupermarketDetailScreen = ({ route, navigation }) => {
  const { supermarket } = route.params;
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSupermarketPrices();
  }, []);

  const loadSupermarketPrices = async () => {
    try {
      setLoading(true);
      const response = await priceAPI.getAll({
        supermarket_id: supermarket.id,
        limit: 50,
      });
      setPrices(response.data);
    } catch (error) {
      console.error('価格情報の取得に失敗しました:', error);
      Alert.alert('エラー', '価格情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (supermarket.phone) {
      Linking.openURL(`tel:${supermarket.phone}`);
    } else {
      Alert.alert('電話番号が登録されていません');
    }
  };

  const handleNavigate = () => {
    const url = `https://maps.google.com/?q=${supermarket.latitude},${supermarket.longitude}`;
    Linking.openURL(url);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.storeName}>{supermarket.name}</Text>
        <Text style={styles.storeAddress}>{supermarket.address}</Text>
        {supermarket.distance_km && (
          <Text style={styles.distance}>
            現在地から {supermarket.distance_km}km
          </Text>
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleNavigate}
        >
          <Ionicons name="navigate" size={24} color="#007AFF" />
          <Text style={styles.actionButtonText}>ナビ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            !supermarket.phone && styles.actionButtonDisabled,
          ]}
          onPress={handleCall}
          disabled={!supermarket.phone}
        >
          <Ionicons name="call" size={24} color={supermarket.phone ? "#007AFF" : "#ccc"} />
          <Text style={[
            styles.actionButtonText,
            !supermarket.phone && styles.actionButtonTextDisabled,
          ]}>
            電話
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('AddPrice', { supermarket })}
        >
          <Ionicons name="add-circle" size={24} color="#007AFF" />
          <Text style={styles.actionButtonText}>価格登録</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>登録されている商品価格</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingText}>読み込み中...</Text>
          </View>
        ) : prices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="information-circle-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>まだ価格情報が登録されていません</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddPrice', { supermarket })}
            >
              <Text style={styles.addButtonText}>最初の価格を登録する</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.priceList}>
            {prices.map((price) => (
              <View key={price.id} style={styles.priceItem}>
                <View style={styles.priceHeader}>
                  <Text style={styles.productName}>{price.product.name}</Text>
                  <Text style={styles.priceValue}>
                    {formatPrice(price.price)}
                    <Text style={styles.priceUnit}>/{price.unit}</Text>
                  </Text>
                </View>
                <View style={styles.priceFooter}>
                  <Text style={styles.productCategory}>{price.product.category}</Text>
                  <Text style={styles.recordedDate}>
                    {formatDate(price.recorded_at)}
                  </Text>
                </View>
                {price.product.brand && (
                  <Text style={styles.productBrand}>{price.product.brand}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  storeAddress: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  distance: {
    fontSize: 14,
    color: '#007AFF',
  },
  actionButtons: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 15,
    marginBottom: 10,
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 10,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    marginTop: 5,
    fontSize: 14,
    color: '#007AFF',
  },
  actionButtonTextDisabled: {
    color: '#ccc',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  priceList: {
    gap: 10,
  },
  priceItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  priceUnit: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#666',
  },
  priceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recordedDate: {
    fontSize: 12,
    color: '#666',
  },
  productBrand: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 5,
  },
});

export default SupermarketDetailScreen;