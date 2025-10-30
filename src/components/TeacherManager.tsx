import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import TeacherEditDialog from "./TeacherEditDialog";
import { useEffect, useState } from "react";
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
  TextField,
} from "@mui/material";
import { supabase } from "../lib/supabaseClient";

type Teacher = {
  id: number;
  fname: string;
  gname: string;
  fyomi: string;
  gyomi: string;
  joukin: boolean;
  ref_id?: number | null;
  honmuko?: string | null;
};

type Jugyo = {
  id: number;
  year: number;
  period: number;
  kaisuu: number;
  wdays: { name: string };
  kamokus: { name: string };
};

export default function TeacherManager({ year }: { year: number }) {
  const [editOpen, setEditOpen] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [jugyos, setJugyos] = useState<Jugyo[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    fname: "",
    gname: "",
    fyomi: "",
    gyomi: "",
    joukin: true,
    honmuko: "",
  });

  // 🔹 教員リスト取得
  const fetchTeachers = async () => {
    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .order("joukin", { ascending: false }) // 常勤 → 非常勤
      .order("fyomi", { ascending: true }) // 姓のよみ順
      .order("gyomi", { ascending: true }); // 名のよみ順
    if (error) console.error(error);
    else setTeachers(data || []);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // 🔹 教員クリック時：担当授業を取得
  const handleOpenTeacher = async (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    const { data, error } = await supabase
      .from("jugyos")
      .select("id, year, period, wday_id, kaisuu, wdays(name), kamokus(name, level)")
      .eq("teacher_id", teacher.id)
      .eq("year", year)
      .order("wday_id", { ascending: true })
      .order("period", { ascending: true });

    if (error) console.error(error);
    else
      setJugyos(
	(data || []).map((j: any) => ({
	  ...j,
	  wdays:
        Array.isArray(j.wdays) && j.wdays.length > 0
						 ? j.wdays[0]
						 : j.wdays || { name: "" },
	  kamokus:
        Array.isArray(j.kamokus) && j.kamokus.length > 0
						     ? j.kamokus[0]
						     : j.kamokus || { name: "" },
	})).sort((a, b) => (a.kamokus?.level ?? 0) - (b.kamokus?.level ?? 0))
      );
    setOpenDialog(true);
  };

  // 🔹 教員追加
  const handleAddTeacher = async () => {
    const { error } = await supabase.from("teachers").insert([newTeacher]);
    if (error) {
      alert("登録に失敗しました");
      console.error(error);
      return;
    }
    setAddOpen(false);
    setNewTeacher({
      fname: "",
      gname: "",
      fyomi: "",
      gyomi: "",
      joukin: true,
      honmuko: "",
    });
    fetchTeachers();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        教員一覧
      </Typography>

      {/* 新規追加ボタン */}
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={() => setAddOpen(true)}>
          新規追加
        </Button>
      </Box>

      {/* 教員一覧テーブル */}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>氏名</TableCell>
            <TableCell>よみ</TableCell>
            <TableCell>常勤</TableCell>
            <TableCell>本務校</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {teachers.map((t) => (
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
	  {jugyos.length === 0 ? (
	    <Typography>該当授業なし</Typography>
	  ) : (
	    <>
	      <Table size="small">
		<TableHead>
		  <TableRow>
		    <TableCell>科目</TableCell>
		    <TableCell>曜日</TableCell>
		    <TableCell>時限</TableCell>
		    <TableCell align="right">回数</TableCell>
		  </TableRow>
		</TableHead>
		<TableBody>
		  {jugyos.map((j) => (
		    <TableRow key={j.id}>
		      <TableCell>{j.kamokus?.name}</TableCell>
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
		  {jugyos.reduce((sum, j) => sum + (j.kaisuu || 0), 0)}
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
	onSaved={() => {
	  fetchTeachers();
	  setEditOpen(false);
	}}
      />
      
      {/* 教員追加ダイアログ */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>新規教員の登録</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="姓"
            fullWidth
            value={newTeacher.fname}
            onChange={(e) =>
              setNewTeacher({ ...newTeacher, fname: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="名"
            fullWidth
            value={newTeacher.gname}
            onChange={(e) =>
              setNewTeacher({ ...newTeacher, gname: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="姓のよみ"
            fullWidth
            value={newTeacher.fyomi}
            onChange={(e) =>
              setNewTeacher({ ...newTeacher, fyomi: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="名のよみ"
            fullWidth
            value={newTeacher.gyomi}
            onChange={(e) =>
              setNewTeacher({ ...newTeacher, gyomi: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="本務校"
            fullWidth
            value={newTeacher.honmuko}
            onChange={(e) =>
              setNewTeacher({ ...newTeacher, honmuko: e.target.value })
            }
          />
          <TextField
            select
            margin="dense"
            label="常勤 / 非常勤"
            fullWidth
            value={newTeacher.joukin ? "true" : "false"}
            onChange={(e) =>
              setNewTeacher({
                ...newTeacher,
                joukin: e.target.value === "true",
              })
            }
            SelectProps={{ native: true }}
          >
            <option value="true">常勤</option>
            <option value="false">非常勤</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>キャンセル</Button>
          <Button variant="contained" onClick={handleAddTeacher}>
            登録
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
