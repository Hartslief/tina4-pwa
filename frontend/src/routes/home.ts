import { route } from "tina4js";
import { homePage } from "@/pages/home";

// Adding a route means adding a FILE here. Nothing to register elsewhere:
// main.ts globs this folder, and importing a file runs its route() call.
route("/", homePage);
