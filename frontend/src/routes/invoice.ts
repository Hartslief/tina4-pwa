import { route } from "tina4js";
import { invoicePage } from "@/pages/invoice";
import { isLoggedIn } from "@/store";

/*
    Register the invoice route. 
    
    {id} is a dynamic route parameter. 
    Example:
    /invoice/15
*/
route("/invoice/{id}", {
	/* 
        Only logged-in users can view invoices.
        
        If the user is not logged in, redirect 
        them to the login page.
    */
	guard: () => isLoggedIn.value || "/login",

	/*
        Render invoice page.

        The page receives the route parameters so it 
        can determine which invoice to retrieve.
    */
	handler: invoicePage,
});
