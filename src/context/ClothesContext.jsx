import { createContext, useState, useEffect, useContext } from "react";

// 1. Context 생성
export const ClothesContext = createContext();

// 2. Provider 컴포넌트
export const ClothesProvider = ({ children }) => {
  const [clothes, setClothes] = useState([
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
  ]);

  // 3. 새 옷 추가
  const addClothes = (newCloth) => {
    // id 자동 생성: 현재 가장 큰 id + 1
    const newId =
      clothes.length > 0 ? Math.max(...clothes.map((c) => c.id)) + 1 : 1;

    setClothes([...clothes, { id: newId, wearCount: 0, ...newCloth }]);
  };

  // 4. 옷 삭제
  const removeClothes = (id) => {
    setClothes(clothes.filter((c) => c.id !== id));
  };

  // 5. 착용횟수 증가
  const incrementWearCount = (id) => {
    setClothes(
      clothes.map((c) =>
        c.id === id ? { ...c, wearCount: c.wearCount + 1 } : c
      )
    );
  };

  return (
    <ClothesContext.Provider
      value={{
        clothes,
        addClothes,
        removeClothes,
        incrementWearCount,
      }}
    >
      {children}
    </ClothesContext.Provider>
  );
};
