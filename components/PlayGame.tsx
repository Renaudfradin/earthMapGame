"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import GameHud from "@/components/GameHud";
import {
  COUNTRY_JOKERS,
  LOSE_SCORE,
  MONUMENT_JOKERS,
  pickRandomCountry,
  pickRandomMonument,
  WIN_SCORE,
} from "@/lib/game";
import { getCountryNames, getWorldGeoJson } from "@/lib/worldGeoJson";
import type { GameMode, Monument, Rotation } from "@/types/game";
import monumentsData from "@/data/monuments.json";
import translationsData from "@/data/translations.json";

const GlobeMap = dynamic(() => import("@/components/GlobeMap"), {
  ssr: false,
  loading: () => (
    <div className="globe-map-container flex items-center justify-center text-white/70">
      Chargement du globe...
    </div>
  ),
});

const StarryBackground = dynamic(
  () => import("@/components/StarryBackground"),
  { ssr: false }
);

const monuments = monumentsData as Monument[];
const translations = translationsData as Record<string, string>;

function translateCountry(name: string): string {
  return translations[name] || name;
}

export default function PlayGame() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const gameMode: GameMode | null =
    modeParam === "country" || modeParam === "monument" ? modeParam : null;

  const [countryNames, setCountryNames] = useState<string[]>([]);
  const [targetCountry, setTargetCountry] = useState<string | null>(null);
  const [targetMonument, setTargetMonument] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [result, setResult] = useState("");
  const [wrongGuess, setWrongGuess] = useState<string | null>(null);
  const [correctGuess, setCorrectGuess] = useState<string | null>(null);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [rotation, setRotation] = useState<Rotation>([0, 0, 0]);
  const [correctScore, setCorrectScore] = useState(0);
  const [wrongScore, setWrongScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showChoice, setShowChoice] = useState(false);
  const [countryJokers, setCountryJokers] = useState(COUNTRY_JOKERS);
  const [monumentJokers, setMonumentJokers] = useState(MONUMENT_JOKERS);
  const [visitedCountries, setVisitedCountries] = useState<string[]>([]);
  const [visitedMonuments, setVisitedMonuments] = useState<string[]>([]);
  const [introText, setIntroText] = useState("");
  const [showUnderscore, setShowUnderscore] = useState(false);
  const [roundReady, setRoundReady] = useState(false);

  useEffect(() => {
    getWorldGeoJson()
      .then((data) => setCountryNames(getCountryNames(data)))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (gameMode) {
      setIsPlaying(true);
      setShowChoice(false);
      setRotation([-10, 0, 0]);
    }
  }, [gameMode]);

  const beginRound = useCallback(
    (mode: GameMode, countries: string[], visitedC: string[], visitedM: string[]) => {
      if (mode === "country") {
        const next = pickRandomCountry(countries, visitedC);
        if (!next) return;
        setVisitedCountries([...visitedC, next]);
        setTargetCountry(next);
        setTargetMonument(null);
      } else {
        const next = pickRandomMonument(monuments, visitedM);
        if (!next) return;
        setVisitedMonuments([...visitedM, next.monument]);
        setTargetCountry(next.country);
        setTargetMonument(next.monument);
      }
      setSelectedCountry(null);
      setWrongGuess(null);
      setCorrectGuess(null);
      setIsValidated(false);
      setResult("");
      setRoundReady(true);
    },
    []
  );

  useEffect(() => {
    if (!gameMode || countryNames.length === 0 || roundReady) return;
    beginRound(gameMode, countryNames, visitedCountries, visitedMonuments);
  }, [
    gameMode,
    countryNames,
    roundReady,
    visitedCountries,
    visitedMonuments,
    beginRound,
  ]);

  useEffect(() => {
    if (!wrongGuess && !correctGuess) {
      setIsBlinking(false);
      return;
    }
    setIsBlinking(true);
    const blinkInterval = setInterval(() => {
      setIsBlinking((prev) => !prev);
    }, 500);
    return () => clearInterval(blinkInterval);
  }, [wrongGuess, correctGuess]);

  useEffect(() => {
    if (isPlaying || showChoice || gameMode) return;
    const fullText = "Earth 841_\nSystem 451-b";
    let index = 0;
    const interval = setInterval(() => {
      index++;
      setIntroText(fullText.slice(0, index));
      if (index >= fullText.length) {
        clearInterval(interval);
        setShowUnderscore(true);
      }
    }, 150);
    return () => clearInterval(interval);
  }, [isPlaying, showChoice, gameMode]);

  const handleCountrySelected = useCallback(
    (countryName: string) => {
      if (!isValidated) {
        setSelectedCountry(countryName);
      }
    },
    [isValidated]
  );

  const validateSelection = () => {
    if (isValidated || !selectedCountry || !targetCountry || !gameMode) return;
    setIsValidated(true);

    if (selectedCountry === targetCountry) {
      setResult("Correct! Bien joue.");
      const nextScore = correctScore + 1;
      setCorrectScore(nextScore);
      setCorrectGuess(targetCountry);
      if (nextScore >= WIN_SCORE) {
        router.push("/winner");
      }
    } else {
      if (gameMode === "monument") {
        setResult(
          `Incorrect. Vous avez choisi ${translateCountry(selectedCountry)}. C'etait ${translateCountry(targetCountry)}.`
        );
      } else {
        setResult(
          `Incorrect. Vous avez choisi ${translateCountry(selectedCountry)}.`
        );
      }
      const nextWrong = wrongScore + 1;
      setWrongScore(nextWrong);
      setWrongGuess(selectedCountry);
      if (nextWrong >= LOSE_SCORE) {
        router.push("/loser");
      }
    }
  };

  const nextCountry = () => {
    if (!gameMode || countryNames.length === 0) return;

    if (!selectedCountry && !isValidated) {
      if (gameMode === "country") {
        if (countryJokers <= 0) return;
        setCountryJokers((j) => j - 1);
      } else {
        if (monumentJokers <= 0) return;
        setMonumentJokers((j) => j - 1);
      }
    }

    beginRound(gameMode, countryNames, visitedCountries, visitedMonuments);
  };

  const handlePlay = () => setShowChoice(true);

  const handleGameChoice = (mode: GameMode) => {
    setShowChoice(false);
    setIsPlaying(true);
    setRotation([-10, 0, 0]);
    setRoundReady(false);
    setTargetCountry(null);
    setVisitedCountries([]);
    setVisitedMonuments([]);
    router.push(`/play?mode=${mode}`);
  };

  const question = useMemo(() => {
    if (!gameMode || !targetCountry) return "";
    if (gameMode === "country") {
      return `Trouve le bon pays: ${translateCountry(targetCountry)}`;
    }
    return `A quel pays appartient ce monument: ${targetMonument ?? ""}`;
  }, [gameMode, targetCountry, targetMonument]);

  const introLines = introText.split("\n");

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-4">
      <StarryBackground rotation={rotation} />
      <div className="w-full flex justify-center items-center mb-4">
        <GlobeMap
          targetCountry={targetCountry}
          onCountrySelected={handleCountrySelected}
          selectedCountry={selectedCountry}
          wrongGuess={wrongGuess}
          correctGuess={correctGuess}
          isBlinking={isBlinking}
          isValidated={isValidated}
          onRotationChange={setRotation}
          isPlaying={isPlaying}
        />
      </div>

      {!isPlaying && !showChoice && !gameMode && (
        <>
          <div className="text-animation">
            {introLines.map((line, index) => (
              <div key={index} className="text-line whereist-font">
                {line}
                {index === introLines.length - 1 && showUnderscore ? (
                  <span className="blink">_</span>
                ) : null}
              </div>
            ))}
          </div>
          <button type="button" className="play-button" onClick={handlePlay}>
            Jouer
          </button>
        </>
      )}

      {showChoice && (
        <div className="choice-modal">
          <div className="choice-content">
            <button
              type="button"
              onClick={() => handleGameChoice("country")}
              className="choice-button"
            >
              Trouver le pays
            </button>
            <button
              type="button"
              onClick={() => handleGameChoice("monument")}
              className="choice-button"
            >
              Trouver le monument
            </button>
          </div>
        </div>
      )}

      {isPlaying && gameMode && (
        <GameHud
          gameMode={gameMode}
          question={question}
          correctScore={correctScore}
          wrongScore={wrongScore}
          jokers={gameMode === "country" ? countryJokers : monumentJokers}
          result={result}
          isValidated={isValidated}
          selectedCountry={selectedCountry}
          onValidate={validateSelection}
          onNext={nextCountry}
        />
      )}
    </div>
  );
}
