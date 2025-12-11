// src/components/ProcessTracking.tsx
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "./ui/card";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  PlayCircle, 
  XCircle,
  TrendingUp,
  Calendar,
  ListChecks
} from "lucide-react";

interface ProcessTrackingProps {
  processSheetId: number;
  onBack?: () => void;
  onSelectExecution?: (executionId: number) => void;
}

interface ExecutionProgressRow {
  execution_id: number;
  status: string;
  completed: number;
  total_items: number;
  progress: number;
}

interface ProcessTrackingResponse {
  project_progress: number;
  total_items: number;
  executions: ExecutionProgressRow[];
}

const getStatusConfig = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return {
        label: "完了",
        color: "bg-green-100 text-green-700 border-green-200",
        icon: CheckCircle2,
        iconColor: "text-green-600"
      };
    case "running":
      return {
        label: "実行中",
        color: "bg-blue-100 text-blue-700 border-blue-200",
        icon: PlayCircle,
        iconColor: "text-blue-600"
      };
    case "draft":
      return {
        label: "下書き",
        color: "bg-gray-100 text-gray-700 border-gray-200",
        icon: Clock,
        iconColor: "text-gray-600"
      };
    case "rejected":
      return {
        label: "差戻し",
        color: "bg-red-100 text-red-700 border-red-200",
        icon: XCircle,
        iconColor: "text-red-600"
      };
    default:
      return {
        label: status,
        color: "bg-gray-100 text-gray-700 border-gray-200",
        icon: Clock,
        iconColor: "text-gray-600"
      };
  }
};

const getProgressColor = (progress: number) => {
  if (progress === 100) return "bg-green-500";
  if (progress >= 70) return "bg-blue-500";
  if (progress >= 40) return "bg-yellow-500";
  return "bg-orange-500";
};

export function ProcessTracking({
  processSheetId,
  onBack,
  onSelectExecution,
}: ProcessTrackingProps) {
  const [data, setData] = useState<ProcessTrackingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<ProcessTrackingResponse>(
          `/process-sheets/${processSheetId}/progress/`
        );
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError("進捗情報の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    if (processSheetId) {
      fetchProgress();
    }
  }, [processSheetId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">進捗情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-2xl mx-auto">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Button>
          )}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-600">
                <XCircle className="w-6 h-6" />
                <p className="font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <p className="text-gray-500">進捗情報が取得できませんでした。</p>
      </div>
    );
  }

  const completedExecutions = data.executions.filter(e => e.status.toLowerCase() === "completed").length;
  const runningExecutions = data.executions.filter(e => e.status.toLowerCase() === "running").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  戻る
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  進捗トラッキング
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  工程シート ID: {processSheetId}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {completedExecutions} 完了
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <PlayCircle className="w-3 h-3 mr-1" />
                {runningExecutions} 実行中
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Project-level progress - Hero Section */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <ListChecks className="w-7 h-7" />
                  プロジェクト全体の進捗
                </h2>
                <p className="text-blue-100">
                  合計 {data.total_items} 項目のチェック項目
                </p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold mb-1">
                  {data.project_progress}%
                </div>
                <div className="text-blue-100 text-sm">完了率</div>
              </div>
            </div>
            
            <div className="relative">
              <div className="h-4 bg-blue-800/50 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full transition-all duration-1000 ease-out shadow-lg"
                  style={{ width: `${data.project_progress}%` }}
                />
              </div>
              <div className="mt-3 flex justify-between text-sm text-blue-100">
                <span>開始</span>
                <span className="font-medium text-white">
                  {Math.round((data.project_progress / 100) * data.total_items)} / {data.total_items} 項目完了
                </span>
                <span>完了</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Execution List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              実行進捗一覧
              <Badge variant="secondary">{data.executions.length} 件</Badge>
            </h2>
          </div>

          {data.executions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">実行履歴がありません</p>
                <p className="text-sm text-gray-400 mt-1">
                  チェックリストを実行すると、ここに表示されます
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {data.executions.map((exe, index) => {
                const statusConfig = getStatusConfig(exe.status);
                const StatusIcon = statusConfig.icon;
                const progressColor = getProgressColor(exe.progress);

                return (
                  <Card
                    key={exe.execution_id}
                    className="hover:shadow-lg transition-all duration-200 border-l-4 hover:scale-[1.01] cursor-pointer"
                    style={{
                      borderLeftColor: exe.progress === 100 ? "#10b981" : exe.progress >= 50 ? "#3b82f6" : "#f59e0b",
                      animationDelay: `${index * 50}ms`
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between gap-6">
                        {/* Left: Execution Info */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={`p-3 rounded-xl ${statusConfig.color} border`}>
                            <StatusIcon className={`w-6 h-6 ${statusConfig.iconColor}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-gray-900">
                                実行 #{exe.execution_id}
                              </h3>
                              <Badge className={statusConfig.color} variant="outline">
                                {statusConfig.label}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                {exe.completed} / {exe.total_items} 完了
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Middle: Progress */}
                        <div className="w-1/3 min-w-[200px]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-500">進捗</span>
                            <span className="text-sm font-bold text-gray-900">
                              {exe.progress}%
                            </span>
                          </div>
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${progressColor} transition-all duration-500 rounded-full`}
                              style={{ width: `${exe.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Right: Action */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            onSelectExecution && onSelectExecution(exe.execution_id)
                          }
                          className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
                        >
                          詳細を見る
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">総実行数</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {data.executions.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <ListChecks className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">完了済み</p>
                  <p className="text-3xl font-bold text-green-600">
                    {completedExecutions}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">実行中</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {runningExecutions}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <PlayCircle className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}