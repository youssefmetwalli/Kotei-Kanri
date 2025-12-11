// src/components/ExecutionTracking.tsx
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "./ui/card";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";

interface ExecutionTrackingProps {
  executionId: number;
  onBack?: () => void;
}

// Shape that matches your /executions/:id/progress/ response
interface ExecutionItemProgress {
  item_id: number;
  item_name: string;
  status: "OK" | "NG" | "SKIP" | string;
  photos: string[];
}

interface ExecutionProgressResponse {
  progress: number;
  results: ExecutionItemProgress[];
}

export function ExecutionTracking({ executionId, onBack }: ExecutionTrackingProps) {
  const [data, setData] = useState<ExecutionProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<ExecutionProgressResponse>(
          `/executions/${executionId}/progress/`
        );
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError("実行進捗の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [executionId]);

  if (loading) {
    return (
      <div className="p-8 text-sm text-gray-500">
        実行進捗を読み込み中です…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 space-y-4">
        {onBack && (
          <Button variant="outline" size="sm" onClick={onBack}>
            戻る
          </Button>
        )}
        <p className="text-sm text-red-600">
          {error ?? "実行進捗を表示できませんでした。"}
        </p>
      </div>
    );
  }

  const completedItems = data.results.filter(
    (r) => r.status !== "SKIP"
  );
  const remainingItems = data.results.filter(
    (r) => r.status === "SKIP"
  );

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          実行詳細トラッキング
        </h1>
        {onBack && (
          <Button variant="outline" size="sm" onClick={onBack}>
            戻る
          </Button>
        )}
      </div>

      {/* Execution progress */}
      <Card>
        <CardHeader>
          <CardTitle>実行進捗</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium mb-2 text-gray-800">
            Progress: {data.progress}%
          </p>
          <Progress value={data.progress} className="h-3" />
        </CardContent>
      </Card>

      {/* Completed Items */}
      <Card>
        <CardHeader>
          <CardTitle>完了した項目</CardTitle>
        </CardHeader>
        <CardContent>
          {completedItems.length === 0 && (
            <p className="text-sm text-gray-500">
              完了した項目はまだありません。
            </p>
          )}

          {completedItems.map((item) => (
            <div
              key={item.item_id}
              className="mb-4 pb-4 border-b last:border-b-0"
            >
              <p className="font-medium text-gray-900">
                {item.item_name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Status: {item.status}
              </p>

              {item.photos && item.photos.length > 0 && (
                <div className="flex gap-3 mt-3 flex-wrap">
                  {item.photos.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`photo-${i}`}
                      className="w-24 h-24 object-cover rounded border"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Remaining Items */}
      <Card>
        <CardHeader>
          <CardTitle>未完了項目</CardTitle>
        </CardHeader>
        <CardContent>
          {remainingItems.length === 0 ? (
            <p className="text-sm text-gray-500">
              未完了項目はありません。
            </p>
          ) : (
            remainingItems.map((item) => (
              <div key={item.item_id} className="mb-4">
                <p className="font-medium text-gray-900">
                  {item.item_name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Status: {item.status}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
