import { signal, computed, api } from "tina4js";

/* 
    Represents the authenticated user returned by the backend. 
    
    Keeping this shape in one interface means TypeScript can check 
    that the user data used throughout the application is consistent.
*/
export interface AuthUser {
	id: number;
	email: string;
	role: string;
}

/*
    Store the authentication token as reactive state. 
    
    First, try to restore an existing token from localStorage. 
    This allows the user to remain logged in after refreshing 
    the page. 
    
    The signal starts with either: 
        - the previously saved token, or 
        - null if no token exists. 
        
    "auth-token" is the optional debug/name identifier for this signal.
*/
export const token = signal<string | null>(
	localStorage.getItem("tina4_token"),
	"auth-token",
);

/* 
    Store the currently authenticated user's details. 
    
    The initial value is null because we don't know 
    who the user is until restoreAuth() successfully 
    calls the backend.
*/
export const user = signal<AuthUser | null>(null, "current-user");

/* 
    Computed value that tells the application whether a token exists. 
    
    Because this is computed from the token signal, it automatically 
    updates whenever token.value changes.
*/
export const isLoggedIn = computed(() => token.value !== null);

/*
    Computed value that checks whether the current user is an admin. 
    
    The optional chaining operator (?.) prevents an error when 
    user.value is null. In that case, this expression evaluates to false.
*/
export const isAdmin = computed(() => user.value?.role === "admin");

/*
    Update the current authenticated user's information. 
    
    This is useful after login when we have retrieved the user's 
    details from the backend.
*/
export function setAuthUser(userData: AuthUser) {
	user.value = userData;
}

/*
    Clear all authentication state. 
    
    This removes the saved token from localStorage and resets both 
    reactive authentication values. 
    
    After this function runs: 
        - token.value is null 
        - user.value is null 
        - isLoggedIn.value becomes false 
        - isAdmin.value becomes false
*/
export function clearAuth() {
	// Remove the token that was saved in the browser.
	localStorage.removeItem("tina4_token");

	// Clear the reactive token.
	token.value = null;

	// Clear the currently authenticated user.
	user.value = null;
}

/*
    Restore the user's authentication state after the application starts. 
    
    A token may still exist in localStorage after a page refresh, but 
    user.value starts as null because signals are recreated when the  
    application loads. 
    
    This function uses the token to ask the backend who the current 
    authenticated user is.
*/
export async function restoreAuth() {
	// If there is no saved token, there is nothing to restore.
	if (!token.value) {
		return;
	}

	try {
		/*
            Ask the backend for the currently authenticated user. 
            
            The generic <AuthUser> tells TypeScript what shape of data 
            we expect the API to return.
        */
		const currentUser = await api.get<AuthUser>("/auth/me");

		// Store the returned user in the reactive user signal.
		user.value = currentUser;
	} catch (error) {
		/*
            If the token is invalid, expired, or the request fails, 
            log the error so it can be diagnosed during development.
        */
		console.error("Failed to restore authentication:", error);

		/* 
            Remove the invalid authentication state so the application 
            does not continue treating the user as authenticated.
        */
		clearAuth();
	}
}
