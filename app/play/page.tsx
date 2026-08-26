"use client";

import { Suspense } from "react";
import PlayGame from "@/components/PlayGame";

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black text-white">
          Chargement...
        </div>
      }
    >
      <PlayGame />
    </Suspense>
  );
}
