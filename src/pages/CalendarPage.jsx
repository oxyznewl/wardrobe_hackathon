import styled from "styled-components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "../components/Calendar";
import OutfitModal from "../components/OutfitModal";

const CalendarPage = ({ outfitsByDate, onSaveOutfit }) => {
  const navigate = useNavigate();

  const now = new Date();
  const [currentYM, setCurrentYM] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });

  const { year, month } = currentYM;

  const [selectedDateKey, setSelectedDateKey] = useState(null);

  const handleClickDate = (dateKey) => {
    setSelectedDateKey(dateKey);
  };

  const handleCloseModal = () => {
    setSelectedDateKey(null);
  };

  const handleSave = (outfitData) => {
    onSaveOutfit(selectedDateKey, outfitData);
  };

  const initialOutfit =
    selectedDateKey && outfitsByDate[selectedDateKey]
      ? outfitsByDate[selectedDateKey]
      : null;

  // 🔽 이전 달로 이동
  const handlePrevMonth = () => {
    setCurrentYM((prev) => {
      let y = prev.year;
      let m = prev.month - 1;
      if (m < 0) {
        m = 11;
        y = y - 1;
      }
      return { year: y, month: m };
    });
  };

  // 🔼 다음 달로 이동
  const handleNextMonth = () => {
    setCurrentYM((prev) => {
      let y = prev.year;
      let m = prev.month + 1;
      if (m > 11) {
        m = 0;
        y = y + 1;
      }
      return { year: y, month: m };
    });
  };

  const displayMonth = month + 1;

  return (
    <main>
      {/* 상단: 왼쪽엔 제목+툴팁, 오른쪽엔 인트로 버튼 */}
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
          Calendar
          <TooltipWrapper>
            <TooltipButton>?</TooltipButton>
            <TooltipBox>
              날짜를 클릭하면 해당 날짜의 코디를 추가/수정할 수 있습니다.
            </TooltipBox>
          </TooltipWrapper>
        </h2>

        <IntroButton onClick={() => navigate("/")}>HOME →</IntroButton>
      </TopBar>

      <MonthBar>
        <ContainerDiv>
          <button onClick={handlePrevMonth}>◀</button>
          <strong style={{ fontSize: "24px" }}>
            {year}년 {displayMonth}월
          </strong>
          <button onClick={handleNextMonth}>▶</button>
        </ContainerDiv>

        <TodayButton onClick={() => navigate("/today")}>
          오늘의 옷 추가하기
        </TodayButton>
      </MonthBar>

      <Calendar
        year={year}
        month={month}
        onClickDate={handleClickDate}
        outfitsByDate={outfitsByDate}
      />

      <OutfitModal
        dateKey={selectedDateKey}
        initialOutfit={initialOutfit}
        onSave={handleSave}
        onClose={handleCloseModal}
      />
    </main>
  );
};

export default CalendarPage;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
`;

const MonthBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const TodayButton = styled.button`
  padding: 8px 18px;
  background: #6d4a2a;
  color: white;
  border: 1px solid #6d4a2a;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-top: 6px;

  &:hover {
    background: #8c633d;
  }
`;

const ContainerDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
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
