
import {
  cleanup,
  render,
  screen,
} from "@testing-library/react";

import {
  afterEach,
  describe,
  expect,
  it,
} from "vitest";

import GestureCursor from "./GestureCursor";

describe("Gesture cursor", () => {
  afterEach(() => {
    cleanup();
  });

  it("does not render when no hand is detected", () => {
    render(
      <GestureCursor
        cursor={null}
        pinching={false}
      />
    );

    expect(
      screen.queryByTestId(
        "gesture-cursor"
      )
    ).not.toBeInTheDocument();
  });

  it("renders when a cursor position is available", () => {
    render(
      <GestureCursor
        cursor={{
          x: 300,
          y: 200,
        }}
        pinching={false}
      />
    );

    expect(
      screen.getByTestId(
        "gesture-cursor"
      )
    ).toBeInTheDocument();
  });

  it("positions the cursor using viewport coordinates", () => {
    render(
      <GestureCursor
        cursor={{
          x: 320,
          y: 240,
        }}
        pinching={false}
      />
    );

    expect(
      screen.getByTestId(
        "gesture-cursor"
      )
    ).toHaveStyle({
      left: "320px",
      top: "240px",
    });
  });

  it("updates the cursor when the hand moves", () => {
    const { rerender } = render(
      <GestureCursor
        cursor={{
          x: 100,
          y: 150,
        }}
        pinching={false}
      />
    );

    rerender(
      <GestureCursor
        cursor={{
          x: 450,
          y: 350,
        }}
        pinching={false}
      />
    );

    expect(
      screen.getByTestId(
        "gesture-cursor"
      )
    ).toHaveStyle({
      left: "450px",
      top: "350px",
    });
  });

  it("displays the normal tracking state", () => {
    render(
      <GestureCursor
        cursor={{
          x: 300,
          y: 200,
        }}
        pinching={false}
      />
    );

    expect(
      screen.getByTestId(
        "gesture-cursor"
      )
    ).toHaveAttribute(
      "data-state",
      "tracking"
    );
  });

  it("displays visual feedback during a pinch", () => {
    const { rerender } = render(
      <GestureCursor
        cursor={{
          x: 300,
          y: 200,
        }}
        pinching={false}
      />
    );

    rerender(
      <GestureCursor
        cursor={{
          x: 300,
          y: 200,
        }}
        pinching={true}
      />
    );

    expect(
      screen.getByTestId(
        "gesture-cursor"
      )
    ).toHaveAttribute(
      "data-state",
      "pinching"
    );
  });

  it("does not interfere with normal pointer interaction", () => {
    render(
      <GestureCursor
        cursor={{
          x: 300,
          y: 200,
        }}
        pinching={false}
      />
    );

    expect(
      screen.getByTestId(
        "gesture-cursor"
      )
    ).toHaveStyle({
      pointerEvents: "none",
      position: "fixed",
    });
  });

  it("is hidden from assistive technology", () => {
    render(
      <GestureCursor
        cursor={{
          x: 300,
          y: 200,
        }}
        pinching={false}
      />
    );

    expect(
      screen.getByTestId(
        "gesture-cursor"
      )
    ).toHaveAttribute(
      "aria-hidden",
      "true"
    );
  });

  it("disappears when hand tracking is lost", () => {
    const { rerender } = render(
      <GestureCursor
        cursor={{
          x: 300,
          y: 200,
        }}
        pinching={false}
      />
    );

    expect(
      screen.getByTestId(
        "gesture-cursor"
      )
    ).toBeInTheDocument();

    rerender(
      <GestureCursor
        cursor={null}
        pinching={false}
      />
    );

    expect(
      screen.queryByTestId(
        "gesture-cursor"
      )
    ).not.toBeInTheDocument();
  });
});
