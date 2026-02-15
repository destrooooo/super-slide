"use client";

import { useState } from "react";
import { signIn, signUp } from "../lib/auth";

type AuthModalProps = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        await signUp(email, password, username);
      } else {
        await signIn(email, password);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-zinc-800 rounded-2xl p-6 w-full max-w-sm mx-4 border border-zinc-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white mb-4">
          {mode === "login" ? "Connexion" : "Créer un compte"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Pseudo"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="bg-zinc-900 text-white rounded-lg px-4 py-3 border border-zinc-600 focus:border-[#f3701e] focus:outline-none"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-zinc-900 text-white rounded-lg px-4 py-3 border border-zinc-600 focus:border-[#f3701e] focus:outline-none"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="bg-zinc-900 text-white rounded-lg px-4 py-3 border border-zinc-600 focus:border-[#f3701e] focus:outline-none"
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#f3701e] text-white font-bold rounded-lg py-3 mt-1 hover:bg-[#e0631a] disabled:opacity-50 transition-colors"
          >
            {loading
              ? "..."
              : mode === "login"
                ? "Se connecter"
                : "Créer le compte"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError("");
          }}
          className="text-zinc-400 text-sm mt-4 hover:text-white transition-colors w-full text-center"
        >
          {mode === "login"
            ? "Pas de compte ? Créer un compte"
            : "Déjà un compte ? Se connecter"}
        </button>
      </div>
    </div>
  );
}
