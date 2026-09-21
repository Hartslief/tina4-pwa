import { html, signal, navigate } from "tina4js";

import {
	getAdminProducts,
	updateProduct,
	type AdminProduct,
} from "@/services/admin-api";

export function adminProductEditPage(productId: string) {
	/*
		Page for editing an existing product. 

		This page is only intended to be accessible to administrators. 
		The product ID comes from the route and is used to find the 
		product that the administrator wants to edit. 
		
		Administrators can change: 
			- Product name 
			- Description 
			- Price 
			- Stock status 
	*/

	//	Stores the currently selected product once it has been loaded.
	// null means that the product has not been loaded or was not found.
	const product = signal<AdminProduct | null>(null);

	// Signals store the current values displayed in the form.
	const name = signal("");
	const description = signal("");
	const price = signal("");
	const inStock = signal(true);

	// Controls the loading and saving states of the page.
	const loading = signal(true);
	const saving = signal(false);

	// Stores an error message that can be displayed to the administrator.
	const error = signal<string | null>(null);

	// Loads selected product
	async function loadProduct() {
		loading.value = true;
		error.value = null;

		try {
			/* 
				The admin API currently returns the list of products. 
				We search that list for the product whose ID matches 
				the ID received from the route. 
			*/
			const products = await getAdminProducts();

			const found = products.find((item) => item.id === Number(productId));

			// If no product has that ID, show an appropriate error.
			if (!found) {
				error.value = "Product not found.";
				return;
			}

			/* 
				Store the product itself as well as copying its values 
				into the form signals. 
				
				The signals are what the form inputs are bound to, 
				allowing the administrator to modify the values. 
			*/
			product.value = found;
			name.value = found.name;
			description.value = found.description;
			price.value = String(found.price);
			inStock.value = found.in_stock;
		} catch (err) {
			// Log the technical error for debugging.
			// console.error("Failed to load product:", err);`

			// Display the error to the user.
			error.value = (err as Error).message;
		} finally {
			// Loading is finished regardless of whether the request succeeded.
			loading.value = false;
		}
	}

	// Validates and saves the changes made to the product.
	async function saveProduct() {
		// Clear any previous error before starting validation.
		error.value = null;

		// Prevent saving a product without a name.
		if (!name.value.trim()) {
			error.value = "Product name is required.";
			return;
		}

		/* 
			The price is stored as a string while the user is typing, 
			so it needs to be converted to a number before being sent
			to the backend. 
		*/
		const parsedPrice = Number(price.value);

		// Prevent invalid or negative prices from being submitted.
		if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
			error.value = "Product price must be a valid number.";
			return;
		}

		// Disable the form while the update request is in progress.
		saving.value = true;

		try {
			/* 
				Send the updated product data to the backend. 
				Number(productId) converts the route parameter from a 
				string into the numeric ID expected by the API. 
			*/
			await updateProduct(Number(productId), {
				name: name.value.trim(),
				description: description.value.trim(),
				price: parsedPrice,
				in_stock: inStock.value,
			});

			// Return to the admin dashboard after a successful update.
			navigate("/admin");
		} catch (err) {
			// console.error("Failed to update product:", err);
			error.value = (err as Error).message;
		} finally {
			// Re-enable the form after the request has completed.
			saving.value = false;
		}
	}

	// Start loading the product as soon as the page is created.
	loadProduct();

	return html`
		<div class="admin-page">
			<div class="admin-header">
				<div>
					<h1>Edit Product</h1>

					<p>Update your product information.</p>
				</div>
			</div>

			<!-- Display a loading message while the product is being fetched. -->
			${() => (loading.value ? html` <p>Loading product...</p> ` : "")}

			<!-- If the product could not be loaded, display the error and provide a way back to the admin dashboard. -->
			${() =>
				error.value && !product.value
					? html`
							<div class="error-message">${error.value}</div>

							<button @click=${() => navigate("/admin")}>
								Back to Dashboard
							</button>
						`
					: null}

			<!-- Only display the form once loading has finished and a valid product has been found. -->
			${() =>
				!loading.value && product.value
					? html`
							<form
								class="admin-form"
								@submit=${(event: SubmitEvent) => {
									// Prevent the browser from performing a normal
									// page reload when the form is submitted.
									event.preventDefault();

									// Run our own validation and save logic.
									saveProduct();
								}}
							>
								<div class="form-group">
									<label for="name"> Product Name </label>

									<input
										id="name"
										type="text"
										class="form-control"

										<!-- Keep the input synchronized with the name signal. -->
										.value=${() => name.value}

										<!-- Update the signal whenever the user types. -->
										@input=${(event: Event) => {
											name.value = (event.target as HTMLInputElement).value;
										}}

										<!-- Prevent editing while the product is being saved. -->
										?disabled=${() => saving.value}
										required
									/>
								</div>

								<div class="form-group">
									<label for="description"> Description </label>

									<textarea
										id="description"
										class="form-control"
										rows="5"
										.value=${() => description.value}
										@input=${(event: Event) => {
											description.value = (
												event.target as HTMLTextAreaElement
											).value;
										}}
										?disabled=${() => saving.value}
									></textarea>
								</div>

								<div class="form-group">
									<label for="price"> Price </label>

									<input
										id="price"
										type="number"
										step="0.01"
										min="0"
										class="form-control"
										.value=${() => price.value}
										@input=${(event: Event) => {
											price.value = (event.target as HTMLInputElement).value;
										}}
										?disabled=${() => saving.value}
										required
									/>
								</div>

								<div class="form-group">
									<label>
										<input
											type="checkbox"

											<!-- Reflect the current stock status in the checkbox. -->
											.checked=${() => inStock.value}

											<!-- Update the signal when the checkbox changes. -->
											@change=${(event: Event) => {
												inStock.value = (
													event.target as HTMLInputElement
												).checked;
											}}
											?disabled=${() => saving.value}
										/>

										In stock
									</label>
								</div>
								
								<!-- Display validation or API errors while editing. -->
								${() =>
									error.value
										? html` <div class="error-message">${error.value}</div> `
										: null}

								<div class="admin-form-actions">
									<button type="submit" ?disabled=${() => saving.value}>
										${() => (saving.value ? "Saving..." : "Save Changes")}
									</button>

									<button
										type="button"
										@click=${() => navigate("/admin")}
										?disabled=${() => saving.value}
									>
										Cancel
									</button>
								</div>
							</form>
						`
					: ""}
		</div>
	`;
}
