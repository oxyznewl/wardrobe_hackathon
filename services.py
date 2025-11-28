#services.py
from sqlalchemy.orm import Session
from datetime import date, timedelta
from collections import defaultdict, Counter
from itertools import combinations
import repositories
from schemas import ClothesIn


# --- Clothes Services ---
def create_clothes(db: Session, data: ClothesIn):
    # 리스트로 들어온 계절 정보를 DB에 맞게 문자열로 변환
    db_data = data.dict()
    if data.seasons:
        db_data["seasons"] = ",".join(data.seasons)
    else:
        db_data["seasons"] = ""
    
    return repositories.create_clothes_item(db, db_data)

def get_all_clothes(db: Session):
    rows = repositories.get_all_clothes(db)
    # 필요한 경우 여기서 추가 가공
    return rows

def delete_clothes(db: Session, clothes_id: int) -> bool:
    item = repositories.get_clothes_by_id(db, clothes_id)
    if not item:
        return False
    repositories.delete_clothes_item(db, item)
    return True

# --- WearLog Services ---
def add_wear_log(db: Session, date_val: date, clothes_ids: list):
    clothes_objs = []
    if clothes_ids:
        clothes_objs = repositories.get_clothes_list_by_ids(db, clothes_ids)
    wl = repositories.create_wear_log_entry(db, date_val, clothes_objs)
    return {
        "id": wl.id, 
        "date": wl.date, 
        "clothes_ids": [c.id for c in wl.clothes]
    }

def get_wear_logs(db: Session, start: date, end: date):
    logs = repositories.get_logs_in_range(db, start, end)
    return [
        {
            "id": wl.id, 
            "date": wl.date.isoformat(), 
            "clothes": [{"id": c.id, "name": c.name} for c in wl.clothes]
        } for wl in logs
    ]

def delete_wear_log(db: Session, log_id: int) -> bool:
    log = repositories.get_log_by_id(db, log_id)
    if not log:
        return False
    repositories.delete_log_entry(db, log)
    return True


# --- Stats Services ---
def get_frequency(db: Session, start: date, end: date, limit: int = 100, sort_desc: bool = True):
    rows = repositories.get_frequency_raw(db, start, end, limit, sort_desc)
    return [{"clothes_id": r[0], "name": r[1], "count": r[2]} for r in rows]

def get_sleeping_items(db: Session, threshold: int):
    rows = repositories.get_sleeping_raw(db, threshold)
    return [{"clothes_id": r[0], "name": r[1], "count": r[2]} for r in rows]

def get_period_stats(db: Session, start: date, end: date, period: str):
    logs = repositories.get_logs_in_range(db, start, end)
    buckets = defaultdict(int)
    for wl in logs:
        d = wl.date
        if period == "week":
            key_date = d - timedelta(days=d.weekday())
        else:
            key_date = d.replace(day=1)
        buckets[key_date.isoformat()] += 1
    labels = sorted(buckets.keys())
    values = [buckets[k] for k in labels]
    return {"labels": labels, "values": values}

def get_pairs_stats(db: Session, start: date, end: date, min_count: int, limit: int):
    logs = repositories.get_logs_in_range(db, start, end)
    pair_counter = Counter()
    for wl in logs:
        ids = sorted([c.id for c in wl.clothes])
        for a, b in combinations(ids, 2):
            pair_counter[(a,b)] += 1
    common = pair_counter.most_common()
    filtered = [x for x in common if x[1] >= min_count][:limit]
    out = []
    for (pair, cnt) in filtered:
        a, b = pair
        a_obj = repositories.get_clothes_by_id(db, a)
        b_obj = repositories.get_clothes_by_id(db, b)
        out.append({
            "pair": [a,b],
            "names": [a_obj.name if a_obj else None, b_obj.name if b_obj else None],
            "count": cnt
        })
    return out

def get_category_stats(db: Session, start: date, end: date):
    rows = repositories.get_category_stats_raw(db, start, end)
    return [{"category": r[0], "count": r[1]} for r in rows]

def get_season_stats(db: Session, start: date, end: date):
    rows = repositories.get_season_stats_raw(db, start, end)
    return [{"label": r[0] or "Unknown", "count": r[1]} for r in rows]

def get_color_stats(db: Session, start: date, end: date):
    rows = repositories.get_color_stats_raw(db, start, end)
    return [{"color": r[0] if r[0] else "Unknown", "count": r[1]} for r in rows]

def get_summary(db: Session, start: date, end: date):
    total_outfits = repositories.get_log_count_in_range(db, start, end)
    
    # 가장 많이 입은 옷
    top_item_list = get_frequency(db, start, end, limit=1)
    top_item = top_item_list[0] if top_item_list else None
    
    # 가장 많이 입은 카테고리
    top_cat_list = get_category_stats(db, start, end)
    top_category = max(top_cat_list, key=lambda x: x['count']) if top_cat_list else None
    
    comment = f"이번 기간엔 '{top_item['name']}'를 가장 자주 입었어요." if top_item else "데이터가 부족해요."
    
    return {
        "total_outfits": total_outfits,
        "top_item": top_item,
        "top_category": top_category,
        "comment": comment
    }
