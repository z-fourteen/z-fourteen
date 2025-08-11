import { useState, useEffect } from "react";
import {Routes, Route} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import StudyPage from "./pages/StudyPage";
import ThoughtsPage from "./pages/ThoughtsPage";
import "./index.css";

function App() {
  const [isLanding, setIsLanding] = useState(true);

  // 滚动切换到主页
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsLanding(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {isLanding ? (
        <LandingPage onEnter={() => setIsLanding(false)} />
      ) : (
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/study" element={<StudyPage />} />
          <Route path="/thoughts" element={<ThoughtsPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      )}
    </>
  );
}

export default App;
