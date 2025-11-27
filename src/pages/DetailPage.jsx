import styled from "styled-components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { useContext } from "react";
import { ClothesContext } from "../context/ClothesContext";

const DetailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = Number(searchParams.get("id"));

  const { clothes, removeClothes } = useContext(ClothesContext);

  const item = clothes.find((c) => c.id === id);

  const handleDeleteClick = () => {
    const ok = window.confirm("정말로 삭제하시겠습니까?");
    if (ok) {
      // 삭제 로직 실행
      removeClothes(id);
      navigate("/closet");
    }
  };

  const handleBackClick = () => {
    navigate(-1); //스택에서 pop (=이전 페이지로 이동)
  };

  if (!item) {
    return <p>해당 옷을 찾을 수 없습니다.</p>;
  }

  const CATEGORIES = [
    { value: "top", label: "상의" },
    { value: "bottom", label: "하의" },
  ];

  const getCategoryLabel = (value) => {
    const found = CATEGORIES.find((c) => c.value === value);
    return found ? found.label : value;
  };

  return (
    <div>
      <h2>상세 페이지</h2>
      <ImagePreview>
        <Img src={item.image} alt={item.name} />
      </ImagePreview>
      <Name>{item.name}</Name>
      <Script>{getCategoryLabel(item.category)}</Script>
      <Script>{item.seasons.join(", ")} 옷</Script>
      <Script>총 {item.wearCount}번 입었어요!</Script>
      <Buttons>
        <DeleteButton onClick={handleDeleteClick}>옷 삭제하기</DeleteButton>
        <BackButton onClick={handleBackClick}>뒤로가기</BackButton>
      </Buttons>
    </div>
  );
};

export default DetailPage;

const ClothesImage = styled.div``;

const ImagePreview = styled.div`
  width: 300px;
  height: 400px;
  border: 2px dashed #ccc;
  display: flex;
  justify-content: center;
  justify-self: center;
  align-items: center;
  font-size: 18px;
  border-radius: 10px;
  overflow: hidden;
`;

const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Name = styled.h3``;

const Script = styled.p``;

const Buttons = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
`;

const DeleteButton = styled.button`
  padding: 8px 18px;
  background: #880000;
  color: white;
  border: 1px solid #770000;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-top: 6px;

  &:hover {
    background: #800000;
  }
`;

const BackButton = styled.button`
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
