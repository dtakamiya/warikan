"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// 参加者型
type Member = {
  name: string;
  position: string;
  customAmount?: number | "";
};

type PositionsData = {
  positions: string[];
  pointDiff: number;
  basePoint: number;
};

export default function MembersPage() {
  const [positionsData, setPositionsData] = useState<PositionsData | null>(null);
  const [members, setMembers] = useState<Member[]>([
    { name: "", position: "", customAmount: "" },
  ]);
  const [total, setTotal] = useState<number | "">("");
  const [results, setResults] = useState<{ name: string; amount: number; note?: string }[]>([]);
  const router = useRouter();

  // localStorageから役職情報を取得
  useEffect(() => {
    const data = localStorage.getItem("warikan-positions");
    if (data) {
      setPositionsData(JSON.parse(data));
    } else {
      // 役職設定がなければ戻す
      router.push("/positions");
    }
  }, [router]);

  // リアルタイム割り勘計算
  useEffect(() => {
    if (!positionsData || members.length === 0 || total === "" || Number(total) <= 0) {
      setResults([]);
      return;
    }
    const t = Number(total);
    // 役職ごとのポイント計算
    const points = positionsData.positions.map((_, _i) =>
      positionsData.basePoint + positionsData.pointDiff * (positionsData.positions.length - 1 - _i)
    );
    // 参加者ごとのポイント
    const memberPoints = members.map(m => {
      const idx = positionsData.positions.indexOf(m.position);
      return idx >= 0 ? points[idx] : 0;
    });
    // 特別支払額が設定されている人
    const customMembers = members.map((m, _ii) => (typeof m.customAmount === "number" && m.customAmount !== 0 ? _ii : -1)).filter(i => i >= 0);
    const customTotal = customMembers.reduce((sum, i) => sum + (typeof members[i].customAmount === "number" ? members[i].customAmount as number : 0), 0);
    // 残り金額
    const restTotal = t - customTotal;
    // customAmount未設定の人の合計ポイント
    const restPoints = memberPoints.filter((_, i) => !customMembers.includes(i)).reduce((a, b) => a + b, 0);
    // 支払額計算
    let tempResults = members.map(m => {
      if (typeof m.customAmount === "number" && m.customAmount !== 0) {
        return { name: m.name, amount: m.customAmount as number, note: "特別額", position: m.position };
      } else if (restPoints > 0) {
        const idx = positionsData.positions.indexOf(m.position);
        const pt = idx >= 0 ? points[idx] : 0;
        const amt = (restTotal * pt) / restPoints;
        return { name: m.name, amount: amt, position: m.position };
      } else {
        return { name: m.name, amount: 0, position: m.position };
      }
    });
    // 100円単位で切り捨て
    let rounded = tempResults.map(r =>
      (typeof r.amount === "number" && r.note !== "特別額") ? Math.floor(r.amount / 100) * 100 : r.amount
    );
    // 端数計算
    const roundedSum = rounded.reduce((a, b) => a + (typeof b === "number" ? b : 0), 0);
    const originalSum = tempResults.reduce((a, b) => a + (typeof b.amount === "number" && b.note !== "特別額" ? Math.round(b.amount) : (typeof b.amount === "number" ? b.amount : 0)), 0);
    let diff = restTotal - (roundedSum - customTotal);
    // 上位役職順で端数を+100円ずつ割り振る
    const nonCustom = tempResults
      .map((r, i) => ({ ...r, idx: i }))
      .filter(r => r.note !== "特別額");
    // 上位役職順（positionsの順）で並び替え
    nonCustom.sort((a, b) => positionsData.positions.indexOf(a.position) - positionsData.positions.indexOf(b.position));
    let i = 0;
    while (diff > 0 && i < nonCustom.length) {
      rounded[nonCustom[i].idx] += 100;
      diff -= 100;
      i++;
      if (i === nonCustom.length) i = 0;
    }
    // 結果をセット
    const result = tempResults.map((r, i) => ({ name: r.name, amount: rounded[i], note: r.note }));
    setResults(result);
  }, [positionsData, members, total]);

  // 参加者追加
  const addMember = () => {
    setMembers([...members, { name: "", position: positionsData?.positions[0] || "", customAmount: "" }]);
  };

  // 参加者削除
  const removeMember = (idx: number) => {
    if (members.length <= 1) return;
    setMembers(members.filter((_, i) => i !== idx));
  };

  // 参加者情報更新
  const updateMember = (idx: number, key: keyof Member, value: string) => {
    const newMembers = [...members];
    if (key === "customAmount") {
      newMembers[idx][key] = value === "" ? "" : Number(value);
    } else {
      newMembers[idx][key] = value;
    }
    setMembers(newMembers);
  };

  // 参加者保存
  const saveMembers = () => {
    localStorage.setItem("warikan-members-saved", JSON.stringify(members));
  };
  // 参加者呼び出し
  const loadMembers = () => {
    const data = localStorage.getItem("warikan-members-saved");
    if (data) setMembers(JSON.parse(data));
  };

  if (!positionsData) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="w-full max-w-4xl bg-white/70 backdrop-blur-md shadow-2xl rounded-2xl p-8">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-900 tracking-tight drop-shadow">参加者入力</h1>
        <div className="mb-8 flex flex-col sm:flex-row gap-6 justify-center">
          <label className="flex flex-col text-base font-semibold text-gray-900">
            合計金額（円）
            <input
              type="number"
              className="bg-white/80 border-none rounded-lg shadow-inner px-3 py-2 mt-2 focus:ring-2 focus:ring-blue-300 transition text-gray-900 placeholder-gray-700"
              value={total}
              onChange={e => setTotal(e.target.value === "" ? "" : Number(e.target.value))}
              min={0}
              placeholder="例: 5000"
            />
          </label>
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">参加者リスト</h2>
          <ul className="space-y-4">
            {members.map((member, _idx) => (
              <li key={_idx} className="flex items-center gap-2 bg-white/90 rounded-xl shadow-md px-4 py-2 border border-gray-200 overflow-x-auto">
                <input
                  type="text"
                  className="bg-white/70 border-none rounded-lg px-1 py-1 flex-1 min-w-[80px] max-w-[120px] focus:ring-2 focus:ring-blue-200 transition text-gray-900 placeholder-gray-700 text-sm"
                  placeholder="名前"
                  value={member.name}
                  onChange={e => updateMember(_idx, "name", e.target.value)}
                />
                <select
                  className="bg-white/70 border-none rounded-lg px-1 py-1 min-w-[160px] max-w-[240px] focus:ring-2 focus:ring-green-200 transition text-gray-900 text-sm"
                  value={member.position}
                  onChange={e => updateMember(_idx, "position", e.target.value)}
                >
                  <option value="">役職</option>
                  {positionsData.positions.map((pos, _iv) => (
                    <option key={_iv} value={pos}>{pos}</option>
                  ))}
                </select>
                <input
                  type="number"
                  className="bg-white/70 border-none rounded-lg px-1 py-1 w-16 min-w-[60px] max-w-[80px] focus:ring-2 focus:ring-blue-100 transition text-gray-900 placeholder-gray-700 text-sm"
                  placeholder="特別額"
                  value={member.customAmount === "" ? "" : member.customAmount}
                  onChange={e => updateMember(_idx, "customAmount", e.target.value)}
                  min={0}
                />
                {total !== "" && Number(total) > 0 && (
                  <span
                    className={`
                      min-w-[6rem] w-auto text-right
                      px-2 py-1 rounded-lg shadow font-extrabold text-base
                      ${results[_idx]?.note ? "bg-orange-100 text-orange-700 border border-orange-300" : "bg-blue-100 text-blue-900 border border-blue-300"}
                      flex items-center justify-end gap-1 whitespace-nowrap
                    `}
                  >
                    <span className="whitespace-nowrap">
                      {results[_idx]?.amount?.toLocaleString() ?? "-"}
                      <span className="ml-1 text-sm font-bold whitespace-nowrap">円</span>
                    </span>
                    {results[_idx]?.note && (
                      <span className="ml-1 text-xs text-orange-500 font-semibold align-middle whitespace-nowrap">({results[_idx].note})</span>
                    )}
                  </span>
                )}
                <button
                  className="text-red-500 hover:bg-red-100 rounded px-2 py-1 transition disabled:opacity-40 text-sm whitespace-nowrap"
                  onClick={() => removeMember(_idx)}
                  disabled={members.length <= 1}
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
          <button
            className="mt-6 px-6 py-2 bg-gradient-to-r from-blue-400 to-green-400 text-white font-bold rounded-full shadow-md transition hover:scale-105 hover:from-blue-500 hover:to-green-500 text-lg"
            onClick={addMember}
          >
            参加者を追加
          </button>
        </div>
        <div className="flex flex-col sm:flex-row justify-between gap-2 mt-6">
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 font-semibold"
              onClick={() => router.push("/")}
            >
              ホームに戻る
            </button>
            <button
              className="px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 font-semibold"
              onClick={() => router.push("/positions")}
            >
              役職設定に戻る
            </button>
          </div>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-blue-200 text-blue-900 rounded hover:bg-blue-300 font-semibold"
              onClick={saveMembers}
            >
              参加者を保存
            </button>
            <button
              className="px-4 py-2 bg-green-200 text-green-900 rounded hover:bg-green-300 font-semibold"
              onClick={loadMembers}
            >
              保存した参加者を呼び出し
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
