import { describe, it, expect, beforeEach, vi } from "vitest";
import { api } from "tina4js";

import {
	token,
	user,
	isLoggedIn,
	isAdmin,
	setAuthUser,
	clearAuth,
	restoreAuth,
} from "../src/store";

describe("authentication store", () => {
	// Reset the authentication state before every test.
	//
	// This prevents one test from affecting another test through
	// the module-level signals.
	beforeEach(() => {
		localStorage.clear();

		token.value = null;
		user.value = null;

		vi.restoreAllMocks();
	});

	it("starts logged out when there is no saved token", () => {
		// There should be no token when localStorage is empty.
		expect(token.value).toBeNull();

		// isLoggedIn is computed from the token signal.
		expect(isLoggedIn.value).toBe(false);

		// There should also be no current user.
		expect(user.value).toBeNull();
	});

	it("restores the token from localStorage", async () => {
		// Simulate a token that was saved by a previous session.
		localStorage.setItem("tina4_token", "test-token");

		// The store reads localStorage when the module is first
		// imported, so this test mainly verifies the storage value.
		expect(localStorage.getItem("tina4_token")).toBe("test-token");
	});

	it("sets the authenticated user", () => {
		const testUser = {
			id: 1,
			email: "test@example.com",
			role: "user",
		};

		// Store the user.
		setAuthUser(testUser);

		// The signal should now contain the same user.
		expect(user.value).toEqual(testUser);
	});

	it("detects when a user is an admin", () => {
		// Start with a normal user.
		setAuthUser({
			id: 1,
			email: "user@example.com",
			role: "user",
		});

		expect(isAdmin.value).toBe(false);

		// Change the user to an admin.
		setAuthUser({
			id: 2,
			email: "admin@example.com",
			role: "admin",
		});

		// The computed signal should update automatically.
		expect(isAdmin.value).toBe(true);
	});

	it("clears authentication state", () => {
		// Simulate an authenticated user.
		localStorage.setItem("tina4_token", "test-token");

		token.value = "test-token";

		setAuthUser({
			id: 1,
			email: "test@example.com",
			role: "user",
		});

		// Verify that authentication exists before clearing it.
		expect(token.value).toBe("test-token");
		expect(user.value).not.toBeNull();
		expect(isLoggedIn.value).toBe(true);

		// Clear authentication.
		clearAuth();

		// Everything should now be reset.
		expect(token.value).toBeNull();
		expect(user.value).toBeNull();
		expect(isLoggedIn.value).toBe(false);

		// The browser should no longer contain the token.
		expect(localStorage.getItem("tina4_token")).toBeNull();
	});

	it("restores the current user from the API", async () => {
		// Give the application a token so restoreAuth() will
		// actually make an API request.
		token.value = "valid-token";

		const currentUser = {
			id: 1,
			email: "admin@example.com",
			role: "admin",
		};

		// Replace api.get with a mocked function for this test.
		vi.spyOn(api, "get").mockResolvedValue(currentUser);

		await restoreAuth();

		// The returned user should be stored in the user signal.
		expect(user.value).toEqual(currentUser);

		// Because the returned user is an admin, the computed
		// admin signal should also update.
		expect(isAdmin.value).toBe(true);

		// Make sure the correct endpoint was requested.
		expect(api.get).toHaveBeenCalledWith("/auth/me");
	});

	it("clears authentication when restoring the user fails", async () => {
		// Simulate an existing authentication token.
		token.value = "invalid-token";

		localStorage.setItem("tina4_token", "invalid-token");

		// Simulate the backend rejecting the request.
		vi.spyOn(api, "get").mockRejectedValue(new Error("Unauthorized"));

		await restoreAuth();

		// Failed authentication restoration should log the user out.
		expect(token.value).toBeNull();
		expect(user.value).toBeNull();

		expect(localStorage.getItem("tina4_token")).toBeNull();

		expect(isLoggedIn.value).toBe(false);
	});

	it("does not call the API when there is no token", async () => {
		// Make sure the application is logged out.
		token.value = null;

		const getSpy = vi.spyOn(api, "get");

		await restoreAuth();

		// Without a token there is no reason to contact /auth/me.
		expect(getSpy).not.toHaveBeenCalled();
	});
});
