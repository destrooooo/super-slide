"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  CaretRightIcon,
  CaretLeftIcon,
  CircleIcon,
} from "@phosphor-icons/react";

export default function Home() {
  //  12*[1,1], 5*[2,1], 1*[2,2]
  // grid-area: rowStart / colStart / rowEnd / colEnd
  const [isMounted, setIsMounted] = useState(false);

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
  const [screenState, setScreenState] = useState("level-preview"); // 'level-preview', 'challenge-intro', 'countdown', 'timer', 'victory'
  const [gameTimer, setGameTimer] = useState(0);
  const [isLose, setIsLose] = useState(false);
  const [finalRating, setFinalRating] = useState<string | null>(null);

  type BasePiece = {
    id: number;
    area: string;
    color: string;
  };

  type Piece = BasePiece & {
    draggable: {
      x: number;
      y: number;
    };
  };

  useEffect(() => {
    if (gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      setCellSize({
        width: rect.width / 4,
        height: rect.height / 5,
      });
    }
  }, []);

  const score: Record<string, string[]> = {
    s:
      // prettier-ignore
      [
        "","green","green","green",
        "green","","","",
        "","green","green","",
        "","","","green",
        "green","green","green",""
      ],
    a:
      // prettier-ignore
      [
        "","green","green","",
        "green","","","green",
        "green","green","green","green",
        "green","","","green",
        "green","","","green"
      ],
    b:
      // prettier-ignore
      [
        "green","green","","",
        "green","","","green",
        "green","green","","",
        "green","","","green",
        "green","green","",""
      ],
    c:
      // prettier-ignore
      [
        "","green","green","green",
        "green","","","",
        "green","","","",
        "green","","","",
        "","green","green","green"
      ],
    d:
      // prettier-ignore
      [
        "yellow","yellow","yellow","",
        "yellow","","","yellow",
        "yellow","","","yellow",
        "yellow","","","yellow",
        "yellow","yellow","yellow",""
      ],
    e:
      // prettier-ignore
      [
        "yellow","yellow","yellow","yellow",
        "yellow","","","",
        "yellow","yellow","yellow","",
        "yellow","","","",
        "yellow","yellow","yellow","yellow"
      ],
    f:
      // prettier-ignore
      [
        "red","red","red","red",
        "red","","","",
        "red","red","red","",
        "red","","","",
        "red","","",""
      ],
  };

  const figures: Record<number, string[]> = {
    0:
      // prettier-ignore
      [
        "","blue","blue","blue",
        "","blue","","blue",
        "","blue","","blue",
        "","blue","","blue",
        "","blue","blue","blue"
      ],
    1:
      // prettier-ignore
      [
        "","","blue","",
        "","blue","blue","",
        "","","blue","",
        "","","blue","",
        "","blue","blue","blue"
      ],
    2:
      // prettier-ignore
      [
        "","blue","blue","blue",
        "","","","blue",
        "","blue","blue","blue",
        "","blue","","",
        "","blue","blue","blue"
      ],
    3:
      // prettier-ignore
      [
        "","blue","blue","blue",
        "","","","blue",
        "","blue","blue","blue",
        "","","","blue",
        "","blue","blue","blue"
      ],
    4:
      // prettier-ignore
      [
        "","blue","","blue",
        "","blue","","blue",
        "","blue","blue","blue",
        "","","","blue",
        "","","","blue"
      ],
    5:
      // prettier-ignore
      [
        "","blue","blue","blue",
        "","blue","","",
        "","blue","blue","blue",
        "","","","blue",
        "","blue","blue","blue"
      ],
    6:
      // prettier-ignore
      [
        "","blue","blue","blue",
        "","blue","","",
        "","blue","blue","blue",
        "","blue","","blue",
        "","blue","blue","blue"
      ],
    7:
      // prettier-ignore
      [
        "","blue","blue","blue",
        "","","","blue",
        "","","blue","",
        "","blue","","",
        "","blue","",""
      ],
    8:
      // prettier-ignore
      [
        "","blue","blue","blue",
        "","blue","","blue",
        "","blue","blue","blue",
        "","blue","","blue",
        "","blue","blue","blue"
      ],
    9:
      // prettier-ignore
      [
        "","blue","blue","blue",
        "","blue","","blue",
        "","blue","blue","blue",
        "","","","blue",
        "","blue","blue","blue"
      ],
  };

  const figuresAnimated: Record<number, string[]> = {
    0:
      // prettier-ignore
      [
        "blue","blue","blue","",
        "blue","","blue","",
        "blue","","blue","",
        "blue","","blue","",
        "blue","blue","blue",""
      ],
    1:
      // prettier-ignore
      [
        "","blue","","",
        "blue","blue","","",
        "","blue","","",
        "","blue","","",
        "blue","blue","blue",""
      ],
    2:
      // prettier-ignore
      [
        "blue","blue","blue","",
        "","","blue","",
        "blue","blue","blue","",
        "blue","","","",
        "blue","blue","blue",""
      ],
    3:
      // prettier-ignore
      [
        "blue","blue","blue","",
        "","","blue","",
        "blue","blue","blue","",
        "","","blue","",
        "blue","blue","blue",""
      ],
    4:
      // prettier-ignore
      [
        "blue","","blue","",
        "blue","","blue","",
        "blue","blue","blue","",
        "","","blue","",
        "","","blue",""
      ],
    5:
      // prettier-ignore
      [
        "blue","blue","blue","",
        "blue","","","",
        "blue","blue","blue","",
        "","","blue","",
        "blue","blue","blue",""
      ],
    6:
      // prettier-ignore
      [
        "blue","blue","blue","",
        "blue","","","",
        "blue","blue","blue","",
        "blue","","blue","",
        "blue","blue","blue",""
      ],
    7:
      // prettier-ignore
      [
        "blue","blue","blue","",
        "","","blue","",
        "","blue","","",
        "blue","","","",
        "blue","","",""
      ],
    8:
      // prettier-ignore
      [
        "blue","blue","blue","",
        "blue","","blue","",
        "blue","blue","blue","",
        "blue","","blue","",
        "blue","blue","blue",""
      ],
    9:
      // prettier-ignore
      [
        "blue","blue","blue","",
        "blue","","blue","",
        "blue","blue","blue","",
        "","","blue","",
        "blue","blue","blue",""
      ],
  };

  const challengeAnimation: Record<number, string[]> = {
    1:
      // prettier-ignore
      [
        "","blue","blue","blue",
        "blue","","","",
        "blue","","","",
        "blue","","","",
        "","blue","blue","blue"
      ],
  };

  const gameTimerAnimation: Record<number, string[]> = {
    1:
      // prettier-ignore
      [
        "","green","green","green",
        "","","","green",
        "","green","green","green",
        "","","","green",
        "","green","green","green"
      ],
    2:
      // prettier-ignore
      [
        "","green","green","green",
        "","","","green",
        "","green","green","green",
        "","green","","",
        "","green","green","green"
      ],
    3:
      // prettier-ignore
      [
        "","","green","",
        "","green","green","",
        "","","green","",
        "","","green","",
        "","green","green","green"
      ],
  };

  const blankGrid: Record<number, string[]> = {
    1:
      // prettier-ignore
      [
        "","","","",
        "","","","",
        "","","","",
        "","","","",
        "","","",""
      ],
  };

  const levels: Record<number, string[]> = {
    1:
      // prettier-ignore
      [
        "yellow","yellow","","",
        "yellow","yellow","yellow","yellow",
        "yellow","yellow","yellow","yellow",
        "red","red","blue","yellow",
        "red","red","blue","yellow"
      ],
    2:
      // prettier-ignore
      [
        "yellow","yellow","yellow","yellow",
        "","","blue","yellow",
        "red","red","blue","yellow",
        "red","red","yellow","yellow",
        "yellow","yellow","yellow","yellow"
      ],
    3:
      // prettier-ignore
      [
        "blue","yellow","yellow","blue",
        "blue","green","green","blue",
        "blue","red","red","",
        "blue","red","red","blue",
        "yellow","","yellow","blue"
      ],
  };

  const victoryAnimation: Record<number, string[]> = {
    0:
      // prettier-ignore
      [
        "","","","",
        "","","","",
        "","","","",
        "","","","",
        "","red","red",""
      ],
    1:
      // prettier-ignore
      [
        "","","","",
        "","","","",
        "","","","",
        "","red","red","",
        "","red","red",""
      ],
    2:
      // prettier-ignore
      [
        "","","","",
        "","","","",
        "","red","red","",
        "","red","red","",
        "","","",""
      ],
    3:
      // prettier-ignore
      [
        "","","","",
        "","red","red","",
        "","red","red","",
        "","","","",
        "","","",""
      ],
    4:
      // prettier-ignore
      [
        "","","red","",
        "red","red","red","",
        "","red","red","red",
        "","red","","",
        "","","",""
      ],
    5:
      // prettier-ignore
      [
        "","red","red","",
        "red","red","red","red",
        "red","red","red","red",
        "","red","red","",
        "","","",""
      ],
    6:
      // prettier-ignore
      [
        "red","","","red",
        "","red","red","",
        "","red","red","",
        "red","","","red",
        "","","",""
      ],
    7:
      // prettier-ignore
      [
        "","red","red","",
        "red","","","red",
        "red","","","red",
        "","red","red","",
        "","","",""
      ],
    8:
      // prettier-ignore
      [
        "red","","","red",
        "","","","",
        "red","","","red",
        "","","","",
        "","","",""
      ],
    9:
      // prettier-ignore
      [
        "","","","",
        "","","","",
        "","","","",
        "","","","",
        "","","",""
      ],
  };

  const [animationIndex, setAnimationIndex] = useState(0);
  const [levelNum, setLevelNum] = useState(1);
  const [isWin, setIsWin] = useState(false);
  const [animationCycle, setAnimationCycle] = useState(0);
  const CYCLES_TO_PLAY = 3;

  function parseLevel(layout: string[]): BasePiece[] {
    const pieces: Array<{ id: number; area: string; color: string }> = [];
    const visited = new Set<number>();
    let piecedId = 1;

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 4; col++) {
        const index = row * 4 + col;
        const color = layout[index];
        let colSpan = 1;
        let rowSpan = 1;

        if (color === "" || visited.has(index)) continue;
        if (color === "yellow") {
          colSpan = 1;
          rowSpan = 1;
          pieces.push({
            id: piecedId++,
            area: `${row + 1}/${col + 1}/${row + rowSpan + 1}/${col + colSpan + 1}`,
            color: color,
          });
          visited.add(index);
        } else if (color === "red") {
          colSpan = 2;
          rowSpan = 2;
          pieces.push({
            id: piecedId++,
            area: `${row + 1}/${col + 1}/${row + rowSpan + 1}/${col + colSpan + 1}`,
            color: color,
          });
          for (let r = 0; r < rowSpan; r++) {
            for (let c = 0; c < colSpan; c++) {
              const cellIndex = (row + r) * 4 + (col + c);
              visited.add(cellIndex);
            }
          }
        } else if (color === "blue") {
          colSpan = 1;
          rowSpan = 2;
          pieces.push({
            id: piecedId++,
            area: `${row + 1}/${col + 1}/${row + rowSpan + 1}/${col + colSpan + 1}`,
            color: color,
          });
          for (let r = 0; r < rowSpan; r++) {
            for (let c = 0; c < colSpan; c++) {
              const cellIndex = (row + r) * 4 + (col + c);
              visited.add(cellIndex);
            }
          }
        } else if (color === "green") {
          colSpan = 2;
          rowSpan = 1;
          pieces.push({
            id: piecedId++,
            area: `${row + 1}/${col + 1}/${row + rowSpan + 1}/${col + colSpan + 1}`,
            color: "blue",
          });
          for (let r = 0; r < rowSpan; r++) {
            for (let c = 0; c < colSpan; c++) {
              const cellIndex = (row + r) * 4 + (col + c);
              visited.add(cellIndex);
            }
          }
        }
      }
    }
    // console.log(pieces);
    return pieces;
  }

  const [pieces, setPieces] = useState<Piece[]>(
    calculateDraggablePieces(parseLevel(levels[3])),
  );

  function calculateDraggablePieces(pieces: BasePiece[]): Piece[] {
    // Create 2D table for used spaces
    const grid = Array(5)
      .fill(null)
      .map(() => Array(4).fill(false));

    // Set used spaces
    pieces.forEach((piece: { id: number; area: string; color: string }) => {
      const [rowStart, colStart, rowEnd, colEnd] = piece.area
        .split("/")
        .map((n) => parseInt(n.trim()));

      for (let row = rowStart - 1; row < rowEnd - 1; row++)
        for (let col = colStart - 1; col < colEnd - 1; col++)
          grid[row][col] = true;
    });

    // check if pieces are draggable
    return pieces.map((piece) => {
      //parse gridArea

      const [rowStart, colStart, rowEnd, colEnd] = piece.area
        .split("/")
        .map((n) => parseInt(n.trim()));

      // check if all cell have space up
      const canMoveUp = (() => {
        //check if on edge
        if (rowStart - 1 <= 0) {
          return false;
        }

        // check if available space above
        for (let col = colStart - 1; col < colEnd - 1; col++) {
          if (grid[rowStart - 2][col] === true) {
            return false;
          }
        }
        return true;
      })();

      // check if all cell have space beneath
      const canMoveDown = (() => {
        //check if on edge
        if (rowEnd === 6) {
          return false;
        }

        //check if available space beneath
        for (let col = colStart - 1; col < colEnd - 1; col++) {
          if (grid[rowEnd - 1][col] === true) {
            return false;
          }
        }
        return true;
      })();

      // check if all cell have space on left
      const canMoveLeft = (() => {
        //check if on edge
        if (colStart - 1 <= 0) {
          return false;
        }

        //check if available space on left
        for (let row = rowStart - 1; row < rowEnd - 1; row++) {
          if (grid[row][colStart - 2] === true) {
            return false;
          }
        }
        return true;
      })();

      // check if all cell have space on right
      const canMoveRight = (() => {
        //check if on edge
        if (colEnd === 5) {
          return false;
        }

        //check if available space on right
        for (let row = rowStart - 1; row < rowEnd - 1; row++) {
          if (grid[row][colEnd - 1] === true) {
            return false;
          }
        }
        return true;
      })();

      // set draggable axys
      let x = 0; //
      if (canMoveLeft && canMoveRight) x = 2;
      else if (canMoveLeft) x = -1;
      else if (canMoveRight) x = 1;

      let y = 0;
      if (canMoveUp && canMoveDown) y = 2;
      else if (canMoveUp) y = -1;
      else if (canMoveDown) y = 1;

      return {
        ...piece,
        draggable: { x, y },
      };
    });
  }

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

    const calculateMaxMove = (
      piece: {
        id: number;
        area: string;
        color: string;
        draggable: { x: number; y: number };
      },
      direction: string,
      sign: string,
    ) => {
      const [rowStart, colStart, rowEnd, colEnd] = piece.area
        .split("/")
        .map((n) => parseInt(n.trim()));

      let moveDistance = 0;

      const grid = Array(5)
        .fill(null)
        .map(() => Array(4).fill(false));

      pieces.forEach((p) => {
        const [rs, cs, re, ce] = p.area
          .split("/")
          .map((n) => parseInt(n.trim()));
        for (let row = rs - 1; row < re - 1; row++)
          for (let col = cs - 1; col < ce - 1; col++) grid[row][col] = true;
      });

      //on y +
      if (direction === "y" && sign === "+") {
        let currentRow = rowEnd - 1;

        while (currentRow < 5) {
          let allFree = true;
          for (let col = colStart - 1; col < colEnd - 1; col++) {
            if (grid[currentRow][col] === true) {
              allFree = false;
              break;
            }
          }

          if (allFree) {
            moveDistance++;
            currentRow++;
          } else {
            break;
          }
        }
      }
      //on y -
      if (direction === "y" && sign === "-") {
        let currentRow = rowStart - 2;

        while (currentRow >= 0) {
          let allFree = true;
          for (let col = colStart - 1; col < colEnd - 1; col++) {
            if (grid[currentRow][col] === true) {
              allFree = false;
              break;
            }
          }

          if (allFree) {
            moveDistance++;
            currentRow--;
          } else {
            break;
          }
        }
      }
      //on x +
      if (direction === "x" && sign === "+") {
        let currentCol = colEnd - 1;

        while (currentCol < 4) {
          let allFree = true;
          for (let row = rowStart - 1; row < rowEnd - 1; row++) {
            if (grid[row][currentCol] === true) {
              allFree = false;
              break;
            }
          }

          if (allFree) {
            moveDistance++;
            currentCol++;
          } else {
            break;
          }
        }
      }
      //on x-
      if (direction === "x" && sign === "-") {
        let currentCol = colStart - 2;

        while (currentCol >= 0) {
          let allFree = true;
          for (let row = rowStart - 1; row < rowEnd - 1; row++) {
            if (grid[row][currentCol] === true) {
              allFree = false;
              break;
            }
          }

          if (allFree) {
            moveDistance++;
            currentCol--;
          } else {
            break;
          }
        }
      }

      return moveDistance;
    };

    const maxMove = calculateMaxMove(piece, direction, sign);
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
    const calculateNewGridArea = (
      oldArea: string,
      direction: string,
      sign: string,
      actualMove: number,
    ): string => {
      const [rowStart, colStart, rowEnd, colEnd] = oldArea
        .split("/")
        .map((n) => parseInt(n.trim()));

      if (direction === "y" && sign === "+") {
        return `${rowStart + actualMove} / ${colStart} / ${rowEnd + actualMove} / ${colEnd}`;
      }
      if (direction === "y" && sign === "-") {
        return `${rowStart - actualMove} / ${colStart} / ${rowEnd - actualMove} / ${colEnd}`;
      }
      if (direction === "x" && sign === "+") {
        return `${rowStart} / ${colStart + actualMove} / ${rowEnd} / ${colEnd + actualMove}`;
      }
      if (direction === "x" && sign === "-") {
        return `${rowStart} / ${colStart - actualMove} / ${rowEnd} / ${colEnd - actualMove}`;
      }
      return oldArea;
    };

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
            let rating = "f";

            if (finalTime <= 10) rating = "s";
            else if (finalTime <= 15) rating = "a";
            else if (finalTime <= 20) rating = "b";
            else if (finalTime <= 30) rating = "c";
            else if (finalTime <= 45) rating = "d";
            else if (finalTime <= 60) rating = "e";

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
  // devrait réinitialiser le timer avant
  const startGameTimer = () => {
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
          const nextIndex = (prev + 1) % Object.keys(victoryAnimation).length;

          if (prev === Object.keys(victoryAnimation).length - 1) {
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
        setPieces(calculateDraggablePieces(parseLevel(levels[levelNum])));
        startGameTimer();
      }, 3000);
    }, 500);
  };

  const handleMouseDown = () => {
    const timer = setTimeout(() => {
      setIsChallengeMode(true);
      startChallengeGame();
      setIsHolding(true);
    }, 3000);

    setPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }

    //bout de code étrange réinitialise le game timer, initialise la nouvelle grille rempli l'écran led pour le timer remet les animations de victoire à zéro réinitialise le rating
    if (isChallengeMode) {
      setPieces(calculateDraggablePieces(parseLevel(levels[levelNum])));
      setGameTimer(0);
      setTimerLeds(Array(20).fill(true));
      setAnimationCycle(0);
      setFinalRating(null);
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
    setPieces(calculateDraggablePieces(parseLevel(levels[levelNum])));
    setIsWin(false);
    setAnimationCycle(0);
    setAnimationIndex(0);
  };

  if (!isMounted) {
    return null; // Ou un loader
  }

  return (
    // #1C223A #E5D2B6 #F44E1C #193564 #5182BC #F6E8DD #E6BF98 #DC3C24 #EFE8CB #324E44 #D0391B #1A1A1A #1E223C
    <div className="min-h-screen bg-[#f3701e] flex items-center justify-center p-8">
      <div className="relative bg-zinc-800 rounded-3xl shadow-2xl p-4 max-w-md w-full flex flex-col gap-4 drop-shadow-2xl/50">
        <div className="flex flex-row">
          <div className="aspect-square w-38 bg-black rounded-xl py-1.5">
            {/* Animation de victoire */}
            {screenState === "victory" && (
              <div className="grid grid-cols-4 grid-rows-5 h-full aspect-4/5 gap-0.5 mx-auto">
                {victoryAnimation[animationIndex].map((cell, index) => (
                  <div
                    className="rounded"
                    key={index}
                    style={{
                      background:
                        cell === "red"
                          ? "#f3701e"
                          : cell === "blue"
                            ? "#4b607f"
                            : cell === "yellow"
                              ? "#e8d8c9"
                              : "transparent",
                    }}
                  />
                ))}
              </div>
            )}

            {/* Animation "C" d'entrée en mode challenge */}
            {screenState === "challenge-intro" && (
              <div className="grid grid-cols-4 grid-rows-5 h-full aspect-4/5 gap-0.5 mx-auto">
                {challengeAnimation[1].map((cell, index) => (
                  <div
                    className="rounded"
                    key={index}
                    style={{
                      background:
                        cell === "red"
                          ? "#f3701e"
                          : cell === "blue"
                            ? "#4b607f"
                            : cell === "yellow"
                              ? "#e8d8c9"
                              : cell === "green"
                                ? "#324E44"
                                : "transparent",
                    }}
                  />
                ))}
              </div>
            )}

            {/* Countdown 3 → 2 → 1 */}
            {screenState === "countdown" && countdownValue && (
              <div className="grid grid-cols-4 grid-rows-5 h-full aspect-4/5 gap-0.5 mx-auto">
                {gameTimerAnimation[countdownValue].map((cell, index) => (
                  <div
                    className="rounded"
                    key={index}
                    style={{
                      background:
                        cell === "red"
                          ? "#f3701e"
                          : cell === "blue"
                            ? "#4b607f"
                            : cell === "yellow"
                              ? "#e8d8c9"
                              : cell === "green"
                                ? "#324E44"
                                : "transparent",
                    }}
                  />
                ))}
              </div>
            )}

            {/* Grille de LEDs du timer */}
            {screenState === "timer" && (
              <div className="grid grid-cols-4 grid-rows-5 h-full aspect-4/5 gap-0.5 mx-auto">
                {timerLeds.map((isOn, index) => (
                  <div
                    className="rounded"
                    key={index}
                    style={{
                      background: isOn ? "#324E44" : "transparent",
                    }}
                  />
                ))}
              </div>
            )}

            {/* Affichage du score */}
            {screenState === "score" && finalRating && (
              <div className="grid grid-cols-4 grid-rows-5 h-full aspect-4/5 gap-0.5 mx-auto">
                {score[finalRating.toLowerCase()].map((cell, index) => (
                  <div
                    className="rounded"
                    key={index}
                    style={{
                      background:
                        cell === "green"
                          ? "#324E44"
                          : cell === "yellow"
                            ? "#e8d8c9"
                            : cell === "red"
                              ? "#f3701e"
                              : "transparent",
                    }}
                  />
                ))}
              </div>
            )}
            {/* Preview du niveau (par défaut) */}
            {!isWin && screenState === "level-preview" && (
              <div className="grid grid-cols-4 grid-rows-5 h-full aspect-4/5 gap-0.5 mx-auto">
                {levels[levelNum].map((cell, index) => (
                  <div
                    className="rounded"
                    key={index}
                    style={{
                      background:
                        cell === "red"
                          ? "#f3701e"
                          : cell === "blue"
                            ? "#4b607f"
                            : cell === "yellow"
                              ? "#e8d8c9"
                              : cell === "green"
                                ? "#324E44"
                                : "transparent",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-row w-full justify-center gap-3 items-center text-[#e8d8c9]">
            <div className="relative flex flex-col h-full items-center justify-center">
              <CaretLeftIcon
                size={16}
                weight="fill"
                className="absolute top-2"
              />
              <button
                className="relative h-14 aspect-44/58 rounded-xl bg-[#4b607f] drop-shadow-xl active:scale-95 hover:scale-101 ease-in-out duration-75"
                onClick={() => setLevelNum((prev) => Math.max(1, prev - 1))}
              ></button>
              <p className="absolute bottom-2 h-4 text-xs">L</p>
            </div>
            <div className="relative flex flex-col h-full items-center justify-center">
              <CaretRightIcon
                size={16}
                weight="fill"
                className="absolute top-2"
              />
              <button
                className="aspect-44/58 h-14 rounded-xl bg-[#4b607f] drop-shadow-xl active:scale-95 hover:scale-101 ease-in-out duration-75"
                onClick={() =>
                  setLevelNum((prev) => (levels[prev + 1] ? prev + 1 : prev))
                }
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              ></button>
              <p className="absolute bottom-2 h-4 text-xs">C</p>
            </div>
            <div className="relative flex flex-col h-full items-center justify-center">
              <CircleIcon size={16} weight="bold" className="absolute top-2" />
              <button
                className="aspect-44/58 h-14 rounded-xl bg-[#f3701e] drop-shadow-xl active:scale-95 hover:scale-101 ease-in-out duration-75"
                onClick={redButtonOnClickHandler}
                onMouseDown={stopChallengemode}
                onMouseLeave={handleMouseUpStopChallenge}
                onMouseUp={handleMouseUpStopChallenge}
              />
              <p className="absolute bottom-2 h-4 max-w-fit text-xs whitespace-nowrap font-light ">
                ON / OFF
              </p>
            </div>
          </div>
        </div>
        <div
          ref={gridRef}
          className="relative grid grid-cols-4 grid-rows-5 gap-px w-full bg-neutral-950 p-2 rounded-2xl"
          style={{ aspectRatio: "4/5" }}
        >
          <div
            className="absolute bg-[#f3701e] rounded-xl bottom-2 left-1/2 -translate-x-1/2 opacity-20 z-0"
            style={{
              width: `calc(${cellSize.width * 2}px - 0.5rem)`,
              height: `calc(${cellSize.height * 2}px - 0.5rem)`,
            }}
          ></div>
          {pieces.map((piece) => (
            <motion.div
              layout={shakeId !== piece.id}
              key={piece.id}
              drag={true}
              dragMomentum={false}
              animate={
                shakeId === piece.id
                  ? shakeDirection === "x"
                    ? { x: [0, -1, 1, -1, 1, 0], y: 0 }
                    : { x: 0, y: [0, -1, 1, -1, 1, 0] }
                  : { x: 0, y: 0 }
              }
              transition={{ duration: 0.4 }}
              onDragEnd={(_, info) => handleDragEnd(piece, info)}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0}
              style={{
                gridArea: piece.area,
                background:
                  piece.color === "red"
                    ? "#f3701e"
                    : piece.color === "blue"
                      ? "#4b607f"
                      : piece.color === "yellow"
                        ? "#e8d8c9"
                        : "#4b607f",
              }}
              className="card rounded-xl z-1 drop-shadow-lg cursor-grab"
              data-id={piece.id}
            ></motion.div>
          ))}
        </div>
        {/* {isWin ? <p>c&apos;est gagné</p> : ""} */}
      </div>
    </div>
  );
}
