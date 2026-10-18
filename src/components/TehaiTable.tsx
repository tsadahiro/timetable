// src/components/TehaiTable.tsx

import { useMemo } from "react";
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

type Props = {
  year: number;
  teachers: any[];
  jugyos: any[];
  kamokus: any[];
  terms: any[];
  wdays: any[];
};

export default function TehaiTable({
  year,
  teachers,
  jugyos,
  kamokus,
  terms,
  wdays,
}: Props) {
  const kamokuMap = useMemo(
    () => new Map(kamokus.map((k) => [k.id, k])),
    [kamokus]
  );

  const termMap = useMemo(
    () => new Map(terms.map((t) => [t.id, t])),
    [terms]
  );

  const wdayMap = useMemo(
    () => new Map(wdays.map((w) => [w.id, w])),
    [wdays]
  );

  const teacherName = (t: any) =>
    t
      ? `${t.fname ?? ""} ${t.gname ?? ""}`.trim() || "未定"
      : "未定";

  const fullTimeTeachers = useMemo(() => {
    const hasJoukinField = teachers.some(
      (t) => typeof t.joukin === "boolean"
    );

    let result: any[];

    if (hasJoukinField) {
      result = teachers.filter((t) => t.joukin === true);
    } else {
      const referencedIds = new Set(
        teachers
          .map((t) => t.ref_id)
          .filter((id) => id != null)
      );

      result = teachers.filter((t) => referencedIds.has(t.id));
    }

    return [...result].sort((a, b) =>
      teacherName(a).localeCompare(teacherName(b), "ja")
    );
  }, [teachers]);

  const jugyosByTeacher = useMemo(() => {
    const map = new Map<number, any[]>();

    for (const j of jugyos ?? []) {
      if (j.year !== year || j.teacher_id == null) continue;

      const list = map.get(j.teacher_id);
      if (list) {
        list.push(j);
      } else {
        map.set(j.teacher_id, [j]);
      }
    }

    for (const list of map.values()) {
      list.sort((a, b) => {
        const termA = a.term_id ?? 9999;
        const termB = b.term_id ?? 9999;
        if (termA !== termB) return termA - termB;

        const wdayA = a.wday_id ?? 9999;
        const wdayB = b.wday_id ?? 9999;
        if (wdayA !== wdayB) return wdayA - wdayB;

        const periodA = a.period ?? 9999;
        const periodB = b.period ?? 9999;
        if (periodA !== periodB) return periodA - periodB;

        const nameA =
          a.kamokus?.name ??
          kamokuMap.get(a.kamoku_id)?.name ??
          "";

        const nameB =
          b.kamokus?.name ??
          kamokuMap.get(b.kamoku_id)?.name ??
          "";

        return nameA.localeCompare(nameB, "ja");
      });
    }

    return map;
  }, [jugyos, year, kamokuMap]);

  const partTimeTeachersFor = (fullTimeTeacherId: number) =>
    teachers
      .filter(
        (t) =>
          t.ref_id === fullTimeTeacherId &&
          (jugyosByTeacher.get(t.id)?.length ?? 0) > 0
      )
      .sort((a, b) =>
        teacherName(a).localeCompare(teacherName(b), "ja")
      );

  const termName = (j: any) =>
    j?.terms?.name ??
    termMap.get(j?.term_id)?.name ??
    "未定";

  const wdayName = (j: any) =>
    j?.wdays?.name ??
    wdayMap.get(j?.wday_id)?.name ??
    "未定";

  const kamokuName = (j: any) =>
    j?.kamokus?.name ??
    kamokuMap.get(j?.kamoku_id)?.name ??
    "科目未定";

  const periodName = (j: any) =>
    j?.period == null ? "未定" : `${j.period}限`;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {year}年度 手配表
      </Typography>

      {fullTimeTeachers.map((fullTime) => {
        const partTimers = partTimeTeachersFor(fullTime.id);

        return (
          <Box
            key={fullTime.id}
            component="section"
            sx={{ mb: 4 }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 1.5,
                pb: 0.7,
                borderBottom: "2px solid",
                borderColor: "divider",
                fontWeight: 700,
              }}
            >
              {teacherName(fullTime)}
            </Typography>

            {partTimers.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ ml: 1 }}
              >
                この年度に連絡担当となっている非常勤教員の授業はありません。
              </Typography>
            ) : (
              partTimers.map((partTime) => {
                const js = jugyosByTeacher.get(partTime.id) ?? [];

                return (
                  <Paper
                    key={partTime.id}
                    variant="outlined"
                    sx={{ mb: 2, overflow: "hidden" }}
                  >
                    <Box
                      sx={{
                        px: 2,
                        py: 1,
                        bgcolor: "grey.50",
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600 }}
                      >
                        {teacherName(partTime)}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {js.length}件
                      </Typography>
                    </Box>

                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>科目</TableCell>
                          <TableCell>ターム</TableCell>
                          <TableCell>曜日</TableCell>
                          <TableCell>時限</TableCell>
                          <TableCell>状態</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {js.map((j) => (
                          <TableRow key={j.id} hover>
                            <TableCell>
                              {kamokuName(j)}
                            </TableCell>

                            <TableCell>
                              {termName(j)}
                            </TableCell>

                            <TableCell
                              sx={{
                                color:
                                  j.wday_id == null
                                    ? "error.main"
                                    : undefined,
                              }}
                            >
                              {wdayName(j)}
                            </TableCell>

                            <TableCell
                              sx={{
                                color:
                                  j.period == null
                                    ? "error.main"
                                    : undefined,
                              }}
                            >
                              {periodName(j)}
                            </TableCell>

                            <TableCell>
                              <Chip
                                size="small"
                                label={
                                  j.confirmed ? "決定" : "未定"
                                }
                                variant={
                                  j.confirmed ? "filled" : "outlined"
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                );
              })
            )}
          </Box>
        );
      })}

      {fullTimeTeachers.length === 0 && (
        <Typography color="text.secondary">
          専任教員が見つかりません。
        </Typography>
      )}
    </Box>
  );
}
