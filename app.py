from flask import Flask, request, jsonify
import re
import math

app = Flask(__name__)

def entropy(password):
    charset = 0
    if re.search(r'[a-z]', password):
        charset += 26
    if re.search(r'[A-Z]', password):
        charset += 26
    if re.search(r'[0-9]', password):
        charset += 10
    if re.search(r'[^A-Za-z0-9]', password):
        charset += 32
    return round(len(password) * math.log2(charset)) if charset else 0

@app.route('/check', methods=['POST'])
def check_password():
    data = request.json
    password = data['password']
    strength = entropy(password)

    return jsonify({
        "entropy": strength,
        "message": (
            "Weak" if strength < 30 else
            "Moderate" if strength < 50 else
            "Strong"
        )
    })

if __name__ == '__main__':
    app.run(debug=True)
