import { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Plus, Search, Filter, FileText, BarChart3, LayoutGrid, List, Calendar, User } from "lucide-react";
import { ProcessSheetDetail } from "./ProcessSheetDetail";

interface ProcessSheet {
  id: number;
  productName: string;
  lotNumber: string;
  assignee: string;
  inspector: string;
  progress: number;
  deadline: string;
  status: "計画中" | "実行準備中" | "実行中" | "完了";
}

const ITEM_TYPE = "PROCESS_CARD";

interface DraggableCardProps {
  sheet: ProcessSheet;
  statusColor: string;
  onCardClick: (sheet: ProcessSheet) => void;
}

function DraggableCard({ sheet, statusColor, onCardClick }: DraggableCardProps) {
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id: sheet.id, status: sheet.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
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
            <p className="text-sm text-gray-600">
              ロット: {sheet.lotNumber}
            </p>
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
          <Button variant="outline" size="sm" className="w-full" onClick={(e) => e.stopPropagation()}>
            + 新規追加
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface DroppableColumnProps {
  status: "計画中" | "実行準備中" | "実行中" | "完了";
  sheets: ProcessSheet[];
  statusColor: string;
  onDrop: (itemId: number, newStatus: "計画中" | "実行準備中" | "実行中" | "完了") => void;
  onCardClick: (sheet: ProcessSheet) => void;
  count: number;
}

function DroppableColumn({ status, sheets, statusColor, onDrop, onCardClick, count }: DroppableColumnProps) {
  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item: { id: number; status: string }) => {
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

export function ProcessManagement() {
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [selectedSheet, setSelectedSheet] = useState<ProcessSheet | null>(null);
  const [processSheets, setProcessSheets] = useState<ProcessSheet[]>([
    {
      id: 1,
      productName: "製品A",
      lotNumber: "LOT-A1",
      assignee: "田中太郎",
      inspector: "佐藤花子",
      progress: 0,
      deadline: "2025-11-15",
      status: "計画中",
    },
    {
      id: 2,
      productName: "製品B",
      lotNumber: "LOT-B2",
      assignee: "鈴木一郎",
      inspector: "山田次郎",
      progress: 0,
      deadline: "2025-11-12",
      status: "実行準備中",
    },
    {
      id: 3,
      productName: "製品C",
      lotNumber: "LOT-C1",
      assignee: "高橋三郎",
      inspector: "伊藤美咲",
      progress: 65,
      deadline: "2025-11-10",
      status: "実行中",
    },
    {
      id: 4,
      productName: "製品D",
      lotNumber: "LOT-D3",
      assignee: "渡辺五郎",
      inspector: "中村愛",
      progress: 100,
      deadline: "2025-11-08",
      status: "完了",
    },
    {
      id: 5,
      productName: "製品E",
      lotNumber: "LOT-E1",
      assignee: "小林太郎",
      inspector: "加藤美優",
      progress: 0,
      deadline: "2025-11-20",
      status: "計画中",
    },
    {
      id: 6,
      productName: "製品F",
      lotNumber: "LOT-F2",
      assignee: "木村健太",
      inspector: "吉田さくら",
      progress: 45,
      deadline: "2025-11-09",
      status: "実行中",
    },
  ]);

  const statuses: Array<"計画中" | "実行準備中" | "実行中" | "完了"> = [
    "計画中",
    "実行準備中",
    "実行中",
    "完了",
  ];

  const getStatusColor = (status: string) => {
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

  const getStatusCount = (status: string) => {
    return processSheets.filter((sheet) => sheet.status === status).length;
  };

  const handleDrop = (itemId: number, newStatus: "計画中" | "実行準備中" | "実行中" | "完了") => {
    setProcessSheets((prevSheets) =>
      prevSheets.map((sheet) =>
        sheet.id === itemId ? { ...sheet, status: newStatus } : sheet
      )
    );
  };

  if (selectedSheet) {
    return <ProcessSheetDetail sheet={selectedSheet} onBack={() => setSelectedSheet(null)} />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-gray-900">工程チェックシート管理</h2>
            <p className="text-sm text-gray-500 mt-1">工程シートの作成と進捗管理</p>
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
            <Dialog>
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
                      <Input id="product-name" placeholder="例: 製品A" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lot-number">ロット番号</Label>
                      <Input id="lot-number" placeholder="例: LOT-A1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="assignee">担当者</Label>
                      <Input id="assignee" placeholder="例: 田中太郎" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inspector">検査員</Label>
                      <Input id="inspector" placeholder="例: 佐藤花子" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">期限</Label>
                    <Input id="deadline" type="date" />
                  </div>
                  <Button className="w-full">作成</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                テンプレートから作成
              </Button>
              <Button variant="outline" size="sm">
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

        {/* Kanban Board */}
        {viewMode === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statuses.map((status) => (
              <DroppableColumn
                key={status}
                status={status}
                sheets={processSheets.filter((sheet) => sheet.status === status)}
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
                      <th className="text-left px-4 py-3 text-sm text-gray-600">製品名</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">ロット番号</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">ステータス</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">担当者</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">検査員</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">進捗</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">期限</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processSheets.map((sheet) => (
                      <tr key={sheet.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{sheet.productName}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{sheet.lotNumber}</td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">{sheet.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{sheet.assignee}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{sheet.inspector}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{sheet.progress}%</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{sheet.deadline}</td>
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