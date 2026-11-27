
import {
  createContext,
  useContext,
} from "react";

import type useMusicPlayer from "./useMusicPlayer";
import type usePcAudio from "./usePcAudio";

// Expose only the state and actions
// required by the playback UI.
export type LocalMusicControls = Pick<
  ReturnType<typeof useMusicPlayer>,
  | "currentTime"
  | "duration"
  | "volume"
  | "musicError"
  | "openMusicSelector"
  | "togglePlayback"
  | "handleSeek"
  | "handleVolumeChange"
>;

export interface MusicContextValue {
  local: LocalMusicControls;
  pc: ReturnType<typeof usePcAudio>;

  isPlaying: boolean;
  localPlaybackDisabled: boolean;

  displayedTrackName: string;
  displayedSource: string;

  togglePcAudio: () => void;
}

export const MusicContext =
  createContext<MusicContextValue | null>(
    null
  );

export function useMusic(): MusicContextValue {
  const context = useContext(MusicContext);

  if (!context) {
    throw new Error(
      "useMusic must be used inside MusicProvider."
    );
  }

  return context;
}
