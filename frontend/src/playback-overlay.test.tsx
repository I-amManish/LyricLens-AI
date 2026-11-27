
import {
  render,
  screen,
  within,
} from "@testing-library/react";

import {
  describe,
  expect,
  it,
} from "vitest";

import App from "./App";

describe("Transparent playback overlay", () => {
  it("renders playback buttons inside the camera stage", () => {
    render(<App />);

    const camera = screen.getByRole("region", {
      name: "Camera preview",
    });

    for (const name of [
      "Play",
      "Previous track",
      "Next track",
    ]) {
      expect(
        within(camera).getByRole("button", { name })
      ).toBeInTheDocument();
    }
  });

  it("renders track information inside the camera stage", () => {
    render(<App />);

    const camera = screen.getByRole("region", {
      name: "Camera preview",
    });

    expect(
      within(camera).getByText("No track selected")
    ).toBeInTheDocument();
  });

  it("renders volume and playback progress inside the camera stage", () => {
    render(<App />);

    const camera = screen.getByRole("region", {
      name: "Camera preview",
    });

    for (const name of [
      "Volume",
      "Playback position",
    ]) {
      expect(
        within(camera).getByRole("slider", { name })
      ).toBeInTheDocument();
    }
  });

  it("places both audio source controls inside the camera stage", () => {
    render(<App />);

    const camera = screen.getByRole("region", {
      name: "Camera preview",
    });

    for (const name of [
      "Upload Music",
      "Connect PC Audio",
    ]) {
      const button = screen.getByRole("button", {
        name,
      });

      expect(camera).toContainElement(button);

      expect(button).toHaveAttribute(
        "data-gesture-disabled",
        "true"
      );
    }
  });

  it("maintains a single local audio engine", () => {
    render(<App />);

    expect(
      screen.getAllByLabelText("Music audio")
    ).toHaveLength(1);
  });

  it("renders only one Play button", () => {
    render(<App />);

    expect(
      screen.getAllByRole("button", {
        name: "Play",
      })
    ).toHaveLength(1);
  });

  it("keeps playback disabled when no track is loaded", () => {
    render(<App />);

    expect(
      screen.getByRole("button", {
        name: "Play",
      })
    ).toBeDisabled();
  });

  it("removes the external audio footer", () => {
    render(<App />);

    expect(
      screen.queryByRole("contentinfo")
    ).not.toBeInTheDocument();
  });
});
