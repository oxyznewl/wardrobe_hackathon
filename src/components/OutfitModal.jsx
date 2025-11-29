import { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import SelectionModal from "./SelectionModal";
import { ClothesContext } from "../context/ClothesContext";

const OutfitModal = ({ dateKey, initialOutfit, onSave, onClose }) => {
  const { incrementWearCount, decrementWearCount } = useContext(ClothesContext);

  const [top, setTop] = useState(initialOutfit?.top || "");
  const [bottom, setBottom] = useState(initialOutfit?.bottom || "");
  const [etc, setEtc] = useState(initialOutfit?.etc || "");

  // 초기 상태 기억하기 (비교용)
  const [initialState, setInitialState] = useState({
    top: initialOutfit?.top || "",
    bottom: initialOutfit?.bottom || "",
    etc: initialOutfit?.etc || "",
  });

  const [isSelectionOpen, setIsSelectionOpen] = useState(false);
  const [selectionTarget, setSelectionTarget] = useState("top");

  useEffect(() => {
    // 모달이 열릴 때 props로 받은 데이터로 초기화
    const initTop = initialOutfit?.top || "";
    const initBottom = initialOutfit?.bottom || "";
    const initEtc = initialOutfit?.etc || "";

    setTop(initTop);
    setBottom(initBottom);
    setEtc(initEtc);

    // 초기 상태도 업데이트
    setInitialState({
      top: initTop,
      bottom: initBottom,
      etc: initEtc,
    });
  }, [initialOutfit]);

  if (!dateKey) return null;

  const handleCancel = () => {
    const isChanged =
      top?.id !== initialState.top?.id ||
      bottom?.id !== initialState.bottom?.id ||
      etc !== initialState.etc;

    if (isChanged) {
      if (
        window.confirm("변경 사항이 저장되지 않습니다. 정말 나가시겠습니까?")
      ) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. 변경 여부 확인 (바뀐 게 없으면 함수 종료)
    const isSameTop = top?.id === initialState.top?.id;
    const isSameBottom = bottom?.id === initialState.bottom?.id;
    const isSameEtc = etc === initialState.etc;

    if (isSameTop && isSameBottom && isSameEtc) {
      alert("변경 사항이 없습니다.");
      return;
    }

    // 2. 카운트 조절

    // [상의 처리]
    if (!isSameTop) {
      if (initialState.top?.id) {
        decrementWearCount(initialState.top.id);
      }
      // B. 새로 입은 옷이 있다면 -> 카운트 증가
      if (top?.id) {
        incrementWearCount(top.id);
      }
    }

    // [하의 처리]
    if (!isSameBottom) {
      // A. 원래 입던 옷이 있었다면 -> 카운트 감소
      if (initialState.bottom?.id) {
        decrementWearCount(initialState.bottom.id);
      }
      // B. 새로 입은 옷이 있다면 -> 카운트 증가
      if (bottom?.id) {
        incrementWearCount(bottom.id);
      }
    }

    // 3. 저장 실행
    onSave({ top, bottom, etc });

    // 4. 현재 상태를 초기 상태로 업데이트 (중복 카운트 방지)
    setInitialState({ top, bottom, etc });

    alert("저장 되었습니다!");
  };

  const handleDelete = () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      // 1. 기존 옷 카운트 감소
      if (initialState.top?.id) decrementWearCount(initialState.top.id);
      if (initialState.bottom?.id) decrementWearCount(initialState.bottom.id);

      // 2. 삭제 실행
      onSave({ top: "", bottom: "", etc: "" });

      setTop("");
      setBottom("");
      setEtc("");

      // 초기 상태 리셋은 모달이 닫히거나 다시 열릴 때 처리되므로 여기선 생략 가능하지만,
      // 바로 닫지 않는다면 해주는 게 좋음.
      setInitialState({ top: "", bottom: "", etc: "" });
    }
  };

  const openSelection = (target) => {
    setSelectionTarget(target);
    setIsSelectionOpen(true);
  };

  const handleSelectConfirm = (selectedItem) => {
    if (selectionTarget === "top") {
      setTop(selectedItem);
    } else {
      setBottom(selectedItem);
    }
  };

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
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100px",
              height: "130px",
              background: "#f4f4f4",
              borderRadius: "8px",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #e0e0e0",
              marginBottom: "8px",
            }}
          >
            {data.image ? (
              <PreviewImg src={data.image} alt="selected" />
            ) : (
              <span style={{ color: "#aaa", fontSize: "12px" }}>
                이미지 없음
              </span>
            )}
          </div>
          <div
            style={{ fontSize: "14px", fontWeight: "600", color: "#4a3b2f" }}
          >
            {data.name}
          </div>
        </div>
      );
    }
    return data;
  };

  const hasData = top || bottom || etc;

  return (
    <ModalWrapper>
      <ModalBox>
        <Title>{dateKey} 코디</Title>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <RowBox>
            <Field>
              <FieldLabel>상의</FieldLabel>
              <SelectBox onClick={() => openSelection("top")}>
                {renderContent(top, "옷장에서 상의 선택")}
              </SelectBox>
            </Field>

            <Field>
              <FieldLabel>하의</FieldLabel>
              <SelectBox onClick={() => openSelection("bottom")}>
                {renderContent(bottom, "옷장에서 하의 선택")}
              </SelectBox>
            </Field>
          </RowBox>

          <Field style={{ marginTop: 16 }}>
            <FieldLabel>메모</FieldLabel>
            <MemoArea value={etc} onChange={(e) => setEtc(e.target.value)} />
          </Field>

          <ButtonRow>
            {hasData && (
              <DeleteButton type="button" onClick={handleDelete}>
                삭제
              </DeleteButton>
            )}

            <SecondaryButton type="button" onClick={handleCancel}>
              취소
            </SecondaryButton>

            <PrimaryButton type="submit">저장</PrimaryButton>
          </ButtonRow>
        </form>
      </ModalBox>

      <SelectionModal
        isOpen={isSelectionOpen}
        onClose={() => setIsSelectionOpen(false)}
        target={selectionTarget}
        onConfirm={handleSelectConfirm}
      />
    </ModalWrapper>
  );
};

