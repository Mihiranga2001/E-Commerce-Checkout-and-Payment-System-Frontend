import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../utils/api";
import { Spinner } from "../components/loader";

export default function RegisterPage() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	async function register() {
		if (firstName === "" || lastName === "" || email === "" || password === "") {
			toast.error("Fill in every field to create your account");
			return;
		}

		if (password.length < 6) {
			toast.error("Use at least 6 characters for your password");
			return;
		}

		setIsLoading(true);

		try {
			await api.post("/users", {
				firstName: firstName,
				lastName: lastName,
				email: email,
				password: password,
			});

			toast.success("Account created, sign in to start shopping");
			navigate("/login");
		} catch (error) {
			toast.error(getErrorMessage(error, "That account could not be created"));
		}

		setIsLoading(false);
	}

	return (
		<div className="grid min-h-screen lg:grid-cols-2">
			<div className="hidden flex-col justify-between bg-ink p-12 text-white lg:flex">
				<Link to="/" className="flex items-center gap-2">
					<span className="grid h-8 w-8 place-items-center rounded-md bg-white font-mono text-sm font-semibold text-ink">
						nb
					</span>
					<span className="font-semibold">Northbay Components</span>
				</Link>

				<div className="max-w-md">
					<h2 className="text-4xl leading-tight text-white">
						One account, one cart, every order tracked.
					</h2>
					<p className="mt-4 text-white/70">
						Your cart lives on our servers, so the stock you reserve at checkout is real
						and the same on every device you sign in from.
					</p>
				</div>

				<p className="font-mono text-xs text-white/50">
					Demo store for the Techloom.ai assessment
				</p>
			</div>

			<div className="flex items-center justify-center p-6 sm:p-12">
				<div className="w-full max-w-sm">
					<h1 className="text-3xl">Create your account</h1>
					<p className="mt-2 text-ink-soft">It takes a moment and nothing is charged.</p>

					<div className="mt-8 grid grid-cols-2 gap-3">
						<label className="block text-sm font-semibold">
							First name
							<input
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								placeholder="Ada"
								className="mt-1.5 w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 font-normal outline-none focus:border-accent"
							/>
						</label>
						<label className="block text-sm font-semibold">
							Last name
							<input
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								placeholder="Perera"
								className="mt-1.5 w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 font-normal outline-none focus:border-accent"
							/>
						</label>
					</div>

					<label className="mt-4 block text-sm font-semibold">
						Email
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
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
									register();
								}
							}}
							placeholder="At least 6 characters"
							className="mt-1.5 w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 font-normal outline-none focus:border-accent"
						/>
					</label>

					<button
						onClick={register}
						disabled={isLoading}
						className="mt-6 w-full rounded-lg bg-accent py-3 font-semibold text-white transition-colors hover:bg-accent-dark disabled:bg-ink-soft"
					>
						{isLoading ? <Spinner /> : "Create account"}
					</button>

					<p className="mt-6 text-sm text-ink-soft">
						Already registered?{" "}
						<Link to="/login" className="font-semibold text-accent hover:underline">
							Sign in
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
