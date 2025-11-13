import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Plus, Calendar, User } from "lucide-react";

interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignedTo: string;
  dueDate: string;
  category: string;
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "溶接部の再検査手配",
      description: "B棟2Fの溶接部について非破壊検査業者への再検査手配",
      priority: "高",
      status: "未着手",
      assignedTo: "山本太郎",
      dueDate: "2025-11-09",
      category: "品質管理",
    },
    {
      id: 2,
      title: "配管材料の追加発注",
      description: "C棟の配管工事に必要な材料の追加発注処理",
      priority: "中",
      status: "進行中",
      assignedTo: "鈴木一郎",
      dueDate: "2025-11-10",
      category: "資材管理",
    },
    {
      id: 3,
      title: "安全講習の実施",
      description: "新規作業員向けの安全衛生講習の開催",
      priority: "高",
      status: "未着手",
      assignedTo: "佐藤次郎",
      dueDate: "2025-11-11",
      category: "安全管理",
    },
    {
      id: 4,
      title: "進捗報告書の作成",
      description: "週次進捗報告書の作成と提出",
      priority: "中",
      status: "完了",
      assignedTo: "田中三郎",
      dueDate: "2025-11-08",
      category: "事務作業",
    },
    {
      id: 5,
      title: "電気配線図の確認",
      description: "A棟の電気配線図について設計部門との確認会議",
      priority: "低",
      status: "進行中",
      assignedTo: "山田花子",
      dueDate: "2025-11-12",
      category: "設計確認",
    },
  ]);

  const [filter, setFilter] = useState("全て");

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "高":
        return "destructive";
      case "中":
        return "default";
      default:
        return "secondary";
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "完了":
        return "default";
      case "進行中":
        return "secondary";
      default:
        return "outline";
    }
  };

  const filteredTasks = filter === "全て" 
    ? tasks 
    : tasks.filter((task) => task.status === filter);

  const toggleTaskStatus = (taskId: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? { ...task, status: task.status === "完了" ? "未着手" : "完了" }
          : task
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-gray-900">タスク管理</h2>
          <p className="text-sm text-gray-500 mt-1">日常業務とタスクの管理</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              新規タスク追加
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>新規タスクの追加</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="task-title">タスク名</Label>
                <Input id="task-title" placeholder="例: 材料の発注処理" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-description">詳細</Label>
                <Textarea id="task-description" placeholder="タスクの詳細説明" rows={3} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-priority">優先度</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="高">高</SelectItem>
                      <SelectItem value="中">中</SelectItem>
                      <SelectItem value="低">低</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-category">カテゴリ</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="品質管理">品質管理</SelectItem>
                      <SelectItem value="資材管理">資材管理</SelectItem>
                      <SelectItem value="安全管理">安全管理</SelectItem>
                      <SelectItem value="事務作業">事務作業</SelectItem>
                      <SelectItem value="設計確認">設計確認</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-assigned">担当者</Label>
                  <Input id="task-assigned" placeholder="例: 山本太郎" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-due">期限</Label>
                  <Input id="task-due" type="date" />
                </div>
              </div>
              <Button className="w-full">追加</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {["全て", "未着手", "進行中", "完了"].map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-1">未着手</p>
            <p className="text-gray-900">{tasks.filter((t) => t.status === "未着手").length}件</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-1">進行中</p>
            <p className="text-gray-900">{tasks.filter((t) => t.status === "進行中").length}件</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-1">完了</p>
            <p className="text-gray-900">{tasks.filter((t) => t.status === "完了").length}件</p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={task.status === "完了"}
                  onCheckedChange={() => toggleTaskStatus(task.id)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <h3 className={`text-gray-900 ${task.status === "完了" ? "line-through text-gray-500" : ""}`}>
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={getPriorityVariant(task.priority)}>
                        優先度: {task.priority}
                      </Badge>
                      <Badge variant={getStatusVariant(task.status)}>{task.status}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded">
                      {task.category}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {task.assignedTo}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {task.dueDate}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
