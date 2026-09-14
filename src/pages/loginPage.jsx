import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../utils/api";
import { Spinner } from "../components/loader";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const next = searchParams.get("next") == null ? "/" : searchParams.get("next");

	async function login() {
		if (email === "" || password === "") {
			toast.error("Enter your email and password to sign in");
			return;
		}

		setIsLoading(true);

		try {
			const res = await api.post("/users/login", {
				email: email,
				password: password,
			});

			localStorage.setItem("token", res.data.token);
			window.dispatchEvent(new Event("cart-updated"));
			toast.success("Signed in");
			navigate(next);
		} catch (error) {
			toast.error(getErrorMessage(error, "Those details didn't match an account"));
		}

		setIsLoading(false);
	}

	return (
		<div className="grid min-h-screen lg:grid-cols-2">
			<div className="hidden flex-col justify-between bg-ink p-12 text-white lg:flex">
				<Link to="/" className="flex items-center gap-2">
					<span className="font-bold text-4xl">Buyora</span>
				</Link>

				<div className="max-w-md">
					<h2 className="text-4xl leading-tight text-white">
						Your cart is held while you pay, not while you decide.
					</h2>
					<p className="mt-4 text-white/70">
						Sign in to keep a cart, check out with a five minute stock hold, and follow
						every order from payment to refund.
					</p>
				</div>
			</div>

			<div className="flex items-center justify-center p-6 sm:p-12">
				<div className="w-full max-w-sm">
					<Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
						<span className="font-bold text-2xl">Buyora</span>
					</Link>

					<h1 className="text-3xl">Sign in</h1>
					<p className="mt-2 text-ink-soft">Welcome back. Your cart is where you left it.</p>

					<label className="mt-8 block text-sm font-semibold">
						Email
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									login();
								}
							}}
							placeholder="you@example.com"
							className="mt-1.5 w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 font-normal outline-none focus:border-accent"
						/>
					</label>

					<label className="mt-4 block text-sm font-semibold">
						Password
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									login();
								}
							}}
							placeholder="Your password"
							className="mt-1.5 w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 font-normal outline-none focus:border-accent"
						/>
					</label>

					<button
						onClick={login}
						disabled={isLoading}
						className="mt-6 w-full rounded-lg bg-accent py-3 font-semibold text-white transition-colors hover:bg-accent-dark disabled:bg-ink-soft"
					>
						{isLoading ? <Spinner /> : "Sign in"}
					</button>

					<p className="mt-6 text-sm text-ink-soft">
						New here?{" "}
						<Link to="/register" className="font-semibold text-accent hover:underline">
							Create an account
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
