import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
} from "@mui/material";
import { supabase } from "../lib/supabaseClient";

type Props = {
  open: boolean;
  onClose: () => void;
  jugyo: any | null;
  onSaved: () => void;
};

export default function JugyoEditDialog({ open, onClose, jugyo, onSaved }: Props) {
  const [form, setForm] = useState<any>({});
  const [teachers, setTeachers] = useState<any[]>([]);
  const [kamokus, setKamokus] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [wdays, setWdays] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [tch, kmk, trm, wdy] = await Promise.all([
        supabase.from("teachers").select("id, fname, gname").order("fyomi"),
        supabase.from("kamokus").select("id, name, level").order("level"),
        supabase.from("terms").select("id, name, year").order("year"),
        supabase.from("wdays").select("id, name, orderkey").order("orderkey"),
      ]);
      setTeachers(tch.data || []);
      setKamokus(kmk.data || []);
      setTerms(trm.data || []);
      setWdays(wdy.data || []);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (jugyo) setForm(jugyo);
  }, [jugyo]);

  const handleSave = async () => {
    if (!form.id) return;
    const { error } = await supabase
      .from("jugyos")
      .update({
        year: form.year,
        term_id: form.term_id,
        teacher_id: form.teacher_id,
        kamoku_id: form.kamoku_id,
        wday_id: form.wday_id,
        period: form.period,
        exception: form.exception,
      })
      .eq("id", form.id);

    if (error) console.error(error);
    else {
      onSaved();
      onClose();
    }
  };

  // 🟥 追加部分：削除処理
  const handleDelete = async () => {
    if (!form.id) return;
    const confirmed = window.confirm("本当にこの授業を削除してよろしいですか？");
    if (!confirmed) return;

    const { error } = await supabase
      .from("jugyos")
      .delete()
      .eq("id", form.id);

    if (error) {
      console.error(error);
      alert("削除に失敗しました。");
    } else {
      alert("削除しました。");
      onSaved(); // 上位で再fetch
      onClose();
    }
  };

  if (!jugyo) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>授業の編集</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid>
            <TextField
              label="年度"
              type="number"
              fullWidth
              margin="dense"
              value={form.year ?? ""}
              onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
            />
          </Grid>
          <Grid>
            <TextField
              select
              label="学期"
              fullWidth
              margin="dense"
              value={form.term_id ?? ""}
              onChange={(e) => setForm({ ...form, term_id: Number(e.target.value) })}
            >
              {terms.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}（{t.year}）
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid>
            <TextField
              select
              label="教員"
              fullWidth
              margin="dense"
              value={form.teacher_id ?? ""}
              onChange={(e) => setForm({ ...form, teacher_id: Number(e.target.value) })}
            >
              {teachers.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.fname} {t.gname}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid>
            <TextField
              select
              label="科目"
              fullWidth
              margin="dense"
              value={form.kamoku_id ?? ""}
              onChange={(e) => setForm({ ...form, kamoku_id: Number(e.target.value) })}
            >
              {kamokus.map((k) => (
                <MenuItem key={k.id} value={k.id}>
                  {k.name}（{k.level}年）
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid>
            <TextField
              select
              label="曜日"
              fullWidth
              margin="dense"
              value={form.wday_id ?? ""}
              onChange={(e) => setForm({ ...form, wday_id: Number(e.target.value) })}
            >
              {wdays.map((w) => (
                <MenuItem key={w.id} value={w.id}>
                  {w.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid>
            <TextField
              label="時限"
              type="number"
              fullWidth
              margin="dense"
              value={form.period ?? ""}
              onChange={(e) => setForm({ ...form, period: Number(e.target.value) })}
            />
          </Grid>
          <Grid>
            <TextField
              select
              label="例外"
              fullWidth
              margin="dense"
              value={form.exception ? "true" : "false"}
              onChange={(e) =>
                setForm({ ...form, exception: e.target.value === "true" })
              }
            >
              <MenuItem value="false">false</MenuItem>
              <MenuItem value="true">true</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        {/* 🟥 追加：削除ボタン */}
        <Button color="error" onClick={handleDelete}>
          削除
        </Button>
        <Button variant="contained" onClick={handleSave}>
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}
//import { useEffect, useState } from "react";
//import {
//  Dialog,
//  DialogTitle,
//  DialogContent,
//  DialogActions,
//  Button,
//  TextField,
//  MenuItem,
//  Grid,
//} from "@mui/material";
//import { supabase } from "../lib/supabaseClient";
//
//// 共通的に使える汎用的Dialog構成
//type Props = {
//  open: boolean;
//  onClose: () => void;
//  jugyo: any | null;
//  onSaved: () => void;
//};
//
//export default function JugyoEditDialog({ open, onClose, jugyo, onSaved }: Props) {
//  const [form, setForm] = useState<any>({});
//  const [teachers, setTeachers] = useState<any[]>([]);
//  const [kamokus, setKamokus] = useState<any[]>([]);
//  const [terms, setTerms] = useState<any[]>([]);
//  const [wdays, setWdays] = useState<any[]>([]);
//
//  // 初期ロード
//  useEffect(() => {
//    const fetchData = async () => {
//      const [tch, kmk, trm, wdy] = await Promise.all([
//        supabase.from("teachers").select("id, fname, gname").order("fyomi"),
//        supabase.from("kamokus").select("id, name, level").order("level"),
//        supabase.from("terms").select("id, name, year").order("year"),
//        supabase.from("wdays").select("id, name, orderkey").order("orderkey"),
//      ]);
//      setTeachers(tch.data || []);
//      setKamokus(kmk.data || []);
//      setTerms(trm.data || []);
//      setWdays(wdy.data || []);
//    };
//    fetchData();
//  }, []);
//
//  // 編集対象セット
//  useEffect(() => {
//    if (jugyo) setForm(jugyo);
//  }, [jugyo]);
//
//  const handleSave = async () => {
//    if (!form.id) return;
//    const { error } = await supabase.from("jugyos").update({
//      year: form.year,
//      term_id: form.term_id,
//      teacher_id: form.teacher_id,
//      kamoku_id: form.kamoku_id,
//      wday_id: form.wday_id,
//      period: form.period,
//      exception: form.exception,
//    }).eq("id", form.id);
//
//    if (error) console.error(error);
//    else {
//      onSaved();
//      onClose();
//    }
//  };
//
//  if (!jugyo) return null;
//
//  return (
//    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
//      <DialogTitle>授業の編集</DialogTitle>
//      <DialogContent>
//        <Grid container spacing={2} sx={{ mt: 0.5 }}>
//          {/*<Grid item xs={6}>*/}
//          <Grid >
//            <TextField
//              label="年度"
//              type="number"
//              fullWidth
//              margin="dense"
//              value={form.year ?? ""}
//              onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
//            />
//          </Grid>
//          {/*<Grid item xs={6}>*/}
//          <Grid>
//            <TextField
//              select
//              label="学期"
//              fullWidth
//              margin="dense"
//              value={form.term_id ?? ""}
//              onChange={(e) => setForm({ ...form, term_id: Number(e.target.value) })}
//            >
//              {terms.map((t) => (
//                <MenuItem key={t.id} value={t.id}>
//                  {t.name}（{t.year}）
//                </MenuItem>
//              ))}
//            </TextField>
//          </Grid>
//          {/*<Grid item xs={6}>*/}
//          <Grid>
//            <TextField
//              select
//              label="教員"
//              fullWidth
//              margin="dense"
//              value={form.teacher_id ?? ""}
//              onChange={(e) => setForm({ ...form, teacher_id: Number(e.target.value) })}
//            >
//              {teachers.map((t) => (
//                <MenuItem key={t.id} value={t.id}>
//                  {t.fname} {t.gname}
//                </MenuItem>
//              ))}
//            </TextField>
//          </Grid>
//          {/*<Grid item xs={6}>*/}
//          <Grid>
//            <TextField
//              select
//              label="科目"
//              fullWidth
//              margin="dense"
//              value={form.kamoku_id ?? ""}
//              onChange={(e) => setForm({ ...form, kamoku_id: Number(e.target.value) })}
//            >
//              {kamokus.map((k) => (
//                <MenuItem key={k.id} value={k.id}>
//                  {k.name}（{k.level}年）
//                </MenuItem>
//              ))}
//            </TextField>
//          </Grid>
//          {/*<Grid item xs={6}>*/}
//          <Grid>
//            <TextField
//              select
//              label="曜日"
//              fullWidth
//              margin="dense"
//              value={form.wday_id ?? ""}
//              onChange={(e) => setForm({ ...form, wday_id: Number(e.target.value) })}
//            >
//              {wdays.map((w) => (
//                <MenuItem key={w.id} value={w.id}>
//                  {w.name}
//                </MenuItem>
//              ))}
//            </TextField>
//          </Grid>
//          {/*<Grid item xs={6}>*/}
//            <Grid>
//            <TextField
//              label="時限"
//              type="number"
//              fullWidth
//              margin="dense"
//              value={form.period ?? ""}
//              onChange={(e) => setForm({ ...form, period: Number(e.target.value) })}
//            />
//          </Grid>
//          <Grid>
//            {/*<Grid item xs={6}>*/}
//            <TextField
//              select
//              label="例外"
//              fullWidth
//              margin="dense"
//              value={form.exception ? "true" : "false"}
//              onChange={(e) =>
//                setForm({ ...form, exception: e.target.value === "true" })
//              }
//            >
//              <MenuItem value="false">false</MenuItem>
//              <MenuItem value="true">true</MenuItem>
//            </TextField>
//          </Grid>
//        </Grid>
//      </DialogContent>
//      <DialogActions>
//        <Button onClick={onClose}>キャンセル</Button>
//        <Button variant="contained" onClick={handleSave}>
//          保存
//        </Button>
//      </DialogActions>
//    </Dialog>
//  );
//}
