from sqlalchemy import Column, Integer, String, Date, Table, ForeignKey
from sqlalchemy.orm import relationship
import datetime

# 핵심 변경 사항: database.py에서 Base를 가져옵니다.
# 이렇게 해야 main.py, database.py, models.py가 모두 같은 설정을 공유합니다.
from database import Base 

# ---------------------------------------------------------
# 여기서부터는 DB 설정(engine, SessionLocal)을 하지 않습니다.
# 오직 테이블(모델) 정의만 합니다.
# ---------------------------------------------------------

# Association table: wear_log_item
wear_log_item = Table(
    "wear_log_item",
    Base.metadata,
    Column("id", Integer, primary_key=True, index=True),
    Column("wear_log_id", Integer, ForeignKey("wear_log.id")),
    Column("clothes_id", Integer, ForeignKey("clothes.id")),
)

class Clothes(Base):
    __tablename__ = "clothes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # e.g., top, bottom, outer, shoes
    seasons = Column(String, nullable=True)    # simple CSV: "spring,summer"
    color = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    created_at = Column(Date, default=datetime.date.today)

class WearLog(Base):
    __tablename__ = "wear_log"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    # relationship:
    clothes = relationship("Clothes", secondary=wear_log_item, backref="wear_logs")