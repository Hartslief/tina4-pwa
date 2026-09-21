import { api } from "tina4js";

// Represents a product available in the store.
export interface Product {
	id: number;
	name: string;
	description: string;
	price: number;
	in_stock: boolean;
}

// Represents the response returned by GET /api/products.
interface ProductsResponse {
	// The backend returns the products inside the records property.
	records: Product[];
}

// Retrieve the products available in the storefront.
export async function getProducts(): Promise<Product[]> {
	/* 
		Request the products from the public API.  
		
		The response is cast to ProductsResponse so 
		TypeScript knows that it contains a records array.
	*/
	const response = (await api.get("/products")) as ProductsResponse;

	// Return the product records to the page/component that called this function.
	return response.records;
}
