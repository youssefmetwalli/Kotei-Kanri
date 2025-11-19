// src/components/ChecklistDetail.tsx
import { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ArrowLeft, Plus, Eye } from "lucide-react";
import { api } from "../lib/api";
import type {
  Checklist as BackendChecklist,
  ChecklistItem as BackendChecklistItem,
  Category,
  CheckItem,
} from "../types/backend";

interface CheckItemRow {
  id: number;
  name: string;
  typeLabel: string;
  required: boolean;
}

interface ChecklistDetailProps {
  checklist: {
    id: string | number;
    name: string;
  };
  onBack: () => void;
  // will receive the updated checklist from backend
  onSave: (data: BackendChecklist) => void;
}

const mapCheckItemTypeToLabel = (t: string | undefined): string => {
  switch (t) {
    case "number":
      return "数値";
    case "text":
      return "テキスト";
    case "select":
      return "選択肢";
    case "boolean":
      return "真偽";
    case "photo":
      return "写真";
    default:
      return "テキスト";
  }
};

export function ChecklistDetail({ checklist, onBack, onSave }: ChecklistDetailProps) {
  const [listName, setListName] = useState(checklist.name);
  const [description, setDescription] = useState<string>("");
  // store category as string id or null
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<string>(""); // frontend-only for now

  const [checkItems, setCheckItems] = useState<CheckItemRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [backendChecklist, setBackendChecklist] = useState<BackendChecklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // ---- Load checklist detail + categories from backend ----
  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const [checklistRes, categoriesRes] = await Promise.all([
          api.get<BackendChecklist>(`/checklists/${checklist.id}/`),
          api.get<{ count?: number; results?: Category[] }>("/categories/"),
        ]);

        const bc = checklistRes.data;
        setBackendChecklist(bc);

        setListName(bc.name);
        setDescription(bc.description ?? "");

        // category (Category object or id or null)
        if (bc.category) {
          if (typeof bc.category === "number") {
            setCategoryId(String(bc.category));
          } else if (
            typeof bc.category === "object" &&
            "id" in bc.category
          ) {
            setCategoryId(String((bc.category as any).id));
          } else {
            setCategoryId(null);
          }
        } else {
          setCategoryId(null);
        }

        // categories list
        const cats: Category[] = categoriesRes.data.results ?? (categoriesRes.data as any) ?? [];
        setCategories(cats);

        // checklist items (bc.items)
        const items: BackendChecklistItem[] =
          (bc as any).items ?? []; // depends on ChecklistSerializer

        const rows: CheckItemRow[] = items.map((ci) => {
          let name = `項目 #${ci.check_item}`;
          let typeLabel = "テキスト";
          let checkItem: CheckItem | null = null;

          if (typeof ci.check_item === "object") {
            checkItem = ci.check_item as any;
          }

          if (checkItem) {
            name = checkItem.name;
            typeLabel = mapCheckItemTypeToLabel(checkItem.type);
          }

          return {
            id: ci.id,
            name,
            typeLabel,
            required: ci.required,
          };
        });

        setCheckItems(rows);
      } catch (err) {
        console.error(err);
        setError("チェックリスト詳細の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [checklist.id]);

  const handleDeleteItem = async (id: number) => {
    try {
      // optimistic update
      setCheckItems((prev) => prev.filter((item) => item.id !== id));
      await api.delete(`/checklist-items/${id}/`);
    } catch (err) {
      console.error(err);
      setError("チェック項目の削除に失敗しました。");
    }
  };

  // NOTE: 追加は CheckItem と ChecklistItem を紐づける UI が必要なので、
  // ここではまだバックエンド連携せずに無効化しています。
  const handleAddItem = () => {
    // ここでモーダルを開いて既存 CheckItem 選択 → /checklist-items/ POST などに拡張可能
    setError("チェック項目の追加は、別画面（チェック項目マスタ）で行ってください。");
  };

  const handleSave = async () => {
    if (!backendChecklist) return;
    if (!listName.trim()) {
      setError("リスト名を入力してください。");
      return;
    }

    setSaving(true);
    setError(null);
    setSaveMessage(null);

    try {
      const payload: Partial<BackendChecklist> & {
        category?: number | null;
      } = {
        name: listName,
        description,
        category: categoryId ? Number(categoryId) : null,
        // estimatedTime はバックエンドにフィールドがないため、ここでは送信しない
      };

      const res = await api.patch<BackendChecklist>(
        `/checklists/${backendChecklist.id}/`,
        payload
      );
      setBackendChecklist(res.data);
      onSave(res.data);
      setSaveMessage("チェックリストを保存しました。");
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (err) {
      console.error(err);
      setError("チェックリストの保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
          <div>
            <h2 className="text-gray-900">チェックリスト詳細</h2>
            {backendChecklist && (
              <p className="text-xs text-gray-500 mt-1">
                ID: {backendChecklist.id}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Form Content */}
      <div className="overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {loading && (
            <p className="text-sm text-gray-500">データを読み込み中です...</p>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {saveMessage && (
            <p className="text-sm text-green-600">{saveMessage}</p>
          )}

          {/* 基本情報 */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-gray-900">基本情報</h3>

              <div className="space-y-2">
                <Label htmlFor="list-name">
                  リスト名<span className="text-red-600">*</span>
                </Label>
                <Input
                  id="list-name"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="リスト名を入力してください"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">説明</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="説明を入力してください"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">
                    カテゴリ<span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={categoryId ?? "none"}
                    onValueChange={(value: string) =>
                      setCategoryId(value === "none" ? null : value)
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="カテゴリを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* value="" は使わず "none" で未選択を表現 */}
                      <SelectItem value="none">未選択</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimated-time">推定作業時間（分）</Label>
                  <Input
                    id="estimated-time"
                    type="number"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    placeholder="分"
                  />
                  <p className="text-xs text-gray-500">
                    ※ 現在は画面上のみの項目です（バックエンド未連携）
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* チェック項目 */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-900">
                  チェック項目（{checkItems.length}項目）
                </h3>
                <Button size="sm" onClick={handleAddItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  チェック項目を追加
                </Button>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto border rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider w-16">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                        項目名
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider w-24">
                        タイプ
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider w-16">
                        必須
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider w-32">
                        アクション
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {checkItems.map((item, index) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.typeLabel}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.required ? "○" : ""}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" disabled>
                              編集
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              削除
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {checkItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 bg-white"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          #{index + 1}
                        </span>
                        <span className="text-gray-900">{item.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" disabled>
                          編集
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          削除
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">タイプ: </span>
                        <span className="text-gray-900">
                          {item.typeLabel}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">必須: </span>
                        <span className="text-gray-900">
                          {item.required ? "○" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" size="lg">
              <Eye className="w-4 h-4 mr-2" />
              プレビュー
            </Button>
            <Button variant="outline" size="lg" onClick={onBack}>
              キャンセル
            </Button>
            <Button size="lg" onClick={handleSave} disabled={saving}>
              {saving ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
