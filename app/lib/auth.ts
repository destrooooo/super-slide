import { supabase } from "./client";

export async function signUp(
  email: string,
  password: string,
  username: string,
) {
  // Stocke le username en metadata pour le récupérer au premier login
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  });
  if (error) throw error;

  const user = data.user;
  if (!user) throw new Error("No user returned");

  // Si la session existe immédiatement (pas de confirmation email),
  // on crée la ligne players tout de suite
  if (data.session) {
    await ensurePlayerExists(user.id, username);
  }

  return user;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;

  // Au premier login après confirmation, crée la ligne players si elle n'existe pas
  const username = data.user.user_metadata?.username;
  if (username) {
    await ensurePlayerExists(data.user.id, username);
  }

  return data.user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

async function ensurePlayerExists(userId: string, username: string) {
  const { data } = await supabase
    .from("players")
    .select("id")
    .eq("id", userId)
    .single();

  if (!data) {
    const { error } = await supabase.from("players").insert({
      id: userId,
      username,
    });
    if (error && error.code !== "23505") throw error; // ignore duplicate
  }
}
