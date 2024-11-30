import { useState } from "react";
import { logger } from "@/utils/logger";

export function DebugLogs() {
  const [isVisible, setIsVisible] = useState(false);
  const [filter, setFilter] = useState<"info" | "warn" | "error" | undefined>();

  const logs = logger.getLogs(filter);

  return (
    <div className="fixed bottom-4 right-4">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-zinc-800 p-2 rounded-full"
      >
        {isVisible ? "Hide Logs" : "Show Logs"}
      </button>

      {isVisible && (
        <div className="fixed bottom-16 right-4 w-96 max-h-96 overflow-auto bg-zinc-900 p-4 rounded-lg shadow-lg">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFilter(undefined)}
              className={`px-2 py-1 rounded ${
                !filter ? "bg-blue-500" : "bg-zinc-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("info")}
              className={`px-2 py-1 rounded ${
                filter === "info" ? "bg-blue-500" : "bg-zinc-700"
              }`}
            >
              Info
            </button>
            <button
              onClick={() => setFilter("warn")}
              className={`px-2 py-1 rounded ${
                filter === "warn" ? "bg-yellow-500" : "bg-zinc-700"
              }`}
            >
              Warnings
            </button>
            <button
              onClick={() => setFilter("error")}
              className={`px-2 py-1 rounded ${
                filter === "error" ? "bg-red-500" : "bg-zinc-700"
              }`}
            >
              Errors
            </button>
          </div>

          <div className="space-y-2">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`p-2 rounded text-sm ${
                  log.level === "error"
                    ? "bg-red-900/50"
                    : log.level === "warn"
                    ? "bg-yellow-900/50"
                    : "bg-blue-900/50"
                }`}
              >
                <div className="text-xs opacity-70">{log.timestamp}</div>
                <div>{log.message}</div>
                {log.data && (
                  <pre className="text-xs mt-1 opacity-70">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
