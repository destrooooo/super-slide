import type { BasePiece, Piece, Rating } from "../types/game";

export function parseLevel(layout: string[]): BasePiece[] {
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
      if (color === "🟨") {
        colSpan = 1;
        rowSpan = 1;
        pieces.push({
          id: piecedId++,
          area: `${row + 1}/${col + 1}/${row + rowSpan + 1}/${col + colSpan + 1}`,
          color: color,
        });
        visited.add(index);
      } else if (color === "🟥") {
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
      } else if (color === "🟦") {
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
      } else if (color === "🟩") {
        colSpan = 2;
        rowSpan = 1;
        pieces.push({
          id: piecedId++,
          area: `${row + 1}/${col + 1}/${row + rowSpan + 1}/${col + colSpan + 1}`,
          color: "🟦",
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
  return pieces;
}

export function calculateDraggablePieces(pieces: BasePiece[]): Piece[] {
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

export function calculateMaxMove(
  piece: Piece,
  pieces: Piece[],
  direction: string,
  sign: string,
): number {
  const [rowStart, colStart, rowEnd, colEnd] = piece.area
    .split("/")
    .map((n) => parseInt(n.trim()));

  let moveDistance = 0;

  const grid = Array(5)
    .fill(null)
    .map(() => Array(4).fill(false));

  pieces.forEach((p) => {
    const [rs, cs, re, ce] = p.area.split("/").map((n) => parseInt(n.trim()));
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
}

export function calculateNewGridArea(
  oldArea: string,
  direction: string,
  sign: string,
  actualMove: number,
): string {
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
}

export function calculateRating(time: number): Rating {
  if (time <= 10) return "s";
  if (time <= 15) return "a";
  if (time <= 20) return "b";
  if (time <= 30) return "c";
  if (time <= 45) return "d";
  if (time <= 60) return "e";
  return "f";
}
