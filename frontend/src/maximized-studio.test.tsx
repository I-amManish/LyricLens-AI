
import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";

import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import App from "./App";

describe("Maximized studio", () => {
  it("retains the studio heading without consuming visible space", () => {
    render(<App />);

    const heading = screen.getByRole(
      "heading",
      { name: "Live Studio" }
    );

    expect(
      heading.parentElement
    ).toHaveClass("sr-only");
  });

  it("fills the camera stage with an aspect-ratio-preserving video", async () => {
    const original =
      Object.getOwnPropertyDescriptor(
        navigator,
        "mediaDevices"
      );

    Object.defineProperty(
      navigator,
      "mediaDevices",
      {
        configurable: true,
        value: {
          getUserMedia: vi.fn().mockResolvedValue({
            getTracks: () => [
              { stop: vi.fn() },
            ],
          }),
        },
      }
    );

    const { unmount } = render(<App />);

    try {
      fireEvent.click(
        screen.getByRole("button", {
          name: "Enable Camera",
        })
      );

      await screen.findByRole("button", {
        name: "Disable Camera",
      });

      expect(
        screen.getByLabelText(
          "Live webcam preview"
        )
      ).toHaveClass("object-cover");
    } finally {
      unmount();

      if (original) {
        Object.defineProperty(
          navigator,
          "mediaDevices",
          original
        );
      } else {
        Reflect.deleteProperty(
          navigator,
          "mediaDevices"
        );
      }
    }
  });
});
