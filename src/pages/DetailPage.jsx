import styled from "styled-components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

const DetailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const handleBackClick = () => {
    navigate(-1); //스택에서 pop (=이전 페이지로 이동)
  };

  //TODO: id에 해당하는 옷 정보 받아오기 (DB연동?)
  //TODO: 옷 삭제 구현 후 DB업데이트?
  //TODO: 디자인 보충

  return (
    <div>
      <h2>상세 페이지</h2>
      <p>옷 사진</p>
      <p>이름</p>
      <p>카테고리</p>
      <p>계절</p>
      <p>입은 횟수</p>
      <Buttons>
        <DeleteButton>옷 삭제하기</DeleteButton>
        <BackButton onClick={handleBackClick}>뒤로가기</BackButton>
      </Buttons>
    </div>
  );
};

export default DetailPage;

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
