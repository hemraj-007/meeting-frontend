import { useState, useEffect, useRef } from "react";
import type { ActionItem, Transcript } from "../types";
import ActionItemsSection from "./ActionItemsSection";
import RecentTranscripts from "./RecentTranscripts";
import TranscriptsModal from "./TranscriptsModal";
import DeleteTranscriptModal from "./DeleteTranscriptModal";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Workspace() {
  const [text, setText] = useState("");
  const [items, setItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Transcript[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [transcriptsModalOpen, setTranscriptsModalOpen] = useState(false);
  const [transcriptToDelete, setTranscriptToDelete] = useState<{ id: string; text: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentTranscriptId, setCurrentTranscriptId] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (transcriptsModalOpen) {
      document.body.style.overflow = "hidden";
      modalRef.current?.focus();
      const onEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") setTranscriptsModalOpen(false);
      };
      window.addEventListener("keydown", onEscape);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", onEscape);
      };
    }
  }, [transcriptsModalOpen]);

  useEffect(() => {
    if (transcriptToDelete) {
      const onEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape" && !deleting) setTranscriptToDelete(null);
      };
      window.addEventListener("keydown", onEscape);
      return () => window.removeEventListener("keydown", onEscape);
    }
  }, [transcriptToDelete, deleting]);

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API}/api/transcripts`);
      const data = await res.json();
      setHistory(data);
    } catch {
      console.log("Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  }

  async function extractActions() {
    if (!text.trim()) return;
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/transcripts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      const extractedItems = Array.isArray(data) ? data : (data.items ?? []);
      const transcriptId = data?.id ?? data?.transcriptId ?? null;
      setItems(extractedItems);
      setCurrentTranscriptId(transcriptId);
    } catch {
      alert("Failed to extract actions");
    } finally {
      setLoading(false);
    }
  }

  async function addTag(id: string, tag: string) {
    if (!tag.trim()) return;
    const item = items.find((i) => i.id === id);
    if (!item || (item.tags ?? []).includes(tag.trim())) return;
    const updatedTags = [...(item.tags ?? []), tag.trim()];
    try {
      const res = await fetch(`${API}/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: updatedTags }),
      });
      const updated = await res.json();
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    } catch {
      alert("Failed to add tag");
    }
  }

  async function removeTag(id: string, tag: string) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const updatedTags = (item.tags ?? []).filter((t) => t !== tag);
    try {
      const res = await fetch(`${API}/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: updatedTags }),
      });
      const updated = await res.json();
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    } catch {
      alert("Failed to remove tag");
    }
  }

  async function createItem(payload: { task: string; owner?: string; dueDate?: string }) {
    if (!currentTranscriptId) {
      alert("Extract from a transcript or select one from history first");
      return;
    }
    try {
      const res = await fetch(`${API}/api/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: payload.task,
          transcriptId: currentTranscriptId,
          owner: payload.owner || undefined,
          dueDate: payload.dueDate || undefined,
        }),
      });
      const created = await res.json();
      setItems((prev) => [...prev, created]);
    } catch {
      alert("Failed to add action item");
    }
  }

  async function deleteItem(id: string) {
    try {
      const res = await fetch(`${API}/api/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      alert("Failed to delete action item");
    }
  }

  async function deleteTranscript(id: string) {
    setDeleting(true);
    try {
      const res = await fetch(`${API}/api/transcripts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setHistory((prev) => prev.filter((t) => t.id !== id));
      setTranscriptToDelete(null);
      if (currentTranscriptId === id) {
        setItems([]);
        setCurrentTranscriptId(null);
      }
    } catch {
      alert("Failed to delete transcript");
    } finally {
      setDeleting(false);
    }
  }

  async function toggleComplete(id: string, current: boolean) {
    try {
      const res = await fetch(`${API}/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !current }),
      });
      const updated = await res.json();
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, completed: updated.completed } : item
        )
      );
    } catch {
      alert("Failed to update item");
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-4">
        <Stat label="Total Tasks" value={items.length} />
        <Stat label="Open" value={items.filter((i) => !i.completed).length} />
        <Stat label="Completed" value={items.filter((i) => i.completed).length} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-gray-50 rounded-xl p-4">
          <p className="font-medium mb-2">Meeting Transcript</p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste transcript here..."
            className="w-full h-32 rounded-xl border-2 border-gray-200 bg-white p-3.5 text-gray-700 placeholder:text-gray-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-200"
          />
          <button
            onClick={extractActions}
            disabled={loading}
            className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? "Extracting..." : "Extract Action Items"}
          </button>
        </div>

        <RecentTranscripts
          history={history}
          loading={historyLoading}
          onSelect={(t) => {
            setItems(t.items);
            setCurrentTranscriptId(t.id);
          }}
          onDelete={(t) => setTranscriptToDelete({ id: t.id, text: t.text })}
          onExpand={() => setTranscriptsModalOpen(true)}
        />
      </div>

      <TranscriptsModal
        ref={modalRef}
        isOpen={transcriptsModalOpen}
        history={history}
        loading={historyLoading}
        onClose={() => setTranscriptsModalOpen(false)}
        onSelect={(t) => {
          setItems(t.items);
          setCurrentTranscriptId(t.id);
          setTranscriptsModalOpen(false);
        }}
        onDelete={(t) => setTranscriptToDelete({ id: t.id, text: t.text })}
      />

      <DeleteTranscriptModal
        transcript={transcriptToDelete}
        deleting={deleting}
        onClose={() => setTranscriptToDelete(null)}
        onConfirm={deleteTranscript}
      />

      <ActionItemsSection
        items={items}
        currentTranscriptId={currentTranscriptId}
        onCreateItem={createItem}
        onAddTag={addTag}
        onRemoveTag={removeTag}
        onDeleteItem={deleteItem}
        onToggleComplete={toggleComplete}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 text-center">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
