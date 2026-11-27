
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import App from "./App";

import useHandTracking from "./features/gestures/useHandTracking";

import type {
  Landmark,
} from "./features/gestures/gestureRecognition";

vi.mock(
  "./features/gestures/useHandTracking",
  () => ({
    default: vi.fn(),
  })
);

const trackingMock = vi.mocked(useHandTracking);

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
  const call =
    trackingMock.mock.calls.at(-1);

  if (!call) {
    throw new Error(
      "Gesture Provider is not connected."
    );
  }

  return call[0];
}

function gestureButton() {
  return screen.getByRole("button", {
    name: "Gesture control",
  });
}

// Wait until the camera is active
// and registered with the Gesture Provider.
async function startCamera() {
  fireEvent.click(
    screen.getByRole("button", {
      name: "Enable Camera",
    })
  );

  await screen.findByRole("button", {
    name: "Disable Camera",
  });

  const video = screen.getByLabelText(
    "Live webcam preview"
  );

  await waitFor(() => {
    expect(
      getTrackingOptions().video
    ).toBe(video);
  });

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

  return video;
}

describe("LyricLens gesture integration", () => {
  let originalMediaDevices:
    | PropertyDescriptor
    | undefined;

  let originalElementFromPoint:
    | PropertyDescriptor
    | undefined;

  let originalFullscreenElement:
    | PropertyDescriptor
    | undefined;

  const stopTrack = vi.fn();

  const stream = {
    getTracks: () => [
      {
        stop: stopTrack,
      },
    ],
  };

  const getUserMedia = vi.fn();

  const elementFromPoint = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    trackingMock.mockImplementation(
      ({ enabled, video }) => ({
        status:
          enabled && video
            ? "tracking"
            : "idle",

        error: "",
      })
    );

    originalMediaDevices =
      Object.getOwnPropertyDescriptor(
        navigator,
        "mediaDevices"
      );

    originalElementFromPoint =
      Object.getOwnPropertyDescriptor(
        document,
        "elementFromPoint"
      );

    originalFullscreenElement =
      Object.getOwnPropertyDescriptor(
        document,
        "fullscreenElement"
      );

    getUserMedia.mockResolvedValue(
      stream
    );

    Object.defineProperty(
      navigator,
      "mediaDevices",
      {
        configurable: true,

        value: {
          getUserMedia,
        },
      }
    );

    Object.defineProperty(
      document,
      "elementFromPoint",
      {
        configurable: true,

        value: elementFromPoint,
      }
    );

    Object.defineProperty(
      document,
      "fullscreenElement",
      {
        configurable: true,
        writable: true,
        value: null,
      }
    );

    elementFromPoint.mockReturnValue(
      null
    );

    vi.spyOn(
      HTMLMediaElement.prototype,
      "play"
    ).mockResolvedValue(undefined);

    vi.spyOn(
      HTMLMediaElement.prototype,
      "pause"
    ).mockImplementation(() => {});

    vi.stubGlobal(
      "URL",

      class extends URL {
        static createObjectURL =
          vi.fn().mockReturnValue(
            "blob:gesture-music"
          );

        static revokeObjectURL =
          vi.fn();
      }
    );
  });

  afterEach(() => {
    cleanup();

    vi.restoreAllMocks();

    vi.unstubAllGlobals();

    if (originalMediaDevices) {
      Object.defineProperty(
        navigator,
        "mediaDevices",
        originalMediaDevices
      );
    } else {
      Reflect.deleteProperty(
        navigator,
        "mediaDevices"
      );
    }

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

    if (originalFullscreenElement) {
      Object.defineProperty(
        document,
        "fullscreenElement",
        originalFullscreenElement
      );
    } else {
      Reflect.deleteProperty(
        document,
        "fullscreenElement"
      );
    }
  });

  it("enables the gesture control button and starts with gestures disabled", () => {
    render(<App />);

    expect(
      gestureButton()
    ).toBeEnabled();

    expect(
      gestureButton()
    ).toHaveAttribute(
      "aria-pressed",
      "false"
    );

    expect(
      getTrackingOptions().enabled
    ).toBe(false);
  });

  it("waits for the camera without requesting another webcam stream", () => {
    render(<App />);

    fireEvent.click(
      gestureButton()
    );

    expect(
      gestureButton()
    ).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    expect(
      screen.getByText(
        "Waiting for camera"
      )
    ).toBeInTheDocument();

    expect(
      getTrackingOptions().enabled
    ).toBe(false);

    expect(
      getUserMedia
    ).not.toHaveBeenCalled();
  });

  it("reuses the existing webcam when gestures are enabled", async () => {
    render(<App />);

    const video = await startCamera();

    fireEvent.click(
      gestureButton()
    );

    expect(
      getTrackingOptions().enabled
    ).toBe(true);

    expect(
      getTrackingOptions().video
    ).toBe(video);

    expect(
      getUserMedia
    ).toHaveBeenCalledTimes(1);

    expect(
      screen.getByText(
        "Gestures active"
      )
    ).toBeInTheDocument();
  });

  it("stops tracking when gestures are disabled without turning off the camera", async () => {
    render(<App />);

    await startCamera();

    fireEvent.click(
      gestureButton()
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

    fireEvent.click(
      gestureButton()
    );

    expect(
      getTrackingOptions().enabled
    ).toBe(false);

    expect(
      screen.queryByTestId(
        "fingertip-marker"
      )
    ).not.toBeInTheDocument();

    expect(
      stopTrack
    ).not.toHaveBeenCalled();

    expect(
      screen.getByRole("button", {
        name: "Disable Camera",
      })
    ).toBeEnabled();
  });

  it("stops and resumes tracking when the camera is turned off and on", async () => {
    render(<App />);

    fireEvent.click(
      gestureButton()
    );

    await startCamera();

    expect(
      getTrackingOptions().enabled
    ).toBe(true);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Disable Camera",
      })
    );

    expect(
      getTrackingOptions().enabled
    ).toBe(false);

    expect(
      getTrackingOptions().video
    ).toBeNull();

    expect(
      gestureButton()
    ).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    await startCamera();

    expect(
      getTrackingOptions().enabled
    ).toBe(true);

    expect(
      getUserMedia
    ).toHaveBeenCalledTimes(2);
  });

  it("plays local music through a pinch gesture", async () => {
    render(<App />);

    await startCamera();

    fireEvent.change(
      screen.getByLabelText(
        "Select music file"
      ),
      {
        target: {
          files: [
            new File(
              ["test audio"],
              "Gesture Song.mp3",
              {
                type: "audio/mpeg",
              }
            ),
          ],
        },
      }
    );

    const playButton =
      screen.getByRole("button", {
        name: "Play",
      });

    expect(
      playButton
    ).toBeEnabled();

    elementFromPoint.mockReturnValue(
      playButton
    );

    fireEvent.click(
      gestureButton()
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

    await act(async () => {
      getTrackingOptions().onLandmarks(
        createHand(0.15)
      );
    });

    expect(
      HTMLMediaElement.prototype.play
    ).toHaveBeenCalledTimes(1);

    expect(
      screen.getByTestId(
        "fingertip-marker"
      )
    ).toHaveAttribute(
      "data-state",
      "pinching"
    );
  });

  it("excludes controls requiring physical browser interaction", () => {
    render(<App />);

    const controls = [
      "Upload Music",
      "Connect PC Audio",
      "Fullscreen",
      "Enable Camera",
    ];

    for (const name of controls) {
      expect(
        screen.getByRole("button", {
          name,
        })
      ).toHaveAttribute(
        "data-gesture-disabled",
        "true"
      );
    }
  });

  it("pauses gesture tracking in camera fullscreen and resumes after exiting", async () => {
    render(<App />);

    await startCamera();

    fireEvent.click(
      gestureButton()
    );

    act(() => {
      getTrackingOptions().onLandmarks(
        createHand()
      );
    });

    const cameraStage =
      screen.getByRole("region", {
        name: "Camera preview",
      });

    act(() => {
      Object.defineProperty(
        document,
        "fullscreenElement",
        {
          configurable: true,
          value: cameraStage,
        }
      );

      document.dispatchEvent(
        new Event("fullscreenchange")
      );
    });

    expect(
      getTrackingOptions().enabled
    ).toBe(false);

    expect(
      screen.queryByTestId(
        "fingertip-marker"
      )
    ).not.toBeInTheDocument();

    act(() => {
      Object.defineProperty(
        document,
        "fullscreenElement",
        {
          configurable: true,
          value: null,
        }
      );

      document.dispatchEvent(
        new Event("fullscreenchange")
      );
    });

    expect(
      getTrackingOptions().enabled
    ).toBe(true);
  });

  it("displays AI model loading errors in the interface", async () => {
    trackingMock.mockImplementation(
      ({ enabled }) => ({
        status:
          enabled
            ? "error"
            : "idle",

        error:
          enabled
            ? "Unable to load AI model."
            : "",
      })
    );

    render(<App />);

    await startCamera();

    fireEvent.click(
      gestureButton()
    );

    expect(
      screen.getByRole("alert")
    ).toHaveTextContent(
      "Unable to load AI model."
    );
  });
});
