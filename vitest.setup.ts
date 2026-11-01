import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock server-only so server modules can be unit-tested in jsdom
vi.mock("server-only", () => ({}));
