import { html, route, router, api, navigate, pwa } from "tina4js";

import { clearAuth, restoreAuth } from "./store";

/* 
    FOLDERS WIRE THEMSELVES. route() appends to the router table and
    customElements.define() runs at module scope, so importing a file IS
    registering what it declares - one glob replaces a hand-maintained barrel,
    and a new route or component needs no edit here.

    { eager: true } is MANDATORY. Without it the glob hands back loader functions
    nobody calls, so NOTHING registers and the app renders an empty page with no
    error to read.
*/
import.meta.glob("./routes/**/*.ts", { eager: true });

import.meta.glob("./components/**/*.ts", { eager: true });

/*
    Debug overlay in dev mode (Ctrl+Shift+D to toggle, tree-shaken from
    production builds). Signals created before this dynamic import resolves —
    including module-level store signals — are buffered and still tracked.
*/
if (import.meta.env.DEV) {
	import("tina4js/debug");
}

// Configure API
api.configure({
	baseUrl: "/api",
	auth: true,
});

/* 
    Intercept API responses globally.

    If the backend says the user is unauthorized, clear the
    stored authentication state and send the user to the login page.

    Note:
    Changed from:
    api.intercept("response", (response)) => {
    to:
    api.intercept("response", (response: { status: number }) => {

    because (response) was showing the following warning:
    "Parameter 'response' implicitly has an 'any' type.ts(7006)"
*/
api.intercept("response", (response: { status: number }) => {
	if (response.status === 401) {
		clearAuth();

		navigate("/login", {
			replace: true,
		});
	}
});

/* 
    Register the application as a Progressive Web App.

    Tina4JS automatically:
        - Generates the web manifest.
        - Adds the manifest to the document.
        - Adds the theme-color metadata.
        - Generates the service worker.
        - Registers the service worker.
*/
pwa.register({
	name: "Tina4 Shop",
	shortName: "Tina4 Shop",
	themeColor: "#1e1e2e",
	backgroundColor: "#1e1e2e",
	display: "standalone",
	icon: "/Icon_Bird_512x512.png",
	cacheStrategy: "stale-while-revalidate",
	precache: ["/", "/Icon_Bird_512x512.png", "/offline.html"],
	offlineRoute: "/offline.html",
});

// The catch-all belongs HERE, after the glob. Inside routes/ it would sort
// ahead of the real routes and every path would render 404.
route(
	"*",
	() => html`
		<div class="page">
			<h1>404</h1>
			<p>Page not found.</p>
			<a href="/">Go home</a>
		</div>
	`,
);

/* 
    Restore the authenticated user before starting
    the router. 

    This is important because the token can exist while
    user.value is still null after a page refresh.
*/
async function startApp() {
	await restoreAuth();

	router.start({
		target: "#root",
		mode: "history",
	});
}

startApp();
