import type { Piece, ScreenState, Rating } from "../types/game";
import type { GameAction } from "../types/actions";
import { generateLevelNumberFrames } from "../utils/level-animation";

const CYCLES_TO_PLAY = 2;

/**
 * État complet du jeu
 * Consolide tous les états précédemment gérés par useState
 */
export interface GameState {
  isMounted: boolean;
  levelNum: number;
  pieces: Piece[];
  screenState: ScreenState;
  isChallengeMode: boolean;
  isWin: boolean;
  isLose: boolean;
  gameTimer: number;
  timerLeds: boolean[];
  countdownValue: number | null;
  finalRating: Rating | null;
  animationIndex: number;
  animationCycle: number;
  cellSize: { width: number; height: number };
  shakeId: number | null;
  shakeDirection: "x" | "y" | null;
  pressTimer: NodeJS.Timeout | null;
  isHolding: boolean;
  levelNumberFrames: string[][];
}

/**
 * Reducer principal du jeu
 * Gère toutes les transitions d'état de manière atomique
 *
 * Avantages :
 * - Élimine les setState imbriqués
 * - Réduit les re-renders en cascade
 * - Rend les transitions d'état explicites
 * - Facilite le debugging
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "MOUNT":
      // Fix ligne 28 : plus de setState dans effet
      return {
        ...state,
        isMounted: true,
        screenState: "level-number",
        animationIndex: 0,
      };

    case "SET_LEVEL":
      return {
        ...state,
        levelNum: action.level,
        isWin: false, // Reset victoire au changement de niveau
        levelNumberFrames: generateLevelNumberFrames(action.level),
        screenState: "level-number",
        animationIndex: 0,
      };

    case "START_CHALLENGE":
      return {
        ...state,
        isChallengeMode: true,
      };

    case "SET_CHALLENGE_INTRO":
      return {
        ...state,
        screenState: "challenge-intro",
      };

    case "START_COUNTDOWN":
      return {
        ...state,
        screenState: "countdown",
        countdownValue: 1,
      };

    case "COUNTDOWN_TICK":
      return {
        ...state,
        countdownValue: action.value,
      };

    case "START_TIMER":
      return {
        ...state,
        screenState: "timer",
        gameTimer: 0,
        animationCycle: 0,
        timerLeds: Array(20).fill(true),
        finalRating: null,
      };

    case "TIMER_TICK": {
      // Fix lignes 244, 249-250 : toutes les mises à jour atomiques
      const newTime = state.gameTimer + 1;
      const ledsOff = Math.floor(newTime / 3);
      const hasLost = newTime >= 60;

      return {
        ...state,
        gameTimer: newTime,
        timerLeds:
          ledsOff < 20
            ? Array(20).fill(false).fill(true, ledsOff)
            : state.timerLeds,
        isLose: hasLost,
        finalRating: hasLost ? "f" : state.finalRating,
        screenState: hasLost ? "score" : state.screenState,
      };
    }

    case "MOVE_PIECE":
      return {
        ...state,
        pieces: action.pieces,
        // isWin: false,
      };

    case "RESET_PIECES":
      return {
        ...state,
        pieces: action.pieces,
        isWin: false,
        animationCycle: 0,
        animationIndex: 0,
      };

    case "WIN_GAME": {
      // Fix ligne 158 : transition de victoire atomique
      // Plus besoin d'un useEffect qui écoute isWin
      return {
        ...state,
        pieces: action.pieces,
        isWin: true,
        finalRating: action.rating || state.finalRating,
        screenState: "victory",
      };
    }

    case "LOSE_GAME":
      return {
        ...state,
        isLose: true,
        screenState: "score",
        finalRating: "f",
      };

    case "LEVEL_NUMBER_TICK": {
      const nextIndex = state.animationIndex + 1;

      if (nextIndex >= state.levelNumberFrames.length) {
        return {
          ...state,
          animationIndex: 0,
          screenState: "level-preview",
        };
      } else {
        return {
          ...state,
          animationIndex: nextIndex,
        };
      }
    }

    case "ANIMATION_TICK": {
      // Fix lignes 170-209 : cycle + index + transition en une seule action
      // Plus d'effets en cascade !
      const nextIndex = (state.animationIndex + 1) % 10;
      const nextCycle =
        nextIndex === 0 ? state.animationCycle + 1 : state.animationCycle;

      // Si animation terminée, transition automatique
      if (nextCycle >= CYCLES_TO_PLAY) {
        if (state.isChallengeMode) {
          // Mode challenge : vers l'écran de score
          return {
            ...state,
            animationIndex: nextIndex,
            animationCycle: nextCycle,
            screenState: "score",
          };
        } else {
          // Mode normal : retour au level preview du niveau suivant
          const nextLevel = state.levelNum + 1;
          const hasNextLevel = nextLevel <= 100; // Il y a 100 niveaux au total

          return {
            ...state,
            animationIndex: 0,
            animationCycle: 0,
            // isWin reste true jusqu'au reset/changement de niveau
            levelNum: hasNextLevel ? nextLevel : state.levelNum,
            levelNumberFrames: hasNextLevel
              ? generateLevelNumberFrames(nextLevel)
              : state.levelNumberFrames,
            screenState: "level-number",
          };
        }
      }

      return {
        ...state,
        animationIndex: nextIndex,
        animationCycle: nextCycle,
      };
    }

    case "RESET_GAME":
      // Remplace le timeout avec 10 setState (lignes 212-228)
      return {
        ...state,
        screenState: "level-preview",
        isChallengeMode: false,
        isWin: false,
        isLose: false,
        animationCycle: 0,
        animationIndex: 0,
        finalRating: null,
        gameTimer: 0,
        timerLeds: Array(20).fill(true),
      };

    case "SHAKE_PIECE":
      return {
        ...state,
        shakeId: action.id,
        shakeDirection: action.direction,
      };

    case "CLEAR_SHAKE":
      return {
        ...state,
        shakeId: null,
        shakeDirection: null,
      };

    case "SET_CELL_SIZE":
      return {
        ...state,
        cellSize: {
          width: action.width,
          height: action.height,
        },
      };

    case "STOP_CHALLENGE_MODE":
      return {
        ...state,
        isChallengeMode: false,
      };

    case "SET_PRESS_TIMER":
      return {
        ...state,
        pressTimer: action.timer,
      };

    case "SET_HOLDING":
      return {
        ...state,
        isHolding: action.isHolding,
      };

    default:
      return state;
  }
}

/**
 * Crée l'état initial du jeu
 */
export function createInitialGameState(
  initialLevel: number,
  initialPieces: Piece[],
): GameState {
  return {
    isMounted: false,
    levelNum: initialLevel,
    pieces: initialPieces,
    screenState: "level-preview",
    isChallengeMode: false,
    isWin: false,
    isLose: false,
    gameTimer: 0,
    timerLeds: Array(20).fill(true),
    countdownValue: null,
    finalRating: null,
    animationIndex: 0,
    animationCycle: 0,
    cellSize: { width: 100, height: 100 },
    shakeId: null,
    shakeDirection: null,
    pressTimer: null,
    isHolding: false,
    levelNumberFrames: generateLevelNumberFrames(initialLevel),
  };
}
