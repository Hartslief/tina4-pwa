import { html, signal, navigate } from "tina4js";

import { createProduct } from "@/services/admin-api";

export function adminProductNewPage() {
	/* 
		Page for creating a new product. 
		
		This page is intended for administrators and provides a form 
		for entering the information required to create a product. 
	*/

	// Signals store the current values entered into the form.
	const name = signal("");
	const description = signal("");
	const price = signal("");
	const inStock = signal(true);

	// Stores validation/API errors and controls the saving state.
	const error = signal<string | null>(null);
	const saving = signal(false);

	// Validates the form and sends the new product to the backend.
	async function saveProduct() {
		// Clear any previous error.
		error.value = null;

		// Product names are required.
		if (!name.value.trim()) {
			error.value = "Product name is required.";
			return;
		}

		// A price must be provided.
		if (!price.value.trim()) {
			error.value = "Product price is required.";
			return;
		}

		/* 
			Form input values are strings, so convert the price into 
			a number before sending it to the API. 
		*/
		const parsedPrice = Number(price.value);

		// Make sure the price is a valid non-negative number.
		if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
			error.value = "Product price must be a valid number.";
			return;
		}

		// Disable the form while the request is being processed.
		saving.value = true;

		try {
			// Send the new product to the admin API.
			await createProduct({
				name: name.value.trim(),
				description: description.value.trim(),
				price: parsedPrice,
				in_stock: inStock.value,
			});

			// Return to the admin dashboard after successful creation.
			navigate("/admin");
		} catch (err) {
			// console.error("Failed to create product:", err);

			error.value = (err as Error).message;
		} finally {
			// Re-enable the form once the request has finished.
			saving.value = false;
		}
	}

	return html`
		<div class="admin-page">
			<div class="admin-header">
				<div>
					<h1>Add Product</h1>

					<p>Add a new product to your store.</p>
				</div>
			</div>

			<form
				class="admin-form"
				@submit=${(event: SubmitEvent) => {
					// Stop the browser from submitting/reloading the page.
					event.preventDefault();

					// Run our custom save logic.
					saveProduct();
				}}
			>
				<div class="form-group">
					<label for="name"> Product Name </label>

					<input
						id="name"
						type="text"
						class="form-control"
						.value=${() => name.value}
						@input=${(event: Event) => {
							// Keep the signal synchronized with the input.
							name.value = (event.target as HTMLInputElement).value;
						}}
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
							description.value = (event.target as HTMLTextAreaElement).value;
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
							.checked=${() => inStock.value}
							@change=${(event: Event) => {
								// Store whether the checkbox is currently selected.
								inStock.value = (event.target as HTMLInputElement).checked;
							}}
							?disabled=${() => saving.value}
						/>

						In stock
					</label>
				</div>

				<!-- Display any validation or API errors. -->
				${() =>
					error.value
						? html` <div class="error-message">${error.value}</div> `
						: null}

				<div class="admin-form-actions">
					<button type="submit" ?disabled=${() => saving.value}>
						${() => (saving.value ? "Saving..." : "Save Product")}
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
		</div>
	`;
}
