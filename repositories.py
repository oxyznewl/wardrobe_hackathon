#repositories.py
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, func
from models import Clothes, WearLog, wear_log_item
from datetime import date


# --- Clothes Queries ---
def create_clothes_item(db: Session, clothes_data: dict):
    c = Clothes(**clothes_data)
    db.add(c)
    db.commit()
    db.refresh(c)
    return c

def get_all_clothes(db: Session):
    return db.query(Clothes).all()

def get_clothes_by_id(db: Session, clothes_id: int):
    return db.query(Clothes).filter(Clothes.id == clothes_id).first()

def get_clothes_list_by_ids(db: Session, clothes_ids: list):
    return db.query(Clothes).filter(Clothes.id.in_(clothes_ids)).all()

def delete_clothes_item(db: Session, item: Clothes):
    db.delete(item)
    db.commit()


# --- WearLog Queries ---
def create_wear_log_entry(db: Session, log_date: date, clothes_objects: list):
    wl = WearLog(date=log_date)
    wl.clothes = clothes_objects
    db.add(wl)
    db.commit()
    db.refresh(wl)
    return wl

def get_logs_in_range(db: Session, start: date, end: date):
    return db.query(WearLog)\
             .options(joinedload(WearLog.clothes))\
             .filter(WearLog.date >= start, WearLog.date <= end)\
             .order_by(WearLog.date.desc())\
             .all()

def get_log_by_id(db: Session, log_id: int):
    return db.query(WearLog).filter(WearLog.id == log_id).first()

def delete_log_entry(db: Session, log: WearLog):
    db.delete(log)
    db.commit()

def get_log_count_in_range(db: Session, start: date, end: date):
    return db.query(WearLog).filter(WearLog.date.between(start, end)).count()


# --- Stats Raw Queries ---
def get_frequency_raw(db: Session, start: date, end: date, limit: int = None, sort_desc: bool = True):
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
    return db.execute(stmt).all()

def get_sleeping_raw(db: Session, threshold: int):
    j = wear_log_item.join(WearLog, wear_log_item.c.wear_log_id == WearLog.id)\
                     .join(Clothes, wear_log_item.c.clothes_id == Clothes.id)
    stmt = select(
        Clothes.id, 
        Clothes.name, 
        func.count(wear_log_item.c.clothes_id).label("cnt")
    ).select_from(j).group_by(Clothes.id, Clothes.name).having(func.count(wear_log_item.c.clothes_id) <= threshold)
    return db.execute(stmt).all()

def get_category_stats_raw(db: Session, start: date, end: date):
    j = wear_log_item.join(Clothes, wear_log_item.c.clothes_id == Clothes.id)\
                     .join(WearLog, wear_log_item.c.wear_log_id == WearLog.id)
    stmt = select(Clothes.category, func.count(wear_log_item.c.clothes_id).label("cnt"))\
        .select_from(j).where(WearLog.date.between(start, end)).group_by(Clothes.category)
    return db.execute(stmt).all()

def get_season_stats_raw(db: Session, start: date, end: date):
    j = wear_log_item.join(Clothes, wear_log_item.c.clothes_id == Clothes.id)\
                     .join(WearLog, wear_log_item.c.wear_log_id == WearLog.id)
    stmt = select(Clothes.seasons, func.count(wear_log_item.c.clothes_id).label("cnt"))\
        .select_from(j).where(WearLog.date.between(start, end)).group_by(Clothes.seasons)
    return db.execute(stmt).all()

def get_color_stats_raw(db: Session, start: date, end: date):
    j = wear_log_item.join(Clothes, wear_log_item.c.clothes_id == Clothes.id)\
                     .join(WearLog, wear_log_item.c.wear_log_id == WearLog.id)
    stmt = select(Clothes.color, func.count(wear_log_item.c.clothes_id).label("cnt"))\
            .select_from(j).where(WearLog.date.between(start, end))\
            .group_by(Clothes.color).order_by(func.count(wear_log_item.c.clothes_id).desc())
    return db.execute(stmt).all()