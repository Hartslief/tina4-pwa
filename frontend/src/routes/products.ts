import { route } from "tina4js";
import { productsPage } from "@/pages/products";

/* 
    Register the product catalogue route. 
    
    The product catalogue is publicly accessible, 
    so no authentication guard is required.
*/
route("/products", productsPage);
