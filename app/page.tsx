"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const MODAL_CONTENT = `Bienvenue jeune terrien,
Nous avons besoin de ton aide pour cartographier les lieux.
Apparemment votre "Terre" se compose de plusieurs territoires que l'on appelle pays.
Nous avons besoin de les enregistrer dans notre base de donnees, c'est pourquoi nous vous avons choisi !

Instructions: Vous devez choisir entre deux modes de jeu:
1. Trouver le pays correspondant au nom fourni.
2. Trouver le pays correspondant au monument fourni.
Vous devez obtenir 5 reponses correctes pour gagner.
Attention! 5 mauvaises reponses et vous perdez.

Bonne chance !`;

type Phase = "intro" | "hyperspace";

export default function IntroductionPage() {
  const router = useRouter();
  const [showButton, setShowButton] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState("");
  const [showUnderscore, setShowUnderscore] = useState(false);
  const [phase, setPhase] = useState<Phase>("intro");
  const audioRef = useRef<HTMLAudioElement>(null);
  const jumpRef = useRef<{ cleanup: () => void } | null>(null);
  const modalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const firstLine = "EarthMap";
  const secondLine = "Game";
  const fullTextLength = firstLine.length + secondLine.length;

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index++;
      if (index >= fullTextLength) {
        clearInterval(interval);
        setTimeout(() => setShowButton(true), 1000);
      }
    }, 150);
    return () => clearInterval(interval);
  }, [fullTextLength]);

  useEffect(() => {
    if (!showModal) return;
    let index = 0;
    const interval = setInterval(() => {
      index++;
      setModalText(MODAL_CONTENT.slice(0, index));
      if (index >= MODAL_CONTENT.length) {
        clearInterval(interval);
        setShowUnderscore(true);
      }
    }, 35);
    void audioRef.current?.play().catch(() => undefined);
    return () => clearInterval(interval);
  }, [showModal]);

  useEffect(() => {
    return () => {
      if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
      jumpRef.current?.cleanup();
    };
  }, []);

  const startHyperspace = async () => {
    setPhase("hyperspace");
    const { default: JumpToHyperspace } = await import("@/lib/hyperspace");
    const instance = new JumpToHyperspace();
    jumpRef.current = instance;
    modalTimerRef.current = setTimeout(() => {
      setShowModal(true);
    }, 10000);
  };

  const handleContinue = () => {
    jumpRef.current?.cleanup();
    jumpRef.current = null;
    setShowModal(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    router.push("/play");
  };

  const modalLines = modalText.split("\n");

  return (
    <div className="introduction">
      <audio ref={audioRef} loop>
        <source src="/audio/alien-talking.mp3" type="audio/mpeg" />
      </audio>
      {phase === "intro" && (
        <>
          <div className="intro-container">
            <div className="line">
              {firstLine.split("").map((char, index) => (
                <span
                  key={`a-${index}`}
                  className="letter"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {char}
                </span>
              ))}
            </div>
            <div className="line">
              {secondLine.split("").map((char, index) => (
                <span
                  key={`b-${index}`}
                  className="letter"
                  style={{
                    animationDelay: `${(index + firstLine.length) * 0.15}s`,
                  }}
                >
                  {char}
                </span>
              ))}
            </div>
          </div>
          {showButton && (
            <button
              type="button"
              onClick={() => void startHyperspace()}
              className="start-button"
            >
              C&apos;est parti !
            </button>
          )}
        </>
      )}
      {phase === "hyperspace" && <div id="hyperspace-animation" />}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="modal-anim" />
            <span className="modal-anim" />
            <span className="modal-anim" />
            <span className="modal-anim" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/alien-talking.gif"
              alt="Alien"
              className="modal-image"
            />
            <div className="modal-body">
              <div className="modal-text">
                {modalLines.map((line, i) => (
                  <div key={i} className="modal-line">
                    {line}
                    {i === modalLines.length - 1 && showUnderscore ? (
                      <span className="blink">_</span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleContinue}
            className="continue-button"
          >
            Continuer
          </button>
        </div>
      )}
    </div>
  );
}
