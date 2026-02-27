import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

url = "https://generativelanguage.googleapis.com/v1beta/models"
headers = {
    "Authorization": f"Bearer {API_KEY}",
}

resp = requests.get(url, headers=headers)
data = resp.json()

print("Models available from the API:")
for model in data.get("models", []):
    print(model.get("name"))