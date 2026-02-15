import { forwardRef } from "react";
import type { Transcript } from "../types";
import BarLoader from "./BarLoader";

type Props = {
  isOpen: boolean;
  history: Transcript[];
  loading: boolean;
  onClose: () => void;
  onSelect: (t: Transcript) => void;
  onDelete: (t: Transcript) => void;
};

const TranscriptsModal = forwardRef<HTMLDivElement, Props>(
  ({ isOpen, history, loading, onClose, onSelect, onDelete }, ref) => {
    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
        <div
          ref={ref}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="transcripts-modal-title"
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col focus:outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b shrink-0">
            <h2 id="transcripts-modal-title" className="font-medium text-lg">
              Recent Transcripts
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="overflow-y-auto p-4 space-y-2 min-h-0">
            {loading ? (
              <div className="flex justify-center py-12">
                <BarLoader size="sm" />
              </div>
            ) : history.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">
                No transcripts yet
              </p>
            ) : (
              history.map((t) => (
                <div
                  key={t.id}
                  className="bg-gray-50 rounded-lg p-3 text-sm flex items-center justify-between gap-3 group"
                >
                  <div
                    onClick={() => onSelect(t)}
                    className="flex-1 min-w-0 cursor-pointer hover:text-indigo-600 transition"
                  >
                    {t.text.slice(0, 100)}
                    {t.text.length > 100 ? "..." : ""}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(t);
                    }}
                    className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                    aria-label="Delete transcript"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }
);

TranscriptsModal.displayName = "TranscriptsModal";

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

export default TranscriptsModal;
