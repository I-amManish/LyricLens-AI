
import {
  act,
  cleanup,
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
  pinchRatio = 0.6,
  indexX = 0.3,
  indexY = 0.4
): Landmark[] {
  const palmSize = 0.2;

  const landmarks = Array.from(
    { length: 21 },
    () => ({
      x: 0.5,
      y: 0.5,
    })
  );

  landmarks[0] = {
    x: 0.5,
    y: 0.8,
  };

  landmarks[9] = {
    x: 0.5,
    y: 0.8 - palmSize,
  };

  landmarks[8] = {
    x: indexX,
    y: indexY,
  };

  landmarks[4] = {
    x: indexX + pinchRatio * palmSize,
    y: indexY,
  };

  return landmarks;
}

describe("Gesture control", () => {
  let root: HTMLDivElement;

  let button: HTMLButtonElement;

  // Explicitly typed click handler.
  const clickHandler =
    vi.fn<(event: PointerEvent) => void>();

  let originalElementFromPoint:
    | PropertyDescriptor
    | undefined;

  const elementFromPoint = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    root = document.createElement("div");

    button = document.createElement(
      "button"
    );

    button.textContent = "Play music";

    button.addEventListener(
      "click",
      clickHandler
    );

    root.appendChild(button);

    document.body.appendChild(root);

    originalElementFromPoint =
      Object.getOwnPropertyDescriptor(
        document,
        "elementFromPoint"
      );

    elementFromPoint.mockReturnValue(
      button
    );

    Object.defineProperty(
      document,
      "elementFromPoint",
      {
        configurable: true,
        value: elementFromPoint,
      }
    );
  });

  afterEach(() => {
    cleanup();

    root.remove();

    if (originalElementFromPoint) {
      Object.defineProperty(
        document,
        "elementFromPoint",
        originalElementFromPoint
      );
    } else {
      Reflect.deleteProperty(
        document,
        "elementFromPoint"
      );
    }

    vi.restoreAllMocks();
  });

  it("starts without a visible cursor", () => {
    const { result } = renderHook(() =>
      useGestureControl(root)
    );

    expect(
      result.current.cursor
    ).toBeNull();

    expect(
      result.current.pinching
    ).toBe(false);
  });

  it("converts normalized landmarks into viewport coordinates", () => {
    const { result } = renderHook(() =>
      useGestureControl(root)
    );

    act(() => {
      result.current.onLandmarks(
        createHand()
      );
    });

    expect(
      result.current.cursor?.x
    ).toBeCloseTo(
      0.7 * (window.innerWidth - 1)
    );

    expect(
      result.current.cursor?.y
    ).toBeCloseTo(
      0.4 * (window.innerHeight - 1)
    );
  });

  it("clicks the button beneath the cursor when pinching", () => {
    const { result } = renderHook(() =>
      useGestureControl(root)
    );

    act(() => {
      result.current.onLandmarks(
        createHand()
      );

      result.current.onLandmarks(
        createHand(0.15)
      );
    });

    expect(
      clickHandler
    ).toHaveBeenCalledTimes(1);

    expect(
      result.current.pinching
    ).toBe(true);

    expect(
      elementFromPoint
    ).toHaveBeenCalledWith(
      expect.closeTo(
        0.7 * (window.innerWidth - 1)
      ),

      expect.closeTo(
        0.4 * (window.innerHeight - 1)
      )
    );
  });

  it("does not repeatedly click while holding a pinch", () => {
    const { result } = renderHook(() =>
      useGestureControl(root)
    );

    act(() => {
      result.current.onLandmarks(
        createHand()
      );

      result.current.onLandmarks(
        createHand(0.15)
      );

      result.current.onLandmarks(
        createHand(0.15)
      );
    });

    expect(
      clickHandler
    ).toHaveBeenCalledTimes(1);
  });

  it("allows another click after releasing the pinch", () => {
    const { result } = renderHook(() =>
      useGestureControl(root)
    );

    act(() => {
      result.current.onLandmarks(
        createHand()
      );

      result.current.onLandmarks(
        createHand(0.15)
      );

      result.current.onLandmarks(
        createHand(0.6)
      );

      result.current.onLandmarks(
        createHand(0.15)
      );
    });

    expect(
      clickHandler
    ).toHaveBeenCalledTimes(2);
  });

  it("activates a button when its child icon is targeted", () => {
    const icon =
      document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );

    button.appendChild(icon);

    elementFromPoint.mockReturnValue(
      icon
    );

    const { result } = renderHook(() =>
      useGestureControl(root)
    );

    act(() => {
      result.current.onLandmarks(
        createHand()
      );

      result.current.onLandmarks(
        createHand(0.15)
      );
    });

    expect(
      clickHandler
    ).toHaveBeenCalledTimes(1);
  });

  it("ignores disabled buttons", () => {
    button.disabled = true;

    const { result } = renderHook(() =>
      useGestureControl(root)
    );

    act(() => {
      result.current.onLandmarks(
        createHand()
      );

      result.current.onLandmarks(
        createHand(0.15)
      );
    });

    expect(
      elementFromPoint
    ).toHaveBeenCalled();

    expect(
      clickHandler
    ).not.toHaveBeenCalled();
  });

  it("ignores aria-disabled buttons", () => {
    button.setAttribute(
      "aria-disabled",
      "true"
    );

    const { result } = renderHook(() =>
      useGestureControl(root)
    );

    act(() => {
      result.current.onLandmarks(
        createHand()
      );

      result.current.onLandmarks(
        createHand(0.15)
      );
    });

    expect(
      elementFromPoint
    ).toHaveBeenCalled();

    expect(
      clickHandler
    ).not.toHaveBeenCalled();
  });

  it("ignores buttons excluded from gesture control", () => {
    button.setAttribute(
      "data-gesture-disabled",
      "true"
    );

    const { result } = renderHook(() =>
      useGestureControl(root)
    );

    act(() => {
      result.current.onLandmarks(
        createHand()
      );

      result.current.onLandmarks(
        createHand(0.15)
      );
    });

    expect(
      elementFromPoint
    ).toHaveBeenCalled();

    expect(
      clickHandler
    ).not.toHaveBeenCalled();
  });

  it("does not activate buttons outside LyricLens", () => {
    const outsideButton =
      document.createElement("button");

    const outsideClick =
      vi.fn<(event: PointerEvent) => void>();

    outsideButton.addEventListener(
      "click",
      outsideClick
    );

    document.body.appendChild(
      outsideButton
    );

    elementFromPoint.mockReturnValue(
      outsideButton
    );

    try {
      const { result } = renderHook(() =>
        useGestureControl(root)
      );

      act(() => {
        result.current.onLandmarks(
          createHand()
        );

        result.current.onLandmarks(
          createHand(0.15)
        );
      });

      expect(
        elementFromPoint
      ).toHaveBeenCalled();

      expect(
        outsideClick
      ).not.toHaveBeenCalled();
    } finally {
      outsideButton.remove();
    }
  });

  it("clears the cursor when tracking loses the hand", () => {
    const { result } = renderHook(() =>
      useGestureControl(root)
    );

    act(() => {
      result.current.onLandmarks(
        createHand()
      );
    });

    expect(
      result.current.cursor
    ).not.toBeNull();

    act(() => {
      result.current.onLandmarks([]);
    });

    expect(
      result.current.cursor
    ).toBeNull();

    expect(
      result.current.pinching
    ).toBe(false);
  });

  it("resets the cursor and prevents accidental clicks after reset", () => {
    const { result } = renderHook(() =>
      useGestureControl(root)
    );

    act(() => {
      result.current.onLandmarks(
        createHand()
      );
    });

    expect(
      result.current.cursor
    ).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(
      result.current.cursor
    ).toBeNull();

    act(() => {
      result.current.onLandmarks(
        createHand(0.15)
      );
    });

    expect(
      result.current.pinching
    ).toBe(true);

    expect(
      clickHandler
    ).not.toHaveBeenCalled();
  });

  it("does not interact without an application root", () => {
    const { result } = renderHook(() =>
      useGestureControl(null)
    );

    act(() => {
      result.current.onLandmarks(
        createHand()
      );

      result.current.onLandmarks(
        createHand(0.15)
      );
    });

    expect(
      result.current.cursor
    ).toBeNull();

    expect(
      elementFromPoint
    ).not.toHaveBeenCalled();

    expect(
      clickHandler
    ).not.toHaveBeenCalled();
  });
});
