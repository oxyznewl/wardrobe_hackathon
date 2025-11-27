import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const ClothesCard = ({ id, item, image }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/detail?id=${id}`);
  };

  //TODO: 이미지 표시하기
  //TODO: 디자인 보충하기

  return (
    <Div onClick={handleCardClick}>
      <p>{item}</p>
    </Div>
  );
};

export default ClothesCard;

const Div = styled.div`
  width: 150px;
  height: 200px;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  margin: 10px;
`;
