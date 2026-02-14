"use client";

import { motion } from "framer-motion";
import type { Piece } from "../types/game";

type GameGridProps = {
  pieces: Piece[];
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
  shakeId,
  shakeDirection,
  onDragEnd,
  onGridRef,
}: GameGridProps) {
  return (
    <div
      ref={onGridRef}
      className="relative grid grid-cols-4 grid-rows-5 gap-px w-full bg-neutral-950 p-2 max-xs:p-1.5 max-xxs:p-1 [--pad:0.5rem] max-xs:[--pad:0.375rem] max-xxs:[--pad:0.25rem] rounded-2xl max-xs:rounded-xl max-xxs:rounded-md"
      style={{
        aspectRatio: "4/5",
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6)',
      }}
    >
      <div
        className="absolute bg-[#f3701e] rounded-xl max-xxs:rounded-lg bottom-(--pad) left-1/2 -translate-x-1/2 opacity-20 z-0"
        style={{
          width: `calc((100% - var(--pad) * 2) / 2)`,
          height: `calc((100% - var(--pad) * 2) * 2 / 5)`,
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
            boxShadow: `
              inset 0 1px 1px rgba(255,255,255,0.25),
              inset 0 -1px 1px rgba(0,0,0,0.15)
            `,
          }}
          className="card rounded-xl max-xxs:rounded-lg z-1 cursor-grab"
          data-id={piece.id}
        ></motion.div>
      ))}
    </div>
  );
}
