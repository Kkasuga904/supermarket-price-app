#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
スーパーマーケット価格比較アプリ - サーバー起動スクリプト
"""

import uvicorn
import os
import sys

# バックエンドディレクトリに移動
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_dir)
os.chdir(backend_dir)

# メインアプリケーションをインポート
import main

if __name__ == "__main__":
    print("スーパーマーケット価格比較API サーバーを起動中...")
    print("サーバーURL: http://192.168.200.38:8001")
    print("API ドキュメント: http://192.168.200.38:8001/docs")
    print("停止するには Ctrl+C を押してください")
    print("-" * 50)
    
    # サーバー起動
    uvicorn.run(
        main.app, 
        host="0.0.0.0", 
        port=8001, 
        reload=True,
        log_level="info"
    )