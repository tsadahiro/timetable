import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { supabase } from "../lib/supabaseClient";
import {
  formatClassDate,
  getClassDates,
  WEEKDAYS,
} from "../utils/classDates";
import type { CalendarPeriodForDates } from "../utils/classDates";

const currentYear = new Date().getFullYear();
const abbrMap: Record<string, string> = {
  第1: "T1",
  第2: "T2",
  第3: "T3",
  第4: "T4",
  通年: "A",
};
const termOrder: Record<string, number> = {
  第1: 1,
  第2: 2,
  第3: 3,
  第4: 4,
  通年: 5,
};

const emptyForm = {
  year: String(currentYear),
  name: "第1",
  abbr: "T1",
  start: "",
  end: "",
  length: "8",
};

export type Term = {
  id: number;
  name: string;
  year: number;
  start: string;
  end: string;
  abbr: string;
  length: number;
};

type Props = {
  year: number;
  terms: Term[];
  calendarPeriods?: CalendarPeriodForDates[];
  onSaved: () => void | Promise<void>;
};

export default function TermsView({
  year,
  terms,
  calendarPeriods = [],
  onSaved,
}: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const visibleTerms = terms
    .filter((term) => Number(term.year) === Number(year))
    .sort(
      (a, b) =>
        (termOrder[a.name] ?? 99) - (termOrder[b.name] ?? 99) ||
        Number(a.id) - Number(b.id),
    );

  const handleOpen = () => {
    setForm({
      ...emptyForm,
      year: String(year),
    });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async () => {
    const { error } = await supabase.from("terms").insert([
      {
        year: Number(form.year),
        name: form.name,
        abbr: form.abbr,
        start: form.start || null,
        end: form.end || null,
        length: form.length ? Number(form.length) : null,
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    await onSaved();
    handleClose();
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">{year}年度 ターム・授業日程</Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          size="small"
          onClick={handleOpen}
        >
          新規追加
        </Button>
      </Box>

      <Stack spacing={1}>
        {visibleTerms.map((term) => (
          <Accordion key={term.id} disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 0.25, sm: 2 }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                sx={{ width: "100%", pr: 1 }}
              >
                <Typography sx={{ minWidth: 80, fontWeight: "bold" }}>
                  {term.name}
                </Typography>
                <Typography variant="body2">
                  {term.start || "開始日未設定"} ～ {term.end || "終了日未設定"}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: { sm: "auto !important" } }}
                >
                  {term.length != null ? term.length + "週" : "週数未設定"}
                </Typography>
              </Stack>
            </AccordionSummary>

            <AccordionDetails sx={{ px: { xs: 1, sm: 2 } }}>
              <Table
                size="small"
                aria-label={term.name + "の曜日別授業日程"}
              >
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.100" }}>
                    <TableCell sx={{ width: 72, fontWeight: "bold" }}>
                      曜日
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>開講予定日</TableCell>
                    <TableCell
                      align="right"
                      sx={{ width: 72, fontWeight: "bold" }}
                    >
                      回数
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {WEEKDAYS.map((weekday) => {
                    const dates = getClassDates(
                      term,
                      weekday.day,
                      terms,
                      calendarPeriods,
                    );

                    return (
                      <TableRow key={weekday.day}>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          {weekday.name}
                        </TableCell>
                        <TableCell>
                          {dates.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                              日程なし
                            </Typography>
                          ) : (
                            <Stack
                              direction="row"
                              spacing={0.5}
                              flexWrap="wrap"
                              useFlexGap
                            >
                              {dates.map((date) => (
                                <Chip
                                  key={date}
                                  label={formatClassDate(date)}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Stack>
                          )}
                        </TableCell>
                        <TableCell align="right">{dates.length}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {calendarPeriods.length === 0 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 1 }}
                >
                  現在は開始日・終了日から計算しています。休校日・休講日を反映するには
                  calendarPeriods を渡してください。
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>

      {visibleTerms.length === 0 && (
        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
          {year}年度のタームが登録されていません。
        </Typography>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>新規学期追加</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="年度"
            name="year"
            type="number"
            value={form.year}
            onChange={handleChange}
            size="small"
            required
          />

          <FormControl size="small" required>
            <InputLabel>名称</InputLabel>
            <Select
              label="名称"
              name="name"
              value={form.name}
              onChange={(event) =>
                setForm({
                  ...form,
                  name: event.target.value,
                  abbr: abbrMap[event.target.value] ?? "",
                  length: event.target.value === "通年" ? "24" : "8",
                })
              }
            >
              {["第1", "第2", "第3", "第4", "通年"].map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="短縮名"
            name="abbr"
            value={form.abbr}
            onChange={handleChange}
            size="small"
          />
          <TextField
            label="開始"
            name="start"
            type="date"
            value={form.start}
            onChange={handleChange}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="終了"
            name="end"
            type="date"
            value={form.end}
            onChange={handleChange}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="長さ（週数）"
            name="length"
            type="number"
            value={form.length}
            onChange={handleChange}
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>キャンセル</Button>
          <Button onClick={handleSubmit} variant="contained">
            追加
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
