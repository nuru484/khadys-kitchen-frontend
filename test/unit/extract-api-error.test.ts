import { describe, it, expect } from "vitest";
import { extractApiError } from "@/lib/extract-api-error";

describe("extractApiError", () => {
  it("passes a plain string through", () => {
    expect(extractApiError("Boom").message).toBe("Boom");
  });

  it("reads an Error's message", () => {
    expect(extractApiError(new Error("Failed to fetch")).message).toBe("Failed to fetch");
  });

  it("falls back to a generic message for null", () => {
    const r = extractApiError(null);
    expect(r.message).toMatch(/went wrong/i);
    expect(r.hasFieldErrors).toBe(false);
  });

  it("handles RTK Query FETCH_ERROR", () => {
    const r = extractApiError({ status: "FETCH_ERROR", error: "TypeError" });
    expect(r.message).toMatch(/connection/i);
    expect(r.status).toBe("FETCH_ERROR");
  });

  it("maps numeric HTTP statuses to friendly copy", () => {
    expect(extractApiError({ status: 403 }).message).toMatch(/access/i);
    expect(extractApiError({ status: 500 }).message).toMatch(/kitchen/i);
  });

  it("prefers the server-provided message on a { status, data } envelope", () => {
    const r = extractApiError({ status: 400, data: { status: "error", message: "Name is required" } });
    expect(r.message).toBe("Name is required");
    expect(r.status).toBe(400);
  });

  it("extracts the first message per field", () => {
    const r = extractApiError({
      status: 422,
      data: {
        message: "Validation failed",
        details: {
          errors: [
            { field: "phone", message: "Enter a full number" },
            { field: "phone", message: "second phone error ignored" },
            { field: "email", message: "Invalid email" },
          ],
        },
      },
    });
    expect(r.hasFieldErrors).toBe(true);
    expect(r.fieldErrors).toEqual({ phone: "Enter a full number", email: "Invalid email" });
  });
});
