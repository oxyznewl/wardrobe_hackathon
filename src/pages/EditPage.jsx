import styled from "styled-components";
import { useState, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ClothesContext } from "../context/ClothesContext";

const EditPage = () => {
  const navigate = useNavigate();
  const { clothes, updateClothes } = useContext(ClothesContext);

  const [searchParams] = useSearchParams();
  const id = Number(searchParams.get("id"));

  // 수정 대상 아이템 찾기
  const item = clothes.find((c) => c.id === id);

  // 초기 값 세팅
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState(item.category);
  const [type, setType] = useState(item.type);
  const [selectedSeasons, setSelectedSeasons] = useState(item.seasons);
  const [image, setImage] = useState(
    item.image
      ? typeof item.image === "string"
        ? { file: null, preview: item.image } // base64 문자열이면 preview로만 사용
        : { file: item.image, preview: URL.createObjectURL(item.image) }
      : null
  );

  const CATEGORIES = [
    { label: "카테고리 선택", value: "" },
    { label: "상의", value: "top" },
    { label: "하의", value: "bottom" },
  ];
  const SEASONS = ["봄", "여름", "가을", "겨울"];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setImage({ file, preview });
  };

  const toggleSeason = (season) => {
    setSelectedSeasons((prev) =>
      prev.includes(season)
        ? prev.filter((s) => s !== season)
        : [...prev, season]
    );
  };

  const handleCancel = () => {
    if (window.confirm("수정을 취소하시겠습니까?")) navigate(-1);
  };

  const handleSubmit = () => {
    if (!name) return alert("이름을 입력해주세요.");
    if (!category || category === "카테고리 선택")
      return alert("카테고리를 선택해주세요.");
    if (selectedSeasons.length === 0)
      return alert("계절을 하나 이상 선택해주세요.");

    updateClothes(id, {
      name,
      category,
      type,
      seasons: selectedSeasons,
      image: image?.file ?? item.image,
    });

    alert("수정되었습니다.");
    navigate("/closet");
  };

  return (
    <InputBox>
      <h2>옷 정보 수정하기</h2>

      <ImageInputWrapper>
        <label htmlFor="edit_file">
          <ImagePreview>
            {image ? <Img src={image.preview} /> : "이미지 업로드"}
          </ImagePreview>
        </label>
        <ImageInput
          type="file"
          id="edit_file"
          accept="image/*"
          onChange={handleImageChange}
        />
      </ImageInputWrapper>

      <Name value={name} onChange={(e) => setName(e.target.value)} />

      <Select value={category} onChange={(e) => setCategory(e.target.value)}>
        {CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </Select>

      <Name value={type} onChange={(e) => setType(e.target.value)} />

      <Option>
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
        <CancelButton onClick={handleCancel}>취소</CancelButton>
        <InsertButton onClick={handleSubmit}>수정</InsertButton>
      </ButtonContainer>
    </InputBox>
  );
};

export default EditPage;

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
