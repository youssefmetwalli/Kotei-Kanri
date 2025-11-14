import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  Search,
  Filter,
  FileDown,
  FileSpreadsheet,
  ClipboardList,
} from "lucide-react";
import { api } from "../lib/api";
import type { Execution } from "../types/backend";

type ExecutionRecord = {
  id: number;
  executionDate: string;
  executionTime: string;
  sheetName: string;
  product: string;
  executor: string;
  result: "合格" | "不合格" | "要注意";
  status: "完了" | "承認待ち" | "差戻し";
  inspectionType: string;
};

type PaginatedExecutionResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Execution[];
};

export function QualityControl() {
  const [records, setRecords] = useState<ExecutionRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // actual applied search

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---- helpers to map backend values → Japanese UI labels ----

  const mapResultToLabel = (
    result: Execution["result"]
  ): ExecutionRecord["result"] => {
    switch (result) {
      case "pass":
        return "合格";
      case "fail":
        return "不合格";
      case "warn":
        return "要注意";
      default:
        return "要注意";
    }
  };

  const mapStatusToLabel = (
    status: Execution["status"]
  ): ExecutionRecord["status"] => {
    switch (status) {
      case "completed":
        return "完了";
      case "approved":
      case "running":
        return "承認待ち";
      case "rejected":
        return "差戻し";
      case "draft":
      default:
        return "承認待ち";
    }
  };

  const getResultVariant = (result: ExecutionRecord["result"]) => {
    switch (result) {
      case "合格":
        return "default";
      case "不合格":
        return "destructive";
      case "要注意":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: ExecutionRecord["status"]) => {
    switch (status) {
      case "完了":
        return "text-green-600 bg-green-50";
      case "承認待ち":
        return "text-orange-600 bg-orange-50";
      case "差戻し":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formatDateTime = (iso: string | null | undefined) => {
    if (!iso) return { date: "-", time: "-" };
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return { date: `${yyyy}/${mm}/${dd}`, time: `${hh}:${min}` };
  };

  // ---- fetch from backend whenever page or search term changes ----
  useEffect(() => {
    const fetchExecutions = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get<PaginatedExecutionResponse>("/executions/", {
          params: {
            page: currentPage,
            search: searchTerm || undefined,
          },
        });

        const data = res.data;
        const executions = data.results ?? [];

        // DRF PageNumberPagination: count / results.length → total pages
        const pageSize = executions.length || 1;
        const total = data.count ?? executions.length;
        setTotalPages(Math.max(1, Math.ceil(total / pageSize)));

        // map backend Execution → UI ExecutionRecord
        const mapped: ExecutionRecord[] = executions.map((e) => {
          const { date, time } = formatDateTime(e.finished_at || e.started_at || e.created_at);

          // executor may be a string or object
          let executorName = "-";
          if (typeof e.executor === "string") {
            executorName = e.executor;
          } else if (e.executor && typeof e.executor === "object" && "username" in e.executor) {
            executorName = (e.executor as any).username;
          }

          const sheetName =
            (e.checklist && e.checklist.name) ||
            (e.process_sheet && e.process_sheet.name) ||
            "-";

          const product =
            (e.process_sheet && e.process_sheet.project_name) || "-";

          const inspectionType =
            (e.checklist &&
              e.checklist.category &&
              e.checklist.category.name) ||
            "";

          return {
            id: e.id,
            executionDate: date,
            executionTime: time,
            sheetName,
            product,
            executor: executorName,
            result: mapResultToLabel(e.result),
            status: mapStatusToLabel(e.status),
            inspectionType,
          };
        });

        setRecords(mapped);
      } catch (err) {
        console.error(err);
        setError("実行履歴の取得に失敗しました。");
        setRecords([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchExecutions();
  }, [currentPage, searchTerm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchTerm(searchInput.trim());
  };

  const handleResetSearch = () => {
    setSearchInput("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-gray-900">実行履歴一覧</h2>
            <p className="text-sm text-gray-500 mt-1">
              過去の検査実行履歴と結果（バックエンド連携）
            </p>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            {/* Action Bar */}
            <form
              className="flex flex-col sm:flex-row gap-3 mb-6"
              onSubmit={handleSearchSubmit}
            >
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="シート名・製品名・実行者などで検索..."
                  className="pl-10"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="outline">
                  検索
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetSearch}
                >
                  クリア
                </Button>
              </div>
              <Button variant="outline" type="button">
                <Filter className="w-4 h-4 mr-2" />
                フィルタ
              </Button>
              <Button variant="outline" type="button">
                <FileDown className="w-4 h-4 mr-2" />
                PDF出力
              </Button>
              <Button variant="outline" type="button">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel出力
              </Button>
            </form>

            {/* Loading / Error */}
            {loading && (
              <p className="text-sm text-gray-500 mb-4">
                実行履歴を読み込み中です...
              </p>
            )}
            {error && (
              <p className="text-sm text-red-600 mb-4">{error}</p>
            )}

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">
                        実行日時
                      </th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">
                        シート名
                      </th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">
                        製品
                      </th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">
                        実行者
                      </th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">
                        判定
                      </th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">
                        ステータス
                      </th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600" />
                    </tr>
                  </thead>
                  <tbody>
                    {records.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-6 text-center text-sm text-gray-500"
                        >
                          実行履歴が見つかりません。
                        </td>
                      </tr>
                    ) : (
                      records.map((record) => (
                        <tr
                          key={record.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900">
                              {record.executionDate}
                            </div>
                            <div className="text-sm text-gray-600">
                              {record.executionTime}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900">
                              {record.sheetName}
                            </div>
                            <div className="text-xs text-gray-600">
                              {record.inspectionType}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {record.product}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {record.executor}
                          </td>
                          <td className="px-4 py-4">
                            <Badge variant={getResultVariant(record.result)}>
                              {record.result}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(
                                record.status
                              )}`}
                            >
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <Button variant="outline" size="sm">
                              <ClipboardList className="w-4 h-4 mr-1" />
                              検査
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center mt-6">
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

                {/* simple first 3 pages display */}
                {[1, 2, 3].map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={
                      currentPage === pageNum ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={pageNum > totalPages}
                  >
                    {pageNum}
                  </Button>
                ))}

                {totalPages > 3 && (
                  <>
                    <span className="px-2 py-1 text-sm text-gray-600">
                      ...
                    </span>
                    <Button
                      variant={
                        currentPage === totalPages
                          ? "default"
                          : "outline"
                      }
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
