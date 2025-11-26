import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const OutfitModal = ({ dateKey, initialOutfit, onSave, onClose }) => {
  const navigate = useNavigate();

  const [top, setTop] = useState(initialOutfit?.top || "");
  const [bottom, setBottom] = useState(initialOutfit?.bottom || "");
  const [etc, setEtc] = useState(initialOutfit?.etc || "");

  useEffect(() => {
    setTop(initialOutfit?.top ?? "");
    setBottom(initialOutfit?.bottom ?? "");
    setEtc(initialOutfit?.etc ?? "");
  }, [initialOutfit]);

  if (!dateKey) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ top, bottom, etc });
    //onClose();
  };

  return (
    <ModalWrapper>
      <ModalBox>
        <Title>{dateKey} 코디</Title>

        {/* 🔥 상의 / 하의 가로 정렬 구간 */}
        <RowBox>
          <Field>
            <FieldLabel>상의</FieldLabel>
            <SelectBox onClick={() => navigate("/closet?type=top")}>
              {top || "옷장에서 상의 선택"}
            </SelectBox>
          </Field>

          <Field>
            <FieldLabel>하의</FieldLabel>
            <SelectBox onClick={() => navigate("/closet?type=top")}>
              {top || "옷장에서 하의 선택"}
            </SelectBox>
          </Field>
        </RowBox>

        <Field style={{ marginTop: 16 }}>
          <FieldLabel>메모</FieldLabel>
          <MemoArea value={etc} onChange={(e) => setEtc(e.target.value)} />
        </Field>

        <ButtonRow>
          <SecondaryButton type="button" onClick={onClose}>
            취소
          </SecondaryButton>
          <PrimaryButton type="submit">저장</PrimaryButton>
        </ButtonRow>
      </ModalBox>
    </ModalWrapper>
  );
};

export default OutfitModal;

const ModalWrapper = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
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

const Form = styled.form`
  margin-top: 4px;
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
  height: 150px;
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
