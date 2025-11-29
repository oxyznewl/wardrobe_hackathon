# wardrobe_hackathon
2025년도 2학기 해달 해커톤 : 옷장 관리 시스템
app/
├── database.py      # DB 연결 설정
├── models.py        # [Domain] SQLAlchemy ORM 모델
├── schemas.py       # [Domain] Pydantic DTO
├── repositories.py  # [Repository] DB 쿼리 전담
├── services.py      # [Service] 비즈니스 로직 및 데이터 가공
└── main.py          # [Controller] API 엔드포인트 및 의존성 주입