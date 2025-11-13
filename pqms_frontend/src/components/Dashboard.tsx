import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { AlertCircle, CheckCircle, Clock, TrendingUp, Plus, FileText, Users, CheckSquare } from "lucide-react";

export function Dashboard() {
  const currentDate = new Date();
  const dateString = `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月${currentDate.getDate()}日(${
    ["日", "月", "火", "水", "木", "金", "土"][currentDate.getDay()]
  }) ${currentDate.getHours()}:${currentDate.getMinutes().toString().padStart(2, '0')}`;

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
                <span className="text-sm text-gray-900">[アラート] 3件の工程で期限が迫っています</span>
              </div>
              <Button size="sm" variant="outline">
                [確認する]ボタン
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
                    <span className="text-gray-900">156</span>
                    <span className="text-sm text-green-600">(+17件)</span>
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
                    <span className="text-gray-900">94.8%</span>
                    <span className="text-sm text-green-600">(+3%)</span>
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
                    <span className="text-gray-900">15</span>
                    <span className="text-sm text-gray-600">(15%)</span>
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
                    <span className="text-gray-900">8</span>
                    <span className="text-sm text-gray-600">(12件)</span>
                  </div>
                  <p className="text-sm text-gray-600">要対応項目</p>
                </div>
                <div className="bg-red-50 p-2 rounded">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
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
              <div className="flex gap-2 text-sm text-gray-600">
                <button className="hover:text-gray-900">[週次]</button>
                <span>|</span>
                <button className="hover:text-gray-900">[月次]</button>
                <span>|</span>
                <button className="hover:text-gray-900">[年次]</button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">[棒グラフ: 過去7週間の検査数]</p>
            <div className="h-48 bg-gray-100 rounded flex items-center justify-center text-gray-500">
              グラフ表示エリア
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
              <p className="text-sm text-gray-600">[円グラフ: 合格148件(94.8%) / 要注意6件(3.8%) / 不合格2件(1.3%)]</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">合格</span>
                    <span className="text-gray-900">148件</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">94.8%</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">要注意</span>
                    <span className="text-gray-900">6件</span>
                  </div>
                  <p className="text-sm text-orange-600 mt-1">3.8%</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">不合格</span>
                    <span className="text-gray-900">2件</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">1.3%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}