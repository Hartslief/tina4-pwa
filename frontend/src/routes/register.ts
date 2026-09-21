import { route } from "tina4js";
import { registerPage } from "@/pages/register";

/* 
    Register the accunt registration route. 
    
    This route is publicly accessible because a user
    must be able to reach it before they have an account.
*/
route("/register", registerPage);
