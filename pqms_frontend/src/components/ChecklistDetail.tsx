import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowLeft, Plus, Edit, Trash2, Eye } from "lucide-react";

interface CheckItem {
  id: number;
  name: string;
  type: string;
  required: boolean;
}

interface ChecklistDetailProps {
  checklist: {
    id: string;
    name: string;
  };
  onBack: () => void;
  onSave: (data: any) => void;
}

export function ChecklistDetail({ checklist, onBack, onSave }: ChecklistDetailProps) {
  const [listName, setListName] = useState(checklist.name);
  const [description, setDescription] = useState("塗装前の準備確認項目");
  const [category, setCategory] = useState("painting");
  const [estimatedTime, setEstimatedTime] = useState("15");

  const [checkItems, setCheckItems] = useState<CheckItem[]>([
    { id: 1, name: "表面清掃", type: "選択", required: true },
    { id: 2, name: "温度確認", type: "数値", required: true },
    { id: 3, name: "湿度確認", type: "数値", required: true },
    { id: 4, name: "塗料の種類確認", type: "選択", required: true },
    { id: 5, name: "塗料の粘度", type: "数値", required: true },
    { id: 6, name: "マスキング確認", type: "選択", required: true },
    { id: 7, name: "下地処理状態", type: "選択", required: true },
    { id: 8, name: "ダスト除去", type: "選択", required: false },
    { id: 9, name: "乾燥時間", type: "数値", required: true },
    { id: 10, name: "換気状態", type: "選択", required: true },
    { id: 11, name: "作業環境確認", type: "選択", required: false },
    { id: 12, name: "安全装備確認", type: "選択", required: true },
  ]);

  const handleDeleteItem = (id: number) => {
    setCheckItems(checkItems.filter(item => item.id !== id));
  };

  const handleAddItem = () => {
    const newId = Math.max(...checkItems.map(item => item.id), 0) + 1;
    setCheckItems([
      ...checkItems,
      { id: newId, name: "新規項目", type: "選択", required: false }
    ]);
  };

  const handleSave = () => {
    const data = {
      id: checklist.id,
      listName,
      description,
      category,
      estimatedTime,
      checkItems,
    };
    onSave(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
          <h2 className="text-gray-900">チェックリスト詳細</h2>
        </div>
      </header>

      {/* Form Content */}
      <div className="overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* 基本情報 */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-gray-900">基本情報</h3>
              
              <div className="space-y-2">
                <Label htmlFor="list-name">
                  リスト名<span className="text-red-600">*</span>
                </Label>
                <Input
                  id="list-name"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="リスト名を入力してください"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">説明</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="説明を入力してください"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">
                    カテゴリ<span className="text-red-600">*</span>
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="painting">塗装</SelectItem>
                      <SelectItem value="welding">溶接</SelectItem>
                      <SelectItem value="appearance">外観</SelectItem>
                      <SelectItem value="dimension">寸法</SelectItem>
                      <SelectItem value="strength">強度</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimated-time">推定作業時間（分）</Label>
                  <Input
                    id="estimated-time"
                    type="number"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    placeholder="分"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* チェック項目 */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-900">チェック項目（{checkItems.length}項目）</h3>
                <Button size="sm" onClick={handleAddItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  チェック項目を追加
                </Button>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto border rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider w-16">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                        項目名
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider w-24">
                        タイプ
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider w-16">
                        必須
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider w-32">
                        アクション
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {checkItems.map((item, index) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.type}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.required ? "○" : ""}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm">
                              編集
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              削除
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {checkItems.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">#{index + 1}</span>
                        <span className="text-gray-900">{item.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm">
                          編集
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          削除
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">タイプ: </span>
                        <span className="text-gray-900">{item.type}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">必須: </span>
                        <span className="text-gray-900">{item.required ? "○" : ""}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" size="lg">
              <Eye className="w-4 h-4 mr-2" />
              プレビュー
            </Button>
            <Button variant="outline" size="lg" onClick={onBack}>
              キャンセル
            </Button>
            <Button size="lg" onClick={handleSave}>
              保存
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
