
import {
  useCallback,
  useRef,
  useState,
} from "react";

import {
  recognizeGesture,
  initialGestureState,
} from "./gestureRecognition";

import type {
  Landmark,
  GestureState,
} from "./gestureRecognition";

export interface GestureControlResult {
  cursor: Landmark | null;
  fingertip: Landmark | null;
  pinching: boolean;

  onLandmarks: (landmarks: Landmark[]) => void;
  reset: () => void;
}

interface CursorState {
  cursor: Landmark | null;
  fingertip: Landmark | null;
  pinching: boolean;
}

const INDEX_FINGER_TIP = 8;

const emptyCursorState: CursorState = {
  cursor: null,
  fingertip: null,
  pinching: false,
};

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function toViewportCoordinates(
  landmark: Landmark
): Landmark {
  return {
    x:
      landmark.x *
      Math.max(0, window.innerWidth - 1),

    y:
      landmark.y *
      Math.max(0, window.innerHeight - 1),
  };
}

// Map the landmark to the actual displayed video,
// accounting for mirroring and aspect ratio.
function toVideoCoordinates(
  landmark: Landmark,
  video: HTMLVideoElement
): Landmark | null {
  const rect = video.getBoundingClientRect();

  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;

  if (
    videoWidth <= 0 ||
    videoHeight <= 0 ||
    rect.width <= 0 ||
    rect.height <= 0
  ) {
    return null;
  }

  if (
    !Number.isFinite(landmark.x) ||
    !Number.isFinite(landmark.y)
  ) {
    return null;
  }

  const widthScale =
    rect.width / videoWidth;

  const heightScale =
    rect.height / videoHeight;

  const objectFit =
    window.getComputedStyle(video).objectFit;

  // Cover fills the camera box and crops excess video.
  // Contain preserves the complete video image.
  const scale =
    objectFit === "cover"
      ? Math.max(widthScale, heightScale)
      : Math.min(widthScale, heightScale);

  const displayedWidth =
    videoWidth * scale;

  const displayedHeight =
    videoHeight * scale;

  const offsetX =
    (rect.width - displayedWidth) / 2;

  const offsetY =
    (rect.height - displayedHeight) / 2;

  // Mirror horizontal coordinates to match the webcam.
  const mirroredX = clamp(1 - landmark.x);
  const normalizedY = clamp(landmark.y);

  const x =
    rect.left +
    offsetX +
    mirroredX * displayedWidth;

  const y =
    rect.top +
    offsetY +
    normalizedY * displayedHeight;

  // Ignore fingertips outside the visible cropped area.
  if (
    x < rect.left ||
    x >= rect.right ||
    y < rect.top ||
    y >= rect.bottom
  ) {
    return null;
  }

  return { x, y };
}

function activateButton(
  root: HTMLElement,
  cursor: Landmark
): void {
  const element = document.elementFromPoint(
    cursor.x,
    cursor.y
  );

  if (!element) return;

  const button = element.closest("button");

  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  if (!root.contains(button)) {
    return;
  }

  if (button.matches(":disabled")) {
    return;
  }

  if (
    button.closest(
      '[aria-disabled="true"], ' +
        '[data-gesture-disabled="true"], ' +
        "[inert]"
    )
  ) {
    return;
  }

  button.click();
}

export default function useGestureControl(
  root: HTMLElement | null,
  video: HTMLVideoElement | null = null
): GestureControlResult {
  const gestureStateRef = useRef<GestureState>({
    ...initialGestureState,
  });

  // Remember the last visible fingertip target.
  const lastTargetRef =
    useRef<Landmark | null>(null);

  const [cursorState, setCursorState] =
    useState<CursorState>({
      ...emptyCursorState,
    });

  const reset = useCallback(() => {
    gestureStateRef.current = {
      ...initialGestureState,
    };

    lastTargetRef.current = null;

    setCursorState({
      ...emptyCursorState,
    });
  }, []);

  const onLandmarks = useCallback(
    (landmarks: Landmark[]) => {
      if (!root) {
        reset();
        return;
      }

      const nextState = recognizeGesture(
        landmarks,
        gestureStateRef.current
      );

      gestureStateRef.current = nextState;

      if (!nextState.cursor) {
        lastTargetRef.current = null;

        setCursorState({
          ...emptyCursorState,
        });

        return;
      }

      // Preserve standalone viewport control
      // when no video is supplied.
      if (!video) {
        const cursor = toViewportCoordinates(
          nextState.cursor
        );

        lastTargetRef.current = null;

        setCursorState({
          cursor,
          fingertip: null,
          pinching: nextState.pinching,
        });

        if (nextState.click) {
          activateButton(root, cursor);
        }

        return;
      }

      const indexTip =
        landmarks[INDEX_FINGER_TIP];

      if (!indexTip) {
        reset();
        return;
      }

      const previousTarget =
        lastTargetRef.current;

      // Lock to the last visible target during a pinch.
      // This prevents fingertip movement from changing
      // the selected button while closing the fingers.
      const target =
        nextState.pinching && previousTarget
          ? previousTarget
          : {
              x: indexTip.x,
              y: indexTip.y,
            };

      const position = toVideoCoordinates(
        target,
        video
      );

      if (!position) {
        lastTargetRef.current = null;

        setCursorState({
          ...emptyCursorState,
        });

        return;
      }

      lastTargetRef.current = target;

      // Both visual and interaction coordinates
      // now refer to exactly the same point.
      setCursorState({
        cursor: position,
        fingertip: position,
        pinching: nextState.pinching,
      });

      if (nextState.click && previousTarget) {
        activateButton(root, position);
      }
    },
    [root, video, reset]
  );

  return {
    cursor: root
      ? cursorState.cursor
      : null,

    fingertip:
      root && video
        ? cursorState.fingertip
        : null,

    pinching: root
      ? cursorState.pinching
      : false,

    onLandmarks,
    reset,
  };
}
