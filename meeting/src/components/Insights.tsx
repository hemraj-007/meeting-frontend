import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

type Transcript = {
  id: string;
  items: { completed: boolean }[];
};

export default function Insights() {
  const [data, setData] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/transcripts`);
      const d = await res.json();
      setData(d);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (    
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <div className="flex items-end gap-2 h-24 mb-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-3 rounded-t-md bg-gradient-to-t from-indigo-600 to-indigo-400 origin-bottom animate-[bar-bounce_0.8s_ease-in-out_infinite]"
              style={{
                height: `${40 + i * 12}%`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
        <p className="text-gray-500 text-sm font-medium tracking-wide animate-pulse">
          Gathering insights...
        </p>
      </div>
    );
  }

  const totalTranscripts = data.length;

  const allItems = data.flatMap(t => t.items);
  const totalTasks = allItems.length;
  const completed = allItems.filter(i => i.completed).length;
  const open = totalTasks - completed;

  const rate = totalTasks
    ? Math.round((completed / totalTasks) * 100)
    : 0;

  const stats = [
    ["Total Transcripts", totalTranscripts],
    ["Total Tasks", totalTasks],
    ["Completed Tasks", completed],
    ["Open Tasks", open],
    ["Completion Rate", `${rate}%`]
  ];

  return (
    <div className="grid grid-cols-2 gap-6">
      {stats.map(([label, value]) => (
        <div
          key={label}
          className="bg-gray-50 rounded-xl p-6 text-center"
        >
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-3xl font-semibold mt-1">{value}</p>
        </div>
      ))}
    </div>
  );
}
