import { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

type ActionItem = {
  id: string;
  task: string;
  owner: string | null;
  dueDate: string | null;
  completed: boolean;
  tags: string[];
};

export default function Workspace() {
  const [text, setText] = useState("");
  const [items, setItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ id: string; text: string; items: ActionItem[] }[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [transcriptsModalOpen, setTranscriptsModalOpen] = useState(false);
  const [transcriptToDelete, setTranscriptToDelete] = useState<{ id: string; text: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
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
      setItems(data);
    } catch {
      alert("Failed to extract actions");
    } finally {
      setLoading(false);
    }
  }

  async function addTag(id: string, tag: string) {
    if (!tag.trim()) return;
  
    const item = items.find(i => i.id === id);
    if (!item) return;
  
    if (item.tags.includes(tag.trim())) return; // 👈 prevent duplicate
  
    const updatedTags = [...item.tags, tag.trim()];
  
    const res = await fetch(`${API}/api/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags: updatedTags }),
    });
  
    const updated = await res.json();
  
    setItems(prev => prev.map(i => i.id === id ? updated : i));
  }  

  async function removeTag(id: string, tag: string) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
  
    const updatedTags = item.tags.filter((t) => t !== tag);
  
    const res = await fetch(`${API}/api/items/${id}`, {
      method: "PUT", // 👈 change from DELETE to PUT
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags: updatedTags }),
    });
  
    const updated = await res.json();
  
    setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
  }
  

  async function deleteTranscript(id: string) {
    setDeleting(true);
    try {
      const res = await fetch(`${API}/api/transcripts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setHistory((prev) => prev.filter((t) => t.id !== id));
      setTranscriptToDelete(null);
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
          item.id === id ? { ...item, completed: updated.completed } : item,
        ),
      );
    } catch {
      alert("Failed to update item");
    }
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Stat label="Total Tasks" value={items.length} />
        <Stat label="Open" value={items.filter((i) => !i.completed).length} />
        <Stat
          label="Completed"
          value={items.filter((i) => i.completed).length}
        />
      </div>

      {/* Transcript + History */}
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

        <div className="bg-gray-50 rounded-xl p-4 relative">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium">Recent Transcripts</p>
            <button
              onClick={() => setTranscriptsModalOpen(true)}
              className="p-1 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition"
              aria-label="Expand transcripts"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
              </svg>
            </button>
          </div>

          <div className="space-y-2">
            {historyLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="flex items-end gap-1 h-12">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 rounded-t bg-gradient-to-t from-indigo-600 to-indigo-400 origin-bottom animate-[bar-bounce_0.8s_ease-in-out_infinite]"
                      style={{
                        height: `${40 + i * 12}%`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {history.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white rounded-md p-2 text-sm flex items-center justify-between gap-2 group"
                  >
                    <div
                      onClick={() => setItems(t.items)}
                      className="flex-1 min-w-0 cursor-pointer hover:text-indigo-600 transition"
                    >
                      {t.text.slice(0, 60)}...
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTranscriptToDelete({ id: t.id, text: t.text });
                      }}
                      className="shrink-0 p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                      aria-label="Delete transcript"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </div>
                ))}
                {history.length === 0 && (
                  <p className="text-gray-400 text-sm">No transcripts yet</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Transcripts Modal */}
      {transcriptsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setTranscriptsModalOpen(false)}
        >
          <div
            className="absolute inset-0 bg-black/50"
            aria-hidden="true"
          />
          <div
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="transcripts-modal-title"
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b shrink-0">
              <h2 id="transcripts-modal-title" className="font-medium text-lg">Recent Transcripts</h2>
              <button
                onClick={() => setTranscriptsModalOpen(false)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-2 min-h-0">
              {historyLoading ? (
                <div className="flex justify-center py-12">
                  <div className="flex items-end gap-1 h-12">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 rounded-t bg-gradient-to-t from-indigo-600 to-indigo-400 origin-bottom animate-[bar-bounce_0.8s_ease-in-out_infinite]"
                        style={{ height: `${40 + i * 12}%`, animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>
              ) : history.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No transcripts yet</p>
              ) : (
                history.map((t) => (
                  <div
                    key={t.id}
                    className="bg-gray-50 rounded-lg p-3 text-sm flex items-center justify-between gap-3 group"
                  >
                    <div
                      onClick={() => {
                        setItems(t.items);
                        setTranscriptsModalOpen(false);
                      }}
                      className="flex-1 min-w-0 cursor-pointer hover:text-indigo-600 transition"
                    >
                      {t.text.slice(0, 100)}{t.text.length > 100 ? "..." : ""}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTranscriptToDelete({ id: t.id, text: t.text });
                      }}
                      className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                      aria-label="Delete transcript"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {transcriptToDelete && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={() => !deleting && setTranscriptToDelete(null)}
        >
          <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-title"
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="delete-confirm-title" className="font-medium text-gray-900 mb-1">
              Delete transcript?
            </h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">
              {transcriptToDelete.text.slice(0, 80)}...
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setTranscriptToDelete(null)}
                disabled={deleting}
                className="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteTranscript(transcriptToDelete.id)}
                disabled={deleting}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Items */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="font-medium mb-3">Action Items</p>

        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg p-3 flex justify-between items-center"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleComplete(item.id, item.completed)}
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
                        onClick={() => removeTag(item.id, tag)}
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
                          addTag(item.id, e.currentTarget.value);
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <span className="text-sm text-gray-400">
                {item.completed ? "Done" : "Open"}
              </span>
            </div>
          ))}

          {items.length === 0 && (
            <p className="text-gray-400 text-sm">No tasks yet</p>
          )}
        </div>
      </div>
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
