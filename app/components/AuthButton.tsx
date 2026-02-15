"use client";

import { useState } from "react";
import { useAuth } from "../hooks";
import { signOut } from "../lib/auth";
import AuthModal from "./AuthModal";

export default function AuthButton() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) return null;

  return (
    <>
      {user ? (
        <button
          onClick={() => signOut()}
          className="text-white/80 text-sm hover:text-white transition-colors"
        >
          {user.email} — Déconnexion
        </button>
      ) : (
        <button
          onClick={() => setShowAuthModal(true)}
          className="text-white/80 text-sm hover:text-white transition-colors"
        >
          Se connecter
        </button>
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      )}
    </>
  );
}
