from flask import Flask, request, jsonify
from core.face_manager import FaceManager
import base64
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/register', methods=['POST'])
def register_user():
    user_id = request.form.get('user_id')
    image_file = request.files['image']
    
    if not user_id or not image_file:
        return jsonify({"error": "Missing user_id or image"}), 400
    
    face_id = FaceManager.index_face(user_id, image_file.read())
    return jsonify({"face_id": face_id}), 200 if face_id else 400

@app.route('/verify', methods=['POST'])
def verify_face():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    try:
        image_data = request.files['image'].read()
        matches = FaceManager.verify_face(image_data)
        
        if matches:
            return jsonify({
                "access": True,
                "user": matches[0]['Face']['ExternalImageId'],
                "confidence": matches[0]['Similarity']
            })
        return jsonify({"access": False}), 200
    
    except Exception as e:
        if "InvalidParameterException" in str(e) and "no faces" in str(e):
            return jsonify({
                "access": False,
                "error": "No faces detected in the image"
            }), 200
        else:
            print(f"Error in verify_face: {str(e)}")
            return jsonify({
                "access": False,
                "error": "Internal server error"
            }), 500
        

#get de bienvenida
@app.route('/', methods=['GET'])
def welcome():
    return jsonify({"message": "Welcome to the Face Recognition API!"}), 200

if __name__ == '__main__':
    app.run(port=5000, debug=True, host="0.0.0.0")