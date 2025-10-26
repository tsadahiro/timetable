import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AvailableSlots({ level, year, term }: { level: number; year: number; term: string; }) {
  const [slots, setSlots] = useState<{ wday: string; period: number; status: string }[]>([]);
  const days = ["月", "火", "水", "木", "金"];
  const periods = [1, 2, 3, 4, 5, 6];

  useEffect(() => { fetchData(); }, [level, year, term]);

  async function fetchData() {
    const { data: jugyos } = await supabase
      .from("jugyos")
      .select("period, wdays(name), kamokus(level, hisshu, sentakuhi), terms(name)")
      .eq("year", year);

    const { data: forbiddens } = await supabase
      .from("forbiddens")
      .select("period, wdays(name), terms(name), level, hisshu, sentaku")
      .eq("year", year);

    const results: { wday: string; period: number; status: string }[] = [];

    for (const d of days) {
      for (const p of periods) {
	// 禁止ルールに該当するか？
	const forb = forbiddens?.some(
	  (f) => f.wdays?.name === d && f.period === p && f.terms?.name === "通年" && f.level === level && f.sentaku
	  //(f) =>
          //  f.wdays?.name === d &&
          //     f.period === p &&
          //     f.terms?.name === term &&
          //     f.level === level &&
          //     f.sentaku
	);

	// 同学年の必修or選択必修がすでに入っていないか？
	const taken = jugyos?.some(
	  (j) =>
            j.wdays?.name === d &&
               j.period === p &&
               j.terms?.name === term &&
               j.kamokus?.level === level &&
               (j.kamokus?.hisshu )
               //(j.kamokus?.hisshu || j.kamokus?.sentakuhi)
	);

	// 🔸 level=3 のとき、選択必修科目(sentakuhi=true)があるか？
	const hasSentakuhi =
	  level === 3 &&
	  jugyos?.some(
            (j) =>
              j.wdays?.name === d &&
		 j.period === p &&
		 j.terms?.name === term &&
		 j.kamokus?.sentakuhi === true
	  );

	// 状態を判定
	let status = "○可";
	if (forb) status = "×禁止";
	else if (taken) status = "×埋まり";
	else if (hasSentakuhi) status = "選必あり";

	results.push({ wday: d, period: p, status });
      }
    }

    //for (const d of days) {
    //  for (const p of periods) {
    //    // 禁止ルールに該当するか？
    //    const forb = forbiddens?.some(
    //      (f) => f.wdays?.name === d && f.period === p && f.terms?.name === "通年" && f.level === level && f.sentaku
    //    );
    //    // 同学年の必修or選択必修がすでに入っていないか？
    //    const taken = jugyos?.some(
    //      (j) =>
    //        j.wdays?.name === d &&
    //        j.period === p &&
    //        j.terms?.name === term &&
    //        j.kamokus?.level === level &&
    //        (j.kamokus?.hisshu || j.kamokus?.sentakuhi)
    //    );
    //    const status = forb ? "×禁止" : taken ? "×埋まり" : "○可";
    //    results.push({ wday: d, period: p, status });
    //  }
    //}
    setSlots(results);
  }

  return (
    <div>
      <h3>{2026}年度 {term}ターム ― {level}年生の選択科目可否表</h3>
      <table border={1} cellPadding={6}>
        <thead>
          <tr>
            <th>曜日</th>
            {periods.map((p) => <th key={p}>{p}限</th>)}
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d}>
              <td>{d}</td>
              {periods.map((p) => {
                const slot = slots.find((s) => s.wday === d && s.period === p);
                return (
                  <td key={p}
                    style={{
                      backgroundColor:
                        slot?.status === "○可" ? "#e8ffe8" :
                        slot?.status === "×禁止" ? "#ffeaea" : "#eee",
                      textAlign: "center",
                    }}
                  >
                    {slot?.status ?? "-"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
