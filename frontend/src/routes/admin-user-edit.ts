import { route } from "tina4js";
import { adminUserEditPage } from "@/pages/admin-user-edit";
import { isLoggedIn, isAdmin } from "@/store";

/* 
    Register the user-editing admin route. 
    
    Example: 
    /admin/users/5/edit
*/
route("/admin/users/{id}/edit", {
	// Only authenticated administrators can access this route.
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

	// Pass the dynamic user ID to the page.
	handler: (params) => adminUserEditPage(params.id),
});
