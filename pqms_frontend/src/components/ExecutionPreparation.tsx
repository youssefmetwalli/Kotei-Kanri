import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { ArrowLeft, ChevronDown, MapPin } from "lucide-react";
import { CheckSheetExecution } from "./CheckSheetExecution";

interface ExecutionPreparationProps {
  sheet: {
    id: number;
    productName: string;
    lotNumber: string;
    assignee: string;
  };
  onBack: () => void;
  onStartExecution: () => void;
}

export function ExecutionPreparation({
  sheet,
  onBack,
  onStartExecution,
}: ExecutionPreparationProps) {
  const [showExecution, setShowExecution] = useState(false);
  const [preparationChecks, setPreparationChecks] = useState([
    { id: 1, label: "必要な機材を準備した", checked: false },
    { id: 2, label: "安全装備を着用した", checked: false },
    { id: 3, label: "作業環境を確認した", checked: false },
  ]);

  const currentDate = new Date();
  const formattedDateTime = `${currentDate.getFullYear()}/${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}/${String(currentDate.getDate()).padStart(
    2,
    "0"
  )} ${String(currentDate.getHours()).padStart(2, "0")}:${String(
    currentDate.getMinutes()
  ).padStart(2, "0")}`;
  const manufacturingDate = "2024/03/10";

  const toggleCheck = (id: number) => {
    setPreparationChecks((prev) =>
      prev.map((check) =>
        check.id === id ? { ...check, checked: !check.checked } : check
      )
    );
  };

  const allChecked = preparationChecks.every((check) => check.checked);

  const handleStartExecution = () => {
    setShowExecution(true);
  };

  const handleExecutionComplete = () => {
    // 実行画面を閉じてから、親コンポーネントへ「完了」を通知
    setShowExecution(false);
    onStartExecution();
  };

  if (showExecution) {
    return (
      <CheckSheetExecution
        sheet={sheet}
        onBack={() => setShowExecution(false)}
        onComplete={handleExecutionComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Button>
            <h2 className="text-gray-900">実行準備</h2>
          </div>
          <Button variant="outline" size="sm">
            {sheet.assignee}
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-8 space-y-8">
              {/* Title */}
              <div>
                <h1 className="text-gray-900">
                  {sheet.productName} 初期ロット検査
                </h1>
              </div>

              {/* Product Information */}
              <div className="space-y-3">
                <h3 className="text-gray-900">製品情報</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="text-gray-600 w-32">製品:</span>
                    <span className="text-gray-900">{sheet.productName}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-32">ロット番号:</span>
                    <span className="text-gray-900">{sheet.lotNumber}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-32">製造日:</span>
                    <span className="text-gray-900">{manufacturingDate}</span>
                  </div>
                </div>
              </div>

              {/* Work Information */}
              <div className="space-y-3">
                <h3 className="text-gray-900">作業情報</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="text-gray-600 w-32">
                      作業チェックリスト:
                    </span>
                    <span className="text-gray-900">3つ</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-32">
                      推定作業時間:
                    </span>
                    <span className="text-gray-900">45分</span>
                  </div>
                </div>
              </div>

              {/* Executor Information */}
              <div className="space-y-3">
                <h3 className="text-gray-900">実行者情報</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="text-gray-600 w-32">実行者:</span>
                    <span className="text-gray-900">{sheet.assignee}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-32">開始時刻:</span>
                    <span className="text-gray-900">{formattedDateTime}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 w-32">開始位置:</span>
                    <span className="text-gray-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      [GPS取得中...]
                    </span>
                  </div>
                </div>
              </div>

              {/* Preparation Checks */}
              <div className="space-y-3">
                <h3 className="text-gray-900">準備チェック</h3>
                <div className="space-y-3">
                  {preparationChecks.map((check) => (
                    <div key={check.id} className="flex items-center gap-3">
                      <Checkbox
                        id={`check-${check.id}`}
                        checked={check.checked}
                        onCheckedChange={() => toggleCheck(check.id)}
                      />
                      <label
                        htmlFor={`check-${check.id}`}
                        className="text-sm text-gray-900 cursor-pointer"
                      >
                        {check.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <Button
                  className="w-full"
                  size="lg"
                  disabled={!allChecked}
                  onClick={handleStartExecution}
                >
                  実行開始
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}