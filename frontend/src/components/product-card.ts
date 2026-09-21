import { Tina4Element, html } from "tina4js";

class ProductCard extends Tina4Element {
	/* 
        Product card component. 
        
        This component displays a single product and allows 
        the user to add it to their cart.
    */

	/* 
        Define the properties that can be passed into the custom element. 
        Tina4JS exposes these properties through this.prop().
    */
	static props = {
		id: String,
		name: String,
		description: String,
		price: String,
		in_stock: String,
	};

	// CSS styles scoped to this component.
	static styles = `
        :host {
            display: block;
        }

        .product-card {
            height: 400px;
            padding: 1.5rem;

            background: #313244;
            border: 1px solid #45475a;
            border-radius: 10px;

            display: flex;
            flex-direction: column;
        }

        .product-details {
            flex: 1;
            min-height: 0;
        }

        .product-card h2 {
            margin-bottom: 0.75rem;

            color: #cdd6f4;
            font-size: 1.4rem;
            font-weight: 700;
        }

        .description {
            color: #a6adc8;
            font-size: 0.95rem;

            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 5;
            overflow: hidden;
        }

        .product-actions {
            flex-shrink: 0;
            margin-top: 1rem;
        }

        .price {
            margin-bottom: 0.5rem;

            color: #a6e3a1;
            font-size: 1.4rem;
            font-weight: 700;
        }

        .stock {
            margin-bottom: 1rem;

            color: #a6e3a1;
            font-size: 0.875rem;
        }

        .out-of-stock {
            color: #f38ba8;
        }

        button {
            width: 100%;
            padding: 0.75rem 1rem;

            border: none;
            border-radius: 6px;

            background: #89b4fa;
            color: #1e1e2e;

            font: inherit;
            font-weight: 600;

            cursor: pointer;
        }

        button:hover:not(:disabled) {
            background: #74a5e8;
        }

        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    `;

	render() {
		return html`
			<article class="product-card">
				<!-- Product information section -->
				<div class="product-details">
					<!-- Display the product name. -->
					<h2>${this.prop("name")}</h2>

					<!-- Display the product description. -->
					<p class="description">${this.prop("description")}</p>
				</div>

				<!-- Product price, stock status, and cart button. -->
				<div class="product-actions">
					<!-- Display the product price. -->
					<p class="price">R${this.prop("price")}</p>

					<!-- Display the current stock status. -->
					<p class="stock">
						${() =>
							this.prop("in_stock").value === "true"
								? "In stock"
								: html` <span class="out-of-stock"> Out of stock </span> `}
					</p>

					<!-- Disable the button when the product is out of stock. -->
					<button
						?disabled=${() => this.prop("in_stock").value !== "true"}

                        // Dispatch a custom event when the user clicks Add to Cart.
						@click=${() => this.addToCart()}
					>
						Add to Cart
					</button>
				</div>
			</article>
		`;
	}

	// Notify the parent component/page that the user wants to add this product to the cart.
	addToCart() {
		// Create a custom "add-to-cart" browser event.
		this.dispatchEvent(
			new CustomEvent("add-to-cart", {
				// Allow parent elements to listen for the event.
				bubbles: true,

				// Allow the event to cross the Shadow DOM boundary.
				composed: true,

				// Include the product ID in the event.
				detail: {
					productId: Number(this.prop("id").value),
				},
			}),
		);
	}
}

customElements.define("product-card", ProductCard);
