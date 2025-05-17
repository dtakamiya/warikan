"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

type Result = {
  name: string;
  amount: number;
  note?: string;
};

export default function ResultPage() {
  const [positionsData, setPositionsData] = useState<PositionsData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState<number | "">("");
  const [results, setResults] = useState<Result[]>([]);
  const router = useRouter();

  // データ取得
  useEffect(() => {
    const posData = localStorage.getItem("warikan-positions");
    const memData = localStorage.getItem("warikan-members");
    if (posData && memData) {
      setPositionsData(JSON.parse(posData));
      setMembers(JSON.parse(memData));
    } else {
      router.push("/positions");
    }
  }, [router]);

  // 割り勘計算
  useEffect(() => {
    if (!positionsData || members.length === 0 || total === "" || Number(total) <= 0) {
      setResults([]);
      return;
    }
    const t = Number(total);
    // 役職ごとのポイント計算
    const points = positionsData.positions.map((_, i) =>
      positionsData.basePoint + positionsData.pointDiff * (positionsData.positions.length - 1 - i)
    );
    // 参加者ごとのポイント
    const memberPoints = members.map(m => {
      const idx = positionsData.positions.indexOf(m.position);
      return idx >= 0 ? points[idx] : 0;
    });
    // 特別支払額が設定されている人
    const customMembers = members.map((m, i) => (typeof m.customAmount === "number" && m.customAmount !== 0 ? i : -1)).filter(i => i >= 0);
    const customTotal = customMembers.reduce((sum, i) => sum + (typeof members[i].customAmount === "number" ? members[i].customAmount as number : 0), 0);
    // 残り金額
    const restTotal = t - customTotal;
    // customAmount未設定の人の合計ポイント
    const restPoints = memberPoints.filter((_, i) => !customMembers.includes(i)).reduce((a, b) => a + b, 0);
    // 支払額計算
    const result: Result[] = members.map((m, i) => {
      if (typeof m.customAmount === "number" && m.customAmount !== 0) {
        return { name: m.name, amount: m.customAmount as number, note: "特別額" };
      } else if (restPoints > 0) {
        const idx = positionsData.positions.indexOf(m.position);
        const pt = idx >= 0 ? points[idx] : 0;
        const amt = Math.round((restTotal * pt) / restPoints);
        return { name: m.name, amount: amt };
      } else {
        return { name: m.name, amount: 0 };
      }
    });
    setResults(result);
  }, [positionsData, members, total]);

  if (!positionsData || members.length === 0) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="w-full max-w-2xl bg-white/70 backdrop-blur-md shadow-2xl rounded-2xl p-8">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-900 tracking-tight drop-shadow">割り勘結果</h1>
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
          <h2 className="text-xl font-bold mb-4 text-gray-900">支払額一覧</h2>
          {total === "" || Number(total) <= 0 ? (
            <div className="text-gray-700">合計金額を入力してください</div>
          ) : (
            <ul className="space-y-4">
              {results.map((r, _idx) => (
                <li key={_idx} className="flex flex-col sm:flex-row gap-3 items-center bg-white/90 rounded-xl shadow-md px-4 py-3 border border-gray-200">
                  <span className="flex-1 text-lg font-semibold text-gray-900">{r.name}</span>
                  <span className="w-40 text-2xl font-extrabold text-blue-900 text-right break-keep">{r.amount.toLocaleString()} 円</span>
                  {r.note && <span className="text-xs text-gray-700">({r.note})</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex justify-end">
          <button
            className="px-8 py-3 bg-gradient-to-r from-blue-400 to-green-400 text-white font-bold rounded-full shadow-lg transition hover:scale-105 hover:from-blue-500 hover:to-green-500 text-lg"
            onClick={() => router.push("/members")}
          >
            参加者編集に戻る
          </button>
        </div>
      </div>
    </div>
  );
}
