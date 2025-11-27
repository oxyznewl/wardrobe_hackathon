import "./App.css";
import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import IntroPage from "./pages/IntroPage";
import CalendarPage from "./pages/CalendarPage";
import TodayOutfitPage from "./pages/TodayOutfitPage";
import StatsPage from "./pages/StatsPage";
import ClosetPage from "./pages/ClosetPage";
import InsertPage from "./pages/InsertPage";
import DetailPage from "./pages/DetailPage";

function App() {
  const [outfitsByDate, setOutfitsByDate] = useState({});

  const saveOutfit = (dateKey, outfitData) => {
    setOutfitsByDate((prev) => ({
      ...prev,
      [dateKey]: outfitData,
    }));
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      {/* 상단 간단 네비게이션(선택사항) 
      <header style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <Link to="/">인트로</Link>
        <Link to="/calendar">캘린더</Link>
        <Link to="/stats">옷 통계</Link>
        <Link to="/closet">옷장</Link>
      </header>*/}

      <Routes>
        <Route path="/" element={<IntroPage />} />
        <Route
          path="/calendar"
          element={
            <CalendarPage
              outfitsByDate={outfitsByDate}
              onSaveOutfit={saveOutfit}
            />
          }
        />
        <Route
          path="/today"
          element={<TodayOutfitPage onSaveOutfit={saveOutfit} />}
        />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/closet" element={<ClosetPage />} />
        <Route path="/insert" element={<InsertPage />} />
        <Route path="/detail" element={<DetailPage />} />
      </Routes>
    </div>
  );
}

export default App;
