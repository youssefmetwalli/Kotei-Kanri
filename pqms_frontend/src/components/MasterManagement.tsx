import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, Filter, Plus, Edit, Trash2 } from "lucide-react";
import { CheckItemCreation } from "./CheckItemCreation";
import { CheckItemEdit } from "./CheckItemEdit";
import { api } from "../lib/api";
import type {
  CheckItem as BackendCheckItem,
  CheckItemType,
  Category,
} from "../types/backend";

export function MasterManagement() {
  const [showCreation, setShowCreation] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  const [checkItems, setCheckItems] = useState<BackendCheckItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // -------------------------
  // Helpers
  // -------------------------

  const getTypeLabel = (type: CheckItemType): string => {
    switch (type) {
      case "number":
        return "数値";
      case "text":
        return "テキスト";
      case "select":
        return "選択";
      case "boolean":
        return "真偽";
      case "photo":
        return "写真";
      default:
        return type;
    }
  };

  const getTypeColor = (type: CheckItemType) => {
    switch (type) {
      case "number":
        return "bg-blue-100 text-blue-700";
      case "select":
      case "boolean":
        return "bg-green-100 text-green-700";
      case "photo":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getCategoryName = (item: BackendCheckItem): string => {
    const cat = item.category as Category | number | null;
    if (!cat || typeof cat === "number") return "";
    return cat.name;
  };

  const formatItemId = (id: number) => `CHK${String(id).padStart(3, "0")}`;

  // -------------------------
  // Load check items from backend
  // -------------------------

  const fetchCheckItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{
        count?: number;
        results?: BackendCheckItem[];
      }>("/check-items/");

      const items: BackendCheckItem[] =
        res.data.results ?? (res.data as any) ?? [];

      setCheckItems(items);
    } catch (err) {
      console.error(err);
      setError("チェック項目一覧の取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckItems();
  }, []);

  // -------------------------
  // CRUD callbacks for child screens
  // -------------------------

  const handleCreatedItem = (item: BackendCheckItem) => {
    // 画面戻しつつローカルリスト更新（先頭に追加）
    setShowCreation(false);
    setCheckItems((prev) => [item, ...prev]);
  };

  const handleUpdatedItem = (item: BackendCheckItem) => {
    setEditingItemId(null);
    setCheckItems((prev) =>
      prev.map((ci) => (ci.id === item.id ? item : ci))
    );
  };

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm("このチェック項目を削除しますか？")) return;
    try {
      await api.delete(`/check-items/${id}/`);
      setCheckItems((prev) => prev.filter((ci) => ci.id !== id));
    } catch (err) {
      console.error(err);
      setError("チェック項目の削除に失敗しました。");
    }
  };

  // -------------------------
  // Search & pagination (client side)
  // -------------------------

  const filteredItems = checkItems.filter((item) => {
    const q = searchQuery.toLowerCase();
    const idStr = formatItemId(item.id).toLowerCase();
    const name = item.name.toLowerCase();
    const cat = getCategoryName(item).toLowerCase();
    return (
      name.includes(q) || idStr.includes(q) || cat.includes(q)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / itemsPerPage)
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // ページが溢れたときの調整（削除後など）
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  // -------------------------
  // Sub-screens (create / edit)
  // -------------------------

  if (showCreation) {
    return (
      <CheckItemCreation
        onBack={() => setShowCreation(false)}
        onSaved={handleCreatedItem}
      />
    );
  }

  if (editingItemId !== null) {
    return (
      <CheckItemEdit
        itemId={editingItemId}
        onBack={() => setEditingItemId(null)}
        onSaved={handleUpdatedItem}
      />
    );
  }

  // -------------------------
  // Main list screen
  // -------------------------

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-gray-900">マスタ管理</h2>
            <p className="text-sm text-gray-500 mt-1">
              チェック項目マスタの管理
            </p>
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
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="検索..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
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

            {loading && (
              <p className="text-sm text-gray-500 mb-2">
                チェック項目を読み込み中です...
              </p>
            )}
            {error && (
              <p className="text-sm text-red-600 mb-2">{error}</p>
            )}

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">
                        項目ID
                      </th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">
                        項目名
                      </th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">
                        タイプ
                      </th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">
                        カテゴリ
                      </th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">
                        使用回数
                      </th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((item) => {
                      const typeLabel = getTypeLabel(item.type);
                      const categoryName = getCategoryName(item);
                      const usageCount = 0; // backendに無いので現状は0かダミー

                      return (
                        <tr
                          key={item.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatItemId(item.id)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs ${getTypeColor(
                                item.type
                              )}`}
                            >
                              {typeLabel}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {categoryName || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {usageCount}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setEditingItemId(item.id)
                                }
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeleteItem(item.id)
                                }
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {currentItems.length === 0 && !loading && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-6 text-sm text-gray-500 text-center"
                        >
                          チェック項目がありません。
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                {filteredItems.length}件中{" "}
                {filteredItems.length === 0
                  ? 0
                  : `${startIndex + 1}-${Math.min(
                      startIndex + itemsPerPage,
                      filteredItems.length
                    )}`}{" "}
                件を表示
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }
                  disabled={currentPage === 1}
                >
                  前へ
                </Button>
                {Array.from(
                  { length: totalPages },
                  (_, i) => i + 1
                ).map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={
                      currentPage === pageNum ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(totalPages, p + 1)
                    )
                  }
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
