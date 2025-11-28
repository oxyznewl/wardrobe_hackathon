# main.py
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from pydantic import BaseModel
import datetime
from models import init_db, SessionLocal, Clothes, WearLog, engine
import crud
from typing import List, Optional

from fastapi import APIRouter
from crud import freq_by_clothes

router = APIRouter()

@router.get("/api/stats/frequency")
def api_stats_frequency(start: str, end: str, limit: int = 100, sort_desc: bool = True):
    return freq_by_clothes(start, end, limit, sort_desc)

class ClothesIn(BaseModel):
    name: str
    category: str
    seasons: Optional[List[str]] = None
    color: Optional[str] = None
    image_url: Optional[str] = None

class WearLogIn(BaseModel):
    date: str  # yyyy-mm-dd
    clothes_ids: List[int]


# init DB
init_db()

app = FastAPI(title="Wardrobe Stats API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://127.0.0.1:3000"],  # front dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ClothesIn(BaseModel):
    name: str
    category: str
    seasons: list[str] | None = None
    color: str | None = None
    image_url: str | None = None

class WearLogIn(BaseModel):
    date: str  # yyyy-mm-dd
    clothes_ids: list[int]

@app.post("/api/clothes", tags=["clothes"])
def api_create_clothes(body: ClothesIn):
    c = crud.create_clothes(body.name, body.category, body.seasons, body.color, body.image_url)
    return {"clothes_id": c.id, "name": c.name}

@app.get("/api/clothes", tags=["clothes"])
def api_list_clothes():
    db = SessionLocal()
    rows = db.query(Clothes).all()
    db.close()
    return [{"id": r.id, "name": r.name, "category": r.category, "seasons": r.seasons, "color": r.color, "image_url": r.image_url} for r in rows]

@app.post("/api/wearlog", tags=["wearlog"])
def api_add_wearlog(body: WearLogIn):
    try:
        d = datetime.date.fromisoformat(body.date)
    except:
        raise HTTPException(status_code=400, detail="Invalid date format")
    wl_dict = crud.add_wear_log(d, body.clothes_ids)
    # wl_dict already contains id, date (date obj) and clothes_ids
    return {"id": wl_dict["id"], "date": wl_dict["date"].isoformat(), "clothes_ids": wl_dict["clothes_ids"]}

@app.get("/api/wearlog/day", tags=["wearlog"])
def api_wearlog_by_day(day: str = Query(..., description="YYYY-MM-DD")):
    try:
        d = datetime.date.fromisoformat(day)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid date format, use YYYY-MM-DD")
    logs = crud.get_wear_logs_between(d, d)
    return [{"date": wl["date"], "clothes_ids": wl["clothes_ids"]} for wl in logs]

@app.get("/api/wearlog", tags=["wearlog"])
def api_get_wearlogs(start: str, end: str):
    s = datetime.date.fromisoformat(start)
    e = datetime.date.fromisoformat(end)
    return crud.get_wear_logs_between(s, e)

# Stats endpoints (B's responsibility)
@app.get("/api/stats/pairs", tags=["stats"])
def api_pairs(start: str, end: str, min_count: int = 1, limit: int = 10):
    try:
        s = datetime.date.fromisoformat(start)
        e = datetime.date.fromisoformat(end)
        return crud.pairs_between(s, e, min_count=min_count, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}")

@app.get("/api/stats/sleeping", tags=["stats"])
def api_sleeping(threshold: int = 1):
    return crud.sleeping_items(threshold)

@app.get("/api/stats/period", tags=["stats"])
def api_period(start: str, end: str, period: str = Query("week", regex="^(week|month)$")):
    # returns labels/values aggregated counts per period
    s = datetime.date.fromisoformat(start)
    e = datetime.date.fromisoformat(end)
    # naive implementation: produce per-week counts
    logs = crud.get_wear_logs_between(s,e)
    from collections import defaultdict
    import datetime as dt
    buckets = defaultdict(int)
    for wl in logs:
        d = datetime.date.fromisoformat(wl["date"])
        if period == "week":
            # week start date (iso)
            wk = d - datetime.timedelta(days=d.weekday())
            key = wk.isoformat()
        else:
            key = d.replace(day=1).isoformat()
        buckets[key] += 1
    labels = sorted(buckets.keys())
    values = [buckets[k] for k in labels]
    return {"labels": labels, "values": values}

@app.get("/api/stats/pairs", tags=["stats"], operation_id="api_stats_pairs_get")
def api_pairs(start: str, end: str, min_count: int = 1, limit: int = 10):
    s = datetime.date.fromisoformat(start)
    e = datetime.date.fromisoformat(end)
    return crud.pairs_between(s, e, min_count=min_count, limit=limit)

@app.get("/api/stats/summary", tags=["stats"])
def api_summary(start: str, end: str):
    s = datetime.date.fromisoformat(start)
    e = datetime.date.fromisoformat(end)
    return crud.summary(s,e)

@app.get("/")
def root():
    return {"message": "Hello FastAPI!"}

@app.get("/_routes")
def _list_routes():
    return [{"path": r.path, "name": getattr(r, "name", None), "methods": list(getattr(r, "methods", []))} for r in app.routes]

if __name__ == "__main__":
    import importlib, sys, os
    sys.path.insert(0, os.getcwd())
    try:
        m = importlib.import_module("main")
        app = getattr(m, "app", None)
        print("main module imported OK; app:", bool(app))
        if app:
            print("ROUTES:")
            for r in app.routes:
                print(" ", r.path)
    except Exception as e:
        print("IMPORT ERROR:", type(e).__name__, e)

