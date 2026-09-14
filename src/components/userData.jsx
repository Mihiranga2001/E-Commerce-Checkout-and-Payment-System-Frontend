import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuUser } from "react-icons/lu";
import api, { isLoggedIn, logout } from "../utils/api";

export default function UserData() {
	const [user, setUser] = useState(null);
	const [menuOpen, setMenuOpen] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		if (!isLoggedIn()) {
			return;
		}

		api
			.get("/users")
			.then((res) => {
				setUser(res.data);
			})
			.catch(() => {
				setUser(null);
			});
	}, []);

	if (user == null) {
		return (
			<div className="flex items-center gap-2">
				<Link
					to="/login"
					className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-paper"
				>
					Sign in
				</Link>
				<Link
					to="/register"
					className="rounded-lg bg-ink px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent"
				>
					Create account
				</Link>
			</div>
		);
	}

	return (
		<div className="relative">
			<button
				onClick={() => setMenuOpen(!menuOpen)}
				className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-paper"
			>
				{user.image != null ? (
					<img
						src={user.image}
						alt=""
						referrerPolicy="no-referrer"
						className="h-8 w-8 rounded-full object-cover"
					/>
				) : (
					<LuUser className="h-8 w-8 rounded-full bg-paper p-1.5" />
				)}
				<span className="hidden text-sm font-semibold sm:inline">{user.firstName}</span>
			</button>

			{menuOpen && (
				<>
					<div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
					<div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-line bg-surface p-1 shadow-lg shadow-ink/5">
						<div className="px-3 py-2">
							<p className="text-sm font-semibold">
								{user.firstName} {user.lastName}
							</p>
							<p className="truncate text-xs text-ink-soft">{user.email}</p>
						</div>
						<div className="my-1 h-px bg-line" />
						<button
							onClick={() => {
								setMenuOpen(false);
								navigate("/orders");
							}}
							className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-paper"
						>
							My orders
						</button>
						<button
							onClick={() => {
								logout();
								navigate("/login");
							}}
							className="w-full rounded-lg px-3 py-2 text-left text-sm text-bad hover:bg-bad-tint"
						>
							Sign out
						</button>
					</div>
				</>
			)}
		</div>
	);
}
