"use client";

import { motion } from "framer-motion";
import type { Piece } from "../types/game";

type GameGridProps = {
  pieces: Piece[];
  cellSize: { width: number; height: number };
  shakeId: number | null;
  shakeDirection: "x" | "y" | null;
  onDragEnd: (piece: Piece, info: { offset: { x: number; y: number } }) => void;
  onGridRef: (ref: HTMLDivElement | null) => void;
};

const getPieceBackground = (color: string): string => {
  if (color === "🟥") return "#f3701e";
  if (color === "🟦") return "#4b607f";
  if (color === "🟨") return "#e8d8c9";
  return "#4b607f";
};

export default function GameGrid({
  pieces,
  cellSize,
  shakeId,
  shakeDirection,
  onDragEnd,
  onGridRef,
}: GameGridProps) {
  return (
    <div
      ref={onGridRef}
      className="relative grid grid-cols-4 grid-rows-5 gap-px w-full bg-neutral-950 p-2 rounded-2xl"
      style={{ aspectRatio: "4/5" }}
    >
      <div
        className="absolute bg-[#f3701e] rounded-xl bottom-2 left-1/2 -translate-x-1/2 opacity-20 z-0"
        style={{
          width: `calc(${cellSize.width * 2}px)`,
          height: `calc(${cellSize.height * 2}px)`,
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
          onDragEnd={(_, info) => onDragEnd(piece, info)}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0}
          style={{
            gridArea: piece.area,
            background: getPieceBackground(piece.color),
          }}
          className="card rounded-xl z-1 drop-shadow-lg cursor-grab"
          data-id={piece.id}
        ></motion.div>
      ))}
    </div>
  );
}
