"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CaretLeftIcon,
  CaretRightIcon,
  CircleIcon,
  QuestionIcon,
  XIcon,
  ArrowsOutCardinalIcon,
} from "@phosphor-icons/react";

function MiniGrid() {
  return (
    <div className="relative grid grid-cols-4 grid-rows-5 gap-px w-28 aspect-4/5 bg-neutral-950 rounded-lg p-1 mx-auto my-3">
      {/* Zone de sortie */}
      <div
        className="absolute rounded bg-[#f3701e] opacity-20 bottom-1 left-1/2 -translate-x-1/2"
        style={{
          width: "calc((100% - 0.5rem) / 2)",
          height: "calc((100% - 0.5rem) * 2 / 5)",
        }}
      />
      {/* Beige 1x1 */}
      <div
        className="rounded-sm bg-[#e8d8c9]"
        style={{ gridArea: "1 / 1 / 2 / 2" }}
      />
      {/* Bleu 2x1 horizontal */}
      <div
        className="rounded-sm bg-[#4b607f]"
        style={{ gridArea: "1 / 2 / 2 / 4" }}
      />
      {/* Beige 1x1 */}
      <div
        className="rounded-sm bg-[#e8d8c9]"
        style={{ gridArea: "1 / 4 / 2 / 5" }}
      />
      {/* Rouge 2x2 */}
      <div
        className="rounded-sm bg-[#f3701e]"
        style={{ gridArea: "2 / 2 / 4 / 4" }}
      />
      {/* Beige 1x1 */}
      <div
        className="rounded-sm bg-[#e8d8c9]"
        style={{ gridArea: "2 / 4 / 3 / 5" }}
      />
      {/* Bleu 1x2 vertical */}
      <div
        className="rounded-sm bg-[#4b607f]"
        style={{ gridArea: "2 / 1 / 4 / 2" }}
      />
      {/* Bleu 2x1 horizontal */}
      <div
        className="rounded-sm bg-[#4b607f]"
        style={{ gridArea: "4 / 1 / 5 / 3" }}
      />
      {/* Beige 1x1 */}
      <div
        className="rounded-sm bg-[#e8d8c9]"
        style={{ gridArea: "4 / 3 / 5 / 4" }}
      />
      {/* Beige 1x1 */}
      <div
        className="rounded-sm bg-[#e8d8c9]"
        style={{ gridArea: "3 / 4 / 4 / 5" }}
      />
      {/* Beige 1x1 */}
      <div
        className="rounded-sm bg-[#e8d8c9]"
        style={{ gridArea: "5 / 1 / 6 / 2" }}
      />
      {/* Beige 1x1 */}
      <div
        className="rounded-sm bg-[#e8d8c9]"
        style={{ gridArea: "4 / 4 / 5 / 5" }}
      />
      {/* Beige 1x1 */}
      <div
        className="rounded-sm bg-[#e8d8c9]"
        style={{ gridArea: "5 / 2 / 6 / 3" }}
      />
      {/* Vide: row 5 cols 3-4 */}
    </div>
  );
}

