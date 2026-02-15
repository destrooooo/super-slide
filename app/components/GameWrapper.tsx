"use client";

import { useState, useCallback } from "react";
import GameContainer from "./GameContainer";
import ChallengeToast from "./ChallengeToast";
import AuthModal from "./AuthModal";
import Leaderboard from "./Leaderboard";
import { useAuth } from "../hooks";
import { upsertRun } from "../lib/run";
import { savePendingRun, clearPendingRun } from "../lib/pendingRun";
import type { PendingRun } from "../lib/pendingRun";
import type { Rating } from "../types/game";

const MAX_TOASTS = 3;

type GameWrapperProps = {
  activeTab: "game" | "leaderboard";
};

export default function GameWrapper({ activeTab }: GameWrapperProps) {
  const { user } = useAuth();
  const [pendingRuns, setPendingRuns] = useState<PendingRun[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRun, setAuthRun] = useState<PendingRun | null>(null);

  const handleChallengeEnd = useCallback((run: PendingRun) => {
    setPendingRuns((prev) => {
      const next = [run, ...prev];
      return next.slice(0, MAX_TOASTS);
    });
  }, []);

  const handleSave = async (run: PendingRun) => {
    if (!user) {
      savePendingRun(run);
      setAuthRun(run);
      setShowAuthModal(true);
      return { needsAuth: true as const };
    }

    const result = await upsertRun(run.level, run.time, run.rating);
    return result;
  };

  const handleClose = (run: PendingRun) => {
    setPendingRuns((prev) =>
      prev.filter((r) => r.createdAt !== run.createdAt),
    );
  };

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);

    if (authRun) {
      try {
        await upsertRun(authRun.level, authRun.time, authRun.rating);
        clearPendingRun();
      } catch {
        // Le run reste dans localStorage pour retry
      }
      handleClose(authRun);
      setAuthRun(null);
    }
  };

  return (
    <>
      {activeTab === "game" ? (
        <GameContainer initialLevel={1} onChallengeEnd={handleChallengeEnd} />
      ) : (
        <Leaderboard onOpenAuth={() => setShowAuthModal(true)} />
      )}

      {pendingRuns.map((run, i) => (
        <ChallengeToast
          key={run.createdAt}
          level={run.level}
          rating={run.rating as Rating}
          time={run.time}
          index={i}
          onSave={() => handleSave(run)}
          onClose={() => handleClose(run)}
        />
      ))}

      {showAuthModal && (
        <AuthModal
          onClose={() => {
            setShowAuthModal(false);
            setAuthRun(null);
          }}
          onSuccess={handleAuthSuccess}
        />
      )}
    </>
  );
}
