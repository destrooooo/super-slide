import type { Piece, Rating } from "./game";

/**
 * Actions pour le reducer du jeu
 * Chaque action représente une intention claire de modification d'état
 */
export type GameAction =
  // Montage du composant
  | { type: "MOUNT" }

  // Gestion des niveaux
  | { type: "SET_LEVEL"; level: number }

  // Gestion du mode challenge
  | { type: "START_CHALLENGE" }
  | { type: "SET_CHALLENGE_INTRO" }
  | { type: "START_COUNTDOWN" }
  | { type: "COUNTDOWN_TICK"; value: number }

  // Gestion du timer
  | { type: "START_TIMER" }
  | { type: "TIMER_TICK" } // Met à jour timer + LEDs + défaite atomiquement

  // Gestion des pièces
  | { type: "MOVE_PIECE"; pieces: Piece[] }
  | { type: "RESET_PIECES"; pieces: Piece[] }

  // Victoire
  | { type: "WIN_GAME"; pieces: Piece[]; rating: Rating | null }

  // Animation de victoire
  | { type: "ANIMATION_TICK" } // Gère index + cycle + transition atomiquement

  // Animation passage de niveaux
  | { type: "LEVEL_NUMBER_TICK" }

  // Reset complet
  | { type: "RESET_GAME" }
  | { type: "RESET_CHALLENGE" }

  // Gestion des animations shake
  | { type: "SHAKE_PIECE"; id: number; direction: "x" | "y" }
  | { type: "CLEAR_SHAKE" }

  // Taille de cellule
  | { type: "SET_CELL_SIZE"; width: number; height: number }

  // Gestion du mode challenge (arrêt)
  | { type: "STOP_CHALLENGE_MODE" }

  // Gestion du timer de pression
  | { type: "SET_HOLDING"; isHolding: boolean };
