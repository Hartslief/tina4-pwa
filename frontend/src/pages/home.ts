import { html } from "tina4js";

export function homePage() {
	/* 
		Home page for the ecommerce application. 
		
		This page provides a simple introduction to the store and 
		directs users to the product catalogue. 
	*/
	return html`
		<main class="home-page">
			<!-- Main introductory section of the store. -->
			<section class="hero">
				<div class="hero-content">
					<h1>Discover Something Awesome</h1>

					<p>A modern ecommerce demo built with Tina4 Python and Tina4JS.</p>

					<!-- Main call-to-action for browsing products. -->
					<div class="hero-actions">
						<a class="primary-button" href="/products"> Browse Products </a>
					</div>
				</div>
			</section>

			<!-- Highlight some of the store's features. -->
			<section class="features-section">
				<div class="feature-card">
					<div class="feature-icon">🚚</div>
					<h3>Fast Delivery</h3>
					<p>Get your products quickly and reliably.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">🔒</div>
					<h3>Secure Checkout</h3>
					<p>Safe payments and secure accounts.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">⭐</div>
					<h3>Quality Products</h3>
					<p>Curated products for every customer.</p>
				</div>
			</section>
		</main>
	`;
}
