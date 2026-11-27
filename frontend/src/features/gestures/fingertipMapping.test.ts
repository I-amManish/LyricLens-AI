
import {
  act,
  renderHook,
} from "@testing-library/react";

import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import useGestureControl from "./useGestureControl";

import type {
  Landmark,
} from "./gestureRecognition";

function createHand(): Landmark[] {
  const landmarks = Array.from(
    { length: 21 },
    () => ({ x: 0.5, y: 0.5 })
  );

  landmarks[0] = { x: 0.5, y: 0.8 };
  landmarks[9] = { x: 0.5, y: 0.6 };
  landmarks[8] = { x: 0.25, y: 0.4 };
  landmarks[4] = { x: 0.4, y: 0.4 };

  return landmarks;
}

function createVideo(
  videoWidth: number,
  videoHeight: number,
  width: number,
  height: number
) {
  const video = document.createElement("video");

  Object.defineProperties(video, {
    videoWidth: { value: videoWidth },
    videoHeight: { value: videoHeight },
  });

  vi.spyOn(
    video,
    "getBoundingClientRect"
  ).mockReturnValue(
    new DOMRect(100, 200, width, height)
  );

  return video;
}

describe("Fingertip coordinate mapping", () => {
  it("accounts for vertical letterboxing", () => {
    const root = document.createElement("div");

    const video = createVideo(
      1280, 720, 400, 400
    );

    const { result } = renderHook(
      () => useGestureControl(root, video)
    );

    act(() => {
      result.current.onLandmarks(createHand());
    });

    expect(result.current.fingertip?.x)
      .toBeCloseTo(400);

    expect(result.current.fingertip?.y)
      .toBeCloseTo(377.5);
  });

  it("accounts for horizontal letterboxing", () => {
    const root = document.createElement("div");

    const video = createVideo(
      400, 400, 600, 200
    );

    const { result } = renderHook(
      () => useGestureControl(root, video)
    );

    act(() => {
      result.current.onLandmarks(createHand());
    });

    expect(result.current.fingertip?.x)
      .toBeCloseTo(450);

    expect(result.current.fingertip?.y)
      .toBeCloseTo(280);
  });

  it("uses identical fingertip and cursor coordinates", () => {
    const root = document.createElement("div");

    const video = createVideo(
      1280, 720, 400, 400
    );

    const { result } = renderHook(
      () => useGestureControl(root, video)
    );

    act(() => {
      result.current.onLandmarks(createHand());
    });

    expect(
      result.current.cursor?.x
    ).toBeCloseTo(400);

    expect(
      result.current.cursor
    ).toEqual(
      result.current.fingertip
    );
  });

  it("clears both indicators when the hand disappears", () => {
    const root = document.createElement("div");

    const video = createVideo(
      1280, 720, 400, 400
    );

    const { result } = renderHook(
      () => useGestureControl(root, video)
    );

    act(() => {
      result.current.onLandmarks(createHand());
    });

    expect(result.current.fingertip)
      .not.toBeNull();

    act(() => {
      result.current.onLandmarks([]);
    });

    expect(result.current.cursor).toBeNull();
    expect(result.current.fingertip).toBeNull();
  });
});
