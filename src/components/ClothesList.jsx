import ClothesCard from "./ClothesCard";
import styled from "styled-components";
import { useEffect, useState } from "react";

const ClothesList = ({ seasons, category, sort }) => {
  const tempClothes = [
    //임시 data
    {
      id: 1,
      name: "흰색 티셔츠",
      category: "top",
      seasons: ["봄", "여름"],
      wearCount: 3,
      image: "",
    },
    {
      id: 2,
      name: "검정 긴바지",
      category: "bottom",
      seasons: ["가을", "겨울"],
      wearCount: 7,
      image: "",
    },
    {
      id: 3,
      name: "린넨 셔츠",
      category: "top",
      seasons: ["여름"],
      wearCount: 1,
      image: "",
    },
    {
      id: 4,
      name: "린넨 셔츠",
      category: "top",
      seasons: ["여름"],
      wearCount: 1,
      image: "",
    },
    {
      id: 5,
      name: "린넨 셔츠",
      category: "top",
      seasons: ["여름"],
      wearCount: 1,
      image: "",
    },
    {
      id: 6,
      name: "린넨 셔츠",
      category: "top",
      seasons: ["여름"],
      wearCount: 1,
      image: "",
    },
  ];

  // 필터링
  const filtered = tempClothes
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
    <Grid>
      {filtered.map((item) => (
        <ClothesCard key={item.id} item={item.name} />
      ))}
    </Grid>
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
