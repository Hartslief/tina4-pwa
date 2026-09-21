import { html, navigate, signal } from "tina4js";

import {
	getAdminProducts,
	getAdminUsers,
	deleteProduct,
	deleteUser,
	type AdminProduct,
	type AdminUser,
} from "@/services/admin-api";

import { isAdmin } from "@/store";

export function adminPage() {
	/* 
		Dedicated administrator dashboard. 
		
		The dashboard displays two separate lists: 
			- Products that administrators can manage 
			- Users that administrators can manage 
	*/

	// Store the products and users displayed in the dashboard.
	const products = signal<AdminProduct[]>([]);
	const users = signal<AdminUser[]>([]);

	// Track whether the initial dashboard data is loading.
	const loading = signal(true);

	// Store an error that occurs while loading or modifying data.
	const error = signal<string | null>(null);

	// Loads all data required by the admin dashboard.
	async function loadData() {
		loading.value = true;
		error.value = null;

		try {
			/* 
				Load products and users at the same time instead of waiting 
				for one request to finish before starting the other. \
			*/
			const [loadedProducts, loadedUsers] = await Promise.all([
				getAdminProducts(),
				getAdminUsers(),
			]);

			// Store the results so the UI can render them.
			products.value = loadedProducts;
			users.value = loadedUsers;
		} catch (err) {
			// console.error("Failed to load admin data:", err);

			error.value = (err as Error).message;
		} finally {
			loading.value = false;
		}
	}

	// Deletes a product after asking the administrator for confirmation.
	async function removeProduct(product: AdminProduct) {
		const confirmed = confirm(`Delete "${product.name}"?`);

		// Stop if the administrator cancelled the confirmation.
		if (!confirmed) {
			return;
		}

		try {
			// Delete the product through the admin API.
			await deleteProduct(product.id);

			/* 
				Remove the product from the local signal as well. 
				This updates the UI immediately without requiring another 
				request to reload the entire product list. 
			*/
			products.value = products.value.filter((item) => item.id !== product.id);
		} catch (err) {
			// console.error("Failed to delete product:", err);

			error.value = (err as Error).message;
		}
	}

	// Deletes a user after asking the administrator for confirmation.
	async function removeUser(user: AdminUser) {
		const confirmed = confirm(`Delete user "${user.email}"?`);

		if (!confirmed) {
			return;
		}

		try {
			// Delete the user through the admin API.
			await deleteUser(user.id);

			// Remove the deleted user from the displayed list.
			users.value = users.value.filter((item) => item.id !== user.id);
		} catch (err) {
			// console.error("Failed to delete user:", err);

			error.value = (err as Error).message;
		}
	}

	// Load the dashboard data when the page is created.
	loadData();

	return html`
		<div class="admin-page">
			<div class="admin-header">
				<div>
					<h1>Admin Dashboard</h1>

					<p>Manage products and users.</p>
				</div>
			</div>

			<!-- 
				The frontend checks the current user's role and displays 
				a permission message if they are not an administrator. 
				The backend still provides the actual security boundary. 
			-->
			${() =>
				!isAdmin.value
					? html`
							<div class="error-message">
								You do not have permission to access this page.
							</div>
						`
					: ""}

			<!-- Display a loading message while dashboard data is loading. -->
			${() => (loading.value ? html` <p>Loading dashboard...</p> ` : "")}

			<!-- Display any error returned while loading or modifying data. -->
			${() =>
				error.value
					? html` <div class="error-message">${error.value}</div> `
					: null}

			<!-- Only render the management tables once loading has finished and the current user is an administrator. -->
			${() =>
				!loading.value && isAdmin.value
					? html`
							<!-- PRODUCTS -->

							<section class="admin-section">
								<div class="admin-section-header">
									<div>
										<h2>Products</h2>

										<p>Manage your store products.</p>
									</div>

									<!-- Navigate to the create-product page. -->
									<button @click=${() => navigate("/admin/products/new")}>
										+ Add Product
									</button>
								</div>

								<div class="admin-table-wrapper">
									<table class="admin-table">
										<thead>
											<tr>
												<th>Name</th>

												<th>Price</th>

												<th>Stock</th>

												<th>Actions</th>
											</tr>
										</thead>

										<tbody>
											<!-- Create one table row for every product. -->
											${() =>
												products.value.map(
													(product) => html`
														<tr>
															<td>${product.name}</td>

															<td>R${product.price.toFixed(2)}</td>

															<td>
																${product.in_stock
																	? "In stock"
																	: "Out of stock"}
															</td>

															<td>
																<!-- Navigate to the edit page using the product's ID in the URL. -->
																<button
																	@click=${() =>
																		navigate(
																			`/admin/products/${product.id}/edit`,
																		)}
																>
																	Edit
																</button>

																<!-- Ask for confirmation and delete the product if confirmed. -->
																<button @click=${() => removeProduct(product)}>
																	Delete
																</button>
															</td>
														</tr>
													`,
												)}
										</tbody>
									</table>
								</div>
							</section>

							<!-- USERS -->

							<section class="admin-section">
								<div class="admin-section-header">
									<div>
										<h2>Users</h2>

										<p>Manage registered users.</p>
									</div>
								</div>

								<div class="admin-table-wrapper">
									<table class="admin-table">
										<thead>
											<tr>
												<th>Email</th>

												<th>Role</th>

												<th>Created</th>

												<th>Actions</th>
											</tr>
										</thead>

										<tbody>
											<!-- Create one table row for every user. -->
											${() =>
												users.value.map(
													(user) => html`
														<tr>
															<td>${user.email}</td>

															<td>${user.role}</td>

															<td>${user.created_at}</td>

															<td>
																<!-- Navigate to the user edit page. -->
																<button
																	@click=${() =>
																		navigate(`/admin/users/${user.id}/edit`)}
																>
																	Edit
																</button>

																<!-- Delete the selected user. -->
																<button @click=${() => removeUser(user)}>
																	Delete
																</button>
															</td>
														</tr>
													`,
												)}
										</tbody>
									</table>
								</div>
							</section>
						`
					: ""}
		</div>
	`;
}
