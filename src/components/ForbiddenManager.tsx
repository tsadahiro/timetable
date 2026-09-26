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

const STANDARD_WDAY_NAMES = new Set(["月", "火", "水", "木", "金"]);

export default function ForbiddenManager({
  year,
  selectedDepartmentId,
  forbiddens,
  wdays,
  terms,
}: ForbiddenManagerProps) {
  const visibleForbiddens = forbiddens.filter((forbidden) => {
    if (Number(forbidden.year) !== Number(year)) {
      return false;
    }

    // 「全学科」のときは、共通規則と学科固有規則をすべて表示する。
    if (selectedDepartmentId === null) {
      return true;
    }

    // 学科を選んだときは、全学科共通または当該学科の規則を表示する。
    return (
      forbidden.department_id == null ||
      Number(forbidden.department_id) === Number(selectedDepartmentId)
    );
  });

  const usedWdayIds = new Set(
    visibleForbiddens
      .map((forbidden) => forbidden.wday_id)
      .filter((id) => id != null)
      .map(Number),
  );

  // 月〜金は常に表示し、土日などは禁則が登録されているときだけ表示する。
  const displayWdays = wdays
    .filter(
      (wday) =>
        STANDARD_WDAY_NAMES.has(wday.name) || usedWdayIds.has(Number(wday.id)),
    )
    .sort(
      (a, b) =>
        Number(a.orderkey ?? a.id) - Number(b.orderkey ?? b.id),
    );

  const maxPeriod = Math.max(
    5,
    ...visibleForbiddens
      .map((forbidden) => Number(forbidden.period))
      .filter((period) => Number.isFinite(period) && period > 0),
  );
  const periods = Array.from({ length: maxPeriod }, (_, index) => index + 1);

  const termName = (termId: number | null) => {
    if (termId == null) {
      return "全ターム";
    }

    return (
      terms.find((term) => Number(term.id) === Number(termId))?.name ??
      `不明（ID: ${termId}）`
    );
  };

  const termOrder = (termId: number | null) => {
    const order: Record<string, number> = {
      "全ターム": 0,
      通年: 0,
      第1: 1,
      第2: 2,
      第3: 3,
      第4: 4,
    };

    return order[termName(termId)] ?? 99;
  };

  const rulesAt = (wdayId: number, period: number) =>
    visibleForbiddens
      .filter(
        (forbidden) =>
          Number(forbidden.wday_id) === Number(wdayId) &&
          Number(forbidden.period) === period,
      )
      .sort(
        (a, b) =>
          termOrder(a.term_id) - termOrder(b.term_id) ||
          Number(a.level ?? 0) - Number(b.level ?? 0) ||
          Number(a.id) - Number(b.id),
      );

  const unscheduledRules = visibleForbiddens.filter(
    (forbidden) => forbidden.wday_id == null || forbidden.period == null,
  );

  const LEVEL_CHIP_STYLES: Record<
  number,
	{ backgroundColor: string; color: string }
  > = {
    1: {
      backgroundColor: "#d32f2f", // 赤
      color: "#ffffff",
    },
    2: {
      backgroundColor: "#1976d2", // 青
      color: "#ffffff",
    },
    3: {
      backgroundColor: "#ff9800", // オレンジ
      color: "#000000",
    },
    4: {
      backgroundColor: "#2e7d32", // グリーン
      color: "#ffffff",
    },
  };
  
  const RuleCard = ({ forbidden }: { forbidden: any }) => {
    const categories = [
      forbidden.hisshu ? "必修" : null,
      forbidden.sentaku ? "選択" : null,
      forbidden.shwaku ? "資格枠" : null,
    ].filter((label): label is string => label !== null);

    return (
      <Paper
        variant="outlined"
        sx={{
          p: 1,
          bgcolor:
            forbidden.department_id == null
              ? "grey.50"
              : "rgba(25, 118, 210, 0.05)",
        }}
      >
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          <Chip label={termName(forbidden.term_id)} size="small" />
          <Chip
	    label={
	    forbidden.level != null
	    ? `${forbidden.level}年`
	    : "全学年"
	    }
	    size="small"
	    sx={{
	      ...(forbidden.level != null
		? LEVEL_CHIP_STYLES[Number(forbidden.level)]
		: {
		  backgroundColor: "#757575",
		  color: "#ffffff",
              }),
	      fontWeight: "bold",
	    }}
	  />
          {categories.map((category) => (
            <Chip
              key={category}
              label={category}
              size="small"
              color={category === "必修" ? "error" : "warning"}
              variant="outlined"
            />
          ))}
        </Stack>

        <Typography variant="body2" sx={{ mt: 0.75, lineHeight: 1.35 }}>
          {forbidden.reason || "理由未入力"}
        </Typography>

        {selectedDepartmentId === null && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 0.5 }}
          >
            {forbidden.department_id == null
              ? "全学科共通"
              : `学科ID ${forbidden.department_id}`}
          </Typography>
        )}
      </Paper>
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
        <Typography variant="h5">{year}年度 禁則表</Typography>
        <Typography variant="body2" color="text.secondary">
          {visibleForbiddens.length}件
        </Typography>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table
          size="small"
          aria-label={`${year}年度の曜日・時限別禁則表`}
          sx={{ tableLayout: "fixed", minWidth: 900 }}
        >
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.100" }}>
              <TableCell
                align="center"
                sx={{ width: 72, fontWeight: "bold" }}
              >
                曜日
              </TableCell>
              {periods.map((period) => (
                <TableCell
                  key={period}
                  align="center"
                  sx={{ fontWeight: "bold" }}
                >
                  {period}限
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {displayWdays.map((wday) => (
              <TableRow key={wday.id}>
                <TableCell
                  component="th"
                  scope="row"
                  align="center"
                  sx={{
                    bgcolor: "grey.50",
                    fontWeight: "bold",
                    verticalAlign: "top",
                  }}
                >
                  {wday.name}曜日
                </TableCell>

                {periods.map((period) => {
                  const rules = rulesAt(wday.id, period);

                  return (
                    <TableCell
                      key={period}
                      sx={{
                        p: 0.75,
                        height: 88,
                        verticalAlign: "top",
                        bgcolor:
                          rules.length > 0
                            ? "rgba(211, 47, 47, 0.04)"
                            : "inherit",
                      }}
                    >
                      <Stack spacing={0.75}>
                        {rules.map((forbidden) => (
                          <RuleCard
                            key={forbidden.id}
                            forbidden={forbidden}
                          />
                        ))}
                      </Stack>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {visibleForbiddens.length === 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 2 }}
        >
          該当する禁則はありません。
        </Typography>
      )}

      {unscheduledRules.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            曜日・時限未指定
          </Typography>
          <Stack spacing={1}>
            {unscheduledRules.map((forbidden) => (
              <RuleCard key={forbidden.id} forbidden={forbidden} />
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
