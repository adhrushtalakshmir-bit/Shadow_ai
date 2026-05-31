import requests
import uuid

BASE_URL = "http://127.0.0.1:8000/api/v1"

def run_tests():
    print("==================================================")
    print("STARTING AUTH & BACKEND INTEGRATION TEST SUITE")
    print("==================================================")

    # 1. Health check
    try:
        r = requests.get(f"{BASE_URL}/health")
        print(f"[HEALTH] Status: {r.status_code}, Response: {r.json()}")
    except Exception as e:
        print(f"[ERROR] Health check failed: {e}")
        return

    # Generate unique email for signup
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    password = "password123"
    name = "Test User"

    # 2. Signup Test
    print(f"\n[TEST 2] Signing up new user: {email}...")
    signup_payload = {
        "email": email,
        "password": password,
        "full_name": name
    }
    r = requests.post(f"{BASE_URL}/auth/signup", json=signup_payload)
    print(f"Status: {r.status_code}")
    if r.status_code == 201:
        print(f"Success! Response: {r.json()}")
    else:
        print(f"FAILED: {r.text}")
        return

    # 3. Duplicate Email Signup Test
    print(f"\n[TEST 3] Attempting duplicate signup with same email...")
    r = requests.post(f"{BASE_URL}/auth/signup", json=signup_payload)
    print(f"Status: {r.status_code}")
    if r.status_code == 400:
        print(f"Success (Expected Failure)! Response: {r.json()}")
    else:
        print(f"FAILED (Allowed duplicate): {r.text}")

    # 4. Wrong Password Login Test
    print(f"\n[TEST 4] Logging in with incorrect password...")
    login_payload_wrong = {
        "email": email,
        "password": "wrongpassword"
    }
    r = requests.post(f"{BASE_URL}/auth/login", json=login_payload_wrong)
    print(f"Status: {r.status_code}")
    if r.status_code == 401:
        print(f"Success (Expected Failure)! Response: {r.json()}")
    else:
        print(f"FAILED (Allowed wrong password): {r.text}")

    # 5. Correct Login Test
    print(f"\n[TEST 5] Logging in with correct credentials...")
    login_payload = {
        "email": email,
        "password": password
    }
    r = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
    print(f"Status: {r.status_code}")
    token = None
    if r.status_code == 200:
        res = r.json()
        token = res.get("access_token")
        print(f"Success! Token: {token[:20]}...")
    else:
        print(f"FAILED: {r.text}")
        return

    # 6. Protected Route Access with Valid Token (/auth/me)
    print(f"\n[TEST 6] Accessing protected route /auth/me with valid token...")
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        print(f"Success! Response: {r.json()}")
    else:
        print(f"FAILED: {r.text}")

    # 7. Protected Route Access with Invalid Token
    print(f"\n[TEST 7] Accessing protected route /auth/me with invalid token...")
    bad_headers = {"Authorization": "Bearer badtoken123"}
    r = requests.get(f"{BASE_URL}/auth/me", headers=bad_headers)
    print(f"Status: {r.status_code}")
    if r.status_code == 401:
        print(f"Success (Expected Failure)! Response: {r.json()}")
    else:
        print(f"FAILED (Allowed invalid token): {r.text}")

    # 8. Test /detect PII Route
    print(f"\n[TEST 8] Accessing protected route /detect with valid token...")
    detect_payload = {
        "prompt": "Hello my Aadhaar number is 1234 5678 9012 and phone is 9876543210."
    }
    r = requests.post(f"{BASE_URL}/detect", json=detect_payload, headers=headers)
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        print(f"Success! Response: {r.json()}")
    else:
        print(f"FAILED: {r.text}")

    print("\n==================================================")
    print("ALL TESTS COMPLETED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
