import { route } from "tina4js";
import { adminProductEditPage } from "@/pages/admin-product-edit";
import { isLoggedIn, isAdmin } from "@/store";

/* 
    Register the product editing route. 
    {id} is a dynamic route parameter. 
    
    Example: 
    /admin/products/5/edit
*/
route("/admin/products/{id}/edit", {
	// Protect the route before allowing the page to be displayed.
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

	// Pass the dynamic route ID to the page function.
	handler: (params) => adminProductEditPage(params.id),
});
