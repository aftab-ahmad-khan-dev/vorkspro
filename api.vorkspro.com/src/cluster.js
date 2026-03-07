/**
 * Optional cluster mode: run multiple API workers on the same port (Node built-in, no paid pkg).
 * Use when ENABLE_CLUSTER=1. For Socket.IO across workers you may need Redis adapter later.
 */
import cluster from "cluster";
import os from "os";

const numWorkers = parseInt(process.env.CLUSTER_WORKERS || "0", 10) || Math.max(1, os.cpus().length - 1);

if (cluster.isPrimary) {
  console.log(`[Cluster] Primary ${process.pid}, spawning ${numWorkers} workers`);
  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code) => {
    console.log(`[Cluster] Worker ${worker.process.pid} exited (${code}), restarting`);
    cluster.fork();
  });
} else {
  process.env.RUN_AS_WORKER = "1";
  const { startServer } = await import("./index.js");
  await startServer();
}
