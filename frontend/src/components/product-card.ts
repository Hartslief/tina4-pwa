import { Tina4Element, html } from "tina4js";

class ProductCard extends Tina4Element {
    static props = {
        name: String,
        description: String,
        price: String,
        in_stock: String,
    };

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

            border: 1px solid #45475a;
            border-radius: 6px;

            background: #89b4fa;
            color: #1e1e2e;

            font: inherit;
            font-weight: 600;

            cursor: pointer;

            transition: background 0.15s;
        }

        button:hover:not(:disabled) {
            background: #74a5e8;
        }

        button:disabled {
            background: #45475a;
            color: #6c7086;
            cursor: not-allowed;
        }
    `;

    render() {
        return html`
            <article class="product-card">
                <div class="product-details">
                    <h2>${this.prop("name")}</h2>

                    <p class="description">${this.prop("description")}</p>
                </div>

                <div class="product-actions">
                    <p class="price">R${this.prop("price")}</p>

                    <p class="stock">
                        ${() =>
                            this.prop("in_stock").value === "true"
                                ? "In stock"
                                : html`
                                      <span class="out-of-stock">
                                          Out of stock
                                      </span>
                                  `}
                    </p>

                    <button
                        ?disabled=${() =>
                            this.prop("in_stock").value !== "true"}
                        @click=${() => this.addToCart()}
                    >
                        Add to Cart
                    </button>
                </div>
            </article>
        `;
    }

    addToCart() {
        this.dispatchEvent(
            new CustomEvent("add-to-cart", {
                bubbles: true,
                composed: true,
            }),
        );
    }
}

customElements.define("product-card", ProductCard);
