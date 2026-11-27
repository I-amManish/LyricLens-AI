
import {
  useEffect,
  useEffectEvent,
  useState,
} from "react";

import type {
  HandLandmarker,
} from "@mediapipe/tasks-vision";

import type {
  Landmark,
} from "./gestureRecognition";

export type TrackingStatus =
  | "idle"
  | "loading"
  | "tracking"
  | "error";

export interface HandTrackingOptions {
  video: HTMLVideoElement | null;

  enabled: boolean;

  onLandmarks: (
    landmarks: Landmark[]
  ) => void;
}

export interface HandTrackingResult {
  status: TrackingStatus;

  error: string;
}

// Local AI assets
const WASM_PATH =
  `${import.meta.env.BASE_URL}mediapipe/wasm`;

const MODEL_PATH =
  `${import.meta.env.BASE_URL}models/hand_landmarker.task`;

export default function useHandTracking({
  video,
  enabled,
  onLandmarks,
}: HandTrackingOptions): HandTrackingResult {
  const [result, setResult] =
    useState<HandTrackingResult>({
      status: "idle",
      error: "",
    });

  // Access the latest callback without
  // unnecessarily restarting the AI model.
  const emitLandmarks = useEffectEvent(
    (landmarks: Landmark[]) => {
      onLandmarks(landmarks);
    }
  );

  useEffect(() => {
    if (!enabled || !video) {
      return;
    }

    const videoElement = video;

    let disposed = false;

    let model: HandLandmarker | null = null;

    let frameId: number | null = null;

    let lastVideoTime = -1;

    // Release inference resources.
    function releaseResources() {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);

        frameId = null;
      }

      if (model) {
        const activeModel = model;

        model = null;

        activeModel.close();
      }
    }

    // Handle model or inference errors.
    function handleError(
      message: string
    ) {
      if (disposed) {
        return;
      }

      releaseResources();

      emitLandmarks([]);

      setResult({
        status: "error",
        error: message,
      });
    }

    // Process webcam frames.
    function processFrame(
      timestamp: number
    ) {
      frameId = null;

      if (disposed || !model) {
        return;
      }

      try {
        const hasVideoFrame =
          videoElement.readyState >= 2;

        const isNewFrame =
          videoElement.currentTime !==
          lastVideoTime;

        if (
          hasVideoFrame &&
          isNewFrame
        ) {
          lastVideoTime =
            videoElement.currentTime;

          const detection =
            model.detectForVideo(
              videoElement,
              timestamp
            );

          const landmarks =
            detection.landmarks[0] ?? [];

          emitLandmarks(landmarks);
        }

        if (!disposed && model) {
          frameId =
            requestAnimationFrame(
              processFrame
            );
        }
      } catch {
        handleError(
          "Hand tracking failed. Disable and re-enable gesture control to retry."
        );
      }
    }

    // Initialize MediaPipe only when needed.
    async function initializeModel() {
      try {
        const {
          FilesetResolver,
          HandLandmarker,
        } = await import(
          "@mediapipe/tasks-vision"
        );

        if (disposed) {
          return;
        }

        setResult({
          status: "loading",
          error: "",
        });

        const vision =
          await FilesetResolver.forVisionTasks(
            WASM_PATH
          );

        if (disposed) {
          return;
        }

        const loadedModel =
          await HandLandmarker.createFromOptions(
            vision,
            {
              baseOptions: {
                modelAssetPath: MODEL_PATH,

                delegate: "CPU",
              },

              runningMode: "VIDEO",

              numHands: 1,

              minHandDetectionConfidence: 0.5,

              minHandPresenceConfidence: 0.5,

              minTrackingConfidence: 0.5,
            }
          );

        // Prevent resource leaks if tracking
        // stops while the model is loading.
        if (disposed) {
          loadedModel.close();

          return;
        }

        model = loadedModel;

        setResult({
          status: "tracking",
          error: "",
        });

        frameId =
          requestAnimationFrame(
            processFrame
          );
      } catch {
        handleError(
          "Unable to initialize the hand tracking AI model. Check the local model and WebAssembly files."
        );
      }
    }

    void initializeModel();

    // Cleanup on disable, video change
    // or component unmount.
    return () => {
      disposed = true;

      releaseResources();
    };
  }, [enabled, video]);

  if (!enabled || !video) {
    return {
      status: "idle",
      error: "",
    };
  }

  if (result.status === "idle") {
    return {
      status: "loading",
      error: "",
    };
  }

  return result;
}
