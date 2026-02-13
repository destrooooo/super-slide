import { useEffect } from "react";
import type { Dispatch } from "react";
import type { GameState } from "./useGameReducer";
import type { GameAction } from "../types/actions";

/**
 * Hook pour gérer le timeout de l'écran de score
 *
 * Remplace l'effet des lignes 212-228 du code original
 * qui faisait 10 setState en séquence
 *
 * Avantages :
 * - Une seule action RESET_GAME au lieu de 10 setState
 * - Reset atomique de tous les états nécessaires
 * - Plus performant (1 seul re-render au lieu de 10)
 */
export function useScoreTimeout(
  state: GameState,
  dispatch: Dispatch<GameAction>
): void {
  useEffect(() => {
    // Ne lance le timeout que si on est sur l'écran de score
    if (state.screenState !== "score") {
      return;
    }

    const timeout = setTimeout(() => {
      // Une seule action dispatch pour tout réinitialiser
      dispatch({ type: "RESET_GAME" });
    }, 3000);

    return () => clearTimeout(timeout);
  }, [state.screenState, dispatch]);
}
