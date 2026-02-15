import { supabase } from "./client";

export async function fetchLevelLeaderboard(level: number, limit = 20) {
  const { data, error } = await supabase
    .from("runs")
    .select("player_id, time_seconds, rating, players(username)")
    .eq("level", level)
    .order("time_seconds", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function fetchPlayerRuns(playerId: string) {
  const { data, error } = await supabase
    .from("runs")
    .select("level, time_seconds, rating, created_at")
    .eq("player_id", playerId)
    .order("level", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function searchPlayers(query: string) {
  const { data, error } = await supabase
    .from("players")
    .select("id, username")
    .ilike("username", `%${query}%`)
    .limit(10);

  if (error) throw error;
  return data ?? [];
}
