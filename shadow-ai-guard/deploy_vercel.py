import requests
import json
import time
import os

VERCEL_TOKEN = os.environ.get("VERCEL_TOKEN", "")
if not VERCEL_TOKEN:
    raise ValueError("VERCEL_TOKEN environment variable is not set. Set it before running this script.")
HEADERS = {
    "Authorization": f"Bearer {VERCEL_TOKEN}",
    "Content-Type": "application/json"
}

def create_project():
    print("Creating Vercel project...")
    payload = {
        "name": "shadow-ai-guard",
        "framework": "vite",
        "buildCommand": "npm run build",
        "outputDirectory": "dist",
        "gitRepository": {
            "type": "github",
            "repo": "adhrushtalakshmir-bit/Shadow-AI-essentials"
        },
        "rootDirectory": "shadow-ai-guard"
    }
    
    # Check if exists
    resp = requests.get(f"https://api.vercel.com/v9/projects/shadow-ai-guard", headers=HEADERS)
    if resp.status_code == 200:
        print("Project already exists.")
        return resp.json()["id"]

    resp = requests.post("https://api.vercel.com/v10/projects", headers=HEADERS, json=payload)
    if resp.status_code in [200, 201]:
        data = resp.json()
        print(f"Created Vercel Project: {data['name']}")
        return data["id"]
    else:
        print(f"Error creating project: {resp.text}")
        return None

def set_env_vars(project_id, backend_url):
    print("Setting Environment Variables...")
    payload = [
        {
            "type": "encrypted",
            "key": "VITE_API_URL",
            "value": backend_url,
            "target": ["production", "preview", "development"]
        }
    ]
    resp = requests.post(f"https://api.vercel.com/v10/projects/{project_id}/env", headers=HEADERS, json=payload)
    if resp.status_code in [200, 201]:
        print("Environment variables set.")
    elif "already exists" in resp.text:
        print("Env var already exists.")
    else:
        print(f"Error setting env var: {resp.text}")

def trigger_deployment(project_id):
    print("Triggering Deployment...")
    payload = {
        "name": "shadow-ai-guard",
        "target": "production",
        "gitSource": {
            "type": "github",
            "repoId": "857500000", # actually repoId isn't just string repo name in v13, let's use a simpler deployment call or just use Vercel CLI
            "ref": "main"
        }
    }
    
    # Actually just POST to /v13/deployments with basic config
    payload2 = {
        "name": "shadow-ai-guard",
        "project": "shadow-ai-guard",
        "target": "production"
    }
    resp = requests.post("https://api.vercel.com/v13/deployments", headers=HEADERS, json=payload2)
    if resp.status_code in [200, 201]:
        data = resp.json()
        print(f"Deployment triggered! URL: https://{data['url']}")
        return data['url']
    else:
        print(f"Error triggering deployment via API: {resp.text}")
        print("We will fallback to CLI")
        import subprocess
        subprocess.run(["vercel", "deploy", "--prod", "--token", VERCEL_TOKEN, "--yes", "--confirm"], shell=True)
        return None

def main():
    project_id = create_project()
    if not project_id:
        return
    
    backend_url = "https://shadow-ai-backend-o5r3.onrender.com"
    
    set_env_vars(project_id, backend_url)
    trigger_deployment(project_id)

if __name__ == '__main__':
    main()
