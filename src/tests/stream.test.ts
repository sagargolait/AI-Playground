import { describe, it, expect, vi } from "vitest";
import { POST } from "@/app/api/chat/route";

describe("Stream Handling", () => {
  it("should return StreamingTextResponse", async () => {
    const req = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
      }),
    });

    const response = await POST(req);
    expect(response).toBeInstanceOf(Response);
    expect(response.headers.get("content-type")).toBe(
      "text/plain; charset=utf-8"
    );
  });

  it("should handle stream timeout", async () => {
    vi.useFakeTimers();
    const req = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
      }),
    });

    const responsePromise = POST(req);
    vi.advanceTimersByTime(31000); // Exceed 30s timeout

    await expect(responsePromise).rejects.toThrow();
    vi.useRealTimers();
  });
});
