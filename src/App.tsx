import { useEffect, useState} from "react";
import { supabase } from "./lib/supabaseClient";
//import AvailableSlots from "./components/AvailableSlots";
//import JugyoManager from "./components/JugyoManager"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {Tabs, Tab, Box} from "@mui/material";
import Timetable from "./components/Timetable"
import JugyoManager from "./components/JugyoManager"
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./pages/ProtectedRoute";
import KamokuManager from "./components/KamokuManager"
import AvailableSlots from "./components/AvailableSlots"
import TeacherManager from "./components/TeacherManager"
//import TermDaysManager from "./components/TermDaysManager.tsx"
import TermManagerPage from "./components/TermManagerPage.tsx"

export default function App() {
  //const [showAvailable, setShowAvailable] = useState(false);
  const terms = ["第１","第３","第４","通年","第２"]
  const [tab, setTab] = useState(0);
  const [jugyos, setJugyos] = useState<any[]>([]);
  //const [year, setYear] = useState<number>(2026);
  const year = 2026;

  const fetchJugyos = async () => {
    const { data, error } = await supabase
      .from("jugyos")
      .select(`id, year, term_id, wday_id, period, exception, kaisuu, teachers ( id, fname, gname ),kamokus ( id, name,level ), terms (id, name), wdays (id, name)`)
      .eq("year",year)
      .order("term_id")
    if (error) console.error(error);
    else {
      const sortedJugyos = (data || []).slice().sort((a, b) => {
	// 1. level（昇順）
	if ((a as any).kamokus.level !== (b as any).kamokus.level) {
	  return (a as any).kamokus.level - (b as any).kamokus.level;
	}

	// 2. hisshu（true を上位）
	const ha = !!(a as any).kamokus?.hisshu;
	const hb = !!(b as any).kamokus?.hisshu;
	if (ha !== hb) {
	  return ha ? -1 : 1;
	}
	
	// 3. id（昇順）
	return (a as any).kamokus.id - (b as any).kamokus.id;
      });
      setJugyos(sortedJugyos);
    }
  };
  
  
  useEffect(() => {
    fetchJugyos();
  }, []);

  const availables = [];
  for (let level of [1,2,3,4]){
    for (let term of terms){
      availables.push(<AvailableSlots key={"aki"+level+"-"+term}year={2026} level={level} term={term}/>)
    }
  }
  
  return (
    <BrowserRouter>
    <Routes>
    <Route path="/" element={<LoginPage />} />
    <Route
	  path="/timetable"
	  element={
            <ProtectedRoute>
	      <Box sx={{ width: "100%" }}>
		<Tabs
		  value={tab}
		  onChange={(_, newValue) => setTab(newValue)}
		  centered
		  textColor="primary"
		  indicatorColor="primary"
		>
		  <Tab label="授業" />
		  <Tab label="時間割" />
		  <Tab label="科目" />
		  <Tab label="禁則表" />
		  <Tab label="教員" />
		  <Tab label="ターム" />
		</Tabs>

		<Box sx={{ mt: 2 }}>
	    {tab === 0 && <JugyoManager jugyos={jugyos} fetchJugyos={fetchJugyos}/>}
	    {tab === 1 &&
	     terms.map((term) => <Timetable
				   jugyos={jugyos} fetchJugyos={fetchJugyos}
				   key={"timetable"+2006+"-"+term} year={year} termName={term} />)
	    }
	    {tab === 2 && <KamokuManager/>}
	    {tab === 3 && availables}
	    {tab === 4 && <TeacherManager year={year}/>}
	    {tab === 5 && <TermManagerPage />}
	    </Box>
	    </Box>
	    {}
            </ProtectedRoute>
	  }
	/>
      </Routes>
    </BrowserRouter>
  );
}

