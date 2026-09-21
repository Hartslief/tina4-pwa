import { api } from "tina4js";

// Represents a product returned by the admin API.
export interface AdminProduct {
	id: number;
	name: string;
	description: string;
	price: number;
	in_stock: boolean;
}

// Represents a user returned by the admin API.
export interface AdminUser {
	id: number;
	email: string;
	role: string;
	created_at: string;
}

// Represents the structure returned by the GET /api/admin/products endpoint.
interface ProductsResponse {
	// The backend returns products inside the records property.
	records: AdminProduct[];
}

// Represents the structure returned by the GET /api/admin/users endpoint.
interface UsersResponse {
	// The backend returns users inside the records property.
	records: AdminUser[];
}

/* 
	Use a dedicated admin product endpoint instead of 
	reusing the public storefront product endpoint. 
	
	This keeps the public API separate from admin-only 
	operations and allows the admin response to gain 
	additional fields or filtering in the future without 
	changing the public product API. 
*/
export async function getAdminProducts(): Promise<AdminProduct[]> {
	/* 
		Request all products from the admin endpoint. 
		
		The response is cast to ProductsResponse because 
		the API client does not automatically know the 
		structure of the response.
	*/
	const response = (await api.get("/admin/products")) as ProductsResponse;

	// Return only the records array to the caller.
	return response.records;
}

/* 
	Create a new product using the admin API. 
	
	The data parameter contains the information 
	required to create the product.
*/
export async function createProduct(data: {
	name: string;
	description: string;
	price: number;
	in_stock: boolean;
}): Promise<AdminProduct> {
	// Send the product data to the backend.
	// The returned response is treated as an AdminProduct.
	return (await api.post("/admin/products", data)) as AdminProduct;
}

/* 
	Update an existing product. 
	
	id identifies which product should be updated. 
	The properties in data are optional so the backend 
	can support partial updates.
*/
export async function updateProduct(
	id: number,
	data: {
		name?: string;
		description?: string;
		price?: number;
		in_stock?: boolean;
	},
): Promise<AdminProduct> {
	// Send the updated product information to the endpoint containing the product ID.
	return (await api.put(`/admin/products/${id}`, data)) as AdminProduct;
}

/* 
	Delete an existing product. 
	
	Only the product ID is required.
*/
export async function deleteProduct(id: number): Promise<void> {
	// Send a DELETE request to the admin product endpoint.
	await api.delete(`/admin/products/${id}`);
}

// Retrieve all users for the admin dashboard.
export async function getAdminUsers(): Promise<AdminUser[]> {
	// Request users from the admin endpoint.
	const response = (await api.get("/admin/users")) as UsersResponse;

	// Return the records array from the API response.
	return response.records;
}

/* 
	Update an existing user. 
	
	The ID identifies which user should be updated. 
	
	Email and role are optional because this endpoint
	supports partial updates.
*/
export async function updateUser(
	id: number,
	data: {
		email?: string;
		role?: string;
	},
): Promise<AdminUser> {
	// Send the updated user information to the backend.
	return (await api.put(`/admin/users/${id}`, data)) as AdminUser;
}

// Delete an existing user.
export async function deleteUser(id: number): Promise<void> {
	// Send a DELETE request using the user's ID.
	await api.delete(`/admin/users/${id}`);
}
