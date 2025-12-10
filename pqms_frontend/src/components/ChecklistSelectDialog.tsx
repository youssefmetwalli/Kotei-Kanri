import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { api } from "../lib/api";
import type { Checklist } from "../types/backend";

type MaybePaginated<T> =
  | {
      results: T[];
      count?: number;
      next?: string | null;
      previous?: string | null;
    }
  | T[];

function normalizeListResponse<T>(data: MaybePaginated<T>): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as any).results)) {
    return (data as any).results as T[];
  }
  return [];
}

type ChecklistSelectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (checklist: Checklist) => void;
};

export function ChecklistSelectDialog({
  open,
  onOpenChange,
  onSelect,
}: ChecklistSelectDialogProps) {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // fetch all checklists when dialog opens
  useEffect(() => {
    if (!open) return;

    const fetchChecklists = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<MaybePaginated<Checklist>>("/checklists/");
        const data = normalizeListResponse(res.data);
        setChecklists(data);
      } catch (err) {
        console.error(err);
        setError("チェックリストの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchChecklists();
  }, [open]);

  const filtered = checklists.filter((c) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (typeof c.description === "string" &&
        c.description.toLowerCase().includes(q))
    );
  });

  const handleSelect = (cl: Checklist) => {
    onSelect(cl);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>チェックリストを選択</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="リスト名・説明で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {loading && (
            <p className="text-sm text-gray-500">読み込み中です...</p>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {!loading && !error && (
            <div className="border rounded-lg max-h-64 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="text-sm text-gray-500 px-4 py-6 text-center">
                  利用可能なチェックリストがありません。
                </div>
              ) : (
                <ul className="divide-y">
                  {filtered.map((cl) => (
                    <li
                      key={cl.id}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                      onClick={() => handleSelect(cl)}
                    >
                      <div>
                        <div className="text-sm text-gray-900">{cl.name}</div>
                        {cl.description && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {cl.description}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        ID: {cl.id}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
