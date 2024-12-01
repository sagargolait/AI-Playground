type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  private createEntry(
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };
  }

  private store(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem("app_logs", JSON.stringify(this.logs));
    } catch (error) {
      console.warn("Failed to store logs in localStorage:", error);
    }
  }

  info(message: string, data?: Record<string, unknown>) {
    const entry = this.createEntry("info", message, data);
    this.store(entry);
    console.info(`[INFO] ${message}`, data);
  }

  warn(message: string, data?: Record<string, unknown>) {
    const entry = this.createEntry("warn", message, data);
    this.store(entry);
    console.warn(`[WARN] ${message}`, data);
  }

  error(message: string, data?: Record<string, unknown>) {
    const entry = this.createEntry("error", message, data);
    this.store(entry);
    console.error(`[ERROR] ${message}`, data);
  }

  getLogs(level?: LogLevel) {
    return level ? this.logs.filter((log) => log.level === level) : this.logs;
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem("app_logs");
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = new Logger();
