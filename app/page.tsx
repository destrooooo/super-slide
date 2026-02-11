"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  //  12*[1,1], 5*[2,1], 1*[2,2]
  // grid-area: rowStart / colStart / rowEnd / colEnd
  const CONTAINER_WIDTH = 400;
  const CONTAINER_HEIGHT = 500;
  const CELL_WIDTH = CONTAINER_WIDTH / 4;
  const CELL_HEIGHT = CONTAINER_HEIGHT / 5;

  const [isWin, setIsWin] = useState(false);
  const [moveCount, setMoveCount] = useState(0);

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

  function parseLevel(layout: string[]) {
    const pieces = [];
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

  const [pieces, setPieces] = useState(
    calculateDraggablePieces(parseLevel(levels[3])),
  );

  function calculateDraggablePieces(pieces) {
    // Create 2D table for used spaces
    const grid = Array(5)
      .fill(null)
      .map(() => Array(4).fill(false));

    // Set used spaces
    pieces.forEach((piece) => {
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

  const handleDragEnd = (piece, info) => {
    console.log(info);
    const direction =
      Math.abs(info.offset.x) > Math.abs(info.offset.y) ? "x" : "y";
    const sign =
      direction === "x"
        ? info.offset.x > 0
          ? "+"
          : "-"
        : info.offset.y > 0
          ? "+"
          : "-";

    console.log(`Direction: ${direction}, Signe: ${sign}`);

    const calculateMaxMove = (piece, direction, sign) => {
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
    const cellSize = direction === "x" ? CELL_WIDTH : CELL_HEIGHT;

    console.log(dragDistance);
    const intendedCells =
      dragDistance < cellSize * 0.05
        ? 0
        : dragDistance > cellSize * 1.3
          ? 2
          : 1;

    const actualMove = Math.min(intendedCells, maxMove);
    console.log("actual move", actualMove);
    const calculateNewGridArea = (oldArea, direction, sign, actualMove) => {
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
    };
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
          setIsWin(true);
        } else {
          setIsWin(false);
        }

        return newPieces;
      });
      setMoveCount((prev) => prev + 1);
    }
  };

  return (
    <>
      <div>Coups : {moveCount}</div>
      <div
        className=" relative border grid grid-cols-4 grid-rows-5 gap-2 "
        style={{
          width: CONTAINER_WIDTH,
          height: CONTAINER_HEIGHT,
        }}
      >
        <div className="absolute w-48.75 h-[194.4px] bottom-0 left-1/2 bg-red-500 opacity-25 -translate-x-1/2 -z-30"></div>
        {pieces.map((piece) => (
          <motion.div
            layout
            key={piece.id}
            drag={
              piece.draggable.x !== 0 && piece.draggable.y !== 0
                ? true
                : piece.draggable.x !== 0
                  ? "x"
                  : piece.draggable.y !== 0
                    ? "y"
                    : false
            }
            onDragEnd={(_, info) => handleDragEnd(piece, info)}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.2}
            style={{
              gridArea: piece.area,
              background: piece.color,
              cursor:
                piece.draggable.x !== 0 || piece.draggable.y !== 0
                  ? "grab"
                  : "not-allowed",
            }}
            className="card"
            data-id={piece.id}
          ></motion.div>
        ))}
      </div>
      {isWin ? <p>c&apos;est gagné</p> : ""}
    </>
  );
}
