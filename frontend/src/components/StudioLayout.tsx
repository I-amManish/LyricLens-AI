
import type { ReactNode } from "react";

import Header from "./Header";
import Navigation from "./Navigation";
import CreativeToolbar from "./CreativeToolbar";

import MusicProvider from "../features/audio/MusicProvider";

import GestureProvider from "../features/gestures/GestureProvider";

import {
  useGestures,
} from "../features/gestures/gestureContext";

interface StudioLayoutProps {
  children: ReactNode;
}

function StudioLayoutContent({
  children,
}: StudioLayoutProps) {
  const { registerRoot } = useGestures();

  return (
    <div
      ref={registerRoot}
      className="
        studio-shell
        flex
        min-h-dvh
        flex-col
        text-studio-text
        md:h-dvh
        md:overflow-hidden
      "
    >
      <Header />

      <div
        className="
          flex
          min-h-0
          flex-1
          flex-col
          gap-2
          px-2
          pb-2
          md:flex-row
        "
      >
        <Navigation />

        {children}

        <CreativeToolbar />
      </div>
    </div>
  );
}

export default function StudioLayout({
  children,
}: StudioLayoutProps) {
  return (
    <GestureProvider>
      <MusicProvider>
        <StudioLayoutContent>
          {children}
        </StudioLayoutContent>
      </MusicProvider>
    </GestureProvider>
  );
}
