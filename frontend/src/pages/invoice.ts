import { signal, html } from "tina4js";

import { getInvoice, type Invoice } from "@/services/invoice-api";

export function invoicePage(params: Record<string, string>) {
	// Stores the invoice returned by the backend.
	const invoice = signal<Invoice | null>(null);

	// Tracks whether the invoice is currently being loaded.
	const loading = signal(true);

	// Stores any error encountered while loading the invoice.
	const error = signal<string | null>(null);

	// Loads the invoice specified by the route parameter.
	async function loadInvoice() {
		loading.value = true;
		error.value = null;

		try {
			/* 
				Route parameters are strings, but the invoice API 
				expects a numeric ID. 
			*/
			const invoiceId = Number(params.id);

			// Make sure the route contains a valid integer ID.
			if (!Number.isInteger(invoiceId)) {
				throw new Error("Invalid invoice ID");
			}

			// Retrieve the invoice from the backend.
			invoice.value = await getInvoice(invoiceId);

			// console.log("Invoice loaded:", invoice.value);
		} catch (err) {
			// console.error("Failed to load invoice:", err);

			error.value = (err as Error).message;
		} finally {
			loading.value = false;
		}
	}

	// Load the invoice when the page is created.
	loadInvoice();

	return html`
		<main class="invoice-page">
			<div class="invoice-header">
				<div>
					<h1>Invoice</h1>

					<!-- Only show the invoice number once it has loaded. -->
					${() =>
						invoice.value ? html` <p>Invoice #${invoice.value.id}</p> ` : ""}
				</div>

				<a href="/products"> Continue Shopping </a>
			</div>

			<!-- Loading state. -->
			${() =>
				loading.value
					? html` <p class="invoice-status">Loading invoice...</p> `
					: ""}

			<!-- Error state with a way back to the products page. -->
			${() =>
				error.value
					? html`
							<p class="invoice-error">${error.value}</p>

							<a class="primary-button" href="/products"> Back to Products </a>
						`
					: null}

			<!-- Only render the invoice when loading has finished, no error occurred, and an invoice was successfully loaded. -->
			${() =>
				!loading.value && !error.value && invoice.value
					? html`
							<section class="invoice">
								<div class="invoice-details">
									<div>
										<span> Invoice Number </span>

										<strong> #${invoice.value.id} </strong>
									</div>

									<div>
										<span> Status </span>

										<strong> ${invoice.value.status} </strong>
									</div>
								</div>

								<!-- Table-like header for invoice items. -->
								<div class="invoice-items">
									<div class="invoice-item invoice-item-header">
										<span>Product</span>
										<span>Quantity</span>
										<span>Price</span>
										<span>Total</span>
									</div>

									<!-- Display each product included in the invoice. -->
									${() =>
										invoice.value!.items.map(
											(item) => html`
												<div class="invoice-item">
													<div>
														<strong> ${item.product_name} </strong>
													</div>

													<div>${item.quantity}</div>

													<div>R${item.price.toFixed(2)}</div>

													<div>R${(item.price * item.quantity).toFixed(2)}</div>
												</div>
											`,
										)}
								</div>

								<!-- Display the total invoice amount. -->
								<div class="invoice-total">
									<span>Total</span>

									<strong> R${invoice.value.total.toFixed(2)} </strong>
								</div>

								<div class="invoice-footer">
									<p>Thank you for your order!</p>

									<a class="primary-button" href="/products">
										Continue Shopping
									</a>
								</div>
							</section>
						`
					: ""}
		</main>
	`;
}
