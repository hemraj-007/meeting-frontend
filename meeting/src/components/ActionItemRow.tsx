import type { ActionItem } from "../types";

type Props = {
  item: ActionItem;
  onToggleComplete: (id: string, current: boolean) => void;
  onAddTag: (id: string, tag: string) => void;
  onRemoveTag: (id: string, tag: string) => void;
  onDelete: (id: string) => void;
};

export default function ActionItemRow({
  item,
  onToggleComplete,
  onAddTag,
  onRemoveTag,
  onDelete,
}: Props) {
  return (
    <div className="bg-white rounded-lg p-3 flex justify-between items-center">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <input
          type="checkbox"
          checked={item.completed}
          onChange={() => onToggleComplete(item.id, item.completed)}
          className="mt-1 w-4 h-4 accent-indigo-600"
        />
        <div>
          <p
            className={`font-medium ${item.completed ? "line-through text-gray-400" : ""}`}
          >
            {item.task}
          </p>
          <p className="text-sm text-gray-500">
            {item.owner ?? "Unassigned"} • {item.dueDate ?? "No date"}
          </p>
          <div className="flex flex-wrap gap-2 mt-1">
            {(item.tags ?? []).map((tag) => (
              <span
                key={tag}
                onClick={() => onRemoveTag(item.id, tag)}
                className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs cursor-pointer hover:bg-indigo-200"
              >
                {tag} ✕
              </span>
            ))}
            <input
              placeholder="+ tag"
              className="text-xs border rounded-full px-2 py-0.5 outline-none w-20"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onAddTag(item.id, e.currentTarget.value);
                  e.currentTarget.value = "";
                }
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm text-gray-400">
          {item.completed ? "Done" : "Open"}
        </span>
        <button
          onClick={() => onDelete(item.id)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
          aria-label="Delete action item"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}
