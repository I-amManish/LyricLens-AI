
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

describe("Music playback", () => {
  const createObjectURL = vi.fn(() => "blob:music-test");
  const revokeObjectURL = vi.fn();

  let playMock: ReturnType<typeof vi.spyOn>;
  let pauseMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.stubGlobal(
      "URL",
      class extends URL {
        static createObjectURL = createObjectURL;
        static revokeObjectURL = revokeObjectURL;
      }
    );

    playMock = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockResolvedValue(undefined);

    pauseMock = vi
      .spyOn(HTMLMediaElement.prototype, "pause")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  function selectMusic(
    name = "Test Song.mp3",
    type = "audio/mpeg"
  ) {
    const file = new File(
      ["test audio"],
      name,
      { type }
    );

    const input = screen.getByLabelText(
      "Select music file"
    );

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    return file;
  }

  it("enables the upload music button", () => {
    render(<App />);

    expect(
      screen.getByRole("button", {
        name: "Upload Music",
      })
    ).toBeEnabled();
  });

  it("disables playback before music is loaded", () => {
    render(<App />);

    expect(
      screen.getByRole("button", {
        name: "Play",
      })
    ).toBeDisabled();
  });

  it("opens the music file selector", () => {
    render(<App />);

    const input = screen.getByLabelText(
      "Select music file"
    );

    const clickMock = vi
      .spyOn(input, "click")
      .mockImplementation(() => {});

    fireEvent.click(
      screen.getByRole("button", {
        name: "Upload Music",
      })
    );

    expect(clickMock).toHaveBeenCalledTimes(1);
  });

  it("loads a selected audio file", () => {
    render(<App />);

    const file = selectMusic();

    expect(createObjectURL).toHaveBeenCalledWith(file);

    expect(
      screen.getByText("Test Song")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Play",
      })
    ).toBeEnabled();

    expect(
      screen.getByLabelText("Music audio")
    ).toHaveAttribute("src", "blob:music-test");
  });

  it("plays the selected music", async () => {
    render(<App />);

    selectMusic();

    const audio = screen.getByLabelText("Music audio");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Play",
      })
    );

    expect(playMock).toHaveBeenCalled();

    fireEvent.play(audio);

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Pause",
        })
      ).toBeInTheDocument();
    });
  });

  it("pauses the currently playing music", async () => {
    render(<App />);

    selectMusic();

    const audio = screen.getByLabelText("Music audio");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Play",
      })
    );

    fireEvent.play(audio);

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Pause",
      })
    );

    expect(pauseMock).toHaveBeenCalled();

    fireEvent.pause(audio);

    expect(
      screen.getByRole("button", {
        name: "Play",
      })
    ).toBeInTheDocument();
  });

  it("updates the audio volume", () => {
    render(<App />);

    selectMusic();

    const audio = screen.getByLabelText(
      "Music audio"
    ) as HTMLAudioElement;

    fireEvent.change(
      screen.getByRole("slider", {
        name: "Volume",
      }),
      {
        target: {
          value: "50",
        },
      }
    );

    expect(audio.volume).toBe(0.5);
  });

  it("seeks to a selected playback position", () => {
    render(<App />);

    selectMusic();

    const audio = screen.getByLabelText(
      "Music audio"
    ) as HTMLAudioElement;

    Object.defineProperty(audio, "duration", {
      configurable: true,
      value: 180,
    });

    fireEvent.loadedMetadata(audio);

    fireEvent.change(
      screen.getByRole("slider", {
        name: "Playback position",
      }),
      {
        target: {
          value: "60",
        },
      }
    );

    expect(audio.currentTime).toBe(60);
  });

  it("updates the displayed playback time", () => {
    render(<App />);

    selectMusic();

    const audio = screen.getByLabelText(
      "Music audio"
    ) as HTMLAudioElement;

    audio.currentTime = 65;

    fireEvent.timeUpdate(audio);

    expect(
      screen.getByText("1:05")
    ).toBeInTheDocument();
  });

  it("returns to the play state when music ends", async () => {
    render(<App />);

    selectMusic();

    const audio = screen.getByLabelText("Music audio");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Play",
      })
    );

    fireEvent.play(audio);

    await screen.findByRole("button", {
      name: "Pause",
    });

    fireEvent.ended(audio);

    expect(
      screen.getByRole("button", {
        name: "Play",
      })
    ).toBeInTheDocument();
  });

  it("releases the previous music object URL", () => {
    render(<App />);

    selectMusic("First Song.mp3");

    createObjectURL.mockReturnValueOnce(
      "blob:second-song"
    );

    selectMusic("Second Song.mp3");

    expect(revokeObjectURL).toHaveBeenCalledWith(
      "blob:music-test"
    );

    expect(
      screen.getByText("Second Song")
    ).toBeInTheDocument();
  });

  it("releases the music object URL on unmount", () => {
    const { unmount } = render(<App />);

    selectMusic();

    unmount();

    expect(revokeObjectURL).toHaveBeenCalledWith(
      "blob:music-test"
    );
  });
});
