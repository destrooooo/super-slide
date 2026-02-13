"use client";

import { useState, useEffect, useRef } from "react";
import type { Piece, ScreenState, Rating } from "../types/game";
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

type GameContainerProps = {
  initialLevel: number;
};

const CYCLES_TO_PLAY = 3;

export default function GameContainer({ initialLevel }: GameContainerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const levels = levelsData as Record<string, string[]>;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const gridRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState({ width: 100, height: 100 });
  const [shakeId, setShakeId] = useState<number | null>(null);
  const [shakeDirection, setShakeDirection] = useState<"x" | "y" | null>(null);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isHolding, setIsHolding] = useState(false);
  const [isChallengeMode, setIsChallengeMode] = useState(false);
  const [timerLeds, setTimerLeds] = useState(Array(20).fill(true));
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [screenState, setScreenState] = useState<ScreenState>("level-preview");
  const [gameTimer, setGameTimer] = useState(0);
  const [isLose, setIsLose] = useState(false);
  const [finalRating, setFinalRating] = useState<Rating | null>(null);
  const [animationIndex, setAnimationIndex] = useState(0);
  const [levelNum, setLevelNum] = useState(initialLevel);
  const [isWin, setIsWin] = useState(false);
  const [animationCycle, setAnimationCycle] = useState(0);

  const [pieces, setPieces] = useState<Piece[]>(
    calculateDraggablePieces(parseLevel(levels[initialLevel.toString()])),
  );

  useEffect(() => {
    if (gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      setCellSize({
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
      setShakeId(piece.id);
      setShakeDirection(direction);
      setTimeout(() => {
        setShakeId(null);
        setShakeDirection(null);
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

    const maxMove = calculateMaxMove(piece, pieces, direction, sign);
    console.log(`Direction: ${direction}${sign}, Max move: ${maxMove} cases`);
    const dragDistance = Math.abs(
      direction === "x" ? info.offset.x : info.offset.y,
    );
    const cellDimension = direction === "x" ? cellSize.width : cellSize.height;

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
      setShakeId(piece.id);
      setShakeDirection(direction);
      setTimeout(() => {
        setShakeId(null);
        setShakeDirection(null);
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
      setPieces((prevPieces) => {
        const updatedPieces = prevPieces.map((p) =>
          p.id === piece.id ? { ...p, area: newArea } : p,
        );
        const newPieces = calculateDraggablePieces(updatedPieces);

        const redPiece = newPieces.find((p) => p.color === "red");
        if (redPiece && redPiece.area === "4 / 2 / 6 / 4") {
          // Calcul du score UNIQUEMENT en mode challenge
          if (isChallengeMode) {
            const finalTime = gameTimer;
            const rating = calculateRating(finalTime);
            setFinalRating(rating);
          }
          setIsWin(true);
        } else {
          setIsWin(false);
        }

        return newPieces;
      });
    }
  };

  const startGameTimer = () => {
    setGameTimer(0);
    setScreenState("timer");
  };

  useEffect(() => {
    // Fin de partie en mode challenge
    if (isChallengeMode && (isWin || isLose)) {
      if (isWin) {
        setScreenState("victory"); // Animation de victoire
      } else {
        setScreenState("score"); // Direct au score F si défaite
      }
    }

    // Fin de partie en mode normal
    if (!isChallengeMode && isWin) {
      setScreenState("victory");
    }
  }, [isWin, isLose, isChallengeMode]);

  useEffect(() => {
    if (screenState === "victory" && animationCycle < CYCLES_TO_PLAY) {
      const interval = setInterval(() => {
        setAnimationIndex((prev) => {
          const nextIndex = (prev + 1) % 10;

          if (prev === 9) {
            setAnimationCycle((c) => c + 1);
          }

          return nextIndex;
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [screenState, animationCycle]);

  // Après l'animation de victoire, affiche le score (si challenge)
  useEffect(() => {
    console.log("Victory check:", {
      screenState,
      animationCycle,
      CYCLES_TO_PLAY,
      isChallengeMode,
      finalRating,
    });
    if (screenState === "victory" && animationCycle >= CYCLES_TO_PLAY) {
      if (isChallengeMode) {
        console.log("Should show score now!");
        setScreenState("score");
      } else {
        // En mode normal, retour direct au level-preview
        setScreenState("level-preview");
        setIsWin(false);
        setAnimationCycle(0);
        setAnimationIndex(0);
      }
    }
  }, [screenState, animationCycle, isChallengeMode]);

  // Après le score, retour au level selector
  useEffect(() => {
    if (screenState === "score") {
      const timeout = setTimeout(() => {
        setScreenState("level-preview");
        setIsChallengeMode(false);
        setIsWin(false);
        setIsLose(false);
        setAnimationCycle(0);
        setAnimationIndex(0);
        setFinalRating(null);
        setGameTimer(0);
        setTimerLeds(Array(20).fill(true));
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [screenState]);

  //gameTimer
  useEffect(() => {
    if (screenState === "timer" && !isWin && !isLose) {
      const interval = setInterval(() => {
        setGameTimer((prev) => {
          if (isWin || isLose) {
            return prev;
          }
          const newTime = prev + 1;
          console.log(newTime);

          // Turn off 1 LED each 3 seconds
          const ledsOff = Math.floor(newTime / 3);
          if (ledsOff < 20) {
            setTimerLeds(Array(20).fill(false).fill(true, ledsOff));
          }

          // if > 60s = loose
          if (newTime >= 60) {
            setIsLose(true);
            setFinalRating("f");
          }

          return newTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [screenState, isWin, isLose]);

  const startChallengeGame = () => {
    // 1. Afficher "C" dans l'écran LCD
    setScreenState("challenge-intro");

    setTimeout(() => {
      // 2. Countdown 3 → 2 → 1
      setScreenState("countdown");
      setCountdownValue(1);

      setTimeout(() => setCountdownValue(2), 1000);
      setTimeout(() => setCountdownValue(3), 2000);

      setTimeout(() => {
        // 3. Lancer le jeu
        setPieces(
          calculateDraggablePieces(parseLevel(levels[levelNum.toString()])),
        );
        startGameTimer();
        setAnimationCycle(0);
        setTimerLeds(Array(20).fill(true));
        setFinalRating(null);
      }, 3000);
    }, 1000);
  };

  const handleMouseDown = () => {
    const timer = setTimeout(() => {
      setIsChallengeMode(true);
      startChallengeGame();
      setIsHolding(true);
      setPieces(
        calculateDraggablePieces(parseLevel(levels[levelNum.toString()])),
      );
      setAnimationCycle(0);
    }, 3000);

    setPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }

    setIsHolding(false);
  };

  const stopChallengemode = () => {
    if (isChallengeMode) {
      const timer = setTimeout(() => {
        setIsChallengeMode(false);
        setIsHolding(true);
        console.log("mode de jeu normal");
      }, 3000);
      setPressTimer(timer);
    }
  };

  const handleMouseUpStopChallenge = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    setIsHolding(false);
    console.log("handleMouseUpStopChallenge triggered");
  };

  const redButtonOnClickHandler = () => {
    if (isChallengeMode) {
      setIsChallengeMode(true);
      startChallengeGame();
      return;
    }
    setPieces(
      calculateDraggablePieces(parseLevel(levels[levelNum.toString()])),
    );
    setIsWin(false);
    setAnimationCycle(0);
    setAnimationIndex(0);
  };

  const handleLeftClick = () => {
    setLevelNum((prev) => Math.max(1, prev - 1));
  };

  const handleRightClick = () => {
    setLevelNum((prev) => (levels[(prev + 1).toString()] ? prev + 1 : prev));
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <div className="flex flex-row">
        <LcdScreen
          screenState={screenState}
          levelNum={levelNum}
          countdownValue={countdownValue}
          timerLeds={timerLeds}
          finalRating={finalRating}
          animationIndex={animationIndex}
          isWin={isWin}
        />
        <ControlButtons
          levelNum={levelNum}
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
        pieces={pieces}
        cellSize={cellSize}
        shakeId={shakeId}
        shakeDirection={shakeDirection}
        onDragEnd={handleDragEnd}
        onGridRef={(ref) => {
          gridRef.current = ref;
        }}
      />
    </>
  );
}
