import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  FileText,
  Users,
  CheckSquare,
} from "lucide-react";
import { api } from "../lib/api";
import type {
  Execution,
  ProcessSheet,
  ExecutionItemResult,
} from "../types/backend";

type DashboardStats = {
  monthlyExecutionCount: number;
  passRate: number;
  alertProcessCount: number;
  alertItemCount: number;
  weeklyExecutionCounts: { label: string; count: number }[];
  qualityBreakdown: {
    pass: number;
    warn: number;
    fail: number;
  };
};

export function Dashboard() {
  const currentDate = new Date();
  const dateString = `${currentDate.getFullYear()}年${
    currentDate.getMonth() + 1
  }月${currentDate.getDate()}日(${
    ["日", "月", "火", "水", "木", "金", "土"][currentDate.getDay()]
  }) ${currentDate.getHours()}:${currentDate
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [execRes, procRes, itemRes] = await Promise.all([
          api.get("/executions/"),
          api.get("/process-sheets/"),
          api.get("/execution-item-results/"),
        ]);

        const executions: Execution[] =
          execRes.data.results ?? execRes.data ?? [];
        const processSheets: ProcessSheet[] =
          procRes.data.results ?? procRes.data ?? [];
        const itemResults: ExecutionItemResult[] =
          itemRes.data.results ?? itemRes.data ?? [];

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // 今月の検査実施数
        const monthlyExecutionCount = executions.filter((e) => {
          const dateStr = e.started_at ?? e.created_at;
          if (!dateStr) return false;
          const d = new Date(dateStr);
          return (
            d.getFullYear() === currentYear && d.getMonth() === currentMonth
          );
        }).length;

        // 合格率 & 品質内訳
        const executionsWithResult = executions.filter((e) => !!e.result);
        const passCount = executionsWithResult.filter(
          (e) => e.result === "pass"
        ).length;
        const warnCount = executionsWithResult.filter(
          (e) => e.result === "warn"
        ).length;
        const failCount = executionsWithResult.filter(
          (e) => e.result === "fail"
        ).length;
        const totalWithResult = executionsWithResult.length || 1;
        const passRate = (passCount / totalWithResult) * 100;

        // 要対応の工程 = 完了以外
        const alertProcessCount = processSheets.filter(
          (p) => p.status !== "done"
        ).length;

        // 要対応項目 = NG / SKIP
        const alertItemCount = itemResults.filter(
          (i) => i.status === "NG" || i.status === "SKIP"
        ).length;

        // 過去7週間の簡易週次カウント
        const weeklyExecutionCounts: { label: string; count: number }[] = [];
        for (let i = 6; i >= 0; i--) {
          const start = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          start.setDate(start.getDate() - i * 7);
          const end = new Date(start);
          end.setDate(end.getDate() + 7);

          const count = executions.filter((e) => {
            const dateStr = e.started_at ?? e.created_at;
            if (!dateStr) return false;
            const d = new Date(dateStr);
            return d >= start && d < end;
          }).length;

          const label = `${start.getMonth() + 1}/${start.getDate()}週`;
          weeklyExecutionCounts.push({ label, count });
        }

        setStats({
          monthlyExecutionCount,
          passRate,
          alertProcessCount,
          alertItemCount,
          weeklyExecutionCounts,
          qualityBreakdown: { pass: passCount, warn: warnCount, fail: failCount },
        });
      } catch (err) {
        console.error(err);
        setError("ダッシュボード情報の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ローディング表示
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">ダッシュボードを読み込み中...</p>
      </div>
    );
  }

  // エラー表示
  if (error || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <p className="text-red-600">{error ?? "データが取得できませんでした。"}</p>
          <Button onClick={() => window.location.reload()}>再読み込み</Button>
        </div>
      </div>
    );
  }

  const {
    monthlyExecutionCount,
    passRate,
    alertProcessCount,
    alertItemCount,
    weeklyExecutionCounts,
    qualityBreakdown,
  } = stats;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-gray-900">おはようございます、[ユーザー名]さん</h2>
            <p className="text-sm text-gray-500 mt-1">{dateString}</p>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Alert Banner */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-gray-900">
                  {alertProcessCount > 0
                    ? `【アラート】${alertProcessCount}件の工程で対応が必要です`
                    : "対応が必要な工程はありません"}
                </span>
              </div>
              <Button size="sm" variant="outline">
                詳細を見る
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-900 text-xl font-semibold">
                      {monthlyExecutionCount}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">今月の検査実施数</p>
                </div>
                <div className="bg-blue-50 p-2 rounded">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-900 text-xl font-semibold">
                      {passRate.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">合格率</p>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-900 text-xl font-semibold">
                      {alertProcessCount}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">要対応の工程</p>
                </div>
                <div className="bg-orange-50 p-2 rounded">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-900 text-xl font-semibold">
                      {alertItemCount}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">要対応項目 (NG/スキップ)</p>
                </div>
                <div className="bg-red-50 p-2 rounded">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions (UI only) */}
        <div>
          <h3 className="text-gray-900 mb-4">クイックアクション</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-6 flex-col gap-2">
              <Plus className="w-5 h-5" />
              <span className="text-sm">新規検査開始</span>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex-col gap-2">
              <CheckSquare className="w-5 h-5" />
              <span className="text-sm">チェックリスト作成</span>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex-col gap-2">
              <FileText className="w-5 h-5" />
              <span className="text-sm">レポート生成</span>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex-col gap-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">チーム管理</span>
            </Button>
          </div>
        </div>

        {/* Weekly Inspection Results */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>週次検査実績</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              過去7週間の検査実施数（簡易表示）
            </p>
            <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
              {weeklyExecutionCounts.map((w) => (
                <div
                  key={w.label}
                  className="flex flex-col items-center justify-end gap-1"
                >
                  <div className="h-24 w-full bg-gray-100 rounded flex items-end">
                    <div
                      className="w-full bg-blue-500 rounded-t"
                      style={{
                        height: `${Math.min(w.count * 10, 96)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{w.label}</span>
                  <span className="text-xs text-gray-700">{w.count}件</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quality Status */}
        <Card>
          <CardHeader>
            <CardTitle>品質状況</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                合格 {qualityBreakdown.pass}件 / 要注意 {qualityBreakdown.warn}件 / 不合格{" "}
                {qualityBreakdown.fail}件
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">合格</span>
                    <span className="text-gray-900">
                      {qualityBreakdown.pass}件
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">要注意</span>
                    <span className="text-gray-900">
                      {qualityBreakdown.warn}件
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">不合格</span>
                    <span className="text-gray-900">
                      {qualityBreakdown.fail}件
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
