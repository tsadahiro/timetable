import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function JugyoEditDialog({
  open,
  onClose,
  jugyo,
  onSaved,
  isNew = false,
  teachers = [],
  kamokus = [],
  terms = [],
  wdays = [],
  departments = [],
  selectedDepartmentId = null,
}: {
  open: boolean;
  onClose: () => void;
  jugyo: any;
  onSaved: (jugyo: any | null, deleted?: boolean) => void; // 👈 削除対応
  isNew?: boolean;
  teachers: any[];
  kamokus: any[];
  terms: any[];
  wdays: any[];
  departments?: any[];
  selectedDepartmentId?: number | null;
}) {
  const [current, setCurrent] = useState<any>(jugyo || {});
  
  useEffect(() => {
    setCurrent({
      ...(jugyo || {}),
      department_id:
      jugyo?.department_id ??
      selectedDepartmentId ??
      null,
    });
  }, [jugyo, selectedDepartmentId]);

  const handleDelete = async () => {
    if (!current.id) return;
    const ok = window.confirm("この授業を削除してもよろしいですか？");
    if (!ok) return;

    const { error } = await supabase.from("jugyos").delete().eq("id", current.id);
    if (error) {
      alert("削除に失敗しました。");
      console.error(error);
    } else {
      onSaved(null, true); // 👈 親に削除完了を通知
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isNew ? "新規授業の作成" : "授業を編集"}</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="年度"
          type="number"
          fullWidth
          value={current.year ?? ""}
          onChange={(e) =>
            setCurrent({ ...current, year: Number(e.target.value) })
          }
        />

        <TextField
          select
          margin="dense"
          label="学期"
          fullWidth
          value={current.term_id ?? ""}
          onChange={(e) =>
            setCurrent({ ...current, term_id: Number(e.target.value) })
          }
        >
          {terms.map((tm) => (
            <MenuItem key={tm.id} value={tm.id}>
              {tm.name + "(" + tm.year + ")"}
            </MenuItem>
          ))}
        </TextField>

	<TextField
	  select
	  margin="dense"
	  label="対象学科"
	  fullWidth
	  value={current.department_id ?? ""}
	  onChange={(e) =>
	    setCurrent({
	      ...current,
	      department_id: e.target.value === "" ? null : Number(e.target.value),
	    })
	  }
	>
	  <MenuItem value="">
	    未指定
	  </MenuItem>
	  
	  {departments.map((d) => (
	    <MenuItem key={d.id} value={d.id}>
	      {d.abbr ?? d.name}
	    </MenuItem>
	  ))}
	</TextField>
	
        <TextField
          select
          margin="dense"
          label="担当教員"
          fullWidth
          value={current.teacher_id ?? ""}
          onChange={(e) =>
            setCurrent({ ...current, teacher_id: Number(e.target.value) })
          }
        >
          {teachers.map((t) => (
            <MenuItem key={t.id} value={t.id}>
              {t.fname} {t.gname}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          margin="dense"
          label="科目"
          fullWidth
          value={current.kamoku_id ?? ""}
          onChange={(e) =>
            setCurrent({ ...current, kamoku_id: Number(e.target.value) })
          }
        >
          {kamokus
            .sort((a, b) => a.level - b.level)
            .map((k) => (
              <MenuItem key={k.id} value={k.id}>
                {k.name}（Lv.{k.level}）
              </MenuItem>
            ))}
        </TextField>

        <TextField
          select
          margin="dense"
          label="曜日"
          fullWidth
          value={current.wday_id ?? ""}
          onChange={(e) =>
            setCurrent({ ...current, wday_id: Number(e.target.value) })
          }
        >
          {wdays.map((w) => (
            <MenuItem key={w.id} value={w.id}>
              {w.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          margin="dense"
          label="時限"
          type="number"
          fullWidth
          value={current.period ?? ""}
          onChange={(e) =>
            setCurrent({ ...current, period: Number(e.target.value) })
          }
        />
	<TextField
	  margin="dense"
	  label="回数"
	  type="number"
	  fullWidth
	  value={current.kaisuu ?? "9"}
	  onChange={(e) =>
	    setCurrent({ ...current, kaisuu: Number(e.target.value) })
	  }
	/>	
      </DialogContent>

      <DialogActions>
        {!isNew && (
          <Button color="error" onClick={handleDelete}>
            削除
          </Button>
        )}
        <Button onClick={onClose}>キャンセル</Button>
	<Button
	  variant="contained"
	  onClick={async () => {
	    console.log(current.kaisuu);
	    await onSaved(current);  
	    onClose();               
	  }}
	>
	  {isNew ? "作成" : "保存"}
	</Button>
      </DialogActions>
    </Dialog>
  );
}
