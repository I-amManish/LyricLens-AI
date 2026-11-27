
export interface Landmark {
  x: number;
  y: number;
}

export interface GestureState {
  cursor: Landmark | null;
  pinching: boolean;
  click: boolean;
  armed: boolean;
}

// MediaPipe landmark indices
const WRIST = 0;
const THUMB_TIP = 4;
const INDEX_TIP = 8;
const MIDDLE_MCP = 9;

// Gesture configuration
const PINCH_THRESHOLD = 0.25;
const RELEASE_THRESHOLD = 0.38;
const SMOOTHING_FACTOR = 0.35;
const MIN_PALM_SIZE = 0.000001;

export const initialGestureState: GestureState = {
  cursor: null,
  pinching: false,
  click: false,
  armed: false,
};

// Restrict coordinates to the normalized range.
function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

// Calculate the distance between two landmarks.
function distance(
  first: Landmark,
  second: Landmark
): number {
  return Math.hypot(
    first.x - second.x,
    first.y - second.y
  );
}

// Reject missing or invalid landmarks.
function isValidLandmark(
  landmark: Landmark | undefined
): landmark is Landmark {
  return (
    landmark !== undefined &&
    Number.isFinite(landmark.x) &&
    Number.isFinite(landmark.y)
  );
}

// Reduce cursor jitter between consecutive frames.
function smoothCursor(
  target: Landmark,
  previous: Landmark | null
): Landmark {
  if (!previous) {
    return target;
  }

  return {
    x: clamp(
      previous.x +
        (target.x - previous.x) *
          SMOOTHING_FACTOR
    ),

    y: clamp(
      previous.y +
        (target.y - previous.y) *
          SMOOTHING_FACTOR
    ),
  };
}

// Convert AI-detected hand landmarks into gestures.
export function recognizeGesture(
  landmarks: Landmark[],
  previous: GestureState
): GestureState {
  const wrist = landmarks[WRIST];
  const thumbTip = landmarks[THUMB_TIP];
  const indexTip = landmarks[INDEX_TIP];
  const middleMcp = landmarks[MIDDLE_MCP];

  // Reset when required landmarks are unavailable.
  if (
    !isValidLandmark(wrist) ||
    !isValidLandmark(thumbTip) ||
    !isValidLandmark(indexTip) ||
    !isValidLandmark(middleMcp)
  ) {
    return { ...initialGestureState };
  }

  // Normalize pinch distance using palm size.
  const palmSize = distance(
    wrist,
    middleMcp
  );

  if (
    !Number.isFinite(palmSize) ||
    palmSize <= MIN_PALM_SIZE
  ) {
    return { ...initialGestureState };
  }

  const pinchDistance = distance(
    thumbTip,
    indexTip
  );

  const pinchRatio =
    pinchDistance / palmSize;

  // Determine pinch state before updating the cursor.
  let pinching = previous.pinching;

  if (pinchRatio <= PINCH_THRESHOLD) {
    pinching = true;
  } else if (
    pinchRatio >= RELEASE_THRESHOLD
  ) {
    pinching = false;
  }

  // Mirror horizontal coordinates to match
  // the webcam preview.
  const targetCursor: Landmark = {
    x: clamp(1 - indexTip.x),
    y: clamp(indexTip.y),
  };

  // Lock the virtual cursor at its previous
  // position when initiating or holding a pinch.
  //
  // If tracking starts with a closed pinch,
  // initialize the cursor without clicking.
  const cursor =
    pinching && previous.cursor
      ? previous.cursor
      : smoothCursor(
          targetCursor,
          previous.cursor
        );

  // Generate one click when an armed,
  // released hand enters the pinching state.
  const click =
    previous.armed &&
    !previous.pinching &&
    pinching;

  let armed = previous.armed;

  // Release the pinch to prepare the next click.
  if (pinchRatio >= RELEASE_THRESHOLD) {
    armed = true;
  }

  // Prevent repeated clicks while holding a pinch.
  if (pinching) {
    armed = false;
  }

  return {
    cursor,
    pinching,
    click,
    armed,
  };
}
