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

  return (
    <div>
      <h2>상세 페이지</h2>
      <p>옷 사진</p>
      <p>이름</p>
      <p>카테고리</p>
      <p>계절</p>
      <button>옷 삭제하기</button>
      <button onClick={handleBackClick}>뒤로가기</button>
    </div>
  );
};
export default DetailPage;
