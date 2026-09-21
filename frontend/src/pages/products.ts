import { signal, html } from "tina4js";
import { getProducts, type Product } from "@/services/product-api";
import { addToCart } from "@/services/cart-api";

export function productsPage() {
	// Stores the products returned by the backend.
	const products = signal<Product[]>([]);

	// Displays a success message when a product is added to the cart.
	const message = signal("");

	// Stores errors encountered while loading products or adding to the cart.
	const error = signal<string | null>(null);

	// Loads the product catalogue from the public products API.
	async function loadProducts() {
		try {
			// The API currently returns the list of products.
			products.value = await getProducts();

			// console.log("Products loaded:", products.value);
		} catch (err) {
			// console.error("Failed to load products:", err);

			error.value = (err as Error).message;
		}
	}

	// Handles the custom "add-to-cart" event emitted by a product card.
	async function handleAddToCart(event: Event) {
		/* 
			The product card sends the product ID inside the CustomEvent's 
			detail property, so cast the generic Event to the expected type. 
		*/
		const customEvent = event as CustomEvent<{
			productId: number;
		}>;

		const productId = customEvent.detail.productId;

		// Clear any previous success or error message.
		message.value = "";
		error.value = null;

		try {
			// Add one unit of the selected product to the cart.
			await addToCart(productId, 1);

			message.value = "Product added to cart.";

			// console.log("Added product to cart:", productId);
		} catch (err) {
			// console.error("Failed to add product to cart:", err);

			error.value = (err as Error).message;
		}
	}

	// Load products when the page is created.
	loadProducts();

	return html`
		<!-- Listen for add-to-cart events from any product-card inside this page. -->
		<main class="products-page" @add-to-cart=${handleAddToCart}>
			<h1>Products</h1>

			<!-- Display a successful add-to-cart message. -->
			${() =>
				message.value
					? html` <p class="cart-message">${message.value}</p> `
					: ""}

			<!-- Display any product/cart error. -->
			${() =>
				error.value ? html` <p class="cart-error">${error.value}</p> ` : null}

			<div class="products-grid">
				<!-- Create a product-card component for every product returned by the API. -->
				${() =>
					products.value.map(
						(product) => html`
							<product-card
								id=${String(product.id)}
								name=${product.name}
								description=${product.description}
								price=${product.price.toFixed(2)}
								in_stock=${String(product.in_stock)}
							></product-card>
						`,
					)}
			</div>
		</main>
	`;
}
