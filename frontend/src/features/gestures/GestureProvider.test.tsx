
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

import {
  useGestures,
} from "./gestureContext";

import useHandTracking from "./useHandTracking";

import type {
  Landmark,
} from "./gestureRecognition";

vi.mock("./useHandTracking", () => ({
  default: vi.fn(),
}));

const trackingMock =
  vi.mocked(useHandTracking);

// Test interface connected to the provider.
function TestStudio({
  cameraOn = false,
}: {
  cameraOn?: boolean;
}) {
  const {
    enabled,
    cameraReady,
    status,
    error,
    toggleGestures,
    registerRoot,
    registerVideo,
  } = useGestures();

  return (
    <div ref={registerRoot}>
      <button
        type="button"
        onClick={toggleGestures}
      >
        {enabled
          ? "Disable gestures"
          : "Enable gestures"}
      </button>

      <p data-testid="tracking-status">
        {status}
      </p>

      <p data-testid="camera-status">
        {cameraReady
          ? "Camera ready"
          : "Camera unavailable"}
      </p>

      {error && (
        <p role="alert">
          {error}
        </p>
      )}

      {cameraOn && (
        <video
          ref={registerVideo}
          aria-label="Test webcam"
        />
      )}
    </div>
  );
}

function createHand(
  pinchRatio = 0.6
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
    y: 0.6,
  };

  landmarks[8] = {
    x: 0.3,
    y: 0.4,
  };

  landmarks[4] = {
    x: 0.3 + pinchRatio * palmSize,
    y: 0.4,
  };

  return landmarks;
}

function getTrackingOptions() {
  const lastCall =
    trackingMock.mock.calls.at(-1);

  if (!lastCall) {
    throw new Error(
      "Hand tracking hook was not called."
    );
  }

  return lastCall[0];
}

function enableGestures() {
  fireEvent.click(
    screen.getByRole("button", {
      name: "Enable gestures",
    })
  );
}

function disableGestures() {
  fireEvent.click(
    screen.getByRole("button", {
      name: "Disable gestures",
    })
  );
}

describe("Gesture provider", () => {
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

    vi.clearAllMocks();
  });

  it("starts with gesture tracking disabled", () => {
    render(
      <GestureProvider>
        <TestStudio />
      </GestureProvider>
    );

    expect(
      screen.getByRole("button", {
        name: "Enable gestures",
      })
    ).toBeInTheDocument();

    expect(
      getTrackingOptions().enabled
    ).toBe(false);

    expect(
      screen.getByTestId(
        "tracking-status"
      )
    ).toHaveTextContent("idle");
  });

  it("waits for the camera when gestures are enabled without video", () => {
    render(
      <GestureProvider>
        <TestStudio />
      </GestureProvider>
    );

    enableGestures();

    expect(
      screen.getByRole("button", {
        name: "Disable gestures",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(
        "camera-status"
      )
    ).toHaveTextContent(
      "Camera unavailable"
    );

    expect(
      getTrackingOptions().enabled
    ).toBe(false);
  });

  it("starts tracking using the existing camera", () => {
    render(
      <GestureProvider>
        <TestStudio cameraOn />
      </GestureProvider>
    );

    enableGestures();

    expect(
      getTrackingOptions().enabled
    ).toBe(true);

    expect(
      getTrackingOptions().video
    ).toBe(
      screen.getByLabelText(
        "Test webcam"
      )
    );

    expect(
      screen.getByTestId(
        "tracking-status"
      )
    ).toHaveTextContent("tracking");
  });

  it("stops tracking when gestures are disabled", () => {
    render(
      <GestureProvider>
        <TestStudio cameraOn />
      </GestureProvider>
    );

    enableGestures();

    disableGestures();

    expect(
      getTrackingOptions().enabled
    ).toBe(false);

    expect(
      screen.getByTestId(
        "tracking-status"
      )
    ).toHaveTextContent("idle");
  });

  it("stops tracking when the camera becomes unavailable", () => {
    const { rerender } = render(
      <GestureProvider>
        <TestStudio cameraOn />
      </GestureProvider>
    );

    enableGestures();

    rerender(
      <GestureProvider>
        <TestStudio cameraOn={false} />
      </GestureProvider>
    );

    expect(
      getTrackingOptions().enabled
    ).toBe(false);

    expect(
      getTrackingOptions().video
    ).toBeNull();

    expect(
      screen.getByTestId(
        "tracking-status"
      )
    ).toHaveTextContent("idle");
  });

  it("resumes tracking when the camera becomes available again", () => {
    const { rerender } = render(
      <GestureProvider>
        <TestStudio />
      </GestureProvider>
    );

    enableGestures();

    rerender(
      <GestureProvider>
        <TestStudio cameraOn />
      </GestureProvider>
    );

    expect(
      getTrackingOptions().enabled
    ).toBe(true);

    expect(
      screen.getByTestId(
        "tracking-status"
      )
    ).toHaveTextContent("tracking");
  });

  it("renders the cursor from detected landmarks and clears it when disabled", () => {
    render(
      <GestureProvider>
        <TestStudio cameraOn />
      </GestureProvider>
    );

    enableGestures();

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
      new DOMRect(100, 100, 800, 450)
    );

    act(() => {
      getTrackingOptions().onLandmarks(
        createHand()
      );
    });

    expect(
      screen.getByTestId(
        "fingertip-marker"
      )
    ).toBeInTheDocument();

    disableGestures();

    expect(
      screen.queryByTestId(
        "fingertip-marker"
      )
    ).not.toBeInTheDocument();

    enableGestures();

    expect(
      screen.queryByTestId(
        "fingertip-marker"
      )
    ).not.toBeInTheDocument();
  });

  it("exposes hand tracking errors to the interface", () => {
    trackingMock.mockImplementation(
      ({ enabled }) => ({
        status: enabled
          ? "error"
          : "idle",

        error: enabled
          ? "Unable to load AI model."
          : "",
      })
    );

    render(
      <GestureProvider>
        <TestStudio cameraOn />
      </GestureProvider>
    );

    enableGestures();

    expect(
      screen.getByRole("alert")
    ).toHaveTextContent(
      "Unable to load AI model."
    );

    expect(
      screen.getByTestId(
        "tracking-status"
      )
    ).toHaveTextContent("error");
  });
});
