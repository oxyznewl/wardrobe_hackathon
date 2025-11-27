import styled from "styled-components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ClosetFilters from "../components/ClosetFilters";
import { useSearchParams } from "react-router-dom";
import ClothesList from "../components/ClothesList";

const ClosetPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  //ClosetFilters, ClothesList에 props로 전달할 값들
  const [selectedSeasons, setSelectedSeasons] = useState([]); //선택된 계절(들)
  const [sort, setSort] = useState("newest"); // 선택된 정렬기준
  const category = searchParams.get("type"); //선택된 카테고리

  //TODO: 분류 불안정한 거 약간 손보기(맨 처음 closet 진입 시 'all'로 설정 등)

  return (
    <main>
      <TopBar>
        <LeftHeader>
          Closet
          <TooltipWrapper>
            <TooltipButton>?</TooltipButton>
            <TooltipBox>
              종류와 정렬에 따라 옷장을 확인할 수 있습니다.
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
          ></ClosetFilters>
        </h5>
        <IntroButton onClick={() => navigate("/")}>HOME →</IntroButton>
      </TopBar>
      <p>카테고리별 옷 목록, 필터, 검색 기능</p>
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

  &:hover {
    background: #8c633d;
  }
`;

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const TooltipButton = styled.button`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #e5e5e5;
  border: 1px solid #ccc;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  color: #333;
  padding: 0;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;

  &:hover {
    background: #d5d5d5;
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
