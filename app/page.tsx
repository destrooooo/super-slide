"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { area } from "framer-motion/client";

export default function Home() {
  //  12*[1,1], 5*[2,1], 1*[2,2]
  // grid-area: rowStart / colStart / rowEnd / colEnd

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
    console.log(pieces);
    return pieces;
  }

  const [pieces, setPieces] = useState(
    calculateDraggablePieces(parseLevel(levels[3])),
  );

  function calculateDraggablePieces(pieces) {
    // 1. Créer grille 5x4 remplie de false
    const grid = Array(5)
      .fill(null)
      .map(() => Array(4).fill(false));

    // 2. Marquer toutes les cellules occupées par toutes les pièces
    pieces.forEach((piece) => {
      // TODO: parser gridArea pour extraire rowStart, colStart, rowEnd, colEnd
      // grid-area: rowStart / colStart / rowEnd / colEnd
      const [rowStart, colStart, rowEnd, colEnd] = piece.area
        .split("/")
        .map((n) => parseInt(n.trim()));

      // TODO: double boucle pour marquer chaque cellule occupée
      for (let row = rowStart - 1; row < rowEnd - 1; row++)
        for (let col = colStart - 1; col < colEnd - 1; col++)
          grid[row][col] = true;
    });

    // 3. Pour chaque pièce, calculer draggable.x et draggable.y
    return pieces.map((piece) => {
      //parse gridArea

      const [rowStart, colStart, rowEnd, colEnd] = piece.area
        .split("/")
        .map((n) => parseInt(n.trim()));

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

      // Calculer les valeurs x et y
      let x = 0; // 0 = bloqué
      if (canMoveLeft && canMoveRight)
        x = 2; // les deux
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

  const testMove = () => {
    setPieces((prev) =>
      prev.map((piece) =>
        piece.id === 8 ? { ...piece, area: "3/4/5/5" } : piece,
      ),
    );
  };

  return (
    <>
      <button onClick={testMove} className="mb-4 px-4 py-2 bg-blue-500">
        Test Move Piece 1
      </button>
      <div className=" relative w-100 h-125 border grid grid-cols-4 grid-rows-5 gap-2 ">
        <div className="absolute w-[195px] h-[194.4px] bottom-0 left-1/2 bg-red-500 opacity-25 -translate-x-1/2 -z-30"></div>
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
    </>
  );
}
