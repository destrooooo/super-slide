"use client";

import type { ScreenState, Rating } from "../types/game";
import levelsData from "../data/levels.json";
import challengeAnimation from "../data/challenge-animation.json";
import gameTimerAnimation from "../data/game-timer-animation.json";
import victoryAnimation from "../data/victory-animation.json";
import scoreData from "../data/score.json";

type LcdScreenProps = {
  screenState: ScreenState;
  levelNum: number;
  countdownValue: number | null;
  timerLeds: boolean[];
  finalRating: Rating | null;
  animationIndex: number;
  isWin: boolean;
};

const getCellBackground = (cell: string): string => {
  if (cell === "red") return "#f3701e";
  if (cell === "blue") return "#4b607f";
  if (cell === "yellow") return "#e8d8c9";
  if (cell === "green") return "#324E44";
  return "transparent";
};

export default function LcdScreen({
  screenState,
  levelNum,
  countdownValue,
  timerLeds,
  finalRating,
  animationIndex,
  isWin,
}: LcdScreenProps) {
  const levels = levelsData as Record<string, string[]>;

  return (
    <div className="flex flex-row">
      <div className="aspect-square w-38 bg-black rounded-xl py-1.5">
        {/* Animation de victoire */}
        {screenState === "victory" && (
          <div className="grid grid-cols-4 grid-rows-5 h-full aspect-4/5 gap-0.5 mx-auto">
            {(victoryAnimation as Record<string, string[]>)[
              animationIndex.toString()
            ]?.map((cell, index) => (
              <div
                className="rounded"
                key={index}
                style={{ background: getCellBackground(cell) }}
              />
            ))}
          </div>
        )}

        {/* Animation "C" d'entrée en mode challenge */}
        {screenState === "challenge-intro" && (
          <div className="grid grid-cols-4 grid-rows-5 h-full aspect-4/5 gap-0.5 mx-auto">
            {(challengeAnimation as Record<string, string[]>)["1"].map(
              (cell, index) => (
                <div
                  className="rounded"
                  key={index}
                  style={{ background: getCellBackground(cell) }}
                />
              ),
            )}
          </div>
        )}

        {/* Countdown 3 → 2 → 1 */}
        {screenState === "countdown" && countdownValue && (
          <div className="grid grid-cols-4 grid-rows-5 h-full aspect-4/5 gap-0.5 mx-auto">
            {(gameTimerAnimation as Record<string, string[]>)[
              countdownValue.toString()
            ]?.map((cell, index) => (
              <div
                className="rounded"
                key={index}
                style={{ background: getCellBackground(cell) }}
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
                style={{ background: isOn ? "#324E44" : "transparent" }}
              />
            ))}
          </div>
        )}

        {/* Affichage du score */}
        {screenState === "score" && finalRating && (
          <div className="grid grid-cols-4 grid-rows-5 h-full aspect-4/5 gap-0.5 mx-auto">
            {(scoreData as Record<string, string[]>)[
              finalRating.toLowerCase()
            ]?.map((cell, index) => (
              <div
                className="rounded"
                key={index}
                style={{ background: getCellBackground(cell) }}
              />
            ))}
          </div>
        )}

        {/* Preview du niveau (par défaut) */}
        {!isWin && screenState === "level-preview" && (
          <div className="grid grid-cols-4 grid-rows-5 h-full aspect-4/5 gap-0.5 mx-auto">
            {levels[levelNum.toString()]?.map((cell, index) => (
              <div
                className="rounded"
                key={index}
                style={{ background: getCellBackground(cell) }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
