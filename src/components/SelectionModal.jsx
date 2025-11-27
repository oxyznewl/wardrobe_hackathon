import styled from "styled-components";
import { useState, useEffect } from "react";
import ClothesList from "./ClothesList";
import ClosetFilters from "./ClosetFilters";

const SelectionModal = ({ isOpen, onClose, target, onConfirm }) => {
  // 1. 모달 내부 상태 관리
  const [view, setView] = useState("list"); // 'list' 또는 'detail'
  const [selectedItem, setSelectedItem] = useState(null); // 선택된 옷 정보

  // 필터 상태 (모달 안에서만 작동)
  const [selectedSeasons, setSelectedSeasons] = useState([]);
  const [sort, setSort] = useState("newest");
  const [category, setCategory] = useState("all");

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setView("list");
      setSelectedItem(null);
      // 타겟(상의/하의)에 따라 초기 카테고리 설정
      setCategory(
        target === "top" ? "top" : target === "bottom" ? "bottom" : "all"
      );
    }
  }, [isOpen, target]);

  if (!isOpen) return null;

  // 2. 옷 리스트에서 옷을 클릭했을 때 (상세화면으로 이동)
  const handleItemClick = (item) => {
    setSelectedItem(item);
    setView("detail"); // 뷰 변경 -> 상세 페이지 보여줌
  };

  // 3. 상세 화면에서 [목록] 버튼 눌렀을 때
  const handleBackToList = () => {
    setSelectedItem(null);
    setView("list");
  };

  // 4. 상세 화면에서 [추가] 버튼 눌렀을 때
  const handleConfirm = () => {
    onConfirm(selectedItem); // 부모(TodayOutfitPage)에게 선택된 옷 전달
    onClose(); // 모달 닫기
  };

  return (
    <ModalOverlay>
      <ModalContent>
        {/* === 뷰 1: 옷 리스트 화면 === */}
        {view === "list" && (
          <>
            <Header>
              <Title>{target === "top" ? "상의" : "하의"} 선택하기</Title>
              <CloseButton onClick={onClose}>&times;</CloseButton>
            </Header>

            {/* 필터 컴포넌트 재사용 */}
            <FilterWrapper>
              <ClosetFilters
                onSeasonChange={setSelectedSeasons}
                //onCategoryChange={setCategory}
                onCategoryChange={() => {}}
                onSortChange={setSort}
                hideCategory={true}
              />
            </FilterWrapper>

            {/* 옷 리스트 컴포넌트 재사용 */}
            <ListWrapper>
              <ClothesList
                seasons={selectedSeasons}
                category={target} // 모달 내부 state 사용
                sort={sort}
                onItemClick={handleItemClick} // 클릭 시 상세 화면으로 이동
              />
            </ListWrapper>
          </>
        )}

        {/* === 뷰 2: 상세 정보 화면 (그려주신 그림의 오른쪽) === */}
        {view === "detail" && selectedItem && (
          <DetailView>
            <Header>
              <Title>상세 정보</Title>
            </Header>

            <DetailBody>
              {/* 이미지 영역 (없으면 회색 박스) */}
              <DetailImageWrapper>
                {selectedItem.image ? (
                  <DetailImage
                    src={selectedItem.image}
                    alt={selectedItem.name}
                  />
                ) : (
                  <NoImage>이미지 없음</NoImage>
                )}
              </DetailImageWrapper>

              {/* 정보 영역 */}
              <DetailInfo>
                <InfoName>{selectedItem.name}</InfoName>

                <TagContainer>
                  <Tag>{selectedItem.category === "top" ? "상의" : "하의"}</Tag>
                  <Tag>{selectedItem.seasons.join(", ")}</Tag>
                </TagContainer>

                <WearCount>
                  총 {selectedItem.wearCount || 0}번 입었어요
                </WearCount>
              </DetailInfo>
            </DetailBody>

            <ButtonGroup>
              <SecondaryButton onClick={handleBackToList}>목록</SecondaryButton>
              <PrimaryButton onClick={handleConfirm}>추가</PrimaryButton>
            </ButtonGroup>
          </DetailView>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default SelectionModal;

// --- 스타일 컴포넌트 ---
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  width: 600px;
  height: 500px; /* 넉넉한 사이즈 */
  background: #fffdf8;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  position: relative;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  margin: 0;
  color: #48321d;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #888;
`;

const FilterWrapper = styled.div`
  margin-bottom: 16px;
  /* ClosetFilters 스타일 조정이 필요하면 여기서 오버라이딩 */
`;

const ListWrapper = styled.div`
  flex: 1;
  overflow-y: auto; /* 리스트만 스크롤 되게 */
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px;
`;

// -- 상세 화면 스타일 --
const DetailView = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const DetailImageWrapper = styled.div`
  width: 180px;
  height: 220px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DetailImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DetailInfo = styled.div`
  text-align: center;
`;

const ButtonGroup = styled.div`
  width: 100%;
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const PrimaryButton = styled.button`
  flex: 1;
  padding: 10px 0;
  border-radius: 8px;
  border: none;
  background: #8b6f4e;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: 0.2s;

  &:hover {
    background: #7a5e3d;
  }
`;

const SecondaryButton = styled.button`
  flex: 1;
  padding: 10px 0;
  border-radius: 8px;
  border: 1px solid #ccc;
  background: white;
  color: #333;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: 0.2s;

  &:hover {
    background: #f5f5f5;
  }
`;

const DetailBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
`;

const NoImage = styled.div`
  color: #aaa;
`;

const InfoName = styled.h3`
  font-size: 20px;
  margin: 0 0 10px 0;
  color: #3c2a1b;
  font-weight: 700;
`;

const TagContainer = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 12px;
`;

const Tag = styled.span`
  background: #e0d4c6;
  color: #5a4a3a;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 14px;
  font-weight: 500;
`;

const WearCount = styled.p`
  color: #666;
  font-size: 16px;
  margin: 0;
`;
