import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/chat/route";

describe("Parameter Validation", () => {
  it("should apply default parameters when none provided", async () => {
    const req = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
  });

  it("should validate temperature range", async () => {
    const req = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
        temperature: 2.5, // Invalid temperature
      }),
    });

    await expect(POST(req)).rejects.toThrow();
  });

  it("should validate maxTokens range", async () => {
    const req = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
        maxTokens: -1, // Invalid token count
      }),
    });

    await expect(POST(req)).rejects.toThrow();
  });
});
