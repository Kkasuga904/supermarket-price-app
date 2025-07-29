#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
スーパーマーケット価格比較アプリ用ダミーデータ投入スクリプト
実際の店舗情報と価格帯特徴を反映したダミー価格を設定
"""

import sqlite3
from datetime import datetime
import random

# データベース接続
conn = sqlite3.connect('../data/supermarket_prices.db')
cursor = conn.cursor()

# テーブル作成
cursor.execute('''
CREATE TABLE IF NOT EXISTS supermarkets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    phone TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    brand TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    supermarket_id INTEGER NOT NULL,
    price REAL NOT NULL,
    unit TEXT DEFAULT '個',
    recorded_by TEXT NOT NULL,
    recorded_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id),
    FOREIGN KEY (supermarket_id) REFERENCES supermarkets (id)
)
''')

# 既存データをクリア
cursor.execute('DELETE FROM prices')
cursor.execute('DELETE FROM products')
cursor.execute('DELETE FROM supermarkets')

# スーパーマーケットデータ（東京都内+市川駅周辺、計34店舗）
supermarkets = [
    # === 市川駅周辺のスーパーマーケット（14店舗） ===
    ("イトーヨーカドー 市川店", "千葉県市川市二俣2-13-3", 35.7238, 139.9174, "047-327-2111"),
    ("ニッケコルトンプラザ ダイエー", "千葉県市川市鬼高1-1-1", 35.7261, 139.9129, "047-370-3111"),
    ("まいばすけっと 市川駅前店", "千葉県市川市市川1-7-6", 35.7227, 139.9259, "047-329-5560"),
    ("スーパーマルエツ プチ 市川店", "千葉県市川市市川1-20-16", 35.7218, 139.9269, "047-329-6821"),
    ("西友 市川店", "千葉県市川市市川1-4-18", 35.7231, 139.9251, "047-322-0611"),
    ("ライフ 市川店", "千葉県市川市八幡2-5-20", 35.7244, 139.9287, "047-334-5611"),
    ("マックスバリュエクスプレス 市川店", "千葉県市川市市川2-1-1", 35.7211, 139.9245, "047-326-8810"),
    ("アコレ 市川真間店", "千葉県市川市真間2-18-14", 35.7201, 139.9308, "047-323-5571"),
    ("マルエツ 市川店", "千葉県市川市市川3-4-5", 35.7195, 139.9262, "047-325-1611"),
    ("イオン 市川妙典店", "千葉県市川市妙典5-3-1", 35.6677, 139.9058, "047-397-8000"),
    ("オリンピック 市川店", "千葉県市川市市川南1-1-1", 35.7189, 139.9289, "047-324-1611"),
    ("業務スーパー 市川店", "千葉県市川市平田2-4-8", 35.7276, 139.9195, "047-378-5611"),
    ("ドンキホーテ 市川駅前店", "千葉県市川市市川1-9-1", 35.7221, 139.9273, "047-329-8911"),
    ("BIGA（ビッグエー） 市川八幡店", "千葉県市川市八幡3-2-12", 35.7258, 139.9301, "047-335-8811"),
    
    # === 既存の東京都内のスーパーマーケット（20店舗） ===
    # 業務スーパー（価格帯：安め、業務用サイズ多い）
    ("業務スーパー 東新宿店", "東京都新宿区余丁町6-15", 35.7016, 139.7123, "03-5362-7488"),
    ("業務スーパー 高円寺店", "東京都杉並区高円寺南4-6-5", 35.7059, 139.6495, "03-3314-0123"),
    ("業務スーパー 練馬店", "東京都練馬区豊玉北6-13-15", 35.7358, 139.6535, "03-3991-2345"),
    ("業務スーパー 町田南大谷店", "東京都町田市南大谷184-1", 35.5421, 139.4467, "042-788-3456"),
    
    # BIGA（ビッグエー）（価格帯：安め、ディスカウント系）
    ("ビッグ・エー 江戸川本一色店", "東京都江戸川区本一色3-27-16", 35.6885, 139.8542, "03-3652-4567"),
    ("ビッグ・エー 練馬西大泉店", "東京都練馬区西大泉2-18-1", 35.7564, 139.5834, "03-3925-5678"),
    ("ビッグ・エー 荒川三丁目店", "東京都荒川区荒川3-29-1", 35.7284, 139.7834, "03-3801-6789"),
    ("ビッグ・エー 葛飾南水元店", "東京都葛飾区南水元1-18-10", 35.7834, 139.8542, "03-3608-7890"),
    
    # ドンキホーテ（価格帯：商品によってバラつき、特価品あり）
    ("MEGAドン・キホーテ 渋谷本店", "東京都渋谷区宇田川町28-6", 35.6615, 139.6982, "03-5428-4086"),
    ("ドン・キホーテ 新宿歌舞伎町店", "東京都新宿区歌舞伎町1-16-5", 35.6938, 139.7034, "03-5291-9211"),
    ("ドン・キホーテ 池袋東口駅前店", "東京都豊島区南池袋1-22-5", 35.7295, 139.7109, "03-5958-7311"),
    ("ドン・キホーテ 新宿東南口別館", "東京都新宿区新宿3-35-16", 35.6896, 139.7038, "03-3354-4086"),
    
    # イオン（価格帯：中程度、PB商品で安い）
    ("イオン 板橋店", "東京都板橋区徳丸2-6-1", 35.7834, 139.6542, "03-3935-8001"),
    ("イオン 東雲店", "東京都江東区東雲1-9-10", 35.6342, 139.7856, "03-3529-0800"),
    
    # 西友（価格帯：安め〜中程度、みなさまのお墨付きブランド）
    ("西友 荻窪店", "東京都杉並区上荻1-9-1", 35.7045, 139.6201, "03-3393-1111"),
    ("西友 三軒茶屋店", "東京都世田谷区三軒茶屋2-11-20", 35.6432, 139.6687, "03-3410-7211"),
    
    # ライフ（価格帯：中程度、品質重視）
    ("ライフ 新宿三丁目店", "東京都新宿区新宿3-17-4", 35.6906, 139.7056, "03-3350-4028"),
    ("ライフ 品川大井町店", "東京都品川区大井1-3-6", 35.6056, 139.7334, "03-3776-1811"),
    
    # まいばすけっと（価格帯：中程度、小型店舗で便利商品）
    ("まいばすけっと 新宿7丁目店", "東京都新宿区新宿7-26-40", 35.7034, 139.7187, "03-3200-8765"),
    ("まいばすけっと 渋谷本町4丁目店", "東京都渋谷区本町4-44-14", 35.6756, 139.6823, "03-3373-4321")
]

# 商品データ
products = [
    ("卵", "畜産・卵", ""),
    ("牛乳", "乳製品", ""),
    ("食パン", "パン・米", ""),
    ("米", "パン・米", ""),
    ("鶏肉", "肉類", ""),
    ("豚肉", "肉類", ""),
    ("玉ねぎ", "野菜", ""),
    ("じゃがいも", "野菜", ""),
    ("バナナ", "果物", ""),
    ("キャベツ", "野菜", ""),
    ("人参", "野菜", ""),
    ("りんご", "果物", "")
]

# スーパーマーケット挿入
for supermarket in supermarkets:
    cursor.execute('''
    INSERT INTO supermarkets (name, address, latitude, longitude, phone, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', supermarket + (datetime.now().isoformat(),))

# 商品挿入
for product in products:
    cursor.execute('''
    INSERT INTO products (name, category, brand, created_at)
    VALUES (?, ?, ?, ?)
    ''', product + (datetime.now().isoformat(),))

# 価格設定（店舗特徴を反映）
def get_price_range(supermarket_name, product_name):
    """店舗と商品の特徴に基づいて価格範囲を返す"""
    
    # 基本価格設定（円）
    base_prices = {
        "卵": 200,
        "牛乳": 180,
        "食パン": 150,
        "米": 400,  # 1kg当たり
        "鶏肉": 300,  # 100g当たり
        "豚肉": 350,  # 100g当たり
        "玉ねぎ": 250,  # 1袋
        "じゃがいも": 300,  # 1袋
        "バナナ": 150,
        "キャベツ": 200,
        "人参": 180,
        "りんご": 400
    }
    
    base_price = base_prices.get(product_name, 200)
    
    # 店舗別価格調整係数
    if "業務スーパー" in supermarket_name:
        # 業務スーパー：安め、大容量
        min_factor, max_factor = 0.7, 0.9
    elif "ビッグ・エー" in supermarket_name:
        # ビッグエー：安め、ディスカウント
        min_factor, max_factor = 0.75, 0.92
    elif "ドンキホーテ" in supermarket_name:
        # ドンキ：商品によってバラつき
        if product_name in ["卵", "牛乳", "食パン"]:
            min_factor, max_factor = 0.8, 1.1  # 日用品は普通
        else:
            min_factor, max_factor = 0.85, 1.3  # その他はバラつき大
    elif "イオン" in supermarket_name:
        # イオン：中程度、PB商品あり
        min_factor, max_factor = 0.85, 1.05
    elif "西友" in supermarket_name:
        # 西友：安め〜中程度
        min_factor, max_factor = 0.8, 1.0
    elif "ライフ" in supermarket_name:
        # ライフ：中程度、品質重視
        min_factor, max_factor = 0.9, 1.15
    elif "まいばすけっと" in supermarket_name:
        # まいばすけっと：中程度、便利性重視
        min_factor, max_factor = 0.88, 1.08
    else:
        min_factor, max_factor = 0.9, 1.1
    
    min_price = int(base_price * min_factor)
    max_price = int(base_price * max_factor)
    
    return min_price, max_price

# 価格データ生成と挿入
cursor.execute('SELECT id, name FROM supermarkets')
supermarket_data = cursor.fetchall()

cursor.execute('SELECT id, name FROM products')  
product_data = cursor.fetchall()

recorded_users = ["user1", "user2", "admin", "tester", "shopper"]

for supermarket_id, supermarket_name in supermarket_data:
    for product_id, product_name in product_data:
        min_price, max_price = get_price_range(supermarket_name, product_name)
        
        # 各商品に2-3個の価格データを追加（異なる日時・ユーザー）
        for _ in range(random.randint(2, 3)):
            price = random.randint(min_price, max_price)
            recorded_by = random.choice(recorded_users)
            
            cursor.execute('''
            INSERT INTO prices (product_id, supermarket_id, price, unit, recorded_by, recorded_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ''', (product_id, supermarket_id, price, "個", recorded_by, datetime.now().isoformat()))

# コミットして接続を閉じる
conn.commit()
conn.close()

print("ダミーデータの投入が完了しました！")
print(f"スーパーマーケット: {len(supermarkets)}店舗")
print(f"商品: {len(products)}種類")
print("各店舗×商品の組み合わせで2-3個の価格データを生成")