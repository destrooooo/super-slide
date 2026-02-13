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
    <div className="flex flex-row w-full justify-center gap-3 items-center text-[#e8d8c9]">
      <div className="relative flex flex-col h-full items-center justify-center">
        <CaretLeftIcon size={16} weight="fill" className="absolute top-6" />
        <button
          className="relative h-14 aspect-44/58 rounded-xl bg-[#4b607f] drop-shadow-xl active:scale-95 hover:scale-101 ease-in-out duration-75"
          onClick={onLeftClick}
        ></button>
        <p className="absolute bottom-6 h-4 text-xs">L</p>
      </div>
      <div className="relative flex flex-col h-full items-center justify-center">
        <CaretRightIcon size={16} weight="fill" className="absolute top-6" />
        <button
          className="aspect-44/58 h-14 rounded-xl bg-[#4b607f] drop-shadow-xl active:scale-95 hover:scale-101 ease-in-out duration-75"
          onClick={onRightClick}
          onMouseDown={onRightMouseDown}
          onMouseUp={onRightMouseUp}
          onMouseLeave={onRightMouseLeave}
        ></button>
        <p className="absolute bottom-6 h-4 text-xs">C</p>
      </div>
      <div className="relative flex flex-col h-full items-center justify-center">
        <CircleIcon size={16} weight="bold" className="absolute top-6" />
        <button
          className="aspect-44/58 h-14 rounded-xl bg-[#f3701e] drop-shadow-xl active:scale-95 hover:scale-101 ease-in-out duration-75"
          onClick={onRedClick}
          onMouseDown={onRedMouseDown}
          onMouseLeave={onRedMouseLeave}
          onMouseUp={onRedMouseUp}
        />
        <p className="absolute bottom-6 h-4 max-w-fit text-xs whitespace-nowrap font-light ">
          ON / OFF
        </p>
      </div>
    </div>
  );
}
