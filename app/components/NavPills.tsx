"use client";

type NavPillsProps = {
  active: "game" | "leaderboard";
  onChange: (tab: "game" | "leaderboard") => void;
};

export default function NavPills({ active, onChange }: NavPillsProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
      <div className="bg-zinc-900 rounded-full p-1 flex gap-1">
        <button
          onClick={() => onChange("game")}
          className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
            active === "game"
              ? "bg-[#f3701e] text-white shadow-md"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Jeu
        </button>
        <button
          onClick={() => onChange("leaderboard")}
          className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
            active === "leaderboard"
              ? "bg-[#f3701e] text-white shadow-md"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Classement
        </button>
      </div>
    </div>
  );
}
