import { html, route, router, api } from "tina4js";

// FOLDERS WIRE THEMSELVES. route() appends to the router table and
// customElements.define() runs at module scope, so importing a file IS
// registering what it declares - one glob replaces a hand-maintained barrel,
// and a new route or component needs no edit here.
//
// { eager: true } is MANDATORY. Without it the glob hands back loader functions
// nobody calls, so NOTHING registers and the app renders an empty page with no
// error to read.
import.meta.glob("./routes/**/*.ts", { eager: true });
import.meta.glob("./components/**/*.ts", { eager: true });

// Debug overlay in dev mode (Ctrl+Shift+D to toggle, tree-shaken from
// production builds). Signals created before this dynamic import resolves —
// including module-level store signals — are buffered and still tracked.
if (import.meta.env.DEV) import("tina4js/debug");

// Configure API (uncomment to connect to tina4-php/python backend)
api.configure({ baseUrl: "/api", auth: true });

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

// Start router
router.start({ target: "#root", mode: "hash" });
