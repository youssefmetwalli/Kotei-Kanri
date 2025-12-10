// src/components/CheckSheetExecution.tsx
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ArrowLeft, ChevronDown, Camera, Eraser, Pen } from "lucide-react";
import { ExecutionResultConfirmation } from "./ExecutionResultConfirmation";
import { api } from "../lib/api";
import type {
  ProcessSheet as BackendProcessSheet,
  Checklist as BackendChecklist,
  ChecklistItem as BackendChecklistItem,
  CheckItem as BackendCheckItem,
  Execution,
  ItemStatusCode,
} from "../types/backend";

interface ExecutionCheckItem {
  id: number; // ChecklistItem.id
  title: string;
  instruction: string;
  type: "number" | "text" | "select";
  unit?: string;
  referenceImage?: string;
  checklistItemId: number;
  checkItemId: number;
}

interface CheckSheetExecutionProps {
  sheet: {
    id: number;
    productName: string;
    lotNumber: string;
    assignee: string;
  };
  onBack: () => void;
  onComplete: () => void;
}

// helper for base64 -> Blob (for image upload)
function base64toBlob(base64: string) {
  const arr = base64.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";

  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
}

export function CheckSheetExecution({
  sheet,
  onBack,
  onComplete,
}: CheckSheetExecutionProps) {
  const [showResultConfirmation, setShowResultConfirmation] = useState(false);

  const [checkItems, setCheckItems] = useState<ExecutionCheckItem[]>([]);
  const [execution, setExecution] = useState<Execution | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<{ [key: number]: any }>({});
  const [comments, setComments] = useState<{ [key: number]: string }>({});
  const [photos, setPhotos] = useState<{ [key: number]: string[] }>({});

  const [elapsedTime, setElapsedTime] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("#000000");
  const [penSize, setPenSize] = useState(2);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentItem = checkItems[currentIndex];
  const total = checkItems.length;
  const progress = total > 0 ? currentIndex + 1 : 0;

  // ------------------------------
  // Timer
  // ------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs.toString().padStart(2, "0")}秒`;
  };

  // ------------------------------
  // Load ProcessSheet -> Checklist -> Items AND create Execution
  // ------------------------------
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1) Get ProcessSheet detail
        const psRes = await api.get<BackendProcessSheet>(
          `/process-sheets/${sheet.id}/`
        );
        const ps = psRes.data;

        if (!ps.checklist) {
          setCheckItems([]);
          setError("この工程に紐づくチェックリストがありません。");
          setLoading(false);
          return;
        }

        const checklistId =
          typeof ps.checklist === "number" ? ps.checklist : ps.checklist.id;

        // 2) Get Checklist detail (with items)
        const clRes = await api.get<BackendChecklist>(
          `/checklists/${checklistId}/`
        );
        const checklist = clRes.data;
        const items: BackendChecklistItem[] = checklist.items ?? [];

        const mappedItems: ExecutionCheckItem[] = items.map((ci) => {
          const checkItem =
            typeof ci.check_item === "number"
              ? null
              : (ci.check_item as BackendCheckItem);

          return {
            id: ci.id,
            checklistItemId: ci.id,
            checkItemId:
              typeof ci.check_item === "number"
                ? ci.check_item
                : ci.check_item.id,
            title: checkItem?.name ?? `項目 ${ci.id}`,
            instruction: ci.instruction || checkItem?.description || "",
            type: (checkItem?.type as "number" | "text" | "select") || "text",
            unit: ci.unit || checkItem?.unit || undefined,
            referenceImage: checkItem?.reference_image || undefined,
          };
        });

        setCheckItems(mappedItems);
        setCurrentIndex(0);

        // 3) Create Execution (status: running)
        const execRes = await api.post<Execution>("/executions/", {
          process_sheet_id: ps.id,
          checklist_id: checklistId,
          status: "running",
          result: "",
        });
        setExecution(execRes.data);
      } catch (err) {
        console.error(err);
        setError("チェックシートの読み込みに失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [sheet.id]);

  // ------------------------------
  // Canvas handlers
  // ------------------------------
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penSize;
        ctx.lineCap = "round";
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // ------------------------------
  // Response handlers
  // ------------------------------
  const handleResponseChange = (value: any) => {
    if (!currentItem) return;
    setResponses((prev) => ({ ...prev, [currentItem.id]: value }));
  };

  const handleCommentChange = (value: string) => {
    if (!currentItem) return;
    setComments((prev) => ({ ...prev, [currentItem.id]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentItem) return;
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        const currentPhotos = photos[currentItem.id] || [];
        setPhotos((prev) => ({
          ...prev,
          [currentItem.id]: [...currentPhotos, imageUrl],
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // ------------------------------
  // Save all item results to backend
  // ------------------------------
  const inferItemStatus = (
    item: ExecutionCheckItem,
    value: any
  ): ItemStatusCode => {
    if (value === undefined || value === null || value === "") return "SKIP";
    if (item.type === "select") {
      if (value === "良好") return "OK";
      if (value === "不良") return "NG";
      return "OK";
    }
    return "OK";
  };

  const saveAllResults = async () => {
    if (!execution) return;
    if (checkItems.length === 0) return;

    setSaving(true);
    try {
      // Build payload for item_results_write
      // -> ALWAYS one entry per checklist item (default SKIP if empty)
      const itemsPayload = checkItems.map((item) => {
        const value = responses[item.id];
        const note = comments[item.id] ?? "";

        return {
          checklist_item_id: item.checklistItemId,
          value: value != null ? String(value) : "",
          note,
          status: inferItemStatus(item, value),
        };
      });

      // PATCH execution with nested item_results_write (ExecutionSerializer)
      const execRes = await api.patch(`/executions/${execution.id}/`, {
        status: "completed",
        item_results_write: itemsPayload,
      });
      const updatedExec = execRes.data as any;
      setExecution(updatedExec);

      // create map: checklist_item.id -> item_result.id from response
      const itemResultMap: Record<number, number> = {};
      if (Array.isArray(updatedExec.item_results)) {
        updatedExec.item_results.forEach(
          (ir: { id: number; checklist_item: number | { id: number } }) => {
            const ci = ir.checklist_item;
            const key =
              typeof ci === "number" ? ci : ci && typeof ci.id === "number"
              ? ci.id
              : undefined;
            if (typeof key === "number") {
              itemResultMap[key] = ir.id;
            }
          }
        );
      }

      // Upload photos (if backend ExecutionPhotoSerializer accepts item_result)
      for (const item of checkItems) {
        const ciId = item.checklistItemId;
        const itemPhotos = photos[item.id] || [];
        if (itemPhotos.length === 0) continue;

        const itemResultId = itemResultMap[ciId];
        if (!itemResultId) continue;

        for (const base64 of itemPhotos) {
          const formData = new FormData();
          formData.append("item_result", String(itemResultId));
          formData.append("image", base64toBlob(base64), "photo.png");
          formData.append("annotation", "");
          await api.post("/execution-photos/", formData);
        }
      }
    } catch (err) {
      console.error(err);
      setError("測定結果の保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------
  // Navigation
  // ------------------------------
  const handleNext = async () => {
    if (!currentItem) return;
    if (currentIndex < checkItems.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // last item -> save all & go to result confirmation
      await saveAllResults();
      setShowResultConfirmation(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleEditItem = (itemIndex: number) => {
    setCurrentIndex(itemIndex);
    setShowResultConfirmation(false);
  };

  // ------------------------------
  // Result confirmation screen
  // ------------------------------
  if (showResultConfirmation && execution) {
    return (
      <ExecutionResultConfirmation
        sheet={sheet}
        executionId={execution.id}
        onBack={() => setShowResultConfirmation(false)}
        onConfirm={onComplete}
        onEditItem={handleEditItem}
      />
    );
  }

  // ------------------------------
  // Main render
  // ------------------------------
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              [一時保存]
            </Button>
            <div>
              <h2 className="text-gray-900">
                {sheet.productName} 初期ロット検査
              </h2>
              {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
              {saving && (
                <p className="text-xs text-blue-600 mt-1">
                  測定結果を保存中...
                </p>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm">
            {sheet.assignee}
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>
              進捗: {progress}/{total || 0}
            </span>
            <span>経過時間: {formatTime(elapsedTime)}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{
                width: total > 0 ? `${(progress / total) * 100}%` : "0%",
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <p className="text-sm text-gray-500">
              チェック項目を読み込み中です...
            </p>
          ) : !currentItem ? (
            <p className="text-sm text-gray-500">チェック項目がありません。</p>
          ) : (
            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Item Title */}
                <div>
                  <h3 className="text-gray-900">
                    {progress}. {currentItem.title}
                  </h3>
                </div>

                {/* Reference Image */}
                <div className="space-y-2">
                  <Label>参考画像</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
                    {currentItem.referenceImage ? (
                      <img
                        src={currentItem.referenceImage}
                        alt="参考画像"
                        className="max-h-64 mx-auto object-contain"
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        画像表示エリア
                      </div>
                    )}
                  </div>
                </div>

                {/* Drawing Canvas */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Pen className="w-4 h-4 mr-2" />
                      手書きコメント
                    </Button>
                    <Select
                      value={penColor}
                      onValueChange={(value: string) => setPenColor(value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="ペン色" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="#000000">黒</SelectItem>
                        <SelectItem value="#FF0000">赤</SelectItem>
                        <SelectItem value="#0000FF">青</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={penSize.toString()}
                      onValueChange={(v) => setPenSize(Number(v))}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="太さ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">細</SelectItem>
                        <SelectItem value="2">中</SelectItem>
                        <SelectItem value="4">太</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={clearCanvas}>
                      <Eraser className="w-4 h-4 mr-2" />
                      消しゴム
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearCanvas}>
                      クリア
                    </Button>
                  </div>
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={200}
                    className="border border-gray-300 rounded-lg w-full bg-white cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>

                {/* Instruction and Input */}
                <div className="space-y-4">
                  <p className="text-sm text-gray-900">
                    {currentItem.instruction}
                  </p>

                  {currentItem.type === "number" && (
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        value={responses[currentItem.id] || ""}
                        onChange={(e) => handleResponseChange(e.target.value)}
                        className="max-w-xs"
                      />
                      {currentItem.unit && (
                        <span className="text-sm text-gray-600">
                          {currentItem.unit}
                        </span>
                      )}
                    </div>
                  )}

                  {currentItem.type === "select" && (
                    <Select
                      value={responses[currentItem.id] ?? undefined}
                      onValueChange={handleResponseChange}
                    >
                      <SelectTrigger className="max-w-xs">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="良好">良好</SelectItem>
                        <SelectItem value="要注意">要注意</SelectItem>
                        <SelectItem value="不良">不良</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  {currentItem.type === "text" && (
                    <Input
                      type="text"
                      value={responses[currentItem.id] || ""}
                      onChange={(e) => handleResponseChange(e.target.value)}
                      className="max-w-xs"
                    />
                  )}
                </div>

                {/* Comment */}
                <div className="space-y-2">
                  <Label>コメント(任意)</Label>
                  <Textarea
                    value={comments[currentItem.id] || ""}
                    onChange={(e) => handleCommentChange(e.target.value)}
                    rows={3}
                    placeholder="追加のコメントを入力してください"
                  />
                </div>

                {/* Photo Upload */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      写真を撮影
                    </Button>
                    <span className="text-sm text-gray-600">
                      画像プレビュー
                    </span>
                  </div>
                  {photos[currentItem.id] &&
                    photos[currentItem.id].length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {photos[currentItem.id].map((photo, index) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            className="w-24 h-24 object-cover rounded border"
                          />
                        ))}
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentIndex === 0 || loading || !currentItem}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            前へ
          </Button>
          <Button onClick={handleNext} disabled={loading || !currentItem}>
            {currentIndex === checkItems.length - 1 ? "完了" : "次へ"}
            {currentIndex !== checkItems.length - 1 && (
              <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
