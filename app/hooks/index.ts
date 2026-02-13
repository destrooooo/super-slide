/**
 * Point d'entrée centralisé pour tous les hooks custom du jeu
 */

export { gameReducer, createInitialGameState } from "./useGameReducer";
export type { GameState } from "./useGameReducer";

export { useGameTimer } from "./useGameTimer";
export { useVictoryAnimation } from "./useVictoryAnimation";
export { useScoreTimeout } from "./useScoreTimeout";
export { useLevelNumberAnimation } from "./useLevelNumberAnimation";
