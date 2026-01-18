
import requests
import json
import time

url = "http://localhost:8000/llm-recommendations"
payload = {
    "waterShortageLevel": 85.0,
    "trafficCongestionLevel": 90.0,
    "foodPriceChangePercent": 15.0,
    "energyPriceChangePercent": 10.0,
    "publicCleanupNeeded": 20.0,
    "healthStatus": 88.0
}
headers = {'Content-Type': 'application/json'}

print(f"Sending request to {url}...")
try:
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    print(f"Status Code: {response.status_code}")
    print("Response JSON:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
