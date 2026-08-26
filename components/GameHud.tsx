"use client";

import type { GameMode } from "@/types/game";

interface GameHudProps {
  gameMode: GameMode;
  question: string;
  correctScore: number;
  wrongScore: number;
  jokers: number;
  result: string;
  isValidated: boolean;
  selectedCountry: string | null;
  onValidate: () => void;
  onNext: () => void;
}

export default function GameHud({
  gameMode,
  question,
  correctScore,
  wrongScore,
  jokers,
  result,
  isValidated,
  selectedCountry,
  onValidate,
  onNext,
}: GameHudProps) {
  return (
    <>
      <div className="absolute top-4 left-4 text-white z-10 max-w-md">
        <h1 className="text-2xl font-bold mb-4">
          {gameMode === "country" ? "Trouver le Pays" : "Trouver le Monument"}
        </h1>
        <div className="text-lg mb-2">{question}</div>
      </div>
      <div className="absolute top-4 right-4 text-white z-10">
        <div className="text-lg mb-2">Score correct: {correctScore}</div>
        <div className="text-lg mb-2">Score incorrect: {wrongScore}</div>
        <div className="text-lg mb-2">Jokers: {jokers}</div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <button
          type="button"
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={onValidate}
          disabled={isValidated || !selectedCountry}
        >
          Valider
        </button>
        <button
          type="button"
          className={`bg-gray-500 text-white px-4 py-2 rounded ${
            isValidated ? "blinking" : ""
          }`}
          onClick={onNext}
        >
          Suivant
        </button>
        {result ? <p className="mt-2 text-white text-center">{result}</p> : null}
      </div>
    </>
  );
}
