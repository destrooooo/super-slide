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

type GameContainerProps = {
  initialLevel: number;
};

export default function GameContainer({ initialLevel }: GameContainerProps) {
  const levels = levelsData as Record<string, string[]>;

  // Remplace 16 useState par 1 seul useReducer
  const [state, dispatch] = useReducer(
    gameReducer,
    createInitialGameState(
      initialLevel,
      calculateDraggablePieces(parseLevel(levels[initialLevel.toString()])),
    ),
  );

  // Custom hooks remplacent les effets complexes
  useGameTimer(state, dispatch);
  useVictoryAnimation(state, dispatch);
  useScoreTimeout(state, dispatch);
  useLevelNumberAnimation(state, dispatch);

  const gridRef = useRef<HTMLDivElement>(null);

  // Effet de montage - dispatch au lieu de setState
  useEffect(() => {
    dispatch({ type: "MOUNT" });
  }, []);

  // Effet pour calculer la taille des cellules
  useEffect(() => {
    if (gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      dispatch({
        type: "SET_CELL_SIZE",
        width: rect.width / 4,
        height: rect.height / 5,
      });
    }
  }, []);

  const handleDragEnd = (
    piece: Piece,
    info: { offset: { x: number; y: number } },
  ) => {
    console.log(info);
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

    console.log(`Direction: ${direction}, Signe: ${sign}`);

    const maxMove = calculateMaxMove(piece, state.pieces, direction, sign);
    console.log(`Direction: ${direction}${sign}, Max move: ${maxMove} cases`);
    const dragDistance = Math.abs(
      direction === "x" ? info.offset.x : info.offset.y,
    );
    const cellDimension =
      direction === "x" ? state.cellSize.width : state.cellSize.height;

    console.log(dragDistance);
    const intendedCells =
      dragDistance < cellDimension * 0.05
        ? 0
        : dragDistance > cellDimension * 1.3
          ? 2
          : 1;

    const actualMove = Math.min(intendedCells, maxMove);
    console.log("actual move", actualMove);

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
          ? calculateRating(state.gameTimer)
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

    const timer = setTimeout(() => {
      dispatch({ type: "START_CHALLENGE" });
      startChallengeGame();
    }, 3000);

    dispatch({ type: "SET_PRESS_TIMER", timer });
  };

  const handleMouseUp = () => {
    if (state.pressTimer) {
      clearTimeout(state.pressTimer);
      dispatch({ type: "SET_PRESS_TIMER", timer: null });
    }

    dispatch({ type: "SET_HOLDING", isHolding: false });
  };

  const stopChallengemode = () => {
    if (state.isChallengeMode) {
      const timer = setTimeout(() => {
        dispatch({ type: "STOP_CHALLENGE_MODE" });
        dispatch({ type: "SET_HOLDING", isHolding: true });
        console.log("mode de jeu normal");
      }, 3000);
      dispatch({ type: "SET_PRESS_TIMER", timer });
    }
  };

  const handleMouseUpStopChallenge = () => {
    if (state.pressTimer) {
      clearTimeout(state.pressTimer);
      dispatch({ type: "SET_PRESS_TIMER", timer: null });
    }
    dispatch({ type: "SET_HOLDING", isHolding: false });
    console.log("handleMouseUpStopChallenge triggered");
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
    if (state.screenState !== "level-preview") {
      return;
    }
    const newLevel = Math.max(1, state.levelNum - 1);
    dispatch({ type: "SET_LEVEL", level: newLevel });
  };

  const handleRightClick = () => {
    // Empêcher le changement de niveau si:
    // - Un hold est en cours (isHolding)
    // - On n'est PAS sur le level-preview (jeu en cours)
    if (state.isHolding || state.screenState !== "level-preview") {
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
      <div className="flex flex-row">
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
        />
      </div>
      <GameGrid
        pieces={state.pieces}
        cellSize={state.cellSize}
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
