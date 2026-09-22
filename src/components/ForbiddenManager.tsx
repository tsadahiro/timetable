import {
  Box,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

type ForbiddenManagerProps = {
  year: number;
  selectedDepartmentId: number | null;
  forbiddens: any[];
  wdays: any[];
  terms: any[];
  onSaved: () => Promise<void>;
};

export default function ForbiddenManager({
  year,
  selectedDepartmentId,
  forbiddens,
  wdays,
  terms,
}: ForbiddenManagerProps) {
  const visibleForbiddens = forbiddens
    .filter((forbidden) => {
      if (Number(forbidden.year) !== Number(year)) {
        return false;
      }

      // 「全学科」のときは、共通規則と学科固有規則をすべて表示する。
      if (selectedDepartmentId === null) {
        return true;
      }

      // 学科を選んだときは、全学科共通または当該学科の規則を表示する。
      return (
        forbidden.department_id === null ||
        forbidden.department_id === undefined ||
        Number(forbidden.department_id) === Number(selectedDepartmentId)
      );
    })
    .sort(
      (a, b) =>
        Number(a.term_id ?? 0) - Number(b.term_id ?? 0) ||
        Number(a.level ?? 0) - Number(b.level ?? 0) ||
        Number(a.wday_id ?? 0) - Number(b.wday_id ?? 0) ||
        Number(a.period ?? 0) - Number(b.period ?? 0) ||
        Number(a.id) - Number(b.id),
    );

  const termName = (termId: number | null) => {
    if (termId === null || termId === undefined) {
      return "全ターム";
    }

    return (
      terms.find((term) => Number(term.id) === Number(termId))?.name ??
      `不明（ID: ${termId}）`
    );
  };

  const wdayName = (wdayId: number | null) => {
    if (wdayId === null || wdayId === undefined) {
      return "未指定";
    }

    return (
      wdays.find((wday) => Number(wday.id) === Number(wdayId))?.name ??
      `不明（ID: ${wdayId}）`
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1}
        sx={{ mb: 2 }}
      >
        <Typography variant="h5">
          {year}年度 時間帯調整資料
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {visibleForbiddens.length}件
        </Typography>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small" aria-label={`${year}年度の禁則一覧`}>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.100" }}>
              <TableCell>ID</TableCell>
              <TableCell>ターム</TableCell>
              <TableCell>学年</TableCell>
              <TableCell>曜日</TableCell>
              <TableCell>時限</TableCell>
              <TableCell>対象</TableCell>
              <TableCell>理由</TableCell>
              <TableCell>適用学科</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {visibleForbiddens.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ py: 2 }}
                  >
                    該当する禁則はありません。
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              visibleForbiddens.map((forbidden) => {
                const categories = [
                  forbidden.hisshu
                    ? { label: "必修", color: "error" as const }
                    : null,
                  forbidden.sentaku
                    ? { label: "選択", color: "warning" as const }
                    : null,
                  forbidden.shwaku
                    ? { label: "資格枠", color: "info" as const }
                    : null,
                ].filter(
                  (
                    item,
                  ): item is {
                    label: string;
                    color: "error" | "warning" | "info";
                  } => item !== null,
                );

                return (
                  <TableRow key={forbidden.id} hover>
                    <TableCell>{forbidden.id}</TableCell>
                    <TableCell>{termName(forbidden.term_id)}</TableCell>
                    <TableCell>
                      {forbidden.level != null
                        ? `${forbidden.level}年`
                        : "全学年"}
                    </TableCell>
                    <TableCell>{wdayName(forbidden.wday_id)}</TableCell>
                    <TableCell>
                      {forbidden.period != null
                        ? `${forbidden.period}限`
                        : "未指定"}
                    </TableCell>
                    <TableCell>
                      {categories.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          指定なし
                        </Typography>
                      ) : (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {categories.map((category) => (
                            <Chip
                              key={category.label}
                              label={category.label}
                              color={category.color}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      )}
                    </TableCell>
                    <TableCell sx={{ minWidth: 240 }}>
                      {forbidden.reason ?? (
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          理由未入力
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {forbidden.department_id == null
                        ? "全学科共通"
                        : `学科ID ${forbidden.department_id}`}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
