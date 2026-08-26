"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function WinnerPage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/audio/winner-sound.mp3");
    audio.loop = true;
    audioRef.current = audio;
    void audio.play().catch(() => undefined);
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    router.push("/play");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black">
      <div className="text-left text-white text-2xl font-bold mb-4">
        Vous avez gagne !
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGVqc3hidmd1azRzemYyeWhwc3cyaWt5ZXNtZnJqbzFyNjZ4cnVvNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3ov9jDXQIo4FP1DRHa/giphy.webp"
        alt="You win!"
        className="max-h-[70vh] w-auto object-contain"
      />
      <button
        type="button"
        onClick={handleRestart}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
      >
        Recommencer ?
      </button>
    </div>
  );
}
