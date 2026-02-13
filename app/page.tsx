import GameContainer from "./components/GameContainer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f3701e] flex items-center justify-center p-8">
      <div className="relative bg-zinc-800 rounded-3xl shadow-2xl p-4 max-w-md w-full flex flex-col gap-4 drop-shadow-2xl/50">
        <GameContainer initialLevel={1} />
      </div>
    </div>
  );
}
