import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { useOutfit } from "../context/OutfitContext";
import { ClothesContext } from "../context/ClothesContext";
import SelectionModal from "../components/SelectionModal";

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
  const { incrementWearCount, decrementWearCount } = useContext(ClothesContext);

  const dateKey = paramsDate || getTodayKey();

  const [top, setTop] = useState("");
  const [bottom, setBottom] = useState("");
  const [etc, setEtc] = useState("");

  const [initialState, setInitialState] = useState({
    top: "",
    bottom: "",
    etc: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState("top");

  // 1. 데이터 불러오기
  useEffect(() => {
    if (dateKey) {
      const savedData = getOutfit(dateKey);
      if (savedData) {
        // DB에서 불러온 데이터가 있으면 설정 (이미지는 없을 수 있음)
        setTop(savedData.top || "");
        setBottom(savedData.bottom || "");
        setEtc(savedData.etc || "");

        setInitialState({
          top: savedData.top || "",
          bottom: savedData.bottom || "",
          etc: savedData.etc || "",
        });
      } else {
        // 데이터가 없으면 초기화
        setTop("");
        setBottom("");
        setEtc("");
        setInitialState({ top: "", bottom: "", etc: "" });
      }
    }
  }, [dateKey, getOutfit]);

  // 2. 저장 버튼 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. 변경 여부 확인
    const isSameTop = top?.id === initialState.top?.id;
    const isSameBottom = bottom?.id === initialState.bottom?.id;
    const isSameEtc = etc === initialState.etc;

    // 아무것도 안 바뀌었으면 종료
    if (isSameTop && isSameBottom && isSameEtc) {
      alert("변경 사항이 없습니다.");
      return;
    }

    // 2. 데이터 저장
    saveOutfit(dateKey, { top, bottom, etc });

    // 3. 카운트 조절

    // [상의] 처리
    if (!isSameTop) {
      if (initialState.top?.id) {
        decrementWearCount(initialState.top.id);
      }
      if (top?.id) {
        incrementWearCount(top.id);
      }
    }

    // [하의] 처리
    if (!isSameBottom) {
      if (initialState.bottom?.id) {
        decrementWearCount(initialState.bottom.id);
      }
      if (bottom?.id) {
        incrementWearCount(bottom.id);
      }
    }

    setInitialState({ top, bottom, etc });

    alert("저장 되었습니다!");
  };

  // 3. 삭제 버튼 핸들러
  const handleDelete = () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      if (initialState.top && initialState.top.id) {
        decrementWearCount(initialState.top.id);
      }
      if (initialState.bottom && initialState.bottom.id) {
        decrementWearCount(initialState.bottom.id);
      }

      saveOutfit(dateKey, { top: "", bottom: "", etc: "" }); // 저장소 삭제

      setTop("");
      setBottom("");
      setEtc("");
      setInitialState({ top: "", bottom: "", etc: "" });

      alert("삭제되었습니다.");
    }
  };

  // 뒤로가기 버튼 핸들러 (변경사항 체크)
  const handleBack = () => {
    const isChanged =
      top?.id !== initialState.top?.id || // 상의 ID 비교
      bottom?.id !== initialState.bottom?.id || // 하의 ID 비교
      etc !== initialState.etc; // 메모(문자열) 비교

    if (isChanged) {
      if (
        window.confirm("변경 사항이 저장되지 않습니다. 정말 나가시겠습니까?")
      ) {
        navigate("/calendar");
      }
    } else {
      // 변경된 게 없으면 그냥 이동
      navigate("/calendar");
    }
  };

  const hasData = top || bottom || etc;

  // 모달 열기 함수
  const openSelectionModal = (targetType) => {
    setModalTarget(targetType);
    setIsModalOpen(true);
  };

  // 모달에서 옷 선택 완료 시 실행되는 함수
  const handleSelectConfirm = (selectedItem) => {
    if (modalTarget === "top") {
      setTop(selectedItem);
    } else {
      setBottom(selectedItem);
    }
  };

  // 박스 안에 이미지, 글자 보여주는 헬퍼 함수
  const renderContent = (data, placeholder) => {
    if (!data) return placeholder;
    if (typeof data === "object") {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              marginTop: "18px",
              width: "120px",
              height: "150px",
              background: "#f4f4f4",
              borderRadius: "8px",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #e0e0e0",
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
              marginBottom: "10px",
            }}
          >
            {data.image ? (
              <PreviewImg src={data.image} alt="selected" />
            ) : (
              <span style={{ color: "#aaa", fontSize: "14px" }}>
                이미지 없음
              </span>
            )}
          </div>
          <div style={{ fontSize: "14px", marginTop: "5px" }}>{data.name}</div>
        </div>
      );
    }
    return data;
  };

  return (
    <main>
      <TopBar>
        {/* 뒤로가기 버튼에 handleBack 함수 연결 */}
        <BackButton onClick={handleBack}>← Calendar</BackButton>
      </TopBar>

      <h2 style={{ fontSize: "30px" }}>오늘의 옷 추가 / 수정</h2>
      <p>날짜 : {dateKey}</p>

      <form onSubmit={handleSubmit}>
        <RowBox>
          <div style={{ flex: 1 }}>
            <FieldLabel>
              상의
              <SelectBox onClick={() => openSelectionModal("top")}>
                {renderContent(top, "옷장에서 상의 선택")}
              </SelectBox>
            </FieldLabel>
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>
              하의
              <SelectBox onClick={() => openSelectionModal("bottom")}>
                {renderContent(bottom, "옷장에서 하의 선택")}
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

        <SelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          target={modalTarget}
          onConfirm={handleSelectConfirm}
        />
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

const PreviewImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
