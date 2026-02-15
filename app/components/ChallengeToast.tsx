"use client";

import { useState } from "react";
import type { Rating } from "../types/game";

export type SaveResult =
  | { needsAuth: true }
  | { needsAuth?: false; saved: boolean; previous_time: number | null };

type ChallengeToastProps = {
  level: number;
  rating: Rating;
  time: number;
  index: number;
  onSave: () => Promise<SaveResult>;
  onClose: () => void;
};

const ratingLabels: Record<Rating, string> = {
  s: "S",
  a: "A",
  b: "B",
  c: "C",
  d: "D",
  e: "E",
  f: "F",
};

export default function ChallengeToast({
  level,
  rating,
  time,
  index,
  onSave,
  onClose,
}: ChallengeToastProps) {
  const [status, setStatus] = useState<
    "idle" | "saving" | "saved" | "not_better" | "error"
  >("idle");
  const [previousTime, setPreviousTime] = useState<number | null>(null);

  const handleSave = async () => {
    setStatus("saving");
    try {
      const result = await onSave();

      if (result.needsAuth) {
        setStatus("idle");
        return;
      }

      if (result.saved) {
        setStatus("saved");
      } else {
        setPreviousTime(result.previous_time);
        setStatus("not_better");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-50 bg-zinc-800 border border-zinc-600 rounded-2xl px-5 py-3 shadow-2xl max-w-sm w-[calc(100%-2rem)] transition-all"
      style={{ top: `${1.5 + index * 4.5}rem` }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-zinc-400 text-xs">Niveau {level}</p>
          <p className="text-white font-bold">
            {ratingLabels[rating]} — {time > 60 ? ">60s" : `${time}s`}
          </p>
          {status === "saved" && (
            <p className="text-green-400 text-xs mt-0.5">Nouveau record !</p>
          )}
          {status === "not_better" && (
            <p className="text-zinc-400 text-xs mt-0.5">
              Ton record est de {previousTime}s
            </p>
          )}
          {status === "error" && (
            <p className="text-red-400 text-xs mt-0.5">Erreur de sauvegarde</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {status === "idle" && (
            <>
              <button
                onClick={handleSave}
                className="bg-[#f3701e] text-white font-bold rounded-lg px-4 py-2 text-sm hover:bg-[#e0631a] transition-colors"
              >
                Sauvegarder
              </button>
              <button
                onClick={onClose}
                className="text-zinc-500 hover:text-white transition-colors text-lg leading-none px-1"
                aria-label="Fermer"
              >
                ✕
              </button>
            </>
          )}
          {status === "saving" && (
            <span className="text-zinc-400 text-sm py-2">...</span>
          )}
          {(status === "saved" ||
            status === "not_better" ||
            status === "error") && (
            <button
              onClick={onClose}
              className="text-zinc-400 text-sm hover:text-white transition-colors py-2"
            >
              Fermer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
