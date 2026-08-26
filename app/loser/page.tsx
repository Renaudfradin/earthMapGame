"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function LoserPage() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const router = useRouter();

  useEffect(() => {
    void audioRef.current?.play().catch(() => undefined);
  }, []);

  return (
    <div className="loser-page">
      <div className="loser-content">
        <div className="loser-text">
          <h1>Vous avez perdu</h1>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/alien-lose.gif"
          alt="You lose"
          className="loser-image"
        />
        <div className="loser-button">
          <button type="button" onClick={() => router.push("/play")}>
            Recommencer ?
          </button>
        </div>
      </div>
      <audio ref={audioRef} src="/audio/lose-sound.mp3" loop />
    </div>
  );
}
