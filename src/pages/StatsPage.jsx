import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const StatsPage = () => {
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
