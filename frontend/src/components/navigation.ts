import { Tina4Element, html, navigate } from "tina4js";

import { isLoggedIn, isAdmin, user, clearAuth } from "@/store";

class Navigation extends Tina4Element {
	/* 
        Navigation bar component. 
        
        This component is displayed across the application and 
        changes its available links depending on the user's 
        authentication and admin status.
    */

	// CSS styles that are scoped to this custom element.
	static styles = `
        :host {
            display: block;
            width: 100%;
        }

        nav {
            display: flex;
            align-items: center;
            gap: 1.5rem;

            padding: 1rem 2rem;

            background: #313244;
            border-bottom: 1px solid #45475a;
        }

        .brand {
            margin-right: auto;

            color: #cdd6f4;
            font-size: 1.25rem;
            font-weight: 700;
        }

        a {
            color: #89b4fa;
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        .user-email {
            color: #a6adc8;
            font-size: 0.9rem;
        }

        .logout-button {
            padding: 0.4rem 0.75rem;

            background: transparent;
            border: 1px solid #45475a;
            border-radius: 5px;

            color: #f38ba8;

            font: inherit;
            cursor: pointer;
        }

        .logout-button:hover {
            background: #45475a;
        }
    `;

	render() {
		return html`
			<nav>
				<!-- Application name. Clicking it takes the user to the home page. -->
				<a class="brand" href="/"> Shop </a>

				<!-- Link to the home page. -->
				<a href="/"> Home </a>

				<!-- Link to the product catalogue. -->
				<a href="/products"> Products </a>

				<!-- Only show the cart when the user is logged in. -->
				${() => (isLoggedIn.value ? html` <a href="/cart"> Cart </a> ` : "")}

				<!-- Only show the admin dashboard to administrators. -->
				${() =>
					isAdmin.value ? html` <a href="/admin"> Admin Dashboard </a> ` : ""}

				<!-- Display different content depending on whether the user is logged in. -->
				${() =>
					isLoggedIn.value
						? html`
								<!-- Display the currently logged-in user's email address. -->
								<span class="user-email">
									${() => user.value?.email ?? ""}
								</span>

								<!-- Logout button -->
								<button
									class="logout-button"
									@click=${() => {
										// Remove the authentication token and current user from the store.
										clearAuth();

										// Send the user back to the login page.
										navigate("/login");
									}}
								>
									Logout
								</button>
							`
						: html`
								<!-- If the user is not logged in, provide a link to the login page. -->
								<a href="/login"> Login </a>
							`}
			</nav>
		`;
	}
}

customElements.define("navigation-bar", Navigation);
