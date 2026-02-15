"use client";

import { useState, useEffect, useRef } from "react";
import {
  fetchLevelLeaderboard,
  fetchPlayerRuns,
  searchPlayers,
} from "../lib/score";
import { useAuth } from "../hooks";
import { signOut } from "../lib/auth";

type Tab = "level" | "profile" | "compare";

type LeaderboardEntry = {
  player_id: string;
  time_seconds: number;
  rating: string;
  players: { username: string } | { username: string }[] | null;
};

type PlayerRun = {
  level: number;
  time_seconds: number;
  rating: string;
  created_at: string;
};

type PlayerResult = {
  id: string;
  username: string;
};

const ratingColors: Record<string, string> = {
  s: "text-yellow-400",
  a: "text-green-400",
  b: "text-emerald-400",
  c: "text-blue-400",
  d: "text-zinc-300",
  e: "text-zinc-400",
  f: "text-red-400",
};

type LeaderboardProps = {
  onOpenAuth: () => void;
};

export default function Leaderboard({ onOpenAuth }: LeaderboardProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("level");
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [levelInput, setLevelInput] = useState("1");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerRuns, setPlayerRuns] = useState<PlayerRun[]>([]);
  const [loading, setLoading] = useState(false);

  // Compare state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlayerResult[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerResult | null>(
    null,
  );
  const [otherRuns, setOtherRuns] = useState<PlayerRun[]>([]);
  const [myRuns, setMyRuns] = useState<PlayerRun[]>([]);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (tab === "level") {
      setLoading(true);
      fetchLevelLeaderboard(selectedLevel)
        .then(setLeaderboard)
        .catch(() => setLeaderboard([]))
        .finally(() => setLoading(false));
    }
  }, [tab, selectedLevel]);

  useEffect(() => {
    if (tab === "profile" && user) {
      setLoading(true);
      fetchPlayerRuns(user.id)
        .then(setPlayerRuns)
        .catch(() => setPlayerRuns([]))
        .finally(() => setLoading(false));
    }
  }, [tab, user]);

  // Debounced search
  useEffect(() => {
    if (tab !== "compare" || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      searchPlayers(searchQuery)
        .then(setSearchResults)
        .catch(() => setSearchResults([]));
    }, 300);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [tab, searchQuery]);

  // Load both players' runs when a player is selected
  useEffect(() => {
    if (!selectedPlayer) return;

    setLoading(true);
    const promises = [fetchPlayerRuns(selectedPlayer.id)];
    if (user) promises.push(fetchPlayerRuns(user.id));

    Promise.all(promises)
      .then(([other, mine]) => {
        setOtherRuns(other);
        setMyRuns(mine ?? []);
      })
      .catch(() => {
        setOtherRuns([]);
        setMyRuns([]);
      })
      .finally(() => setLoading(false));
  }, [selectedPlayer, user]);

  // Build comparison data
  const comparisonLevels = () => {
    const allLevels = new Set([
      ...otherRuns.map((r) => r.level),
      ...myRuns.map((r) => r.level),
    ]);
    const sorted = [...allLevels].sort((a, b) => a - b);

    return sorted.map((level) => {
      const other = otherRuns.find((r) => r.level === level);
      const mine = myRuns.find((r) => r.level === level);
      return { level, other, mine };
    });
  };

  return (
    <div className="flex flex-col gap-4 p-2 min-h-[706px]">
      {/* Onglets */}
      <div className="flex gap-1.5 justify-center">
        {(["level", "profile", "compare"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              tab === t
                ? "bg-[#f3701e] text-white"
                : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
            }`}
          >
            {t === "level"
              ? "Par niveau"
              : t === "profile"
                ? "Mes scores"
                : "Comparer"}
          </button>
        ))}
      </div>

      {/* ===== PAR NIVEAU ===== */}
      {tab === "level" && (
        <>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setSelectedLevel((l) => {
                  const next = Math.max(1, l - 1);
                  setLevelInput(String(next));
                  return next;
                });
              }}
              className="text-zinc-400 hover:text-white text-lg px-2"
            >
              ◀
            </button>
            <div className="flex items-center gap-1.5 min-w-[100px] justify-center">
              <span className="text-white font-bold text-lg">Niveau</span>
              <input
                type="text"
                inputMode="numeric"
                value={levelInput}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "");
                  setLevelInput(v);
                }}
                onBlur={() => {
                  const n = parseInt(levelInput, 10);
                  if (isNaN(n) || n < 1) {
                    setSelectedLevel(1);
                    setLevelInput("1");
                  } else if (n > 100) {
                    setSelectedLevel(100);
                    setLevelInput("100");
                  } else {
                    setSelectedLevel(n);
                    setLevelInput(String(n));
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                className="bg-transparent text-white font-bold text-lg w-10 text-center outline-none border-b border-zinc-600 focus:border-[#f3701e] transition-colors"
              />
            </div>
            <button
              onClick={() => {
                setSelectedLevel((l) => {
                  const next = Math.min(100, l + 1);
                  setLevelInput(String(next));
                  return next;
                });
              }}
              className="text-zinc-400 hover:text-white text-lg px-2"
            >
              ▶
            </button>
          </div>

          {loading ? (
            <p className="text-zinc-500 text-center text-sm py-4">
              Chargement...
            </p>
          ) : leaderboard.length === 0 ? (
            <p className="text-zinc-500 text-center text-sm py-4">
              Aucun score pour ce niveau
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {leaderboard.map((entry, i) => (
                <div
                  key={entry.player_id}
                  className="flex items-center justify-between bg-zinc-900/50 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500 text-sm w-6 text-right">
                      {i + 1}.
                    </span>
                    <span className="text-white text-sm">
                      {Array.isArray(entry.players)
                        ? (entry.players[0]?.username ?? "???")
                        : (entry.players?.username ?? "???")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-bold ${ratingColors[entry.rating] ?? "text-zinc-300"}`}
                    >
                      {entry.rating.toUpperCase()}
                    </span>
                    <span className="text-zinc-300 text-sm font-mono">
                      {entry.time_seconds}s
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!user && (
            <div className="sticky bottom-0 pt-3 pb-1 bg-linear-to-t from-zinc-800 via-zinc-800 to-transparent">
              <button
                onClick={onOpenAuth}
                className="w-full bg-zinc-700 text-zinc-300 font-medium rounded-lg px-4 py-2.5 text-sm hover:bg-zinc-600 hover:text-white transition-colors"
              >
                Se connecter
              </button>
            </div>
          )}
        </>
      )}

      {/* ===== MES SCORES ===== */}
      {tab === "profile" && (
        <>
          {!user ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <p className="text-zinc-400 text-sm text-center">
                Pour sauvegarder vos parties, veuillez créer un compte ou vous
                connecter.
              </p>
              <button
                onClick={onOpenAuth}
                className="bg-[#f3701e] text-white font-bold rounded-lg px-5 py-2.5 text-sm hover:bg-[#e0631a] transition-colors"
              >
                Se connecter / S&apos;inscrire
              </button>
            </div>
          ) : loading ? (
            <p className="text-zinc-500 text-center text-sm py-4">
              Chargement...
            </p>
          ) : playerRuns.length === 0 ? (
            <p className="text-zinc-500 text-center text-sm py-4">
              Aucun score sauvegardé
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {playerRuns.map((run) => (
                <div
                  key={run.level}
                  className="flex items-center justify-between bg-zinc-900/50 rounded-lg px-3 py-2"
                >
                  <span className="text-white text-sm">Niveau {run.level}</span>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-bold ${ratingColors[run.rating] ?? "text-zinc-300"}`}
                    >
                      {run.rating.toUpperCase()}
                    </span>
                    <span className="text-zinc-300 text-sm font-mono">
                      {run.time_seconds}s
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {user && (
            <div className="mt-auto pt-4 flex items-center justify-between">
              <span className="text-zinc-500 text-xs truncate">
                {user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="text-zinc-500 text-xs hover:text-white transition-colors"
              >
                Déconnexion
              </button>
            </div>
          )}
        </>
      )}

      {/* ===== COMPARER ===== */}
      {tab === "compare" && (
        <>
          {!user && (
            <div className="flex flex-col items-center gap-3 py-4">
              <p className="text-zinc-400 text-sm text-center">
                Pour sauvegarder vos parties et comparer vos scores, veuillez
                créer un compte ou vous connecter.
              </p>
              <button
                onClick={onOpenAuth}
                className="bg-[#f3701e] text-white font-bold rounded-lg px-5 py-2.5 text-sm hover:bg-[#e0631a] transition-colors"
              >
                Se connecter / S&apos;inscrire
              </button>
            </div>
          )}

          {/* Barre de recherche */}
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un joueur..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedPlayer(null);
              }}
              className="w-full bg-zinc-900 text-white rounded-lg px-4 py-2.5 text-sm border border-zinc-600 focus:border-[#f3701e] focus:outline-none"
            />

            {/* Résultats de recherche (dropdown) */}
            {searchResults.length > 0 && !selectedPlayer && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-600 rounded-lg overflow-hidden z-10">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPlayer(p);
                      setSearchQuery(p.username);
                      setSearchResults([]);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-zinc-700 transition-colors"
                  >
                    {p.username}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vue comparaison */}
          {selectedPlayer && !loading && (
            <>
              {/* En-tête des colonnes */}
              <div className="flex items-center justify-between px-3 pb-1">
                <span className="text-zinc-500 text-xs w-16">Niveau</span>
                <span className="text-[#f3701e] text-xs font-medium flex-1 text-center">
                  {selectedPlayer.username}
                </span>
                <span className="text-blue-400 text-xs font-medium flex-1 text-center">
                  {user ? "Moi" : "—"}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                {comparisonLevels().map(({ level, other, mine }) => (
                  <div
                    key={level}
                    className="flex items-center justify-between bg-zinc-900/50 rounded-lg px-3 py-2"
                  >
                    <span className="text-zinc-400 text-sm w-16">{level}</span>

                    {/* Score de l'autre joueur */}
                    <div className="flex-1 flex items-center justify-center gap-2">
                      {other ? (
                        <>
                          <span
                            className={`text-xs font-bold ${ratingColors[other.rating] ?? "text-zinc-300"}`}
                          >
                            {other.rating.toUpperCase()}
                          </span>
                          <span className="text-zinc-300 text-xs font-mono">
                            {other.time_seconds}s
                          </span>
                        </>
                      ) : (
                        <span className="text-zinc-600 text-xs">—</span>
                      )}
                    </div>

                    {/* Mon score */}
                    <div className="flex-1 flex items-center justify-center gap-2">
                      {mine ? (
                        <>
                          <span
                            className={`text-xs font-bold ${ratingColors[mine.rating] ?? "text-zinc-300"}`}
                          >
                            {mine.rating.toUpperCase()}
                          </span>
                          <span className="text-zinc-300 text-xs font-mono">
                            {mine.time_seconds}s
                          </span>
                        </>
                      ) : (
                        <span className="text-zinc-600 text-xs">—</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {comparisonLevels().length === 0 && (
                <p className="text-zinc-500 text-center text-sm py-4">
                  Aucun score à comparer
                </p>
              )}
            </>
          )}

          {selectedPlayer && loading && (
            <p className="text-zinc-500 text-center text-sm py-4">
              Chargement...
            </p>
          )}

          {!selectedPlayer && searchQuery.length < 2 && (
            <p className="text-zinc-500 text-center text-sm py-4">
              Tape un pseudo pour rechercher
            </p>
          )}
        </>
      )}
    </div>
  );
}
