import {
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

describe("LyricLens AI", () => {
  it("renders the application title", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "LyricLens AI" })
    ).toBeInTheDocument();
  });

  it("renders the application tagline", () => {
    render(<App />);

    expect(
      screen.getByText(
        "Don't just listen to music. Become the music."
      )
    ).toBeInTheDocument();
  });

  it("renders the live studio", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Live Studio" })
    ).toBeInTheDocument();
  });

  it("renders the camera control", () => {
    render(<App />);

    expect(
      screen.getByRole("button", { name: "Enable Camera" })
    ).toBeInTheDocument();
  });

  it("renders the music upload control", () => {
    render(<App />);

    expect(
      screen.getByRole("button", { name: "Upload Music" })
    ).toBeInTheDocument();
  });

  it("renders the cover capture control", () => {
    render(<App />);

    expect(
      screen.getByRole("button", { name: "Capture Cover" })
    ).toBeInTheDocument();
  });
});

describe("Webcam integration", () => {
  let originalMediaDevices: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalMediaDevices = Object.getOwnPropertyDescriptor(
      navigator,
      "mediaDevices"
    );
  });

  afterEach(() => {
    if (originalMediaDevices) {
      Object.defineProperty(
        navigator,
        "mediaDevices",
        originalMediaDevices
      );
    } else {
      Reflect.deleteProperty(navigator, "mediaDevices");
    }
  });

  function mockCamera() {
    const stop = vi.fn();

    const stream = {
      getTracks: () => [{ stop }],
    };

    const getUserMedia = vi.fn().mockResolvedValue(stream);

    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia },
    });

    return { stop, stream, getUserMedia };
  }

  it("enables the webcam when clicked", async () => {
    const { getUserMedia, stream } = mockCamera();

    render(<App />);

    const button = screen.getByRole("button", {
      name: "Enable Camera",
    });

    expect(button).toBeEnabled();

    fireEvent.click(button);

    expect(getUserMedia).toHaveBeenCalledWith(
      expect.objectContaining({
        video: expect.anything(),
        audio: false,
      })
    );

    expect(
      await screen.findByRole("button", {
        name: "Disable Camera",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Live webcam preview")
    ).toHaveProperty("srcObject", stream);
  });

  it("disables the webcam and stops its tracks", async () => {
    const { stop } = mockCamera();

    render(<App />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enable Camera",
      })
    );

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Disable Camera",
      })
    );

    expect(stop).toHaveBeenCalledTimes(1);

    expect(
      screen.getByRole("button", {
        name: "Enable Camera",
      })
    ).toBeEnabled();

    expect(
      screen.getByLabelText("Live webcam preview")
    ).toHaveProperty("srcObject", null);
  });

  it("handles denied camera permission", async () => {
    const { getUserMedia } = mockCamera();

    getUserMedia.mockRejectedValueOnce(
      new DOMException(
        "Permission denied",
        "NotAllowedError"
      )
    );

    render(<App />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enable Camera",
      })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Camera permission denied");

    expect(
      screen.getByRole("button", {
        name: "Enable Camera",
      })
    ).toBeEnabled();
  });

  it("releases the webcam when the application unmounts", async () => {
    const { stop } = mockCamera();

    const { unmount } = render(<App />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enable Camera",
      })
    );

    await screen.findByRole("button", {
      name: "Disable Camera",
    });

    unmount();

    expect(stop).toHaveBeenCalledTimes(1);
  });

  it("releases a camera stream received after unmounting", async () => {
    const { stop, stream, getUserMedia } = mockCamera();

    let resolveStream!: (value: typeof stream) => void;

    const pendingStream = new Promise<typeof stream>((resolve) => {
      resolveStream = resolve;
    });

    getUserMedia.mockReturnValueOnce(pendingStream);

    const { unmount } = render(<App />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enable Camera",
      })
    );

    unmount();

    resolveStream(stream);

    await waitFor(() => {
      expect(stop).toHaveBeenCalledTimes(1);
    });
  });
});

describe("Fullscreen camera", () => {
  it("expands the camera stage when fullscreen is clicked", () => {
    render(<App />);

    const cameraStage = screen.getByRole("region", {
      name: "Camera preview",
    });

    const requestFullscreen = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(cameraStage, "requestFullscreen", {
      configurable: true,
      value: requestFullscreen,
    });

    const fullscreenButton = screen.getByRole("button", {
      name: "Fullscreen",
    });

    expect(fullscreenButton).toBeEnabled();

    fireEvent.click(fullscreenButton);

    expect(requestFullscreen).toHaveBeenCalledTimes(1);
  });
});