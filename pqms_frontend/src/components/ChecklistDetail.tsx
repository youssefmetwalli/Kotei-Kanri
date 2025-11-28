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

type MaybePaginated<T> =
  | T[]
  | {
      results?: T[];
      count?: number;
      next?: string | null;
      previous?: string | null;
    };

function normalizeListResponse<T>(data: MaybePaginated<T>): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results!;
  return [];
}

interface CheckItemRow {
  // checklist_items.id (may be null for newly added items)
  checklistItemId: number | null;
  // master CheckItem id
  checkItemId: number;
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

export function ChecklistDetail({
  checklist,
  onBack,
  onSave,
}: ChecklistDetailProps) {
  const [listName, setListName] = useState(checklist.name);
  const [description, setDescription] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<string>(""); 

  // current items that belong to this checklist
  const [checkItems, setCheckItems] = useState<CheckItemRow[]>([]);
  // master data
  const [allCheckItems, setAllCheckItems] = useState<CheckItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [backendChecklist, setBackendChecklist] =
    useState<BackendChecklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Add-item modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState<Set<number>>(new Set());

  // ---- Load checklist detail + categories + all check items ----
  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const [checklistRes, categoriesRes, checkItemsRes] = await Promise.all([
          api.get<BackendChecklist>(`/checklists/${checklist.id}/`),
          api.get<MaybePaginated<Category>>("/categories/"),
          api.get<MaybePaginated<CheckItem>>("/check-items/"),
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

        // categories list - normalize to array
        const catData = categoriesRes.data as any;
        const cats: Category[] = Array.isArray(catData)
          ? catData
          : Array.isArray(catData.results)
          ? catData.results
          : [];
        setCategories(cats);

        // all master check items (for "add item" modal)
        const allItems = normalizeListResponse<CheckItem>(checkItemsRes.data);
        setAllCheckItems(allItems);

        // checklist items from bc.items
        const items: BackendChecklistItem[] = Array.isArray((bc as any).items)
          ? ((bc as any).items as BackendChecklistItem[])
          : [];

        const rows: CheckItemRow[] = items.map((ci) => {
          let name = `項目 #${ci.check_item}`;
          let typeLabel = "テキスト";
          let checkItem: CheckItem | null = null;
          let checkItemId: number;

          if (typeof ci.check_item === "object") {
            checkItem = ci.check_item as any;
            checkItemId = checkItem!.id;
          } else {
            checkItemId = ci.check_item as number;
          }

          if (checkItem) {
            name = checkItem.name;
            typeLabel = mapCheckItemTypeToLabel(checkItem.type);
          }

          return {
            checklistItemId: ci.id,
            checkItemId,
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

  // ---------- checklist items operations ----------

  const handleOpenAddModal = () => {
    setSelectedToAdd(new Set());
    setError(null);
    setAddModalOpen(true);
  };

  const toggleSelectToAdd = (id: number) => {
    setSelectedToAdd((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirmAddItems = () => {
    if (selectedToAdd.size === 0) {
      setAddModalOpen(false);
      return;
    }

    const existingIds = new Set(checkItems.map((ci) => ci.checkItemId));
    const selected = allCheckItems.filter(
      (ci) => selectedToAdd.has(ci.id) && !existingIds.has(ci.id)
    );

    if (selected.length === 0) {
      setAddModalOpen(false);
      return;
    }

    const newRows: CheckItemRow[] = selected.map((ci) => ({
      checklistItemId: null,
      checkItemId: ci.id,
      name: ci.name,
      typeLabel: mapCheckItemTypeToLabel(ci.type),
      required: ci.required ?? false,
    }));

    setCheckItems((prev) => [...prev, ...newRows]);
    setAddModalOpen(false);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    setCheckItems((prev) => {
      const next = [...prev];
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= next.length) return prev;
      const tmp = next[index];
      next[index] = next[newIndex];
      next[newIndex] = tmp;
      return next;
    });
  };

  const handleDeleteItem = (checkItemId: number) => {
    setCheckItems((prev) =>
      prev.filter((item) => item.checkItemId !== checkItemId)
    );
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
      const itemsPayload = checkItems.map((item, index) => ({
        check_item_id: item.checkItemId,
        required: item.required,
        instruction: "",
        unit: "",
        options: [],
      }));

      const payload: Partial<BackendChecklist> & {
        category_id?: number | null;
        items_write?: any[];
      } = {
        name: listName,
        description,
        category_id: categoryId ? Number(categoryId) : null,
        items_write: itemsPayload,
        // estimatedTime is frontend-only for now
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

  // ---------- render ----------

  const availableForAdd = allCheckItems.filter(
    (ci) => !checkItems.some((row) => row.checkItemId === ci.id)
  );

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

          {/* Basic info */}
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

          {/* Checklist items */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-900">
                  チェック項目（{checkItems.length}項目）
                </h3>
                <Button size="sm" onClick={handleOpenAddModal}>
                  <Plus className="w-4 h-4 mr-2" />
                  チェック項目を追加
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                ※ 項目の追加・並び順の変更後は、右下の「保存」を押して確定してください
              </p>

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
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider w-40">
                        アクション
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {checkItems.map((item, index) => (
                      <tr
                        key={item.checkItemId}
                        className="border-b hover:bg-gray-50"
                      >
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveItem(index, "up")}
                              disabled={index === 0}
                            >
                              ↑
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveItem(index, "down")}
                              disabled={index === checkItems.length - 1}
                            >
                              ↓
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDeleteItem(item.checkItemId)
                              }
                            >
                              削除
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {checkItems.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-6 text-sm text-gray-500 text-center"
                        >
                          チェック項目がありません。右上の「チェック項目を追加」から追加してください。
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {checkItems.map((item, index) => (
                  <div
                    key={item.checkItemId}
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveItem(index, "up")}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveItem(index, "down")}
                          disabled={index === checkItems.length - 1}
                        >
                          ↓
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDeleteItem(item.checkItemId)
                          }
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
                {checkItems.length === 0 && (
                  <div className="p-4 text-sm text-gray-500 text-center">
                    チェック項目がありません。右上の「チェック項目を追加」から追加してください。
                  </div>
                )}
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

      {/* Simple "Add Items" modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              チェック項目を追加
            </h3>
            {availableForAdd.length === 0 ? (
              <p className="text-sm text-gray-500">
                追加可能なチェック項目がありません。先に「チェック項目マスタ」で作成してください。
              </p>
            ) : (
              <div className="max-h-80 overflow-y-auto border rounded">
                {availableForAdd.map((ci) => (
                  <label
                    key={ci.id}
                    className="flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {ci.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {mapCheckItemTypeToLabel(ci.type)} /{" "}
                        {typeof ci.category === "object" &&
                        ci.category &&
                        "name" in ci.category
                          ? (ci.category as any).name
                          : ""}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selectedToAdd.has(ci.id)}
                      onChange={() => toggleSelectToAdd(ci.id)}
                    />
                  </label>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddModalOpen(false)}
              >
                キャンセル
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmAddItems}
                disabled={availableForAdd.length === 0}
              >
                追加
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
