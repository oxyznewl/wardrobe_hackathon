# main.py 
from database import SessionLocal, engine, Base
import schemas
import services

from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import date

# DB 테이블 생성
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Wardrobe Stats API")

app.add_middleware(
    #프론트엔드의 주소 통신 허용
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    #함수들이 실행될 때마다 DB를 열고 닫음
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- Clothes ---
@app.post("/api/clothes", tags=["clothes"])
def create_clothes_endpoint(body: schemas.ClothesIn, db: Session = Depends(get_db)):
    # Service에게 업무 위임
    c = services.create_clothes(db, body)
    return {"clothes_id": c.id, "name": c.name}

@app.get("/api/clothes", tags=["clothes"])
def list_clothes_endpoint(db: Session = Depends(get_db)):
    return services.get_all_clothes(db)

@app.delete("/api/clothes/{clothes_id}", tags=["clothes"])
def delete_clothes_endpoint(clothes_id: int, db: Session = Depends(get_db)):
    success = services.delete_clothes(db, clothes_id)
    if not success:
        raise HTTPException(status_code=404, detail="해당 옷의 정보가 없습니다!")
    return {"status": "deleted", "id": clothes_id}


# --- WearLog ---
@app.post("/api/wearlog", tags=["wearlog"])
def add_wearlog_endpoint(body: schemas.WearLogIn, db: Session = Depends(get_db)):
    return services.add_wear_log(db, body.date, body.clothes_ids)

@app.get("/api/wearlog", tags=["wearlog"])
def get_wearlogs_endpoint(start: date, end: date, db: Session = Depends(get_db)):
    return services.get_wear_logs(db, start, end)

@app.delete("/api/wearlog/{wear_log_id}", tags=["wearlog"])
def delete_wearlog_endpoint(wear_log_id: int, db: Session = Depends(get_db)):
    success = services.delete_wear_log(db, wear_log_id)
    if not success:
        raise HTTPException(status_code=404, detail="옷 기록이 없습니다!")
    return {"status": "deleted", "id": wear_log_id}


# --- Stats Endpoints ---
@app.post("/api/stats/frequency", tags=["stats"])
def stats_frequency_post(range: schemas.DateRange, db: Session = Depends(get_db)):
    return services.get_frequency(db, range.start_date, range.end_date)

@app.get("/api/stats/frequency", tags=["stats"])
def stats_frequency_get(start: date, end: date, limit: int = 100, sort_desc: bool = True, db: Session = Depends(get_db)):
    return services.get_frequency(db, start, end, limit, sort_desc)

@app.get("/api/stats/period", tags=["stats"])
def stats_period(start: date, end: date, period: str = Query("week", pattern="^(week|month)$"), db: Session = Depends(get_db)):
    return services.get_period_stats(db, start, end, period)

@app.get("/api/stats/sleeping", tags=["stats"])
def stats_sleeping(threshold: int = 1, db: Session = Depends(get_db)):
    return services.get_sleeping_items(db, threshold)

@app.get("/api/stats/pairs", tags=["stats"])
def stats_pairs(start: date, end: date, min_count: int = 1, limit: int = 10, db: Session = Depends(get_db)):
    return services.get_pairs_stats(db, start, end, min_count, limit)

@app.get("/api/stats/category", tags=["stats"])
def stats_category(start: date, end: date, db: Session = Depends(get_db)):
    return services.get_category_stats(db, start, end)

@app.get("/api/stats/color", tags=["stats"])
def stats_color(start: date, end: date, db: Session = Depends(get_db)):
    return services.get_color_stats(db, start, end)

@app.get("/api/stats/season", tags=["stats"])
def stats_season(start: date, end: date, db: Session = Depends(get_db)):
    return services.get_season_stats(db, start, end)

@app.get("/api/stats/summary", tags=["stats"])
def stats_summary(start: date, end: date, db: Session = Depends(get_db)):
    return services.get_summary(db, start, end)


# --- 루트 경로 ---
@app.get("/")
def root():
    return {"message": "Hello Wardrobe API! System is running!"}