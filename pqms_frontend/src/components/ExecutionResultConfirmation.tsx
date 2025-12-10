import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowLeft, ChevronDown, Check, X } from "lucide-react";
import { api } from "../lib/api";
import type {
  Execution,
  ExecutionItemResult,
  ExecutionResultCode,
} from "../types/backend";

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

interface ExecutionResultConfirmationProps {
  sheet: {
    id: number;
    productName: string;
    lotNumber: string;
    assignee: string;
  };
  /** The execution to display results for */
  executionId: number;
  onBack: () => void;
  onConfirm: () => void;
  /** Called when a row is clicked (index in the current list) */
  onEditItem?: (itemIndex: number) => void;
}

type OverallResultLabel = "合格" | "不合格" | "要注意";

const mapExecutionResultToLabel = (
  result: Execution["result"],
  hasNg: boolean
): OverallResultLabel => {
  if (result === "pass") return "合格";
  if (result === "fail") return "不合格";
  if (result === "warn") return "要注意";
  // Fallback: infer from NG count
  if (hasNg) return "不合格";
  return "合格";
};

const formatDateTime = (iso: string | null | undefined) => {
  if (!iso) return "-";
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
};

const formatTime = (iso: string | null | undefined) => {
  if (!iso) return "-";
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${min}`;
};

/** minutes, rounded, or null */
const calcDurationMinutes = (
  start: string | null | undefined,
  end: string | null | undefined
): number | null => {
  if (!start || !end) return null;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) return null;
  return Math.round((e - s) / 1000 / 60);
};

export function ExecutionResultConfirmation({
  sheet,
  executionId,
  onBack,
  onConfirm,
  onEditItem,
}: ExecutionResultConfirmationProps) {
  const [execution, setExecution] = useState<Execution | null>(null);
  const [itemResults, setItemResults] = useState<ExecutionItemResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingResult, setSavingResult] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1) Fetch execution
        const execRes = await api.get<Execution>(`/executions/${executionId}/`);
        setExecution(execRes.data);

        // 2) Fetch results for this execution
        const itemRes = await api.get<MaybePaginated<ExecutionItemResult>>(
          "/execution-item-results/",
          {
            params: { execution: executionId },
          }
        );
        const items = normalizeListResponse(itemRes.data);
        setItemResults(items);
      } catch (err) {
        console.error(err);
        setError("実行結果の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [executionId]);

  // Aggregate stats + decide final result code
  const {
    okCount,
    ngCount,
    skipCount,
    overallResultLabel,
    finalResultCode,
  } = useMemo(() => {
    let ok = 0;
    let ng = 0;
    let skip = 0;

    itemResults.forEach((r) => {
      if (r.status === "OK") ok += 1;
      else if (r.status === "NG") ng += 1;
      else if (r.status === "SKIP") skip += 1;
    });

    const label = mapExecutionResultToLabel(execution?.result ?? null, ng > 0);

    // Decide what to write to Execution.result
    const code: ExecutionResultCode =
      ng > 0 ? "fail" : skip > 0 ? "warn" : "pass";

    return {
      okCount: ok,
      ngCount: ng,
      skipCount: skip,
      overallResultLabel: label,
      finalResultCode: code,
    };
  }, [itemResults, execution]);

  const startLabel = formatDateTime(
    execution?.started_at || execution?.created_at
  );
  const endLabel = formatTime(execution?.finished_at || null);
  const durationMinutes = calcDurationMinutes(
    execution?.started_at || execution?.created_at,
    execution?.finished_at || null
  );

  const executionTimeLabel =
    durationMinutes != null ? `${durationMinutes}分` : "-";

  const getRowTitle = (result: ExecutionItemResult, index: number) => {
    // Try to pick a human-friendly label from nested objects if present
    const anyResult = result as any;
    return (
      anyResult.check_item?.name ||
      anyResult.checklist_item?.name ||
      anyResult.check_item_name ||
      `項目${index + 1}`
    );
  };

  const renderStatusCell = (status: ExecutionItemResult["status"]) => {
    if (status === "OK") {
      return (
        <>
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-600">OK</span>
        </>
      );
    }
    if (status === "NG") {
      return (
        <>
          <X className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-600">NG</span>
        </>
      );
    }
    // SKIP
    return <span className="text-sm text-gray-600">スキップ</span>;
  };

  const handleConfirm = async () => {
    if (!execution) {
      onConfirm();
      return;
    }

    try {
      setSavingResult(true);
      setError(null);

      // Write final verdict back to backend so Dashboard can see it
      await api.patch<Execution>(`/executions/${execution.id}/`, {
        result: finalResultCode,
        // Optionally also ensure status is completed/approved:
        // status: execution.status === "completed" ? "completed" : "approved",
      });

      onConfirm();
    } catch (err) {
      console.error(err);
      setError("実行結果の確定に失敗しました。");
    } finally {
      setSavingResult(false);
    }
  };

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
            <h2 className="text-gray-900">実行結果確認</h2>
          </div>
          <Button variant="outline" size="sm">
            {sheet.assignee}
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-gray-900">
              {sheet.productName} 初期ロット検査
            </h1>
          </div>

          {loading && (
            <p className="text-sm text-gray-500">実行結果を読み込み中です...</p>
          )}
          {error && (
            <p className="text-sm text-red-600">
              {error ?? "実行結果を表示できませんでした。"}
            </p>
          )}

          {/* Summary */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-gray-900">サマリー</h3>
              <div className="space-y-2 text-sm">
                <div className="flex">
                  <span className="text-gray-600 w-32">実行者:</span>
                  <span className="text-gray-900">
                    {(() => {
                      if (typeof execution?.executor === "string") {
                        return execution.executor;
                      }
                      if (
                        execution?.executor &&
                        typeof execution.executor === "object" &&
                        "username" in execution.executor
                      ) {
                        return (execution.executor as any).username;
                      }
                      return sheet.assignee;
                    })()}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-32">実行日時:</span>
                  <span className="text-gray-900">
                    {startLabel} {execution?.finished_at ? `- ${endLabel}` : ""}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-32">実行時間:</span>
                  <span className="text-gray-900">{executionTimeLabel}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 w-32">総合判定:</span>
                  <Badge
                    variant={
                      overallResultLabel === "合格"
                        ? "default"
                        : overallResultLabel === "要注意"
                        ? "outline"
                        : "destructive"
                    }
                    className="flex items-center gap-1"
                  >
                    {overallResultLabel === "合格" ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <X className="w-3 h-3" />
                    )}
                    {overallResultLabel}
                  </Badge>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-32">OK項目:</span>
                  <span className="text-gray-900">
                    {okCount}件 / NG項目: {ngCount}件 / スキップ: {skipCount}件
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Check Results */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-gray-900 mb-4">チェック項目別結果</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm text-gray-600 w-16">
                        #
                      </th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">
                        項目名
                      </th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600 w-24">
                        判定
                      </th>
                      <th className="text-left px-4 py-3 text-sm text-gray-600">
                        結果
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemResults.length === 0 && !loading ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-6 text-sm text-gray-500 text-center"
                        >
                          実行結果がありません。
                        </td>
                      </tr>
                    ) : (
                      itemResults.map((result, index) => (
                        <tr
                          key={result.id}
                          className="border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => onEditItem?.(index)}
                        >
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {index + 1}.
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {getRowTitle(result, index)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {renderStatusCell(result.status)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {result.value}
                            {result.note && (
                              <span className="text-red-600 ml-2">
                                ({result.note})
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-end">
            <Button variant="outline" size="lg">
              下書き保存
            </Button>
            <Button
              size="lg"
              onClick={handleConfirm}
              disabled={savingResult}
            >
              {savingResult ? "確定中..." : "確定"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
