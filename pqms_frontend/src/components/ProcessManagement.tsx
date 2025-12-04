import { useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Plus,
  Search,
  Filter,
  FileText,
  BarChart3,
  LayoutGrid,
  List,
  Calendar,
  User,
} from "lucide-react";
import { ProcessSheetDetail } from "./ProcessSheetDetail";
import { api } from "../lib/api";
import type { ProcessSheet as BackendProcessSheet } from "../types/backend";

const ITEM_TYPE = "PROCESS_CARD";
type KanbanStatus = "計画中" | "実行準備中" | "実行中" | "完了";

interface ProcessSheetCard {
  id: number;
  productName: string;
  lotNumber: string;
  assignee: string;
  inspector: string;
  progress: number;
  deadline: string;
  status: KanbanStatus;
}

interface DraggableCardProps {
  sheet: ProcessSheetCard;
  statusColor: string;
  onCardClick: (sheet: ProcessSheetCard) => void;
}

function DraggableCard({
  sheet,
  statusColor,
  onCardClick,
}: DraggableCardProps) {
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id: sheet.id, status: sheet.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div ref={(el) => drag(el)} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Card
        className={`${statusColor} border-2 hover:shadow-lg transition-shadow cursor-pointer`}
        onClick={(e) => {
          e.stopPropagation();
          onCardClick(sheet);
        }}
      >
        <CardContent className="p-4 space-y-3">
          <div>
            <h4 className="text-gray-900 mb-1">{sheet.productName}</h4>
            <p className="text-sm text-gray-600">ロット: {sheet.lotNumber}</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4" />
              <span>担当: {sheet.assignee}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4" />
              <span>検査: {sheet.inspector}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>期限: {sheet.deadline}</span>
            </div>
          </div>
          {sheet.status !== "計画中" && sheet.status !== "実行準備中" && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">進捗</span>
                <span className="text-xs text-gray-900">{sheet.progress}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${sheet.progress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface DroppableColumnProps {
  status: KanbanStatus;
  sheets: ProcessSheetCard[];
  statusColor: string;
  onDrop: (itemId: number, newStatus: KanbanStatus) => void;
  onCardClick: (sheet: ProcessSheetCard) => void;
  count: number;
}

function DroppableColumn({
  status,
  sheets,
  statusColor,
  onDrop,
  onCardClick,
  count,
}: DroppableColumnProps) {
  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item: { id: number; status: KanbanStatus }) => {
      if (item.status !== status) {
        onDrop(item.id, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div ref={drop} className="flex flex-col">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-gray-900">{status}</h3>
          <Badge variant="secondary">{count}</Badge>
        </div>
        <div className="h-1 bg-gray-200 rounded-full" />
      </div>
      <div
        className={`space-y-3 flex-1 min-h-[200px] p-2 rounded-lg transition-colors ${
          isOver ? "bg-blue-50 border-2 border-dashed border-blue-300" : ""
        }`}
      >
        {sheets.map((sheet) => (
          <DraggableCard
            key={sheet.id}
            sheet={sheet}
            statusColor={statusColor}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </div>
  );
}

// backend status <-> kanban label mapping
const backendToKanbanStatus = (
  status: BackendProcessSheet["status"]
): KanbanStatus => {
  switch (status) {
    case "planning":
      return "計画中";
    case "preparing":
      return "実行準備中";
    case "running":
      return "実行中";
    case "done":
      return "完了";
    default:
      return "計画中";
  }
};

const kanbanToBackendStatus = (
  status: KanbanStatus
): BackendProcessSheet["status"] => {
  switch (status) {
    case "計画中":
      return "planning";
    case "実行準備中":
      return "preparing";
    case "実行中":
      return "running";
    case "完了":
      return "done";
  }
};

export function ProcessManagement() {
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [selectedSheet, setSelectedSheet] = useState<ProcessSheetCard | null>(
    null
  );
  const [processSheets, setProcessSheets] = useState<ProcessSheetCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  // new sheet form
  const [newProductName, setNewProductName] = useState("");
  const [newLotNumber, setNewLotNumber] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newInspector, setNewInspector] = useState("");
  const [newDeadline, setNewDeadline] = useState("");

  const statuses: KanbanStatus[] = ["計画中", "実行準備中", "実行中", "完了"];

  const getStatusColor = (status: KanbanStatus) => {
    switch (status) {
      case "計画中":
        return "bg-gray-100 border-gray-300";
      case "実行準備中":
        return "bg-blue-50 border-blue-200";
      case "実行中":
        return "bg-orange-50 border-orange-200";
      case "完了":
        return "bg-green-50 border-green-200";
      default:
        return "bg-gray-100 border-gray-300";
    }
  };

  const getStatusCount = (status: KanbanStatus) => {
    return processSheets.filter((sheet) => sheet.status === status).length;
  };

  // ---- load process sheets from backend ----
  useEffect(() => {
    const fetchSheets = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<{
          count?: number;
          results?: BackendProcessSheet[];
        }>("/process-sheets/");

        const backendSheets: BackendProcessSheet[] =
          res.data.results ?? (res.data as any) ?? [];

        const mapped: ProcessSheetCard[] = backendSheets.map((ps) => {
          const deadline = ps.planned_end ? ps.planned_end.slice(0, 10) : "";

          return {
            id: ps.id,
            productName: ps.project_name || ps.name || "未設定",
            lotNumber: ps.lot_number || "-",
            assignee: ps.assignee || "未設定",
            inspector: ps.inspector || "-",
            progress: ps.progress ?? 0,
            deadline,
            status: backendToKanbanStatus(ps.status),
          };
        });

        setProcessSheets(mapped);
      } catch (err) {
        console.error(err);
        setError("工程シート一覧の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchSheets();
  }, []);

  const handleDrop = async (itemId: number, newStatus: KanbanStatus) => {
    // optimistic UI update (only status; progress could be managed elsewhere)
    setProcessSheets((prevSheets) =>
      prevSheets.map((sheet) =>
        sheet.id === itemId ? { ...sheet, status: newStatus } : sheet
      )
    );

    try {
      const backendStatus = kanbanToBackendStatus(newStatus);
      await api.patch(`/process-sheets/${itemId}/`, {
        status: backendStatus,
      });
    } catch (err) {
      console.error(err);
      setError("ステータス更新に失敗しました。");
    }
  };
  // Create a sheet from a simple template
  const handleCreateFromTemplate = async () => {
    try {
      setError(null);

      const payload: Partial<BackendProcessSheet> & { project_name: string } = {
        name: "テンプレート工程シート",
        project_name: "テンプレート製品",
        assignee: "未設定",
        planned_end: null,
        priority: 2,
        status: "planning",
        notes: "テンプレートから作成された工程シートです。",
        lot_number: "",
        inspector: "",
        progress: 0,
      };

      const res = await api.post<BackendProcessSheet>(
        "/process-sheets/",
        payload
      );
      const ps = res.data;

      const newCard: ProcessSheetCard = {
        id: ps.id,
        productName: ps.project_name || ps.name || "未設定",
        lotNumber: ps.lot_number || "-",
        assignee: ps.assignee || "未設定",
        inspector: ps.inspector || "-",
        progress: ps.progress ?? 0,
        deadline: ps.planned_end ? ps.planned_end.slice(0, 10) : "",
        status: backendToKanbanStatus(ps.status),
      };

      setProcessSheets((prev) => [...prev, newCard]);
    } catch (err) {
      console.error(err);
      setError("テンプレートからの作成に失敗しました。");
    }
  };

  // Export simple CSV report of current process sheets
  const handleExportReport = () => {
    try {
      const headers = [
        "ID",
        "製品名",
        "ロット番号",
        "ステータス",
        "担当者",
        "検査員",
        "進捗(%)",
        "期限",
      ];

      const rows = processSheets.map((sheet) => [
        sheet.id,
        sheet.productName,
        sheet.lotNumber,
        sheet.status,
        sheet.assignee,
        sheet.inspector,
        sheet.progress,
        sheet.deadline,
      ]);

      const csvContent = [headers, ...rows]
        .map((row) =>
          row
            .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");

      // 🔥 KEY FIX: Add UTF-8 BOM so Excel reads Japanese correctly
      const BOM = "\uFEFF";

      const blob = new Blob([BOM + csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "process_sheets_report.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError("レポート出力に失敗しました。");
    }
  };

  const handleCreateSheet = async () => {
    try {
      const payload: Partial<BackendProcessSheet> & {
        project_name: string;
      } = {
        name: newProductName
          ? `${newProductName} 工程シート`
          : "新規工程シート",
        project_name: newProductName || "未設定",
        assignee: newAssignee || "",
        planned_end: newDeadline || null,
        priority: 2,
        status: "planning",
        notes: "",
        lot_number: newLotNumber || "",
        inspector: newInspector || "",
        progress: 0,
      };

      const res = await api.post<BackendProcessSheet>(
        "/process-sheets/",
        payload
      );
      const ps = res.data;

      const newCard: ProcessSheetCard = {
        id: ps.id,
        productName: ps.project_name || ps.name || "未設定",
        lotNumber: ps.lot_number || "-",
        assignee: ps.assignee || "未設定",
        inspector: ps.inspector || "-",
        progress: ps.progress ?? 0,
        deadline: ps.planned_end ? ps.planned_end.slice(0, 10) : "",
        status: backendToKanbanStatus(ps.status),
      };

      setProcessSheets((prev) => [...prev, newCard]);
      setCreateOpen(false);
      // reset form
      setNewProductName("");
      setNewLotNumber("");
      setNewAssignee("");
      setNewInspector("");
      setNewDeadline("");
    } catch (err) {
      console.error(err);
      setError("工程シートの作成に失敗しました。");
    }
  };

  if (selectedSheet) {
    return (
      <ProcessSheetDetail
        sheet={selectedSheet}
        onBack={() => setSelectedSheet(null)}
        onDeleted={() => {
          setProcessSheets((prev) =>
            prev.filter((ps) => ps.id !== selectedSheet.id)
          );
          setSelectedSheet(null);
        }}
      />
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-900">工程チェックシート管理</h2>
              <p className="text-sm text-gray-500 mt-1">
                工程シートの作成と進捗管理（バックエンド連携）
              </p>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Action Bar */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="検索..." className="pl-10" />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                フィルタ
              </Button>
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    新規工程シート作成
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>新規工程シートの作成</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="product-name">製品名</Label>
                        <Input
                          id="product-name"
                          placeholder="例: 製品A"
                          value={newProductName}
                          onChange={(e) => setNewProductName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lot-number">ロット番号</Label>
                        <Input
                          id="lot-number"
                          placeholder="例: LOT-A1"
                          value={newLotNumber}
                          onChange={(e) => setNewLotNumber(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="assignee">担当者</Label>
                        <Input
                          id="assignee"
                          placeholder="例: 田中太郎"
                          value={newAssignee}
                          onChange={(e) => setNewAssignee(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="inspector">検査員</Label>
                        <Input
                          id="inspector"
                          placeholder="例: 佐藤花子"
                          value={newInspector}
                          onChange={(e) => setNewInspector(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deadline">期限</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={newDeadline}
                        onChange={(e) => setNewDeadline(e.target.value)}
                      />
                    </div>
                    <Button className="w-full" onClick={handleCreateSheet}>
                      作成
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateFromTemplate}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  テンプレートから作成
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportReport}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  レポート出力
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm">
                  すべての製品
                </Button>
                <Button variant="outline" size="sm">
                  すべての優先度
                </Button>
                <div className="flex border rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === "kanban" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-none"
                    onClick={() => setViewMode("kanban")}
                  >
                    <LayoutGrid className="w-4 h-4 mr-2" />
                    カンバン
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-none"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4 mr-2" />
                    リスト
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {loading && (
            <p className="text-sm text-gray-500 mb-2">
              工程シートを読み込み中です...
            </p>
          )}
          {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

          {/* Kanban Board */}
          {viewMode === "kanban" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {statuses.map((status) => (
                <DroppableColumn
                  key={status}
                  status={status}
                  sheets={processSheets.filter(
                    (sheet) => sheet.status === status
                  )}
                  statusColor={getStatusColor(status)}
                  onDrop={handleDrop}
                  onCardClick={setSelectedSheet}
                  count={getStatusCount(status)}
                />
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 text-sm text-gray-600">
                          製品名
                        </th>
                        <th className="text-left px-4 py-3 text-sm text-gray-600">
                          ロット番号
                        </th>
                        <th className="text-left px-4 py-3 text-sm text-gray-600">
                          ステータス
                        </th>
                        <th className="text-left px-4 py-3 text-sm text-gray-600">
                          担当者
                        </th>
                        <th className="text-left px-4 py-3 text-sm text-gray-600">
                          検査員
                        </th>
                        <th className="text-left px-4 py-3 text-sm text-gray-600">
                          進捗
                        </th>
                        <th className="text-left px-4 py-3 text-sm text-gray-600">
                          期限
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {processSheets.map((sheet) => (
                        <tr
                          key={sheet.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {sheet.productName}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {sheet.lotNumber}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary">{sheet.status}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {sheet.assignee}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {sheet.inspector}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {sheet.progress}%
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {sheet.deadline}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DndProvider>
  );
}
