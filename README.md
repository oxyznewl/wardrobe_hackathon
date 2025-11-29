# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# **옷장 관리 시스템**

> **오늘 뭐 입지?
전에 뭐 입었지?

매일매일 입을 옷을 고민하시는 분들을 위한 옷장 관리 시스템!!**
> 

## 🌟 **프로젝트 개요**

### *우리는 매일 입을 옷을 고민하지만…*

- 옷장에 어떤 옷이 있는지 몰라 불편한 경우!
- 전과 다른 조합으로 옷을 입고 싶은 경우!
- 이전 착장이 기억나지 않는 경우!

### 🤷🏻 옷장을 한눈에 확인할 수는 없을까?

![image.png](attachment:954ba521-1557-4ab9-82f0-7d7bd2b239f3:image.png)

 저희 인디고 디버거즈의 옷장 관리 시스템은 옷장 속 모든 옷을 한눈에 확인하고, 하루 착장을 캘린더에 기록하며, 각 옷의 착용 빈도 정보를 제공하는 서비스입니다.
 전과 다른 조합으로 옷을 입고 싶어도, 며칠 전에 입었던 옷과 다른 옷을 입고 싶어도, 이전 착장이 기억나지 않아 고민하는 경우가 있습니다. 이러한 불편함을 해결하고자 옷장 관리 시스템을 만들었으며, 같은 문제를 겪는 사람들에게 도움이 되기를 바랍니다.

## ⚡️**프로젝트 목표**

- 사용자가 자신의 옷장을 체계적으로 파악하고, 일일 착장을 손쉽게 기록하며, 의류의 착용 빈도를 데이터로 확인할 수 있도록 돕는다.
- 이러한 기능을 통해 불필요한 소비를 줄이고 개인의 스타일 관리 능력을 향상에 기여한다.
- 나아가 비슷한 불편함을 겪는 사람들에게 실질적인 편의성과 패션 관리의 효율성을 제공한다.

## 🍔 **팀 소개 : 인디고 디버거즈!!**

- 팀 이름 : 인디고 디버거즈
    - 진한 인디고 색처럼 깊이 있고 차분한 시각으로 문제를 바라보며, 패션과 기술 속 ‘불편함’을 찾아 디버깅하듯 문제를 해결해 나가는 팀이라는 뜻을 담고 있다.
- 옷장이라는 개인적이고 일상적인 영역에서 발생하는 문제들을 기술적으로 분석하고 개선하고자 결성되었다.

## 😎 **팀원 소개**

| 김민주 | 백엔드 구현, 노션 작성 |
| --- | --- |
| 심채연 | 프론트엔드 구현 : 옷장 관리 페이지, 옷 추가, 상세정보, 수정 페이지 |
| 이영은 | 프론트엔드 구현 : 인트로 페이지, 캘린더 페이지(코디 등록) , 옷 통계 페이지 |
| 황서현  | 데이터 수집, 피피티 작성 |

## 🗄 기능 설명

1. **옷 등록 및 관리 기능**
    - 보유한 옷을 사진과 텍스트로 등록
    - 카테고리·계절·색상으로 분류
2. **옷 열람 기능**
    - 옷장에서 바로 옷 등록 가능
    - 등록 순서 또는 착용 횟수 기준으로 정렬
    - 등록한 옷을 한눈에 확인
    - 옷을 클릭하면 상세정보 확인 가능
        - 옷 삭제 가능
        - 상세 정보 확인 페이지에서 옷 정보 수정 가능
3. **착장 기록(캘린더) 기능**
    - 하루 착장을 캘린더에 저장
    - 날짜별 스타일 확인 가능
4. **착용 빈도 통계 기능**
    - 등록한 옷의 착용 횟수 분석
    - 자주 입는 옷·거의 입지 않는 옷 확인
    - 그래프를 통해 시각적으로 정보 제공

## 🤖 **사용기술**

- **Frontend**
    - **Language:** JavaScript
    - **Framework:** React
    - **Build Tool:** Vite
    - **Routing:** React Router v6
    - **UI Styling:** Styled-components
