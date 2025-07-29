#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
データベース内容確認スクリプト
"""

import sqlite3

# データベース接続
conn = sqlite3.connect('../data/supermarket_prices.db')
cursor = conn.cursor()

print("=== データベース内容確認 ===\n")

# スーパーマーケット数
cursor.execute('SELECT COUNT(*) FROM supermarkets')
supermarket_count = cursor.fetchone()[0]
print(f"スーパーマーケット数: {supermarket_count}店舗")

# 商品数
cursor.execute('SELECT COUNT(*) FROM products')
product_count = cursor.fetchone()[0]
print(f"商品数: {product_count}種類")

# 価格データ数
cursor.execute('SELECT COUNT(*) FROM prices')
price_count = cursor.fetchone()[0]
print(f"価格データ数: {price_count}件")

print(f"\n=== スーパーマーケット一覧 ===")
cursor.execute('SELECT name, address FROM supermarkets ORDER BY name')
supermarkets = cursor.fetchall()
for name, address in supermarkets:
    print(f"- {name}: {address}")

print(f"\n=== 商品一覧 ===")
cursor.execute('SELECT name, category FROM products ORDER BY category, name')
products = cursor.fetchall()
current_category = ""
for name, category in products:
    if category != current_category:
        print(f"\n[{category}]")
        current_category = category
    print(f"  - {name}")

print(f"\n=== 価格例（業務スーパー東新宿店）===")
cursor.execute('''
SELECT p.name, pr.price, pr.unit 
FROM prices pr
JOIN products p ON pr.product_id = p.id
JOIN supermarkets s ON pr.supermarket_id = s.id
WHERE s.name = "業務スーパー 東新宿店"
ORDER BY p.name
''')
prices = cursor.fetchall()
for product_name, price, unit in prices:
    print(f"  {product_name}: {price}円/{unit}")

print(f"\n=== 価格例（MEGAドン・キホーテ渋谷本店）===")
cursor.execute('''
SELECT p.name, pr.price, pr.unit 
FROM prices pr
JOIN products p ON pr.product_id = p.id
JOIN supermarkets s ON pr.supermarket_id = s.id
WHERE s.name = "MEGAドン・キホーテ 渋谷本店"
ORDER BY p.name
''')
prices = cursor.fetchall()
for product_name, price, unit in prices:
    print(f"  {product_name}: {price}円/{unit}")

conn.close()