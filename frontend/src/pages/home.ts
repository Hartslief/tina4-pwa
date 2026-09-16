import { signal, html } from "tina4js";
import { getProducts, type Product } from "@/services/product-api";

export function homePage() {
    const products = signal<Product[]>([]);

    async function loadProducts() {
        try {
            products.value = await getProducts();
            console.log("Products loaded:", products.value);
        } catch (error) {
            console.error("Failed to load products:", error);
        }
    }

    loadProducts();

    return html`
        <app-header title="Shop"></app-header>

        <main class="products-page">
            <h1>Products</h1>

            <div class="products-grid">
                ${() =>
                    products.value.map(
                        (product) => html`
                            <product-card
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
