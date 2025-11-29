#crud.py
from models import Clothes, WearLog, wear_log_item
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload, Session, joinedload
from itertools import combinations
from collections import Counter, defaultdict
from datetime import date, timedelta


# --- Clothes ---
def create_clothes(db: Session, name: str, category: str, subcategory: str = None, seasons: list = None, color: str = None, image_url: str = None):
    c = Clothes(
        name=name, 
        category=category, 
        subcategory=subcategory, 
        seasons=",".join(seasons) if seasons else "", 
        color=color, 
        image_url=image_url
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return c

def get_all_clothes(db: Session):
    return db.query(Clothes).all()

def delete_clothes(db: Session, clothes_id: int):
    item = db.query(Clothes).filter(Clothes.id == clothes_id).first()
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True


# --- WearLog ---
def add_wear_log(db: Session, date_val: date, clothes_ids: list):
    wl = WearLog(date = date_val)
    if clothes_ids:
        clothes_objs = db.query(Clothes).filter(Clothes.id.in_(clothes_ids)).all()
        wl.clothes = clothes_objs
    db.add(wl)
    db.commit()
    db.refresh(wl)
    saved_ids = [c.id for c in wl.clothes]
    return {"id": wl.id, "date": wl.date, "clothes_ids": saved_ids}

def get_wear_logs_with_details(db: Session, start: date, end: date):
    # 날짜 범위 조회 (옷 정보 포함)
    return db.query(WearLog)\
             .options(joinedload(WearLog.clothes))\
             .filter(WearLog.date >= start, WearLog.date <= end)\
             .order_by(WearLog.date.desc())\
             .all()

def delete_wear_log(db: Session, wear_log_id: int):
    log = db.query(WearLog).filter(WearLog.id == wear_log_id).first()
    if not log:
        return False
    db.delete(log)
    db.commit()
    return True


# --- Stats ---
def freq_by_clothes(db: Session, start: date, end: date, limit: int = 100, sort_desc: bool = True):
    j = wear_log_item.join(Clothes, wear_log_item.c.clothes_id == Clothes.id)\
                     .join(WearLog, wear_log_item.c.wear_log_id == WearLog.id)
    stmt = select(
        Clothes.id, 
        Clothes.name, 
        func.count(wear_log_item.c.clothes_id).label("cnt")
    ).select_from(j).where(
        WearLog.date.between(start, end)
    ).group_by(Clothes.id, Clothes.name)
    order = func.count(wear_log_item.c.clothes_id).desc() if sort_desc else func.count(wear_log_item.c.clothes_id).asc()
    stmt = stmt.order_by(order)
    if limit:
        stmt = stmt.limit(limit)
    rows = db.execute(stmt).all()
    return [{"clothes_id": r[0], "name": r[1], "count": r[2]} for r in rows]

def get_period_stats(db: Session, start: date, end: date, period: str):
    logs = db.query(WearLog).filter(WearLog.date >= start, WearLog.date <= end).all()
    buckets = defaultdict(int)
    for wl in logs:
        d = wl.date
        if period == "week":
            key_date = d - timedelta(days=d.weekday()) # 해당 주 월요일
        else: 
            key_date = d.replace(day=1) # 해당 월 1일
        buckets[key_date.isoformat()] += 1
    labels = sorted(buckets.keys())
    values = [buckets[k] for k in labels]
    return {"labels": labels, "values": values}

def sleeping_items(db: Session, threshold: int = 1):
    j = wear_log_item.join(WearLog, wear_log_item.c.wear_log_id == WearLog.id)\
                     .join(Clothes, wear_log_item.c.clothes_id == Clothes.id)
    stmt = select(
        Clothes.id, 
        Clothes.name, 
        func.count(wear_log_item.c.clothes_id).label("cnt")
    ).select_from(j).group_by(Clothes.id, Clothes.name).having(func.count(wear_log_item.c.clothes_id) <= threshold)
    rows = db.execute(stmt).all()
    return [{"clothes_id": r[0], "name": r[1], "count": r[2]} for r in rows]

def pairs_between(db: Session, start: date, end: date, min_count: int = 1, limit: int = 10):
    logs = db.query(WearLog).options(selectinload(WearLog.clothes))\
             .filter(WearLog.date >= start, WearLog.date <= end).all()
    pair_counter = Counter()
    for wl in logs:
        ids = sorted([c.id for c in wl.clothes])
        for a, b in combinations(ids, 2):
            pair_counter[(a,b)] += 1
    common = pair_counter.most_common() # 전체 정렬
    filtered = [x for x in common if x[1] >= min_count][:limit]
    out = []
    for (pair, cnt) in filtered:
        a, b = pair
        a_obj = db.query(Clothes).get(a)
        b_obj = db.query(Clothes).get(b)
        out.append({
            "pair": [a,b],
            "names": [a_obj.name if a_obj else None, b_obj.name if b_obj else None],
            "count": cnt
        })
    return out

def stats_by_category(db: Session, start: date, end: date):
    j = wear_log_item.join(Clothes, wear_log_item.c.clothes_id == Clothes.id)\
                     .join(WearLog, wear_log_item.c.wear_log_id == WearLog.id)
    stmt = select(Clothes.category, func.count(wear_log_item.c.clothes_id).label("cnt"))\
        .select_from(j).where(WearLog.date.between(start, end)).group_by(Clothes.category)
    rows = db.execute(stmt).all()
    return [{"category": r[0], "count": r[1]} for r in rows]

def stats_by_season(db: Session, start: date, end: date):
    j = wear_log_item.join(Clothes, wear_log_item.c.clothes_id == Clothes.id)\
                     .join(WearLog, wear_log_item.c.wear_log_id == WearLog.id)
    stmt = select(Clothes.seasons, func.count(wear_log_item.c.clothes_id).label("cnt"))\
        .select_from(j).where(WearLog.date.between(start, end)).group_by(Clothes.seasons)
    rows = db.execute(stmt).all()
    return [{"label": r[0] or "Unknown", "count": r[1]} for r in rows]

def stats_by_color(db: Session, start: date, end: date):
    j = wear_log_item.join(Clothes, wear_log_item.c.clothes_id == Clothes.id)\
                     .join(WearLog, wear_log_item.c.wear_log_id == WearLog.id)
    stmt = select(Clothes.color, func.count(wear_log_item.c.clothes_id).label("cnt"))\
            .select_from(j).where(WearLog.date.between(start, end))\
            .group_by(Clothes.color).order_by(func.count(wear_log_item.c.clothes_id).desc())
    rows = db.execute(stmt).all()
    return [{"color": r[0] if r[0] else "Unknown", "count": r[1]} for r in rows]


def summary(db: Session, start: date, end: date):
    total_outfits = db.query(WearLog).filter(WearLog.date.between(start, end)).count()
    top_item_list = freq_by_clothes(db, start, end, limit=1)
    top_item = top_item_list[0] if top_item_list else None
    top_cat_list = stats_by_category(db, start, end)
    top_category = max(top_cat_list, key=lambda x: x['count']) if top_cat_list else None
    comment = f"이번 기간엔 '{top_item['name']}'를 가장 자주 입었어요." if top_item else "데이터가 부족해요."
    return {
        "total_outfits": total_outfits,
        "top_item": top_item,
        "top_category": top_category,
        "comment": comment
    }