import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import TeacherEditDialog from "./TeacherEditDialog";
import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { supabase } from "../lib/supabaseClient";

type Teacher = {
  id: number;
  fname: string;
  gname: string;
  fyomi: string;
  gyomi: string;
  joukin: boolean;
  kaisuu2026: number;
  ref_id?: number | null;
  honmuko?: string | null;
  department_id?: number | null;
};

type Jugyo = {
  id: number;
  year: number;
  period: number;
  teacher_id: number | null;
  kaisuu: number;
  wdays: { name: string };
  kamokus: { name: string };
  terms: { name: string };
};

export default function TeacherManager({
  year,
  selectedDepartmentId,
  jugyos,
  teachers,
  departments,
  fetchMaster,
}: {
  year: number;
  selectedDepartmentId: number | null;
  teachers: Teacher[];
  jugyos: Jugyo[];
  departments: any[];
  fetchMaster: () => Promise<void>;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teacherJugyos, setTeacherJugyos] = useState<Jugyo[]>([]);

  const teachersWithKaisuu = teachers.map((t) => ({
    ...t,
    kaisuu2026: jugyos
      .filter((j) => j.teacher_id === t.id && j.year === year)
      .reduce((sum, j) => sum + (j.kaisuu || 0), 0),
  }));

  // 🔹 教員クリック時：担当授業を取得
  const handleOpenTeacher = async (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    const { data, error } = await supabase
      .from("jugyos")
      .select("id, year, term_id, terms(name), period, wday_id, kaisuu, wdays(name), kamokus(name, level)")
      .eq("teacher_id", teacher.id)
      .eq("year", year)
      .order("term_id", { ascending: true })
      .order("wday_id", { ascending: true })
      .order("period", { ascending: true });

    if (error) console.error(error);
    else
      setTeacherJugyos(
	(data || []).map((j: any) => ({
	  ...j,
	  terms:
        Array.isArray(j.terms) && j.terms.length > 0
						 ? j.terms[0]
						 : j.terms || { name: "" },
	  wdays:
        Array.isArray(j.wdays) && j.wdays.length > 0
						 ? j.wdays[0]
						 : j.wdays || { name: "" },
	  kamokus:
        Array.isArray(j.kamokus) && j.kamokus.length > 0
						     ? j.kamokus[0]
						     : j.kamokus || { name: "" },
	}))
      );
    setOpenDialog(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        教員一覧
      </Typography>

    {/* 新規追加ボタン */}
    <Button
      variant="contained"
      onClick={() => {
	setSelectedTeacher({
	  fname: "",
	  gname: "",
	  fyomi: "",
	  gyomi: "",
	  joukin: true,
	  honmuko: "",
	  department_id: selectedDepartmentId,
	} as Teacher);
	setEditOpen(true);
      }}
    >
      新規追加
    </Button>
      {/* 教員一覧テーブル */}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>氏名</TableCell>
            <TableCell>よみ</TableCell>
            <TableCell>常勤</TableCell>
	    <TableCell align="right">2026</TableCell>
            <TableCell>本務校</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {teachersWithKaisuu.map((t) => (
	    <TableRow key={t.id} hover>
	      <TableCell>{t.id}</TableCell>
	      <TableCell
		sx={{ cursor: "pointer" }}
		onClick={() => handleOpenTeacher(t)}
	      >
		{`${t.fname} ${t.gname}`}
	      </TableCell>
	      <TableCell>{`${t.fyomi} ${t.gyomi}`}</TableCell>
	      <TableCell>{t.joukin ? "常勤" : "非常勤"}</TableCell>
	      <TableCell align="right">{t.kaisuu2026 || ""}</TableCell>
	      <TableCell>{t.honmuko || ""}</TableCell>
	      <TableCell align="right">
		<IconButton
		  size="small"
		  onClick={() => {
		    setSelectedTeacher(t);
		    setEditOpen(true);
		  }}
		>
		  <EditIcon fontSize="small" />
		</IconButton>
	      </TableCell>
	    </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 担当授業ダイアログ */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {selectedTeacher
            ? `${selectedTeacher.fname} ${selectedTeacher.gname} の担当授業（${year}年度）`
            : "担当授業"}
        </DialogTitle>
	<DialogContent dividers>
	  {teacherJugyos.length === 0 ? (
	    <Typography>該当授業なし</Typography>
	  ) : (
	    <>
	      <Table size="small">
		<TableHead>
		  <TableRow>
		    <TableCell>科目</TableCell>
		    <TableCell>ターム</TableCell>
		    <TableCell>曜日</TableCell>
		    <TableCell>時限</TableCell>
		    <TableCell align="right">回数</TableCell>
		  </TableRow>
		</TableHead>
		<TableBody>
		  {teacherJugyos.map((j) => (
		    <TableRow key={j.id}>
		      <TableCell>{j.kamokus?.name}</TableCell>
		      <TableCell>{j.terms?.name}</TableCell>
		      <TableCell>{j.wdays?.name}</TableCell>
		      <TableCell>{j.period}</TableCell>
		      <TableCell align="right">{j.kaisuu ?? "-"}</TableCell>
		    </TableRow>
		  ))}
		</TableBody>
	      </Table>

	      <Typography sx={{ mt: 2, textAlign: "right" }}>
		合計回数：
		<strong>
		  {teacherJugyos.reduce((sum, j) => sum + (j.kaisuu || 0), 0)}
		</strong>
	      </Typography>
	    </>
	  )}
	</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>

      <TeacherEditDialog
	open={editOpen}
	onClose={() => setEditOpen(false)}
	teacher={selectedTeacher}
	departments={departments}
	onSaved={async () => {
	  //fetchTeachers();
	  await fetchMaster();
	  setEditOpen(false);
	}}
      />
    </Box>
  );
}
