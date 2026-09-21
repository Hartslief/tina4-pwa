import { signal, html, navigate } from "tina4js";
import { register } from "@/services/auth-api";

export function registerPage() {
	// Store the values entered into the registration form.
	const email = signal("");
	const password = signal("");
	const confirmPassword = signal("");

	// Store validation/API errors and the current loading state.
	const error = signal<string | null>(null);
	const loading = signal(false);

	// Handles submission of the registration form.
	async function submit(e: Event) {
		// Prevent the browser from performing a normal form submission.
		e.preventDefault();

		// Clear any error from a previous submission.
		error.value = null;

		// Make sure the required fields have been entered.
		if (!email.value || !password.value) {
			error.value = "Please enter your email and password.";
			return;
		}

		// Make sure both password fields contain the same value.
		if (password.value !== confirmPassword.value) {
			error.value = "Passwords do not match.";
			return;
		}

		// Disable the form while registration is in progress.
		loading.value = true;

		try {
			/* 
				Send the new user's credentials to the backend. 
				The backend is responsible for creating the user account. 
			*/
			await register(email.value, password.value);

			/* 
				Registration does not automatically log the user in, 
				so send them to the login page after successful registration. 
			*/
			navigate("/login");
		} catch (err) {
			// console.error("Registration failed:", err);

			error.value = (err as Error).message;
		} finally {
			// Re-enable the form after registration completes.
			loading.value = false;
		}
	}

	return html`
		<main class="auth-page">
			<div class="auth-card">
				<div class="auth-header">
					<h1>Create Account</h1>

					<p>Create an account to start shopping.</p>
				</div>

				<form @submit=${submit}>
					<label for="email"> Email </label>

					<input
						id="email"
						type="email"
						placeholder="you@example.com"
						required
						.value=${() => email.value}
						@input=${(event: Event) => {
							// Update the email signal as the user types.
							email.value = (event.target as HTMLInputElement).value;
						}}
					/>

					<label for="password"> Password </label>

					<input
						id="password"
						type="password"
						placeholder="Create a password"
						required
						.value=${() => password.value}
						@input=${(event: Event) => {
							// Update the password signal as the user types.
							password.value = (event.target as HTMLInputElement).value;
						}}
					/>

					<label for="confirm-password"> Confirm Password </label>

					<input
						id="confirm-password"
						type="password"
						placeholder="Confirm your password"
						required
						.value=${() => confirmPassword.value}
						@input=${(event: Event) => {
							// Update the confirmation signal as the user types.
							confirmPassword.value = (event.target as HTMLInputElement).value;
						}}
					/>

					<!-- Display validation or registration errors. -->
					${() =>
						error.value
							? html` <p class="auth-error">${error.value}</p> `
							: null}

					<button type="submit" ?disabled=${() => loading.value}>
						${() => (loading.value ? "Creating account..." : "Create Account")}
					</button>
				</form>

				<div class="auth-switch">
					<span> Already have an account? </span>

					<a href="/login"> Login </a>
				</div>
			</div>
		</main>
	`;
}
