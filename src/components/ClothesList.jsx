import ClothesCard from "./ClothesCard";
import styled from "styled-components";
import { useContext } from "react";
import { ClothesContext } from "../context/ClothesContext";

const ClothesList = ({ seasons, category, sort, onItemClick }) => {
  const { clothes } = useContext(ClothesContext);

  // 필터링
  const filtered = clothes
    .filter((item) => {
      // 카테고리 필터
      if (category !== "all" && item.category !== category) return false;

      // 계절 필터
      if (seasons.length > 0) {
        const overlap = item.seasons.some((s) => seasons.includes(s));
        if (!overlap) return false;
      }

      return true;
    })

    //정렬
    .sort((a, b) => {
      switch (sort) {
        case "newest": // 최신순
          return b.id - a.id;
        case "oldest": // 오래된순
          return a.id - b.id;
        case "most": // 자주 입은 순
          return b.wearCount - a.wearCount;
        case "least": // 드물게 입은 순
          return a.wearCount - b.wearCount;
        default:
          return 0;
      }
    });

  return (
    <>
      {clothes.length === 0 ? (
        <h3>옷이 없습니다. 옷장에 옷을 추가해보세요.</h3>
      ) : (
        <Grid>
          {filtered.map((item) => (
            <ClothesCard
              id={item.id}
              item={item.name}
              image={item.image}
              onClick={onItemClick ? () => onItemClick(item) : undefined}
            />
          ))}
        </Grid>
      )}
    </>
  );
};

export default ClothesList;

// 스타일
const Grid = styled.div`
  display: grid;
  gap: 40px;
  padding: 20px;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
`;
