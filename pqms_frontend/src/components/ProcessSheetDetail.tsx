import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { ArrowLeft, Plus, Play, Trash2 } from "lucide-react";
import { ExecutionPreparation } from "./ExecutionPreparation";
import { ChecklistSelectDialog } from "./ChecklistSelectDialog";
import { api } from "../lib/api";
import type { ProcessSheet, Execution, Checklist } from "../types/backend";

interface ChecklistItemRow {
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
  onDeleted?: () => void;
}

interface ExecutionHistoryRow {
  id: number;
  date: string;
  time: string;
  resultLabel: "合格" | "不合格" | "要注意";
  statusLabel: "完了" | "承認待ち" | "差戻し";
  executor: string;
}

type MaybePaginated<T> =
  | {
      results: T[];
      count?: number;
      next?: string | null;
      previous?: string | null;
    }
  | T[];

function normalizeListResponse<T>(data: MaybePaginated<T>): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as any).results)) {
    return (data as any).results as T[];
  }
  return [];
}

const mapPriorityNumberToLabel = (p?: number | null): "高" | "中" | "低" => {
  if (p === 1) return "高";
  if (p === 3) return "低";
  return "中";
};

const mapPriorityLabelToNumber = (label: string): number => {
  if (label === "高") return 1;
  if (label === "低") return 3;
  return 2;
};

