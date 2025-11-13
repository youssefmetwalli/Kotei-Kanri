import { useState, useRef } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { ArrowLeft, Upload, Eye } from "lucide-react";

interface CheckItemCreationProps {
  onBack: () => void;
  onSave: (item: any) => void;
}

export function CheckItemCreation({ onBack, onSave }: CheckItemCreationProps) {
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [itemType, setItemType] = useState("number");
  const [category, setCategory] = useState("painting");
  const [tags, setTags] = useState("");
  
  // 数値型設定
  const [minValue, setMinValue] = useState("0");
  const [maxValue, setMaxValue] = useState("100");
  const [unit, setUnit] = useState("μm");
  const [decimalPlaces, setDecimalPlaces] = useState("2");
  const [defaultValue, setDefaultValue] = useState("");
  
  // バリデーション
  const [isRequired, setIsRequired] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // 参考画像
  const [allowHandwriting, setAllowHandwriting] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSave = () => {
    const newItem = {
      itemName,
      description,
      itemType,
      category,
      tags,
      minValue,
      maxValue,
      unit,
      decimalPlaces,
      defaultValue,
      isRequired,
      errorMessage,
      allowHandwriting,
      referenceImage: previewImage,
    };
    onSave(newItem);
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
          <h2 className="text-gray-900">チェック項目作成</h2>
        </div>
      </header>

      {/* Form Content */}
      <div className="overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
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
                  <Select value={itemType} onValueChange={setItemType}>
                    <SelectTrigger id="item-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="number">数値</SelectItem>
                      <SelectItem value="text">テキスト</SelectItem>
                      <SelectItem value="select">選択</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">カテゴリ</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="painting">塗装</SelectItem>
                      <SelectItem value="appearance">外観</SelectItem>
                      <SelectItem value="dimension">寸法</SelectItem>
                      <SelectItem value="welding">溶接</SelectItem>
                      <SelectItem value="strength">強度</SelectItem>
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

          {/* 項目タイプ別設定 */}
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
                    <Select value={decimalPlaces} onValueChange={setDecimalPlaces}>
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
                  onCheckedChange={(checked) => setIsRequired(checked as boolean)}
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
                  onCheckedChange={(checked) => setAllowHandwriting(checked as boolean)}
                />
                <Label htmlFor="allow-handwriting" className="cursor-pointer">
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
            <Button size="lg" onClick={handleSave}>
              保存
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}