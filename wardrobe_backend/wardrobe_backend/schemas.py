#schemas.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import date

# 옷 생성
class ClothesIn(BaseModel):
    name: str
    category: str
    subcategory: Optional[str] = None
    seasons: Optional[List[str]] = None
    color: Optional[str] = None
    image_url: Optional[str] = None

# 옷 기록 생성
class WearLogIn(BaseModel):
    date: date
    clothes_ids: List[int]

# 날짜 범위
class DateRange(BaseModel):
    start_date: date
    end_date: date