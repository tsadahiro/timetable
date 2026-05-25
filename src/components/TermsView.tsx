import { useEffect, useState } from "react";
import {
  Select, MenuItem, InputLabel, FormControl,
  Box, Button, Table, TableHead, TableRow, TableCell,
  TableBody, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { supabase } from "../lib/supabaseClient";

// emptyFormを変更
const currentYear = new Date().getFullYear();
const abbrMap: Record<string, string> = {
  "第1": "T1", "第2": "T2", "第3": "T3", "第4": "T4", "通年": "All"
};
const emptyForm = { year: String(currentYear), name: "第1", abbr: "T1", start: "", end: "", length: "9" };


export default function TermsView() {
  const [terms, setTerms] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchTerms = async () => {
    const { data, error } = await supabase
      .from("terms")
      .select("*")
      .order("year", { ascending: false })
      .order("name", { ascending: true })
      .order("id", { ascending: true });
    if (!error) setTerms(data || []);
  };

  useEffect(() => { fetchTerms(); }, []);

  const handleOpen = () => { setForm(emptyForm); setOpen(true); };
  const handleClose = () => setOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { error } = await supabase.from("terms").insert([{
      year: Number(form.year),
      name: form.name,
      abbr: form.abbr,
      start: form.start || null,
      end: form.end || null,
      length: form.length ? Number(form.length) : null,
    }]);
    if (!error) { fetchTerms(); handleClose(); }
    else alert(error.message);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
        <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={handleOpen}>
          新規追加
        </Button>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>年度</TableCell>
            <TableCell>名称</TableCell>
            <TableCell>短縮名</TableCell>
            <TableCell>開始</TableCell>
            <TableCell>終了</TableCell>
            <TableCell>長さ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {terms.map((t) => (
            <TableRow key={t.id}>
              <TableCell>{t.id}</TableCell>
              <TableCell>{t.year}</TableCell>
              <TableCell>{t.name}</TableCell>
              <TableCell>{t.abbr}</TableCell>
              <TableCell>{t.start}</TableCell>
              <TableCell>{t.end}</TableCell>
              <TableCell>{t.length}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>新規学期追加</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField label="年度" name="year" type="number" value={form.year} onChange={handleChange} size="small" required />
	  <FormControl size="small" required>
	    <InputLabel>名称</InputLabel>
	    <Select
	      label="名称"
	      name="name"
	      value={form.name}
	      onChange={(e) => setForm({ ...form, name: e.target.value, abbr: abbrMap[e.target.value] ?? "" })}
	    >
	      {["第1", "第2", "第3", "第4", "通年"].map((n) => (
		<MenuItem key={n} value={n}>{n}</MenuItem>
	      ))}
	    </Select>
	  </FormControl>	  
          <TextField label="短縮名" name="abbr" value={form.abbr} onChange={handleChange} size="small" />
          <TextField label="開始" name="start" type="date" value={form.start} onChange={handleChange} size="small" InputLabelProps={{ shrink: true }} />
          <TextField label="終了" name="end" type="date" value={form.end} onChange={handleChange} size="small" InputLabelProps={{ shrink: true }} />
          <TextField label="長さ（週数など）" name="length" type="number" value={form.length} onChange={handleChange} size="small" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>キャンセル</Button>
          <Button onClick={handleSubmit} variant="contained">追加</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
//import { useEffect, useState } from "react";
//import {
//  Box, Button, Table, TableHead, TableRow, TableCell,
//  TableBody, Typography, IconButton
//} from "@mui/material";
//import EditIcon from "@mui/icons-material/Edit";
//import AddIcon from "@mui/icons-material/Add";
//import { supabase } from "../lib/supabaseClient";
//
//export default function TermsView() {
//  const [terms, setTerms] = useState<any[]>([]);
//  //const [open, setOpen] = useState(false);
//  //const [selected, setSelected] = useState<any | null>(null);
//  //
//  const fetchTerms = async () => {
//    const { data, error } = await supabase
//      .from("terms")
//      .select("*")
//      .order("year", { ascending: false })
//      .order("name", { ascending: true })
//      .order("id", { ascending: true });
//    if (!error) setTerms(data || []);
//  };
//  
//  useEffect(() => { fetchTerms(); }, []);
//
//  return (
//    <Box >
//      <Table size="small">
//        <TableHead>
//          <TableRow>
//            <TableCell>ID</TableCell>
//            <TableCell>年度</TableCell>
//            <TableCell></TableCell>
//            <TableCell>開始</TableCell>
//            <TableCell>終了</TableCell>
//          </TableRow>
//        </TableHead>
//        <TableBody>
//          {terms.map((t) => (
//            <TableRow key={t.id}>
//              <TableCell>{t.id}</TableCell>
//              <TableCell>{t.year}</TableCell>
//              <TableCell>{t.name}</TableCell>
//              <TableCell>{t.start}</TableCell>
//              <TableCell>{t.end}</TableCell>
//            </TableRow>
//          ))}
//        </TableBody>
//      </Table>
//    </Box>
//  );
//}
