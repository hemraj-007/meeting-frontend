import type { Transcript } from "../types";
import BarLoader from "./BarLoader";

type Props = {
  history: Transcript[];
  loading: boolean;
  onSelect: (t: Transcript) => void;
  onDelete: (t: Transcript) => void;
  onExpand: () => void;
};

export default function RecentTranscripts({
  history,
  loading,
  onSelect,
  onDelete,
  onExpand,
}: Props) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 relative">
      <div className="flex items-center justify-between mb-2">
        <p className="font-medium">Recent Transcripts</p>
        <button
          onClick={onExpand}
          className="p-1 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition"
          aria-label="Expand transcripts"
        >
          <ExpandIcon />
        </button>
      </div>
      <div className="space-y-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <BarLoader size="sm" />
          </div>
        ) : (
          <>
            {history.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-md p-2 text-sm flex items-center justify-between gap-2 group"
              >
                <div
                  onClick={() => onSelect(t)}
                  className="flex-1 min-w-0 cursor-pointer hover:text-indigo-600 transition"
                >
                  {t.text.slice(0, 60)}...
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(t);
                  }}
                  className="shrink-0 p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                  aria-label="Delete transcript"
                >
                  <TrashIcon size={16} />
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
  );
}

function ExpandIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function TrashIcon({ size = 16 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}
