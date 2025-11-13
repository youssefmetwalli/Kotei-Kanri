import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowLeft, ChevronDown, Check, X } from "lucide-react";

interface CheckResult {
  id: number;
  title: string;
  status: "OK" | "NG" | "スキップ";
  value: string;
  note?: string;
}

interface ExecutionResultConfirmationProps {
  sheet: {
    id: number;
    productName: string;
    lotNumber: string;
    assignee: string;
  };
  onBack: () => void;
  onConfirm: () => void;
  onEditItem?: (itemIndex: number) => void;
}

export function ExecutionResultConfirmation({ sheet, onBack, onConfirm, onEditItem }: ExecutionResultConfirmationProps) {
  const [results] = useState<CheckResult[]>([
    { id: 1, title: "表面清掃", status: "OK", value: "完了" },
    { id: 2, title: "温度確認", status: "OK", value: "23.5℃" },
    { id: 3, title: "湿度確認", status: "OK", value: "55%" },
    { id: 4, title: "塗装厚", status: "NG", value: "85μm", note: "要再塗装" },
    { id: 5, title: "外観", status: "OK", value: "良好" },
    { id: 6, title: "寸法A", status: "OK", value: "100.2mm" },
    { id: 7, title: "寸法B", status: "OK", value: "50.1mm" },
    { id: 8, title: "重量", status: "OK", value: "245g" },
    { id: 9, title: "硬度", status: "OK", value: "62HRC" },
    { id: 10, title: "色調", status: "OK", value: "良好" },
    { id: 11, title: "表面処理", status: "OK", value: "良好" },
    { id: 12, title: "機能テスト", status: "OK", value: "正常動作" },
  ]);

  const startTime = "2024/03/15 10:30";
  const endTime = "11:15";
  const executionTime = "45分";

  const okCount = results.filter(r => r.status === "OK").length;
  const ngCount = results.filter(r => r.status === "NG").length;
  const skipCount = results.filter(r => r.status === "スキップ").length;
  const overallResult = ngCount === 0 ? "合格" : "不合格";

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
            <h2 className="text-gray-900">実行結果確認</h2>
          </div>
          <Button variant="outline" size="sm">
            {sheet.assignee}
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-gray-900">{sheet.productName} 初期ロット検査</h1>
          </div>

          {/* Summary */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-gray-900">サマリー</h3>
              <div className="space-y-2 text-sm">
                <div className="flex">
                  <span className="text-gray-600 w-32">実行者:</span>
                  <span className="text-gray-900">{sheet.assignee}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-32">実行日時:</span>
                  <span className="text-gray-900">{startTime} - {endTime}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-32">実行時間:</span>
                  <span className="text-gray-900">{executionTime}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 w-32">総合判定:</span>
                  <Badge
                    variant={overallResult === "合格" ? "default" : "destructive"}
                    className="flex items-center gap-1"
                  >
                    {overallResult === "合格" ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <X className="w-3 h-3" />
                    )}
                    {overallResult}
                  </Badge>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-32">OK項目:</span>
                  <span className="text-gray-900">
                    {okCount}件 / NG項目: {ngCount}件 / スキップ: {skipCount}件
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Check Results */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-gray-900 mb-4">チェック項目別結果</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm text-gray-600 w-16">#</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">項目名</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600 w-24">判定</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">結果</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr
                        key={result.id}
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => onEditItem?.(index)}
                      >
                        <td className="px-4 py-3 text-sm text-gray-900">{index + 1}.</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{result.title}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {result.status === "OK" ? (
                              <>
                                <Check className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-600">OK</span>
                              </>
                            ) : result.status === "NG" ? (
                              <>
                                <X className="w-4 h-4 text-red-600" />
                                <span className="text-sm text-red-600">NG</span>
                              </>
                            ) : (
                              <span className="text-sm text-gray-600">{result.status}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {result.value}
                          {result.note && (
                            <span className="text-red-600 ml-2">({result.note})</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-end">
            <Button variant="outline" size="lg">
              下書き保存
            </Button>
            <Button size="lg" onClick={onConfirm}>
              確定
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}