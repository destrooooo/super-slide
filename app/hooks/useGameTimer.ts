import { useEffect } from "react";
import type { Dispatch } from "react";
import type { GameState } from "./useGameReducer";
import type { GameAction } from "../types/actions";

/**
 * Hook pour gérer le timer du jeu en mode challenge
 */
export function useGameTimer(
  state: GameState,
  dispatch: Dispatch<GameAction>,
): void {
  useEffect(() => {
    // Ne démarre le timer que si on est en mode "timer" et que le jeu n'est pas terminé
    if (state.screenState !== "timer" || state.isWin) {
      return;
    }

    const interval = setInterval(() => {
      dispatch({ type: "TIMER_TICK" });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.screenState, state.isWin, dispatch]);
}
