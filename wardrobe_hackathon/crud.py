from models import Clothes, WearLog, wear_log_item
from database import SessionLocal
from sqlalchemy import select, func, and_, desc
from sqlalchemy.orm import selectinload, Session
from itertools import combinations
from collections import Counter
import datetime
from datetime import date

def create_clothes(name, category, seasons=None, color=None, image_url=None):
    db = SessionLocal()
    try:
        c = Clothes(
            name=name, 
            category=category, 
            seasons=",".join(seasons) if seasons else "", 
            color=color, 
            image_url=image_url
        )
        db.add(c)
        db.commit()
        db.refresh(c)
        return c
    finally:
        db.close()

# -----------------------------------------------------------
# [기본] WearLog 관련 CRUD (직접 세션 생성 방식)
# -----------------------------------------------------------

def add_wear_log(date_val: datetime.date, clothes_ids: list):
    """
    JSON 방식이 아닌, models.py의 relationship을 이용해 저장합니다.
    """
    db = SessionLocal()
    try:
        wl = WearLog(date=date_val)
        
        # ID 리스트에 해당하는 옷 객체들을 가져와서 관계 설정
        if clothes_ids:
            clothes_objs = db.query(Clothes).filter(Clothes.id.in_(clothes_ids)).all()
            wl.clothes = clothes_objs
            
        db.add(wl)
        db.commit()
        db.refresh(wl)
        
        # 세션 닫기 전에 필요한 정보 추출
        saved_ids = [c.id for c in wl.clothes]
        saved_date = wl.date
        saved_wl_id = wl.id
        
        return {"id": saved_wl_id, "date": saved_date, "clothes_ids": saved_ids}
    finally:
        db.close()

def get_wear_logs_between(start_date, end_date):
    db = SessionLocal()
    try:
        rows = db.query(WearLog)\
                 .options(selectinload(WearLog.clothes))\
                 .filter(WearLog.date.between(start_date, end_date))\
                 .all()
        
        result = []
        for wl in rows:
            ids = [c.id for c in wl.clothes]
            result.append({"date": wl.date.isoformat(), "clothes_ids": ids})
        return result
    finally:
        db.close()

# -----------------------------------------------------------
# [통계] Stats 관련 함수들
# -----------------------------------------------------------

