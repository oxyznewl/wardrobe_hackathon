# main.py
from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime, timedelta # timedelta 추가

# DB 관련 임포트
from sqlalchemy.orm import joinedload, Session
from database import SessionLocal, engine, Base 
import models 
from models import Clothes, WearLog # models.py에서 정의한 클래스 사용
import crud
from crud import freq_by_clothes

# ---- DB 테이블 생성 ----
# models.py의 내용을 바탕으로 테이블이 없으면 자동 생성
Base.metadata.create_all(bind=engine)

# ---- FastAPI app ----
app = FastAPI(title="Wardrobe Stats API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- DB 세션 의존성 (Dependency) ----
# 함수들이 실행될 때마다 DB를 열고 닫아주는 역할
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---- Pydantic models (데이터 검증용) ----
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

# ---------------------------------------------------------
# [주의] 여기에 있던 class Clothes, class WearLog 정의는 삭제했습니다.
# models.py에 있는 것을 사용해야 충돌이 나지 않습니다.
# ---------------------------------------------------------

# ---- Clothes endpoints ----
@app.post("/api/clothes", tags=["clothes"])
def api_create_clothes(body: ClothesIn):
    # crud 함수들이 업데이트 되었는지 확인 필요
    c = crud.create_clothes(body.name, body.category, body.seasons, body.color, body.image_url)
    return {"clothes_id": c.id, "name": c.name}

@app.get("/api/clothes", tags=["clothes"])
def api_list_clothes(db: Session = Depends(get_db)):
    # Depends(get_db)를 사용하면 코드가 더 안전하고 깔끔해집니다.
    rows = db.query(Clothes).all()
    return [
        {"id": r.id, "name": r.name, "category": r.category, "seasons": r.seasons,
         "color": r.color, "image_url": r.image_url} for r in rows
    ]

# ---- WearLog endpoints ----
@app.post("/api/wearlog", tags=["wearlog"])
def api_add_wearlog(body: WearLogIn):
    # crud쪽 로직이 models.py의 관계(relationship)를 잘 쓰도록 되어있는지 확인이 필요합니다.
    wl_dict = crud.add_wear_log(body.date, body.clothes_ids)
    return wl_dict

@app.get("/api/wearlog", tags=["wearlog"])
def api_get_wearlogs(start: date, end: date, db: Session = Depends(get_db)):
    try:
        # DB에서 날짜 범위로 조회
        logs = db.query(WearLog)\
                 .options(joinedload(WearLog.clothes))\
                 .filter(WearLog.date >= start, WearLog.date <= end)\
                 .order_by(WearLog.date.desc())\
                 .all()

        out = []
        for wl in logs:
            # 날짜 변환
            d = wl.date.isoformat() if hasattr(wl.date, "isoformat") else str(wl.date)
            
            # models.py의 relationship을 통해 옷 목록 가져오기
            clothes_list = []
            for c in wl.clothes:
                clothes_list.append({"id": c.id, "name": getattr(c, "name", None)})
            
            out.append({"id": wl.id, "date": d, "clothes": clothes_list})
        return out
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}")

# ---- Stats endpoints ----

@app.post("/api/stats/frequency", tags=["stats"])
def stats_frequency_post(range: DateRange):
    return freq_by_clothes(range.start_date, range.end_date)

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
            
        # timedelta 사용법 수정됨
        key = (d - timedelta(days=d.weekday())).isoformat() if period=="week" else d.replace(day=1).isoformat()
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

@app.get("/api/stats/category", tags=["stats"])
def api_stats_category(start: date, end: date):
    return crud.stats_by_category(start, end)

@app.get("/api/stats/color", tags=["stats"])
def api_stats_color(start: date, end: date):
    return crud.stats_by_color(start, end)

# ---- 추가된 기능들 (중복 가능성 있음, 확인 필요) ----

@app.post("/log/")
def log_outfit(date: str, ids: list[int], db: Session = Depends(get_db)):
    # 위의 /api/wearlog 와 기능이 겹칩니다. 나중에 하나로 통일하는 게 좋습니다.
    return crud.create_wear_log(db, date, ids)

@app.get("/stats/frequency_v2") # 경로 충돌 방지를 위해 v2로 임시 변경
def get_frequency_stats(db: Session = Depends(get_db)):
    return crud.get_most_worn_clothes(db)

@app.get("/stats/combination")
def get_combination_stats(db: Session = Depends(get_db)):
    return crud.get_best_combinations(db)

@app.get("/")
def root():
    return {"message": "Hello FastAPI!"}