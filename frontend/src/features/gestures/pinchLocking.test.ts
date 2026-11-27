
import {
  describe,
  expect,
  it,
} from "vitest";

import {
  recognizeGesture,
  initialGestureState,
} from "./gestureRecognition";

import type {
  Landmark,
} from "./gestureRecognition";

function createHand(
  x = 0.5,
  y = 0.4,
  pinchRatio = 0.6
): Landmark[] {
  const palmSize = 0.2;

  const landmarks = Array.from(
    { length: 21 },
    () => ({ x: 0.5, y: 0.5 })
  );

  landmarks[0] = {
    x: 0.5,
    y: 0.8,
  };

  landmarks[9] = {
    x: 0.5,
    y: 0.6,
  };

  landmarks[8] = {
    x,
    y,
  };

  landmarks[4] = {
    x: x + pinchRatio * palmSize,
    y,
  };

  return landmarks;
}

describe("Pinch cursor locking", () => {
  it("locks the cursor at its previous position when a pinch begins", () => {
    const open = recognizeGesture(
      createHand(0.5, 0.4, 0.6),
      initialGestureState
    );

    const pinched = recognizeGesture(
      createHand(0.65, 0.55, 0.15),
      open
    );

    expect(pinched.pinching).toBe(true);
    expect(pinched.click).toBe(true);

    expect(pinched.cursor).toEqual(
      open.cursor
    );
  });

  it("keeps the cursor locked while holding a pinch", () => {
    const open = recognizeGesture(
      createHand(),
      initialGestureState
    );

    const pinched = recognizeGesture(
      createHand(0.5, 0.4, 0.15),
      open
    );

    const moved = recognizeGesture(
      createHand(0.8, 0.7, 0.15),
      pinched
    );

    expect(moved.pinching).toBe(true);

    expect(moved.cursor).toEqual(
      pinched.cursor
    );

    expect(moved.click).toBe(false);
  });

  it("resumes cursor movement when the pinch is released", () => {
    const open = recognizeGesture(
      createHand(),
      initialGestureState
    );

    const pinched = recognizeGesture(
      createHand(0.5, 0.4, 0.15),
      open
    );

    const released = recognizeGesture(
      createHand(0.8, 0.7, 0.6),
      pinched
    );

    expect(released.pinching).toBe(false);
    expect(released.armed).toBe(true);
    expect(released.click).toBe(false);

    expect(released.cursor).not.toEqual(
      pinched.cursor
    );
  });

  it("allows a new click after releasing the pinch", () => {
    const open = recognizeGesture(
      createHand(),
      initialGestureState
    );

    const firstPinch = recognizeGesture(
      createHand(0.5, 0.4, 0.15),
      open
    );

    const released = recognizeGesture(
      createHand(0.5, 0.4, 0.6),
      firstPinch
    );

    const secondPinch = recognizeGesture(
      createHand(0.5, 0.4, 0.15),
      released
    );

    expect(firstPinch.click).toBe(true);
    expect(secondPinch.click).toBe(true);
  });

  it("clears the locked cursor when the hand disappears", () => {
    const open = recognizeGesture(
      createHand(),
      initialGestureState
    );

    const pinched = recognizeGesture(
      createHand(0.5, 0.4, 0.15),
      open
    );

    const lost = recognizeGesture(
      [],
      pinched
    );

    expect(lost.cursor).toBeNull();
    expect(lost.pinching).toBe(false);
    expect(lost.click).toBe(false);
    expect(lost.armed).toBe(false);
  });

  it("does not generate an accidental click when tracking starts with a closed pinch", () => {
    const pinched = recognizeGesture(
      createHand(0.5, 0.4, 0.15),
      initialGestureState
    );

    expect(pinched.pinching).toBe(true);
    expect(pinched.cursor).not.toBeNull();
    expect(pinched.click).toBe(false);
    expect(pinched.armed).toBe(false);
  });
});
