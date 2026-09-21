import { html, signal, navigate } from "tina4js";

import {
	getAdminUsers,
	updateUser,
	type AdminUser,
} from "@/services/admin-api";

export function adminUserEditPage(userId: string) {
	/* 
		Page for editing an existing user's account information. 
		
		This page is intended for administrators. 
		Administrators can currently change: 
			- Email address 
			- User role 
	*/

	// Stores the selected user once it has been loaded.
	const user = signal<AdminUser | null>(null);

	// Form values are stored separately so they can be edited.
	const email = signal("");
	const userRole = signal("user");

	// Controls loading, saving, and error states.
	const loading = signal(true);
	const saving = signal(false);
	const error = signal<string | null>(null);

	// Loads the selected user from the admin API.
	async function loadUser() {
		loading.value = true;
		error.value = null;

		try {
			// Retrieve the available users from the admin API.
			const users = await getAdminUsers();

			/* 
				The route parameter is a string, while user IDs are numbers, 
				so convert userId before comparing it with the user's ID. 
			*/
			const found = users.find((item) => item.id === Number(userId));

			// Display an error if the requested user does not exist.
			if (!found) {
				error.value = "User not found.";
				return;
			}

			// Store the user and populate the form with their current values.
			user.value = found;
			email.value = found.email;
			userRole.value = found.role;
		} catch (err) {
			// console.error("Failed to load user:", err);

			error.value = (err as Error).message;
		} finally {
			loading.value = false;
		}
	}

	// Validates and saves changes to the user.
	async function saveUser() {
		error.value = null;

		// An email address is required.
		if (!email.value.trim()) {
			error.value = "Email is required.";
			return;
		}

		// Disable the form while saving.
		saving.value = true;

		try {
			// Send the updated user information to the backend.
			await updateUser(Number(userId), {
				email: email.value.trim(),
				role: userRole.value,
			});

			// Return to the admin dashboard after a successful update.
			navigate("/admin");
		} catch (err) {
			// console.error("Failed to update user:", err);

			error.value = (err as Error).message;
		} finally {
			// Re-enable the form after the request completes.
			saving.value = false;
		}
	}

	// Load the user as soon as the page is created.
	loadUser();

	return html`
		<div class="admin-page">
			<div class="admin-header">
				<div>
					<h1>Edit User</h1>

					<p>Update the user's account information.</p>
				</div>
			</div>

			<!-- Show a loading message while the user is being retrieved. -->
			${() => (loading.value ? html` <p>Loading user...</p> ` : "")}

			<!-- If the user could not be found, display the error and provide a way back to the dashboard. -->
			${() =>
				error.value && !user.value
					? html`
							<div class="error-message">${error.value}</div>

							<button @click=${() => navigate("/admin")}>
								Back to Dashboard
							</button>
						`
					: null}

			<!-- Only display the form once the user has loaded successfully. -->
			${() =>
				!loading.value && user.value
					? html`
							<form
								class="admin-form"
								@submit=${(event: SubmitEvent) => {
									event.preventDefault();
									saveUser();
								}}
							>
								<div class="form-group">
									<label for="email"> Email </label>

									<input
										id="email"
										type="email"
										class="form-control"
										.value=${() => email.value}
										@input=${(event: Event) => {
											email.value = (event.target as HTMLInputElement).value;
										}}
										?disabled=${() => saving.value}
										required
									/>
								</div>

								<div class="form-group">
									<label for="role"> Role </label>

									<select
										id="role"
										class="form-control"
										.value=${() => userRole.value}
										@change=${(event: Event) => {
											userRole.value = (
												event.target as HTMLSelectElement
											).value;
										}}
										?disabled=${() => saving.value}
									>
										<option value="user">User</option>

										<option value="admin">Admin</option>
									</select>
								</div>

								<!-- Display validation/API errors while editing. -->
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
