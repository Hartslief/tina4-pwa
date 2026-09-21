import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "tina4js";

import { login, register } from "../src/services/auth-api";

describe("authentication API", () => {
	// Reset API mocks before every test.
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("logs a user in", async () => {
		// Simulate the response returned by the backend login endpoint.
		const response = {
			token: "jwt-test-token",
		};

		vi.spyOn(api, "post").mockResolvedValue(response);

		const result = await login("test@example.com", "password123");

		// The service should return the token received from
		// the backend.
		expect(result).toEqual(response);

		// Verify the correct endpoint and request body.
		expect(api.post).toHaveBeenCalledWith("/auth/login", {
			email: "test@example.com",
			password: "password123",
		});
	});

	it("registers a new user", async () => {
		// Simulate the backend registration response.
		const response = {
			message: "Registered",
			id: 10,
		};

		vi.spyOn(api, "post").mockResolvedValue(response);

		const result = await register("newuser@example.com", "password123");

		// The registration service should return the backend response.
		expect(result).toEqual(response);

		// Verify the request sent to the backend.
		expect(api.post).toHaveBeenCalledWith("/auth/register", {
			email: "newuser@example.com",
			password: "password123",
		});
	});

	it("passes login errors back to the caller", async () => {
		// Simulate the backend rejecting invalid credentials.
		vi.spyOn(api, "post").mockRejectedValue(new Error("Invalid credentials"));

		await expect(login("wrong@example.com", "wrong-password")).rejects.toThrow(
			"Invalid credentials",
		);
	});

	it("passes registration errors back to the caller", async () => {
		// Simulate the backend rejecting the registration.
		vi.spyOn(api, "post").mockRejectedValue(
			new Error("Email already registered"),
		);

		await expect(
			register("existing@example.com", "password123"),
		).rejects.toThrow("Email already registered");
	});
});
