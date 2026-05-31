import requests
import json

TOKEN = "rnd_elBpMrg5HobxrrrfR77rySKKpYsx"
SERVICE_ID = "srv-d8asvrl7vvec73b1nnn0"
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Accept": "application/json",
    "Content-Type": "application/json"
}
BASE_URL = "https://api.render.com/v1"

def update_service():
    print("Fetching current service details...")
    resp = requests.get(f"{BASE_URL}/services/{SERVICE_ID}", headers=HEADERS)
    print(resp.status_code, resp.text)
    if resp.status_code != 200:
        return
        
    data = resp.json()
    
    # Render API PATCH /services/{serviceId}
    # To fix the Ruby issue, we set the root directory to backend
    # and the runtime to docker since we have a Dockerfile there.
    payload = {
        "rootDir": "backend",
        "serviceDetails": {
            "runtime": "docker"
        }
    }
    
    print("Updating service...")
    patch_resp = requests.patch(f"{BASE_URL}/services/{SERVICE_ID}", headers=HEADERS, json=payload)
    print("Patch response:", patch_resp.status_code, patch_resp.text)
    
    print("Triggering deploy...")
    deploy_resp = requests.post(f"{BASE_URL}/services/{SERVICE_ID}/deploys", headers=HEADERS)
    print("Deploy response:", deploy_resp.status_code, deploy_resp.text)

if __name__ == '__main__':
    update_service()
