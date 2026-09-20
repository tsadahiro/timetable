import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  TextField,
} from "@mui/material";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function TeacherEditDialog({
  open,
  onClose,
  teacher,
  departments,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  teacher: any;
  departments: any[];
  onSaved: () => void;
}) {
  const [current, setCurrent] = useState<any>(teacher || {});

  useEffect(() => {
    setCurrent(teacher || {});
  }, [teacher]);

  const handleSave = async () => {
    const data = {
      fname: current.fname,
      gname: current.gname,
      fyomi: current.fyomi,
      gyomi: current.gyomi,
      joukin: current.joukin,
      honmuko: current.honmuko || null,
      department_id: current.department_id ?? null,
    };

    let error;

    if (current.id) {
      ({ error } = await supabase
	.from("teachers")
	.update(data)
	.eq("id", current.id));
    } else {
      ({ error } = await supabase
	.from("teachers")
	.insert(data));
    }

    if (error) {
      alert(current.id ? "更新に失敗しました" : "登録に失敗しました");
      console.error(error);
      return;
    }

    await onSaved();
    onClose();
  };  
  //const handleSave = async () => {
  //  if (!current.id) return;
  //  const { error } = await supabase
  //    .from("teachers")
  //    .update({
  //      fname: current.fname,
  //      gname: current.gname,
  //      fyomi: current.fyomi,
  //      gyomi: current.gyomi,
  //      joukin: current.joukin,
  //      honmuko: current.honmuko,
  //    })
  //    .eq("id", current.id);
  //
  //  if (error) {
  //    alert("更新に失敗しました");
  //    console.error(error);
  //    return;
  //  }
  //  onSaved();
  //  onClose();
  //};

  const handleDelete = async () => {
    if (!current.id) return;
    const ok = window.confirm("この教員を削除してもよろしいですか？");
    if (!ok) return;

    const { error } = await supabase
      .from("teachers")
      .delete()
      .eq("id", current.id);

    if (error) {
      alert("削除に失敗しました");
      console.error(error);
      return;
    }
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
	{current.id ? "教員情報の編集" : "新規教員の登録"}
      </DialogTitle>     
      <DialogContent>
        <TextField
          margin="dense"
          label="姓"
          fullWidth
          value={current.fname ?? ""}
          onChange={(e) =>
            setCurrent({ ...current, fname: e.target.value })
          }
        />
        <TextField
          margin="dense"
          label="名"
          fullWidth
          value={current.gname ?? ""}
          onChange={(e) =>
            setCurrent({ ...current, gname: e.target.value })
          }
        />
        <TextField
          margin="dense"
          label="姓のよみ"
          fullWidth
          value={current.fyomi ?? ""}
          onChange={(e) =>
            setCurrent({ ...current, fyomi: e.target.value })
          }
        />
        <TextField
          margin="dense"
          label="名のよみ"
          fullWidth
          value={current.gyomi ?? ""}
          onChange={(e) =>
            setCurrent({ ...current, gyomi: e.target.value })
          }
        />
        <TextField
          margin="dense"
          label="本務校"
          fullWidth
          value={current.honmuko ?? ""}
          onChange={(e) =>
            setCurrent({ ...current, honmuko: e.target.value })
          }
        />
        <TextField
          select
          margin="dense"
          label="常勤 / 非常勤"
          fullWidth
          value={current.joukin ? "true" : "false"}
          onChange={(e) =>
            setCurrent({
              ...current,
              joukin: e.target.value === "true",
            })
          }
          SelectProps={{ native: true }}
        >
          <option value="true">常勤</option>
          <option value="false">非常勤</option>
        </TextField>
	<TextField
	  select
	  margin="dense"
	  label="所属学科"
	  fullWidth
	  value={current.department_id ?? ""}
	  onChange={(e) =>
	    setCurrent({
	      ...current,
	      department_id:
          e.target.value === "" ? null : Number(e.target.value),
	    })
	  }
	>
	  {departments.map((d: any) => (
	    <MenuItem key={d.id} value={d.id}>
	      {d.abbr ?? d.name}
	    </MenuItem>
	  ))}
	</TextField>
      </DialogContent>
      <DialogActions>
	{current.id && (
	  <Button color="error" onClick={handleDelete}>
	    削除
	  </Button>
	)}
        <Button onClick={onClose}>キャンセル</Button>
        <Button variant="contained" onClick={handleSave}>
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}
