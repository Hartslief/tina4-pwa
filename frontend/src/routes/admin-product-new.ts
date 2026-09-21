import { route } from "tina4js";
import { adminProductNewPage } from "@/pages/admin-product-new";
import { isLoggedIn, isAdmin } from "@/store";

// Register the new-product admin route.
route("/admin/products/new", {
	// Protect the route so only authenticated administrators can access it.
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

	// Render the new-product page.
	handler: adminProductNewPage,
});
