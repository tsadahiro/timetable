import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { supabase } from "../lib/supabaseClient";

export type Forbidden = {
  id: number;
  year: number;
  department_id: number | null;
  term_id: number | null;
  level: number | null;
  hisshu: boolean | null;
  sentaku: boolean | null;
  shwaku: boolean | null;
  wday_id: number | null;
  period: number | null;
  reason: string | null;
};

type Props = {
  open: boolean;
  forbidden: Forbidden | null;
  year: number;
  selectedDepartmentId: number | null;
  terms: any[];
  wdays: any[];
  departments: any[];
  onClose: () => void;
  onSaved: () => void | Promise<void>;
};

type FormState = {
  department_id: number | "";
  term_id: number | "";
  level: number | "";
  hisshu: boolean;
  sentaku: boolean;
  shwaku: boolean;
  wday_id: number | "";
  period: number | "";
  reason: string;
};

export default function ForbiddenEditDialog({
  open,
  forbidden,
  year,
  selectedDepartmentId,
  terms,
  wdays,
  departments,
  onClose,
  onSaved,
}: Props) {
  const [form, setForm] = useState<FormState>({
    department_id: "",
    term_id: "",
    level: "",
    hisshu: false,
    sentaku: false,
    shwaku: false,
    wday_id: "",
    period: "",
    reason: "",
  });
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const yearTerms = useMemo(
    () =>
      terms
        .filter((term) => Number(term.year) === Number(year))
        .sort(
          (a, b) =>
            Number(a.start ? new Date(a.start).getTime() : 0) -
            Number(b.start ? new Date(b.start).getTime() : 0),
        ),
    [terms, year],
  );

  const sortedWdays = useMemo(
    () =>
      [...wdays].sort(
        (a, b) =>
          Number(a.orderkey ?? a.id) - Number(b.orderkey ?? b.id),
      ),
    [wdays],
  );

  useEffect(() => {
    if (!open) return;

    const annualTerm = yearTerms.find((term) => term.name === "通年");
    const monday = sortedWdays.find((wday) => wday.name === "月");

    setForm({
      department_id:
        forbidden != null
          ? forbidden.department_id ?? ""
          : selectedDepartmentId ?? "",
      term_id:
        forbidden != null
          ? forbidden.term_id ?? ""
          : annualTerm?.id ?? "",
      level: forbidden != null ? forbidden.level ?? "" : 1,
      hisshu: Boolean(forbidden?.hisshu),
      sentaku: Boolean(forbidden?.sentaku),
      shwaku: Boolean(forbidden?.shwaku),
      wday_id: forbidden?.wday_id ?? monday?.id ?? "",
      period: forbidden?.period ?? 1,
      reason: forbidden?.reason ?? "",
    });
    setErrorMessage("");
  }, [
    open,
    forbidden,
    selectedDepartmentId,
    yearTerms,
    sortedWdays,
  ]);

  // 現在のDBトリガーが判定しているのは必修・選択なので、
  // 資格枠だけでは保存できないようにする。
  const hasTarget = form.hisshu || form.sentaku;
  const canSave =
    form.wday_id !== "" &&
    form.period !== "" &&
    hasTarget &&
    !saving;

  const handleSave = async () => {
    if (!canSave) return;

    setSaving(true);
    setErrorMessage("");

    const payload = {
      year,
      department_id:
        form.department_id === "" ? null : Number(form.department_id),
      term_id: form.term_id === "" ? null : Number(form.term_id),
      level: form.level === "" ? null : Number(form.level),
      hisshu: form.hisshu,
      sentaku: form.sentaku,
      shwaku: form.shwaku,
      wday_id: Number(form.wday_id),
      period: Number(form.period),
      reason: form.reason.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = forbidden
      ? await supabase.from("forbiddens").update(payload).eq("id", forbidden.id)
      : await supabase.from("forbiddens").insert(payload);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    await onSaved();
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!forbidden) return;
    if (!window.confirm("この禁則を削除しますか？")) return;

    setSaving(true);
    setErrorMessage("");

    const { error } = await supabase
      .from("forbiddens")
      .delete()
      .eq("id", forbidden.id);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    await onSaved();
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{forbidden ? "禁則を編集" : "禁則を追加"}</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <TextField label="年度" value={year} size="small" disabled />

          <FormControl size="small">
            <InputLabel>適用学科</InputLabel>
            <Select
              value={form.department_id}
              label="適用学科"
              onChange={(event) =>
                setForm({
                  ...form,
                  department_id: event.target.value as number | "",
                })
              }
            >
              <MenuItem value="">全学科共通</MenuItem>
              {departments.map((department) => (
                <MenuItem key={department.id} value={department.id}>
                  {department.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>ターム</InputLabel>
              <Select
                value={form.term_id}
                label="ターム"
                onChange={(event) =>
                  setForm({
                    ...form,
                    term_id: event.target.value as number | "",
                  })
                }
              >
                <MenuItem value="">全ターム</MenuItem>
                {yearTerms.map((term) => (
                  <MenuItem key={term.id} value={term.id}>
                    {term.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth required>
              <InputLabel>学年</InputLabel>
              <Select
                value={form.level}
                label="学年"
                onChange={(event) =>
                  setForm({
                    ...form,
                    level: event.target.value as number | "",
                  })
                }
              >
                <MenuItem value="">全学年</MenuItem>
                {[1, 2, 3, 4, 5, 6].map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}年
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl size="small" fullWidth required>
              <InputLabel>曜日</InputLabel>
              <Select
                value={form.wday_id}
                label="曜日"
                onChange={(event) =>
                  setForm({
                    ...form,
                    wday_id: event.target.value as number | "",
                  })
                }
              >
                {sortedWdays.map((wday) => (
                  <MenuItem key={wday.id} value={wday.id}>
                    {wday.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth required>
              <InputLabel>時限</InputLabel>
              <Select
                value={form.period}
                label="時限"
                onChange={(event) =>
                  setForm({
                    ...form,
                    period: event.target.value as number | "",
                  })
                }
              >
                {[1, 2, 3, 4, 5, 6, 7].map((period) => (
                  <MenuItem key={period} value={period}>
                    {period}限
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Box>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.hisshu}
                    onChange={(event) =>
                      setForm({ ...form, hisshu: event.target.checked })
                    }
                  />
                }
                label="必修"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.sentaku}
                    onChange={(event) =>
                      setForm({ ...form, sentaku: event.target.checked })
                    }
                  />
                }
                label="選択"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.shwaku}
                    onChange={(event) =>
                      setForm({ ...form, shwaku: event.target.checked })
                    }
                  />
                }
                label="資格枠"
              />
            </FormGroup>
            {!hasTarget && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                必修または選択を少なくとも1つ選択してください。
              </Alert>
            )}
          </Box>

          <TextField
            label="理由"
            value={form.reason}
            onChange={(event) =>
              setForm({ ...form, reason: event.target.value })
            }
            multiline
            minRows={2}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Box>
          {forbidden && (
            <Button color="error" onClick={handleDelete} disabled={saving}>
              削除
            </Button>
          )}
        </Box>

        <Stack direction="row" spacing={1}>
          <Button onClick={onClose} disabled={saving}>
            キャンセル
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!canSave}
          >
            {saving ? "保存中…" : "保存"}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
