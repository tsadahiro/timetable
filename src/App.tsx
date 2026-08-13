import { useEffect, useState} from "react";
import { supabase } from "./lib/supabaseClient";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {Tabs, Tab, Box} from "@mui/material";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import Timetable from "./components/Timetable"
import JugyoManager from "./components/JugyoManager"
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./pages/ProtectedRoute";
import KamokuManager from "./components/KamokuManager"
import AvailableSlots from "./components/AvailableSlots"
import TeacherManager from "./components/TeacherManager"
import TermsView from "./components/TermsView"

export default function App() {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [kamokus, setKamokus] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [wdays, setWdays] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  //const [forbiddens, setForbiddens] = useState<any[]>([]);
  
  const termNames = ["第1","第3","第4","通年","第2"]
  const [tab, setTab] = useState(0);
  const [jugyos, setJugyos] = useState<any[]>([]);
  const year = 2026;

  const fetchMaster = async () => {
    const [
      { data: t, error: tError },
      { data: k, error: kError },
      { data: tm, error: tmError },
      { data: w, error: wError },
      { data: d, error: dError },
      //{ data: f, error: fError },
    ] = await Promise.all([
      supabase
	.from("teachers")
	.select("id, fname, gname, fyomi, gyomi, joukin, ref_id, honmuko, department_id")
	.order("joukin", { ascending: false })
	.order("fyomi", { ascending: true }),
      
      supabase
	.from("kamokus")
	.select(`
    *,
    departments (
      id,
      name,
      abbr
    )
	`)
	.order("level", { ascending: true })
	.order("id", { ascending: true }),
      supabase
	.from("terms")
	.select("id, name, year, start, end, abbr, length")
	.order("year", { ascending: false })
	.order("name", { ascending: true }),

      supabase
	.from("wdays")
	.select("id, name")
	.order("id", { ascending: true }),

      supabase
	.from("departments")
	.select("id, faculty_id, name, abbr")
	.order("faculty_id", { ascending: true })
	.order("id", { ascending: true }),

      supabase
	.from("forbiddens")
	.select(`
        id,
        level,
        hisshu,
        sentaku,
        term_id,
        year,
        wday_id,
        period,
        reason,
        shwaku
	`)
	.order("year", { ascending: false })
	.order("term_id", { ascending: true })
	.order("level", { ascending: true })
	.order("wday_id", { ascending: true })
	.order("period", { ascending: true }),
    ]);

    if (tError) console.error("teachers fetch error:", tError);
    if (kError) console.error("kamokus fetch error:", kError);
    if (tmError) console.error("terms fetch error:", tmError);
    if (wError) console.error("wdays fetch error:", wError);
    if (dError) console.error("departments fetch error:", dError);
    //if (fError) console.error("forbiddens fetch error:", fError);

    setTeachers(t || []);
    setKamokus(k || []);
    setTerms(tm || []);
    setWdays(w || []);
    setDepartments(d || []);
    //setForbiddens(f || []);
  };
  
  const fetchJugyos = async () => {
    const { data, error } = await supabase
      .from("jugyos")
      .select(`
      id,
      year,
      term_id,
      department_id,
      teacher_id,
      kamoku_id,
      wday_id,
      period,
      excercise,
      exception,
      notes,
      comment,
      kaisuu,
      teachers (
        id,
        fname,
        gname
      ),
      kamokus (
        id,
        name,
        level,
        hisshu,
        sentakuhi,
        department_id
      ),
      terms (
        id,
        name,
        year
      ),
      wdays (
        id,
        name
      )
      `)
      .eq("year", year)
      .order("term_id");
    if (error) {
      console.error("jugyos fetch error:", error);
      return;
    }

    const sortedJugyos = (data || []).slice().sort((a: any, b: any) => {
      const levelA = a.kamokus?.level ?? 999;
      const levelB = b.kamokus?.level ?? 999;
      if (levelA !== levelB) {
	return levelA - levelB;
      }
      const ha = !!a.kamokus?.hisshu;
      const hb = !!b.kamokus?.hisshu;
      if (ha !== hb) {
	return ha ? -1 : 1;
      }
      const nameA = a.kamokus?.name ?? "";
      const nameB = b.kamokus?.name ?? "";
      const nameCompare = nameA.localeCompare(nameB, "ja");
      if (nameCompare !== 0) {
	return nameCompare;
      }
      const termA = a.terms?.name ?? "";
      const termB = b.terms?.name ?? "";
      return termA.localeCompare(termB, "ja");
    });

    //await fetchJugyos();
    setJugyos(sortedJugyos);
  };

  const handleSaveJugyo = async (jugyo: any, deleted = false) => {
    if (deleted) {
      await fetchJugyos();
      return;
    }

    if (!jugyo) return;

    const cleanData = {
      year: jugyo.year,
      term_id: jugyo.term_id,
      department_id: jugyo.department_id ?? selectedDepartmentId ?? null,
      teacher_id: jugyo.teacher_id,
      kamoku_id: jugyo.kamoku_id,
      wday_id: jugyo.wday_id,
      period: jugyo.period,
      excercise: jugyo.excercise ?? false,
      exception: jugyo.exception ?? false,
      notes: jugyo.notes ?? null,
      comment: jugyo.comment ?? null,
      kaisuu: jugyo.kaisuu ?? null,
    };

    if (jugyo.id) {
      const { error } = await supabase
	.from("jugyos")
	.update(cleanData)
	.eq("id", jugyo.id);

      if (error) {
	console.error("update error", error);
	alert("更新に失敗しました: " + error.message);
	return;
      }
    } else {
      const { error } = await supabase
	.from("jugyos")
	.insert(cleanData);

      if (error) {
	console.error("insert error", error);
	alert("保存に失敗しました: " + error.message);
	return;
      }
    }
    await fetchJugyos();
  };
  
  useEffect(() => {
    fetchMaster();
    fetchJugyos();
  }, []);

  const availables = [];
  for (let level of [1,2,3,4]){
    for (let term of termNames){
      availables.push(<AvailableSlots key={"aki"+level+"-"+term}year={2026} level={level} term={term}/>)
    }
  }

  const visibleKamokus =
    selectedDepartmentId !== null
    ? kamokus.filter((k) => k.department_id === selectedDepartmentId)
    : kamokus;

  const visibleJugyos =
    selectedDepartmentId !== null
    ? jugyos.filter((j) => j.department_id === selectedDepartmentId)
    : jugyos;

  const visibleTeachers =
    selectedDepartmentId !== null
    ? teachers.filter((t) => t.department_id === selectedDepartmentId)
    : teachers;
  
  return (
    <>
    <BrowserRouter>
    <Routes>
    <Route path="/" element={<LoginPage />} />
    <Route
	  path="/timetable"
	  element={
            <ProtectedRoute>
	      <Box sx={{ width: "100%" }}>
		<Box sx={{ p: 2 }}>
                <FormControl size="small" sx={{ minWidth: 220, mb: 2 }}>
                  <InputLabel>学科</InputLabel>
                  <Select
                    label="学科"
                    value={selectedDepartmentId ?? ""}
                    onChange={(e) => {
                      const value = e.target.value as number | "";
                      setSelectedDepartmentId(
                        value === "" ? null : Number(value)
                      );
                    }}
                  >
                    <MenuItem value="">
                      全学科
                    </MenuItem>

                    {departments.map((d) => (
                      <MenuItem key={d.id} value={d.id}>
                        {d.abbr ?? d.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>		
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
		  {tab === 0 &&
		   <JugyoManager
		     jugyos={visibleJugyos}
		     onSaveJugyo={handleSaveJugyo}
		     teachers={teachers}
                     kamokus={kamokus}
                     terms={terms}
                     wdays={wdays}
                     departments={departments}
                     selectedDepartmentId={selectedDepartmentId}
		   />
		  }
		  {tab === 1 &&
		   termNames.map((term) => (
		     <Timetable
		       key={"timetable" + year + "-" + term}
		       jugyos={visibleJugyos}
		       fetchJugyos={fetchJugyos}
		       year={year}
		       termName={term}
		       teachers={teachers}
		       kamokus={kamokus}
		       terms={terms}
		       wdays={wdays}
		     />
		  ))}
		  {tab === 2 && <KamokuManager
				  kamokus={visibleKamokus}
				  fetchMaster={fetchMaster}
				/>}
		  {tab === 3 && availables}
		  {tab === 4 && <TeacherManager
				  year={year}
				  selectedDepartmentId={selectedDepartmentId}
				  teachers={visibleTeachers}
				  jugyos={visibleJugyos}
				  departments={departments}
				  fetchMaster={fetchMaster}
				/>}
		  {tab === 5 && <TermsView />}
		</Box>
	      </Box>
	      {}
            </ProtectedRoute>
	  }
	/>
      </Routes>
    </BrowserRouter>
    </>
  );
}

