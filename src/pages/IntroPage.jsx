import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";

function IntroPage() {
  const navigate = useNavigate();

  return (
    <Container>
      <ContentWrapper>
        <Header>
          <Logo>🧥</Logo>
          <Title>나만의 옷장</Title>
          <Subtitle>
            일상을 코디하고 기록하는
            <br />
            스마트한 패션 라이프
          </Subtitle>
        </Header>

        <GridContainer>
          <MenuCard onClick={() => navigate("/calendar")}>
            <IconWrapper>📅</IconWrapper>
            <TextWrapper>
              <CardTitle>캘린더</CardTitle>
              <CardDesc>데일리 코디 기록하기</CardDesc>
            </TextWrapper>
          </MenuCard>

          <MenuCard onClick={() => navigate("/stats")}>
            <IconWrapper>📊</IconWrapper>
            <TextWrapper>
              <CardTitle>옷 통계</CardTitle>
              <CardDesc>취향과 패턴 분석</CardDesc>
            </TextWrapper>
          </MenuCard>

          <MenuCard onClick={() => navigate("/closet")}>
            <IconWrapper>👚</IconWrapper>
            <TextWrapper>
              <CardTitle>옷장 관리</CardTitle>
              <CardDesc>내 옷 한눈에 보기</CardDesc>
            </TextWrapper>
          </MenuCard>
        </GridContainer>
      </ContentWrapper>
    </Container>
  );
}

export default IntroPage;

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components ---

const Container = styled.main`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 420px;
  animation: ${fadeIn} 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 48px;
`;

const Logo = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 800;
  color: #3a2b1c;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: #8c7b6c;
  font-weight: 400;
`;

const GridContainer = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MenuCard = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 6px rgba(74, 52, 34, 0.02),
    0 10px 20px rgba(74, 52, 34, 0.04);
  text-align: left;

  &:hover {
    background: #ffffff;
    transform: translateY(-4px) scale(1.01);
    box-shadow: 0 10px 25px rgba(74, 52, 34, 0.08);
    border-color: #e6dccf;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const IconWrapper = styled.div`
  font-size: 32px;
  margin-right: 20px;
  padding: 12px;
  background: #fdfaf6;
  border-radius: 16px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
`;

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CardTitle = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: #4a3422;
`;

const CardDesc = styled.span`
  font-size: 13px;
  color: #9c8c74;
`;
