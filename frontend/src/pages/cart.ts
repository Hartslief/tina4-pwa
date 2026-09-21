import { signal, html, navigate } from "tina4js";
import { getCart, removeFromCart, type CartItem } from "@/services/cart-api";
import { checkout } from "@/services/checkout-api";

export function cartPage() {
	// Stores the items currently in the user's cart.
	const items = signal<CartItem[]>([]);

	// Stores the total price of all items in the cart.
	const total = signal(0);

	// Tracks whether the cart is currently being loaded.
	const loading = signal(true);

	// Stores any error encountered while loading or modifying the cart.
	const error = signal<string | null>(null);

	// Prevents multiple checkout requests from being submitted at once.
	const checkingOut = signal(false);

	// Loads the current user's cart from the backend.
	async function loadCart() {
		loading.value = true;
		error.value = null;

		try {
			// Returns the user's cart with their CartItem's
			const cart = await getCart();

			// Update the UI with the latest cart information.
			items.value = cart.items;
			total.value = cart.total;

			// console.log("Cart loaded:", cart);
		} catch (err) {
			// console.error("Failed to load cart:", err);

			error.value = (err as Error).message;
		} finally {
			loading.value = false;
		}
	}

	// Removes a specific item from the cart.
	async function removeItem(itemId: number) {
		try {
			// Tell the backend to remove the item.
			await removeFromCart(itemId);
			// console.log(itemId);

			/* 
				Reload the cart after deletion so the displayed items 
				and total are guaranteed to match the backend. 
			*/
			await loadCart();
		} catch (err) {
			// console.error("Failed to remove cart item:", err);

			error.value = (err as Error).message;
		}
	}

	// Handles the checkout process.
	async function handleCheckout() {
		checkingOut.value = true;
		error.value = null;

		try {
			/* 
				The backend creates an invoice from the current cart 
				and returns information about the newly created invoice.
			*/
			const result = await checkout();

			// console.log("Checkout successful:", result);

			// Navigate to the invoice created by the checkout.
			navigate(`/invoice/${result.invoice.id}`);
		} catch (err) {
			// console.error("Checkout failed:", err);
			error.value = (err as Error).message;
		} finally {
			// Allow checkout to be attempted again if necessary.
			checkingOut.value = false;
		}
	}

	// Load the cart when the page is created.
	loadCart();

	return html`
		<main class="cart-page">
			<div class="cart-header">
				<h1>Your Cart</h1>

				<a href="/products"> Continue Shopping </a>
			</div>

			<!-- Show a loading message while the cart is being retrieved. -->
			${() =>
				loading.value ? html` <p class="cart-status">Loading cart...</p> ` : ""}

			<!-- Display any cart-related error. -->
			${() =>
				error.value ? html` <p class="cart-error">${error.value}</p> ` : null}

			<!-- If loading has finished and there are no items, show an empty-cart message. -->
			${() =>
				!loading.value && !error.value && items.value.length === 0
					? html`
							<section class="empty-cart">
								<h2>Your cart is empty</h2>

								<p>You haven't added any products yet.</p>

								<a class="primary-button" href="/products"> Browse Products </a>
							</section>
						`
					: ""}
			<!-- Only display the cart contents when loading has finished and the cart contains at least one item. -->
			${() =>
				!loading.value && items.value.length > 0
					? html`
							<section class="cart-content">
								<div class="cart-items">
									${() =>
										items.value.map(
											(item) => html`
												<article class="cart-item">
													<div class="cart-item-details">
														<h2>${item.product_name}</h2>

														<p>R${item.price.toFixed(2)} each</p>
													</div>

													<div class="cart-item-quantity">
														<span> Quantity: </span>

														<strong> ${item.quantity} </strong>
													</div>

													<div class="cart-item-total">
														<strong> R${item.item_total.toFixed(2)} </strong>

														<button
															type="button"
															@click=${() => removeItem(item.id)}
														>
															Remove
														</button>
													</div>
												</article>
											`,
										)}
								</div>

								<aside class="cart-summary">
									<h2>Order Summary</h2>

									<div class="cart-summary-row">
										<span> Items </span>

										<!-- Calculate the total number of products. -->
										<span>
											${() =>
												items.value.reduce(
													(count, item) => count + item.quantity,
													0,
												)}
										</span>
									</div>

									<div class="cart-summary-total">
										<span> Total </span>

										<strong> R${() => total.value.toFixed(2)} </strong>
									</div>

									<!-- Disable checkout while a checkout request is already being processed. -->
									<button
										class="checkout-button"
										type="button"
										?disabled=${() => checkingOut.value}
										@click=${handleCheckout}
									>
										${() =>
											checkingOut.value
												? "Processing..."
												: "Proceed to Checkout"}
									</button>
								</aside>
							</section>
						`
					: ""}
		</main>
	`;
}
