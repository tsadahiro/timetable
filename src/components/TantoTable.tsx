// src/components/TantoTable.tsx

import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

type Props = {
  year: number;
  kamokus: any[];
  jugyos: any[];
  teachers: any[];
  departments: any[];
};

export default function TantoTable({
  year,
  kamokus,
  jugyos,
  teachers,
  departments,
}: Props) {

  /*
   * 開講候補科目
   *
   * 旧学科（数学・情報科学）:
   *   introduced >= 2017
   *   level > year - 2027
   *
   * 新学科（データサイエンス）:
   *   level <= year - 2027
   */
  const candidateKamokus = kamokus.filter((k) => {
    if (k.department_id === 1 || k.department_id === 2) {
      return (
        k.introduced >= 2017 &&
        k.level > year - 2027
      );
    }

    if (k.department_id === 3) {
      return k.level <= year - 2027;
    }

    return false;
  });

  const departmentName = (departmentId: number | null) => {
    const d = departments.find((d) => d.id === departmentId);
    return d?.abbr ?? d?.name ?? "未定";
  };

  const teacherName = (teacherId: number | null) => {
    if (teacherId == null) return "未定";

    const t = teachers.find((t) => t.id === teacherId);

    if (!t) return "未定";

    return `${t.fname ?? ""} ${t.gname ?? ""}`.trim() || "未定";
  };

  /*
   * kamoku 1件から表示行を作る。
   *
   * jugyos 0件 → 未定を1行
   * jugyos n件 → n行
   */
  const rows = candidateKamokus.flatMap((k) => {
    const js = jugyos
      .filter(
        (j) =>
          j.year === year &&
          j.kamoku_id === k.id
      )
      .sort((a, b) => {
        const termA = a.term_id ?? 9999;
        const termB = b.term_id ?? 9999;

        if (termA !== termB) {
          return termA - termB;
        }

        const wdayA = a.wday_id ?? 9999;
        const wdayB = b.wday_id ?? 9999;

        if (wdayA !== wdayB) {
          return wdayA - wdayB;
        }

        return (a.period ?? 9999) - (b.period ?? 9999);
      });

    if (js.length === 0) {
      return [
        {
          key: `kamoku-${k.id}`,
          kamoku: k,
          jugyo: null,
          classNo: 1,
        },
      ];
    }

    return js.map((j, index) => ({
      key: `jugyo-${j.id}`,
      kamoku: k,
      jugyo: j,
      classNo: index + 1,
    }));
  });

  /*
   * 学科 → 学年 → 科目名 の順
   */
  rows.sort((a, b) => {
    const depA = a.kamoku.department_id ?? 999;
    const depB = b.kamoku.department_id ?? 999;

    if (depA !== depB) {
      return depA - depB;
    }

    const levelA = a.kamoku.level ?? 999;
    const levelB = b.kamoku.level ?? 999;

    if (levelA !== levelB) {
      return levelA - levelB;
    }

    return (a.kamoku.name ?? "").localeCompare(
      b.kamoku.name ?? "",
      "ja"
    );
  });

  const termName = (j: any) => {
    return j?.terms?.name ?? "未定";
  };

  const timeName = (j: any) => {
    if (!j) return "未定";

    const wday =
      j.wdays?.name ??
      "未定";

    const period =
      j.period != null
        ? `${j.period}限`
        : "未定";

    if (!j.wday_id && !j.period) {
      return "未定";
    }

    return `${wday} ${period}`;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {year}年度 担当表
      </Typography>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>学科</TableCell>
              <TableCell>学年</TableCell>
              <TableCell>科目</TableCell>
              <TableCell align="center">クラス</TableCell>
              <TableCell>担当者</TableCell>
              <TableCell>ターム</TableCell>
              <TableCell>曜日・時限</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => {
              const k = row.kamoku;
              const j = row.jugyo;

              return (
                <TableRow key={row.key} hover>
                  <TableCell>
                    {departmentName(k.department_id)}
                  </TableCell>

                  <TableCell>
                    {k.level != null
                      ? `${k.level}年`
                      : "未定"}
                  </TableCell>

                  <TableCell>
                    {k.name ?? "未定"}
                  </TableCell>

                  <TableCell align="center">
                    {row.classNo}
                  </TableCell>

                  <TableCell>
                    {teacherName(j?.teacher_id ?? null)}
                  </TableCell>

                  <TableCell>
                    {termName(j)}
                  </TableCell>

                  <TableCell>
                    {timeName(j)}
                  </TableCell>
                </TableRow>
              );
            })}

            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  align="center"
                >
                  開講候補科目がありません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
