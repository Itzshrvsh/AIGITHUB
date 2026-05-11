type JobStatus = "idle" | "fetching" | "ast_analyzing" | "llm_analyzing" | "embedding" | "completed" | "error";

interface ActiveJob {
  repoName: string;
  status: JobStatus;
  message: string;
  timestamp: number;
}

class StatusTracker {
  private jobs: Map<string, ActiveJob> = new Map();
  private logs: string[] = [];

  updateJob(repoName: string, status: JobStatus, message: string) {
    this.jobs.set(repoName, { repoName, status, message, timestamp: Date.now() });
    this.addLog(`[${status.toUpperCase()}] ${repoName}: ${message}`);
    
    if (status === "completed" || status === "error") {
      setTimeout(() => this.jobs.delete(repoName), 5000); // Clear after 5s
    }
  }

  addLog(message: string) {
    this.logs.unshift(`${new Date().toLocaleTimeString()} - ${message}`);
    if (this.logs.length > 50) this.logs.pop();
  }

  getActiveJobs() {
    return Array.from(this.jobs.values());
  }

  getLogs() {
    return this.logs;
  }
}

// Global singleton
export const statusTracker = new StatusTracker();
