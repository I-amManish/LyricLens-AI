
import type { ReactNode } from "react";

import Header from "./Header";
import Navigation from "./Navigation";
import CreativeToolbar from "./CreativeToolbar";

import MusicPlayer from "../features/audio/MusicPlayer";

interface StudioLayoutProps {
  children: ReactNode;
}

export default function StudioLayout({
  children,
}: StudioLayoutProps) {
  return (
    <div className="studio-shell flex min-h-dvh flex-col text-studio-text md:h-dvh md:overflow-hidden">
      <Header />

      <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 md:flex-row md:px-6">
        <Navigation />

        {children}

        <CreativeToolbar />
      </div>

      <MusicPlayer />
    </div>
  );
}
