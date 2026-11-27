
import {
  createContext,
  useContext,
} from "react";

import type {
  TrackingStatus,
} from "./useHandTracking";

export interface GestureContextValue {
  enabled: boolean;

  cameraReady: boolean;

  status: TrackingStatus;

  error: string;

  toggleGestures: () => void;

  registerRoot: (
    element: HTMLElement | null
  ) => void;

  registerVideo: (
    video: HTMLVideoElement | null
  ) => void;
}

export const GestureContext =
  createContext<GestureContextValue | null>(
    null
  );

export function useGestures(): GestureContextValue {
  const context = useContext(
    GestureContext
  );

  if (!context) {
    throw new Error(
      "useGestures must be used inside GestureProvider."
    );
  }

  return context;
}
