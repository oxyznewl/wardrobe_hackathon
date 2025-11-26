import { createContext, useState, useEffect, useContext } from "react";

const OutfitContext = createContext();

export function OutfitProvider({ children }) {
  // 1. 초기값을 LocalStorage에서 가져오기 (없으면 빈 객체)
  const [outfits, setOutfits] = useState(() => {
    const savedOutfits = localStorage.getItem("myClosetData");
    return savedOutfits ? JSON.parse(savedOutfits) : {};
  });

  // 2. outfits 상태가 바뀔 때마다 LocalStorage에 자동 저장
  useEffect(() => {
    localStorage.setItem("myClosetData", JSON.stringify(outfits));
  }, [outfits]);

  // 옷 정보 저장 함수 (날짜를 키로 사용)
  const saveOutfit = (date, data) => {
    setOutfits((prev) => ({
      ...prev,
      [date]: data, // 예: "2023-10-27": { top: 't-shirt', bottom: 'jeans' }
    }));
  };

  // 특정 날짜의 옷 정보 가져오기
  const getOutfit = (date) => {
    return outfits[date] || null;
  };

  return (
    <OutfitContext.Provider value={{ outfits, saveOutfit, getOutfit }}>
      {children}
    </OutfitContext.Provider>
  );
}

// 컴포넌트에서 쉽게 쓰기 위한 커스텀 Hook
export function useOutfit() {
  return useContext(OutfitContext);
}
