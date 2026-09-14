import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/homePage";
import LoginPage from "./pages/loginPage";
import RegisterPage from "./pages/registerPage";

export default function App() {
	return (
		<BrowserRouter>
			<Toaster
				position="top-center"
				toastOptions={{
					style: {
						background: "#101a2b",
						color: "#ffffff",
						borderRadius: "10px",
						fontSize: "14px",
					},
				}}
			/>
			<Routes>
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />
				<Route path="/*" element={<HomePage />} />
			</Routes>
		</BrowserRouter>
	);
}
