import figures from "../data/figures.json";
import figuresAnimated from "../data/figures-animated.json";

export function generateLevelNumberFrames(levelNum: number): string[][] {
  const figure = figures as Record<string, string[]>;
  const figureAnimated = figuresAnimated as Record<string, string[]>;
  const hundred = Math.floor(levelNum / 100); // 1
  const dozen = Math.floor((levelNum % 100) / 10).toString(); // 2
  const units = (levelNum % 10).toString(); // 3
  const length = levelNum.toString().length;

  if (length === 2) {
    return [
      figure[dozen],
      figureAnimated[dozen],
      figure[units],
      figureAnimated[units],
    ];
  }
  if (length === 3) {
    return [
      figure[hundred],
      figureAnimated[hundred],
      figure[dozen],
      figureAnimated[dozen],
      figure[units],
      figureAnimated[units],
    ];
  } else {
    return [figure[units]];
  }
}
