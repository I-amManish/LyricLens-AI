
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

class MockTrack extends EventTarget {
  kind: "audio" | "video";
  enabled = true;
  readyState = "live";
  stop = vi.fn();

  constructor(kind: "audio" | "video") {
    super();

    this.kind = kind;
  }
}

describe("PC audio capture", () => {
  let originalMediaDevices:
    | PropertyDescriptor
    | undefined;

  beforeEach(() => {
    originalMediaDevices =
      Object.getOwnPropertyDescriptor(
        navigator,
        "mediaDevices"
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
        static createObjectURL = vi
          .fn()
          .mockReturnValue("blob:local-music");

        static revokeObjectURL = vi.fn();
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
  });

  function mockDisplayCapture(
    includeAudio = true
  ) {
    const audioTrack = new MockTrack("audio");
    const videoTrack = new MockTrack("video");

    const audioTracks = includeAudio
      ? [audioTrack]
      : [];

    const stream = {
      getAudioTracks: () => audioTracks,
      getVideoTracks: () => [videoTrack],
      getTracks: () => [
        ...audioTracks,
        videoTrack,
      ],
    };

    const getDisplayMedia = vi
      .fn()
      .mockResolvedValue(stream);

    Object.defineProperty(
      navigator,
      "mediaDevices",
      {
        configurable: true,
        value: {
          getDisplayMedia,
        },
      }
    );

    return {
      audioTrack,
      videoTrack,
      stream,
      getDisplayMedia,
    };
  }

  function connectPC() {
    fireEvent.click(
      screen.getByRole("button", {
        name: "Connect PC Audio",
      })
    );
  }

  it("enables the PC audio connection button", () => {
    mockDisplayCapture();

    render(<App />);

    expect(
      screen.getByRole("button", {
        name: "Connect PC Audio",
      })
    ).toBeEnabled();
  });

  it("requests authorized system audio capture", async () => {
    const { getDisplayMedia } =
      mockDisplayCapture();

    render(<App />);

    connectPC();

    expect(
      getDisplayMedia
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        video: expect.anything(),
        audio: expect.anything(),
        systemAudio: "include",
      })
    );

    expect(
      await screen.findByRole("button", {
        name: "Disconnect PC Audio",
      })
    ).toBeEnabled();
  });

  it("releases all capture tracks when disconnected", async () => {
    const { audioTrack, videoTrack } =
      mockDisplayCapture();

    render(<App />);

    connectPC();

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Disconnect PC Audio",
      })
    );

    expect(
      audioTrack.stop
    ).toHaveBeenCalledTimes(1);

    expect(
      videoTrack.stop
    ).toHaveBeenCalledTimes(1);

    expect(
      screen.getByRole("button", {
        name: "Connect PC Audio",
      })
    ).toBeEnabled();
  });

  it("rejects screen sharing without audio", async () => {
    const { videoTrack } =
      mockDisplayCapture(false);

    render(<App />);

    connectPC();

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "No audio was shared"
    );

    expect(
      videoTrack.stop
    ).toHaveBeenCalledTimes(1);

    expect(
      screen.getByRole("button", {
        name: "Connect PC Audio",
      })
    ).toBeEnabled();
  });

  it("handles cancelled or denied audio sharing", async () => {
    const { getDisplayMedia } =
      mockDisplayCapture();

    getDisplayMedia.mockRejectedValueOnce(
      new DOMException(
        "Permission denied",
        "NotAllowedError"
      )
    );

    render(<App />);

    connectPC();

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Audio sharing was cancelled or denied"
    );

    expect(
      screen.getByRole("button", {
        name: "Connect PC Audio",
      })
    ).toBeEnabled();
  });

  it("disconnects when browser screen sharing ends", async () => {
    const { audioTrack, videoTrack } =
      mockDisplayCapture();

    render(<App />);

    connectPC();

    await screen.findByRole("button", {
      name: "Disconnect PC Audio",
    });

    act(() => {
      videoTrack.dispatchEvent(
        new Event("ended")
      );
    });

    expect(
      audioTrack.stop
    ).toHaveBeenCalledTimes(1);

    expect(
      screen.getByRole("button", {
        name: "Connect PC Audio",
      })
    ).toBeEnabled();
  });

  it("releases capture resources on unmount", async () => {
    const { audioTrack, videoTrack } =
      mockDisplayCapture();

    const { unmount } = render(<App />);

    connectPC();

    await screen.findByRole("button", {
      name: "Disconnect PC Audio",
    });

    unmount();

    expect(
      audioTrack.stop
    ).toHaveBeenCalledTimes(1);

    expect(
      videoTrack.stop
    ).toHaveBeenCalledTimes(1);
  });

  it("releases capture streams received after unmounting", async () => {
    const {
      stream,
      getDisplayMedia,
      audioTrack,
      videoTrack,
    } = mockDisplayCapture();

    let resolveStream!: (
      value: typeof stream
    ) => void;

    getDisplayMedia.mockReturnValueOnce(
      new Promise<typeof stream>(
        (resolve) => {
          resolveStream = resolve;
        }
      )
    );

    const { unmount } = render(<App />);

    connectPC();

    unmount();

    resolveStream(stream);

    await waitFor(() => {
      expect(
        audioTrack.stop
      ).toHaveBeenCalledTimes(1);

      expect(
        videoTrack.stop
      ).toHaveBeenCalledTimes(1);
    });
  });

  it("disables local playback controls during PC audio capture", async () => {
    mockDisplayCapture();

    render(<App />);

    fireEvent.change(
      screen.getByLabelText(
        "Select music file"
      ),
      {
        target: {
          files: [
            new File(
              ["test audio"],
              "Test Song.mp3",
              {
                type: "audio/mpeg",
              }
            ),
          ],
        },
      }
    );

    connectPC();

    await screen.findByRole("button", {
      name: "Disconnect PC Audio",
    });

    expect(
      screen.getByRole("button", {
        name: "Play",
      })
    ).toBeDisabled();

    expect(
      screen.getByRole("slider", {
        name: "Volume",
      })
    ).toBeDisabled();

    expect(
      screen.getByRole("slider", {
        name: "Playback position",
      })
    ).toBeDisabled();
  });

  it("disconnects PC audio when a local song is selected", async () => {
    const { audioTrack, videoTrack } =
      mockDisplayCapture();

    render(<App />);

    connectPC();

    await screen.findByRole("button", {
      name: "Disconnect PC Audio",
    });

    fireEvent.change(
      screen.getByLabelText(
        "Select music file"
      ),
      {
        target: {
          files: [
            new File(
              ["test audio"],
              "Local Song.mp3",
              {
                type: "audio/mpeg",
              }
            ),
          ],
        },
      }
    );

    expect(
      audioTrack.stop
    ).toHaveBeenCalledTimes(1);

    expect(
      videoTrack.stop
    ).toHaveBeenCalledTimes(1);

    expect(
      screen.getByText("Local Song")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Connect PC Audio",
      })
    ).toBeEnabled();
  });
});