function MiniButton({
  color,
  icon,
  label,
}: {
  color: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-7 h-9 rounded-md flex items-center justify-center shrink-0"
        style={{
          background: color,
          boxShadow:
            "0 3px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        {icon}
      </div>
      <span className="text-sm">{label}</span>
    </div>
  );
}

function InlinePiece({
  color,
  size = "1x1",
}: {
  color: string;
  size?: "1x1" | "2x1" | "2x2";
}) {
  const sizeClass =
    size === "2x2" ? "w-5 h-5" : size === "2x1" ? "w-7 h-3.5" : "w-3.5 h-3.5";
  return (
    <span
      className={`inline-block ${sizeClass} rounded-sm align-middle mx-0.5`}
      style={{ background: color }}
    />
  );
}

function PanelContent({ onClose }: { onClose: () => void }) {
  return (
    <>
      {/* Header */}
      <div className="sticky top-0 bg-zinc-800 z-10 flex items-center justify-between p-4 pb-2 border-b border-white/10">
        <h2 className="text-lg font-bold text-[#f3701e]">Comment jouer</h2>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <XIcon weight="bold" className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-5 text-sm leading-relaxed">
        {/* But du jeu */}
        <section>
          <h3 className="font-semibold text-[#f3701e] mb-2">But du jeu</h3>
          <p>
            Pour gagner, il faut amener la pièce rouge
            <InlinePiece color="#f3701e" size="2x2" />
            jusqu&apos;à la zone de sortie en bas de la grille.
          </p>
          <MiniGrid />
          <p className="text-xs text-[#e8d8c9]/60 text-center">
            La zone orange translucide représente la sortie
          </p>
        </section>

        <hr className="border-white/10" />

        {/* Déplacer les pièces */}
        <section>
          <h3 className="font-semibold text-[#f3701e] mb-2">Les pièces</h3>
          <div className="flex items-start gap-3 mb-2">
            <ArrowsOutCardinalIcon
              weight="bold"
              className="w-6 h-6 text-[#f3701e] shrink-0 mt-0.5"
            />
            <p>
              Les pièces se déplacent horizontalement ou verticalement et ne
              peuvent pas se chevaucher.
            </p>
          </div>
          <div className="space-y-1.5 text-xs text-[#e8d8c9]/70">
            <p>
              <InlinePiece color="#f3701e" size="2x2" /> Pièce rouge (2x2) —
              c&apos;est celle qu&apos;il faut amener à la sortie
            </p>
            <p>
              <InlinePiece color="#4b607f" size="2x1" /> Pièces bleues (2x1) —
              elles bloquent le passage
            </p>
            <p>
              <InlinePiece color="#e8d8c9" /> Pièces beiges (1x1) — elles
              bloquent aussi
            </p>
          </div>
        </section>

        <hr className="border-white/10" />

        {/* Les boutons */}
        <section>
          <h3 className="font-semibold text-[#f3701e] mb-3">Les boutons</h3>
          <div className="space-y-3">
            <MiniButton
              color="#4b607f"
              icon={
                <CaretLeftIcon
                  weight="fill"
                  className="w-3 h-3 text-[#e8d8c9]"
                />
              }
              label="Niveau précédent"
            />
            <MiniButton
              color="#4b607f"
              icon={
                <CaretRightIcon
                  weight="fill"
                  className="w-3 h-3 text-[#e8d8c9]"
                />
              }
              label="Niveau suivant"
            />
            <div className="pl-10 text-xs text-[#e8d8c9]/60">
              Appui long → active le mode challenge
            </div>
            <MiniButton
              color="#f3701e"
              icon={
                <CircleIcon weight="bold" className="w-3 h-3 text-[#e8d8c9]" />
              }
              label="Recommencer le niveau"
            />
            <div className="pl-10 text-xs text-[#e8d8c9]/60">
              En challenge : appui long → quitte le mode
            </div>
          </div>
        </section>

        <hr className="border-white/10" />

        {/* Mode Challenge */}
        <section>
          <h3 className="font-semibold text-[#f3701e] mb-2">Mode Challenge</h3>
          <p className="mb-2">
            Le mode challenge s&apos;active en maintenant le bouton
            <span className="inline-flex items-center mx-1 align-middle">
              <span
                className="inline-block w-4 h-5 rounded-sm"
                style={{ background: "#4b607f" }}
              />
            </span>
            C pendant 3 secondes.
          </p>
          <ul className="space-y-1.5 text-xs text-[#e8d8c9]/70 list-none">
            <li>Un compte à rebours 3 → 2 → 1 apparait</li>
            <li>
              Le chronomètre se lance et les LEDs s&apos;éteignent une à une
            </li>
            <li>Le puzzle doit être résolu avant que le temps soit écoulé</li>
            <li>
              Le score va de <span className="text-[#f3701e] font-bold">S</span>{" "}
              (rapide) à <span className="text-[#f3701e] font-bold">F</span>{" "}
              (lent)
            </li>
          </ul>
        </section>

        <div className="h-4" />
      </div>
    </>
  );
}

export default function TutorialPanel() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Bouton "?" flottant en bas à droite de l'écran */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-[#4b607f] text-[#e8d8c9] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-30"
      >
        <QuestionIcon weight="bold" className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Mobile: modal plein écran */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-0 z-50 bg-zinc-800 text-[#e8d8c9] overflow-y-auto lg:hidden"
            >
              <PanelContent onClose={() => setIsOpen(false)} />
            </motion.div>

            {/* Desktop: side panel pleine hauteur */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="hidden lg:flex lg:flex-col fixed right-0 top-0 h-full w-md z-50 bg-zinc-800 text-[#e8d8c9] overflow-y-auto border-l border-white/10"
              style={{
                boxShadow: "-4px 0 20px rgba(0,0,0,0.3)",
              }}
            >
              <PanelContent onClose={() => setIsOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
