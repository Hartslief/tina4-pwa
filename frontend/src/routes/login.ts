import { route } from "tina4js";
import { loginPage } from "@/pages/login";

/* 
    Register the login route. 
    
    This page is publicly accessible because 
    there is no authentication guard.
*/
route("/login", loginPage);
