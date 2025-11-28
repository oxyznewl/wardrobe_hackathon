#models.py
from database import Base 
from sqlalchemy import Column, Integer, String, Date, Table, ForeignKey
from sqlalchemy.orm import relationship # db 쿼리를 직접 짜지 않고도 연결된 데이터를 쉽게 가져오기 위해 사용
import datetime

wear_log_item = Table(
    # 다대다 관계 설명
    "wear_log_item",
    Base.metadata, # 테이블 정보를 Base의 메타데이터에 등록
    Column("id", Integer, primary_key=True, index=True),
    Column("wear_log_id", Integer, ForeignKey("wear_log.id")),
    Column("clothes_id", Integer, ForeignKey("clothes.id")),
)

class Clothes(Base):
    # 옷 정보 저장
    __tablename__ = "clothes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    seasons = Column(String, nullable=True)
    color = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    created_at = Column(Date, default=datetime.date.today)

class WearLog(Base):
    # 언제 무엇을 입었는지
    __tablename__ = "wear_log"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    clothes = relationship("Clothes", secondary=wear_log_item, backref="wear_logs")
    # Clothes 클래스와 연결되며, wear_log_item으로 간접 연결, 반대 방향 연결도 가능