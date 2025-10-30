import { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { supabase } from "../lib/supabaseClient";
import JugyoEditDialog from "./JugyoEditDialog";

type Jugyo = {
  id?: number;
  year: number;
  term_id: number;
  teacher_id: number;
  kamoku_id: number;
  wday_id: number;
  period: number;
  excercise?: boolean;
  exception?: boolean;
  notes?: string;
  comment?: string;
  kaisuu?: number;
};

export default function JugyoManager({
  jugyos,
  fetchJugyos,
}: {
  jugyos: any[];
  fetchJugyos: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [selectedJugyo, setSelectedJugyo] = useState<Jugyo | null>(null);
  const [isNew, setIsNew] = useState(false);

  const handleEdit = (jugyo: Jugyo) => {
    setSelectedJugyo(jugyo);
    setIsNew(false);
    setOpen(true);
  };

  const handleNew = () => {
    setSelectedJugyo({
      year: new Date().getFullYear(),
      term_id: 1,
      teacher_id: 0,
      kamoku_id: 0,
      wday_id: 1,
      period: 1,
      excercise: false,
      exception: false,
    });
    setIsNew(true);
    setOpen(true);
  };

  const handleSave = async (jugyo: any) => {
    // jugyosテーブルに存在する列だけを抽出
    const cleanData = {
      year: jugyo.year,
      term_id: jugyo.term_id,
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

    if (isNew) {
      console.log(cleanData);
      const { error } = await supabase.from("jugyos").insert(cleanData);
      if (error) {
	console.error("insert error", error);
	alert("保存に失敗しました");
	return;
      }
    } else if (jugyo.id) {
      const { error } = await supabase
	.from("jugyos")
	.update(cleanData)
	.eq("id", jugyo.id);
      if (error) {
	console.error("update error", error);
	alert("更新に失敗しました");
	return;
      }
    }
    await fetchJugyos();
  };


  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">授業一覧</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNew}
        >
          新規作成
        </Button>
      </Box>

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
          {jugyos.map((j) => (
            <TableRow key={j.id}>
              <TableCell>{j.id}</TableCell>
              <TableCell>{j.year}</TableCell>
              <TableCell>{j.terms?.name ?? ""}</TableCell>
              <TableCell>
                {j.teachers
                  ? `${j.teachers.fname} ${j.teachers.gname}`
                  : ""}
              </TableCell>
              <TableCell>{j.kamokus?.name ?? ""}</TableCell>
              <TableCell>{j.wdays?.name ?? ""}</TableCell>
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

      {open && (
        <JugyoEditDialog
          open={open}
          onClose={() => setOpen(false)}
          jugyo={selectedJugyo}
          onSaved={handleSave}
          isNew={isNew}
        />
      )}
    </Box>
  );
}
