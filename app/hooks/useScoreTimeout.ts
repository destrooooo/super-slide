import { useEffect } from "react";
import type { Dispatch } from "react";
import type { GameState } from "./useGameReducer";
import type { GameAction } from "../types/actions";

/**
 * Hook pour gérer le timeout de l'écran de score
 */
export function useScoreTimeout(
  state: GameState,
  dispatch: Dispatch<GameAction>,
): void {
  useEffect(() => {
    // Ne lance le timeout que si on est sur l'écran de score
    if (state.screenState !== "score") {
      return;
    }

    const timeout = setTimeout(() => {
      // Dispatch RESET_CHALLENGE si on est en mode challenge
      // Sinon dispatch RESET_GAME (comportement normal)
      if (state.isChallengeMode) {
        dispatch({ type: "RESET_CHALLENGE" });
      } else {
        dispatch({ type: "RESET_GAME" });
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [state.screenState, state.isChallengeMode, dispatch]);
}
