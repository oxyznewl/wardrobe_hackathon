import styled from "styled-components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ClosetFilters from "../components/ClosetFilters";
import ClothesList from "../components/ClothesList";

const ClosetPage = () => {
  const navigate = useNavigate();

  //ClosetFilters, ClothesList에 props로 전달할 값들
  const [selectedSeasons, setSelectedSeasons] = useState([]); //선택된 계절(들)
  const [sort, setSort] = useState("newest"); // 선택된 정렬기준
  const [category, setCategory] = useState("all"); //선택된 카테고리

  return (
    <main>
      <TopBar>
        <LeftHeader>
          Closet
          <TooltipWrapper>
            <TooltipButton>?</TooltipButton>
            <TooltipBox>
              종류와 정렬에 따라 옷장을 확인하고, 새 옷을 등록할 수 있습니다.
            </TooltipBox>
          </TooltipWrapper>
          <InsertButton onClick={() => navigate("/insert")}>
            새 옷 등록하기
          </InsertButton>
        </LeftHeader>

        <h5>
          <ClosetFilters
            selectedSeasons={selectedSeasons}
            onSeasonChange={setSelectedSeasons}
            sort={sort}
            onSortChange={setSort}
            category={category}
            onCategoryChange={setCategory}
          ></ClosetFilters>
        </h5>
        <IntroButton onClick={() => navigate("/")}>HOME →</IntroButton>
      </TopBar>
      <ClothesList
        seasons={selectedSeasons}
        category={category}
        sort={sort}
      ></ClothesList>
    </main>
  );
};

export default ClosetPage;

const LeftHeader = styled.h2`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 30px;
  margin: 0;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  position: sticky;
`;

const InsertButton = styled.button`
  padding: 8px 18px;
  background: #6d4a2a;
  color: white;
  border: 1px solid #6d4a2a;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-top: 6px;
  margin-left: 12px;

  &:hover {
    background: #8c633d;
  }
`;

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const TooltipButton = styled.button`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #e5d8c7;
  border: none;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  color: #6d4a2a;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #d4c4b0;
  }
`;

const TooltipBox = styled.div`
  display: none;
  position: absolute;
  left: 28px;
  top: 50%;
  transform: translateY(-50%);
  background: #f7f7f7;
  border: 1px solid #ddd;
  padding: 8px 12px;
  border-radius: 6px;
  white-space: nowrap;
  font-size: 13px;
  color: #333;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.05);

  ${TooltipWrapper}:hover & {
    display: block;
  }
`;

const IntroButton = styled.button`
  padding: 8px 16px;
  background: #f4efe9;
  color: #6d4a2a;
  border: 1px solid #e5d8c7;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: #e5d8c7;
    color: #4a3b2f;
  }
`;
