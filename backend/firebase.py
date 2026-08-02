import os
import pyrebase
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

# We use the web credentials you provided!
firebaseConfig = {
    "apiKey": os.getenv("FIREBASE_API_KEY"),
    "authDomain": os.getenv("FIREBASE_AUTH_DOMAIN"),
    "projectId": os.getenv("FIREBASE_PROJECT_ID"),
    "storageBucket": os.getenv("FIREBASE_STORAGE_BUCKET"),
    "messagingSenderId": os.getenv("FIREBASE_MESSAGING_SENDER_ID"),
    "appId": os.getenv("FIREBASE_APP_ID"),
    "databaseURL": f'https://{os.getenv("FIREBASE_PROJECT_ID")}-default-rtdb.firebaseio.com'
}

try:
    firebase_app = pyrebase.initialize_app(firebaseConfig)
    db = firebase_app.database()
    print("Pyrebase initialized successfully using web credentials.")
except Exception as e:
    db = None
    print(f"Error initializing Pyrebase: {e}")
