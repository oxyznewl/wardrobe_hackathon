# test_endpoints.py
import requests
BASE = "http://127.0.0.1:8000"

def test_list_clothes():
    r = requests.get(BASE + "/api/clothes")
    print("clothes:", r.status_code, r.json())

def test_freq():
    r = requests.get(BASE + "/api/stats/frequency", params={"start":"2025-01-01","end":"2026-12-31"})
    print("freq:", r.status_code, r.json())

if __name__ == "__main__":
    test_list_clothes()
    test_freq()
