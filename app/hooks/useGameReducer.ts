import type { Piece, ScreenState, Rating, TimerColor } from "../types/game";
import type { GameAction } from "../types/actions";
import { generateLevelNumberFrames } from "../utils/level-animation";
import levelsData from "../data/levels.json";
import { devLog } from "../utils/devLog";

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
  gameTimer: number;
  timerLeds: boolean[];
  timerColor: TimerColor;
  countdownValue: number | null;
  finalRating: Rating | null;
  animationIndex: number;
  animationCycle: number;
  cellSize: { width: number; height: number };
  shakeId: number | null;
  shakeDirection: "x" | "y" | null;
  isHolding: boolean;
  levelNumberFrames: string[][];
}

/**
 * Reducer principal du jeu
 * Gère toutes les transitions d'état de manière atomique
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  devLog(
    `🟡 Action: ${action.type} | screenState actuel: ${state.screenState}`,
  );
  switch (action.type) {
    case "MOUNT":
      devLog("🔵 MOUNT -> screenState: level-number");
      return {
        ...state,
        isMounted: true,
        screenState: "level-number",
        animationIndex: 0,
      };

    case "SET_LEVEL":
      devLog("🔵 SET_LEVEL -> screenState: level-number");
      return {
        ...state,
        levelNum: action.level,
        isWin: false,
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
      devLog("🔵 SET_CHALLENGE_INTRO -> screenState: challenge-intro");
      return {
        ...state,
        screenState: "challenge-intro",
      };

    case "START_COUNTDOWN":
      devLog("🔵 START_COUNTDOWN -> screenState: countdown");
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
      devLog("🔵 START_TIMER -> screenState: timer");
      return {
        ...state,
        timerColor: "#324E44",
        screenState: "timer",
        gameTimer: 0,
        animationCycle: 0,
        timerLeds: Array(20).fill(true),
        finalRating: null,
      };

    case "TIMER_TICK": {
      const newTime = state.gameTimer + 1;
      const ledsOff =
        newTime <= 20
          ? Math.floor(newTime)
          : newTime <= 40
            ? Math.floor(newTime - 20)
            : newTime <= 60
              ? Math.floor(newTime - 40)
              : 20;
      const timerColor =
        newTime <= 20 ? "#324E44" : newTime <= 40 ? "#e8d8c9" : "#f3701e";

      return {
        ...state,
        gameTimer: newTime,
        timerLeds: Array(20).fill(false).fill(true, ledsOff),
        timerColor,
      };
    }

    case "MOVE_PIECE":
      return {
        ...state,
        pieces: action.pieces,
      };

    case "RESET_PIECES":
      devLog("🔵 RESET_PIECES -> screenState: level-preview");
      return {
        ...state,
        pieces: action.pieces,
        isWin: false,
        animationCycle: 0,
        animationIndex: 0,
        screenState: "level-preview",
      };

    case "WIN_GAME": {
      devLog("🔵 WIN_GAME -> screenState: victory");
      return {
        ...state,
        pieces: action.pieces,
        isWin: true,
        finalRating: action.rating || state.finalRating,
        screenState: "victory",
      };
    }

    case "LEVEL_NUMBER_TICK": {
      const nextIndex = state.animationIndex + 1;

      if (nextIndex >= state.levelNumberFrames.length) {
        devLog(
          "🔵 LEVEL_NUMBER_TICK -> screenState: level-preview (animation terminée)",
        );
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
      const nextIndex = (state.animationIndex + 1) % 10;
      const nextCycle =
        nextIndex === 0 ? state.animationCycle + 1 : state.animationCycle;

      if (nextCycle >= CYCLES_TO_PLAY) {
        if (state.isChallengeMode) {
          devLog("🔵 ANIMATION_TICK -> screenState: score (challenge mode)");
          return {
            ...state,
            animationIndex: nextIndex,
            animationCycle: nextCycle,
            screenState: "score",
          };
        } else {
          const nextLevel = state.levelNum + 1;
          const hasNextLevel = nextLevel <= Object.keys(levelsData).length;

          devLog(
            "🔵 ANIMATION_TICK -> screenState: level-number (mode normal, niveau suivant)",
          );
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
      devLog("🔵 RESET_GAME -> screenState: level-preview");
      return {
        ...state,
        screenState: "level-preview",
        isChallengeMode: false,
        isWin: false,
        animationCycle: 0,
        animationIndex: 0,
        finalRating: null,
        timerColor: "#324E44",
        gameTimer: 0,
        timerLeds: Array(20).fill(true),
      };

    case "RESET_CHALLENGE":
      devLog(
        "🔵 RESET_CHALLENGE -> screenState: level-preview (challenge reste actif)",
      );
      return {
        ...state,
        screenState: "level-preview",
        // isChallengeMode reste true
        isWin: false,
        animationCycle: 0,
        timerColor: "#324E44",
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
    gameTimer: 0,
    timerLeds: Array(20).fill(true),
    countdownValue: null,
    finalRating: null,
    animationIndex: 0,
    animationCycle: 0,
    cellSize: { width: 100, height: 100 },
    shakeId: null,
    shakeDirection: null,
    isHolding: false,
    levelNumberFrames: generateLevelNumberFrames(initialLevel),
    timerColor: "#324E44",
  };
}
