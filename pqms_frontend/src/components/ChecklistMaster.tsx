import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, Filter, Plus, Edit, Trash2, FileText } from "lucide-react";
import { ChecklistDetail } from "./ChecklistDetail";
import { api } from "../lib/api";
import type { Checklist as BackendChecklist, Execution } from "../types/backend";

interface ChecklistRow {
  id: number;
  name: string;
  itemCount: number;
  usageCount: number;
  createdDate: string;
}

export function ChecklistMaster() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedChecklist, setSelectedChecklist] =
    useState<ChecklistRow | null>(null);

  const [checklists, setChecklists] = useState<ChecklistRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 10;

  // --------- load from backend ----------
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [clRes, execRes] = await Promise.all([
          api.get<{ count?: number; results?: BackendChecklist[] }>(
            "/checklists/"
          ),
          api.get<{ count?: number; results?: Execution[] }>("/executions/"),
        ]);

        const backendChecklists: BackendChecklist[] =
          clRes.data.results ??
          ((clRes.data as unknown) as BackendChecklist[]);

        const executions: Execution[] =
          execRes.data.results ??
          ((execRes.data as unknown) as Execution[]);

        // usageCount per checklist (how many executions reference it)
        const usageMap: Record<number, number> = {};
        executions.forEach((e) => {
          let checklistId: number | null = null;

          // Some APIs may return checklist as id, others as object
          const c = e.checklist as any;
          if (typeof c === "number") {
            checklistId = c;
          } else if (c && typeof c === "object" && "id" in c) {
            checklistId = c.id as number;
          }

          if (checklistId != null) {
            usageMap[checklistId] = (usageMap[checklistId] ?? 0) + 1;
          }
        });

        const rows: ChecklistRow[] = backendChecklists.map((cl: any) => ({
          id: cl.id,
          name: cl.name,
          itemCount: Array.isArray(cl.items) ? cl.items.length : 0,
          usageCount: usageMap[cl.id] ?? 0,
          createdDate: cl.created_at ? cl.created_at.slice(0, 10) : "",
        }));

        setChecklists(rows);
      } catch (err) {
        console.error(err);
        setError("チェックリストの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --------- search + pagination ----------
  const filteredChecklists = checklists.filter((checklist) => {
    const term = searchTerm.toLowerCase();
    return (
      checklist.name.toLowerCase().includes(term) ||
      checklist.id.toString().toLowerCase().includes(term)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredChecklists.length / itemsPerPage)
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentChecklists = filteredChecklists.slice(startIndex, endIndex);

  const renderPagination = () => {
    const pages: (number | "...")[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }

    return pages;
  };

  // --------- save + delete handlers ----------
  const handleSaveChecklist = (data: any) => {
    // ChecklistDetail already PATCHes to backend;
    // here we just reflect basic fields locally.
    setChecklists((prev) =>
      prev.map((c) =>
        c.id === data.id
          ? {
              ...c,
              name: data.listName ?? c.name,
            }
          : c
      )
    );
    setSelectedChecklist(null);
  };

  const handleDeleteChecklist = async (row: ChecklistRow) => {
    if (!window.confirm(`「${row.name}」を削除しますか？`)) return;

    try {
      await api.delete(`/checklists/${row.id}/`);
      setChecklists((prev) => prev.filter((c) => c.id !== row.id));
    } catch (err) {
      console.error(err);
      alert("チェックリストの削除に失敗しました。");
    }
  };

  // --------- create new checklist ----------
  const handleCreateChecklist = async () => {
    try {
      // 最低限の情報だけで新規チェックリストを作成
      const res = await api.post<BackendChecklist>("/checklists/", {
        name: "新しいチェックリスト",
        description: "",
        // category_id は任意 / items_write も任意なので省略
      });

      const newCl = res.data;

      const newRow: ChecklistRow = {
        id: newCl.id,
        name: newCl.name,
        itemCount: Array.isArray((newCl as any).items)
          ? (newCl as any).items.length
          : 0,
        usageCount: 0,
        createdDate: newCl.created_at ? newCl.created_at.slice(0, 10) : "",
      };

      // 一覧に追加（先頭に挿入）
      setChecklists((prev) => [newRow, ...prev]);

      // すぐに詳細編集画面へ遷移
      setSelectedChecklist(newRow);
    } catch (err) {
      console.error(err);
      alert("チェックリストの作成に失敗しました。");
    }
  };

  // --------- detail view ----------
  if (selectedChecklist) {
    return (
      <ChecklistDetail
        checklist={selectedChecklist}
        onBack={() => setSelectedChecklist(null)}
        onSave={handleSaveChecklist}
      />
    );
  }

  // --------- list view ----------
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-gray-900">作業チェックリスト一覧</h2>
            <p className="text-sm text-gray-500 mt-1">
              作業チェックリストの管理（バックエンド連携）
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <Card>
          <CardHeader className="border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="検索..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 md:flex-none"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  フィルタ
                </Button>
                <Button
                  size="sm"
                  className="flex-1 md:flex-none"
                  onClick={handleCreateChecklist}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  新規作成
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 md:flex-none"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  テンプレートから
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading && (
              <p className="px-4 py-2 text-sm text-gray-500">
                チェックリストを読み込み中です…
              </p>
            )}
            {error && (
              <p className="px-4 py-2 text-sm text-red-600">{error}</p>
            )}

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      リスト名
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      項目数
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      使用回数
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      作成日
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentChecklists.map((checklist) => (
                    <tr
                      key={checklist.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {checklist.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {checklist.itemCount}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {checklist.usageCount}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {checklist.createdDate}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedChecklist(checklist)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteChecklist(checklist)
                            }
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {currentChecklists.length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-6 text-sm text-gray-500 text-center"
                      >
                        チェックリストがありません。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y">
              {currentChecklists.map((checklist) => (
                <div key={checklist.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-gray-900">{checklist.name}</h3>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedChecklist(checklist)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDeleteChecklist(checklist)
                        }
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">項目数:</span>
                      <span className="ml-1 text-gray-900">
                        {checklist.itemCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">使用回数:</span>
                      <span className="ml-1 text-gray-900">
                        {checklist.usageCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">作成日:</span>
                      <span className="ml-1 text-gray-900">
                        {checklist.createdDate}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {currentChecklists.length === 0 && !loading && (
                <div className="p-4 text-sm text-gray-500 text-center">
                  チェックリストがありません。
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-center gap-1">
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
                {renderPagination().map((page, index) =>
                  typeof page === "number" ? (
                    <Button
                      key={index}
                      variant={
                        currentPage === page ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ) : (
                    <span key={index} className="px-2 text-gray-500">
                      {page}
                    </span>
                  )
                )}
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
