# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import os
import torch

app = Flask(__name__)
CORS(app)

# GPU 사용 여부 설정
device = 0 if torch.cuda.is_available() else -1

# 한국어 키워드
environmental_keywords = ["환경", "기후", "지속 가능성", "생태", "녹색", "자연"]

# Hugging Face의 Transformers 라이브러리를 사용하여 BERT 모델 로드
model_name = "facebook/bart-large-mnli"
classifier = pipeline("zero-shot-classification", model=model_name, device=device)

def filter_environmental_content(data_array):
    results = []
    labels = ["환경", "기후", "지속 가능성", "생태", "녹색", "자연"]
    
    for data in data_array:
        content = data['content']
        classification = classifier(content, labels, multi_label=True)
        
        # 임계값을 설정하여 관련성이 높은 텍스트만 필터링
        threshold = 0.9
        if any(score > threshold for score in classification['scores']):
            results.append(data)
            print(data)
            print("\n")
        print("data passing\n")
    
    return results


@app.route('/filter', methods=['POST'])
def filter_content():
    data = request.json
    filtered_data = filter_environmental_content(data)
    return jsonify(filtered_data)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 6000))
    app.run(host='0.0.0.0', port=port)
