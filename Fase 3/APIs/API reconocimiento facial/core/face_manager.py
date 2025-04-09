from core.aws_client import rekognition_client
from config import COLLECTION_ID
import os

class FaceManager:
    @staticmethod
    def create_collection():
        try:
            rekognition_client.create_collection(CollectionId=COLLECTION_ID)
            print(f"Collection {COLLECTION_ID} created successfully.")
            return True
        except rekognition_client.exceptions.ResourceAlreadyExistsException:
            print(f"Collection {COLLECTION_ID} already exists.")
            return False

    @staticmethod
    def index_face(user_id, image_bytes):
        response = rekognition_client.index_faces(
            CollectionId=COLLECTION_ID,
            Image={'Bytes': image_bytes},
            ExternalImageId=user_id,
            MaxFaces=1,
            QualityFilter='AUTO'
        )
        return response['FaceRecords'][0]['Face']['FaceId'] if response['FaceRecords'] else None

    @staticmethod
    def verify_face(image_bytes, threshold=90):
        response = rekognition_client.search_faces_by_image(
            CollectionId=COLLECTION_ID,
            Image={'Bytes': image_bytes},
            FaceMatchThreshold=threshold
        )
        return response.get('FaceMatches', [])