- **Backend**
    - **Language (언어):** Python 3.10+
    - **Framework (프레임워크):** FastAPI
    - **Database (데이터베이스):** SQLite (SQLAlchemy ORM 사용)
    - **Server (서버):** Uvicorn (ASGI 서버)
    - **Validation (데이터 검증):** Pydantic

## 🙂 FRONTEND

**🪾** `Client-Side Architecture` **(클라이언트 사이드 아키텍처)**

wardrobe_hackathon/
├── src/
│   ├── components/
│   │   ├── Calendar.jsx         # 달력
│   │   ├── ClosetFilters.jsx          # 필터 컴포넌트
│   │   ├── ClothesCard.jsx        # 옷 컴포넌트
│   │   ├── ClothesList.jsx       # 를 필터에 따라 분류/정렬
│   │   ├── OutfitModal.jsx     # 코디 관리 창
│   │   └── SelectionModal.jsx     # 코디 선택 창
│   ├── context/
│   │   ├── ClothesContext.jsx     # 옷 데이터 관리
│   │   └── OutfitContext.jsx     # ‘오늘의 옷’(코디) 관리
│   ├── pages/
│   │   ├── CalendarPage.jsx     # 달력 페이지
│   │   ├── ClosetPage.jsx            # 옷장 페이지
│   │   ├── DetailPage.jsx          # 상세정보 열람, 삭제
│   │   ├── EditPage.jsx          # 옷 정보 수정
│   │   ├── InsertPage.jsx       # 새로운 옷 등록
│   │   ├── IntroPage.jsx     # 달력, 통계, 옷장 페이지 연결
│   │   ├── StatsPage.jsx     # 통계 페이지
│   │   └── TodayOutfitPage.jsx     # 오늘의 옷 추가/수정
│   ├── App.jsx                  
│   ├── main.jsx               

[자세한 프론트엔드 기능 설명](https://www.notion.so/2b8837fdd1cb80feb968f53b0d602709?pvs=21)

## 🙃 BACKEND

**🪾** `Server-Side Architecture` **(서버 사이드 아키텍처)**

app/
├── [database.py](http://database.py/)      # 데이터베이스 스키마 정의
├── [models.py](http://models.py/)        # [Domain] SQLAlchemy ORM 모델
├── [schemas.py](http://schemas.py/)       # [Domain] Pydantic DTO
├── [repositories.py](http://repositories.py/)  # [Repository] DB 쿼리 전담
├── [services.py](http://services.py/)      # [Service] 비즈니스 로직 및 데이터 가공
└── [main.py](http://main.py/)          # [Controller] API 엔드포인트 및 의존성 주입

[API 명세서](https://www.notion.so/2b8837fdd1cb80199649d7620fe4d3d9?pvs=21)

![image.png](attachment:e960c842-442b-4200-83cf-d780d4eb1d19:image.png)

💾 **Database 구조**

![image.png](attachment:46eac02c-8d47-41f6-9272-d3e63eb718f2:image.png)

[자세한 백엔드 기능 설명](https://www.notion.so/2b8837fdd1cb80af9a69f215b910fe60?pvs=21)

## 🪺 확장 계획

- 기능 확장
    - 통계 보충
        - 계절, 취향 변화 반영
        - 최근 N개월 이내 기록만 반영 등
    - 카테고리 수 늘리기
        - 양말, 신발, 가방, 악세서리, 모자 등 종류 늘리기
        - 상의 - 이너, 아우터, 원피스 등 카테고리 세분화
    - 앱으로 만들기
        - (옷장 여는 귀찮음 == 웹으로 접속하는 귀찮음)일 가능성 고려
- 더 나은 기능
    - ‘옷 상태’ 관리 기능 추가
        - 입을 옷을 결정했으나 해당 옷이 더럽거나 세탁 중이거나 착용 불가능 상태 등등… 인 불상사 발생 가능성
        - 세탁
            - 입은 횟수/얼룩 발생 여부에 따른 세탁 필요 여부 판단
            - 깨끗함, 더러움, 세탁 중 …
        - 수선
            - 하자 여부/ 수선 여부
            - 중고 판매 시에도 편리
        - 보관:
            - 보관 위치(옷장 서랍, 행거… 등)
    - AI를 이용한 코디 추천
    - 실제 착용샷 저장해서 핏 확인
