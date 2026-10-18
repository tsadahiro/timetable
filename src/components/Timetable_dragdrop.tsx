import { useState } from "react";
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Chip,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import { supabase } from "../lib/supabaseClient";
import JugyoEditDialog from "./JugyoEditDialog";

type TimetableProps = {
  jugyos: any;
  fetchJugyos: any;
  year: number;
  termName: string;
  teachers: any[];
  kamokus: any[];
  terms: any[];
  wdays: any[];
  departments: any[];
  selectedDepartmentId: number | null;
};

export default function Timetable({jugyos,
				   fetchJugyos,
				   year,
				   termName,
				   teachers,
				   kamokus,
				   terms,
				   wdays,
				   departments,
				   selectedDepartmentId
				   }:TimetableProps) {
  const [selectedJugyo, setSelectedJugyo] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const [draggedJugyo, setDraggedJugyo] = useState<any>(null);
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);
  const [dragOverTermId, setDragOverTermId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const days = ["月", "火", "水", "木", "金"];
  const periods = [1, 2, 3, 4, 5];
  
  const levelcolor = ["red","red","blue","orange","green","purple"]
  // 指定曜日・時限にあるすべての授業を取得
  const jugyosAt = (wdayId: number, period: number) =>
    (jugyos ?? []).filter((j: any) =>
      j.wday_id === wdayId && j.period === period &&
				    ((j.terms?.name === termName || j.terms?.name === "通年") && termName !== "第2"||
				     (j.terms?.name === termName && termName === "第2"))
    );

  const handleSave = async (
    jugyo: any | null,
    deleted = false
  ) => {
    // 削除自体はJugyoEditDialogで完了している
    if (deleted) {
      await fetchJugyos();
      return;
    }

    if (!jugyo) return;

    const cleanData = {
      year: jugyo.year,
      term_id: jugyo.term_id,
      department_id: jugyo.department_id ?? null,
      teacher_id: jugyo.teacher_id,
      kamoku_id: jugyo.kamoku_id,
      wday_id: jugyo.wday_id,
      period: jugyo.period,
      excercise: jugyo.excercise ?? false,
      exception: jugyo.exception ?? false,
      confirmed: jugyo.confirmed ?? false,
      notes: jugyo.notes ?? null,
      comment: jugyo.comment ?? null,
      kaisuu: jugyo.kaisuu ?? null,
    };

    const { error } = jugyo.id
		    ? await supabase
		      .from("jugyos")
		      .update(cleanData)
		      .eq("id", jugyo.id)
		    : await supabase
		      .from("jugyos")
		      .insert(cleanData);

    if (error) {
      console.error("drag/drop term change error:", error);

      setErrorMessage(
	error.message || "このタームには移動できません。"
      );

      return;
    }

    await fetchJugyos();
  };  
  //const handleSave = async (jugyo: any) => {
  //  const cleanData = {
  //    year: jugyo.year,
  //    term_id: jugyo.term_id,
  //    department_id: jugyo.department_id ?? null,
  //    teacher_id: jugyo.teacher_id,
  //    kamoku_id: jugyo.kamoku_id,
  //    wday_id: jugyo.wday_id,
  //    period: jugyo.period,
  //    excercise: jugyo.excercise ?? false,
  //    exception: jugyo.exception ?? false,
  //    notes: jugyo.notes ?? null,
  //    comment: jugyo.comment ?? null,
  //    kaisuu: jugyo.kaisuu ?? null,
  //  };
  //
  //  const { error } = jugyo.id
  //		    ? await supabase
  //		      .from("jugyos")
  //		      .update(cleanData)
  //		      .eq("id", jugyo.id)
  //		    : await supabase
  //		      .from("jugyos")
  //		      .insert(cleanData);
  //
  //  if (error) {
  //    console.error("jugyo save error:", error);
  //    // 呼び出し側へ失敗を伝える
  //    throw error;
  //  }
  //  
  //  //if (jugyo.id) {
  //  //  await supabase.from("jugyos").update(data).eq("id", jugyo.id);
  //  //} else {
  //  //  await supabase.from("jugyos").insert(data);
  //  //}
  //  await fetchJugyos(); // 保存後に再取得
  //};

  const moveJugyoToCell = async (
    jugyo: any,
    wdayId: number,
    period: number
  ) => {
    if (!jugyo?.id) return;
    if (jugyo.wday_id === wdayId && jugyo.period === period) return;

    const { error } = await supabase
      .from("jugyos")
      .update({ wday_id: wdayId, period })
      .eq("id", jugyo.id);

    if (error) {
      console.error("drag/drop move error:", error);

      setErrorMessage(
	error.message || "この時限には移動できません。"
      );

      return;
    }

    await fetchJugyos();
  };

  const moveJugyoToTerm = async (
    jugyo: any,
    termId: number
  ) => {
    if (!jugyo?.id) return;
    if (jugyo.term_id === termId) return;

    const { error } = await supabase
      .from("jugyos")
      .update({ term_id: termId })
      .eq("id", jugyo.id);

    if (error) {
      console.error("drag/drop term change error:", error);
      return;
    }

    await fetchJugyos();
  };

  const termOrder = ["第1", "第2", "第3", "第4", "通年"];

  const yearTerms = terms
    .filter((t: any) => t.year === year)
    .sort((a: any, b: any) =>
      termOrder.indexOf(a.name) - termOrder.indexOf(b.name)
    );


  // ターム自体が未定の授業
  const termUndecidedJugyos = (jugyos ?? [])
    .filter(
      (j: any) =>
        j.year === year &&
        j.term_id == null
    )
    .sort((a: any, b: any) =>
      (a.kamokus?.name ?? "").localeCompare(
        b.kamokus?.name ?? "",
        "ja"
      )
    );

  // 現在表示中のタームに属するが、曜日または時限が未定の授業
  const timeUndecidedJugyos = (jugyos ?? [])
    .filter((j: any) => {
      if (j.year !== year) return false;
      if (j.term_id == null) return false;
      if (j.wday_id != null && j.period != null) return false;

      if (termName === "第2") {
        return j.terms?.name === "第2";
      }

      return (
        j.terms?.name === termName ||
        j.terms?.name === "通年"
      );
    })
    .sort((a: any, b: any) =>
      (a.kamokus?.name ?? "").localeCompare(
        b.kamokus?.name ?? "",
        "ja"
      )
    );

  const renderDragCard = (j: any) => (
    <Box
      key={j.id}
      draggable
      onDragStart={(e) => {
        setDraggedJugyo(j);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(j.id));
      }}
      onDragEnd={() => {
        setDraggedJugyo(null);
        setDragOverCell(null);
        setDragOverTermId(null);
      }}
      onClick={() => {
        setSelectedJugyo(j);
        setOpen(true);
      }}
      sx={{
        cursor: "grab",
        border: "1px solid #ddd",
        borderRadius: 1,
        px: 1,
        py: 0.6,
        bgcolor: "background.paper",
        userSelect: "none",
        "&:hover": {
          backgroundColor: "#eef",
        },
        "&:active": {
          cursor: "grabbing",
        },
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          lineHeight: 1.2,
          color: levelcolor[j.kamokus?.level],
        }}
      >
        {j.excercise ? "(演)" : ""}
        {j.kamokus?.name}
        {j.teachers ? ` ${j.teachers.fname}` : " 未定"}
      </Typography>
    </Box>
  );

  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        時間割（{year}年度{termName}） 
      </Typography>

      {/* ターム未定 */}
      <Box
        sx={{
          mb: 2,
          p: 1.5,
          border: "1px dashed",
          borderColor: "divider",
          borderRadius: 1,
          bgcolor: "grey.50",
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          ターム未定
        </Typography>

        {termUndecidedJugyos.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            ありません
          </Typography>
        ) : (
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
          >
            {termUndecidedJugyos.map(renderDragCard)}
          </Stack>
        )}
      </Box>

      {/* 現在表示中のタームで時限未定 */}
      <Box
        sx={{
          mb: 2,
          p: 1.5,
          border: "1px dashed",
          borderColor: "divider",
          borderRadius: 1,
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {termName}・時限未定
        </Typography>

        {timeUndecidedJugyos.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            ありません
          </Typography>
        ) : (
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
          >
            {timeUndecidedJugyos.map(renderDragCard)}
          </Stack>
        )}
      </Box>

      <Stack
        direction="row"
        spacing={1}
        sx={{ mb: 2, alignItems: "center", flexWrap: "wrap", rowGap: 1 }}
      >
        <Typography variant="body2" color="text.secondary">
          ターム変更：
        </Typography>

        {yearTerms.map((t: any) => (
          <Chip
            key={t.id}
            label={t.name}
            variant={dragOverTermId === t.id ? "filled" : "outlined"}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverTermId(t.id);
            }}
            onDragLeave={() => setDragOverTermId(null)}
            onDrop={async (e) => {
              e.preventDefault();
              const j = draggedJugyo;
              setDragOverTermId(null);
              setDraggedJugyo(null);

              if (j) {
                await moveJugyoToTerm(j, t.id);
              }
            }}
            sx={{
              outline: dragOverTermId === t.id ? "2px solid" : "none",
              outlineColor: "primary.main",
            }}
          />
        ))}
      </Stack>

      <Table
        size="small"
        sx={{
          border: "1px solid #ccc",
          tableLayout: "fixed",
          width: "100%",
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 30 }}>曜日＼時限</TableCell>
            {periods.map((p) => (
              <TableCell key={p} align="center" sx={{ width: 140 }}>
                {p}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {days.map((d, i) => (
            <TableRow key={d}>
              {/* 左端：曜日 */}
              <TableCell
                align="center"
                sx={{
                  width: 80,
                  fontWeight: "bold",
                  bgcolor: "#fafafa",
                }}
              >
                {d}
              </TableCell>

              {/* 各時限 */}
              {periods.map((p) => {
                const js = jugyosAt(i+2, p);
		//console.log(js);
                const wdayId = i + 2;
                const cellKey = `${wdayId}-${p}`;
                const isDragOver = dragOverCell === cellKey;

                return (
                  <TableCell
                    key={p}
                    align="center"
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverCell(cellKey);
                    }}
                    onDragLeave={() => setDragOverCell(null)}
                    onDrop={async (e) => {
                      e.preventDefault();
                      const j = draggedJugyo;
                      setDragOverCell(null);
                      setDraggedJugyo(null);

                      if (j) {
                        await moveJugyoToCell(j, wdayId, p);
                      }
                    }}
                    sx={{
                      verticalAlign: "top",
                      width: 140,
                      height: 100,
                      bgcolor: isDragOver
                        ? "action.hover"
                        : js.length > 0
                          ? "#f9f9f9"
                          : "#fff",
                      p: 0.5,
                      outline: isDragOver ? "2px solid" : "none",
                      outlineColor: "primary.main",
                      outlineOffset: "-2px",
                    }}
                  >
                    {js.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    ) : (
                      js.map((j:any) => (
                        <Box
                          key={j.id}
                          draggable
                          onDragStart={(e) => {
                            setDraggedJugyo(j);
                            e.dataTransfer.effectAllowed = "move";
                            e.dataTransfer.setData("text/plain", String(j.id));
                          }}
                          onDragEnd={() => {
                            setDraggedJugyo(null);
                            setDragOverCell(null);
                            setDragOverTermId(null);
                          }}
                          onClick={() => {
                            setSelectedJugyo(j);
                            setOpen(true);
                          }}
                          sx={{
                            cursor: "grab",
                            border: "1px solid #ddd",
                            borderRadius: 1,
                            p: 0.5,
                            mb: 0.3,
                            "&:hover": { backgroundColor: "#eef" },
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 500, lineHeight: 1.2, color: levelcolor[j.kamokus?.level] }}
                          >
			    {j.excercise? "(演)" : ""}
                            {j.kamokus?.name}
                            {j.teachers
                              ? ` ${j.teachers.fname}`
                              : ""}
                          </Typography>
                        </Box>
                      ))
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 編集ダイアログ */}
        <JugyoEditDialog
          open={open}
          onClose={() => {
	    setOpen(false)
	    setSelectedJugyo(null);
	  }}
          jugyo={selectedJugyo}
	  onSaved={handleSave}
          isNew={false}
	  teachers={teachers}
	  kamokus={kamokus}
	  terms={terms}
	  wdays={wdays}
	  departments={departments}
	  selectedDepartmentId={selectedDepartmentId}
        />

	<Snackbar
	  open={errorMessage !== null}
	  autoHideDuration={5000}
	  onClose={() => setErrorMessage(null)}
	  anchorOrigin={{
	    vertical: "bottom",
	    horizontal: "center",
	  }}
	>
	  <Alert
	    severity="warning"
	    variant="filled"
	    onClose={() => setErrorMessage(null)}
	  >
	    {errorMessage}
	  </Alert>
	</Snackbar>	
    </Box>
  );
}
