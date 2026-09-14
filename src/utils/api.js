import axios from "axios";

// Every request goes through this instance so the token is attached in one place.
const baseURL = import.meta.env.VITE_BACKEND_URL;

// Without this the requests fall back to relative URLs, the dev server answers
// with index.html, and every response looks like a success full of nothing.
if (baseURL == null || baseURL === "") {
	console.error(
		"VITE_BACKEND_URL is not set. Create a .env file in the frontend root with " +
			"VITE_BACKEND_URL=http://localhost:3000/api and restart the dev server."
	);
}

const api = axios.create({
	baseURL: baseURL,
	// A hung backend should surface as an error, never as an endless spinner.
	// The mock gateway's slowest path (timeout) answers in about 3 seconds.
	timeout: 20000,
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");

	if (token != null) {
		config.headers.Authorization = "Bearer " + token;
	}

	return config;
});

export function isLoggedIn() {
	return localStorage.getItem("token") != null;
}

export function logout() {
	localStorage.removeItem("token");
	localStorage.removeItem("checkoutSessionId");
	window.dispatchEvent(new Event("cart-updated"));
}

// The backend always answers with { message }, so surface that instead of "Request failed"
export function getErrorMessage(error, fallback) {
	if (error.response != null && error.response.data != null) {
		if (error.response.data.message != null) {
			return error.response.data.message;
		}
	}

	if (error.message != null) {
		return error.message;
	}

	return fallback;
}

export default api;
