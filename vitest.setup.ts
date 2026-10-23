import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Testing Library only cleans up by itself when the test globals are on; they are off here (tests import from "vitest").
afterEach(() => cleanup());
