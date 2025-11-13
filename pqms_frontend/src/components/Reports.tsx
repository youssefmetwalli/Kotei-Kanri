import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function Reports() {
  const progressData = [
    { name: "第1週", 計画: 15, 実績: 12 },
    { name: "第2週", 計画: 30, 実績: 28 },
    { name: "第3週", 計画: 45, 実績: 48 },
    { name: "第4週", 計画: 60, 実績: 68 },
  ];

  const categoryData = [
    { name: "土木工事", value: 35 },
    { name: "構造工事", value: 25 },
    { name: "設備工事", value: 20 },
    { name: "仕上げ工事", value: 20 },
  ];

  const qualityData = [
    { name: "1月", 合格: 45, 不合格: 3 },
    { name: "2月", 合格: 52, 不合格: 4 },
    { name: "3月", 合格: 48, 不合格: 2 },
    { name: "4月", 合格: 58, 不合格: 5 },
    { name: "5月", 合格: 55, 不合格: 3 },
    { name: "6月", 合格: 62, 不合格: 2 },
  ];

  const statusData = [
    { name: "完了", value: 28, color: "#22c55e" },
    { name: "進行中", value: 12, color: "#f59e0b" },
    { name: "未着手", value: 8, color: "#6b7280" },
    { name: "遅延", value: 2, color: "#ef4444" },
  ];

  const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900">レポート・分析</h2>
        <p className="text-sm text-gray-500 mt-1">工程と品質の統計データ</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">全工程数</p>
            <p className="text-gray-900">50件</p>
            <p className="text-xs text-green-600 mt-1">完了率: 56%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">品質検査</p>
            <p className="text-gray-900">320件</p>
            <p className="text-xs text-green-600 mt-1">合格率: 94%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">平均進捗率</p>
            <p className="text-gray-900">68%</p>
            <p className="text-xs text-blue-600 mt-1">計画比: +8%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">遅延工程</p>
            <p className="text-gray-900">2件</p>
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
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="計画" stroke="#94a3b8" strokeWidth={2} />
                <Line type="monotone" dataKey="実績" stroke="#3b82f6" strokeWidth={2} />
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
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
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
                <YAxis />
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600">カテゴリ</th>
                  <th className="text-left py-3 px-4 text-gray-600">工程数</th>
                  <th className="text-left py-3 px-4 text-gray-600">完了</th>
                  <th className="text-left py-3 px-4 text-gray-600">進行中</th>
                  <th className="text-left py-3 px-4 text-gray-600">平均進捗率</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">土木工事</td>
                  <td className="py-3 px-4 text-gray-900">18</td>
                  <td className="py-3 px-4 text-green-600">15</td>
                  <td className="py-3 px-4 text-orange-600">3</td>
                  <td className="py-3 px-4 text-gray-900">85%</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">構造工事</td>
                  <td className="py-3 px-4 text-gray-900">12</td>
                  <td className="py-3 px-4 text-green-600">8</td>
                  <td className="py-3 px-4 text-orange-600">4</td>
                  <td className="py-3 px-4 text-gray-900">72%</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">設備工事</td>
                  <td className="py-3 px-4 text-gray-900">10</td>
                  <td className="py-3 px-4 text-green-600">3</td>
                  <td className="py-3 px-4 text-orange-600">7</td>
                  <td className="py-3 px-4 text-gray-900">58%</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">仕上げ工事</td>
                  <td className="py-3 px-4 text-gray-900">10</td>
                  <td className="py-3 px-4 text-green-600">2</td>
                  <td className="py-3 px-4 text-orange-600">8</td>
                  <td className="py-3 px-4 text-gray-900">42%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
