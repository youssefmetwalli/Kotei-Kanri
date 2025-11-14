// src/components/Reports.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { api } from "../lib/api";
import type { Execution, ProcessSheet } from "../types/backend";


type ProgressPoint = { name: string; 計画: number; 実績: number };
type CategoryPoint = { name: string; value: number };
type QualityPoint = { name: string; 合格: number; 不合格: number };
type StatusPoint = { name: string; value: number; color: string };
type CategoryRow = {
  name: string;
  total: number;
  done: number;
  inProgress: number;
  averageProgress: number;
};

type SummaryStats = {
  totalProcesses: number;
  completionRate: number;
  totalInspections: number;
  passRate: number;
  averageProgress: number;
  delayedProcesses: number;
};

const STATUS_COLORS: StatusPoint[] = [
  { name: "完了", value: 0, color: "#22c55e" },
  { name: "進行中", value: 0, color: "#f59e0b" },
  { name: "未着手", value: 0, color: "#6b7280" },
  { name: "遅延", value: 0, color: "#ef4444" },
];

const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];

export function Reports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [progressData, setProgressData] = useState<ProgressPoint[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryPoint[]>([]);
  const [qualityData, setQualityData] = useState<QualityPoint[]>([]);
  const [statusData, setStatusData] = useState<StatusPoint[]>(STATUS_COLORS);
  const [categoryRows, setCategoryRows] = useState<CategoryRow[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [procRes, execRes] = await Promise.all([
          api.get("/process-sheets/"),
          api.get("/executions/"),
        ]);

        const processSheets: ProcessSheet[] =
          procRes.data.results ?? procRes.data ?? [];
        const executions: Execution[] =
          execRes.data.results ?? execRes.data ?? [];

        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        // ---------- Summary ----------
        const totalProcesses = processSheets.length;
        const doneCount = processSheets.filter(
          (p) => p.status === "done"
        ).length;
        const completionRate =
          totalProcesses > 0 ? (doneCount / totalProcesses) * 100 : 0;

        const totalInspections = executions.length;
        const execWithResult = executions.filter((e) => !!e.result);
        const passCount = execWithResult.filter(
          (e) => e.result === "pass"
        ).length;
        const failCount = execWithResult.filter(
          (e) => e.result === "fail"
        ).length;
        const passRate =
          execWithResult.length > 0
            ? (passCount / execWithResult.length) * 100
            : 0;

        // we use completionRate as a simple average progress estimate
        const averageProgress = completionRate;

        // delayed = not done & planned_end < today
        const delayedProcesses = processSheets.filter((p) => {
          if (p.status === "done" || !p.planned_end) return false;
          const end = new Date(p.planned_end);
          return end < today;
        }).length;

        setSummary({
          totalProcesses,
          completionRate,
          totalInspections,
          passRate,
          averageProgress,
          delayedProcesses,
        });

        // ---------- Progress (last 4 weeks) ----------
        const weeks: { label: string; start: Date; end: Date }[] = [];
        for (let i = 3; i >= 0; i--) {
          const start = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          start.setDate(start.getDate() - i * 7);
          const end = new Date(start);
          end.setDate(end.getDate() + 7);
          const label = `第${4 - i}週`;
          weeks.push({ label, start, end });
        }

        const progressPoints: ProgressPoint[] = weeks.map((w) => {
          const planned = processSheets.filter((p) => {
            if (!p.planned_start) return false;
            const d = new Date(p.planned_start);
            return d >= w.start && d < w.end;
          }).length;

          const actual = processSheets.filter((p) => {
            if (p.status !== "done") return false;
            const d = new Date(p.updated_at);
            return d >= w.start && d < w.end;
          }).length;

          return { name: w.label, 計画: planned, 実績: actual };
        });

        setProgressData(progressPoints);

        // ---------- Category distribution & table ----------
        const categoryMap: Record<
          string,
          { total: number; done: number; inProgress: number }
        > = {};

        processSheets.forEach((p) => {
          const catName = p.checklist?.category?.name ?? "未分類";

          if (!categoryMap[catName]) {
            categoryMap[catName] = { total: 0, done: 0, inProgress: 0 };
          }
          categoryMap[catName].total += 1;
          if (p.status === "done") {
            categoryMap[catName].done += 1;
          } else if (p.status === "preparing" || p.status === "running") {
            categoryMap[catName].inProgress += 1;
          }
        });

        const catData: CategoryPoint[] = [];
        const catRows: CategoryRow[] = [];

        Object.entries(categoryMap).forEach(
          ([name, { total, done, inProgress }]) => {
            catData.push({ name, value: total });
            const avgProgress = total > 0 ? (done / total) * 100 : 0;
            catRows.push({
              name,
              total,
              done,
              inProgress,
              averageProgress: avgProgress,
            });
          }
        );

        setCategoryData(catData);
        setCategoryRows(catRows);

        // ---------- Quality trend (last 6 months) ----------
        const months: { label: string; year: number; month: number }[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          months.push({
            label: `${d.getMonth() + 1}月`,
            year: d.getFullYear(),
            month: d.getMonth(),
          });
        }

        const qualityPoints: QualityPoint[] = months.map((m) => {
          let pass = 0;
          let fail = 0;
          executions.forEach((e) => {
            const dateStr = e.finished_at ?? e.created_at;
            if (!dateStr) return;
            const d = new Date(dateStr);
            if (d.getFullYear() === m.year && d.getMonth() === m.month) {
              if (e.result === "pass") pass += 1;
              if (e.result === "fail") fail += 1;
            }
          });
          return { name: m.label, 合格: pass, 不合格: fail };
        });

        setQualityData(qualityPoints);

        // ---------- Status distribution ----------
        const completed = doneCount;
        const inProgress = processSheets.filter(
          (p) => p.status === "preparing" || p.status === "running"
        ).length;
        const notStarted = processSheets.filter(
          (p) => p.status === "planning"
        ).length;

        setStatusData([
          { name: "完了", value: completed, color: "#22c55e" },
          { name: "進行中", value: inProgress, color: "#f59e0b" },
          { name: "未着手", value: notStarted, color: "#6b7280" },
          { name: "遅延", value: delayedProcesses, color: "#ef4444" },
        ]);
      } catch (err) {
        console.error(err);
        setError("レポートデータの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-500">レポートを読み込み中...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-3">
        <p className="text-sm text-red-600">
          {error ?? "レポートデータが取得できませんでした。"}
        </p>
        <button
          className="px-4 py-2 rounded bg-slate-900 text-white text-sm"
          onClick={() => window.location.reload()}
        >
          再読み込み
        </button>
      </div>
    );
  }

  const {
    totalProcesses,
    completionRate,
    totalInspections,
    passRate,
    averageProgress,
    delayedProcesses,
  } = summary;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900">レポート・分析</h2>
        <p className="text-sm text-gray-500 mt-1">
          工程と品質の統計データ（バックエンド連携）
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">全工程数</p>
            <p className="text-gray-900">{totalProcesses}件</p>
            <p className="text-xs text-green-600 mt-1">
              完了率: {completionRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">品質検査</p>
            <p className="text-gray-900">{totalInspections}件</p>
            <p className="text-xs text-green-600 mt-1">
              合格率: {passRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">平均進捗率</p>
            <p className="text-gray-900">{averageProgress.toFixed(1)}%</p>
            <p className="text-xs text-blue-600 mt-1">
              （完了工程数 / 全工程数）
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">遅延工程</p>
            <p className="text-gray-900">{delayedProcesses}件</p>
            <p className="text-xs text-red-600 mt-1">要注意</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle>進捗状況推移（計画 vs 実績）</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="計画"
                  stroke="#94a3b8"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="実績"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>工程カテゴリ別分布</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <p className="text-sm text-gray-500">
                カテゴリ情報がまだありません。
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Quality Trend */}
        <Card>
          <CardHeader>
            <CardTitle>品質検査結果推移</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={qualityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="合格" fill="#22c55e" />
                <Bar dataKey="不合格" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>工程ステータス別分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}件`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>工程別詳細統計</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryRows.length === 0 ? (
            <p className="text-sm text-gray-500">
              工程データがまだ登録されていません。
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-600">
                      カテゴリ
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600">
                      工程数
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600">完了</th>
                    <th className="text-left py-3 px-4 text-gray-600">
                      進行中
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600">
                      平均進捗率
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categoryRows.map((row) => (
                    <tr key={row.name} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-900">{row.name}</td>
                      <td className="py-3 px-4 text-gray-900">{row.total}</td>
                      <td className="py-3 px-4 text-green-600">{row.done}</td>
                      <td className="py-3 px-4 text-orange-600">
                        {row.inProgress}
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {row.averageProgress.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
