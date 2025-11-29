import { useContext } from "react";
import styled from "styled-components";
import { ClothesContext } from "../context/ClothesContext";
import { useOutfit } from "../context/OutfitContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { useNavigate } from "react-router-dom";

const StatsPage = () => {
  const { clothes } = useContext(ClothesContext);
  const { outfits } = useOutfit();

  const getWeekNumber = (date) => {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  };

  // outfits 데이터를 이용해서 주/월별 통계 생성
  const calcStats = (clothes, outfits) => {
    const weekly = {};
    const monthly = {};

    Object.entries(outfits).forEach(([dateStr, outfit]) => {
      const date = new Date(dateStr);
      const week = getWeekNumber(date);
      const month = date.getMonth() + 1;

      Object.values(outfit).forEach((clothId) => {
        const cloth = clothes.find((c) => c.id === clothId);
        if (!cloth) return;

        // 주별
        const weekKey = `Week ${week}`;
        weekly[weekKey] = (weekly[weekKey] || 0) + 1;

        // 월별
        const monthKey = `Month ${month}`;
        monthly[monthKey] = (monthly[monthKey] || 0) + 1;
      });
    });
    // 객체를 그래프용 배열로 변환
    const weeklyData = Object.entries(weekly).map(([name, count]) => ({
      name,
      count,
    }));
    const monthlyData = Object.entries(monthly).map(([name, count]) => ({
      name,
      count,
    }));

    return { weeklyData, monthlyData };
  };

  const { weeklyData, monthlyData } = calcStats(clothes, outfits);

  const navigate = useNavigate();

  return (
    <main>
      {/* --- 상단 헤더 영역 (CalendarPage와 동일한 스타일) --- */}
      <TopBar>
        <h2
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "30px",
            margin: 0,
          }}
        >
          Stats
          <TooltipWrapper>
            <TooltipButton>?</TooltipButton>
            <TooltipBox>
              나의 옷 착용 빈도와 통계를 한눈에 확인할 수 있습니다.
            </TooltipBox>
          </TooltipWrapper>
        </h2>

        <IntroButton onClick={() => navigate("/")}>HOME →</IntroButton>
      </TopBar>

      <h3>옷 통계 페이지</h3>
      <p>옷별 착용 횟수, 주/월별 통계 계산, 통계 페이지 그래프/표</p>
      <Section>
        <h3>옷별 착용 횟수</h3>
        <BarChart width={600} height={300} data={clothes}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="wearCount" fill="#8884d8" />
        </BarChart>
      </Section>

      <Section>
        <h3>주별 착용 횟수</h3>
        <LineChart width={600} height={300} data={weeklyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="count" stroke="#82ca9d" />
        </LineChart>
      </Section>

      <Section>
        <h3>월별 착용 횟수</h3>
        <LineChart width={600} height={300} data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="count" stroke="#ffc658" />
        </LineChart>
      </Section>
    </main>
  );
};

export default StatsPage;

// --- 스타일 컴포넌트 (CalendarPage에서 가져옴) ---

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
`;

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const TooltipButton = styled.button`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #e5e5e5;
  border: 1px solid #ccc;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  color: #333;
  padding: 0;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;

  &:hover {
    background: #d5d5d5;
  }
`;

const TooltipBox = styled.div`
  display: none;
  position: absolute;
  left: 28px;
  top: 50%;
  transform: translateY(-50%);
  background: #f7f7f7;
  border: 1px solid #ddd;
  padding: 8px 12px;
  border-radius: 6px;
  white-space: nowrap;
  font-size: 13px;
  color: #333;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.05);
  z-index: 10;

  ${TooltipWrapper}:hover & {
    display: block;
  }
`;

const IntroButton = styled.button`
  padding: 8px 14px;
  background: #eeeeee;
  color: #333;
  border: 1px solid #cccccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s ease;
  margin-top: 8px;

  &:hover {
    background: #e0e0e0;
  }
`;

const Section = styled.div`
  margin-bottom: 40px;
`;
