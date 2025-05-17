"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="w-full max-w-xl bg-white/70 backdrop-blur-md shadow-2xl rounded-2xl p-8 flex flex-col items-center">
        <h1 className="text-4xl font-extrabold mb-6 text-center text-gray-800 tracking-tight drop-shadow">役職傾斜割り勘アプリ</h1>
        <p className="mb-8 text-gray-700 text-center text-lg">
          役職や特別な支払額に応じて、<br />公平に割り勘できるアプリです。<br />
          <span className="text-base text-gray-500">（歓迎会・送別会・飲み会などに最適！）</span>
        </p>
        <ul className="mb-8 text-left text-gray-600 list-disc list-inside text-base">
          <li>役職ごとにポイント設定・順序変更が可能</li>
          <li>特定の人の0円や任意額支払いもOK</li>
          <li>ポイント差・基準ポイントも自由に設定</li>
        </ul>
        <button
          className="px-10 py-4 bg-gradient-to-r from-blue-400 to-green-400 text-white font-bold rounded-full shadow-lg text-xl transition hover:scale-105 hover:from-blue-500 hover:to-green-500"
          onClick={() => router.push("/positions")}
        >
          割り勘をはじめる
        </button>
      </div>
    </div>
  );
}
