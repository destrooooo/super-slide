import GameContainer from "./components/GameContainer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f3701e] flex items-center justify-center p-8 max-sm:p-2">
      <div
        className="relative bg-zinc-800 rounded-3xl p-4 max-w-md w-full flex flex-col gap-4 select-none"
        style={{
          boxShadow: `
            0 20px 40px rgba(0,0,0,0.4),
            0 0 0 3px #1a1a1a,
            inset 0 1px 0 rgba(255,255,255,0.05),
            inset 0 -2px 0 rgba(0,0,0,0.3)
          `,
        }}
      >
        <GameContainer initialLevel={1} />
      </div>
    </div>
  );
}
