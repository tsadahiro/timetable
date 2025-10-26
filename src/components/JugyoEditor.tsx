import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { supabase } from "../lib/supabaseClient";  // ← supabase clientをimport

type Jugyo = {
  id: number;
  year: number;
  term_id: number;
  teacher_id: number;
  kamoku_id: number;
  wday_id: number;
  period: number;
  excercise: boolean;
  exception: boolean;
  notes?: string;
  comment?: string;
  kaisuu?: number;
};

export default function JugyoEditor() {
  const [jugyos, setJugyos] = useState<Jugyo[]>([]);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Partial<Jugyo>>({});

  // 一覧取得
  const fetchJugyos = async () => {
    const { data, error } = await supabase.from("jugyos").select("*").order("id");
    if (error) console.error(error);
    else setJugyos(data || []);
  };

  useEffect(() => {
    fetchJugyos();
  }, []);

  // 編集ダイアログを開く
  const handleEdit = (jugyo: Jugyo) => {
    setCurrent(jugyo);
    setOpen(true);
  };

  // 保存処理（update）
  const handleSave = async () => {
    if (!current.id) return;
    const { error } = await supabase
      .from("jugyos")
      .update(current)
      .eq("id", current.id);
    if (error) console.error(error);
    else {
      setOpen(false);
      fetchJugyos();
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <h2>授業一覧</h2>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>年度</TableCell>
            <TableCell>学期</TableCell>
            <TableCell>教員</TableCell>
            <TableCell>科目</TableCell>
            <TableCell>曜日</TableCell>
            <TableCell>時限</TableCell>
            <TableCell>例外</TableCell>
            <TableCell>操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {jugyos.map((j) => (
            <TableRow key={j.id}>
              <TableCell>{j.id}</TableCell>
              <TableCell>{j.year}</TableCell>
              <TableCell>{j.term_id}</TableCell>
              <TableCell>{j.teacher_id}</TableCell>
              <TableCell>{j.kamoku_id}</TableCell>
              <TableCell>{j.wday_id}</TableCell>
              <TableCell>{j.period}</TableCell>
              <TableCell>{j.exception ? "例外" : ""}</TableCell>
              <TableCell>
                <Button variant="outlined" size="small" onClick={() => handleEdit(j)}>
                  編集
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 編集ダイアログ */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>授業を編集</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="年度"
            type="number"
            fullWidth
            value={current.year ?? ""}
            onChange={(e) => setCurrent({ ...current, year: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="学期"
            type="number"
            fullWidth
            value={current.term_id ?? ""}
            onChange={(e) => setCurrent({ ...current, term_id: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="教員ID"
            type="number"
            fullWidth
            value={current.teacher_id ?? ""}
            onChange={(e) => setCurrent({ ...current, teacher_id: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="科目ID"
            type="number"
            fullWidth
            value={current.kamoku_id ?? ""}
            onChange={(e) => setCurrent({ ...current, kamoku_id: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="曜日"
            type="number"
            fullWidth
            value={current.wday_id ?? ""}
            onChange={(e) => setCurrent({ ...current, wday_id: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="時限"
            type="number"
            fullWidth
            value={current.period ?? ""}
            onChange={(e) => setCurrent({ ...current, period: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="例外（true/false）"
            select
            fullWidth
            value={current.exception ? "true" : "false"}
            onChange={(e) =>
              setCurrent({ ...current, exception: e.target.value === "true" })
            }
          >
            <MenuItem value="false">false</MenuItem>
            <MenuItem value="true">true</MenuItem>
          </TextField>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>キャンセル</Button>
          <Button variant="contained" onClick={handleSave}>
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
