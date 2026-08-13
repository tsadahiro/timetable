import { useState } from "react";
import {
  Box, Button, Table, TableHead, TableRow, TableCell,
  TableBody, Typography, IconButton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
//import { supabase } from "../lib/supabaseClient";
import KamokuDialog from "./KamokuDialog";

type Kamoku = {
  id: number;
  name: string;
  introduced?: number | null;
  level?: number | null;
  hisshu?: boolean | null;
  sentakuhi?: boolean | null;
  kyoshoku?: boolean | null;
  credit?: number | null;
  dm?: boolean | null;
  department_id?: number | null;
  departments?: {
    id: number;
    name: string;
    abbr?: string | null;
  } | null;
};

export default function KamokuManager({
  kamokus,
  fetchMaster,
}:{
  kamokus: Kamoku[];
  fetchMaster: any;
}
) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

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
            <TableCell>学科</TableCell>
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
          {kamokus.map((k: Kamoku) => (
            <TableRow key={k.id}>
              <TableCell>{k.id}</TableCell>
              <TableCell>{k.departments?.name ?? ""}</TableCell>
              <TableCell>{k.name}</TableCell>
              <TableCell>{k.introduced}</TableCell>
              <TableCell>{k.level}</TableCell>
              <TableCell>{k.hisshu ? "○" : ""}</TableCell>
              <TableCell>{k.sentakuhi ? "○" : ""}</TableCell>
              <TableCell>{k.kyoshoku ? "○" : ""}</TableCell>
              <TableCell>{k.credit}</TableCell>
              <TableCell>{k.dm ? "○" : ""}</TableCell>
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
        onSaved={fetchMaster}
      />
    </Box>
  );
}
