import os
import firebase_admin
from firebase_admin import credentials, firestore, auth
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

firebase_app = None
db = None

# Extract Service Account credentials from environment variables
project_id = os.getenv("FIREBASE_PROJECT_ID")
client_email = os.getenv("FIREBASE_CLIENT_EMAIL")
private_key = os.getenv("FIREBASE_PRIVATE_KEY")

if client_email and private_key:
    try:
        # Build the credentials dictionary manually
        cred = credentials.Certificate({
            "type": "service_account",
            "project_id": project_id,
            "private_key": private_key.replace('\\n', '\n'),
            "client_email": client_email,
            "token_uri": "https://oauth2.googleapis.com/token",
        })
        
        firebase_app = firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("✅ Firebase Admin SDK initialized successfully using .env credentials.")
    except Exception as e:
        print(f"❌ Error initializing Firebase: {e}")
else:
    print("⚠️ WARNING: FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY not found in .env! Firebase Admin SDK is NOT initialized.")
