import { describe, expect, it } from "vitest";
import { deadlineLabel, isDueSoon, isOverdue, labelTextColor, statusLabels } from "./utils";

describe("target-date rules", () => {
  it("marks unfinished dates before today as overdue", () => {
    expect(isOverdue(new Date("2026-01-01"), "doing")).toBe(true);
    expect(isOverdue(new Date("2026-01-01"), "done")).toBe(false);
  });

  it("marks dates in the next two days as due soon", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isDueSoon(tomorrow, "todo")).toBe(true);
  });
});

describe("internal statuses", () => {
  it("keeps internal status labels distinct from GitHub labels", () => {
    expect(statusLabels).toEqual({ todo: "Fazer", doing: "Fazendo", done: "Feito" });
  });

  describe("label contrast", () => {
    it("uses white text on dark labels and black text on light labels", () => {
      expect(labelTextColor("24292f")).toBe("#ffffff");
      expect(labelTextColor("fef2c0")).toBe("#000000");
    });

    describe("deadline labels", () => {
      it("identifies overdue dates with their calendar date", () => {
        expect(deadlineLabel(new Date("2020-01-01T12:00:00Z"))).toMatch(/^Vencida —/);
      });
    });
  });
});
