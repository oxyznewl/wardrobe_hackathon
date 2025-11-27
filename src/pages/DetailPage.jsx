import styled from "styled-components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

const DetailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const handleDeleteClick = () => {
    const ok = window.confirm("정말로 삭제하시겠습니까?");
    if (ok) {
      // 삭제 로직 실행
      navigate("/closet");
    }
  };

  const handleBackClick = () => {
    navigate(-1); //스택에서 pop (=이전 페이지로 이동)
  };

  //TODO: id에 해당하는 옷 정보 받아오기 (DB연동?)
  //TODO: 옷 삭제 구현 후 DB업데이트?
  //TODO: 삭제 로직 실행 후 목록 페이지로 이동

  return (
    <div>
      <h2>상세 페이지</h2>
      <ClothesImage>옷 사진</ClothesImage>
      <Name>이름</Name>
      <Script>카테고리</Script>
      <Script>계절</Script>
      <Script>총 N번 입었어요!</Script>
      <Buttons>
        <DeleteButton onClick={handleDeleteClick}>옷 삭제하기</DeleteButton>
        <BackButton onClick={handleBackClick}>뒤로가기</BackButton>
      </Buttons>
    </div>
  );
};

export default DetailPage;

const ClothesImage = styled.div``; //div > img로 바꾸기

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
