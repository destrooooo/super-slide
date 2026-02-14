export type BasePiece = {
  id: number;
  area: string;
  color: string;
};

export type Piece = BasePiece & {
  draggable: {
    x: number;
    y: number;
  };
};

export type ScreenState =
  | "level-preview"
  | "challenge-intro"
  | "countdown"
  | "timer"
  | "victory"
  | "score"
  | "level-number";

export type Rating = "s" | "a" | "b" | "c" | "d" | "e" | "f";

export type GameState = {
  isChallengeMode: boolean;
  levelNum: number;
  isWin: boolean;
  isLose: boolean;
  gameTimer: number;
  screenState: ScreenState;
  finalRating: Rating | null;
  countdownValue: number | null;
  timerLeds: boolean[];
  animationIndex: number;
  animationCycle: number;
};

export type CellColors = "🟥" | "🟦" | "🟨" | "🟩" | "";
export type TimerColor = "#f3701e" | "#e8d8c9" | "#324E44";
