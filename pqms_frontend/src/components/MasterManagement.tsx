import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, Filter, Plus, Edit, Trash2 } from "lucide-react";
import { CheckItemCreation } from "./CheckItemCreation";
import { CheckItemEdit } from "./CheckItemEdit";

interface CheckItem {
  id: string;
  name: string;
  type: string;
  category: string;
  usageCount: number;
}

export function MasterManagement() {
  const [showCreation, setShowCreation] = useState(false);
  const [editingItem, setEditingItem] = useState<CheckItem | null>(null);
  const [checkItems, setCheckItems] = useState<CheckItem[]>([
    { id: "CHK001", name: "塗装厚", type: "数値", category: "塗装", usageCount: 234 },
    { id: "CHK002", name: "外観", type: "選択", category: "外観", usageCount: 156 },
    { id: "CHK003", name: "寸法", type: "数値", category: "寸法", usageCount: 189 },
    { id: "CHK004", name: "溶接ビード", type: "選択", category: "溶接", usageCount: 278 },
    { id: "CHK005", name: "強度試験", type: "数値", category: "強度", usageCount: 145 },
    { id: "CHK006", name: "水密性", type: "選択", category: "防水", usageCount: 92 },
    { id: "CHK007", name: "配管接続", type: "選択", category: "配管", usageCount: 167 },
    { id: "CHK008", name: "電気抵抗", type: "数値", category: "電気", usageCount: 203 },
    { id: "CHK009", name: "表面仕上げ", type: "選択", category: "仕上げ", usageCount: 134 },
    { id: "CHK010", name: "耐荷重", type: "数値", category: "強度", usageCount: 178 },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredItems = checkItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const getTypeColor = (type: string) => {
    return type === "数値" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700";
  };

  const handleSaveItem = (item: any) => {
    console.log("Saved item:", item);
    setShowCreation(false);
    // TODO: 実際のデータ保存処理
  };

  const handleUpdateItem = (item: any) => {
    console.log("Updated item:", item);
    setEditingItem(null);
    // TODO: 実際のデータ更新処理
  };

  if (showCreation) {
    return (
      <CheckItemCreation
        onBack={() => setShowCreation(false)}
        onSave={handleSaveItem}
      />
    );
  }

  if (editingItem) {
    return (
      <CheckItemEdit
        item={editingItem}
        onBack={() => setEditingItem(null)}
        onSave={handleUpdateItem}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-gray-900">マスタ管理</h2>
            <p className="text-sm text-gray-500 mt-1">チェック項目マスタの管理</p>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>チェック項目マスタ一覧</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                フィルタ
              </Button>
              <Button onClick={() => setShowCreation(true)}>
                <Plus className="w-4 h-4 mr-2" />
                新規作成
              </Button>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">項目ID</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">項目名</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">タイプ</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">カテゴリ</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">使用回数</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{item.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 rounded text-xs ${getTypeColor(item.type)}`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.category}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.usageCount}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setEditingItem(item)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                {filteredItems.length}件中 {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredItems.length)}件を表示
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  前へ
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="px-2 py-1 text-sm text-gray-600">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  次へ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}