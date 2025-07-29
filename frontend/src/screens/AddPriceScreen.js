import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { productAPI, priceAPI, supermarketAPI } from '../services/api';

const AddPriceScreen = ({ route, navigation }) => {
  const { product: initialProduct, supermarket: initialSupermarket } = route.params || {};
  
  const [product, setProduct] = useState(initialProduct || null);
  const [supermarket, setSupermarket] = useState(initialSupermarket || null);
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('個');
  const [recordedBy, setRecordedBy] = useState('');
  
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productBrand, setProductBrand] = useState('');
  
  const [supermarketName, setSupermarketName] = useState('');
  const [supermarketAddress, setSupermarketAddress] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [searchingProducts, setSearchingProducts] = useState(false);
  const [searchingSupermarkets, setSearchingSupermarkets] = useState(false);
  
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [supermarketSuggestions, setSupermarketSuggestions] = useState([]);

  const units = ['個', 'パック', 'kg', 'g', '本', '袋', 'L', 'ml', '箱'];
  const categories = [
    '野菜', '果物', '肉類', '魚類', '乳製品', 'パン', '米・穀物',
    '調味料', '冷凍食品', 'お菓子', '飲み物', 'その他'
  ];

  useEffect(() => {
    if (initialProduct) {
      setProductName(initialProduct.name);
      setProductCategory(initialProduct.category);
      setProductBrand(initialProduct.brand || '');
    }
    if (initialSupermarket) {
      setSupermarketName(initialSupermarket.name);
      setSupermarketAddress(initialSupermarket.address);
    }
  }, []);

  const searchProducts = async (query) => {
    if (query.length < 2) {
      setProductSuggestions([]);
      return;
    }

    try {
      setSearchingProducts(true);
      const response = await productAPI.search(query);
      setProductSuggestions(response.data.slice(0, 5));
    } catch (error) {
      console.error('商品検索に失敗しました:', error);
    } finally {
      setSearchingProducts(false);
    }
  };

  const searchSupermarkets = async (query) => {
    if (query.length < 2) {
      setSupermarketSuggestions([]);
      return;
    }

    try {
      setSearchingSupermarkets(true);
      const response = await supermarketAPI.getAll();
      const filtered = response.data.filter(s => 
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.address.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setSupermarketSuggestions(filtered);
    } catch (error) {
      console.error('スーパーマーケット検索に失敗しました:', error);
    } finally {
      setSearchingSupermarkets(false);
    }
  };

  const selectProduct = (selectedProduct) => {
    setProduct(selectedProduct);
    setProductName(selectedProduct.name);
    setProductCategory(selectedProduct.category);
    setProductBrand(selectedProduct.brand || '');
    setProductSuggestions([]);
  };

  const selectSupermarket = (selectedSupermarket) => {
    setSupermarket(selectedSupermarket);
    setSupermarketName(selectedSupermarket.name);
    setSupermarketAddress(selectedSupermarket.address);
    setSupermarketSuggestions([]);
  };

  const validateForm = () => {
    if (!productName.trim()) {
      Alert.alert('エラー', '商品名を入力してください');
      return false;
    }
    if (!productCategory.trim()) {
      Alert.alert('エラー', 'カテゴリを選択してください');
      return false;
    }
    if (!supermarketName.trim()) {
      Alert.alert('エラー', 'スーパーマーケット名を入力してください');
      return false;
    }
    if (!price.trim() || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      Alert.alert('エラー', '正しい価格を入力してください');
      return false;
    }
    if (!recordedBy.trim()) {
      Alert.alert('エラー', '登録者名を入力してください');
      return false;
    }
    return true;
  };

  const createProductIfNeeded = async () => {
    if (product) return product;

    try {
      const response = await productAPI.create({
        name: productName.trim(),
        category: productCategory,
        brand: productBrand.trim() || null,
      });
      return response.data;
    } catch (error) {
      throw new Error('商品の作成に失敗しました');
    }
  };

  const createSupermarketIfNeeded = async () => {
    if (supermarket) return supermarket;

    // 新しいスーパーマーケットの場合は位置情報が必要
    Alert.alert(
      '新しいスーパーマーケット',
      'このスーパーマーケットは未登録です。位置情報の設定は後で行えます。',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '続行', 
          onPress: async () => {
            try {
              const response = await supermarketAPI.create({
                name: supermarketName.trim(),
                address: supermarketAddress.trim() || '住所未設定',
                latitude: 0, // 後で設定
                longitude: 0, // 後で設定
                phone: null,
              });
              return response.data;
            } catch (error) {
              throw new Error('スーパーマーケットの作成に失敗しました');
            }
          }
        }
      ]
    );
    return null;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // 商品とスーパーマーケットを作成（必要に応じて）
      const finalProduct = await createProductIfNeeded();
      const finalSupermarket = await createSupermarketIfNeeded();

      if (!finalProduct || !finalSupermarket) {
        setLoading(false);
        return;
      }

      // 価格を登録
      await priceAPI.create({
        product_id: finalProduct.id,
        supermarket_id: finalSupermarket.id,
        price: parseFloat(price),
        unit: unit,
        recorded_by: recordedBy.trim(),
      });

      Alert.alert(
        '登録完了',
        '価格情報を登録しました',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('価格登録に失敗しました:', error);
      Alert.alert('エラー', error.message || '価格の登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 商品情報セクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>商品情報</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>商品名 *</Text>
            <TextInput
              style={styles.input}
              value={productName}
              onChangeText={(text) => {
                setProductName(text);
                if (!product) {
                  searchProducts(text);
                }
              }}
              placeholder="商品名を入力"
              editable={!product}
            />
            {searchingProducts && (
              <ActivityIndicator size="small" color="#007AFF" style={styles.searchIndicator} />
            )}
            {productSuggestions.length > 0 && !product && (
              <View style={styles.suggestions}>
                {productSuggestions.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.suggestionItem}
                    onPress={() => selectProduct(item)}
                  >
                    <View>
                      <Text style={styles.suggestionName}>{item.name}</Text>
                      <Text style={styles.suggestionMeta}>
                        {item.category} {item.brand ? `・ ${item.brand}` : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>カテゴリ *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryContainer}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      productCategory === cat && styles.categoryButtonActive,
                    ]}
                    onPress={() => setProductCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        productCategory === cat && styles.categoryButtonTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ブランド（任意）</Text>
            <TextInput
              style={styles.input}
              value={productBrand}
              onChangeText={setProductBrand}
              placeholder="ブランド名"
            />
          </View>
        </View>

        {/* スーパーマーケット情報セクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>スーパーマーケット情報</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>店舗名 *</Text>
            <TextInput
              style={styles.input}
              value={supermarketName}
              onChangeText={(text) => {
                setSupermarketName(text);
                if (!supermarket) {
                  searchSupermarkets(text);
                }
              }}
              placeholder="スーパーマーケット名を入力"
              editable={!supermarket}
            />
            {searchingSupermarkets && (
              <ActivityIndicator size="small" color="#007AFF" style={styles.searchIndicator} />
            )}
            {supermarketSuggestions.length > 0 && !supermarket && (
              <View style={styles.suggestions}>
                {supermarketSuggestions.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.suggestionItem}
                    onPress={() => selectSupermarket(item)}
                  >
                    <View>
                      <Text style={styles.suggestionName}>{item.name}</Text>
                      <Text style={styles.suggestionMeta}>{item.address}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>住所</Text>
            <TextInput
              style={styles.input}
              value={supermarketAddress}
              onChangeText={setSupermarketAddress}
              placeholder="店舗の住所"
              editable={!supermarket}
            />
          </View>
        </View>

        {/* 価格情報セクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>価格情報</Text>
          
          <View style={styles.priceInputRow}>
            <View style={styles.priceInputGroup}>
              <Text style={styles.label}>価格 *</Text>
              <TextInput
                style={styles.priceInput}
                value={price}
                onChangeText={setPrice}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
            <Text style={styles.currencySymbol}>円</Text>
            <Text style={styles.perText}>/</Text>
            <View style={styles.unitInputGroup}>
              <Text style={styles.label}>単位</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.unitContainer}>
                  {units.map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={[
                        styles.unitButton,
                        unit === u && styles.unitButtonActive,
                      ]}
                      onPress={() => setUnit(u)}
                    >
                      <Text
                        style={[
                          styles.unitButtonText,
                          unit === u && styles.unitButtonTextActive,
                        ]}
                      >
                        {u}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>登録者名 *</Text>
            <TextInput
              style={styles.input}
              value={recordedBy}
              onChangeText={setRecordedBy}
              placeholder="あなたの名前"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="white" />
              <Text style={styles.submitButtonText}>価格を登録</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  priceInputGroup: {
    flex: 1,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
    backgroundColor: 'white',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginLeft: 8,
    marginBottom: 12,
  },
  perText: {
    fontSize: 16,
    color: '#666',
    marginHorizontal: 8,
    marginBottom: 12,
  },
  unitInputGroup: {
    flex: 1,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  unitContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  unitButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    minWidth: 40,
    alignItems: 'center',
  },
  unitButtonActive: {
    backgroundColor: '#007AFF',
  },
  unitButtonText: {
    fontSize: 14,
    color: '#666',
  },
  unitButtonTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  searchIndicator: {
    position: 'absolute',
    right: 12,
    top: 40,
  },
  suggestions: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: 'white',
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  suggestionMeta: {
    fontSize: 14,
    color: '#666',
  },
  submitContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AddPriceScreen;