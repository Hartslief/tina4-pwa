import { api } from "tina4js";

// Represents one item inside a shopping cart.
export interface CartItem {
	id: number;
	product_id: number;
	product_name: string;
	price: number;
	quantity: number;
	item_total: number;
}

// Represents the user's shopping cart.
export interface Cart {
	id?: number;
	status?: string;
	items: CartItem[];
	total: number;
}

// Represents the response returned when an item is successfully added to the cart.
export interface AddCartItemResponse {
	message: string;
	item: {
		id: number;
		cart_id: number;
		product_id: number;
		quantity: number;
	};
}

// Retrieve the current user's shopping cart.
export async function getCart(): Promise<Cart> {
	// Request the cart from the backend.
	return (await api.get("/cart")) as Cart;
}

/*
	Add a product to the current user's cart. 
	
	productId identifies the product. 
	quantity specifies how many should be added. 
	
	The quantity defaults to 1 when the caller does not 
	provide a value.
*/
export async function addToCart(
	productId: number,
	quantity: number = 1,
): Promise<AddCartItemResponse> {
	// Send the product ID and quantity to the backend.
	return (await api.post("/cart/items", {
		product_id: productId,
		quantity,
	})) as AddCartItemResponse;
}

/* 
	Remove an item from the current user's cart. 
	
	cartItemId identifies the specific cart item, 
	rather than the product itself.
*/
export async function removeFromCart(cartItemId: number): Promise<void> {
	// Send a DELETE request for the specified cart item.
	await api.delete(`/cart/items/${cartItemId}`);
}
