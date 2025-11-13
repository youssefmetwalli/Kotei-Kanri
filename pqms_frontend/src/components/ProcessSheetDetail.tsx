import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { ArrowLeft, Plus, Play } from "lucide-react";
import { ExecutionPreparation } from "./ExecutionPreparation";

interface ChecklistItem {
  id: number;
  name: string;
  itemCount: number;
  estimatedTime: string;
  status: "未実行" | "進行中" | "完了";
}

interface ProcessSheetDetailProps {
  sheet: {
    id: number;
    productName: string;
    lotNumber: string;
    assignee: string;
    inspector: string;
    deadline: string;
    status: string;
  };
  onBack: () => void;
}

export function ProcessSheetDetail({ sheet, onBack }: ProcessSheetDetailProps) {
  const [showExecutionPrep, setShowExecutionPrep] = useState(false);
  const [checklists, setChecklists] = useState<ChecklistItem[]>([
    { id: 1, name: "外観検査", itemCount: 8, estimatedTime: "10分", status: "未実行" },
    { id: 2, name: "寸法検査", itemCount: 12, estimatedTime: "15分", status: "未実行" },
    { id: 3, name: "機能検査", itemCount: 6, estimatedTime: "20分", status: "未実行" },
  ]);

  const [sheetData, setSheetData] = useState({
    name: `${sheet.productName} 初期ロット検査`,
    description: `${sheet.productName}の初期ロット品質検査`,
    product: sheet.productName,
    lotNumber: sheet.lotNumber,
    assignee: sheet.assignee,
    deadline: sheet.deadline,
    priority: "高",
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "完了":
        return "bg-green-100 text-green-700";
      case "進行中":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleStartExecution = () => {
    // TODO: 実際の実行画面への遷移
    console.log("実行開始");
    setShowExecutionPrep(false);
    onBack();
  };

  if (showExecutionPrep) {
    return (
      <ExecutionPreparation
        sheet={sheet}
        onBack={() => setShowExecutionPrep(false)}
        onStartExecution={handleStartExecution}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
          <div>
            <h2 className="text-gray-900">工程チェックシート詳細</h2>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sheet-name">シート名</Label>
                <Input
                  id="sheet-name"
                  value={sheetData.name}
                  onChange={(e) => setSheetData({ ...sheetData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">説明</Label>
                <Textarea
                  id="description"
                  value={sheetData.description}
                  onChange={(e) => setSheetData({ ...sheetData, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product">製品</Label>
                  <Select value={sheetData.product}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="製品A">製品A</SelectItem>
                      <SelectItem value="製品B">製品B</SelectItem>
                      <SelectItem value="製品C">製品C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lot-number">ロット番号</Label>
                  <Input
                    id="lot-number"
                    value={sheetData.lotNumber}
                    onChange={(e) => setSheetData({ ...sheetData, lotNumber: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assignee">担当者</Label>
                  <Select value={sheetData.assignee}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="田中太郎">田中太郎</SelectItem>
                      <SelectItem value="鈴木一郎">鈴木一郎</SelectItem>
                      <SelectItem value="高橋三郎">高橋三郎</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">期限</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={sheetData.deadline}
                    onChange={(e) => setSheetData({ ...sheetData, deadline: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">優先度</Label>
                  <Select value={sheetData.priority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="高">高</SelectItem>
                      <SelectItem value="中">中</SelectItem>
                      <SelectItem value="低">低</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>作業チェックリスト ({checklists.length}つ)</CardTitle>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  作業チェックリストを追加
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">#</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">リスト名</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">項目数</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">推定時間</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">ステータス</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checklists.map((checklist, index) => (
                      <tr key={checklist.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{checklist.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{checklist.itemCount}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{checklist.estimatedTime}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(checklist.status)}`}>
                            {checklist.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Execution History */}
          <Card>
            <CardHeader>
              <CardTitle>実行履歴 (0件)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                実行履歴がありません
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-end">
            <Button variant="outline" onClick={onBack}>
              キャンセル
            </Button>
            <Button variant="outline">
              保存
            </Button>
            <Button onClick={() => setShowExecutionPrep(true)}>
              <Play className="w-4 h-4 mr-2" />
              実行開始
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}