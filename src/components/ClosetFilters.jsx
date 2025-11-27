import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const ClosetFilters = ({
  onSeasonChange,
  onCategoryChange,
  onSortChange,
  hideCategory,
}) => {
  const navigate = useNavigate();

  const [selectedSeasons, setSelectedSeasons] = useState([]);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");

  const SEASONS = ["봄", "여름", "가을", "겨울"]; // 중복 선택 가능
  const CATEGORIES = [
    //단일 선택
    { value: "all", label: "카테고리 선택" },
    { value: "top", label: "상의" },
    { value: "bottom", label: "하의" },
  ];
  const SORT_OPTIONS = [
    { value: "newest", label: "최신순" },
    { value: "oldest", label: "오래된순" },
    { value: "most", label: "자주 입는 순" },
    { value: "least", label: "드물게 입는 순" },
  ];

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

  const handleCategory = (e) => {
    navigate(`/closet?type=${e.target.value}`);
    setCategory(e.target.value);
    onCategoryChange(e.target.value);
  };

  const handleSort = (e) => {
    setSort(e.target.value);
    onSortChange(e.target.value);
  };

  return (
    <div className="header-filters">
      {/* 계절 */}
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

      <Option>
        {/* 카테고리 */}
        {!hideCategory && (
          <Select value={category} onChange={handleCategory}>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </Select>
        )}

        {/* 정렬 */}
        <Select value={sort} onChange={handleSort}>
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </Option>
    </div>
  );
};
export default ClosetFilters;

const Option = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const Select = styled.select`
  gap: 10px;
  background: #6d4a2a;
  color: white;
  border-radius: 10px;

  &:hover {
    background: #8c633d;
  }
`;
