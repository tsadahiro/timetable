import { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormGroup, FormControlLabel, Checkbox
} from "@mui/material";
import { supabase } from "../lib/supabaseClient";

export default function KamokuDialog({ open, onClose, kamoku, onSaved }: any) {
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    setForm(
      kamoku || {
        name: "",
        introduced: new Date().getFullYear(),
        level: 1,
        hisshu: false,
        sentakuhi: false,
        kyoshoku: false,
        credit: 2,
        DM: false,
      }
    );
  }, [kamoku]);

  const handleSave = async () => {
    if (kamoku) {
      await supabase.from("kamokus").update(form).eq("id", kamoku.id);
    } else {
      await supabase.from("kamokus").insert(form);
    }
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{kamoku ? "科目を編集" : "新規科目の追加"}</DialogTitle>
      <DialogContent>
        <TextField
          label="科目名"
          fullWidth
          margin="dense"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <TextField
          label="導入年度"
          type="number"
          fullWidth
          margin="dense"
          value={form.introduced}
          onChange={(e) => setForm({ ...form, introduced: Number(e.target.value) })}
        />
        <TextField
          label="開講年次"
          type="number"
          fullWidth
          margin="dense"
          value={form.level}
          onChange={(e) => setForm({ ...form, level: Number(e.target.value) })}
        />
        <TextField
          label="単位"
          type="number"
          fullWidth
          margin="dense"
          value={form.credit}
          onChange={(e) => setForm({ ...form, credit: Number(e.target.value) })}
        />

        <FormGroup row sx={{ mt: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={form.hisshu}
                onChange={(e) => setForm({ ...form, hisshu: e.target.checked })}
              />
            }
            label="必修"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.sentakuhi}
                onChange={(e) => setForm({ ...form, sentakuhi: e.target.checked })}
              />
            }
            label="選択必修"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.kyoshoku}
                onChange={(e) => setForm({ ...form, kyoshoku: e.target.checked })}
              />
            }
            label="教職"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.DM}
                onChange={(e) => setForm({ ...form, DM: e.target.checked })}
              />
            }
            label="DM"
          />
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button variant="contained" onClick={handleSave}>
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}
