import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const ClothesCard = ({ id, item, image, onClick }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (onClick) {
      // 페이지 이동 대신, 선택된 정보를 부모에게 넘겨줌
      onClick({ id, name: item, image });
    } else {
      // 상세 페이지로 이동
      navigate(`/detail?id=${id}`);
    }
  };

  return (
    <Div onClick={handleCardClick}>
      <Title>{item}</Title>
      <ImagePreview>
        <Img src={image} />
      </ImagePreview>
    </Div>
  );
};

export default ClothesCard;

const Div = styled.div`
  width: 150px;
  height: 200px;

  padding: 15px;
  font-size: 15px;
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
`;

const Title = styled.div``;

const ImagePreview = styled.div`
  margin-top: 10px;
  width: 120px;
  height: 160px;
  border: 2px dashed #ccc;
  display: flex;
  justify-content: center;
  justify-self: center;
  align-items: center;
  font-size: 18px;
  border-radius: 10px;
  overflow: hidden;
`;

const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
