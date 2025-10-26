import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import AvailableSlots from "./components/AvailableSlots";
import JugyoManager from "./components/JugyoManager"
import Timetable from "./components/Timetable"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./pages/ProtectedRoute";



export default function App() {
  const [showAvailable, setShowAvailable] = useState(false);
  const terms = ["通年","第１","第３","第４","第２"]
  return (
    <BrowserRouter>
      <Routes>
	<Route path="/" element={<LoginPage />} />
	<Route
	  path="/timetable"
	  element={
            <ProtectedRoute>
              <Timetable year={2025} termName="第１" />
            </ProtectedRoute>
	  }
	/>
      </Routes>
    </BrowserRouter>
  );
}

