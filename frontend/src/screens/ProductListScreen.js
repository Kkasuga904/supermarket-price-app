import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { productAPI } from '../services/api';

const ProductListScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    '全て',
    '野菜',
    '果物',
    '肉類',
    '魚類',
    '乳製品',
    'パン',
    '米・穀物',
    '調味料',
    '冷凍食品',
    'お菓子',
    '飲み物',
    'その他',
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAll({ limit: 200 });
      setProducts(response.data);
    } catch (error) {
      console.error('商品の取得に失敗しました:', error);
      Alert.alert('エラー', '商品情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // カテゴリでフィルタ
    if (selectedCategory && selectedCategory !== '全て') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // 検索クエリでフィルタ
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        (product.brand && product.brand.toLowerCase().includes(query))
      );
    }

    setFilteredProducts(filtered);
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.length > 0) {
      try {
        const response = await productAPI.search(query);
        const searchResults = response.data;
        
        // 既存の商品リストにない検索結果があれば追加
        const existingIds = products.map(p => p.id);
        const newProducts = searchResults.filter(p => !existingIds.includes(p.id));
        
        if (newProducts.length > 0) {
          setProducts(prevProducts => [...prevProducts, ...newProducts]);
        }
      } catch (error) {
        console.error('検索に失敗しました:', error);
      }
    }
  };

  const renderCategoryFilter = () => (
    <View style={styles.categoryContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === item && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(item === '全て' ? '' : item)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === item && styles.categoryButtonTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => {
        console.log('Product tapped:', item.name);
        navigation.navigate('PriceComparison', { product: item });
      }}
      activeOpacity={0.7}
      delayPressIn={0}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        {item.brand && (
          <Text style={styles.productBrand}>{item.brand}</Text>
        )}
        <View style={styles.productMeta}>
          <Text style={styles.productCategory}>{item.category}</Text>
        </View>
      </View>
      <View style={styles.chevronContainer}>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>商品を読み込み中...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="商品名で検索..."
          value={searchQuery}
          onChangeText={handleSearch}
          clearButtonMode={Platform.OS === 'ios' ? 'while-editing' : 'never'}
          placeholderTextColor="#999"
        />
      </View>

      {renderCategoryFilter()}

      <View style={styles.resultHeader}>
        <Text style={styles.resultText}>
          {filteredProducts.length}件の商品
        </Text>
      </View>

      {filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>
            {searchQuery || selectedCategory
              ? '検索条件に一致する商品が見つかりませんでした'
              : 'まだ商品が登録されていません'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProductItem}
          style={styles.productList}
          showsVerticalScrollIndicator={false}
        />
      )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  innerContainer: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  categoryContainer: {
    backgroundColor: 'white',
    paddingVertical: 10,
    marginBottom: 10,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
  },
  categoryButtonTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  resultHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resultText: {
    fontSize: 14,
    color: '#666',
  },
  productList: {
    flex: 1,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    minHeight: 70, // 最小高さを設定してタップ領域を確保
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  productMeta: {
    flexDirection: 'row',
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  chevronContainer: {
    paddingLeft: 10,
    paddingRight: Platform.OS === 'ios' ? 5 : 0, // iOS用の右側パディング調整
  },
});

export default ProductListScreen;