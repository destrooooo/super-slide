"use client";

import {
  CaretRightIcon,
  CaretLeftIcon,
  CircleIcon,
} from "@phosphor-icons/react";

type ControlButtonsProps = {
  levelNum: number;
  onLeftClick: () => void;
  onRightClick: () => void;
  onRightMouseDown: () => void;
  onRightMouseUp: () => void;
  onRightMouseLeave: () => void;
  onRedClick: () => void;
  onRedMouseDown: () => void;
  onRedMouseUp: () => void;
  onRedMouseLeave: () => void;
};

const buttonSize = {
  height: "50cqh",
  width: "calc(50cqh * 44 / 58)",
} as const;

export default function ControlButtons({
  onLeftClick,
  onRightClick,
  onRightMouseDown,
  onRightMouseUp,
  onRightMouseLeave,
  onRedClick,
  onRedMouseDown,
  onRedMouseUp,
  onRedMouseLeave,
}: ControlButtonsProps) {
  return (
    <div
      className="grid grid-flow-col auto-cols-auto px-3  justify-evenly w-2/3 h-full text-[#e8d8c9] text-xs max-xxs:text-[10px] text-nowrap"
      style={{ containerType: "size" }}
    >
      <div className="relative flex flex-col h-full items-center justify-center">
        <CaretLeftIcon
          weight="fill"
          className="absolute top-1/10 h-4 max-xxs:top-2 max-xxs:h-fit"
        />
        <button
          className="rounded-lg max-xxs:rounded-md bg-[#4b607f] drop-shadow-xl active:scale-95 hover:scale-101 ease-in-out duration-75"
          style={buttonSize}
          onClick={onLeftClick}
        ></button>
        <p className="absolute bottom-1/10 h-4 max-xxs:bottom-2 max-xxs:h-fit">
          L
        </p>
      </div>
      <div className="relative flex flex-col h-full items-center justify-center">
        <CaretRightIcon
          weight="fill"
          className="absolute top-1/10 h-4 max-xxs:top-2 max-xxs:h-fit"
        />
        <button
          className="rounded-lg max-xxs:rounded-md bg-[#4b607f] drop-shadow-xl active:scale-95 hover:scale-101 ease-in-out duration-75"
          style={buttonSize}
          onClick={onRightClick}
          onMouseDown={onRightMouseDown}
          onMouseUp={onRightMouseUp}
          onMouseLeave={onRightMouseLeave}
        ></button>
        <p className="absolute bottom-1/10 h-4 max-xxs:bottom-2 max-xxs:h-fit">
          C
        </p>
      </div>
      <div className="relative flex flex-col h-full items-center justify-center">
        <CircleIcon
          weight="bold"
          className="absolute top-1/10 h-4 max-xxs:top-2 max-xxs:h-fit"
        />
        <button
          className="rounded-lg max-xxs:rounded-md bg-[#f3701e] drop-shadow-xl active:scale-95 hover:scale-101 ease-in-out duration-75"
          style={buttonSize}
          onClick={onRedClick}
          onMouseDown={onRedMouseDown}
          onMouseLeave={onRedMouseLeave}
          onMouseUp={onRedMouseUp}
        />
        <p className="absolute bottom-1/10 h-4 max-xxs:bottom-2 max-xxs:h-fit">
          ON / OFF
        </p>
      </div>
    </div>
  );
}
