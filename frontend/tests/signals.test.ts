import { describe, it, expect } from "vitest";
import { signal, computed } from "tina4js";

describe("signals", () => {
    it("holds and updates a value", () => {
        const count = signal(1);
        expect(count.value).toBe(1);

        count.value = 5;
        expect(count.value).toBe(5);
    });

    it("re-derives a computed when its source changes", () => {
        const count = signal(2);
        const doubled = computed(() => count.value * 2);
        expect(doubled.value).toBe(4);

        // The assertion that matters: a computed is not a snapshot.
        count.value = 10;
        expect(doubled.value).toBe(20);
    });
});
