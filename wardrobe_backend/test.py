# test.py
import requests
from datetime import date

BASE = "http://127.0.0.1:8000"

def pretty_print(title, resp):
    print("=== ", title, " ===")
    print("status:", resp.status_code)
    try:
        print(resp.json())
    except Exception as e:
        print("raw:", resp.text)
    print()

# 0) 기본 헬로 체크
r = requests.get(f"{BASE}/")
pretty_print("root", r)

# 1) GET clothes
r = requests.get(f"{BASE}/api/clothes")
pretty_print("GET /api/clothes", r)

# 2) POST clothes (새 항목 추가)
payload = {
    "name": "테스트 티셔츠",
    "category": "top",
    "seasons": ["spring", "summer"],
    "color": "black",
    "image_url": None
}
r = requests.post(f"{BASE}/api/clothes", json=payload)
pretty_print("POST /api/clothes", r)

# 3) GET clothes (한 번 더 확인)
r = requests.get(f"{BASE}/api/clothes")
pretty_print("GET /api/clothes (after post)", r)

# 4) POST wearlog (오늘 날짜로 기록)
today = date.today().isoformat()
# 예: clothes 아이디가 1,2라고 가정 (위 GET에서 id 확인)
r_clothes = requests.get(f"{BASE}/api/clothes")
cl_list = r_clothes.json()
ids = [c["id"] for c in cl_list][:2]  # 있으면 처음 2개 사용
if not ids:
    print("No clothes found — 먼저 /api/clothes로 아이템을 추가하세요.")
else:
    payload = {"date": today, "clothes_ids": ids}
    r = requests.post(f"{BASE}/api/wearlog", json=payload)
    pretty_print("POST /api/wearlog", r)

    # 5) GET wearlog (기간 전체)
    r = requests.get(f"{BASE}/api/wearlog", params={"start":"2025-01-01", "end":"2026-12-31"})
    pretty_print("GET /api/wearlog", r)

# 6) STATS: frequency (POST body)
body = {"start_date":"2025-01-01","end_date":"2026-12-31"}
r = requests.post(f"{BASE}/api/stats/frequency", json=body)
pretty_print("POST /api/stats/frequency", r)

# 7) STATS: sleeping
r = requests.get(f"{BASE}/api/stats/sleeping", params={"threshold":1})
pretty_print("GET /api/stats/sleeping", r)

# 8) STATS: pairs
r = requests.get(f"{BASE}/api/stats/pairs", params={"start":"2025-01-01","end":"2026-12-31","min_count":1,"limit":5})
pretty_print("GET /api/stats/pairs", r)

# 9) STATS: summary
r = requests.get(f"{BASE}/api/stats/summary", params={"start":"2025-01-01","end":"2026-12-31"})
pretty_print("GET /api/stats/summary", r)
