# main.py
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import date, datetime
from typing import List, Optional
from models import init_db, SessionLocal, Clothes
import crud
from crud import freq_by_clothes
from sqlalchemy.orm import joinedload
from models import WearLog

# ---- Init DB ----
init_db()

# ---- FastAPI app ----
app = FastAPI(title="Wardrobe Stats API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Pydantic models ----
class ClothesIn(BaseModel):
    name: str
    category: str
    seasons: Optional[List[str]] = None
    color: Optional[str] = None
    image_url: Optional[str] = None

class WearLogIn(BaseModel):
    date: date  # yyyy-mm-dd
    clothes_ids: List[int]

class DateRange(BaseModel):
    start_date: date
    end_date: date

# ---- Clothes endpoints ----
@app.post("/api/clothes", tags=["clothes"])
def api_create_clothes(body: ClothesIn):
    c = crud.create_clothes(body.name, body.category, body.seasons, body.color, body.image_url)
    return {"clothes_id": c.id, "name": c.name}

@app.get("/api/clothes", tags=["clothes"])
def api_list_clothes():
    db = SessionLocal()
    rows = db.query(Clothes).all()
    db.close()
    return [
        {"id": r.id, "name": r.name, "category": r.category, "seasons": r.seasons,
         "color": r.color, "image_url": r.image_url} for r in rows
    ]

# ---- WearLog endpoints ----
@app.post("/api/wearlog", tags=["wearlog"])
def api_add_wearlog(body: WearLogIn):
    wl_dict = crud.add_wear_log(body.date, body.clothes_ids)
    return {"id": wl_dict["id"], "date": wl_dict["date"].isoformat(), "clothes_ids": wl_dict["clothes_ids"]}

@app.get("/api/wearlog", tags=["wearlog"])
def api_get_wearlogs(start: date, end: date):
    """
    기간(start, end) 내의 WearLog를 가져오되, Clothes 관계를 미리 로드해서
    DetachedInstanceError를 방지하고 JSON-직렬화 가능한 형태로 반환한다.
    """
    db = SessionLocal()
    try:
        logs = db.query(WearLog)\
                 .options(joinedload(WearLog.clothes))\
                 .filter(WearLog.date >= start, WearLog.date <= end)\
                 .order_by(WearLog.date.desc())\
                 .all()

        out = []
        for wl in logs:
            # wl.date가 date 객체이면 isoformat으로, 문자열이면 그대로
            d = wl.date.isoformat() if hasattr(wl.date, "isoformat") else str(wl.date)
            clothes_list = []
            for c in wl.clothes:
                clothes_list.append({"id": c.id, "name": getattr(c, "name", None)})
            out.append({"id": wl.id, "date": d, "clothes": clothes_list})
        return out
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}")
    finally:
        db.close()

# ---- Stats endpoints ----

# POST version: JSON body with start_date/end_date
@app.post("/api/stats/frequency", tags=["stats"])
def stats_frequency_post(range: DateRange):
    return freq_by_clothes(range.start_date, range.end_date)

# GET version: query params
@app.get("/api/stats/frequency", tags=["stats"])
def stats_frequency_get(start: date, end: date, limit: int = 100, sort_desc: bool = True):
    return freq_by_clothes(start, end, limit, sort_desc)

@app.get("/api/stats/sleeping", tags=["stats"])
def api_sleeping(threshold: int = 1):
    return crud.sleeping_items(threshold)

@app.get("/api/stats/period", tags=["stats"])
def api_period(start: date, end: date, period: str = Query("week", pattern="^(week|month)$")):
    logs = crud.get_wear_logs_between(start, end)
    from collections import defaultdict
    buckets = defaultdict(int)
    for wl in logs:
        d = wl["date"]
        if isinstance(d, str):
            d = datetime.fromisoformat(d).date()
        key = (d - datetime.timedelta(days=d.weekday())).isoformat() if period=="week" else d.replace(day=1).isoformat()
        buckets[key] += 1
    labels = sorted(buckets.keys())
    values = [buckets[k] for k in labels]
    return {"labels": labels, "values": values}

@app.get("/api/stats/pairs", tags=["stats"])
def api_pairs(start: date, end: date, min_count: int = 1, limit: int = 10):
    return crud.pairs_between(start, end, min_count=min_count, limit=limit)

@app.get("/api/stats/summary", tags=["stats"])
def api_summary(start: date, end: date):
    return crud.summary(start, end)

@app.get("/")
def root():
    return {"message": "Hello FastAPI!"}

@app.get("/api/stats/category", tags=["stats"])
def api_stats_category(start: date, end: date):
    return crud.stats_by_category(start, end)

@app.get("/api/stats/color", tags=["stats"])
def api_stats_color(start: date, end: date):
    # crud에 stats_by_color 함수를 추가했다면 호출
    # 로직은 category와 동일
    return crud.stats_by_color(start, end)