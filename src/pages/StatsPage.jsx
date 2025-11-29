import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useState, useContext, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { ClothesContext } from "../context/ClothesContext";
import { useOutfit } from "../context/OutfitContext";

// 카테고리별 색상
const COLORS = ["#8b6f4e", "#a89078", "#c5b19c", "#e2d2c0", "#f0e4d7"];

const StatsPage = () => {
  const navigate = useNavigate();

  const { clothes } = useContext(ClothesContext);
  const { outfits } = useOutfit();

  const [periodTab, setPeriodTab] = useState("week");

  const totalItems = clothes ? clothes.length : 0;
  const totalWears = clothes
    ? clothes.reduce((sum, item) => sum + item.wearCount, 0)
    : 0;
  const averageWears =
    totalItems > 0 ? (totalWears / totalItems).toFixed(1) : 0;

  const sortedByWear = clothes
    ? [...clothes].sort((a, b) => b.wearCount - a.wearCount).slice(0, 5)
    : [];

  const mostWornItem = sortedByWear.length > 0 ? sortedByWear[0] : null;
  const maxWearCount = mostWornItem ? mostWornItem.wearCount : 0;

  const categoryStats = clothes
    ? clothes.reduce((acc, item) => {
        const category = item.category === "top" ? "상의" : "하의";
        acc[category] = (acc[category] || 0) + item.wearCount;
        return acc;
      }, {})
    : {};

  const categoryChartData = Object.entries(categoryStats).map(
    ([name, value]) => ({ name, value })
  );

  // 주별/월별 통계 계산
  const periodData = useMemo(() => {
    if (!outfits) return { week: [], month: [] };

    const weekMap = {};
    const monthMap = {};

    // outfits 객체: { "2023-10-01": {top:..., bottom:...}, ... }
    Object.keys(outfits).forEach((dateStr) => {
      const date = new Date(dateStr);
      // 데이터 유효성 체크 (해당 날짜에 옷이 하나라도 있는지)
      const hasItem = outfits[dateStr]?.top?.id || outfits[dateStr]?.bottom?.id;
      if (!hasItem) return;

      // -- 월별 데이터 --
      const monthKey = `${date.getMonth() + 1}월`;
      monthMap[monthKey] = (monthMap[monthKey] || 0) + 1;

      // -- 주별 데이터 (간단하게 '월'의 몇째 주인지 계산) --
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const weekNum = Math.ceil((date.getDate() + firstDay.getDay()) / 7);
      const weekKey = `${date.getMonth() + 1}월 ${weekNum}주`;
      weekMap[weekKey] = (weekMap[weekKey] || 0) + 1;
    });

    // 객체를 배열로 변환 및 정렬 (키 기준 정렬)
    const formatData = (map) =>
      Object.entries(map)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { numeric: true })
        ); // 숫자 기준 정렬

    return {
      week: formatData(weekMap),
      month: formatData(monthMap),
    };
  }, [outfits]);

  const currentPeriodData =
    periodTab === "week" ? periodData.week : periodData.month;

  // 데이터 없을 때 화면
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
        {/* 1. 요약 정보 */}
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
              {mostWornItem ? mostWornItem.name : "-"}
            </SummaryValue>
            {mostWornItem && (
              <SummarySubValue>
                ({mostWornItem.wearCount}회 착용)
              </SummarySubValue>
            )}
          </SummaryCard>
        </SummarySection>

        {/* 2. 주별/월별 통계 */}
        <SectionCard>
          <HeaderRow>
            <SectionTitle>📅 기간별 착용 추이</SectionTitle>
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

          <ChartWrapper>
            {currentPeriodData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={currentPeriodData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#666" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide domain={[0, "dataMax + 2"]} />
                  <RechartsTooltip
                    cursor={{ fill: "#f4f4f4" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#8b6f4e"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                    label={{ position: "top", fill: "#8b6f4e", fontSize: 12 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartMessage>
                아직 기록된 코디 데이터가 없습니다.
              </EmptyChartMessage>
            )}
          </ChartWrapper>
        </SectionCard>

        {/* 3. Top 5 리스트 */}
        <SectionCard>
          <SectionTitle>🏆 가장 많이 입은 옷 Top 5</SectionTitle>
          <ListContainer>
            {sortedByWear.map((item, index) => (
              <ItemCard key={item.id}>
                <RankInfo>
                  <RankBadge index={index}>{index + 1}</RankBadge>
                  <ItemDetails>
                    <ItemName>{item.name}</ItemName>
                    <ItemCategory>
                      {item.category === "top" ? "상의" : "하의"}
                    </ItemCategory>
                  </ItemDetails>
                </RankInfo>
                <WearInfo>
                  <WearCount>
                    <strong>{item.wearCount}</strong>회
                  </WearCount>
                  <ProgressBarContainer>
                    <ProgressBar
                      width={
                        maxWearCount > 0
                          ? (item.wearCount / maxWearCount) * 100
                          : 0
                      }
                      color={COLORS[index % COLORS.length]}
                    />
                  </ProgressBarContainer>
                </WearInfo>
              </ItemCard>
            ))}
          </ListContainer>
        </SectionCard>

        {/* 4. 파이 차트 */}
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
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #3c2a1b;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ItemCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const RankInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RankBadge = styled.div`
  width: 28px;
  height: 28px;
  background: ${(props) => {
    if (props.index === 0) return "#ffd700";
    if (props.index === 1) return "#c0c0c0";
    if (props.index === 2) return "#cd7f32";
    return "#f0f0f0";
  }};
  color: ${(props) => (props.index < 3 ? "#ffffff" : "#888888")};
  font-weight: 700;
  font-size: 14px;
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
  font-size: 16px;
  font-weight: 600;
  color: #3c2a1b;
`;

const ItemCategory = styled.div`
  font-size: 13px;
  color: #888;
`;

const WearInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  min-width: 120px;
`;

const WearCount = styled.div`
  font-size: 14px;
  color: #6d4a2a;
  strong {
    font-size: 18px;
    font-weight: 700;
  }
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
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
