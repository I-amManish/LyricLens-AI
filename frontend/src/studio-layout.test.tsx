
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

describe("Spatial studio layout", () => {
  it("places music upload inside the music player", () => {
    render(<App />);

    const player = screen.getByRole("contentinfo");

    expect(
      within(player).getByRole("button", {
        name: "Upload Music",
      })
    ).toBeEnabled();
  });

  it("places PC audio inside the music player", () => {
    render(<App />);

    const player = screen.getByRole("contentinfo");

    expect(
      within(player).getByRole("button", {
        name: "Connect PC Audio",
      })
    ).toBeInTheDocument();
  });

  it("places cover capture inside the camera stage", () => {
    render(<App />);

    const camera = screen.getByRole("region", {
      name: "Camera preview",
    });

    expect(
      within(camera).getByRole("button", {
        name: "Capture Cover",
      })
    ).toBeInTheDocument();
  });

  it("places video recording inside the camera stage", () => {
    render(<App />);

    const camera = screen.getByRole("region", {
      name: "Camera preview",
    });

    expect(
      within(camera).getByRole("button", {
        name: "Record Video",
      })
    ).toBeInTheDocument();
  });

  it("places gesture controls inside the header", () => {
    render(<App />);

    const header = screen.getByRole("banner");

    expect(
      within(header).getByRole("button", {
        name: "Gesture control",
      })
    ).toBeInTheDocument();
  });

  it("removes the old floating media dock", () => {
    render(<App />);

    expect(
      screen.queryByRole("group", {
        name: "Media controls",
      })
    ).not.toBeInTheDocument();
  });

  it("renders a compact artwork style selector", () => {
    render(<App />);

    expect(
      screen.getByRole("button", {
        name: "Artwork styles",
      })
    ).toBeInTheDocument();
  });

  it("renders the Auto AI control", () => {
    render(<App />);

    expect(
      screen.getByRole("button", {
        name: "Auto AI",
      })
    ).toBeInTheDocument();
  });

  it("renders all five AI creative tools inside the right toolbar", () => {
    render(<App />);

    const toolbar = screen.getByRole("complementary", {
      name: "AI creative tools",
    });

    const tools = [
      "Auto AI",
      "Artwork styles",
      "Lyrics",
      "AI effects",
      "Body tracking",
    ];

    for (const name of tools) {
      expect(
        within(toolbar).getByRole("button", { name })
      ).toBeDisabled();
    }

    expect(
      within(toolbar).getAllByRole("button")
    ).toHaveLength(5);
  });

  it("places the creative toolbar after the main workspace", () => {
    render(<App />);

    const workspace = screen.getByRole("main");

    const toolbar = screen.getByRole("complementary", {
      name: "AI creative tools",
    });

    expect(
      workspace.nextElementSibling
    ).toBe(toolbar);
  });
});
