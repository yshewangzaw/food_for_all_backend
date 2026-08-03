const { randomUUID } = require("crypto");

/**
 * Minimal async job runner.
 *
 * Every job returns a runId immediately and executes in the background —
 * nothing here should run inside an HTTP request timeout. A qualification
 * close over 50k members will not finish in 30 seconds.
 *
 * Runs are held in memory. That is fine for a single process; if you move
 * to PM2 cluster mode or multiple servers, back this with a `job_runs`
 * table instead or a run started on one worker will be invisible to the
 * status endpoint on another.
 */
const runs = new Map();
const MAX_RUNS_KEPT = 200;

const registry = {};

const jobRunner = {
  register(name, handler, { description = "" } = {}) {
    registry[name] = { name, handler, description };
  },

  list() {
    return Object.values(registry).map((j) => {
      const last = [...runs.values()]
        .filter((r) => r.jobName === j.name)
        .sort((a, b) => b.startedAt - a.startedAt)[0];

      return {
        name: j.name,
        description: j.description,
        lastRun: last
          ? {
              runId: last.runId,
              status: last.status,
              startedAt: last.startedAt,
              finishedAt: last.finishedAt,
            }
          : null,
      };
    });
  },

  start(jobName, params = {}, triggeredBy = null) {
    const job = registry[jobName];
    if (!job) throw new Error(`Unknown job: ${jobName}`);

    const runId = randomUUID();
    const run = {
      runId,
      jobName,
      status: "RUNNING",
      params,
      triggeredBy,
      startedAt: new Date(),
      finishedAt: null,
      result: null,
      error: null,
      cancelled: false,
      progress: { processed: 0, total: null, message: "starting" },
    };
    runs.set(runId, run);

    // trim history
    if (runs.size > MAX_RUNS_KEPT) {
      const oldest = [...runs.values()].sort(
        (a, b) => a.startedAt - b.startedAt,
      )[0];
      runs.delete(oldest.runId);
    }

    const ctx = {
      runId,
      isCancelled: () => run.cancelled,
      progress: (processed, total, message) => {
        run.progress = { processed, total, message: message || run.progress.message };
      },
    };

    // deliberately not awaited — the HTTP handler returns immediately
    Promise.resolve()
      .then(() => job.handler(params, ctx))
      .then((result) => {
        run.status = run.cancelled ? "CANCELLED" : "COMPLETED";
        run.result = result;
        run.finishedAt = new Date();
      })
      .catch((error) => {
        run.status = "FAILED";
        run.error = error.message;
        run.finishedAt = new Date();
        console.error(`[job ${jobName}] failed:`, error);
      });

    return { runId, jobName, status: "RUNNING", startedAt: run.startedAt };
  },

  status(runId) {
    const run = runs.get(runId);
    if (!run) throw new Error("Run not found — it may have aged out of history");
    return {
      runId: run.runId,
      jobName: run.jobName,
      status: run.status,
      params: run.params,
      triggeredBy: run.triggeredBy,
      startedAt: run.startedAt,
      finishedAt: run.finishedAt,
      durationMs: run.finishedAt ? run.finishedAt - run.startedAt : null,
      progress: run.progress,
      result: run.result,
      error: run.error,
    };
  },

  history({ jobName, from, limit = 50 } = {}) {
    return [...runs.values()]
      .filter((r) => (!jobName || r.jobName === jobName))
      .filter((r) => (!from || r.startedAt >= new Date(from)))
      .sort((a, b) => b.startedAt - a.startedAt)
      .slice(0, Number(limit))
      .map((r) => ({
        runId: r.runId,
        jobName: r.jobName,
        status: r.status,
        startedAt: r.startedAt,
        finishedAt: r.finishedAt,
        error: r.error,
      }));
  },

  cancel(runId) {
    const run = runs.get(runId);
    if (!run) throw new Error("Run not found");
    if (run.status !== "RUNNING") {
      throw new Error(`Cannot cancel a run with status ${run.status}`);
    }
    run.cancelled = true;
    return { runId, cancelled: true };
  },
};

module.exports = jobRunner;