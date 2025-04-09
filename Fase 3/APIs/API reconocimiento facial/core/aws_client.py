import boto3
from config import AWS_CREDENTIALS

rekognition_client = boto3.client('rekognition', **AWS_CREDENTIALS)