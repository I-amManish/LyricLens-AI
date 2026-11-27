
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import { GestureContext } from "./gestureContext";

import type {
  GestureContextValue,
} from "./gestureContext";

import type {
  Landmark,
} from "./gestureRecognition";

import useHandTracking from "./useHandTracking";
import useGestureControl from "./useGestureControl";

export interface GestureProviderProps {
  children: ReactNode;
}

export default function GestureProvider({
  children,
}: GestureProviderProps) {
  const [enabled, setEnabled] =
    useState(false);

  const [root, setRoot] =
    useState<HTMLElement | null>(null);

  const [video, setVideo] =
    useState<HTMLVideoElement | null>(null);

  const [fullscreen, setFullscreen] =
    useState(() =>
      Boolean(document.fullscreenElement)
    );

  const cameraReady = video !== null;

  const trackingEnabled =
    enabled &&
    cameraReady &&
    root !== null &&
    !fullscreen;

  const {
    fingertip,
    pinching,
    onLandmarks,
    reset,
  } = useGestureControl(root, video);

  // Pause tracking while the camera is fullscreen.
  useEffect(() => {
    function handleFullscreenChange() {
      reset();

      setFullscreen(
        Boolean(document.fullscreenElement)
      );
    }

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, [reset]);

  const toggleGestures = useCallback(() => {
    reset();

    setEnabled(
      (previous) => !previous
    );
  }, [reset]);

  const registerRoot = useCallback(
    (element: HTMLElement | null) => {
      reset();
      setRoot(element);
    },
    [reset]
  );

  const registerVideo = useCallback(
    (element: HTMLVideoElement | null) => {
      reset();
      setVideo(element);
    },
    [reset]
  );

  const handleLandmarks = useCallback(
    (landmarks: Landmark[]) => {
      if (
        !trackingEnabled ||
        document.fullscreenElement
      ) {
        return;
      }

      onLandmarks(landmarks);
    },
    [trackingEnabled, onLandmarks]
  );

  const { status, error } =
    useHandTracking({
      video,
      enabled: trackingEnabled,
      onLandmarks: handleLandmarks,
    });

  const contextValue =
    useMemo<GestureContextValue>(
      () => ({
        enabled,
        cameraReady,
        status,
        error,
        toggleGestures,
        registerRoot,
        registerVideo,
      }),
      [
        enabled,
        cameraReady,
        status,
        error,
        toggleGestures,
        registerRoot,
        registerVideo,
      ]
    );

  const showCursor =
    trackingEnabled &&
    status === "tracking";

  return (
    <GestureContext.Provider
      value={contextValue}
    >
      {children}

      {/* Single functional fingertip cursor */}
      {showCursor && fingertip && (
        <span
          data-testid="fingertip-marker"
          data-state={
            pinching
              ? "pinching"
              : "tracking"
          }
          aria-hidden="true"
          style={{
            position: "fixed",
            left: fingertip.x,
            top: fingertip.y,
            transform:
              "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 9999,
          }}
          className={`
            size-3
            rounded-full
            border
            border-white
            bg-emerald-400
            motion-safe:transition-shadow
            duration-150
            ${
              pinching
                ? "shadow-[0_0_0_7px_rgba(52,211,153,0.30),0_0_18px_rgba(52,211,153,0.85)]"
                : "shadow-[0_0_10px_rgba(52,211,153,0.8)]"
            }
          `}
        />
      )}
    </GestureContext.Provider>
  );
}
