import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

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

const TodayOutfitPage = ({ onSaveOutfit }) => {
  const navigate = useNavigate();

  const [dateKey] = useState(getTodayKey());
  const [top] = useState("");
  const [bottom] = useState("");
  const [etc, setEtc] = useState("");
  const [saved, setSaved] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveOutfit(dateKey, { top, bottom, etc });
    setSaved(true);
    setHasSaved(false);
  };

  useEffect(() => {
    if (saved) {
      const timer = setTimeout(() => {
        setSaved(false);
        setHasSaved(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [saved]);

  return (
    <main>
      <TopBar>
        <BackButton onClick={() => navigate("/calendar")}>
          ← Calender
        </BackButton>
      </TopBar>

      <h2
        style={{
          fontSize: "30px",
        }}
      >
        오늘의 옷 추가/수정
      </h2>
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
              <SelectBox onClick={() => navigate("/closet?type=top")}>
                {top || "옷장에서 하의 선택"}
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
        <SaveButton type="submit">{saved ? "✅ 저장됨" : "저장"}</SaveButton>

        {hasSaved && !saved && (
          <span style={{ marginLeft: 10, fontSize: "18px" }}>✅</span>
        )}
      </form>
    </main>
  );
};

export default TodayOutfitPage;

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
