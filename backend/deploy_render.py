import requests
import json
import time
import os

RENDER_TOKEN = "rnd_gqYAWr0vUDzzo8qIkkKiWhQ13rBW"
HEADERS = {
    "Authorization": f"Bearer {RENDER_TOKEN}",
    "Accept": "application/json",
    "Content-Type": "application/json"
}
BASE_URL = "https://api.render.com/v1"

def create_postgres():
    print("Creating Postgres DB...")
    payload = {
        "name": "shadow-ai-db",
        "plan": "free",
        "region": "oregon",
        "version": "15",
        "databaseName": "shadow_ai",
        "databaseUser": "shadow_user"
    }
    resp = requests.post(f"{BASE_URL}/postgres", headers=HEADERS, json=payload)
    if resp.status_code == 201:
        data = resp.json()
        print(f"Created Postgres: {data['id']}")
        return data['id']
    else:
        print(f"Error creating Postgres: {resp.text}")
        return None

def get_postgres_connection(db_id):
    print("Getting Postgres connection URL...")
    # It might take a few seconds to provision
    while True:
        resp = requests.get(f"{BASE_URL}/postgres/{db_id}", headers=HEADERS)
        if resp.status_code == 200:
            data = resp.json()
            # Try to get the internal or external connection string
            # External is usually in the connectionInfo
            if 'connectionInfo' in data and data['connectionInfo'].get('externalConnectionString'):
                return data['connectionInfo']['externalConnectionString'], data['connectionInfo'].get('internalConnectionString')
        time.sleep(5)

def create_web_service(internal_db_url):
    print("Creating Web Service...")
    payload = {
        "type": "web_service",
        "name": "shadow-ai-backend",
        "repo": "https://github.com/adhrushtalakshmir-bit/Shadow-AI-essentials",
        "autoDeploy": "yes",
        "branch": "main",
        "buildFilter": {
            "paths": ["backend/**"]
        },
        "serviceDetails": {
            "plan": "free",
            "region": "oregon",
            "runtime": "python",
            "buildCommand": "cd backend && pip install -r requirements.txt",
            "startCommand": "cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT",
            "envVars": [
                {
                    "key": "DATABASE_URL",
                    "value": internal_db_url
                },
                {
                    "key": "JWT_SECRET",
                    "value": "super-secret-jwt-key-production-shadow-ai",
                    "generateValue": False
                },
                {
                    "key": "PYTHON_VERSION",
                    "value": "3.10.0"
                }
            ]
        }
    }
    resp = requests.post(f"{BASE_URL}/services", headers=HEADERS, json=payload)
    if resp.status_code == 201:
        data = resp.json()
        print(f"Created Web Service: {data['id']}")
        print(f"Service URL: {data['service']['serviceDetails']['url']}")
        return data['service']['serviceDetails']['url']
    else:
        print(f"Error creating Web Service: {resp.text}")
        return None

def main():
    db_id = create_postgres()
    if not db_id:
        return
    
    ext_url, int_url = get_postgres_connection(db_id)
    print(f"External DB URL: {ext_url}")
    print(f"Internal DB URL: {int_url}")
    
    # Use internal URL if available, otherwise external
    db_url = int_url if int_url else ext_url
    
    svc_url = create_web_service(db_url)
    if svc_url:
        print(f"Deployment initiated! Backend URL will be: {svc_url}")

if __name__ == '__main__':
    main()
