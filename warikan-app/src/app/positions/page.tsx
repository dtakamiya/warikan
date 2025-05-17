"use client";
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useRouter } from "next/navigation";

// 初期役職リスト
const defaultPositions = [
  "ディヴィジョンマネージャー",
  "マネージングディレクター",
  "グループマネージャー",
  "シニアマネージャー",
  "マネージャー",
  "アシスタントマネージャー",
];

export default function PositionsPage() {
  const [positions, setPositions] = useState<string[]>(defaultPositions);
  const [pointDiff, setPointDiff] = useState<number>(0.25);
  const [basePoint, setBasePoint] = useState<number>(1);
  const [templateName, setTemplateName] = useState("");
  const [templates, setTemplates] = useState<{ name: string; data: { positions: string[]; pointDiff: number; basePoint: number } }[]>([]);
  const router = useRouter();

  // テンプレ一覧をlocalStorageから取得
  useEffect(() => {
    const t = localStorage.getItem("warikan-position-templates");
    if (t) setTemplates(JSON.parse(t));
  }, []);

  // テンプレ保存
  const saveTemplate = () => {
    if (!templateName.trim()) return;
    const newTemplates = templates.filter(t => t.name !== templateName.trim());
    newTemplates.push({
      name: templateName.trim(),
      data: { positions, pointDiff, basePoint },
    });
    setTemplates(newTemplates);
    localStorage.setItem("warikan-position-templates", JSON.stringify(newTemplates));
    setTemplateName("");
  };

  // テンプレ呼び出し
  const loadTemplate = (name: string) => {
    const t = templates.find(t => t.name === name);
    if (t) {
      setPositions(t.data.positions);
      setPointDiff(t.data.pointDiff);
      setBasePoint(t.data.basePoint);
    }
  };

  // テンプレ削除
  const deleteTemplate = (name: string) => {
    const newTemplates = templates.filter(t => t.name !== name);
    setTemplates(newTemplates);
    localStorage.setItem("warikan-position-templates", JSON.stringify(newTemplates));
  };

  // 役職ごとのポイント計算（下位から上位へ）
  const calcPoints = () =>
    positions.map((_, i) => basePoint + pointDiff * (positions.length - 1 - i));

  // 役職追加
  const addPosition = () => setPositions([...positions, "新しい役職"]);

  // 役職名変更
  const updatePosition = (idx: number, name: string) => {
    const newPositions = [...positions];
    newPositions[idx] = name;
    setPositions(newPositions);
  };

  // 役職削除
  const removePosition = (idx: number) => {
    if (positions.length <= 1) return;
    setPositions(positions.filter((_, i) => i !== idx));
  };

  // ドラッグ＆ドロップによる順序変更
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newPositions = Array.from(positions);
    const [removed] = newPositions.splice(result.source.index, 1);
    newPositions.splice(result.destination.index, 0, removed);
    setPositions(newPositions);
  };

  // 次へ進む処理
  const handleNext = () => {
    const data = {
      positions,
      pointDiff,
      basePoint,
    };
    localStorage.setItem("warikan-positions", JSON.stringify(data));
    router.push("/members");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="w-full max-w-2xl bg-white/70 backdrop-blur-md shadow-2xl rounded-2xl p-8">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-900 tracking-tight drop-shadow">役職設定</h1>
        <div className="mb-6">
          <div className="flex flex-wrap items-end gap-2 mb-2">
            <input
              type="text"
              className="border rounded px-2 py-1 text-base min-w-[120px]"
              placeholder="テンプレ名を入力"
              value={templateName}
              onChange={e => setTemplateName(e.target.value)}
            />
            <button
              className="bg-blue-400 text-white font-bold rounded px-4 py-1 hover:bg-blue-500 transition"
              onClick={saveTemplate}
              disabled={!templateName.trim()}
            >
              保存
            </button>
          </div>
          {templates.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-700">テンプレ呼び出し:</span>
              {templates.map(t => (
                <div key={t.name} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
                  <button
                    className="text-blue-700 font-semibold hover:underline"
                    onClick={() => loadTemplate(t.name)}
                  >
                    {t.name}
                  </button>
                  <button
                    className="text-xs text-red-400 hover:text-red-600 ml-1"
                    onClick={() => deleteTemplate(t.name)}
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mb-8 flex flex-col sm:flex-row gap-6 justify-center">
          <label className="flex flex-col text-base font-semibold text-gray-900">
            ポイント差
            <input
              type="number"
              className="bg-white/80 border-none rounded-lg shadow-inner px-3 py-2 mt-2 focus:ring-2 focus:ring-blue-300 transition text-gray-900 placeholder-gray-700"
              value={pointDiff}
              onChange={e => setPointDiff(parseFloat(e.target.value))}
              min={0.1}
              step={0.1}
              placeholder="例: 1"
            />
          </label>
          <label className="flex flex-col text-base font-semibold text-gray-900">
            基準役職ポイント（AM）
            <input
              type="number"
              className="bg-white/80 border-none rounded-lg shadow-inner px-3 py-2 mt-2 focus:ring-2 focus:ring-green-300 transition text-gray-900 placeholder-gray-700"
              value={basePoint}
              onChange={e => setBasePoint(Number(e.target.value))}
              min={1}
              placeholder="例: 1"
            />
          </label>
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">役職リスト</h2>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="positions">
              {(provided) => (
                <ul
                  className="space-y-4"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {positions.map((pos, idx) => (
                    <Draggable key={pos + idx} draggableId={pos + idx} index={idx}>
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex items-center gap-3 bg-white/90 rounded-xl shadow-md px-4 py-3 border border-gray-200 transition ${snapshot.isDragging ? "ring-2 ring-blue-300 scale-105" : ""}`}
                        >
                          <span className="cursor-move text-gray-400 text-xl">☰</span>
                          <input
                            type="text"
                            className="bg-white/70 border-none rounded-lg px-2 py-1 flex-1 focus:ring-2 focus:ring-blue-200 transition text-gray-900 placeholder-gray-700"
                            value={pos}
                            onChange={e => updatePosition(idx, e.target.value)}
                            placeholder="役職名"
                          />
                          <span className="text-sm font-bold text-blue-900 bg-blue-50 rounded px-2 py-1 shadow-inner">{calcPoints()[idx]} pt</span>
                          <button
                            className="text-red-500 hover:bg-red-100 rounded px-3 py-1 transition disabled:opacity-40"
                            onClick={() => removePosition(idx)}
                            disabled={positions.length <= 1}
                          >
                            削除
                          </button>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
          <button
            className="mt-6 px-6 py-2 bg-gradient-to-r from-blue-400 to-green-400 text-white font-bold rounded-full shadow-md transition hover:scale-105 hover:from-blue-500 hover:to-green-500 text-lg"
            onClick={addPosition}
          >
            役職を追加
          </button>
        </div>
        <div className="flex justify-end">
          <button
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-full shadow-lg transition hover:scale-105 hover:from-green-600 hover:to-blue-600 text-lg"
            onClick={handleNext}
          >
            次へ
          </button>
        </div>
      </div>
    </div>
  );
}
