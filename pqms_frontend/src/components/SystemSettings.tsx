import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { 
  User, 
  Bell, 
  Globe, 
  Shield, 
  Database, 
  Info,
  Download,
  Upload,
  Save
} from "lucide-react";

export function SystemSettings() {
  // 一般設定
  const [systemName, setSystemName] = useState("工程・品質管理システム");
  const [language, setLanguage] = useState("ja");
  const [timezone, setTimezone] = useState("Asia/Tokyo");
  const [dateFormat, setDateFormat] = useState("YYYY/MM/DD");

  // アカウント設定
  const [userName, setUserName] = useState("山田太郎");
  const [email, setEmail] = useState("yamada@example.com");
  const [role, setRole] = useState("admin");

  // 通知設定
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [taskNotifications, setTaskNotifications] = useState(true);
  const [reportNotifications, setReportNotifications] = useState(false);
  const [systemAlerts, setSystemAlerts] = useState(true);

  // セキュリティ設定
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [passwordExpiry, setPasswordExpiry] = useState("90");

  // データ管理設定
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState("daily");

  const handleSave = () => {
    console.log("Settings saved");
    // TODO: 実際の保存処理
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-gray-900">システム設定</h2>
            <p className="text-sm text-gray-500 mt-1">システムの各種設定を管理</p>
          </div>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            保存
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 一般設定 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-gray-600" />
                <CardTitle>一般設定</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="system-name">システム名</Label>
                <Input
                  id="system-name"
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">言語</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">タイムゾーン</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Tokyo">アジア/東京 (JST)</SelectItem>
                      <SelectItem value="America/New_York">アメリカ/ニューヨーク (EST)</SelectItem>
                      <SelectItem value="Europe/London">ヨーロッパ/ロンドン (GMT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-format">日付フォーマット</Label>
                <Select value={dateFormat} onValueChange={setDateFormat}>
                  <SelectTrigger id="date-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YYYY/MM/DD">YYYY/MM/DD</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* アカウント設定 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" />
                <CardTitle>アカウント設定</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-name">ユーザー名</Label>
                <Input
                  id="user-name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">権限</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">管理者</SelectItem>
                    <SelectItem value="manager">マネージャー</SelectItem>
                    <SelectItem value="operator">作業者</SelectItem>
                    <SelectItem value="viewer">閲覧者</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="current-password">現在のパスワード</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="現在のパスワードを入力"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">新しいパスワード</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="新しいパスワードを入力"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">パスワード確認</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="もう一度入力"
                  />
                </div>
              </div>

              <Button variant="outline" size="sm">
                パスワードを変更
              </Button>
            </CardContent>
          </Card>

          {/* 通知設定 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-gray-600" />
                <CardTitle>通知設定</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>メール通知</Label>
                  <p className="text-sm text-gray-500">重要な更新をメールで受け取る</p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>タスク通知</Label>
                  <p className="text-sm text-gray-500">タスクの割り当てや期限の通知</p>
                </div>
                <Switch
                  checked={taskNotifications}
                  onCheckedChange={setTaskNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>レポート通知</Label>
                  <p className="text-sm text-gray-500">日次・週次レポートの通知</p>
                </div>
                <Switch
                  checked={reportNotifications}
                  onCheckedChange={setReportNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>システムアラート</Label>
                  <p className="text-sm text-gray-500">システムの重要な通知</p>
                </div>
                <Switch
                  checked={systemAlerts}
                  onCheckedChange={setSystemAlerts}
                />
              </div>
            </CardContent>
          </Card>

          {/* セキュリティ設定 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-600" />
                <CardTitle>セキュリティ設定</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>二段階認証</Label>
                  <p className="text-sm text-gray-500">ログイン時に追加の認証を要求</p>
                </div>
                <Switch
                  checked={twoFactorAuth}
                  onCheckedChange={setTwoFactorAuth}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">セッションタイムアウト（分）</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password-expiry">パスワード有効期限（日）</Label>
                  <Input
                    id="password-expiry"
                    type="number"
                    value={passwordExpiry}
                    onChange={(e) => setPasswordExpiry(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* データ管理 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-gray-600" />
                <CardTitle>データ管理</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>自動バックアップ</Label>
                  <p className="text-sm text-gray-500">定期的にデータをバックアップ</p>
                </div>
                <Switch
                  checked={autoBackup}
                  onCheckedChange={setAutoBackup}
                />
              </div>

              {autoBackup && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="backup-frequency">バックアップ頻度</Label>
                    <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                      <SelectTrigger id="backup-frequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">1時間ごと</SelectItem>
                        <SelectItem value="daily">毎日</SelectItem>
                        <SelectItem value="weekly">毎週</SelectItem>
                        <SelectItem value="monthly">毎月</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  データをエクスポート
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  データをインポート
                </Button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  最終バックアップ: 2024/11/08 03:00 JST
                </p>
              </div>
            </CardContent>
          </Card>

          {/* システム情報 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-gray-600" />
                <CardTitle>システム情報</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">バージョン</p>
                  <p className="text-gray-900">v2.5.3</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ビルド番号</p>
                  <p className="text-gray-900">20241108</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ライセンス</p>
                  <p className="text-gray-900">Enterprise</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">有効期限</p>
                  <p className="text-gray-900">2025/12/31</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">データベース</p>
                  <p className="text-gray-900">PostgreSQL 14.5</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ストレージ使用量</p>
                  <p className="text-gray-900">12.4 GB / 100 GB</p>
                </div>
              </div>

              <Separator />

              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  アップデートを確認
                </Button>
                <Button variant="outline" size="sm">
                  ライセンス情報
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
