import { useMemo } from "react";

// 달력 계산 함수 (건들지 않음)
const createMonthMatrix = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const startWeekDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
};

// 3. props에서 불필요한 것(onClickDate, outfitsByDate) 제거
const Calendar = ({ year, month, onClickDate, outfits }) => {
  const weeks = useMemo(() => createMonthMatrix(year, month), [year, month]);

  const today = new Date();
  const todayKey =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

  const getDateKey = (d) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(
      2,
      "0"
    )}`;

  return (
    <table
      style={{
        borderCollapse: "collapse",
        width: "100%",
        background: "#fdfaf5",
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: "0 10px 20px rgba(0,0,0,0.06), 0 20px 40px rgba(0,0,0,0.05)",
      }}
    >
      <thead>
        <tr>
          {["일", "월", "화", "수", "목", "금", "토"].map((dow, index) => (
            <th
              key={dow}
              style={{
                padding: "10px 0",
                background: "#E1D5C7",
                fontWeight: "600",
                borderBottom: "1px solid #ddd",
                borderRight: "1px solid #ffffff",
                color:
                  index === 0 ? "#d9534f" : index === 6 ? "#0275d8" : "#333",
              }}
            >
              {dow}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {weeks.map((week, wi) => (
          <tr key={wi}>
            {week.map((d, di) => {
              if (!d)
                return (
                  <td
                    key={di}
                    style={{
                      height: "70px",
                      border: "1px solid #f1e6da",
                      background: "#fafafa",
                    }}
                  ></td>
                );

              const key = getDateKey(d);
              // 6. Context 데이터(outfits)에 해당 날짜 기록이 있는지 확인
              const hasOutfit = outfits && !!outfits[key];
              const isToday = key === todayKey;

              return (
                <td
                  key={di}
                  // 7. 클릭 이벤트 연결 (navigate 사용)
                  onClick={() => onClickDate(key)}
                  style={{
                    height: "70px",
                    border: "1px solid #eee",
                    verticalAlign: "top",
                    cursor: "pointer",
                    background: isToday ? "#f8e9e1ff" : "white",
                    padding: "6px",
                    transition: "0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f4dccdff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = isToday
                      ? "#f8e9e1ff"
                      : "white")
                  }
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      marginBottom: "4px",
                    }}
                  >
                    {d}
                  </div>

                  {/* 기록이 있는 날짜 표시용 동그라미 점 */}
                  {hasOutfit && (
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        background: "#6d4a2a",
                        borderRadius: "50%",
                        marginTop: "3px",
                      }}
                    ></div>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Calendar;
