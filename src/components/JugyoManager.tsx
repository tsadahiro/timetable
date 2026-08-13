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
import JugyoEditDialog from "./JugyoEditDialog";


type JugyoManagerProps = {
  jugyos: any;
  //fetchJugyos: any;
  onSaveJugyo: any;
  teachers: any[];
  kamokus: any[];
  terms: any[];
  wdays: any[];
  departments: any[];
  //forbiddens: any[];
  selectedDepartmentId: number | null;
};


type Jugyo = {
  id?: number;
  year: number;
  term_id: number;
  department_id: number | null;
  teacher_id: number | null;
  kamoku_id: number | null;
  wday_id: number;
  period: number;
  excercise?: boolean;
  exception?: boolean;
  notes?: string;
  comment?: string;
  kaisuu?: number;

  teachers?: {
    id: number;
    fname?: string;
    gname?: string;
  } | null;

  kamokus?: {
    id: number;
    name?: string;
    level?: number;
  } | null;

  terms?: {
    id?: number;
    name?: string;
  } | null;

  wdays?: {
    id?: number;
    name?: string;
  } | null;
};

export default function JugyoManager({jugyos,
				      //fetchJugyos,
				      onSaveJugyo,
				      teachers,
				      kamokus,
				      terms,
				      wdays,
				      departments,
				      selectedDepartmentId}: JugyoManagerProps) {
  const [open, setOpen] = useState(false);
  const [selectedJugyo, setSelectedJugyo] = useState<Jugyo | null>(null);
  const [isNew, setIsNew] = useState(false);

  const departmentLabel = (departmentId: number | null | undefined) => {
    if (departmentId == null) return "未指定";

    const dept = departments.find((d: any) => d.id === departmentId);

    return dept?.abbr ?? dept?.name ?? `ID:${departmentId}`;
  };
  
  const handleEdit = (jugyo: Jugyo) => {
    setSelectedJugyo({
      id: jugyo.id,
      year: jugyo.year,
      term_id: jugyo.term_id,
      department_id: jugyo.department_id,
      teacher_id: jugyo.teachers?.id ?? null,   // ← ネストから取る
      kamoku_id: jugyo.kamokus?.id ?? null,     // ← ネストから取る
      wday_id: jugyo.wday_id,
      period: jugyo.period,
      kaisuu: jugyo.kaisuu,
      excercise: jugyo.excercise,
      exception: jugyo.exception,
      notes: jugyo.notes,
      comment: jugyo.comment,
    });
    setIsNew(false);
    setOpen(true);
  };

  const handleNew = () => {
    setSelectedJugyo({
      year: new Date().getFullYear(),
      department_id: selectedDepartmentId?? null,
      term_id: terms[0]?.id ?? 1,  // ← ソート済みの先頭
      //teacher_id: teachers[0]?.id ?? 0,
      teacher_id: null,
      kamoku_id: 0,
      wday_id: wdays[0]?.id ?? 1,
      period: 1,
      excercise: false,
      exception: false,
    });
    setIsNew(true);
    setOpen(true);
  };

  /*
  const handleSave = async (jugyo: any, deleted = false) => {
    
    if (deleted) {
      // 削除完了時：再取得のみ実行して安全に抜ける
      await fetchJugyos();
      return;
    }

    if (!jugyo) return; // 念のための安全ガード
    
    // jugyosテーブルに存在する列だけを抽出
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
  */

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
            <TableCell>学科</TableCell>
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
          {jugyos.map((j: Jugyo) => (
            <TableRow key={j.id} hover>
              <TableCell>{j.id}</TableCell>
              <TableCell>{j.year}</TableCell>
	      <TableCell>{departmentLabel(j.department_id)}</TableCell>
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

      {open && selectedJugyo && (
        <JugyoEditDialog
          open={open}
          onClose={() => {
	    setOpen(false)
	    setSelectedJugyo(null);
	  }}
	  jugyo={selectedJugyo}
	  onSaved={onSaveJugyo}
	  isNew={isNew}
	  teachers={teachers}
	  kamokus={kamokus}
	  terms={terms}
	  wdays={wdays}
	  departments={departments}
	  selectedDepartmentId={selectedDepartmentId}
        />
      )}
    </Box>
  );
}
