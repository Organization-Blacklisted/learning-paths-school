import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RouteError from "./error";

const secret = "database password is hunter2";

function renderError(error: unknown = new Error(secret), retry = vi.fn()) {
  vi.spyOn(console, "error").mockImplementation(() => {});
  return { retry, ...render(<RouteError error={error} retry={retry} />) };
}

describe("the page error screen", () => {
  it("shows a heading, the way to try again and the way back home", () => {
    const { getByRole } = renderError();
    expect(getByRole("heading", { level: 1 }).textContent).toContain("couldn’t show this page");
    expect(getByRole("button", { name: "Try again" })).toBeTruthy();
    expect(getByRole("link", { name: "Back to the home page" }).getAttribute("href")).toBe("/");
  });

  it("'Try again' calls retry (Next 16.4's name for re-rendering the page), once per click", () => {
    const { getByRole, retry } = renderError();
    expect(retry).not.toHaveBeenCalled();
    fireEvent.click(getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("is the page's main landmark, the target of the skip link", () => {
    const { container } = renderError();
    const main = container.querySelector("main");
    expect(main?.id).toBe("main-content");
    expect(main?.tabIndex).toBe(-1);
  });

  it("writes the error to the console (until an error reporting service is set up)", () => {
    const error = new Error(secret);
    renderError(error);
    expect(console.error).toHaveBeenCalledWith(error);
  });

  it("never shows the message of the error to the visitor", () => {
    const { container } = renderError(new Error(secret));
    expect(container.textContent).not.toContain("hunter2");
  });

  it("shows the digest as a reference to quote, when there is one", () => {
    const error = Object.assign(new Error("x"), { digest: "abc123" });
    const { container } = renderError(error);
    expect(container.textContent).toContain("Reference: abc123");
  });

  it("shows no reference without a digest, or when the thrown value is not an Error (a client component can throw anything)", () => {
    expect(renderError(new Error("x")).container.textContent).not.toContain("Reference");
    expect(renderError("just a string").container.textContent).not.toContain("Reference");
    expect(renderError(undefined).container.textContent).not.toContain("Reference");
  });
});
