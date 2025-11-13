import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Search, Filter, FileDown, FileSpreadsheet, ClipboardList } from "lucide-react";

interface ExecutionRecord {
  id: number;
  executionDate: string;
  executionTime: string;
  sheetName: string;
  product: string;
  executor: string;
  result: "合格" | "不合格" | "要注意";
  status: "完了" | "承認待ち" | "差戻し";
  inspectionType: string;
}

export function QualityControl() {
  const [records, setRecords] = useState<ExecutionRecord[]>([
    {
      id: 1,
      executionDate: "2024/03/15",
      executionTime: "10:30",
      sheetName: "製品A",
      product: "製品A",
      executor: "田中",
      result: "合格",
      status: "完了",
      inspectionType: "初期日次検査",
    },
    {
      id: 2,
      executionDate: "2024/03/14",
      executionTime: "14:00",
      sheetName: "製品B",
      product: "製品B",
      executor: "佐藤",
      result: "不合格",
      status: "承認待ち",
      inspectionType: "最終検査",
    },
    {
      id: 3,
      executionDate: "2024/03/14",
      executionTime: "09:15",
      sheetName: "製品C",
      product: "製品C",
      executor: "鈴木",
      result: "合格",
      status: "完了",
      inspectionType: "中間検査",
    },
    {
      id: 4,
      executionDate: "2024/03/13",
      executionTime: "16:45",
      sheetName: "製品D",
      product: "製品D",
      executor: "高橋",
      result: "要注意",
      status: "承認待ち",
      inspectionType: "初期日次検査",
    },
    {
      id: 5,
      executionDate: "2024/03/13",
      executionTime: "11:20",
      sheetName: "製品E",
      product: "製品E",
      executor: "伊藤",
      result: "合格",
      status: "完了",
      inspectionType: "最終検査",
    },
    {
      id: 6,
      executionDate: "2024/03/12",
      executionTime: "13:30",
      sheetName: "製品F",
      product: "製品F",
      executor: "山田",
      result: "不合格",
      status: "差戻し",
      inspectionType: "中間検査",
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = 10;

  const getResultVariant = (result: string) => {
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

  const getStatusColor = (status: string) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-gray-900">実行履歴一覧</h2>
            <p className="text-sm text-gray-500 mt-1">過去の検査実行履歴と結果</p>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="検索..." className="pl-10" />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                フィルタ
              </Button>
              <Button variant="outline">
                <FileDown className="w-4 h-4 mr-2" />
                PDF出力
              </Button>
              <Button variant="outline">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel出力
              </Button>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">実行日時</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">シート名</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">製品</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">実行者</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">判定</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">ステータス</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">{record.executionDate}</div>
                          <div className="text-sm text-gray-600">{record.executionTime}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">{record.sheetName}</div>
                          <div className="text-xs text-gray-600">{record.inspectionType}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">{record.product}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{record.executor}</td>
                        <td className="px-4 py-4">
                          <Badge variant={getResultVariant(record.result)}>
                            {record.result}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(record.status)}`}>
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
                    ))}
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
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  前へ
                </Button>
                {[1, 2, 3].map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                ))}
                <span className="px-2 py-1 text-sm text-gray-600">...</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </Button>
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