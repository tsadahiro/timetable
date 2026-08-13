import { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormGroup, FormControlLabel, Checkbox,
  FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import { supabase } from "../lib/supabaseClient";

const CATEGORY_OPTIONS = [
  { value: "department_specialized", label: "学科専門" },
  { value: "faculty_common", label: "学部共通" },
  { value: "university_common", label: "全学共通" },
  { value: "teacher_training", label: "教職" },
  { value: "other", label: "その他" },
];

export default function KamokuDialog({ open, onClose, kamoku, onSaved }: any) {
  const [form, setForm] = useState<any>({});
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("id, name, abbr")
        .order("id", { ascending: true });

      if (!error) setDepartments(data || []);
    };

    fetchDepartments();
  }, []);

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
        dm: false,
        category: "department_specialized",
        department_id: 1,
      }
    );
  }, [kamoku]);

  const handleSave = async () => {
    const payload = {
      ...form,
      department_id:
        form.category === "department_specialized"
          ? form.department_id
          : null,
      updated_at: new Date().toISOString(),
    };

    if (kamoku) {
      await supabase.from("kamokus").update(payload).eq("id", kamoku.id);
    } else {
      await supabase.from("kamokus").insert(payload);
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
          value={form.name ?? ""}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <TextField
          label="導入年度"
          type="number"
          fullWidth
          margin="dense"
          value={form.introduced ?? ""}
          onChange={(e) =>
            setForm({ ...form, introduced: Number(e.target.value) })
          }
        />

        <TextField
          label="開講年次"
          type="number"
          fullWidth
          margin="dense"
          value={form.level ?? ""}
          onChange={(e) =>
            setForm({ ...form, level: Number(e.target.value) })
          }
        />

        <TextField
          label="単位"
          type="number"
          fullWidth
          margin="dense"
          value={form.credit ?? ""}
          onChange={(e) =>
            setForm({ ...form, credit: Number(e.target.value) })
          }
        />

        <FormControl fullWidth margin="dense">
          <InputLabel id="category-label">科目種別</InputLabel>
          <Select
            labelId="category-label"
            label="科目種別"
            value={form.category ?? "department_specialized"}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value,
                department_id:
                  e.target.value === "department_specialized"
                    ? form.department_id ?? 1
                    : null,
              })
            }
          >
            {CATEGORY_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {form.category === "department_specialized" && (
          <FormControl fullWidth margin="dense">
            <InputLabel id="department-label">学科</InputLabel>
            <Select
              labelId="department-label"
              label="学科"
              value={form.department_id ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  department_id: Number(e.target.value),
                })
              }
            >
              {departments.map((department) => (
                <MenuItem key={department.id} value={department.id}>
                  {department.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <FormGroup row sx={{ mt: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!form.hisshu}
                onChange={(e) =>
                  setForm({ ...form, hisshu: e.target.checked })
                }
              />
            }
            label="必修"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={!!form.sentakuhi}
                onChange={(e) =>
                  setForm({ ...form, sentakuhi: e.target.checked })
                }
              />
            }
            label="選択必修"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={!!form.kyoshoku}
                onChange={(e) =>
                  setForm({ ...form, kyoshoku: e.target.checked })
                }
              />
            }
            label="教職"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={!!form.dm}
                onChange={(e) =>
                  setForm({ ...form, dm: e.target.checked })
                }
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

/*
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
*/
