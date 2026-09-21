import { route } from "tina4js";
import { adminPage } from "@/pages/admin";
import { isLoggedIn, isAdmin } from "@/store";

// Register the main admin dashboard route.
route("/admin", {
	// Protect the dashboard so only administrators can access it.
	guard: () => {
		// Unauthenticated users must log in first.
		if (!isLoggedIn.value) {
			return "/login";
		}

		// Logged-in users who are not administrators are sent back to the home page.
		if (!isAdmin.value) {
			return "/";
		}

		// Returning true allows navigation to continue.
		return true;
	},

	// Render the admin dashboard.
	handler: adminPage,
});
