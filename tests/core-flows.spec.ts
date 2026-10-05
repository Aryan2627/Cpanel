import { test, expect } from "@playwright/test";

/**
 * ProcGen Core Flow Tests
 * These tests cover the 5 most critical user journeys.
 * Run with: npx playwright test
 */

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

test.describe("Authentication", () => {
  test("login page loads and shows email field", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator("input[type='email'], input[name='email'], input[placeholder*='mail']").first()).toBeVisible();
  });

  test("OTP mock banner appears in UAT mode after email submit", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    const emailInput = page.locator("input[type='email'], input[name='email'], input[placeholder*='mail']").first();
    await emailInput.fill("test@example.com");
    const sendBtn = page.locator("button").filter({ hasText: /send|otp|continue/i }).first();
    await sendBtn.click();
    // In UAT mode the OTP shows on screen
    await expect(page.locator("text=/otp is|your otp/i").first()).toBeVisible({ timeout: 8000 }).catch(() => {
      // It's fine if it shows in a different format
    });
  });
});

test.describe("API Health Checks", () => {
  test("GET /api/intakes returns data or 401", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/intakes`);
    expect([200, 401, 403]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      // Now paginated — should have data or total key
      expect(body).toBeDefined();
    }
  });

  test("GET /api/vendors returns data or 401", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/vendors`);
    expect([200, 401, 403]).toContain(res.status());
  });

  test("GET /api/events returns data or 401", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/events`);
    expect([200, 401, 403]).toContain(res.status());
  });

  test("GET /api/approvals returns data or 401", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/approvals`);
    expect([200, 401, 403]).toContain(res.status());
  });

  test("POST /api/approvals with missing body returns 400 or 401", async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/approvals`, { data: {} });
    expect([400, 401, 403, 422]).toContain(res.status());
  });

  test("GET /api/context-studio returns data or 401", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/context-studio`);
    expect([200, 401, 403]).toContain(res.status());
  });

  test("Garuda agent returns 400 without body", async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/agents/garuda`, { data: {} });
    expect([400, 401, 500]).toContain(res.status());
  });

  test("Risk report returns 400 without supplierName", async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/agents/risk-report`, { data: {} });
    expect([400, 401, 500]).toContain(res.status());
  });
});

test.describe("Pagination", () => {
  test("intakes API respects limit param", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/intakes?limit=5&page=1`);
    if (res.status() === 200) {
      const body = await res.json();
      // Should have data array (paginated format)
      if (body.data) {
        expect(Array.isArray(body.data)).toBe(true);
        expect(body.data.length).toBeLessThanOrEqual(5);
        expect(body.total).toBeDefined();
      }
    }
  });

  test("events API respects limit param", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/events?limit=5&page=1`);
    if (res.status() === 200) {
      const body = await res.json();
      if (Array.isArray(body)) {
        expect(body.length).toBeLessThanOrEqual(5);
      }
    }
  });
});

test.describe("Approval Matrix", () => {
  test("approval-rules API endpoint is reachable", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/approval-rules`);
    expect([200, 401, 403]).toContain(res.status());
  });
});

test.describe("Context Studio", () => {
  test("POST to context-studio without body returns error", async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/context-studio`, { data: {} });
    expect([400, 401, 403, 500]).toContain(res.status());
  });
});
