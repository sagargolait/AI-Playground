import { describe, it, expect } from "vitest";
import { google } from "@/ai-sdk/google";
import { GoogleGenerativeAI } from "@google/generative-ai";

describe("Google AI SDK Utils", () => {
  it("should create a Google AI instance with correct model", () => {
    const model = google("gemini-pro");
    expect(model).toBeDefined();
    expect(model.model).toBe("gemini-pro");
  });

  it("should throw error when API key is missing", () => {
    process.env.GOOGLE_API_KEY = "";
    expect(() => google("gemini-pro")).toThrow();
  });
});
