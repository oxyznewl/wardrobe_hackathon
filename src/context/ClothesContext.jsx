import { createContext, useState, useEffect, useContext } from "react";

// 1. Context 생성
export const ClothesContext = createContext();

// 2. Provider 컴포넌트
export const ClothesProvider = ({ children }) => {
  const [clothes, setClothes] = useState(() => {
    const savedClothes = localStorage.getItem("myClothesData");
    // 저장된 게 있으면 그거 쓰고, 없으면 기본 샘플 데이터 사용
    return savedClothes
      ? JSON.parse(savedClothes)
      : [
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
        ];
  });

  useEffect(() => {
    localStorage.setItem("myClothesData", JSON.stringify(clothes));
  }, [clothes]);

  // 3. 새 옷 추가
  const addClothes = async (newCloth) => {
    //이미지
    let base64Image = "";
    // 이미지가 File 객체일 때만 변환
    if (newCloth.image instanceof File) {
      base64Image = await convertFileToBase64(newCloth.image);
    } else {
      base64Image = newCloth.image; // 이미 base64면 그대로
    }

    // id 자동 생성: 현재 가장 큰 id + 1
    const newId =
      clothes.length > 0 ? Math.max(...clothes.map((c) => c.id)) + 1 : 1;

    setClothes([
      ...clothes,
      {
        id: newId,
        wearCount: 0,
        ...newCloth,
        image: base64Image, // 최종 저장은 base64로
      },
    ]);
  };

  //수정 기능 추가
  const updateClothes = async (id, updatedData) => {
    let base64Image = "";

    // 이미지 변환
    if (updatedData.image instanceof File) {
      base64Image = await convertFileToBase64(updatedData.image);
    } else {
      base64Image = updatedData.image;
    }

    setClothes((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updatedData, image: base64Image } : item
      )
    );
  };

  // 파일을 Base64로 변환하는 유틸 함수 추가
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 4. 옷 삭제
  const removeClothes = (id) => {
    setClothes(clothes.filter((c) => c.id !== id));
  };

  // 5. 착용횟수 증가
  const incrementWearCount = (id) => {
    setClothes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, wearCount: c.wearCount + 1 } : c))
    );
  };

  // 6. 착용횟수 감소 (여기가 핵심!)
  const decrementWearCount = (id) => {
    setClothes((prev) =>
      prev.map((c) => {
        // ID가 같은지 확인 (숫자/문자 타입 안전하게 비교)
        if (Number(c.id) === Number(id)) {
          console.log(
            `[감소 적용] ${c.name}: ${c.wearCount} -> ${Math.max(
              0,
              c.wearCount - 1
            )}`
          );
          return { ...c, wearCount: Math.max(0, c.wearCount - 1) };
        }
        return c;
      })
    );
  };

  return (
    <ClothesContext.Provider
      value={{
        clothes,
        addClothes,
        removeClothes,
        updateClothes,
        incrementWearCount,
        decrementWearCount,
      }}
    >
      {children}
    </ClothesContext.Provider>
  );
};
