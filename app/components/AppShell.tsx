"use client";

import { useState } from "react";
import GameWrapper from "./GameWrapper";
import NavPills from "./NavPills";
import TutorialPanel from "./TutorialPanel";

export default function AppShell() {
  const [activeTab, setActiveTab] = useState<"game" | "leaderboard">("game");

  return (
    <div className="relative max-w-md w-full">
      <div
        className="bg-zinc-800 rounded-3xl p-4 w-full flex flex-col gap-4 select-none aspect-199/313"
        style={{
          boxShadow: `
            0 20px 40px rgba(0,0,0,0.4),
            0 0 0 3px #1a1a1a,
            inset 0 1px 0 rgba(255,255,255,0.05),
            inset 0 -2px 0 rgba(0,0,0,0.3)
          `,
        }}
      >
        <GameWrapper activeTab={activeTab} />
      </div>

      <NavPills active={activeTab} onChange={setActiveTab} />
      <TutorialPanel />
    </div>
  );
}
