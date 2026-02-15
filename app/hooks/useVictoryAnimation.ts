import { useEffect } from "react";
import type { Dispatch } from "react";
import type { GameState } from "./useGameReducer";
import type { GameAction } from "../types/actions";

const CYCLES_TO_PLAY = 2;

/**
 * Hook pour gérer l'animation de victoire
 */
export function useVictoryAnimation(
  state: GameState,
  dispatch: Dispatch<GameAction>,
): void {
  useEffect(() => {
    // Ne lance l'animation que si on est sur l'écran de victoire
    // et que l'animation n'est pas terminée
    if (
      state.screenState !== "victory" ||
      state.animationCycle >= CYCLES_TO_PLAY
    ) {
      return;
    }

    const interval = setInterval(() => {
      dispatch({ type: "ANIMATION_TICK" });
    }, 250);

    return () => clearInterval(interval);
  }, [state.screenState, state.animationCycle, dispatch]);
}
