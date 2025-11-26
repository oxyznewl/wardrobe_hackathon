import { useNavigate } from "react-router-dom";
import styled from "styled-components";

function IntroPage() {
  const navigate = useNavigate();

  return (
    <Wrapper>
      <Title>개인 옷장 관리 시스템</Title>
      <Subtitle>
        캘린더 · 통계 · 옷장을 통해 나만의 코디를 기록해보세요
      </Subtitle>

      <ButtonContainer>
        <MenuButton onClick={() => navigate("/calendar")}>📅 캘린더</MenuButton>

        <MenuButton onClick={() => navigate("/stats")}>📊 옷 통계</MenuButton>

        <MenuButton onClick={() => navigate("/closet")}>
          👚 옷장 관리
        </MenuButton>
      </ButtonContainer>
    </Wrapper>
  );
}

export default IntroPage;

const Wrapper = styled.main`
  text-align: center;
  padding: 60px 20px;
  font-family: "Gowun Dodum", sans-serif;
  color: #4a3422;
`;

const Title = styled.h1`
  font-size: 36px;
  margin-bottom: 10px;
  font-weight: 700;
  color: #3a2b1c;
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: #6d5a46;
  margin-bottom: 40px;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 320px;
  margin: 0 auto;
`;

const MenuButton = styled.button`
  padding: 18px;
  font-size: 18px;
  background: #fffdf8;
  border-radius: 14px;
  border: 1px solid #e5d8c7;
  cursor: pointer;
  transition: 0.2s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);

  &:hover {
    background: #f8f1e6;
    transform: translateY(-4px);
  }

  &:active {
    transform: translateY(-1px);
  }
`;
