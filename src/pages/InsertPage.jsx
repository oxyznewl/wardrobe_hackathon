import styled from "styled-components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { ClothesContext } from "../context/ClothesContext";

const InsertPage = () => {
  const { addClothes } = useContext(ClothesContext);
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
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

  // 취소 버튼 핸들러
  const handleCancelClick = () => {
    if (
      window.confirm(
        "옷 등록을 취소하시겠습니까?\n입력한 내용은 저장되지 않습니다."
      )
    ) {
      navigate(-1);
    }
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
    if (type == "") {
      alert("세부 종류를 입력해주세요.");
      return;
    }
    if (selectedSeasons.length === 0) {
      alert("계절을 하나 이상 선택해주세요.");
      return;
    }

    //등록 로직 실행
    addClothes({
      name,
      category: category === "상의" ? "top" : "bottom",
      type,
      seasons: selectedSeasons,
      wearCount: 0,
      image: image.file,
    });

    alert("등록 되었습니다.");
    navigate("/closet");
  };

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
      <Name
        placeholder="세부 종류"
        value={type}
        onChange={(e) => setType(e.target.value)}
      ></Name>
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

      <ButtonContainer>
        <CancelButton onClick={handleCancelClick}>취소</CancelButton>
        <InsertButton onClick={handleSubmitClick}>등록</InsertButton>
      </ButtonContainer>
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

const ButtonContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 6px;
`;

const InsertButton = styled.button`
  padding: 8px 24px;
  background: #6d4a2a;
  color: white;
  border: 1px solid #6d4a2a;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #8c633d;
  }
`;

const CancelButton = styled.button`
  padding: 8px 24px;
  background: #e0e0e0;
  color: #333;
  border: 1px solid #ccc;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #d0d0d0;
  }
`;
