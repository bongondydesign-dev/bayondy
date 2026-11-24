import React, { Suspense } from "react";
import { PlayerView } from "@/components/player/PlayerView";

export const instant = false;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function StudentPlayerPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-obsidian text-ice-white">
          <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PlayerView slug={slug} />
    </Suspense>
  );
}
