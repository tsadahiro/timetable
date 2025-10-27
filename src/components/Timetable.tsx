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
//import { supabase } from "../lib/supabaseClient";
import JugyoEditDialog from "./JugyoEditDialog";

type TimetableProps = {
  jugyos: any;
  fetchJugyos: any;
  year: number;
  termName: string;
};
export default function Timetable({jugyos, fetchJugyos,  year, termName}:TimetableProps) {
  const [selectedJugyo, setSelectedJugyo] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const days = ["月", "火", "水", "木", "金"];
  const periods = [1, 2, 3, 4, 5];


  // 指定曜日・時限にあるすべての授業を取得
  const jugyosAt = (wdayIndex: number, period: number) =>
    jugyos.filter((j:any) => j.wday_id === wdayIndex + 1 && j.period === period && j.terms.name === termName);

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
                const js = jugyosAt(i+1, p);
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
                            sx={{ fontWeight: 500, lineHeight: 1.2 }}
                          >
                            {j.kamokus?.name}
                            {j.teachers
                              ? `${j.teachers.fname}`
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
        onClose={() => setOpen(false)}
        jugyo={selectedJugyo}
        onSaved={fetchJugyos}
      />
    </Box>
  );
}
