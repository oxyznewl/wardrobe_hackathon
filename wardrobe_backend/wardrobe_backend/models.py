# models.py
from sqlalchemy import (
    Column, Integer, String, Date, Table, ForeignKey, JSON, create_engine, MetaData
)
from sqlalchemy.orm import registry, relationship, declarative_base, sessionmaker
import datetime
import os

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./wardrobe.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base()

# Association table: wear_log_item (many-to-many between wear_log and clothes)
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
    subcategory = Column(String, nullable=True) # 소분류 카테고리 - 예: hoodie, shirt, jeans 
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

def init_db():
    Base.metadata.create_all(bind=engine)
