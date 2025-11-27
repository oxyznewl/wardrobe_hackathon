import styled from "styled-components";

const ClothesCard = ({ key, item }) => {
  return (
    <Div>
      <p>{key}</p>
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
