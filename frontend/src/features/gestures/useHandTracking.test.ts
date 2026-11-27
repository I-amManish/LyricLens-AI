
import {
  act,
  cleanup,
  renderHook,
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

import useHandTracking from "./useHandTracking";

const mocks = vi.hoisted(() => ({
  forVisionTasks: vi.fn(),
  createFromOptions: vi.fn(),
  detectForVideo: vi.fn(),
  close: vi.fn(),
}));

vi.mock("@mediapipe/tasks-vision", () => ({
  FilesetResolver: {
    forVisionTasks: mocks.forVisionTasks,
  },

  HandLandmarker: {
    createFromOptions: mocks.createFromOptions,
  },
}));

describe("MediaPipe hand tracking", () => {
  let video: HTMLVideoElement;

  let nextFrame:
    | FrameRequestCallback
    | undefined;

  const onLandmarks = vi.fn();

  const model = {
    detectForVideo: mocks.detectForVideo,
    close: mocks.close,
  };

  const landmarks = Array.from(
    { length: 21 },
    () => ({
      x: 0.5,
      y: 0.5,
      z: 0,
    })
  );

  beforeEach(() => {
    vi.resetAllMocks();

    nextFrame = undefined;

    video = document.createElement("video");

    Object.defineProperty(
      video,
      "readyState",
      {
        configurable: true,
        value: 2,
      }
    );

    video.currentTime = 1;

    mocks.forVisionTasks.mockResolvedValue({});

    mocks.createFromOptions.mockResolvedValue(
      model
    );

    mocks.detectForVideo.mockReturnValue({
      landmarks: [landmarks],
    });

    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn(
        (callback: FrameRequestCallback) => {
          nextFrame = callback;

          return 1;
        }
      )
    );

    vi.stubGlobal(
      "cancelAnimationFrame",
      vi.fn(() => {
        nextFrame = undefined;
      })
    );
  });

  afterEach(() => {
    cleanup();

    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function processFrame(timestamp = 100) {
    const callback = nextFrame;

    if (!callback) {
      throw new Error(
        "No tracking frame was scheduled."
      );
    }

    nextFrame = undefined;

    act(() => {
      callback(timestamp);
    });
  }

  it("does not load the AI model when tracking is disabled", () => {
    const { result } = renderHook(() =>
      useHandTracking({
        video,
        enabled: false,
        onLandmarks,
      })
    );

    expect(result.current.status).toBe("idle");

    expect(
      mocks.forVisionTasks
    ).not.toHaveBeenCalled();
  });

  it("does not initialize without a video element", () => {
    const { result } = renderHook(() =>
      useHandTracking({
        video: null,
        enabled: true,
        onLandmarks,
      })
    );

    expect(result.current.status).toBe("idle");

    expect(
      mocks.createFromOptions
    ).not.toHaveBeenCalled();
  });

  it("initializes the model in single-hand video mode", async () => {
    const { result } = renderHook(() =>
      useHandTracking({
        video,
        enabled: true,
        onLandmarks,
      })
    );

    await waitFor(() => {
      expect(result.current.status).toBe(
        "tracking"
      );
    });

    expect(
      mocks.createFromOptions
    ).toHaveBeenCalledWith(
      expect.anything(),

      expect.objectContaining({
        runningMode: "VIDEO",

        numHands: 1,

        baseOptions:
          expect.objectContaining({
            modelAssetPath:
              expect.stringContaining(
                "hand_landmarker.task"
              ),
          }),
      })
    );
  });

  it("processes new video frames and skips duplicate frames", async () => {
    const { result } = renderHook(() =>
      useHandTracking({
        video,
        enabled: true,
        onLandmarks,
      })
    );

    await waitFor(() => {
      expect(result.current.status).toBe(
        "tracking"
      );
    });

    processFrame(100);

    expect(
      mocks.detectForVideo
    ).toHaveBeenCalledTimes(1);

    expect(
      onLandmarks
    ).toHaveBeenCalledWith(landmarks);

    // The video timestamp has not changed.
    processFrame(116);

    expect(
      mocks.detectForVideo
    ).toHaveBeenCalledTimes(1);

    // A new video frame becomes available.
    video.currentTime = 2;

    processFrame(150);

    expect(
      mocks.detectForVideo
    ).toHaveBeenCalledTimes(2);
  });

  it("returns empty landmarks when no hand is detected", async () => {
    mocks.detectForVideo.mockReturnValue({
      landmarks: [],
    });

    const { result } = renderHook(() =>
      useHandTracking({
        video,
        enabled: true,
        onLandmarks,
      })
    );

    await waitFor(() => {
      expect(result.current.status).toBe(
        "tracking"
      );
    });

    processFrame();

    expect(
      onLandmarks
    ).toHaveBeenCalledWith([]);
  });

  it("releases the model when tracking is disabled", async () => {
    const { result, rerender } = renderHook(
      ({ enabled }) =>
        useHandTracking({
          video,
          enabled,
          onLandmarks,
        }),

      {
        initialProps: {
          enabled: true,
        },
      }
    );

    await waitFor(() => {
      expect(result.current.status).toBe(
        "tracking"
      );
    });

    rerender({
      enabled: false,
    });

    expect(
      mocks.close
    ).toHaveBeenCalledTimes(1);

    expect(
      cancelAnimationFrame
    ).toHaveBeenCalled();

    expect(result.current.status).toBe(
      "idle"
    );
  });

  it("releases a model received after unmounting", async () => {
    let resolveModel!: (
      value: typeof model
    ) => void;

    mocks.createFromOptions.mockReturnValueOnce(
      new Promise<typeof model>(
        (resolve) => {
          resolveModel = resolve;
        }
      )
    );

    const { unmount } = renderHook(() =>
      useHandTracking({
        video,
        enabled: true,
        onLandmarks,
      })
    );

    await waitFor(() => {
      expect(
        mocks.createFromOptions
      ).toHaveBeenCalled();
    });

    unmount();

    resolveModel(model);

    await waitFor(() => {
      expect(
        mocks.close
      ).toHaveBeenCalledTimes(1);
    });
  });

  it("handles model loading failures", async () => {
    mocks.createFromOptions.mockRejectedValueOnce(
      new Error("Model unavailable")
    );

    const { result } = renderHook(() =>
      useHandTracking({
        video,
        enabled: true,
        onLandmarks,
      })
    );

    await waitFor(() => {
      expect(result.current.status).toBe(
        "error"
      );
    });

    expect(result.current.error).toBeTruthy();
  });

  it("stops tracking when inference fails", async () => {
    mocks.detectForVideo.mockImplementationOnce(
      () => {
        throw new Error(
          "Inference failed"
        );
      }
    );

    const { result } = renderHook(() =>
      useHandTracking({
        video,
        enabled: true,
        onLandmarks,
      })
    );

    await waitFor(() => {
      expect(result.current.status).toBe(
        "tracking"
      );
    });

    processFrame();

    expect(result.current.status).toBe(
      "error"
    );

    expect(result.current.error).toBeTruthy();

    expect(
      mocks.close
    ).toHaveBeenCalledTimes(1);

    expect(nextFrame).toBeUndefined();
  });
});
