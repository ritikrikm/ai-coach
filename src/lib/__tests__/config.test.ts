import { describe, it, expect } from "vitest";
import { env } from "@/lib/config";

describe("env", () => {
  it("loads defaults", () => {
    expect(["development", "test", "production"]).toContain(env.NODE_ENV);
  });
});
