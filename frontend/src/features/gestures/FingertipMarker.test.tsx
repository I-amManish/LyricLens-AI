
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import GestureProvider from "./GestureProvider";
import useHandTracking from "./useHandTracking";

import {
  useGestures,
} from "./gestureContext";

import type {
  Landmark,
} from "./gestureRecognition";

vi.mock("./useHandTracking", () => ({
  default: vi.fn(),
}));

const trackingMock = vi.mocked(useHandTracking);

function TestStudio() {
  const {
    enabled,
    registerRoot,
    registerVideo,
    toggleGestures,
  } = useGestures();

  return (
    <div ref={registerRoot}>
      <video
        ref={registerVideo}
        aria-label="Test webcam"
      />

      <button
        type="button"
        onClick={toggleGestures}
      >
        {enabled
          ? "Disable gestures"
          : "Enable gestures"}
      </button>
    </div>
  );
}

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

function emitLandmarks(landmarks: Landmark[]) {
  const options =
    trackingMock.mock.calls.at(-1)?.[0];

  if (!options) {
    throw new Error(
      "Hand tracking is not connected."
    );
  }

  act(() => {
    options.onLandmarks(landmarks);
  });
}

function startStudio() {
  render(
    <GestureProvider>
      <TestStudio />
    </GestureProvider>
  );

  const video = screen.getByLabelText(
    "Test webcam"
  );

  Object.defineProperties(video, {
    videoWidth: { value: 1280 },
    videoHeight: { value: 720 },
  });

  vi.spyOn(
    video,
    "getBoundingClientRect"
  ).mockReturnValue(
    new DOMRect(100, 200, 400, 400)
  );

  fireEvent.click(
    screen.getByRole("button", {
      name: "Enable gestures",
    })
  );
}

describe("Fingertip marker integration", () => {
  beforeEach(() => {
    trackingMock.mockReset();

    trackingMock.mockImplementation(
      ({ enabled, video }) => ({
        status:
          enabled && video
            ? "tracking"
            : "idle",

        error: "",
      })
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders the fingertip marker at the mapped video coordinates", () => {
    startStudio();

    emitLandmarks(createHand());

    const marker = screen.getByTestId(
      "fingertip-marker"
    );

    expect(marker).toHaveStyle({
      position: "fixed",
      left: "400px",
      top: "377.5px",
      pointerEvents: "none",
    });

    expect(marker).toHaveAttribute(
      "aria-hidden",
      "true"
    );

    expect(
      screen.queryByTestId("gesture-cursor")
    ).not.toBeInTheDocument();
  });

  it("removes the fingertip marker when the hand disappears", () => {
    startStudio();

    emitLandmarks(createHand());

    expect(
      screen.getByTestId("fingertip-marker")
    ).toBeInTheDocument();

    emitLandmarks([]);

    expect(
      screen.queryByTestId("fingertip-marker")
    ).not.toBeInTheDocument();
  });

  it("removes the fingertip marker when gestures are disabled", () => {
    startStudio();

    emitLandmarks(createHand());

    expect(
      screen.getByTestId("fingertip-marker")
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Disable gestures",
      })
    );

    expect(
      screen.queryByTestId("fingertip-marker")
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId("gesture-cursor")
    ).not.toBeInTheDocument();
  });
});
