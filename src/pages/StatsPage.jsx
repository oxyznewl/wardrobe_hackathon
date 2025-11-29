import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useState, useContext, useMemo } from "react";
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

  // Context 데이터 가져오기 (데이터가 없으면 빈 객체/배열로 처리)
  const { clothes = [] } = useContext(ClothesContext);
  const { outfits = {} } = useOutfit();

  const [periodTab, setPeriodTab] = useState("week");

  // --- 1. 기본 통계 데이터 계산 ---
  const totalItems = clothes.length;
  const totalWears = clothes.reduce(
    (sum, item) => sum + (item.wearCount || 0),
    0
  );
  const averageWears =
    totalItems > 0 ? (totalWears / totalItems).toFixed(1) : 0;

  // 전체 중 가장 많이 입은 옷 (요약 카드용)
  const mostWornItem = [...clothes].sort(
    (a, b) => b.wearCount - a.wearCount
  )[0];

  // --- 2. 상의 / 하의 랭킹 (Top 3) 분리 로직 ---

  // 상의 필터링 및 정렬
  const topClothes = clothes.filter((c) => c.category === "top");
  const sortedTop = [...topClothes]
    .sort((a, b) => b.wearCount - a.wearCount)
    .slice(0, 3);
  const maxTopWear = sortedTop.length > 0 ? sortedTop[0].wearCount : 0;

  // 하의 필터링 및 정렬
  const bottomClothes = clothes.filter((c) => c.category === "bottom");
  const sortedBottom = [...bottomClothes]
    .sort((a, b) => b.wearCount - a.wearCount)
    .slice(0, 3);
  const maxBottomWear = sortedBottom.length > 0 ? sortedBottom[0].wearCount : 0;

  // --- 3. 카테고리 비율 계산 (파이 차트용) ---
  const categoryStats = clothes.reduce((acc, item) => {
    const category = item.category === "top" ? "상의" : "하의";
    acc[category] = (acc[category] || 0) + (item.wearCount || 0);
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryStats).map(
    ([name, value]) => ({ name, value })
  );

  // --- 4. 주별/월별 통계 계산 (막대 차트용) ---
  const groupedHistory = useMemo(() => {
    if (!outfits) return {};

    const groups = {};

    // 날짜를 최신순으로 정렬하여 처리
    const sortedDates = Object.keys(outfits).sort().reverse();

    sortedDates.forEach((dateStr) => {
      const outfit = outfits[dateStr];
      if (!outfit) return;

      // 유효한 옷이 있는지 확인
      const items = [];
      if (outfit.top && outfit.top.id) items.push(outfit.top);
      if (outfit.bottom && outfit.bottom.id) items.push(outfit.bottom);

      if (items.length === 0) return;

      const date = new Date(dateStr);
      let key = "";

      if (periodTab === "week") {
        // 주별 키 생성 (예: 11월 4주)
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const weekNum = Math.ceil((date.getDate() + firstDay.getDay()) / 7);
        key = `${date.getMonth() + 1}월 ${weekNum}주`;
      } else {
        // 월별 키 생성 (예: 11월)
        key = `${date.getMonth() + 1}월`;
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      // 해당 기간 그룹에 옷 아이템들을 추가
      groups[key].push(...items);
    });

    return groups;
  }, [outfits, periodTab]);

  // --- 화면 렌더링 헬퍼 함수 (랭킹 리스트) ---
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

  // --- 데이터가 없을 때 표시할 화면 ---
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
      {/* 상단 헤더 */}
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
        {/* 1. 요약 정보 카드 */}
        <SummarySection>
          <SummaryCard>
            <SummaryLabel>총 보유 옷</SummaryLabel>
            <SummaryValue>{totalItems}벌</SummaryValue>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>총 착용 횟수</SummaryLabel>
            <SummaryValue>{totalWears}회</SummaryValue>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>평균 착용 횟수</SummaryLabel>
            <SummaryValue>{averageWears}회</SummaryValue>
          </SummaryCard>
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

        {/* 2. 주별/월별 통계 차트 */}
        <SectionCard>
          <HeaderRow>
            <SectionTitle>📅 기간별 착용 기록</SectionTitle>
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
          </HeaderRow>

          <HistoryContainer>
            {Object.keys(groupedHistory).length > 0 ? (
              Object.entries(groupedHistory).map(([period, items]) => (
                <HistoryGroup key={period}>
                  <GroupLabel>{period}</GroupLabel>
                  <GroupGrid>
                    {items.map((item, index) => (
                      <HistoryItem key={`${period}-${index}`}>
                        <HistoryImgWrapper>
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
                </HistoryGroup>
              ))
            ) : (
              <EmptyChartMessage>
                해당 기간의 기록이 없습니다.
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

// --- 스타일 컴포넌트 ---
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

const HistoryGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const GroupLabel = styled.h4`
  font-size: 15px;
  color: #6d4a2a;
  margin: 0;
  padding-bottom: 6px;
  border-bottom: 1px solid #eee;
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
