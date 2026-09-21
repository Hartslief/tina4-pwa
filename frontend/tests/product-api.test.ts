import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "tina4js";

import { getProducts } from "../src/services/product-api";

describe("product API", () => {
	// Reset all mocks before each test so that calls from one
	// test do not affect another test.
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("returns products from the API response", async () => {
		// This represents the response returned by your backend.
		const apiResponse = {
			records: [
				{
					id: 1,
					name: "Laptop",
					description: "A laptop computer",
					price: 15000,
					in_stock: true,
				},
				{
					id: 2,
					name: "Keyboard",
					description: "Mechanical keyboard",
					price: 1200,
					in_stock: true,
				},
			],
			total: 2,
			page: 1,
			per_page: 10,
			total_pages: 1,
			limit: 10,
			offset: 0,
		};

		// Prevent the test from making a real HTTP request.
		vi.spyOn(api, "get").mockResolvedValue(apiResponse);

		const products = await getProducts();

		// getProducts() should return the records array rather
		// than the entire pagination response.
		expect(products).toEqual(apiResponse.records);

		// Verify that the correct backend endpoint was called.
		expect(api.get).toHaveBeenCalledWith("/products");
	});

	it("returns an empty array when the API has no products", async () => {
		// Simulate a valid API response containing no products.
		vi.spyOn(api, "get").mockResolvedValue({
			records: [],
			total: 0,
			page: 1,
			per_page: 10,
			total_pages: 0,
			limit: 10,
			offset: 0,
		});

		const products = await getProducts();

		expect(products).toEqual([]);
	});

	it("passes API errors back to the caller", async () => {
		const error = new Error("Failed to load products");

		// Simulate a failed backend request.
		vi.spyOn(api, "get").mockRejectedValue(error);

		// getProducts() doesn't catch the error, so the caller
		// should receive the same rejected error.
		await expect(getProducts()).rejects.toThrow("Failed to load products");
	});
});
