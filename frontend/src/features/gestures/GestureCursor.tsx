
import type {
  Landmark,
} from "./gestureRecognition";

export interface GestureCursorProps {
  cursor: Landmark | null;

  pinching: boolean;
}

export default function GestureCursor({
  cursor,
  pinching,
}: GestureCursorProps) {
  // Hide the cursor when no hand is detected.
  if (!cursor) {
    return null;
  }

  return (
    <div
      data-testid="gesture-cursor"
      data-state={
        pinching
          ? "pinching"
          : "tracking"
      }
      aria-hidden="true"
      style={{
        position: "fixed",

        pointerEvents: "none",

        left: cursor.x,

        top: cursor.y,

        transform: "translate(-50%, -50%)",

        zIndex: 9999,
      }}
      className="grid size-12 place-items-center"
    >
      {/* Outer cursor glow */}
      <div
        className={`
          absolute
          rounded-full
          border-2
          motion-safe:transition-all
          duration-150
          ease-out
          ${
            pinching
              ? "size-6 border-emerald-400 bg-emerald-400/20 shadow-[0_0_18px_rgba(52,211,153,0.55)]"
              : "size-10 border-blue-100/90 bg-blue-200/10 shadow-[0_0_18px_rgba(147,197,253,0.35)]"
          }
        `}
      />

      {/* Inner cursor indicator */}
      <div
        className={`
          absolute
          rounded-full
          motion-safe:transition-all
          duration-150
          ${
            pinching
              ? "size-2 bg-emerald-300"
              : "size-2 bg-white"
          }
        `}
      />
    </div>
  );
}
