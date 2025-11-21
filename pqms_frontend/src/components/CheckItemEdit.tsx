// src/components/CheckItemEdit.tsx
import { useEffect, useRef, useState } from "react";
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
import { Checkbox } from "./ui/checkbox";
import { ArrowLeft, Upload, Eye } from "lucide-react";
import { api } from "../lib/api";
import type { CheckItem, CheckItemType, Category } from "../types/backend";

interface CheckItemEditProps {
  itemId: number;
  onBack: () => void;
  onSaved: (item: CheckItem) => void;
}

export function CheckItemEdit({ itemId, onBack, onSaved }: CheckItemEditProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [item, setItem] = useState<CheckItem | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // form state
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [itemType, setItemType] = useState<CheckItemType>("text");
  const [categoryId, setCategoryId] = useState<string>("none");
  const [tags, setTags] = useState("");

  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [unit, setUnit] = useState("");
  const [decimalPlaces, setDecimalPlaces] = useState("0");
  const [defaultValue, setDefaultValue] = useState("");

  const [isRequired, setIsRequired] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [allowHandwriting, setAllowHandwriting] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // -----------------------------
  // Load item + categories
  // -----------------------------
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [itemRes, catRes] = await Promise.all([
          api.get<CheckItem>(`/check-items/${itemId}/`),
          api.get<Category[]>("/categories/"),
        ]);

        const itm = itemRes.data;
        setItem(itm);
        setCategories(catRes.data);

        // init form from item
        setItemName(itm.name);
        setDescription(itm.description ?? "");
        setItemType(itm.type);

        if (typeof itm.category === "number") {
          setCategoryId(String(itm.category));
        } else if (itm.category && typeof itm.category === "object") {
          setCategoryId(String((itm.category as Category).id));
        } else {
          setCategoryId("none");
        }

        setTags(itm.tags ?? "");

        setMinValue(
          itm.min_value !== null && itm.min_value !== undefined
            ? String(itm.min_value)
            : ""
        );
        setMaxValue(
          itm.max_value !== null && itm.max_value !== undefined
            ? String(itm.max_value)
            : ""
        );
        setUnit(itm.unit ?? "");
        setDecimalPlaces(
          itm.decimal_places !== undefined ? String(itm.decimal_places) : "0"
        );
        setDefaultValue(
          itm.default_value !== null && itm.default_value !== undefined
            ? String(itm.default_value)
            : ""
        );

        setIsRequired(itm.required ?? false);
        setErrorMessage(itm.error_message ?? "");
        setAllowHandwriting(itm.allow_handwriting ?? false);
        setPreviewImage(itm.reference_image ?? "");
      } catch (err) {
        console.error(err);
        setError("チェック項目の読み込みに失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemId]);

  // -----------------------------
  // Image upload (keep as base64 string for now)
  // -----------------------------
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setPreviewImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // -----------------------------
  // Save
  // -----------------------------
  const handleSave = async () => {
    if (!itemName.trim()) {
      setError("項目名を入力してください。");
      return;
    }
    if (!item) return;

    setSaving(true);
    setError(null);

    try {
      const payload: any = {
        name: itemName,
        description,
        type: itemType,
        // NOTE: serializer expects category_id for write
        category_id: categoryId === "none" ? null : Number(categoryId),
        required: isRequired,
        unit: itemType === "number" ? unit : "",
        options: item.options ?? [],

        tags,
        min_value:
          itemType === "number" && minValue !== ""
            ? parseFloat(minValue)
            : null,
        max_value:
          itemType === "number" && maxValue !== ""
            ? parseFloat(maxValue)
            : null,
        decimal_places:
          itemType === "number" ? parseInt(decimalPlaces, 10) || 0 : 0,
        default_value:
          itemType === "number" && defaultValue !== ""
            ? parseFloat(defaultValue)
            : null,
        error_message: errorMessage,
        allow_handwriting: allowHandwriting,
        reference_image: previewImage || "",
      };

      const res = await api.patch<CheckItem>(`/check-items/${item.id}/`, payload);
      onSaved(res.data);
      onBack();
    } catch (err) {
      console.error(err);
      setError("チェック項目の更新に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // Render
  // -----------------------------
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
            <h2 className="text-gray-900">チェック項目編集</h2>
            {item && (
              <p className="text-xs text-gray-500 mt-1">ID: {item.id}</p>
            )}
          </div>
        </div>
      </header>

      {/* Form Content */}
      <div className="overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {loading && (
            <p className="text-sm text-gray-500">読み込み中です...</p>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {!loading && item && (
            <>
              {/* 基本情報 */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-gray-900">基本情報</h3>

                  <div className="space-y-2">
                    <Label htmlFor="item-name">
                      項目名<span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="item-name"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="項目名を入力してください"
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
                      <Label htmlFor="item-type">
                        項目タイプ<span className="text-red-600">*</span>
                      </Label>
                      <Select
                        value={itemType}
                        onValueChange={(value: CheckItemType) =>
                          setItemType(value)
                        }
                      >
                        <SelectTrigger id="item-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="number">数値</SelectItem>
                          <SelectItem value="text">テキスト</SelectItem>
                          <SelectItem value="select">選択</SelectItem>
                          <SelectItem value="boolean">真偽</SelectItem>
                          <SelectItem value="photo">写真</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">カテゴリ</Label>
                      <Select
                        value={categoryId}
                        onValueChange={(value: string) =>
                          setCategoryId(value)
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">タグ</Label>
                    <Input
                      id="tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="タグを入力してください（カンマ区切り）"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 項目タイプ別設定（数値の場合） */}
              {itemType === "number" && (
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-gray-900">項目タイプ別設定(数値の場合)</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="min-value">最小値</Label>
                        <Input
                          id="min-value"
                          type="number"
                          value={minValue}
                          onChange={(e) => setMinValue(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max-value">最大値</Label>
                        <Input
                          id="max-value"
                          type="number"
                          value={maxValue}
                          onChange={(e) => setMaxValue(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="unit">単位</Label>
                        <Input
                          id="unit"
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                          placeholder="例: μm, mm, kg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="decimal-places">小数点桁数</Label>
                        <Select
                          value={decimalPlaces}
                          onValueChange={(value: string) =>
                            setDecimalPlaces(value)
                          }
                        >
                          <SelectTrigger id="decimal-places">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0</SelectItem>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="default-value">デフォルト値</Label>
                      <Input
                        id="default-value"
                        type="number"
                        value={defaultValue}
                        onChange={(e) => setDefaultValue(e.target.value)}
                        placeholder="デフォルト値を入力してください"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* バリデーションルール */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-gray-900">バリデーションルール</h3>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="required"
                      checked={isRequired}
                      onCheckedChange={(checked) => setIsRequired(!!checked)}
                    />
                    <Label htmlFor="required" className="cursor-pointer">
                      必須
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="error-message">エラーメッセージ</Label>
                    <Input
                      id="error-message"
                      value={errorMessage}
                      onChange={(e) => setErrorMessage(e.target.value)}
                      placeholder="エラーメッセージを入力してください"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 参考画像 */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-gray-900">参考画像</h3>

                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      参考画像をアップロード
                    </Button>
                    {previewImage && (
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        プレビュー
                      </Button>
                    )}
                  </div>

                  {previewImage && (
                    <div className="border rounded-lg p-4">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="max-w-full h-auto max-h-64 object-contain"
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allow-handwriting"
                      checked={allowHandwriting}
                      onCheckedChange={(checked) =>
                        setAllowHandwriting(!!checked)
                      }
                    />
                    <Label
                      htmlFor="allow-handwriting"
                      className="cursor-pointer"
                    >
                      手書きコメントを許可
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <Button variant="outline" size="lg">
                  プレビュー
                </Button>
                <Button variant="outline" size="lg" onClick={onBack}>
                  キャンセル
                </Button>
                <Button size="lg" onClick={handleSave} disabled={saving}>
                  {saving ? "保存中..." : "保存"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
