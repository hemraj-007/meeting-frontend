type Props = {
  transcript: { id: string; text: string } | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
};

export default function DeleteTranscriptModal({
  transcript,
  deleting,
  onClose,
  onConfirm,
}: Props) {
  if (!transcript) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={() => !deleting && onClose()}
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
          {transcript.text.slice(0, 80)}...
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(transcript.id)}
            disabled={deleting}
            className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
