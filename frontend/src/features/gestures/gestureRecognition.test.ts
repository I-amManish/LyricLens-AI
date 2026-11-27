
import { describe, expect, it } from "vitest";

import {
  recognizeGesture,
  initialGestureState,
} from "./gestureRecognition";

import type {
  Landmark,
} from "./gestureRecognition";

// Simulated MediaPipe hand landmarks
function createHand(
  pinchRatio = 0.6,
  indexX = 0.3,
  indexY = 0.4,
  palmSize = 0.2
): Landmark[] {
  const landmarks = Array.from(
    { length: 21 },
    () => ({
      x: 0.5,
      y: 0.5,
    })
  );

  // Wrist
  landmarks[0] = {
    x: 0.5,
    y: 0.8,
  };

  // Middle finger MCP
  landmarks[9] = {
    x: 0.5,
    y: 0.8 - palmSize,
  };

  // Index finger tip
  landmarks[8] = {
    x: indexX,
    y: indexY,
  };

  // Thumb tip
  landmarks[4] = {
    x: indexX + pinchRatio * palmSize,
    y: indexY,
  };

  return landmarks;
}

describe("Gesture recognition", () => {
  it("detects the index finger as the cursor", () => {
    const result = recognizeGesture(
      createHand(),
      initialGestureState
    );

    expect(result.cursor?.x).toBeCloseTo(0.7);

    expect(result.cursor?.y).toBeCloseTo(0.4);
  });

  it("mirrors horizontal cursor movement", () => {
    const result = recognizeGesture(
      createHand(0.6, 0.8, 0.3),
      initialGestureState
    );

    expect(result.cursor?.x).toBeCloseTo(0.2);

    expect(result.cursor?.y).toBeCloseTo(0.3);
  });

  it("keeps the cursor within valid boundaries", () => {
    const result = recognizeGesture(
      createHand(0.6, -0.2, 1.2),
      initialGestureState
    );

    expect(result.cursor?.x).toBe(1);

    expect(result.cursor?.y).toBe(1);
  });

  it("smooths cursor movement between frames", () => {
    const previous = recognizeGesture(
      createHand(0.6, 0.3),
      initialGestureState
    );

    const result = recognizeGesture(
      createHand(0.6, 0.7),
      previous
    );

    expect(result.cursor?.x).toBeCloseTo(0.56);
  });

  it("detects a pinch after an open hand", () => {
    const open = recognizeGesture(
      createHand(0.6),
      initialGestureState
    );

    const result = recognizeGesture(
      createHand(0.15),
      open
    );

    expect(result.pinching).toBe(true);

    expect(result.click).toBe(true);
  });

  it("does not repeatedly click while holding a pinch", () => {
    const open = recognizeGesture(
      createHand(0.6),
      initialGestureState
    );

    const first = recognizeGesture(
      createHand(0.15),
      open
    );

    const second = recognizeGesture(
      createHand(0.15),
      first
    );

    expect(second.pinching).toBe(true);

    expect(second.click).toBe(false);
  });

  it("allows another click after releasing a pinch", () => {
    const open = recognizeGesture(
      createHand(0.6),
      initialGestureState
    );

    const first = recognizeGesture(
      createHand(0.15),
      open
    );

    const released = recognizeGesture(
      createHand(0.6),
      first
    );

    const second = recognizeGesture(
      createHand(0.15),
      released
    );

    expect(released.pinching).toBe(false);

    expect(second.click).toBe(true);
  });

  it("prevents accidental clicks near the pinch threshold", () => {
    const open = recognizeGesture(
      createHand(0.6),
      initialGestureState
    );

    const pinched = recognizeGesture(
      createHand(0.15),
      open
    );

    const transition = recognizeGesture(
      createHand(0.3),
      pinched
    );

    expect(transition.pinching).toBe(true);

    expect(transition.click).toBe(false);
  });

  it("normalizes pinch detection using palm size", () => {
    const open = recognizeGesture(
      createHand(0.6),
      initialGestureState
    );

    const smallHand = recognizeGesture(
      createHand(0.15, 0.3, 0.4, 0.1),
      open
    );

    const largeHand = recognizeGesture(
      createHand(0.15, 0.3, 0.4, 0.4),
      open
    );

    expect(smallHand.pinching).toBe(true);

    expect(largeHand.pinching).toBe(true);
  });

  it("resets when no hand is detected", () => {
    const previous = recognizeGesture(
      createHand(),
      initialGestureState
    );

    const result = recognizeGesture(
      [],
      previous
    );

    expect(result.cursor).toBeNull();

    expect(result.pinching).toBe(false);

    expect(result.click).toBe(false);

    expect(result.armed).toBe(false);
  });

  it("prevents clicking when a closed hand first appears", () => {
    const result = recognizeGesture(
      createHand(0.15),
      initialGestureState
    );

    expect(result.pinching).toBe(true);

    expect(result.click).toBe(false);
  });

  it("rejects an invalid palm size", () => {
    const result = recognizeGesture(
      createHand(0.15, 0.3, 0.4, 0),
      initialGestureState
    );

    expect(result.cursor).toBeNull();

    expect(result.click).toBe(false);
  });
});
