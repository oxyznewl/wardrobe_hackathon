# crud.py
from models import SessionLocal, Clothes, WearLog, wear_log_item
from sqlalchemy import select, func, and_, join
from itertools import combinations
from collections import Counter
import datetime

def create_clothes(name, category, seasons=None, color=None, image_url=None):
    db = SessionLocal()
    c = Clothes(name=name, category=category, seasons=",".join(seasons) if seasons else "", color=color, image_url=image_url)
    db.add(c)
    db.commit()
    db.refresh(c)
    db.close()
    return c

def add_wear_log(date: datetime.date, clothes_ids: list):
    db = SessionLocal()
    try:
        wl = WearLog(date=date)
        # attach clothes
        for cid in clothes_ids:
            cl = db.get(Clothes, cid)
            if cl:
                wl.clothes.append(cl)
        db.add(wl)
        db.commit()
        db.refresh(wl)
        # collect clothes ids while session is still open
        saved_ids = [c.id for c in wl.clothes]
        saved_date = wl.date
        saved_wl_id = wl.id
    finally:
        db.close()
    # return a plain dict (not an ORM instance)
    return {"id": saved_wl_id, "date": saved_date, "clothes_ids": saved_ids}

def get_wear_logs_between(start_date, end_date):
    db = SessionLocal()
    rows = db.query(WearLog).filter(WearLog.date.between(start_date, end_date)).all()
    db.close()
    # transform
    result = []
    for wl in rows:
        ids = [c.id for c in wl.clothes]
        result.append({"date": wl.date.isoformat(), "clothes_ids": ids})
    return result

def freq_by_clothes(start_date, end_date, limit=100, sort_desc=True):
    db = SessionLocal()
    # join wear_log_item and clothes via SQLAlchemy core style
    j = wear_log_item.join(Clothes, wear_log_item.c.clothes_id == Clothes.id).join(WearLog, wear_log_item.c.wear_log_id == WearLog.id)
    stmt = select(
        Clothes.id, Clothes.name, func.count(wear_log_item.c.clothes_id).label("cnt")
    ).select_from(j).where(
        WearLog.date.between(start_date, end_date)
    ).group_by(Clothes.id, Clothes.name)
    if sort_desc:
        stmt = stmt.order_by(func.count(wear_log_item.c.clothes_id).desc())
    else:
        stmt = stmt.order_by(func.count(wear_log_item.c.clothes_id).asc())
    if limit:
        stmt = stmt.limit(limit)
    rows = db.execute(stmt).all()
    db.close()
    return [{"clothes_id": r[0], "name": r[1], "count": r[2]} for r in rows]

def sleeping_items(threshold=1):
    # find clothes with total count <= threshold across all time
    db = SessionLocal()
    j = wear_log_item.join(WearLog, wear_log_item.c.wear_log_id == WearLog.id).join(Clothes, wear_log_item.c.clothes_id == Clothes.id)
    stmt = select(Clothes.id, Clothes.name, func.count(wear_log_item.c.clothes_id).label("cnt")).select_from(j).group_by(Clothes.id).having(func.count(wear_log_item.c.clothes_id) <= threshold)
    rows = db.execute(stmt).all()
    db.close()
    return [{"clothes_id": r[0], "name": r[1], "count": r[2]} for r in rows]

def pairs_between(start_date, end_date, min_count=1, limit=20):
    logs = get_wear_logs_between(start_date, end_date)
    counter = Counter()
    for wl in logs:
        ids = sorted(set(wl["clothes_ids"]))
        for a,b in combinations(ids, 2):
            counter[(a,b)] += 1
    # filter and build response
    out = []
    for (a,b),c in counter.most_common():
        if c >= min_count:
            out.append({"pair": [a,b], "count": c})
        if len(out) >= limit:
            break
    # resolve names
    db = SessionLocal()
    resp = []
    for item in out:
        a,b = item["pair"]
        ca = db.get(Clothes, a)
        cb = db.get(Clothes, b)
        resp.append({"pair": [a,b], "names": [ca.name if ca else None, cb.name if cb else None], "count": item["count"]})
    db.close()
    return resp

def summary(start_date, end_date):
    db = SessionLocal()
    total_outfits = db.query(WearLog).filter(WearLog.date.between(start_date, end_date)).count()
    top_item = freq_by_clothes(start_date, end_date, limit=1)
    # top category (naive)
    j = wear_log_item.join(Clothes, wear_log_item.c.clothes_id == Clothes.id).join(WearLog, wear_log_item.c.wear_log_id == WearLog.id)
    stmt = select(Clothes.category, func.count(wear_log_item.c.clothes_id).label("cnt")).select_from(j).where(WearLog.date.between(start_date, end_date)).group_by(Clothes.category).order_by(func.count(wear_log_item.c.clothes_id).desc()).limit(1)
    row = db.execute(stmt).first()
    top_category = {"category": row[0], "count": row[1]} if row else None
    db.close()
    comment = ""
    if top_item:
        comment = f"이번 기간엔 '{top_item[0]['name']}'를 가장 자주 입었어요."
    return {
        "total_outfits": total_outfits,
        "top_item": top_item[0] if top_item else None,
        "top_category": top_category,
        "comment": comment
    }
