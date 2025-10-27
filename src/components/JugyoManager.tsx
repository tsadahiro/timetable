import {  useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
//import { supabase } from "../lib/supabaseClient";
import JugyoEditDialog from "./JugyoEditDialog"; 

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

export default function JugyoManager({jugyos,fetchJugyos}:{jugyos:any, fetchJugyos:any}) {
  const [open, setOpen] = useState(false);
  const [selectedJugyo, setSelectedJugyo] = useState<Jugyo | null>(null);

  // 🔹 編集ダイアログを開く
  const handleEdit = (jugyo: Jugyo) => {
    setSelectedJugyo(jugyo);
    setOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        授業一覧
      </Typography>

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
            <TableCell align="right">操作</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {jugyos.map((j:any) => (
            <TableRow key={j.id}>
              <TableCell>{j.id}</TableCell>
              <TableCell>{j.year}</TableCell>
              <TableCell>{(j as any).terms?.name ?? ""}</TableCell>
              <TableCell>
                {(j as any).teachers
                  ? `${(j as any).teachers.fname} ${(j as any).teachers.gname}`
                  : ""}
              </TableCell>
              <TableCell>{(j as any).kamokus?.name ?? ""}</TableCell>
              <TableCell>{(j as any).wdays?.name ?? ""}</TableCell>
              <TableCell>{j.period}</TableCell>
              <TableCell>{j.exception ? "例外" : ""}</TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={() => handleEdit(j)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 🔹 編集＆削除対応版 JugyoEditDialog */}
      <JugyoEditDialog
        open={open}
        onClose={() => setOpen(false)}
        jugyo={selectedJugyo}
        onSaved={fetchJugyos}
      />
    </Box>
  );
}
//import { useEffect, useState } from "react";
//import {
//  Box,
//  Button,
//  Dialog,
//  DialogActions,
//  DialogContent,
//  DialogTitle,
//  TextField,
//  Table,
//  TableBody,
//  TableCell,
//  TableHead,
//  TableRow,
//  Typography,
//  IconButton,
//} from "@mui/material";
//import DeleteIcon from "@mui/icons-material/Delete";
//import EditIcon from "@mui/icons-material/Edit";
//import { supabase } from "../lib/supabaseClient";
//
//type Jugyo = {
//  id: number;
//  year: number;
//  term_id: number;
//  teacher_id: number;
//  kamoku_id: number;
//  wday_id: number;
//  period: number;
//  excercise: boolean;
//  exception: boolean;
//  notes?: string;
//  comment?: string;
//  kaisuu?: number;
//};
//
//export default function JugyoManager({jugyos}:{jugyos:number}) {
//  const [open, setOpen] = useState(false);
//  const [confirmOpen, setConfirmOpen] = useState(false);
//  const [current, setCurrent] = useState<Partial<Jugyo>>({});
//  const [targetId, setTargetId] = useState<number | null>(null);
//
//
//  // 🔹 edit dialog open
//  const handleEdit = (jugyo: Jugyo) => {
//    setCurrent(jugyo);
//    setOpen(true);
//  };
//
//  // 🔹 save edited record
//  const handleSave = async () => {
//    if (!current.id) return;
//    const { error } = await supabase
//      .from("jugyos")
//      .update(current)
//      .eq("id", current.id);
//    if (error) console.error(error);
//    else {
//      setOpen(false);
//      fetchJugyos();
//    }
//  };
//
//  // 🔹 delete confirmation
//  const handleDelete = async () => {
//    if (!targetId) return;
//    const { error } = await supabase.from("jugyos").delete().eq("id", targetId);
//    if (error) console.error(error);
//    else {
//      setConfirmOpen(false);
//      fetchJugyos();
//    }
//  };
//
//  return (
//    <Box sx={{ p: 3 }}>
//      <Typography variant="h5" gutterBottom>
//        授業一覧
//      </Typography>
//
//      <Table size="small">
//        <TableHead>
//          <TableRow>
//            <TableCell>ID</TableCell>
//            <TableCell>年度</TableCell>
//            <TableCell>学期</TableCell>
//            <TableCell>教員</TableCell>
//            <TableCell>科目</TableCell>
//            <TableCell>曜日</TableCell>
//            <TableCell>時限</TableCell>
//            <TableCell>例外</TableCell>
//            <TableCell align="right">操作</TableCell>
//          </TableRow>
//        </TableHead>
//        <TableBody>
//          {jugyos?.map((j) => (
//            <TableRow key={j.id}>
//              <TableCell>{j.id}</TableCell>
//              <TableCell>{j.year}</TableCell>
//              <TableCell>{(j as any).terms ? (j as any).terms.name : ""}</TableCell>
//	      <TableCell>
//		{(j as any).teachers ? `${(j as any).teachers.fname} ${(j as any).teachers.gname}` : ""}
//	      </TableCell>
//	      <TableCell>
//		{(j as any).kamokus ? (j as any).kamokus.name : ""}
//	      </TableCell>
//              <TableCell>{j? (j as any).wdays.name: ""}</TableCell>
//              <TableCell>{j.period}</TableCell>
//              <TableCell>{j.exception ? "例外" : ""}</TableCell>
//              <TableCell align="right">
//                <IconButton size="small" onClick={() => handleEdit(j)}>
//                  <EditIcon fontSize="small" />
//                </IconButton>
//                <IconButton
//                  size="small"
//                  color="error"
//                  onClick={() => {
//                    setTargetId(j.id);
//                    setConfirmOpen(true);
//                  }}
//                >
//                  <DeleteIcon fontSize="small" />
//                </IconButton>
//              </TableCell>
//            </TableRow>
//          ))}
//        </TableBody>
//      </Table>
//
//      {/* 編集ダイアログ */}
//      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
//        <DialogTitle>授業を編集</DialogTitle>
//        <DialogContent>
//          <TextField
//            margin="dense"
//            label="年度"
//            type="number"
//            fullWidth
//            value={current.year ?? ""}
//            onChange={(e) => setCurrent({ ...current, year: Number(e.target.value) })}
//          />
//          <TextField
//            margin="dense"
//            label="学期"
//            type="number"
//            fullWidth
//            value={current.term_id ?? ""}
//            onChange={(e) => setCurrent({ ...current, term_id: Number(e.target.value) })}
//          />
//          <TextField
//            margin="dense"
//            label="教員ID"
//            type="number"
//            fullWidth
//            value={current.teacher_id ?? ""}
//            onChange={(e) =>
//              setCurrent({ ...current, teacher_id: Number(e.target.value) })
//            }
//          />
//          <TextField
//            margin="dense"
//            label="科目ID"
//            type="number"
//            fullWidth
//            value={current.kamoku_id ?? ""}
//            onChange={(e) =>
//              setCurrent({ ...current, kamoku_id: Number(e.target.value) })
//            }
//          />
//          <TextField
//            margin="dense"
//            label="曜日"
//            type="number"
//            fullWidth
//            value={current.wday_id ?? ""}
//            onChange={(e) =>
//              setCurrent({ ...current, wday_id: Number(e.target.value) })
//            }
//          />
//          <TextField
//            margin="dense"
//            label="時限"
//            type="number"
//            fullWidth
//            value={current.period ?? ""}
//            onChange={(e) =>
//              setCurrent({ ...current, period: Number(e.target.value) })
//            }
//          />
//          <TextField
//            margin="dense"
//            label="例外（true/false）"
//            fullWidth
//            value={String(current.exception ?? "false")}
//            onChange={(e) =>
//              setCurrent({ ...current, exception: e.target.value === "true" })
//            }
//          />
//        </DialogContent>
//        <DialogActions>
//          <Button onClick={() => setOpen(false)}>キャンセル</Button>
//          <Button variant="contained" onClick={handleSave}>
//            保存
//          </Button>
//        </DialogActions>
//      </Dialog>
//
//      {/* 削除確認ダイアログ */}
//      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
//        <DialogTitle>削除の確認</DialogTitle>
//        <DialogContent>この授業を削除してもよろしいですか？</DialogContent>
//        <DialogActions>
//          <Button onClick={() => setConfirmOpen(false)}>キャンセル</Button>
//          <Button color="error" variant="contained" onClick={handleDelete}>
//            削除
//          </Button>
//        </DialogActions>
//      </Dialog>
//    </Box>
//  );
//}
