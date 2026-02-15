import { useEffect, useRef } from "react";
import type { GameState } from "@/app/hooks/useGameReducer";
import type { PendingRun } from "@/app/lib/pendingRun";

export function useCaptureChallengeResult(
  state: GameState,
  onCaptured?: (run: PendingRun) => void,
) {
  const capturedOnce = useRef(false);

  useEffect(() => {
    const isEndScreen = state.isChallengeMode && state.screenState === "score";

    if (!isEndScreen) {
      capturedOnce.current = false;
      return;
    }

    if (capturedOnce.current) return;
    capturedOnce.current = true;

    const run: PendingRun = {
      level: state.levelNum,
      time: state.gameTimer,
      rating: String(state.finalRating ?? "f"),
      createdAt: Date.now(),
    };

    onCaptured?.(run);
  }, [
    state.isChallengeMode,
    state.screenState,
    state.levelNum,
    state.gameTimer,
    state.finalRating,
    onCaptured,
  ]);
}
