import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useState, useContext, useMemo, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { ClothesContext } from "../context/ClothesContext";
import { useOutfit } from "../context/OutfitContext";

const COLORS = ["#8b6f4e", "#a89078", "#c5b19c", "#e2d2c0", "#f0e4d7"];

const StatsPage = () => {
  const navigate = useNavigate();

  // Context 데이터 가져오기
  const { clothes = [] } = useContext(ClothesContext);
  const { outfits = {} } = useOutfit();

  const [periodTab, setPeriodTab] = useState("week");

  // 시간 영향을 받지 않도록 '날짜 문자열'이나 '시간 00:00:00'으로 관리하는 것이 좋습니다.
  // 여기서는 기존 방식대로 Date 객체를 쓰되, 시간을 초기화합니다.
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  useEffect(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setCurrentDate(d);
  }, [periodTab]);

  // --- 1. 기본 통계 데이터 계산 ---
  const totalItems = clothes.length;
  const totalWears = clothes.reduce(
    (sum, item) => sum + (Number(item.wearCount) || 0),
    0
  );
  const averageWears =
    totalItems > 0 ? (totalWears / totalItems).toFixed(1) : 0;

  // 전체 중 가장 많이 입은 옷
  const mostWornItem = [...clothes].sort(
    (a, b) => (b.wearCount || 0) - (a.wearCount || 0)
  )[0];

  // --- 2. 상의 / 하의 랭킹 (Top 3) ---
  const topClothes = clothes.filter((c) => c.category === "top");
  const sortedTop = [...topClothes]
    .sort((a, b) => (b.wearCount || 0) - (a.wearCount || 0))
    .slice(0, 3);
  const maxTopWear = sortedTop.length > 0 ? sortedTop[0].wearCount : 0;

  const bottomClothes = clothes.filter((c) => c.category === "bottom");
  const sortedBottom = [...bottomClothes]
    .sort((a, b) => (b.wearCount || 0) - (a.wearCount || 0))
    .slice(0, 3);
  const maxBottomWear = sortedBottom.length > 0 ? sortedBottom[0].wearCount : 0;

  // --- 3. 카테고리 비율 계산 ---
  const categoryStats = clothes.reduce((acc, item) => {
    const category = item.category === "top" ? "상의" : "하의";
    acc[category] = (acc[category] || 0) + (Number(item.wearCount) || 0);
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryStats).map(
    ([name, value]) => ({ name, value })
  );

  // 날짜 이동 핸들러
  const movePeriod = (direction) => {
    const newDate = new Date(currentDate);
    if (periodTab === "week") {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else {
      // 월 이동 시 1일로 설정하여 월말 계산 오류 방지
      newDate.setMonth(newDate.getMonth() + direction, 1);
    }
    setCurrentDate(newDate);
  };

  // 현재 보고 있는 기간의 시작/끝 날짜 및 라벨 계산
  const { periodLabel, startRange, endRange } = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const d = currentDate.getDate();
    let s, e, label;

    if (periodTab === "week") {
      const day = currentDate.getDay();
      s = new Date(y, m, d - day); // 일요일
      e = new Date(y, m, d + (6 - day)); // 토요일
      s.setHours(0, 0, 0, 0);
      e.setHours(23, 59, 59, 999);

      // 주차 계산
      const firstDayOfMonth = new Date(s.getFullYear(), s.getMonth(), 1);
      const weekNum = Math.ceil((s.getDate() + firstDayOfMonth.getDay()) / 7);
      const labelMonth = s.getMonth() + 1;

      label = `${labelMonth}월 ${weekNum}주차 (${
        s.getMonth() + 1
      }.${s.getDate()} ~ ${e.getMonth() + 1}.${e.getDate()})`;
    } else {
      s = new Date(y, m, 1);
      s.setHours(0, 0, 0, 0);

      e = new Date(y, m + 1, 0); // 다음 달 0일 = 이번 달 말일
      e.setHours(23, 59, 59, 999);

      label = `${y}년 ${m + 1}월`;
    }
    return { periodLabel: label, startRange: s, endRange: e };
  }, [currentDate, periodTab]);

  // --- 🔥 [핵심 수정] 해당 기간 아이템 필터링 및 카운팅 ---
  const currentPeriodItems = useMemo(() => {
    if (!outfits) return [];

    const itemMap = {};

    // outfits = { "2023-11-29": { top: {id:1, ...}, bottom: {id:2, ...} }, ... }
    Object.keys(outfits).forEach((dateStr) => {
      // 1. 날짜 비교를 위해 파싱 (YYYY-MM-DD)
      const [y, m, d] = dateStr.split("-").map(Number);
      const checkDate = new Date(y, m - 1, d);
      // 비교를 위해 시간 통일 (중간 시간인 12시로 설정하여 타임존 이슈 회피)
      checkDate.setHours(12, 0, 0, 0);

      // 2. 기간 내 포함 여부 확인
      if (
        checkDate.getTime() >= startRange.getTime() &&
        checkDate.getTime() <= endRange.getTime()
      ) {
        const outfit = outfits[dateStr];
        const items = [];

        // 3. 옷 데이터 추출 (객체인지 ID인지 확인하여 처리)
        if (outfit?.top) {
          // 만약 top이 객체이고 id가 있다면 그대로 사용
          if (typeof outfit.top === "object" && outfit.top.id)
            items.push(outfit.top);
          // 만약 top이 ID(숫자/문자)라면 clothes 배열에서 찾아서 사용
          else {
            const found = clothes.find((c) => c.id == outfit.top);
            if (found) items.push(found);
          }
        }

        if (outfit?.bottom) {
          if (typeof outfit.bottom === "object" && outfit.bottom.id)
            items.push(outfit.bottom);
          else {
            const found = clothes.find((c) => c.id == outfit.bottom);
            if (found) items.push(found);
          }
        }

        // 4. 카운팅
        items.forEach((item) => {
          if (!itemMap[item.id]) {
            // periodCount 속성 추가하여 초기화
            itemMap[item.id] = { ...item, periodCount: 0 };
          }
          itemMap[item.id].periodCount += 1;
        });
      }
    });

    // 많이 입은 순으로 정렬
    return Object.values(itemMap).sort((a, b) => b.periodCount - a.periodCount);
  }, [outfits, startRange, endRange, clothes]);

  // --- 렌더링 헬퍼 ---
  const renderRankingList = (items, title, maxVal) => (
    <RankingColumn>
      <SubTitle>{title}</SubTitle>
      <ListContainer>
        {items.length > 0 && maxVal > 0 ? (
          items.map((item, index) => (
            <ItemCard key={item.id}>
              <RankInfo>
                <RankBadge index={index}>{index + 1}</RankBadge>
                <ItemDetails>
                  <ItemName>{item.name}</ItemName>
                </ItemDetails>
              </RankInfo>
              <WearInfo>
                <WearCount>
                  <strong>{item.wearCount}</strong>회
                </WearCount>
                <ProgressBarContainer>
                  <ProgressBar
                    width={(item.wearCount / maxVal) * 100}
                    color={COLORS[index % COLORS.length]}
                  />
                </ProgressBarContainer>
              </WearInfo>
            </ItemCard>
          ))
        ) : (
          <EmptyListMessage>데이터가 없습니다.</EmptyListMessage>
        )}
      </ListContainer>
    </RankingColumn>
  );

  if (!clothes || clothes.length === 0) {
    return (
      <MainContainer>
        <TopBar>
          <Title>Stats</Title>
          <IntroButton onClick={() => navigate("/")}>HOME →</IntroButton>
        </TopBar>
        <EmptyState>
          <EmptyMessage>아직 등록된 옷이 없습니다.</EmptyMessage>
          <AddButton onClick={() => navigate("/closet")}>
            옷 추가하러 가기
          </AddButton>
        </EmptyState>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <TopBar>
        <TitleArea>
          <Title>Stats</Title>
          <TooltipWrapper>
            <TooltipButton>?</TooltipButton>
            <TooltipBox>
              나의 옷 착용 빈도와 다양한 통계를 확인할 수 있습니다.
            </TooltipBox>
          </TooltipWrapper>
        </TitleArea>
        <IntroButton onClick={() => navigate("/")}>HOME →</IntroButton>
      </TopBar>

      <ContentArea>
        {/* 1. 요약 정보 */}
        <SummarySection>
          <SummaryCard>
            <SummaryLabel>총 보유 옷</SummaryLabel>
            <SummaryValue>{totalItems}벌</SummaryValue>
          </SummaryCard>
          {/* <SummaryCard>
            <SummaryLabel>총 착용 횟수</SummaryLabel>
            <SummaryValue>{totalWears}회</SummaryValue>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>평균 착용 횟수</SummaryLabel>
            <SummaryValue>{averageWears}회</SummaryValue>
          </SummaryCard> */}
          <SummaryCard highlight>
            <SummaryLabel>최애 아이템</SummaryLabel>
            <SummaryValue className="highlight">
              {mostWornItem && mostWornItem.wearCount > 0
                ? mostWornItem.name
                : "-"}
            </SummaryValue>
            {mostWornItem && mostWornItem.wearCount > 0 && (
              <SummarySubValue>
                ({mostWornItem.wearCount}회 착용)
              </SummarySubValue>
            )}
          </SummaryCard>
        </SummarySection>

        {/* 2. 기간별 착용 기록 */}
        <SectionCard>
          <HeaderRow>
            <SectionTitle>📅 기간별 착용 기록</SectionTitle>
          </HeaderRow>

          <PeriodNav>
            <NavButton onClick={() => movePeriod(-1)}>◀</NavButton>
            <PeriodLabel>{periodLabel}</PeriodLabel>
            <NavButton onClick={() => movePeriod(1)}>▶</NavButton>
          </PeriodNav>

          {/* 탭 버튼 위치 조정 */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            <TabContainer>
              <TabButton
                active={periodTab === "week"}
                onClick={() => setPeriodTab("week")}
              >
                주별
              </TabButton>
              <TabButton
                active={periodTab === "month"}
                onClick={() => setPeriodTab("month")}
              >
                월별
              </TabButton>
            </TabContainer>
          </div>

          <HistoryContainer>
            {currentPeriodItems.length > 0 ? (
              <GroupGrid>
                {currentPeriodItems.map((item) => (
                  <HistoryItem key={item.id}>
                    <HistoryImgWrapper>
                      {/* 횟수 뱃지 */}
                      <CountBadge>{item.periodCount}회</CountBadge>
                      {item.image ? (
                        <HistoryImg src={item.image} alt={item.name} />
                      ) : (
                        <NoImgText>No Img</NoImgText>
                      )}
                    </HistoryImgWrapper>
                    <HistoryItemName>{item.name}</HistoryItemName>
                  </HistoryItem>
                ))}
              </GroupGrid>
            ) : (
              <EmptyChartMessage style={{ height: "150px" }}>
                이 기간에는 옷을 입은 기록이 없어요.
              </EmptyChartMessage>
            )}
          </HistoryContainer>
        </SectionCard>

        {/* 3. 상의 / 하의 랭킹 (Top 3) */}
        <SectionCard>
          <SectionTitle>🏆 많이 입은 옷 Top 3</SectionTitle>
          <RankingGrid>
            {renderRankingList(sortedTop, "👕 상의 랭킹", maxTopWear)}
            {renderRankingList(sortedBottom, "👖 하의 랭킹", maxBottomWear)}
          </RankingGrid>
        </SectionCard>

        {/* 4. 카테고리 파이 차트 */}
        <SectionCard>
          <SectionTitle>📊 카테고리별 착용 비율</SectionTitle>
          <ChartAndDetailsContainer>
            <ChartWrapper>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartWrapper>

            <CategoryDetailList>
              {categoryChartData.map((item, index) => (
                <CategoryDetailItem key={index}>
                  <CategoryColorBox color={COLORS[index % COLORS.length]} />
                  <CategoryName>{item.name}</CategoryName>
                  <CategoryValue>
                    <strong>{item.value}</strong>회 (
                    {totalWears > 0
                      ? ((item.value / totalWears) * 100).toFixed(1)
                      : 0}
                    %)
                  </CategoryValue>
                </CategoryDetailItem>
              ))}
            </CategoryDetailList>
          </ChartAndDetailsContainer>
        </SectionCard>
      </ContentArea>
    </MainContainer>
  );
};

export default StatsPage;

// --- 스타일 컴포넌트 (기존과 동일) ---
const MainContainer = styled.main`
  padding-bottom: 40px;
`;
const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;
const TitleArea = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #3c2a1b;
  margin: 0;
`;
const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
`;
const TooltipButton = styled.button`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #e5d8c7;
  border: none;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  color: #6d4a2a;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: #d4c4b0;
  }
`;
const TooltipBox = styled.div`
  display: none;
  position: absolute;
  left: 28px;
  top: 50%;
  transform: translateY(-50%);
  background: #fffdf8;
  border: 1px solid #e5d8c7;
  padding: 10px 14px;
  border-radius: 8px;
  white-space: nowrap;
  font-size: 13px;
  color: #4a3b2f;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  ${TooltipWrapper}:hover & {
    display: block;
  }
`;
const IntroButton = styled.button`
  padding: 8px 16px;
  background: #f4efe9;
  color: #6d4a2a;
  border: 1px solid #e5d8c7;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  &:hover {
    background: #e5d8c7;
    color: #4a3b2f;
  }
`;
const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;
const SummarySection = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
`;
const SummaryCard = styled.div`
  background: ${(props) => (props.highlight ? "#fff6e6" : "#ffffff")};
  border: 1px solid ${(props) => (props.highlight ? "#eddabf" : "#eaeaea")};
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 110px;
`;
const SummaryLabel = styled.div`
  font-size: 14px;
  color: #888;
  margin-bottom: 8px;
  font-weight: 500;
`;
const SummaryValue = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: #3c2a1b;
  &.highlight {
    color: #8b6f4e;
    font-size: 24px;
  }
`;
const SummarySubValue = styled.div`
  font-size: 13px;
  color: #6d4a2a;
  margin-top: 4px;
`;
const SectionCard = styled.section`
  background: #ffffff;
  border-radius: 20px;
  padding: 15px 24px 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
`;
const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #3c2a1b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;
const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;
const TabContainer = styled.div`
  display: flex;
  background: #f4efe9;
  padding: 4px;
  border-radius: 20px;
`;
const TabButton = styled.button`
  padding: 6px 16px;
  border-radius: 16px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  background: ${(props) => (props.active ? "#fff" : "transparent")};
  color: ${(props) => (props.active ? "#8b6f4e" : "#888")};
  box-shadow: ${(props) =>
    props.active ? "0 2px 6px rgba(0,0,0,0.05)" : "none"};
  transition: all 0.2s;
`;
const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
const ItemCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;
const RankInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;
const RankBadge = styled.div`
  width: 24px;
  height: 24px;
  background: ${(props) => {
    if (props.index === 0) return "#ffd700";
    if (props.index === 1) return "#c0c0c0";
    if (props.index === 2) return "#cd7f32";
    return "#f0f0f0";
  }};
  color: ${(props) => (props.index < 3 ? "#ffffff" : "#888888")};
  font-weight: 700;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
`;
const ItemDetails = styled.div`
  display: flex;
  flex-direction: column;
`;
const ItemName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #3c2a1b;
`;
const ItemCategory = styled.div`
  font-size: 12px;
  color: #888;
`;
const WearInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  min-width: 80px;
`;
const WearCount = styled.div`
  font-size: 13px;
  color: #6d4a2a;
  strong {
    font-size: 16px;
    font-weight: 700;
  }
`;
const ProgressBarContainer = styled.div`
  width: 100%;
  height: 6px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
`;
const ProgressBar = styled.div`
  height: 100%;
  width: ${(props) => props.width}%;
  background: ${(props) => props.color || "#8b6f4e"};
  border-radius: 4px;
  transition: width 0.5s ease-in-out;
`;
const ChartAndDetailsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 24px;
  @media (max-width: 600px) {
    flex-direction: column;
  }
`;
const ChartWrapper = styled.div`
  flex: 1;
  min-width: 250px;
  height: 250px;
`;
const CategoryDetailList = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 200px;
`;
const CategoryDetailItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #f9f9f9;
  border-radius: 10px;
`;
const CategoryColorBox = styled.div`
  width: 16px;
  height: 16px;
  background: ${(props) => props.color};
  border-radius: 4px;
  margin-right: 10px;
`;
const CategoryName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #3c2a1b;
  flex-grow: 1;
`;
const CategoryValue = styled.div`
  font-size: 14px;
  color: #6d4a2a;
  strong {
    font-weight: 700;
  }
`;
const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  text-align: center;
`;
const EmptyMessage = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #888;
  margin-bottom: 10px;
`;
const AddButton = styled.button`
  padding: 12px 24px;
  background: #8b6f4e;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 4px 10px rgba(139, 111, 78, 0.3);
  &:hover {
    background: #a38766;
  }
`;
const EmptyChartMessage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  font-size: 14px;
  background: #f9f9f9;
  border-radius: 12px;
`;
const EmptyListMessage = styled.div`
  text-align: center;
  color: #aaa;
  font-size: 14px;
  padding: 20px 0;
`;
const RankingGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 20px;
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;
const RankingColumn = styled.div`
  background: #fdfaf8;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #efeae4;
`;
const SubTitle = styled.h4`
  font-size: 16px;
  color: #5a4a3a;
  margin: 0 0 16px 0;
  border-bottom: 2px solid #e5d8c7;
  padding-bottom: 8px;
`;
const HistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
const GroupGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 12px;
`;
const HistoryItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
`;
const HistoryImgWrapper = styled.div`
  width: 70px;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
  background: #f4f4f4;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #eee;
  position: relative;
`;
const HistoryImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
const NoImgText = styled.span`
  font-size: 11px;
  color: #aaa;
`;
const HistoryItemName = styled.span`
  font-size: 12px;
  color: #333;
  text-align: center;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const PeriodNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
  background: #fdfaf8;
  padding: 10px;
  border-radius: 12px;
`;
const PeriodLabel = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #3c2a1b;
`;
const NavButton = styled.button`
  background: white;
  border: 1px solid #e5d8c7;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6d4a2a;
  &:hover {
    background: #f4efe9;
  }
`;
const CountBadge = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(139, 111, 78, 0.9);
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 5px;
  border-radius: 10px;
  z-index: 1;
`;
