import { supabase } from "./client";

type UpsertRunResult = {
  saved: boolean;
  previous_time: number | null;
};

export async function upsertRun(
  level: number,
  time: number,
  rating: string,
): Promise<UpsertRunResult> {
  const { data, error } = await supabase.rpc("upsert_run", {
    p_level: level,
    p_time: time,
    p_rating: rating,
  });

  if (error) throw error;
  return data as UpsertRunResult;
}
