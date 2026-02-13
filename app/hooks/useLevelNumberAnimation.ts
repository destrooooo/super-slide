import { useEffect } from "react";
import type { Dispatch } from "react";
import type { GameState } from "./useGameReducer";
import type { GameAction } from "../types/actions";

/**
 * Hook pour gérer l'animation du numéro de niveau
 * Dispatch LEVEL_NUMBER_TICK toutes les 150ms
 */
export function useLevelNumberAnimation(
  state: GameState,
  dispatch: Dispatch<GameAction>,
): void {
  useEffect(() => {
    // Ne lance l'animation que si on est sur l'écran level-number
    if (state.screenState !== "level-number") {
      return;
    }

    const interval = setInterval(() => {
      dispatch({ type: "LEVEL_NUMBER_TICK" });
    }, 300);

    return () => clearInterval(interval);
  }, [state.screenState, dispatch]);
}