export default OutfitModal;

// --- 스타일 컴포넌트 ---

const ModalWrapper = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalBox = styled.div`
  width: 520px;
  min-height: 400px;
  background: #fffdf8;
  padding: 32px 40px;
  border-radius: 14px;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.18);

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const Title = styled.h2`
  text-align: center;
  margin-top: 12px;
  margin-bottom: 24px;
  font-size: 26px;
  font-weight: 700;
  color: #3c2a1b;
`;

const RowBox = styled.div`
  display: flex;
  gap: 20px;
`;

const Field = styled.div`
  flex: 1;
  text-align: center;
`;

const FieldLabel = styled.div`
  font-size: 19px;
  margin-bottom: 8px;
  font-weight: 700;
  color: #48321d;
`;

const SelectBox = styled.div`
  width: 100%;
  height: 180px; /* 이미지 들어가야 하니 조금 늘림 */
  border: 1px solid #ccc;
  border-radius: 10px;

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 16px;
  color: #555;
  background: white;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: #f7f3ec;
    border-color: #bfa68c;
  }
`;

const MemoArea = styled.textarea`
  width: 80%;
  height: 60px;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #d8c8b8;
  font-size: 14px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #b5987a;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
`;

const DeleteButton = styled.button`
  padding: 8px 18px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  margin-right: auto;

  &:hover {
    background: #c0392b;
  }
`;

const SecondaryButton = styled.button`
  padding: 8px 18px;
  background: #e7e2dc;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #5a4a3a;
  font-weight: 500;

  &:hover {
    background: #d9d2ca;
  }
`;

const PrimaryButton = styled.button`
  padding: 8px 22px;
  background: #8b6f4e;
  color: white;
  font-size: 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.16);

  &:hover {
    background: #a38766;
  }
`;

const PreviewImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
