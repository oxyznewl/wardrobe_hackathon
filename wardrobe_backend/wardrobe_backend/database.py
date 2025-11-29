#database.py
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

# 2. 엔진 생성 : 데이터베이스와 실제 통신을 담당함
# 기복적으로 SQLite는 한 번에 하나의 스레드, FastAPI는 멀티 스레드 가능 -> False
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 3. 세션 생성 : 실제 DB 세션을 생성하기 위한 '공장' 같은 역할
# 나중에 main.py에서 db = SessionLocal() 형태로 사용
# .commit()을 명령했을 때만, 앞선 엔전과 연결
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Base 클래스 생성 : 부모 클래스
Base = declarative_base()
