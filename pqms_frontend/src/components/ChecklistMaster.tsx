import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, Filter, Plus, Edit, Trash2, FileText } from "lucide-react";
import { ChecklistDetail } from "./ChecklistDetail";

interface Checklist {
  id: string;
  name: string;
  itemCount: number;
  usageCount: number;
  createdDate: string;
}

export function ChecklistMaster() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const itemsPerPage = 10;

  const [checklists] = useState<Checklist[]>([
    { id: "CL001", name: "塗装前チェック", itemCount: 12, usageCount: 45, createdDate: "2024/03/15" },
    { id: "CL002", name: "溶接検査", itemCount: 24, usageCount: 38, createdDate: "2024/02/20" },
    { id: "CL003", name: "サンプル検査", itemCount: 8, usageCount: 12, createdDate: "2024/03/10" },
    { id: "CL004", name: "最終品質チェック", itemCount: 16, usageCount: 52, createdDate: "2024/01/25" },
    { id: "CL005", name: "材料受入検査", itemCount: 10, usageCount: 28, createdDate: "2024/03/05" },
    { id: "CL006", name: "寸法測定", itemCount: 15, usageCount: 41, createdDate: "2024/02/18" },
    { id: "CL007", name: "外観検査", itemCount: 9, usageCount: 35, createdDate: "2024/03/12" },
    { id: "CL008", name: "耐圧試験", itemCount: 6, usageCount: 19, createdDate: "2024/02/28" },
    { id: "CL009", name: "梱包前チェック", itemCount: 11, usageCount: 30, createdDate: "2024/03/08" },
    { id: "CL010", name: "出荷前確認", itemCount: 13, usageCount: 47, createdDate: "2024/01/30" },
  ]);

  const filteredChecklists = checklists.filter(checklist =>
    checklist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checklist.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredChecklists.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentChecklists = filteredChecklists.slice(startIndex, endIndex);

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    return pages;
  };

  const handleSaveChecklist = (data: any) => {
    console.log("Saved checklist:", data);
    setSelectedChecklist(null);
    // TODO: 実際のデータ保存処理
  };

  if (selectedChecklist) {
    return (
      <ChecklistDetail
        checklist={selectedChecklist}
        onBack={() => setSelectedChecklist(null)}
        onSave={handleSaveChecklist}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-gray-900">作業チェックリスト一覧</h2>
            <p className="text-sm text-gray-500 mt-1">作業チェックリストの管理</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <Card>
          <CardHeader className="border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                  <Filter className="w-4 h-4 mr-2" />
                  フィルタ
                </Button>
                <Button size="sm" className="flex-1 md:flex-none">
                  <Plus className="w-4 h-4 mr-2" />
                  新規作成
                </Button>
                <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                  <FileText className="w-4 h-4 mr-2" />
                  テンプレートから
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      リスト名
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      項目数
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      使用回数
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      作成日
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentChecklists.map((checklist) => (
                    <tr key={checklist.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{checklist.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{checklist.itemCount}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{checklist.usageCount}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{checklist.createdDate}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedChecklist(checklist)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y">
              {currentChecklists.map((checklist) => (
                <div key={checklist.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-gray-900">{checklist.name}</h3>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedChecklist(checklist)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">項目数:</span>
                      <span className="ml-1 text-gray-900">{checklist.itemCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">使用回数:</span>
                      <span className="ml-1 text-gray-900">{checklist.usageCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">作成日:</span>
                      <span className="ml-1 text-gray-900">{checklist.createdDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  前へ
                </Button>
                {renderPagination().map((page, index) => (
                  typeof page === "number" ? (
                    <Button
                      key={index}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ) : (
                    <span key={index} className="px-2 text-gray-500">
                      {page}
                    </span>
                  )
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  次へ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}