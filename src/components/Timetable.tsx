import { useState } from "react";
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
} from "@mui/material";
import { supabase } from "../lib/supabaseClient";
import JugyoEditDialog from "./JugyoEditDialog";

type TimetableProps = {
  jugyos: any;
  fetchJugyos: any;
  year: number;
  termName: string;
  teachers: any[];
  kamokus: any[];
  terms: any[];
  wdays: any[];
  departments: any[];
  selectedDepartmentId: number | null;
};

export default function Timetable({jugyos,
				   fetchJugyos,
				   year,
				   termName,
				   teachers,
				   kamokus,
				   terms,
				   wdays,
				   departments,
				   selectedDepartmentId
				   }:TimetableProps) {
  const [selectedJugyo, setSelectedJugyo] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const days = ["月", "火", "水", "木", "金"];
  const periods = [1, 2, 3, 4, 5];
  
  const levelcolor = ["red","red","blue","orange","green","purple"]
  // 指定曜日・時限にあるすべての授業を取得
  const jugyosAt = (wdayId: number, period: number) =>
    (jugyos ?? []).filter((j: any) =>
      j.wday_id === wdayId && j.period === period &&
				    ((j.terms?.name === termName || j.terms?.name === "通年") && termName !== "第2"||
				     (j.terms?.name === termName && termName === "第2"))
    );

  const handleSave = async (
    jugyo: any | null,
    deleted = false
  ) => {
    // 削除自体はJugyoEditDialogで完了している
    if (deleted) {
      await fetchJugyos();
      return;
    }

    if (!jugyo) return;

    const cleanData = {
      year: jugyo.year,
      term_id: jugyo.term_id,
      department_id: jugyo.department_id ?? null,
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

    const { error } = jugyo.id
		    ? await supabase
		      .from("jugyos")
		      .update(cleanData)
		      .eq("id", jugyo.id)
		    : await supabase
		      .from("jugyos")
		      .insert(cleanData);

    if (error) {
      console.error("jugyo save error:", error);
      throw error;
    }

    await fetchJugyos();
  };  
  //const handleSave = async (jugyo: any) => {
  //  const cleanData = {
  //    year: jugyo.year,
  //    term_id: jugyo.term_id,
  //    department_id: jugyo.department_id ?? null,
  //    teacher_id: jugyo.teacher_id,
  //    kamoku_id: jugyo.kamoku_id,
  //    wday_id: jugyo.wday_id,
  //    period: jugyo.period,
  //    excercise: jugyo.excercise ?? false,
  //    exception: jugyo.exception ?? false,
  //    notes: jugyo.notes ?? null,
  //    comment: jugyo.comment ?? null,
  //    kaisuu: jugyo.kaisuu ?? null,
  //  };
  //
  //  const { error } = jugyo.id
  //		    ? await supabase
  //		      .from("jugyos")
  //		      .update(cleanData)
  //		      .eq("id", jugyo.id)
  //		    : await supabase
  //		      .from("jugyos")
  //		      .insert(cleanData);
  //
  //  if (error) {
  //    console.error("jugyo save error:", error);
  //    // 呼び出し側へ失敗を伝える
  //    throw error;
  //  }
  //  
  //  //if (jugyo.id) {
  //  //  await supabase.from("jugyos").update(data).eq("id", jugyo.id);
  //  //} else {
  //  //  await supabase.from("jugyos").insert(data);
  //  //}
  //  await fetchJugyos(); // 保存後に再取得
  //};
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        時間割（{year}年度{termName}） 
      </Typography>

      <Table
        size="small"
        sx={{
          border: "1px solid #ccc",
          tableLayout: "fixed",
          width: "100%",
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 30 }}>曜日＼時限</TableCell>
            {periods.map((p) => (
              <TableCell key={p} align="center" sx={{ width: 140 }}>
                {p}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {days.map((d, i) => (
            <TableRow key={d}>
              {/* 左端：曜日 */}
              <TableCell
                align="center"
                sx={{
                  width: 80,
                  fontWeight: "bold",
                  bgcolor: "#fafafa",
                }}
              >
                {d}
              </TableCell>

              {/* 各時限 */}
              {periods.map((p) => {
                const js = jugyosAt(i+2, p);
		//console.log(js);
                return (
                  <TableCell
                    key={p}
                    align="center"
                    sx={{
                      verticalAlign: "top",
                      width: 140,
                      height: 100,
                      bgcolor: js.length > 0 ? "#f9f9f9" : "#fff",
                      p: 0.5,
                    }}
                  >
                    {js.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    ) : (
                      js.map((j:any) => (
                        <Box
                          key={j.id}
                          onClick={() => {
                            setSelectedJugyo(j);
                            setOpen(true);
                          }}
                          sx={{
                            cursor: "pointer",
                            border: "1px solid #ddd",
                            borderRadius: 1,
                            p: 0.5,
                            mb: 0.3,
                            "&:hover": { backgroundColor: "#eef" },
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 500, lineHeight: 1.2, color: levelcolor[j.kamokus?.level] }}
                          >
			    {j.excercise? "(演)" : ""}
                            {j.kamokus?.name}
                            {j.teachers
                              ? ` ${j.teachers.fname}`
                              : ""}
                          </Typography>
                        </Box>
                      ))
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 編集ダイアログ */}
        <JugyoEditDialog
          open={open}
          onClose={() => {
	    setOpen(false)
	    setSelectedJugyo(null);
	  }}
          jugyo={selectedJugyo}
	  onSaved={handleSave}
          isNew={false}
	  teachers={teachers}
	  kamokus={kamokus}
	  terms={terms}
	  wdays={wdays}
	  departments={departments}
	  selectedDepartmentId={selectedDepartmentId}
        />
    </Box>
  );
}
