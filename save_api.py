#!/usr/bin/env python3
"""
简单存档API - 卡皮巴拉游戏
POST /save - 保存存档 {user_id, data}
GET /load?user_id=xxx - 读取存档
"""

from flask import Flask, request, jsonify
import json
import os
from datetime import datetime

app = Flask(__name__)

SAVE_DIR = "/home/ubuntu/capybara-saves"
os.makedirs(SAVE_DIR, exist_ok=True)

@app.route('/save', methods=['POST'])
def save():
    try:
        body = request.json
        user_id = body.get('user_id', 'anonymous')
        data = body.get('data', {})

        filename = f"{SAVE_DIR}/{user_id}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump({
                'user_id': user_id,
                'saved_at': datetime.now().isoformat(),
                'data': data
            }, f, ensure_ascii=False, indent=2)

        return jsonify({'success': True, 'message': '存档成功'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/load', methods=['GET'])
def load():
    try:
        user_id = request.args.get('user_id', 'anonymous')
        filename = f"{SAVE_DIR}/{user_id}.json"

        if not os.path.exists(filename):
            return jsonify({'success': False, 'error': '存档不存在', 'data': None})

        with open(filename, 'r', encoding='utf-8') as f:
            saved = json.load(f)

        return jsonify({'success': True, 'data': saved.get('data'), 'saved_at': saved.get('saved_at')})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8081, debug=False)