const mapExecResultToLabel = (
  r: Execution["result"]
): "合格" | "不合格" | "要注意" => {
  switch (r) {
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

const mapExecStatusToLabel = (
  s: Execution["status"]
): "完了" | "承認待ち" | "差戻し" => {
  switch (s) {
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

const formatDateTime = (iso: string | null | undefined) => {
  if (!iso) return { date: "-", time: "-" };
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${min}` };
};

export function ProcessSheetDetail({
  sheet,
  onBack,
  onDeleted,
}: ProcessSheetDetailProps) {
  const [showExecutionPrep, setShowExecutionPrep] = useState(false);

  const [backendSheet, setBackendSheet] = useState<ProcessSheet | null>(null);
  const [checklists, setChecklists] = useState<ChecklistItemRow[]>([]);
  const [executionHistory, setExecutionHistory] = useState<
    ExecutionHistoryRow[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // dialog state
  const [checklistDialogOpen, setChecklistDialogOpen] = useState(false);
  const [linkingChecklist, setLinkingChecklist] = useState(false);

  const [sheetData, setSheetData] = useState({
    name: `${sheet.productName} 初期ロット検査`,
    description: `${sheet.productName}の初期ロット品質検査`,
    product: sheet.productName,
    lotNumber: sheet.lotNumber,
    assignee: sheet.assignee,
    inspector: sheet.inspector,
    deadline: sheet.deadline, // yyyy-mm-dd
    priority: "高" as "高" | "中" | "低",
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

  // ---- Load ProcessSheet detail + execution history from backend ----
  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ProcessSheet detail
      const sheetRes = await api.get<ProcessSheet>(
        `/process-sheets/${sheet.id}/`
      );
      const ps = sheetRes.data;
      setBackendSheet(ps);

      const deadlineDate =
        ps.planned_end?.slice(0, 10) || sheet.deadline || "";

      setSheetData((prev) => ({
        ...prev,
        name: ps.name || prev.name,
        description: ps.notes ?? prev.description,
        product: ps.project_name || prev.product,
        assignee: ps.assignee || prev.assignee,
        lotNumber: ps.lot_number || prev.lotNumber,
        inspector: ps.inspector || prev.inspector,
        deadline: deadlineDate,
        priority: mapPriorityNumberToLabel(ps.priority),
      }));

      // Execution history for this process sheet
      const execRes = await api.get<MaybePaginated<Execution>>(
        "/executions/",
        {
          params: { process_sheet: sheet.id },
        }
      );

      const executions = normalizeListResponse(execRes.data);

      const historyRows: ExecutionHistoryRow[] = executions.map((e) => {
        const { date, time } = formatDateTime(
          e.finished_at || e.started_at || e.created_at
        );

        let executorName = "-";
        if (typeof e.executor === "string") {
          executorName = e.executor;
        } else if (
          e.executor &&
          typeof e.executor === "object" &&
          "username" in e.executor
        ) {
          executorName = (e.executor as any).username;
        }

        return {
          id: e.id,
          date,
          time,
          resultLabel: mapExecResultToLabel(e.result),
          statusLabel: mapExecStatusToLabel(e.status),
          executor: executorName,
        };
      });

      setExecutionHistory(historyRows);

      // Derive checklist status from latest execution
      let checklistStatus: ChecklistItemRow["status"] = "未実行";

      if (executions.length > 0) {
        const getExecTimestamp = (e: Execution) =>
          new Date(
            e.finished_at || e.started_at || e.created_at || ""
          ).getTime();

        const latestExec = executions.reduce((latest, current) => {
          return getExecTimestamp(current) > getExecTimestamp(latest)
            ? current
            : latest;
        }, executions[0]);

        if (latestExec.status === "running") {
          checklistStatus = "進行中";
        } else if (
          latestExec.status === "completed" ||
          latestExec.status === "approved"
        ) {
          checklistStatus = "完了";
        } else {
          checklistStatus = "未実行";
        }
      }

      // Checklist (if any) with status derived from executions
      if (ps.checklist) {
        const itemCount =
          (ps.checklist as any).items?.length ??
          (ps as any).checklist_items?.length ??
          0;

        const checklistRow: ChecklistItemRow = {
          id: (ps.checklist as any).id,
          name: (ps.checklist as any).name,
          itemCount,
          estimatedTime: "-", // no field in backend; placeholder
          status: checklistStatus,
        };
        setChecklists([checklistRow]);
      } else {
        setChecklists([]);
      }
    } catch (err) {
      console.error(err);
      setError("工程シート詳細の取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  }, [
    sheet.id,
    sheet.productName,
    sheet.assignee,
    sheet.deadline,
    sheet.lotNumber,
    sheet.inspector,
  ]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleStartExecution = async () => {
    // 実行完了後：準備画面を閉じて最新情報を取得
    setShowExecutionPrep(false);
    await fetchDetail();
  };

  const handleSave = async () => {
    if (!backendSheet) return;

    setSaving(true);
    setError(null);
    setSaveMessage(null);
    try {
      const payload: Partial<ProcessSheet> & {
        notes?: string;
        project_name?: string;
      } = {
        name: sheetData.name,
        project_name: sheetData.product,
        assignee: sheetData.assignee,
        planned_end: sheetData.deadline ? sheetData.deadline : null,
        priority: mapPriorityLabelToNumber(sheetData.priority),
        notes: sheetData.description,
        lot_number: sheetData.lotNumber,
        inspector: sheetData.inspector,
        progress: backendSheet.progress,
      };

      const res = await api.patch<ProcessSheet>(
        `/process-sheets/${backendSheet.id}/`,
        payload
      );
      setBackendSheet(res.data);
      setSaveMessage("保存しました。");
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (err) {
      console.error(err);
      setError("工程シートの保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!backendSheet) return;
    const ok = window.confirm(
      "この工程シートを削除しますか？この操作は取り消せません。"
    );
    if (!ok) return;

    try {
      setDeleting(true);
      setError(null);
      await api.delete(`/process-sheets/${backendSheet.id}/`);
      if (onDeleted) {
        onDeleted();
      } else {
        onBack();
      }
    } catch (err) {
      console.error(err);
      setError("工程シートの削除に失敗しました。");
    } finally {
      setDeleting(false);
    }
  };

  // チェックリスト紐付け
  const handleAttachChecklist = async (cl: Checklist) => {
    if (!backendSheet) return;
    try {
      setLinkingChecklist(true);
      setError(null);
      // backend serializer should accept checklist_id for write
      await api.patch<ProcessSheet>(`/process-sheets/${backendSheet.id}/`, {
        checklist_id: cl.id,
      });
      setChecklistDialogOpen(false);
      setSaveMessage("チェックリストを紐付けました。");
      setTimeout(() => setSaveMessage(null), 2000);
      await fetchDetail();
    } catch (err) {
      console.error(err);
      setError("チェックリストの紐付けに失敗しました。");
    } finally {
      setLinkingChecklist(false);
    }
  };

  // Build the sheet props for ExecutionPreparation from latest backend/local data
  const executionSheetProps = backendSheet
    ? {
        id: backendSheet.id,
        productName: backendSheet.project_name || sheetData.product,
        lotNumber: backendSheet.lot_number || sheetData.lotNumber,
        assignee: backendSheet.assignee || sheetData.assignee,
      }
    : {
        id: sheet.id,
        productName: sheetData.product,
        lotNumber: sheetData.lotNumber,
        assignee: sheetData.assignee,
      };

  const hasChecklist = !!backendSheet?.checklist;

  if (showExecutionPrep) {
    return (
      <ExecutionPreparation
        sheet={executionSheetProps}
        onBack={() => setShowExecutionPrep(false)}
        onStartExecution={handleStartExecution}
      />
    );
  }

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
            <div>
              <h2 className="text-gray-900">工程チェックシート詳細</h2>
              {backendSheet && (
                <p className="text-xs text-gray-500 mt-1">
                  ID: {backendSheet.id} / ステータス: {backendSheet.status}
                </p>
              )}
            </div>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={!backendSheet || deleting}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            {deleting ? "削除中..." : "削除"}
          </Button>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {loading && (
            <p className="text-sm text-gray-500 mb-2">
              工程シート情報を読み込み中です...
            </p>
          )}
          {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
          {saveMessage && (
            <p className="text-sm text-green-600 mb-2">{saveMessage}</p>
          )}

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
                  onChange={(e) =>
                    setSheetData({ ...sheetData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">説明</Label>
                <Textarea
                  id="description"
                  value={sheetData.description}
                  onChange={(e) =>
                    setSheetData({
                      ...sheetData,
                      description: e.target.value,
                    })
                  }
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product">製品</Label>
                  <Select
                    value={sheetData.product}
                    onValueChange={(value: string) =>
                      setSheetData((prev) => ({ ...prev, product: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="製品を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={sheetData.product}>
                        {sheetData.product}
                      </SelectItem>
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
                    onChange={(e) =>
                      setSheetData({
                        ...sheetData,
                        lotNumber: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assignee">担当者</Label>
                  <Select
                    value={sheetData.assignee}
                    onValueChange={(value: string) =>
                      setSheetData((prev) => ({ ...prev, assignee: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="担当者を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={sheetData.assignee}>
                        {sheetData.assignee}
                      </SelectItem>
                      <SelectItem value="田中太郎">田中太郎</SelectItem>
                      <SelectItem value="鈴木一郎">鈴木一郎</SelectItem>
                      <SelectItem value="高橋三郎">高橋三郎</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inspector">検査員</Label>
                  <Input
                    id="inspector"
                    value={sheetData.inspector}
                    onChange={(e) =>
                      setSheetData({
                        ...sheetData,
                        inspector: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">期限</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={sheetData.deadline}
                    onChange={(e) =>
                      setSheetData({
                        ...sheetData,
                        deadline: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">優先度</Label>
                  <Select
                    value={sheetData.priority}
                    onValueChange={(value: "高" | "中" | "低") =>
                      setSheetData((prev) => ({ ...prev, priority: value }))
                    }
                  >
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
                <CardTitle>
                  作業チェックリスト ({checklists.length}つ)
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setChecklistDialogOpen(true)}
                  disabled={!backendSheet || linkingChecklist}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {linkingChecklist
                    ? "紐付け中..."
                    : "作業チェックリストを追加"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {checklists.length === 0 ? (
                <div className="text-sm text-gray-500 py-4">
                  この工程に紐づくチェックリストはまだありません。
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 text-sm text-gray-600">
                          #
                        </th>
                        <th className="text-left px-4 py-3 text-sm text-gray-600">
                          リスト名
                        </th>
                        <th className="text-left px-4 py-3 text-sm text-gray-600">
                          項目数
                        </th>
                        <th className="text-left px-4 py-3 text-sm text-gray-600">
                          推定時間
                        </th>
                        <th className="text-left px-4 py-3 text-sm text-gray-600">
                          ステータス
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {checklists.map((checklist, index) => (
                        <tr
                          key={checklist.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {checklist.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {checklist.itemCount}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {checklist.estimatedTime}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(
                                checklist.status
                              )}`}
                            >
                              {checklist.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Execution History */}
          <Card>
            <CardHeader>
              <CardTitle>実行履歴 ({executionHistory.length}件)</CardTitle>
            </CardHeader>
            <CardContent>
              {executionHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  実行履歴がありません
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 text-gray-600">
                          実行日時
                        </th>
                        <th className="text-left px-4 py-3 text-gray-600">
                          判定
                        </th>
                        <th className="text-left px-4 py-3 text-gray-600">
                          ステータス
                        </th>
                        <th className="text-left px-4 py-3 text-gray-600">
                          実行者
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {executionHistory.map((row) => (
                        <tr key={row.id} className="border-b">
                          <td className="px-4 py-3">
                            <div className="text-gray-900">{row.date}</div>
                            <div className="text-gray-600 text-xs">
                              {row.time}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            {row.resultLabel}
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            {row.statusLabel}
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            {row.executor}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-end">
            <Button variant="outline" onClick={onBack} disabled={deleting}>
              キャンセル
            </Button>
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={saving || deleting}
            >
              {saving ? "保存中..." : "保存"}
            </Button>
            <Button
              onClick={() => setShowExecutionPrep(true)}
              disabled={deleting || !hasChecklist}
              title={
                hasChecklist
                  ? ""
                  : "チェックリストが紐づいていません。作業チェックリストを追加してください。"
              }
            >
              <Play className="w-4 h-4 mr-2" />
              実行開始
            </Button>
          </div>
        </div>
      </div>

      {/* Checklist select dialog */}
      <ChecklistSelectDialog
        open={checklistDialogOpen}
        onOpenChange={setChecklistDialogOpen}
        onSelect={handleAttachChecklist}
      />
    </div>
  );
}
