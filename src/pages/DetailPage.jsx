import styled from "styled-components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const DetailPage = () => {
  const navigate = useNavigate();

  return (
    <main>
      <h1>상세페이지</h1>
      <p>옷 사진</p>
      <p>이름</p>
      <p>카테고리</p>
      <p>계절</p>
      <button>옷 삭제하기</button>
      <button>뒤로가기</button>
    </main>
  );
};
export default DetailPage;
