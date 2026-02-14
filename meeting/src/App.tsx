import { useState } from "react";
import Workspace from "./components/Workspace";
import Insights from "./components/Insights";

export default function App() {
  const [tab, setTab] = useState<"workspace" | "insights">("workspace");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-blue-500 flex items-start justify-center pt-14 p-6">

      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl p-8">

        <h1 className="text-3xl font-semibold text-gray-800">
          Meeting Action Items Tracker
        </h1>

        <p className="text-gray-500 mt-1">
          Paste your meeting notes and turn them into actionable tasks
        </p>

        {/* Chips */}
        <div className="mt-4 flex gap-2">

          <button
            onClick={() => setTab("workspace")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition
              ${
                tab === "workspace"
                  ? "bg-indigo-600 text-white"
                  : "border border-gray-300 text-gray-600 hover:bg-gray-100"
              }
            `}
          >
            Workspace
          </button>

          <button
            onClick={() => setTab("insights")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition
              ${
                tab === "insights"
                  ? "bg-indigo-600 text-white"
                  : "border border-gray-300 text-gray-600 hover:bg-gray-100"
              }
            `}
          >
            Insights
          </button>

        </div>

        {/* Content */}
        <div className="mt-8">
          {tab === "workspace" ? <Workspace /> : <Insights />}
        </div>

      </div>
    </div>
  );
}
