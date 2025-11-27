import styled from "styled-components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const InsertPage = () => {
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState("");
  const [selectedSeasons, setSelectedSeasons] = useState([]);

  const CATEGORIES = ["카테고리 선택", "상의", "하의"];
  const SEASONS = ["봄", "여름", "가을", "겨울"];

  const handleCategory = (e) => {
    setCategory(e.target.value);
  };

  const toggleSeason = (season) => {
    let updated;
    if (selectedSeasons.includes(season)) {
      updated = selectedSeasons.filter((s) => s !== season);
    } else {
      updated = [...selectedSeasons, season];
    }
    setSelectedSeasons(updated);
  };

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setImage({ file, preview });
  };

  const handleSubmitClick = () => {
    if (!image) {
      alert("이미지를 등록해주세요.");
      return;
    }
    if (name === "") {
      alert("이름을 입력해주세요.");
      return;
    }
    if (category === "" || category === "카테고리 선택") {
      alert("카테고리를 선택해주세요.");
      return;
    }
    if (selectedSeasons.length === 0) {
      alert("계절을 하나 이상 선택해주세요.");
      return;
    }

    //등록 로직 실행

    alert("등록 되었습니다.");
    navigate("/closet");
  };

  //TODO: 입력받은 이미지, 이름, 카테고리, 계절 정보 저장해서 새 옷 등록 기능 구현(DB연동하기)

  return (
    <InputBox>
      <h2>새 옷 등록하기</h2>
      <ImageInputWrapper>
        <label htmlFor="input_file">
          <ImagePreview>
            {image ? <Img src={image.preview} /> : "이미지 업로드"}
          </ImagePreview>
        </label>
        <ImageInput
          type="file"
          id="input_file"
          accept="image/*"
          onChange={handleImageChange}
        />
      </ImageInputWrapper>
      <Name
        placeholder="이름"
        value={name}
        onChange={(e) => setName(e.target.value)}
      ></Name>
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
      <InsertButton onClick={handleSubmitClick}>등록</InsertButton>
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
