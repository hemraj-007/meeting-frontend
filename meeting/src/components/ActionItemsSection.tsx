import { useState } from "react";
import type { ActionItem } from "../types";
import ActionItemRow from "./ActionItemRow";

type Filter = "all" | "open" | "completed";

type Props = {
  items: ActionItem[];
  currentTranscriptId: string | null;
  onCreateItem: (payload: { task: string; owner?: string; dueDate?: string }) => void;
  onAddTag: (id: string, tag: string) => void;
  onRemoveTag: (id: string, tag: string) => void;
  onDeleteItem: (id: string) => void;
  onToggleComplete: (id: string, current: boolean) => void;
};

export default function ActionItemsSection({
  items,
  currentTranscriptId,
  onCreateItem,
  onAddTag,
  onRemoveTag,
  onDeleteItem,
  onToggleComplete,
}: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  const filteredItems =
    filter === "all"
      ? items
      : filter === "open"
        ? items.filter((i) => !i.completed)
        : items.filter((i) => i.completed);

  const handleCreate = () => {
    if (newTask.trim()) {
      onCreateItem({
        task: newTask.trim(),
        owner: newOwner.trim() || undefined,
        dueDate: newDueDate.trim() || undefined,
      });
      setNewTask("");
      setNewOwner("");
      setNewDueDate("");
      setShowAddForm(false);
    }
  };

  const emptyMessage =
    items.length === 0
      ? "No tasks yet"
      : filter === "all"
        ? "No tasks yet"
        : `No ${filter} tasks`;

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <p className="font-medium">Action Items</p>
          <div className="flex gap-1">
            {(["all", "open", "completed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition capitalize ${
                  filter === f
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          {showAddForm ? "Cancel" : "+ Add item"}
        </button>
      </div>

      {showAddForm && (
        <AddItemForm
          newTask={newTask}
          setNewTask={setNewTask}
          newOwner={newOwner}
          setNewOwner={setNewOwner}
          newDueDate={newDueDate}
          setNewDueDate={setNewDueDate}
          onCreate={handleCreate}
          hasTranscript={!!currentTranscriptId}
        />
      )}

      <div className="space-y-2">
        {filteredItems.map((item) => (
          <ActionItemRow
            key={item.id}
            item={item}
            onToggleComplete={onToggleComplete}
            onAddTag={onAddTag}
            onRemoveTag={onRemoveTag}
            onDelete={onDeleteItem}
          />
        ))}
        {filteredItems.length === 0 && (
          <p className="text-gray-400 text-sm">{emptyMessage}</p>
        )}
      </div>
    </div>
  );
}

type AddItemFormProps = {
  newTask: string;
  setNewTask: (v: string) => void;
  newOwner: string;
  setNewOwner: (v: string) => void;
  newDueDate: string;
  setNewDueDate: (v: string) => void;
  onCreate: () => void;
  hasTranscript: boolean;
};

function AddItemForm({
  newTask,
  setNewTask,
  newOwner,
  setNewOwner,
  newDueDate,
  setNewDueDate,
  onCreate,
  hasTranscript,
}: AddItemFormProps) {
  return (
    <div className="bg-white rounded-lg p-3 mb-2 border-2 border-indigo-100">
      <input
        placeholder="Task"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm mb-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
      />
      <div className="flex gap-2 mb-2">
        <input
          placeholder="Owner"
          value={newOwner}
          onChange={(e) => setNewOwner(e.target.value)}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
        <input
          placeholder="Due date"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
      </div>
      <button
        onClick={onCreate}
        disabled={!newTask.trim() || !hasTranscript}
        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        Add
      </button>
    </div>
  );
}
