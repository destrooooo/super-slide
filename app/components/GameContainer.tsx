"use client";

import { useReducer, useEffect, useRef } from "react";
import type { Piece } from "../types/game";
import {
  parseLevel,
  calculateDraggablePieces,
  calculateMaxMove,
  calculateNewGridArea,
  calculateRating,
} from "../utils/game-logic";
import LcdScreen from "./LcdScreen";
import GameGrid from "./GameGrid";
import ControlButtons from "./ControlButtons";
import levelsData from "../data/levels.json";
import {
  gameReducer,
  createInitialGameState,
  useGameTimer,
  useVictoryAnimation,
  useScoreTimeout,
  useLevelNumberAnimation,
} from "../hooks";
import { useCaptureChallengeResult } from "../hooks/useCaptureChallengeResult";
import type { PendingRun } from "../lib/pendingRun";
import { devLog } from "../utils/devLog";

type GameContainerProps = {
  initialLevel: number;
  onChallengeEnd?: (run: PendingRun) => void;
};

export default function GameContainer({
  initialLevel,
  onChallengeEnd,
}: GameContainerProps) {
  const levels = levelsData as Record<string, string[]>;

  const initGameState = () => {
    const raw =
      typeof window !== "undefined"
        ? window.localStorage.getItem("levelNum")
        : null;
    const saved = raw ? Number(raw) : NaN;

    const maxLevel = Object.keys(levels).length;
    const level = Number.isFinite(saved)
      ? Math.min(Math.max(1, saved), maxLevel)
      : initialLevel;

    const pieces = calculateDraggablePieces(
      parseLevel(levels[level.toString()]),
    );

    return createInitialGameState(level, pieces);
  };

  const rightHoldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const redHoldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = (ref: {
    current: ReturnType<typeof setTimeout> | null;
  }) => {
    if (ref.current) {
      clearTimeout(ref.current);
      ref.current = null;
    }
  };
  // Remplace 16 useState par 1 seul useReducer
  const [state, dispatch] = useReducer(gameReducer, null, initGameState);

  // Custom hooks remplacent les effets complexes
  useGameTimer(state, dispatch);
  useVictoryAnimation(state, dispatch);
  useScoreTimeout(state, dispatch);
  useLevelNumberAnimation(state, dispatch);
  useCaptureChallengeResult(state, onChallengeEnd);

  const gridRef = useRef<HTMLDivElement>(null);

  // Effet de montage - dispatch au lieu de setState
  useEffect(() => {
    dispatch({ type: "MOUNT" });
  }, []);

  // Auto-start après victoire en mode normal
  useEffect(() => {
    if (
      state.screenState === "level-preview" &&
      state.isWin &&
      !state.isChallengeMode
    ) {
      const newPieces = calculateDraggablePieces(
        parseLevel(levels[state.levelNum.toString()]),
      );
      dispatch({ type: "RESET_PIECES", pieces: newPieces });
    }
  }, [
    state.screenState,
    state.isWin,
    state.isChallengeMode,
    state.levelNum,
    levels,
  ]);

  // Recalcule la taille des cellules au mount ET au resize
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      dispatch({
        type: "SET_CELL_SIZE",
        width: rect.width / 4,
        height: rect.height / 5,
      });
    });

    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  const handleDragEnd = (
    piece: Piece,
    info: { offset: { x: number; y: number } },
  ) => {
    devLog(info);
    const direction =
      Math.abs(info.offset.x) > Math.abs(info.offset.y) ? "x" : "y";

    if (piece.draggable.x === 0 && piece.draggable.y === 0) {
      dispatch({ type: "SHAKE_PIECE", id: piece.id, direction });
      setTimeout(() => {
        dispatch({ type: "CLEAR_SHAKE" });
      }, 400);
      return;
    }
    const sign =
      direction === "x"
        ? info.offset.x > 0
          ? "+"
          : "-"
        : info.offset.y > 0
          ? "+"
          : "-";

    devLog(`Direction: ${direction}, Signe: ${sign}`);

    const maxMove = calculateMaxMove(piece, state.pieces, direction, sign);
    devLog(`Direction: ${direction}${sign}, Max move: ${maxMove} cases`);
    const dragDistance = Math.abs(
      direction === "x" ? info.offset.x : info.offset.y,
    );
    const cellDimension =
      direction === "x" ? state.cellSize.width : state.cellSize.height;

    devLog(dragDistance);
    const intendedCells =
      dragDistance < cellDimension * 0.05
        ? 0
        : dragDistance > cellDimension * 1.3
          ? 2
          : 1;

    const actualMove = Math.min(intendedCells, maxMove);
    devLog("actual move", actualMove);

    if (intendedCells > 0 && actualMove === 0) {
      dispatch({ type: "SHAKE_PIECE", id: piece.id, direction });
      setTimeout(() => {
        dispatch({ type: "CLEAR_SHAKE" });
      }, 400);
      return;
    }

    if (actualMove > 0) {
      const newArea = calculateNewGridArea(
        piece.area,
        direction,
        sign,
        actualMove,
      );
      const updatedPieces = state.pieces.map((p) =>
        p.id === piece.id ? { ...p, area: newArea } : p,
      );
      const newPieces = calculateDraggablePieces(updatedPieces);

      const redPiece = newPieces.find((p) => p.color === "🟥");
      if (redPiece && redPiece.area === "4 / 2 / 6 / 4" && !state.isWin) {
        // Calcul du score UNIQUEMENT en mode challenge
        const rating = state.isChallengeMode
          ? state.gameTimer > 60
            ? "f"
            : calculateRating(state.gameTimer)
          : null;
        dispatch({ type: "WIN_GAME", pieces: newPieces, rating });
      } else {
        dispatch({ type: "MOVE_PIECE", pieces: newPieces });
      }
    }
  };

  const startGameTimer = () => {
    dispatch({ type: "START_TIMER" });
  };

  const startChallengeGame = () => {
    // 1. Afficher "C" dans l'écran LCD
    dispatch({ type: "SET_CHALLENGE_INTRO" });

    //tracker les set timeout avec un use ref et les clean avec un useeffect
    setTimeout(() => {
      // 2. Countdown 3 → 2 → 1
      dispatch({ type: "START_COUNTDOWN" });

      setTimeout(() => dispatch({ type: "COUNTDOWN_TICK", value: 2 }), 1000);
      setTimeout(() => dispatch({ type: "COUNTDOWN_TICK", value: 3 }), 2000);

      setTimeout(() => {
        // 3. Lancer le jeu
        const newPieces = calculateDraggablePieces(
          parseLevel(levels[state.levelNum.toString()]),
        );
        dispatch({ type: "RESET_PIECES", pieces: newPieces });
        startGameTimer();
      }, 3000);
    }, 1000);
  };

  const handleMouseDown = () => {
    dispatch({ type: "SET_HOLDING", isHolding: true });

    clearTimer(rightHoldTimerRef);
    rightHoldTimerRef.current = setTimeout(() => {
      dispatch({ type: "START_CHALLENGE" });
      startChallengeGame();
    }, 3000);
  };

  const handleMouseUp = () => {
    clearTimer(rightHoldTimerRef);
    dispatch({ type: "SET_HOLDING", isHolding: false });
  };

  const longPressTriggeredRef = useRef(false);
  const suppressNextLeftClickRef = useRef(false);

  const saveLevelToLocalStorage = (level: number) => {
    localStorage.setItem("levelNum", String(level));
  };

  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      clearTimer(rightHoldTimerRef);
      clearTimer(redHoldTimerRef);
      clearTimer(pressTimerRef);
    };
  }, []);

  //trigger save level on local Storage
  const handleLeftMouseDown = () => {
    dispatch({ type: "SET_HOLDING", isHolding: true });

    longPressTriggeredRef.current = false;

    pressTimerRef.current = setTimeout(() => {
      saveLevelToLocalStorage(state.levelNum);
      devLog("level sauvegardé");

      longPressTriggeredRef.current = true;
    }, 3000);
  };

  const clearPressTimer = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }

    if (longPressTriggeredRef.current) {
      suppressNextLeftClickRef.current = true;
      longPressTriggeredRef.current = false;

      setTimeout(() => {
        suppressNextLeftClickRef.current = false;
      }, 0);
    }

    dispatch({ type: "SET_HOLDING", isHolding: false });
  };

  const stopChallengemode = () => {
    if (!state.isChallengeMode) return;

    dispatch({ type: "SET_HOLDING", isHolding: true });

    clearTimer(redHoldTimerRef);
    redHoldTimerRef.current = setTimeout(() => {
      dispatch({ type: "STOP_CHALLENGE_MODE" });
      dispatch({ type: "SET_HOLDING", isHolding: false });
      devLog("mode de jeu normal");
    }, 3000);
  };

  const handleMouseUpStopChallenge = () => {
    clearTimer(redHoldTimerRef);
    dispatch({ type: "SET_HOLDING", isHolding: false });
  };

  const redButtonOnClickHandler = () => {
    if (state.isChallengeMode) {
      dispatch({ type: "START_CHALLENGE" });
      startChallengeGame();
      return;
    }
    const newPieces = calculateDraggablePieces(
      parseLevel(levels[state.levelNum.toString()]),
    );
    dispatch({ type: "RESET_PIECES", pieces: newPieces });
  };

  const handleLeftClick = () => {
    if (suppressNextLeftClickRef.current) return;
    if (
      state.isHolding ||
      (state.screenState !== "level-preview" &&
        state.screenState !== "level-number")
    ) {
      return;
    }
    const newLevel = Math.max(1, state.levelNum - 1);
    dispatch({ type: "SET_LEVEL", level: newLevel });
  };

  const handleRightClick = () => {
    // Empêcher le changement de niveau si:
    // - Un hold est en cours (isHolding)
    // - On n'est PAS sur le level-preview (jeu en cours)
    if (
      state.isHolding ||
      (state.screenState !== "level-preview" &&
        state.screenState !== "level-number")
    ) {
      return;
    }
    const newLevel = levels[(state.levelNum + 1).toString()]
      ? state.levelNum + 1
      : state.levelNum;
    dispatch({ type: "SET_LEVEL", level: newLevel });
  };

  if (!state.isMounted) {
    return null;
  }

  return (
    <>
      <div className="flex flex-row justify-start w-full aspect-3/1">
        <LcdScreen
          screenState={state.screenState}
          levelNum={state.levelNum}
          countdownValue={state.countdownValue}
          timerLeds={state.timerLeds}
          finalRating={state.finalRating}
          animationIndex={state.animationIndex}
          levelNumberFrames={state.levelNumberFrames}
          timerColor={state.timerColor}
        />
        <ControlButtons
          levelNum={state.levelNum}
          onLeftClick={handleLeftClick}
          onRightClick={handleRightClick}
          onRightMouseDown={handleMouseDown}
          onRightMouseUp={handleMouseUp}
          onRightMouseLeave={handleMouseUp}
          onRedClick={redButtonOnClickHandler}
          onRedMouseDown={stopChallengemode}
          onRedMouseUp={handleMouseUpStopChallenge}
          onRedMouseLeave={handleMouseUpStopChallenge}
          onLeftMouseDown={handleLeftMouseDown}
          onLeftMouseUp={clearPressTimer}
          onLeftMouseLeave={clearPressTimer}
        />
      </div>
      <GameGrid
        pieces={state.pieces}
        shakeId={state.shakeId}
        shakeDirection={state.shakeDirection}
        onDragEnd={handleDragEnd}
        onGridRef={(ref) => {
          gridRef.current = ref;
        }}
      />
    </>
  );
}