def freq_by_clothes(start_date, end_date, limit=100, sort_desc=True):
    db = SessionLocal()
    try:
        # join: wear_log_item -> clothes -> wear_log
        j = wear_log_item.join(Clothes, wear_log_item.c.clothes_id == Clothes.id)\
                         .join(WearLog, wear_log_item.c.wear_log_id == WearLog.id)
        
        stmt = select(
            Clothes.id, 
            Clothes.name, 
            func.count(wear_log_item.c.clothes_id).label("cnt")
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
        return [{"clothes_id": r[0], "name": r[1], "count": r[2]} for r in rows]
    finally:
        db.close()

def sleeping_items(threshold=1):
    # 전체 기간 동안 threshold 이하로 입은 옷 찾기
    db = SessionLocal()
    try:
        # LEFT JOIN을 써야 한 번도 안 입은 옷(count=0)도 찾을 수 있음 (여기선 단순화를 위해 inner join 유지하되 로직 보완 가능)
        # 현재 로직: 한 번이라도 입힌 옷 중에서 count가 낮은 것
        j = wear_log_item.join(WearLog, wear_log_item.c.wear_log_id == WearLog.id)\
                         .join(Clothes, wear_log_item.c.clothes_id == Clothes.id)
                         
        stmt = select(
            Clothes.id, 
            Clothes.name, 
            func.count(wear_log_item.c.clothes_id).label("cnt")
        ).select_from(j).group_by(Clothes.id, Clothes.name).having(func.count(wear_log_item.c.clothes_id) <= threshold)
        
        rows = db.execute(stmt).all()
        return [{"clothes_id": r[0], "name": r[1], "count": r[2]} for r in rows]
    finally:
        db.close()

def pairs_between(start: date, end: date, min_count:int=1, limit:int=10):
    db = SessionLocal()
    try:
        logs = db.query(WearLog).options(selectinload(WearLog.clothes))\
                 .filter(WearLog.date >= start, WearLog.date <= end).all()

        pair_counter = Counter()
        for wl in logs:
            ids = sorted([c.id for c in wl.clothes])
            for a, b in combinations(ids, 2):
                pair_counter[(a,b)] += 1

        common = [(pair, cnt) for pair,cnt in pair_counter.items() if cnt >= min_count]
        common.sort(key=lambda x: x[1], reverse=True)

        out = []
        for (a,b), cnt in common[:limit]:
            a_obj = db.query(Clothes).get(a)
            b_obj = db.query(Clothes).get(b)
            out.append({
                "pair": [a,b],
                "names": [a_obj.name if a_obj else None, b_obj.name if b_obj else None],
                "count": cnt
            })
        return out
    finally:
        db.close()

# -----------------------------------------------------------
# [추가] Main.py에서 호출하는데 없었던 함수들 구현
# -----------------------------------------------------------

def stats_by_category(start_date, end_date):
    db = SessionLocal()
    try:
        j = wear_log_item.join(Clothes, wear_log_item.c.clothes_id == Clothes.id)\
                         .join(WearLog, wear_log_item.c.wear_log_id == WearLog.id)
                         
        stmt = select(Clothes.category, func.count(wear_log_item.c.clothes_id).label("cnt"))\
               .select_from(j)\
               .where(WearLog.date.between(start_date, end_date))\
               .group_by(Clothes.category)\
               .order_by(func.count(wear_log_item.c.clothes_id).desc())
               
        rows = db.execute(stmt).all()
        return [{"category": r[0], "count": r[1]} for r in rows]
    finally:
        db.close()

def stats_by_color(start_date, end_date):
    db = SessionLocal()
    try:
        j = wear_log_item.join(Clothes, wear_log_item.c.clothes_id == Clothes.id)\
                         .join(WearLog, wear_log_item.c.wear_log_id == WearLog.id)
                         
        stmt = select(Clothes.color, func.count(wear_log_item.c.clothes_id).label("cnt"))\
               .select_from(j)\
               .where(WearLog.date.between(start_date, end_date))\
               .group_by(Clothes.color)\
               .order_by(func.count(wear_log_item.c.clothes_id).desc())
               
        rows = db.execute(stmt).all()
        # Color가 None인 경우 "Unknown" 등으로 처리 가능
        return [{"color": r[0] if r[0] else "Unknown", "count": r[1]} for r in rows]
    finally:
        db.close()

def summary(start_date, end_date):
    db = SessionLocal()
    try:
        total_outfits = db.query(WearLog).filter(WearLog.date.between(start_date, end_date)).count()
        
        # 가장 많이 입은 옷
        top_item_list = freq_by_clothes(start_date, end_date, limit=1)
        top_item = top_item_list[0] if top_item_list else None
        
        # 가장 많이 입은 카테고리
        top_cat_list = stats_by_category(start_date, end_date)
        top_category = top_cat_list[0] if top_cat_list else None
        
        comment = ""
        if top_item:
            comment = f"이번 기간엔 '{top_item['name']}'를 가장 자주 입었어요."
            
        return {
            "total_outfits": total_outfits,
            "top_item": top_item,
            "top_category": top_category,
            "comment": comment
        }
    finally:
        db.close()

# -----------------------------------------------------------
# [호환성] Main.py 하단부(Depends(get_db) 사용)를 위한 함수들
# JSON 방식 제거 -> ORM 방식으로 변경
# -----------------------------------------------------------

def create_wear_log(db: Session, date_val: str, clothes_id_list: list):
    # main.py에서 DB 세션을 받아서 처리하는 버전
    wl = WearLog(date=datetime.datetime.strptime(date_val, "%Y-%m-%d").date() if isinstance(date_val, str) else date_val)
    
    if clothes_id_list:
        clothes_objs = db.query(Clothes).filter(Clothes.id.in_(clothes_id_list)).all()
        wl.clothes = clothes_objs
        
    db.add(wl)
    db.commit()
    db.refresh(wl)
    return wl

def get_most_worn_clothes(db: Session):
    # main.py 호환용 (전체 기간)
    # 로직은 freq_by_clothes와 동일하지만, DB 세션을 인자로 받음
    j = wear_log_item.join(Clothes, wear_log_item.c.clothes_id == Clothes.id)
    stmt = select(Clothes.name, func.count(wear_log_item.c.clothes_id).label("cnt"))\
           .select_from(j)\
           .group_by(Clothes.name)\
           .order_by(func.count(wear_log_item.c.clothes_id).desc())
    
    rows = db.execute(stmt).all()
    # Counter.most_common() 형식인 튜플 리스트로 반환 [(name, count), ...]
    return [(r[0], r[1]) for r in rows]

def get_best_combinations(db: Session):
    # main.py 호환용 (전체 기간)
    logs = db.query(WearLog).options(selectinload(WearLog.clothes)).all()
    combo_counter = Counter()

    for wl in logs:
        ids = sorted([c.id for c in wl.clothes])
        for combo in combinations(ids, 2):
            combo_counter[combo] += 1
            
    # ID 조합을 이름 조합으로 변경해서 리턴하고 싶다면 추가 로직 필요
    # 현재는 가장 많이 입은 ID 조합 그대로 리턴 ((1, 3), 5) 형식
    return combo_counter.most_common()