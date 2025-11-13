import { useState, useRef } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowLeft, ChevronDown, Camera, Eraser, Pen } from "lucide-react";
import { ExecutionResultConfirmation } from "./ExecutionResultConfirmation";

interface CheckItem {
  id: number;
  title: string;
  instruction: string;
  type: "number" | "text" | "select";
  unit?: string;
  referenceImage?: string;
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

export function CheckSheetExecution({ sheet, onBack, onComplete }: CheckSheetExecutionProps) {
  const [showResultConfirmation, setShowResultConfirmation] = useState(false);
  const [checkItems] = useState<CheckItem[]>([
    { id: 1, title: "塗装", instruction: "塗装厚を測定してください", type: "number", unit: "μm", referenceImage: "" },
    { id: 2, title: "外観", instruction: "外観の状態を選択してください", type: "select" },
    { id: 3, title: "寸法A", instruction: "寸法Aを測定してください", type: "number", unit: "mm" },
    { id: 4, title: "寸法B", instruction: "寸法Bを測定してください", type: "number", unit: "mm" },
    { id: 5, title: "重量", instruction: "重量を測定してください", type: "number", unit: "g" },
    { id: 6, title: "硬度", instruction: "硬度を測定してください", type: "number", unit: "HRC" },
    { id: 7, title: "色調", instruction: "色調の状態を選択してください", type: "select" },
    { id: 8, title: "表面処理", instruction: "表面処理の状態を選択してください", type: "select" },
    { id: 9, title: "機能テスト", instruction: "機能テストの結果を入力してください", type: "text" },
    { id: 10, title: "耐久性", instruction: "耐久性テストの結果を選択してください", type: "select" },
    { id: 11, title: "精度", instruction: "精度を測定してください", type: "number", unit: "±mm" },
    { id: 12, title: "総合判定", instruction: "総合判定を選択してください", type: "select" },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<{ [key: number]: any }>({});
  const [comments, setComments] = useState<{ [key: number]: string }>({});
  const [photos, setPhotos] = useState<{ [key: number]: string[] }>({});
  const [elapsedTime, setElapsedTime] = useState(753); // 12分33秒 = 753秒
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("#000000");
  const [penSize, setPenSize] = useState(2);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentItem = checkItems[currentIndex];
  const progress = currentIndex + 1;
  const total = checkItems.length;

  // Timer effect
  useState(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs.toString().padStart(2, '0')}秒`;
  };

  const handleNext = () => {
    if (currentIndex < checkItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowResultConfirmation(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleResponseChange = (value: any) => {
    setResponses({ ...responses, [currentItem.id]: value });
  };

  const handleCommentChange = (value: string) => {
    setComments({ ...comments, [currentItem.id]: value });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        const currentPhotos = photos[currentItem.id] || [];
        setPhotos({ ...photos, [currentItem.id]: [...currentPhotos, imageUrl] });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
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
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penSize;
        ctx.lineCap = 'round';
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleEditItem = (itemIndex: number) => {
    setCurrentIndex(itemIndex);
    setShowResultConfirmation(false);
  };

  if (showResultConfirmation) {
    return (
      <ExecutionResultConfirmation
        sheet={sheet}
        onBack={() => setShowResultConfirmation(false)}
        onConfirm={onComplete}
        onEditItem={handleEditItem}
      />
    );
  }

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
            <h2 className="text-gray-900">{sheet.productName} 初期ロット検査</h2>
          </div>
          <Button variant="outline" size="sm">
            {sheet.assignee}
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>進捗: {progress}/{total}</span>
            <span>経過時間: {formatTime(elapsedTime)}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${(progress / total) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Item Title */}
              <div>
                <h3 className="text-gray-900">{progress}. {currentItem.title}</h3>
              </div>

              {/* Reference Image */}
              <div className="space-y-2">
                <Label>参考画像</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
                  <div className="text-center text-gray-500">
                    画像表示エリア
                  </div>
                </div>
              </div>

              {/* Drawing Canvas */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Pen className="w-4 h-4 mr-2" />
                    手書きコメント
                  </Button>
                  <Select value={penColor} onValueChange={setPenColor}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="ペン色" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="#000000">黒</SelectItem>
                      <SelectItem value="#FF0000">赤</SelectItem>
                      <SelectItem value="#0000FF">青</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={penSize.toString()} onValueChange={(v) => setPenSize(Number(v))}>
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
                <p className="text-sm text-gray-900">{currentItem.instruction}</p>
                
                {currentItem.type === "number" && (
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      value={responses[currentItem.id] || ""}
                      onChange={(e) => handleResponseChange(e.target.value)}
                      className="max-w-xs"
                    />
                    {currentItem.unit && <span className="text-sm text-gray-600">{currentItem.unit}</span>}
                  </div>
                )}

                {currentItem.type === "select" && (
                  <Select
                    value={responses[currentItem.id]}
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
                  <span className="text-sm text-gray-600">画像プレビュー</span>
                </div>
                {photos[currentItem.id] && photos[currentItem.id].length > 0 && (
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
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            前へ
          </Button>
          <Button onClick={handleNext}>
            {currentIndex === checkItems.length - 1 ? "完了" : "次へ"}
            {currentIndex !== checkItems.length - 1 && <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />}
          </Button>
        </div>
      </div>
    </div>
  );
}