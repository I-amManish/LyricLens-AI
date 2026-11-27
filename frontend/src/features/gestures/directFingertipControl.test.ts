
import {
  act,
  renderHook,
} from "@testing-library/react";

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import useGestureControl from "./useGestureControl";

import type {
  Landmark,
} from "./gestureRecognition";

function createHand(
  x: number,
  y: number,
  pinching = false
): Landmark[] {
  const landmarks = Array.from(
    { length: 21 },
    () => ({ x: 0.5, y: 0.5 })
  );

  // Wrist
  landmarks[0] = {
    x: 0.5,
    y: 0.8,
  };

  // Middle finger base
  landmarks[9] = {
    x: 0.5,
    y: 0.5,
  };

  // Index fingertip
  landmarks[8] = { x, y };

  // Thumb fingertip
  landmarks[4] = {
    x: x + (pinching ? 0.01 : 0.15),
    y,
  };

  return landmarks;
}

describe("Direct fingertip control", () => {
  let root: HTMLDivElement;
  let video: HTMLVideoElement;
  let button: HTMLButtonElement;

  let originalHitTest:
    | PropertyDescriptor
    | undefined;

  const hitTest = vi.fn();
  const onClick = vi.fn();

  beforeEach(() => {
    hitTest.mockReset();
    onClick.mockReset();

    originalHitTest =
      Object.getOwnPropertyDescriptor(
        document,
        "elementFromPoint"
      );

    root = document.createElement("div");
    video = document.createElement("video");
    button = document.createElement("button");

    button.textContent = "Play";
    button.addEventListener("click", onClick);

    root.append(video, button);
    document.body.appendChild(root);

    video.style.objectFit = "cover";

    Object.defineProperties(video, {
      videoWidth: {
        configurable: true,
        value: 640,
      },

      videoHeight: {
        configurable: true,
        value: 480,
      },
    });

    vi.spyOn(
      video,
      "getBoundingClientRect"
    ).mockReturnValue(
      new DOMRect(100, 50, 800, 400)
    );

    hitTest.mockReturnValue(button);

    Object.defineProperty(
      document,
      "elementFromPoint",
      {
        configurable: true,
        value: hitTest,
      }
    );
  });

  afterEach(() => {
    root.remove();

    vi.restoreAllMocks();

    if (originalHitTest) {
      Object.defineProperty(
        document,
        "elementFromPoint",
        originalHitTest
      );
    } else {
      Reflect.deleteProperty(
        document,
        "elementFromPoint"
      );
    }
  });

  it("maps the interaction cursor to the visible fingertip", () => {
    const { result } = renderHook(() =>
      useGestureControl(root, video)
    );

    act(() => {
      result.current.onLandmarks(
        createHand(0.25, 0.25)
      );
    });

    expect(result.current.cursor).toEqual({
      x: 700,
      y: 100,
    });
  });

  it("uses the same coordinates for the visible dot and interaction cursor", () => {
    const { result } = renderHook(() =>
      useGestureControl(root, video)
    );

    act(() => {
      result.current.onLandmarks(
        createHand(0.25, 0.25)
      );
    });

    expect(
      result.current.cursor
    ).toEqual(
      result.current.fingertip
    );
  });

  it("clicks a button at the fingertip position when pinching", () => {
    const { result } = renderHook(() =>
      useGestureControl(root, video)
    );

    act(() => {
      result.current.onLandmarks(
        createHand(0.25, 0.25)
      );
    });

    act(() => {
      result.current.onLandmarks(
        createHand(0.25, 0.25, true)
      );
    });

    expect(hitTest).toHaveBeenCalledWith(
      700,
      100
    );

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("locks the fingertip target during a pinch", () => {
    const { result } = renderHook(() =>
      useGestureControl(root, video)
    );

    act(() => {
      result.current.onLandmarks(
        createHand(0.25, 0.25)
      );
    });

    const previousCursor =
      result.current.cursor;

    act(() => {
      result.current.onLandmarks(
        createHand(0.28, 0.25, true)
      );
    });

    expect(
      result.current.cursor
    ).toEqual(previousCursor);

    expect(
      result.current.fingertip
    ).toEqual(previousCursor);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("hides the cursor when the fingertip is outside the visible video", () => {
    const { result } = renderHook(() =>
      useGestureControl(root, video)
    );

    act(() => {
      result.current.onLandmarks(
        createHand(0.25, 0.05)
      );
    });

    expect(
      result.current.cursor
    ).toBeNull();

    expect(
      result.current.fingertip
    ).toBeNull();

    expect(onClick).not.toHaveBeenCalled();
  });

  it("clears the fingertip cursor when the hand disappears", () => {
    const { result } = renderHook(() =>
      useGestureControl(root, video)
    );

    act(() => {
      result.current.onLandmarks(
        createHand(0.25, 0.25)
      );
    });

    act(() => {
      result.current.onLandmarks([]);
    });

    expect(
      result.current.cursor
    ).toBeNull();

    expect(
      result.current.fingertip
    ).toBeNull();
  });
});
