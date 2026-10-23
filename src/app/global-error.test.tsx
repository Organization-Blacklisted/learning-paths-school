import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import GlobalError from "./global-error";

// next/font only works inside Next’s compiler; the page only needs the class names it returns.
vi.mock("@/fonts", () => ({ lexendDeca: { variable: "font-a" }, plusJakartaSans: { variable: "font-b" } }));

// global-error replaces the whole document (<html>), so it is rendered to a string here instead of into the test page.
const html = () => renderToStaticMarkup(<GlobalError error={new Error("the root layout broke: secret")} retry={vi.fn()} />);

describe("the last-resort error screen (global-error)", () => {
  it("is a complete document with a language, a title and one h1", () => {
    const markup = html();
    expect(markup).toMatch(/^<html lang="en"/);
    expect(markup).toContain("<title>Something went wrong | Learning Paths School</title>");
    expect(markup.match(/<h1/g)).toHaveLength(1);
  });

  it("offers a retry button and a plain link home (a full page load, not a client navigation)", () => {
    const markup = html();
    expect(markup).toContain(">Try again</button>");
    expect(markup).toMatch(/<a href="\/"[^>]*>Back to the home page<\/a>/);
  });

  it("is the main landmark, and never prints the error's message", () => {
    const markup = html();
    expect(markup).toContain('<main id="main-content"');
    expect(markup).not.toContain("secret");
  });
});
