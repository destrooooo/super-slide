import { supabase } from "./client";
import { clearPendingRun, loadPendingRun } from "./pendingRun";
import { upsertRun } from "./run";

export async function publishPendingRun() {
  const run = loadPendingRun();
  if (!run) throw new Error("No pending run");

  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error("NOT_AUTHENTICATED");

  const result = await upsertRun(run.level, run.time, run.rating);
  clearPendingRun();

  return { run, ...result };
}
