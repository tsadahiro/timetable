import { useEffect, useState } from "react";
import {
  Box, Button, Table, TableHead, TableRow, TableCell,
  TableBody, Typography, IconButton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { supabase } from "../lib/supabaseClient";
import KamokuDialog from "./KamokuDialog";

export default function KamokuManager() {
  const [kamokus, setKamokus] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

  const fetchKamokus = async () => {
    const { data, error } = await supabase
      .from("kamokus")
      .select("*")
      .order("level", { ascending: true })
      .order("id", { ascending: true });
    if (!error) setKamokus(data || []);
  };

  useEffect(() => { fetchKamokus(); }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">科目一覧</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setSelected(null); setOpen(true); }}
        >
          新規作成
        </Button>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>科目名</TableCell>
            <TableCell>導入年度</TableCell>
            <TableCell>開講年次</TableCell>
            <TableCell>必修</TableCell>
            <TableCell>選択必修</TableCell>
            <TableCell>教職</TableCell>
            <TableCell>単位</TableCell>
            <TableCell>DM</TableCell>
            <TableCell align="right">操作</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {kamokus.map((k) => (
            <TableRow key={k.id}>
              <TableCell>{k.id}</TableCell>
              <TableCell>{k.name}</TableCell>
              <TableCell>{k.introduced}</TableCell>
              <TableCell>{k.level}</TableCell>
              <TableCell>{k.hisshu ? "○" : ""}</TableCell>
              <TableCell>{k.sentakuhi ? "○" : ""}</TableCell>
              <TableCell>{k.kyoshoku ? "○" : ""}</TableCell>
              <TableCell>{k.credit}</TableCell>
              <TableCell>{k.DM ? "○" : ""}</TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={() => { setSelected(k); setOpen(true); }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <KamokuDialog
        open={open}
        onClose={() => setOpen(false)}
        kamoku={selected}
        onSaved={fetchKamokus}
      />
    </Box>
  );
}
