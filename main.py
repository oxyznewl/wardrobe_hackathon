# main.py
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
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


@app.get("/api/wearlog", tags=["wearlog"])
def api_get_wearlogs(start: str, end: str):
    s = datetime.date.fromisoformat(start)
    e = datetime.date.fromisoformat(end)
    return crud.get_wear_logs_between(s, e)

# Stats endpoints (B's responsibility)
@app.get("/api/stats/frequency", tags=["stats"])
def api_frequency(start: str, end: str, sort: str = Query("desc", regex="^(asc|desc)$"), limit: int = 50):
    s = datetime.date.fromisoformat(start)
    e = datetime.date.fromisoformat(end)
    return crud.freq_by_clothes(s, e, limit=limit, sort_desc=(sort=="desc"))

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

@app.get("/api/stats/pairs", tags=["stats"])
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