import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import MapScreen from './src/screens/MapScreen';
import ProductListScreen from './src/screens/ProductListScreen';
import PriceComparisonScreen from './src/screens/PriceComparisonScreen';
import AddPriceScreen from './src/screens/AddPriceScreen';
import SupermarketDetailScreen from './src/screens/SupermarketDetailScreen';
import TestScreen from './src/screens/TestScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MapStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MapMain" 
        component={MapScreen} 
        options={{ title: '地図' }}
      />
      <Stack.Screen 
        name="SupermarketDetail" 
        component={SupermarketDetailScreen} 
        options={{ title: '店舗詳細' }}
      />
    </Stack.Navigator>
  );
}

function ProductStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ProductList" 
        component={ProductListScreen} 
        options={{ title: '商品一覧' }}
      />
      <Stack.Screen 
        name="PriceComparison" 
        component={PriceComparisonScreen} 
        options={{ title: '価格比較' }}
      />
      <Stack.Screen 
        name="AddPrice" 
        component={AddPriceScreen} 
        options={{ title: '価格登録' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Map') {
              iconName = focused ? 'map' : 'map-outline';
            } else if (route.name === 'Products') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'Test') {
              iconName = focused ? 'bug' : 'bug-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen 
          name="Map" 
          component={MapStack} 
          options={{ tabBarLabel: '地図' }}
        />
        <Tab.Screen 
          name="Products" 
          component={ProductStack} 
          options={{ tabBarLabel: '商品' }}
        />
        <Tab.Screen 
          name="Test" 
          component={TestScreen} 
          options={{ tabBarLabel: 'テスト' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}