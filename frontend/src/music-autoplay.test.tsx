
import {
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

describe("Automatic track switching", () => {
  let playedSources: (string | null)[];

  beforeEach(() => {
    playedSources = [];

    vi.stubGlobal(
      "URL",
      class extends URL {
        static createObjectURL = vi
          .fn()
          .mockReturnValueOnce("blob:first-song")
          .mockReturnValueOnce("blob:second-song");

        static revokeObjectURL = vi.fn();
      }
    );

    vi.spyOn(
      HTMLMediaElement.prototype,
      "play"
    ).mockImplementation(function (
      this: HTMLMediaElement
    ) {
      playedSources.push(this.getAttribute("src"));

      return Promise.resolve();
    });

    vi.spyOn(
      HTMLMediaElement.prototype,
      "pause"
    ).mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();

    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  function selectMusic(name: string) {
    const file = new File(
      ["test audio"],
      name,
      { type: "audio/mpeg" }
    );

    fireEvent.change(
      screen.getByLabelText("Select music file"),
      {
        target: {
          files: [file],
        },
      }
    );
  }

  it("waits for Play after selecting the first song", () => {
    render(<App />);

    selectMusic("First Song.mp3");

    expect(playedSources).toHaveLength(0);

    expect(
      screen.getByRole("button", {
        name: "Play",
      })
    ).toBeEnabled();
  });

  it("automatically plays a replacement song while music is playing", async () => {
    render(<App />);

    selectMusic("First Song.mp3");

    const audio = screen.getByLabelText("Music audio");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Play",
      })
    );

    fireEvent.play(audio);

    expect(playedSources).toEqual([
      "blob:first-song",
    ]);

    selectMusic("Second Song.mp3");

    await waitFor(() => {
      expect(playedSources).toEqual([
        "blob:first-song",
        "blob:second-song",
      ]);
    });

    expect(
      screen.getByText("Second Song")
    ).toBeInTheDocument();
  });

  it("automatically plays a replacement song while music is paused", async () => {
    render(<App />);

    selectMusic("First Song.mp3");

    const audio = screen.getByLabelText("Music audio");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Play",
      })
    );

    fireEvent.play(audio);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Pause",
      })
    );

    fireEvent.pause(audio);

    selectMusic("Second Song.mp3");

    await waitFor(() => {
      expect(playedSources).toEqual([
        "blob:first-song",
        "blob:second-song",
      ]);
    });
  });
});
