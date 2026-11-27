
import {
  MonitorSpeaker,
  Plus,
  Unplug,
} from "lucide-react";

import { useMusic } from "./musicContext";

export default function MusicPlayer() {
  const {
    local,
    pc,
    togglePcAudio,
  } = useMusic();

  return (
    <div className="min-w-0">

      {/* Audio source controls */}
      <div
        role="group"
        aria-label="Audio sources"
        className="flex flex-wrap items-center gap-2"
      >
        {/* Add local music */}
        <button
          type="button"
          onClick={local.openMusicSelector}
          aria-label="Upload Music"
          title="Select a local music file"
          data-gesture-disabled="true"
          className="
            flex
            min-h-11
            items-center
            justify-center
            gap-2
            rounded-full
            border
            border-white/25
            bg-black/30
            px-3
            text-sm
            text-white
            transition-colors
            hover:bg-black/50
            sm:px-4
          "
        >
          <Plus size={18} />

          <span>Add music</span>
        </button>

        {/* PC audio capture */}
        <button
          type="button"
          disabled={pc.pcLoading}
          onClick={togglePcAudio}
          aria-label={
            pc.pcConnected
              ? "Disconnect PC Audio"
              : "Connect PC Audio"
          }
          aria-busy={pc.pcLoading}
          data-gesture-disabled={
            pc.pcConnected
              ? undefined
              : "true"
          }
          title={
            pc.pcConnected
              ? "Disconnect PC audio"
              : "Connect authorized system audio"
          }
          className={`
            flex
            min-h-11
            items-center
            justify-center
            gap-2
            rounded-full
            border
            px-3
            text-sm
            transition-colors
            sm:px-4
            ${
              pc.pcConnected
                ? "border-emerald-400/40 bg-emerald-950/60 text-emerald-300"
                : "border-white/25 bg-black/30 text-white hover:bg-black/50"
            }
          `}
        >
          {pc.pcConnected ? (
            <Unplug size={18} />
          ) : (
            <MonitorSpeaker size={18} />
          )}

          <span>
            {pc.pcLoading
              ? "Connecting..."
              : pc.pcConnected
                ? "Disconnect"
                : "PC Audio"}
          </span>
        </button>
      </div>

      {/* External audio information */}
      {pc.pcConnected && (
        <p
          role="status"
          className="mt-2 max-w-xs rounded-lg bg-black/50 px-3 py-2 text-left text-xs text-white/90"
        >
          Audio connected. Control playback in the
          original application.
        </p>
      )}

      {/* Audio errors */}
      {(pc.pcError ||
        (!pc.pcConnected &&
          local.musicError)) && (
        <p
          role="alert"
          className="mt-2 max-w-xs rounded-lg bg-black/70 px-3 py-2 text-left text-xs text-red-300"
        >
          {pc.pcError || local.musicError}
        </p>
      )}
    </div>
  );
}
