// src/components/TantoTable.tsx

import { useCallback, useMemo, useState } from "react";

import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";

import JugyoEditDialog from "./JugyoEditDialog";

type Props = {
  year: number;
  kamokus: any[];
  jugyos: any[];
  previousJugyos: any[];
  teachers: any[];
  departments: any[];
  terms: any[];
  wdays: any[];
  selectedDepartmentId: number | null;

  onSaveJugyo: (
    jugyo: any,
    deleted?: boolean
  ) => Promise<void>;
};

const jugyoSort = (a: any, b: any) => {
  const termA = a.term_id ?? 9999;
  const termB = b.term_id ?? 9999;
  if (termA !== termB) return termA - termB;

  const wdayA = a.wday_id ?? 9999;
  const wdayB = b.wday_id ?? 9999;
  if (wdayA !== wdayB) return wdayA - wdayB;

  return (a.period ?? 9999) - (b.period ?? 9999);
};

export default function TantoTable({
  year,
  kamokus,
  jugyos,
  previousJugyos,
  teachers,
  departments,
  terms,
  wdays,
  selectedDepartmentId,
  onSaveJugyo,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selectedJugyo, setSelectedJugyo] = useState<any>(null);
  const [isNew, setIsNew] = useState(false);

  /*
   * 一覧検索用 Map。
   * render 中の Array.find() の繰り返しを避ける。
   */
  const teacherMap = useMemo(
    () => new Map(teachers.map((t) => [t.id, t])),
    [teachers]
  );

  const departmentMap = useMemo(
    () => new Map(departments.map((d) => [d.id, d])),
    [departments]
  );

  const termMap = useMemo(
    () => new Map(terms.map((t) => [t.id, t])),
    [terms]
  );

  const wdayMap = useMemo(
    () => new Map(wdays.map((w) => [w.id, w])),
    [wdays]
  );

  /*
   * 開講候補科目
   *
   * 旧学科（数学・情報科学）
   *   introduced >= 2017
   *   level > year - 2027
   *
   * 新学科（データサイエンス）
   *   level <= year - 2027
   */
  const candidateKamokus = useMemo(
    () =>
      kamokus
        .filter((k) => {
          if (
            selectedDepartmentId !== null &&
            selectedDepartmentId !== k.department_id
          ) {
            return false;
          }

          if (k.old) {
            return false;
          }

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
        })
        .slice()
	.sort((a, b) => {
	  // 学科
	  const depA = a.department_id ?? 999;
	  const depB = b.department_id ?? 999;

	  if (depA !== depB) {
	    return depA - depB;
	  }

	  // 学年
	  const levelA = a.level ?? 999;
	  const levelB = b.level ?? 999;

	  if (levelA !== levelB) {
	    return levelA - levelB;
	  }

	  // 同じ学科・学年なら必修を先に
	  const hisshuA = a.hisshu ? 0 : 1;
	  const hisshuB = b.hisshu ? 0 : 1;

	  if (hisshuA !== hisshuB) {
	    return hisshuA - hisshuB;
	  }

	  // 最後に科目名
	  return (a.name ?? "").localeCompare(
	    b.name ?? "",
	    "ja"
	  );
	}),
    //.sort((a, b) => {
    //      const depA = a.department_id ?? 999;
    //      const depB = b.department_id ?? 999;
    //      if (depA !== depB) return depA - depB;
    //
    //      const levelA = a.level ?? 999;
    //      const levelB = b.level ?? 999;
    //      if (levelA !== levelB) return levelA - levelB;
    //
    //      return (a.name ?? "").localeCompare(
    //        b.name ?? "",
    //        "ja"
    //      );
      //  }),
    [kamokus, selectedDepartmentId, year]
  );

  /*
   * jugyos を科目ごとに一度だけグループ化。
   * 以前は各科目ごとに jugyos 全件を filter + sort していた。
   */
  const jugyosByKamoku = useMemo(() => {
    const map = new Map<number, any[]>();

    for (const j of jugyos) {
      if (j.year !== year) continue;

      const list = map.get(j.kamoku_id);
      if (list) {
        list.push(j);
      } else {
        map.set(j.kamoku_id, [j]);
      }
    }

    for (const list of map.values()) {
      list.sort(jugyoSort);
    }

    return map;
  }, [jugyos, year]);

  /*
   * 前年度も同様に一度だけグループ化。
   */
  const previousJugyosByKamoku = useMemo(() => {
    const map = new Map<number, any[]>();

    for (const j of previousJugyos) {
      const list = map.get(j.kamoku_id);
      if (list) {
        list.push(j);
      } else {
        map.set(j.kamoku_id, [j]);
      }
    }

    for (const list of map.values()) {
      list.sort(jugyoSort);
    }

    return map;
  }, [previousJugyos]);

  const departmentName = useCallback(
    (departmentId: number | null) => {
      const d = departmentMap.get(departmentId);
      return d?.abbr ?? d?.name ?? "未定";
    },
    [departmentMap]
  );

  const teacherName = useCallback(
    (teacherId: number | null) => {
      if (teacherId == null) return "未定";

      const t = teacherMap.get(teacherId);
      if (!t) return "未定";

      const ref =
        t.ref_id != null
          ? teacherMap.get(t.ref_id)
          : undefined;

      const renraku = ref ? `(${ref.fname})` : "";

      return (
        `${t.fname ?? ""} ${t.gname ?? ""} ${renraku}`.trim() ||
        "未定"
      );
    },
    [teacherMap]
  );

  const teacherNameCell = useCallback(
    (teacherId: number | null) => {
      if (teacherId == null) {
        return (
          <TableCell sx={{ color: "red" }}>
            未定
          </TableCell>
        );
      }

      const t = teacherMap.get(teacherId);
      if (!t) {
        return <TableCell>未定</TableCell>;
      }

      const ref =
        t.ref_id != null
          ? teacherMap.get(t.ref_id)
          : undefined;

      const renraku = ref ? `(${ref.fname})` : "";

      return (
        <TableCell>
          {`${t.fname ?? ""} ${t.gname ?? ""} ${renraku}`.trim()}
        </TableCell>
      );
    },
    [teacherMap]
  );

  const termName = useCallback(
    (j: any) => {
      if (j?.terms?.name) return j.terms.name;
      return termMap.get(j?.term_id)?.name ?? "未定";
    },
    [termMap]
  );

  const wdayName = useCallback(
    (j: any) => {
      if (j?.wdays?.name) return j.wdays.name;
      return wdayMap.get(j?.wday_id)?.name ?? "未定";
    },
    [wdayMap]
  );

  const periodName = useCallback((j: any) => {
    if (j?.period == null) return "未定";
    return `${j.period}限`;
  }, []);

  /*
   * 新規割当
   */
  const handleNew = useCallback(
    (kamoku: any) => {
      setSelectedJugyo({
        year,
        kamoku_id: kamoku.id,
        department_id: kamoku.department_id,
        teacher_id: null,
        term_id: null,
        wday_id: null,
        period: null,
        excercise: false,
        exception: false,
        confirmed: false,
        notes: null,
        comment: null,
        kaisuu: 9,
      });

      setIsNew(true);
      setOpen(true);
    },
    [year]
  );

  const handleEdit = useCallback((jugyo: any) => {
    setSelectedJugyo(jugyo);
    setIsNew(false);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setSelectedJugyo(null);
    setIsNew(false);
  }, []);

  const handleSaved = useCallback(
    async (jugyo: any, deleted = false) => {
      await onSaveJugyo(jugyo, deleted);
    },
    [onSaveJugyo]
  );

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {year}年度 担当表
      </Typography>

      {candidateKamokus.map((k) => {
        const js = jugyosByKamoku.get(k.id) ?? [];
        const previousJs =
          previousJugyosByKamoku.get(k.id) ?? [];

        return (
          <Paper
            key={k.id}
            variant="outlined"
            sx={{
              mb: 2,
              overflow: "hidden",
            }}
          >
            {/* 科目見出し */}
            <Box
              sx={{
                px: 2,
                py: 1,
                display: "flex",
                alignItems: "center",
                gap: 2,
                bgcolor: "grey.50",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: k.hisshu
                      ? "#a03030"
                      : "#3030a0",
                  }}
                >
                  {k.name}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {k.category === "department_specialized"
                    ? departmentName(k.department_id)
                    : ""}
                  {" / "}
                  {k.level != null
                    ? `${k.level}年`
                    : "学年未定"}
                </Typography>

                {previousJs.length > 0 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 0.3 }}
                  >
                    前年度：
                    {previousJs.map((j, index) => (
                      <span key={j.id}>
                        {index > 0 && " / "}
                        {teacherName(j.teacher_id)}{" "}
                        {termName(j)}{" "}
                        {wdayName(j)}
                        {j.period != null
                          ? `${j.period}限`
                          : ""}
                      </span>
                    ))}
                  </Typography>
                )}
              </Box>

              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "nowrap",
                  fontWeight: 500,
                  color: js.length === 0 ? "red" : undefined,
                }}
              >
                計 {js.length} クラス
              </Typography>

              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleNew(k)}
              >
                新規割当
              </Button>
            </Box>

            {/* 担当一覧 */}
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>担当者</TableCell>
                  <TableCell>学期</TableCell>
                  <TableCell>曜日</TableCell>
                  <TableCell>時限</TableCell>
                  <TableCell>演習</TableCell>
                  <TableCell>状態</TableCell>
                  <TableCell
                    align="right"
                    sx={{ width: 100 }}
                  />
                </TableRow>
              </TableHead>

              <TableBody>
                {js.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      sx={{
                        color: "text.secondary",
                        py: 1.5,
                      }}
                    >
                      まだ担当が割り当てられていません
                    </TableCell>
                  </TableRow>
                ) : (
                  js.map((j) => (
                    <TableRow key={j.id} hover>
                      {teacherNameCell(j.teacher_id)}

                      <TableCell>
                        {termName(j)}
                      </TableCell>

                      <TableCell>
                        {wdayName(j)}
                      </TableCell>

                      <TableCell>
                        {periodName(j)}
                      </TableCell>

                      <TableCell>
                        {j.excercise ? "演習" : ""}
                      </TableCell>

                      <TableCell
                        sx={{
                          color: j.confirmed
                            ? "blue"
                            : "red",
                        }}
                      >
                        {j.confirmed ? "決定" : "未定"}
                      </TableCell>

                      <TableCell align="right">
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEdit(j)}
                        >
                          編集
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        );
      })}

      {candidateKamokus.length === 0 && (
        <Typography
          color="text.secondary"
          sx={{ p: 2 }}
        >
          開講候補科目がありません
        </Typography>
      )}

      <JugyoEditDialog
        open={open}
        onClose={handleClose}
        jugyo={selectedJugyo}
        onSaved={handleSaved}
        isNew={isNew}
        teachers={teachers}
        /*
         * 担当表から開くダイアログでは、廃止済み科目などを
         * 選択肢に大量表示する必要がないため候補科目だけ渡す。
         * これも Dialog 初期表示の軽量化に効く。
         */
        kamokus={candidateKamokus}
        terms={terms}
        wdays={wdays}
        departments={departments}
        selectedDepartmentId={
          selectedJugyo?.department_id ??
          selectedDepartmentId
        }
      />
    </Box>
  );
}
