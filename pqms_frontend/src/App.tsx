import { useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { MasterManagement } from "./components/MasterManagement";
import { ChecklistMaster } from "./components/ChecklistMaster";
import { ProcessManagement } from "./components/ProcessManagement";
import { QualityControl } from "./components/QualityControl";
import { TaskList } from "./components/TaskList";
import { Reports } from "./components/Reports";
import { SystemSettings } from "./components/SystemSettings";
import { ClipboardList, BarChart3, CheckSquare, ListTodo, Home, Settings, FolderKanban, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "./components/ui/button";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["master"]);

  const menuItems = [
    { id: "dashboard", label: "ダッシュボード", icon: Home },
    { 
      id: "master", 
      label: "マスタ管理", 
      icon: Settings,
      children: [
        { id: "master-checkitem", label: "チェック項目マスタ" },
        { id: "master-checklist", label: "作業チェックリスト" },
      ]
    },
    { id: "process", label: "工程管理", icon: FolderKanban },
    { id: "quality", label: "実行", icon: CheckSquare },
    { id: "reports", label: "分析・レポート", icon: BarChart3 },
    { id: "system", label: "システム", icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "master":
      case "master-checkitem":
        return <MasterManagement />;
      case "master-checklist":
        return <ChecklistMaster />;
      case "process":
        return <ProcessManagement />;
      case "quality":
        return <QualityControl />;
      case "reports":
        return <Reports />;
      case "system":
        return <SystemSettings />;
      default:
        return <Dashboard />;
    }
  };

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0 hidden lg:block">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <ClipboardList className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-white">工程・品質管理</h1>
            </div>
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <div key={item.id}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 ${
                    activeTab === item.id ? "bg-gray-800 text-white" : ""
                  }`}
                  onClick={() => {
                    if (item.children) {
                      toggleMenu(item.id);
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                  {item.children && (
                    expandedMenus.includes(item.id) ? (
                      <ChevronDown className="w-4 h-4 ml-auto" />
                    ) : (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )
                  )}
                </Button>
                {item.children && expandedMenus.includes(item.id) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Button
                        key={child.id}
                        variant="ghost"
                        className={`w-full justify-start text-sm text-gray-400 hover:text-white hover:bg-gray-800 ${
                          activeTab === child.id ? "bg-gray-800 text-white" : ""
                        }`}
                        onClick={() => setActiveTab(child.id)}
                      >
                        {child.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar Toggle - Simplified for this version */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50">
        <div className="flex gap-1 overflow-x-auto">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`flex-shrink-0 ${
                activeTab === item.id ? "bg-gray-100" : ""
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="w-4 h-4" />
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}