import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { priceAPI } from '../services/api';

const PriceComparisonScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: `${product.name} - 価格比較`,
    });
    loadPriceComparison();
  }, []);

  const loadPriceComparison = async () => {
    try {
      setLoading(true);
      const response = await priceAPI.compare(product.id);
      setComparisonData(response.data);
    } catch (error) {
      console.error('価格比較データの取得に失敗しました:', error);
      if (error.response?.status === 404) {
        setComparisonData({ product: product.name, prices: [] });
      } else {
        Alert.alert('エラー', '価格比較データの取得に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPriceComparison();
    setRefreshing(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return '今日';
    } else if (diffDays === 2) {
      return '昨日';
    } else if (diffDays <= 7) {
      return `${diffDays - 1}日前`;
    } else {
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const getPriceRankColor = (index, total) => {
    if (index === 0) return '#4CAF50'; // 最安値：緑
    if (index === total - 1 && total > 2) return '#FF5722'; // 最高値：赤
    return '#FF9800'; // 中間：オレンジ
  };

  const getPriceRankText = (index, total) => {
    if (index === 0) return '最安値';
    if (index === total - 1 && total > 2) return '最高値';
    return `${index + 1}位`;
  };

  const renderPriceItem = (priceInfo, index, total) => (
    <View key={`${priceInfo.supermarket}-${priceInfo.recorded_at}`} style={styles.priceItem}>
      <View style={styles.rankContainer}>
        <View style={[
          styles.rankBadge,
          { backgroundColor: getPriceRankColor(index, total) }
        ]}>
          <Text style={styles.rankText}>
            {getPriceRankText(index, total)}
          </Text>
        </View>
      </View>

      <View style={styles.priceContent}>
        <View style={styles.priceHeader}>
          <Text style={styles.supermarketName}>{priceInfo.supermarket}</Text>
          <Text style={styles.priceValue}>
            {formatPrice(priceInfo.price)}
            <Text style={styles.priceUnit}>/{priceInfo.unit}</Text>
          </Text>
        </View>

        <Text style={styles.supermarketAddress}>{priceInfo.address}</Text>
        
        <View style={styles.priceFooter}>
          <Text style={styles.recordedDate}>
            {formatDate(priceInfo.recorded_at)}に更新
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.moreButton}>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>
    </View>
  );

  const calculatePriceDifference = (prices) => {
    if (prices.length < 2) return null;
    
    const highest = Math.max(...prices.map(p => p.price));
    const lowest = Math.min(...prices.map(p => p.price));
    const difference = highest - lowest;
    const percentage = ((difference / lowest) * 100).toFixed(1);
    
    return { difference, percentage };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>価格を比較中...</Text>
      </View>
    );
  }

  const priceDiff = calculatePriceDifference(comparisonData?.prices || []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.productName}>{comparisonData?.product || product.name}</Text>
        {product.brand && (
          <Text style={styles.productBrand}>{product.brand}</Text>
        )}
        <Text style={styles.productCategory}>{product.category}</Text>
      </View>

      {comparisonData?.prices?.length > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>価格サマリー</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>登録店舗数</Text>
            <Text style={styles.summaryValue}>{comparisonData.prices.length}店舗</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>最安値</Text>
            <Text style={[styles.summaryValue, styles.bestPrice]}>
              {formatPrice(Math.min(...comparisonData.prices.map(p => p.price)))}
            </Text>
          </View>
          {priceDiff && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>価格差</Text>
              <Text style={styles.summaryValue}>
                {formatPrice(priceDiff.difference)} ({priceDiff.percentage}%差)
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.pricesSection}>
        <Text style={styles.sectionTitle}>
          店舗別価格 ({comparisonData?.prices?.length || 0}件)
        </Text>

        {!comparisonData?.prices || comparisonData.prices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              まだこの商品の価格情報が登録されていません
            </Text>
            <Text style={styles.emptySubText}>
              お近くのスーパーで見つけたら価格を登録してみましょう
            </Text>
            <TouchableOpacity
              style={styles.addPriceButton}
              onPress={() => navigation.navigate('AddPrice', { product })}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addPriceButtonText}>価格を登録する</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.pricesList}>
            {comparisonData.prices.map((priceInfo, index) =>
              renderPriceItem(priceInfo, index, comparisonData.prices.length)
            )}
          </View>
        )}
      </View>

      {comparisonData?.prices?.length > 0 && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.addMoreButton}
            onPress={() => navigation.navigate('AddPrice', { product })}
          >
            <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.addMoreButtonText}>別の店舗の価格を追加</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  header: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  productBrand: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 5,
  },
  productCategory: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  summaryContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  bestPrice: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pricesSection: {
    backgroundColor: 'white',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  pricesList: {
    gap: 15,
  },
  priceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  rankContainer: {
    marginRight: 15,
  },
  rankBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  rankText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  priceContent: {
    flex: 1,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  supermarketName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  priceUnit: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#666',
  },
  supermarketAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  priceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordedDate: {
    fontSize: 12,
    color: '#666',
  },
  moreButton: {
    padding: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
    marginBottom: 5,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  addPriceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addPriceButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 5,
  },
  actionContainer: {
    padding: 20,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  addMoreButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 5,
  },
});

export default PriceComparisonScreen;