from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
'''
ORM(object relational manager) : 객체-관계 mapping
실제로 쿼리를 실행할 필요 없이 프로그래밍 방식으로 안전하고 편리하게 애플리케이션 안에서 데이터베이스에 연결 가능
이 ORM 중 하나로 SQLAlchemy이 있음
'''

# 1. 데이터베이스 접속 주소 (SQLite 사용 시)
SQLALCHEMY_DATABASE_URL = "sqlite:///./wardrobe.db"

# 2. 엔진 생성
# connect_args={"check_same_thread": False}는 SQLite에서만 필요합니다.
# (이게 없으면 쓰레드 간 통신 오류가 날 수 있습니다)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 3. 세션 로컬 생성
# 실제 DB 세션을 생성하기 위한 '공장' 같은 역할을 합니다.
# 나중에 main.py에서 db = SessionLocal() 형태로 사용하게 됩니다.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Base 클래스 생성
# 나중에 models.py에서 상속받아 DB 모델을 만들 때 사용합니다.
# 예: class User(Base): ...
Base = declarative_base()