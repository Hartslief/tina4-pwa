import { signal, html, api, navigate } from "tina4js";

import { setAuthUser } from "../store";

/* 
	Response returned by the login endpoint. 
	The token is used for authenticated API requests. 
*/
interface LoginResponse {
	token: string;
}

/* 
	User information returned by /auth/me. 
	The role is used to determine whether the user is an administrator. 
*/
interface CurrentUser {
	id: number;
	email: string;
	role: string;
}

export function loginPage() {
	// Store the values entered into the login form.
	const email = signal("", "login-email");
	const password = signal("", "login-password");

	// Store login errors and track whether login is in progress.
	const error = signal<string | null>(null, "login-error");
	const loading = signal(false, "login-loading");

	// Handles submission of the login form.
	const handleLogin = async (e: Event) => {
		// Prevent the browser from performing a normal form submission.
		e.preventDefault();

		loading.value = true;
		error.value = null;

		try {
			/* 
				Send the user's credentials to the backend. 
				The backend verifies the credentials and returns a JWT token. 
			*/
			const result = await api.post<LoginResponse>("/auth/login", {
				email: email.value,
				password: password.value,
			});

			/* 
				Store the token in localStorage. 

				Tina4JS can then use this token when making authenticated 
				API requests. 
			*/
			localStorage.setItem("tina4_token", result.token);

			/* 
				Retrieve the authenticated user's information. 
				
				This also allows the application to know whether the 
				logged-in user is a normal user or an administrator. 
			*/
			const currentUser = await api.get<CurrentUser>("/auth/me");

			// Store the authenticated user in the application state.
			setAuthUser(currentUser);

			// Login was successful, so return to the home page.
			navigate("/");
		} catch (err: any) {
			// console.error("Login failed:", err);

			// Display the error returned by the API.
			error.value = (err as Error).message;
		} finally {
			// Re-enable the login form after the request completes.
			loading.value = false;
		}
	};

	return html`
		<main class="auth-page">
			<section class="auth-card">
				<div class="auth-header">
					<h1>Welcome Back</h1>

					<p>Sign in to your account to continue shopping.</p>
				</div>

				<!-- Display an authentication error if one occurred. -->
				${() =>
					error.value
						? html` <div class="auth-error">${error.value}</div> `
						: null}

				<form class="auth-form" @submit=${handleLogin}>
					<div class="form-group">
						<label for="email"> Email Address </label>

						<input
							id="email"
							type="email"
							class="form-control"
							placeholder="you@example.com"
							autocomplete="email"
							.value=${email}
							@input=${(e: Event) => {
								// Keep the email signal synchronized with the input.
								email.value = (e.target as HTMLInputElement).value;
							}}
							?disabled=${loading}
							required
						/>
					</div>

					<div class="form-group">
						<label for="password"> Password </label>

						<input
							id="password"
							type="password"
							class="form-control"
							placeholder="Enter your password"
							autocomplete="current-password"
							.value=${password}
							@input=${(e: Event) => {
								// Keep the password signal synchronized with the input.
								password.value = (e.target as HTMLInputElement).value;
							}}
							?disabled=${loading}
							required
						/>
					</div>

					<button type="submit" class="auth-button" ?disabled=${loading}>
						${() => (loading.value ? "Logging in..." : "Login")}
					</button>
				</form>

				<div class="auth-footer">
					<span> Don't have an account? </span>

					<a href="/register"> Create an account </a>
				</div>
			</section>
		</main>
	`;
}
