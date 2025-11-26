import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { useOutfit } from "../context/OutfitContext";

const getTodayKey = () => {
  const t = new Date();
  return (
    t.getFullYear() +
    "-" +
    String(t.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(t.getDate()).padStart(2, "0")
  );
};

const TodayOutfitPage = () => {
  const navigate = useNavigate();
  const { date: paramsDate } = useParams();
  const { saveOutfit, getOutfit } = useOutfit();
  const dateKey = paramsDate || getTodayKey();

  const [top, setTop] = useState("");
  const [bottom, setBottom] = useState("");
  const [etc, setEtc] = useState("");

  useEffect(() => {
    if (dateKey) {
      const savedData = getOutfit(dateKey);
      if (savedData) {
        setTop(savedData.top || "");
        setBottom(savedData.bottom || "");
        setEtc(savedData.etc || "");
      } else {
        setTop("");
        setBottom("");
        setEtc("");
      }
    }
  }, [dateKey]);

  // 2. 저장 버튼 핸들러 (Alert만 띄움)
  const handleSubmit = (e) => {
    e.preventDefault();
    saveOutfit(dateKey, { top, bottom, etc });
    alert("저장 되었습니다!");
  };

  // 3. 삭제 버튼 핸들러
  const handleDelete = () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      setTop("");
      setBottom("");
      setEtc("");
      saveOutfit(dateKey, { top: "", bottom: "", etc: "" });
      alert("삭제되었습니다.");
    }
  };

  // 뒤로가기 (변경사항 확인 기능 추가 가능, 현재는 바로 이동)
  const handleBack = () => {
    navigate("/calendar");
  };

  const hasData = top || bottom || etc;

  return (
    <main>
      <TopBar>
        <BackButton onClick={handleBack}>← Calendar</BackButton>
      </TopBar>

      <h2 style={{ fontSize: "30px" }}>오늘의 옷 추가 / 수정</h2>
      <p>날짜 : {dateKey}</p>

      <form onSubmit={handleSubmit}>
        <RowBox>
          <div style={{ flex: 1 }}>
            <FieldLabel>
              상의
              <SelectBox onClick={() => navigate("/closet?type=top")}>
                {top || "옷장에서 상의 선택"}
              </SelectBox>
            </FieldLabel>
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>
              하의
              <SelectBox onClick={() => navigate("/closet?type=bottom")}>
                {bottom || "옷장에서 하의 선택"}
              </SelectBox>
            </FieldLabel>
          </div>
        </RowBox>

        <div style={{ marginBottom: 16 }}>
          <FieldLabel>
            메모
            <MemoBox value={etc} onChange={(e) => setEtc(e.target.value)} />
          </FieldLabel>
        </div>

        <ButtonContainer>
          {hasData && (
            <DeleteButton type="button" onClick={handleDelete}>
              삭제
            </DeleteButton>
          )}

          <SaveButton type="submit">저장</SaveButton>
        </ButtonContainer>
      </form>
    </main>
  );
};

export default TodayOutfitPage;

// --- 스타일 컴포넌트 ---

const TopBar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 20px;
`;

const BackButton = styled.button`
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

const FieldLabel = styled.label`
  font-size: 20px;
  font-weight: 700;
  color: #48321dff;
  margin-bottom: 6px;
  display: block;
  text-align: center;
`;

const RowBox = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
`;

const MemoBox = styled.textarea`
  width: 80%;
  height: 70px;
  padding: 12px;
  font-size: 15px;
  border-radius: 10px;
  border: 1px solid #ccc;
  margin: 0 auto;
  display: block;
  margin-top: 10px;
  margin-bottom: 40px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
`;

const SaveButton = styled.button`
  padding: 8px 24px;
  background: #8b6f4e;
  color: white;
  font-size: 16px;
  font-weight: 500;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  transition: background 0.2s ease, transform 0.1s ease;

  &:hover {
    background: #a38766;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0px);
  }
`;

const DeleteButton = styled.button`
  padding: 8px 24px;
  background: #d9534f; /* 빨간색 계열 */
  color: white;
  font-size: 16px;
  font-weight: 500;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  transition: background 0.2s ease, transform 0.1s ease;

  &:hover {
    background: #c9302c;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0px);
  }
`;

const SelectBox = styled.div`
  width: 100%;
  height: 220px;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 0 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  background: #ffffff;
  font-size: 16px;
  color: #555;
  transition: background 0.15s ease, border-color 0.15s ease;
  margin-top: 10px;

  &:hover {
    background: #f7f3ec;
    border-color: #bfa68c;
  }
`;
