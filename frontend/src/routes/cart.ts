import { route } from "tina4js";
import { cartPage } from "@/pages/cart";
import { isLoggedIn } from "@/store";

// Register the cart route.
route("/cart", {
	/*
        Only logged-in users can access the cart. 
        
        If the user is not logged in, return "/login" 
        so Tina4JS redirects them there.
    */
	guard: () => isLoggedIn.value || "/login",

	// Render cart page.
	handler: cartPage,
});
