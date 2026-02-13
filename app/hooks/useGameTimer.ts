import { useEffect } from "react";
import type { Dispatch } from "react";
import type { GameState } from "./useGameReducer";
import type { GameAction } from "../types/actions";

/**
 * Hook pour gérer le timer du jeu en mode challenge
 *
 * Remplace l'effet complexe des lignes 231-259 du code original
 * qui avait le problème de setState imbriqués
 *
 * Avantages :
 * - Une seule action TIMER_TICK au lieu de 3-4 setState
 * - Le reducer gère atomiquement : timer + LEDs + condition de défaite
 * - Plus de setState dans setState
 * - Plus simple à tester
 */
export function useGameTimer(
  state: GameState,
  dispatch: Dispatch<GameAction>
): void {
  useEffect(() => {
    // Ne démarre le timer que si on est en mode "timer" et que le jeu n'est pas terminé
    if (state.screenState !== "timer" || state.isWin || state.isLose) {
      return;
    }

    const interval = setInterval(() => {
      // Une seule action dispatch
      // Le reducer s'occupe de tout : timer + LEDs + défaite
      dispatch({ type: "TIMER_TICK" });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.screenState, state.isWin, state.isLose, dispatch]);
}
