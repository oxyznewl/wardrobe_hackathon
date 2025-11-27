import styled from "styled-components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

const InsertPage = ({ onCategoryChange, onSeasonChange }) => {
  const [category, setCategory] = useState("");
  const [selectedSeasons, setSelectedSeasons] = useState([]);

  const CATEGORIES = ["카테고리 선택", "상의", "하의"];
  const SEASONS = ["봄", "여름", "가을", "겨울"];

  const handleCategory = (e) => {
    setCategory(e.target.value);
    onCategoryChange(e.target.value);
  };

  const toggleSeason = (season) => {
    let updated;
    if (selectedSeasons.includes(season)) {
      updated = selectedSeasons.filter((s) => s !== season);
    } else {
      updated = [...selectedSeasons, season];
    }
    setSelectedSeasons(updated);
    onSeasonChange(updated);
  };

  const navigate = useNavigate();

  const image_preview = useRef();
  const image_input = useRef();

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "image") {
      const imgURL = URL.createObjectURL(e.target.files[0]);
      image_input.current.setAttribute("style", "display: none;");
      image_preview.current.setAttribute("style", "display: flex");
      image_preview.current.children[0].setAttribute("src", imgURL);
    }
  }
  return (
    <InputBox>
      <h2>새 옷 등록하기</h2>
      <ImageInputWrapper>
        <label htmlFor="input_file">
          <ImagePreview ref={image_input} className="image_file">
            이미지 업로드
          </ImagePreview>
          <ImagePreview
            ref={image_preview}
            className="image_preview"
            style={{ display: "none" }}
          >
            <Img src=""></Img>
          </ImagePreview>
        </label>
        <ImageInput
          type="file"
          name="image"
          id="input_file"
          accept="image/*"
          onChange={handleChange}
        />
      </ImageInputWrapper>
      <Name placeholder="이름"></Name>
      <Select value={category} onChange={handleCategory}>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </Select>
      <Option className="season-checkboxes">
        {SEASONS.map((season) => (
          <label key={season}>
            <input
              type="checkbox"
              checked={selectedSeasons.includes(season)}
              onChange={() => toggleSeason(season)}
            />
            {season}
          </label>
        ))}
      </Option>
      <InsertButton onClick={() => navigate("/closet")}>등록</InsertButton>
    </InputBox>
  );
};
export default InsertPage;

const InputBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const ImageInputWrapper = styled.div`
  justify-self: center;
`;

const ImagePreview = styled.div`
  width: 300px;
  height: 400px;
  border: 2px dashed #ccc;
  display: flex;
  justify-content: center;
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

const ImageInput = styled.input`
  display: none;
`;

const Name = styled.input`
  width: 100px;
  height: 20px;
  text-align: center;
  margin-top: 10px;
`;

const Select = styled.select`
  gap: 10px;
  color: #6d4a2a;
  border-radius: 2px;
`;

const Option = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const InsertButton = styled.button`
  padding: 8px 18px;
  background: #6d4a2a;
  color: white;
  border: 1px solid #6d4a2a;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-top: 6px;

  &:hover {
    background: #8c633d;
  }
`;
