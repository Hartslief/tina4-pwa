import { api } from "tina4js";

// Represents the response returned after successfully logging in.
export interface LoginResponse {
	/* 
		JWT authentication token returned by the backend. 
		The frontend stores this token and uses it to 
		authenticate future API requests.
	*/
	token: string;
}

// Represents the response returned after successfully registering a user.
export interface RegisterResponse {
	message: string;
	id: number;
}

// Log a user into the application.
export async function login(
	email: string,
	password: string,
): Promise<LoginResponse> {
	/* 
		Send the user's login credentials to the backend. 
		The backend validates the credentials and returns
		a JWT token when they are correct.
	*/
	return (await api.post("/auth/login", {
		email,
		password,
	})) as LoginResponse;
}

// Register a new user account.
export async function register(
	email: string,
	password: string,
): Promise<RegisterResponse> {
	/* 
		Send the registration details to the backend. 
		
		The backend creates the user account and returns the new user's ID.
	*/
	return (await api.post("/auth/register", {
		email,
		password,
	})) as RegisterResponse;
}
