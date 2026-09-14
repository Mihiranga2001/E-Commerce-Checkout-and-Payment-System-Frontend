import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LuSearch, LuShoppingBag, LuMenu, LuX } from "react-icons/lu";
import UserData from "./userData";
import { fetchCart } from "../utils/cart";
import { isLoggedIn } from "../utils/api";

const LINKS = [
	{ to: "/products", label: "Shop" },
	{ to: "/orders", label: "Orders" },
];

export default function Header() {
	const [query, setQuery] = useState("");
	const [cartCount, setCartCount] = useState(0);
	const [menuOpen, setMenuOpen] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		let active = true;

		function readCart() {
			if (!isLoggedIn()) {
				return Promise.resolve({ itemCount: 0 });
			}
			return fetchCart();
		}

		// setCartCount only runs inside these callbacks, never in the effect body
		function loadCount() {
			readCart()
				.then((cart) => {
					if (active) {
						setCartCount(cart.itemCount);
					}
				})
				.catch(() => {
					if (active) {
						setCartCount(0);
					}
				});
		}

		loadCount();
		window.addEventListener("cart-updated", loadCount);

		return () => {
			active = false;
			window.removeEventListener("cart-updated", loadCount);
		};
	}, [location.pathname]);

	function runSearch() {
		navigate("/products?search=" + encodeURIComponent(query.trim()));
		setMenuOpen(false);
	}

	return (
		<header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
			<div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 lg:px-8">
				<button
					onClick={() => setMenuOpen(!menuOpen)}
					aria-label="Menu"
					className="rounded-lg p-2 hover:bg-paper lg:hidden"
				>
					{menuOpen ? <LuX /> : <LuMenu />}
				</button>

				<Link to="/" className="flex shrink-0 items-center gap-2">
					<span className="hidden text-[40px] font-bold sm:inline">
						Buyora
					</span>
				</Link>

				<div className="relative ml-2 hidden flex-1 md:block">
					<LuSearch className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-soft" />
					<input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								runSearch();
							}
						}}
						placeholder="Search keyboards, monitors, audio"
						className="w-full rounded-lg border border-line bg-paper py-2 pr-3 pl-9 text-sm outline-none transition-colors focus:border-accent focus:bg-surface"
					/>
				</div>

				<nav className="ml-auto hidden items-center gap-1 lg:flex">
					{LINKS.map((link) => {
						return (
							<Link
								key={link.to}
								to={link.to}
								className={
									"rounded-lg px-3 py-2 text-sm font-semibold hover:bg-paper " +
									(location.pathname === link.to ? "text-accent" : "")
								}
							>
								{link.label}
							</Link>
						);
					})}
				</nav>

				<Link
					to="/cart"
					aria-label="Cart"
					className="relative ml-auto rounded-lg p-2 hover:bg-paper lg:ml-0"
				>
					<LuShoppingBag className="text-xl" />
					{cartCount > 0 && (
						<span className="absolute -top-0.5 -right-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-accent px-1 font-mono text-[10px] font-semibold text-white">
							{cartCount}
						</span>
					)}
				</Link>

				<div className="hidden lg:block">
					<UserData />
				</div>
			</div>

			{menuOpen && (
				<div className="border-t border-line bg-surface px-4 py-4 lg:hidden">
					<div className="relative mb-3">
						<LuSearch className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-soft" />
						<input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									runSearch();
								}
							}}
							placeholder="Search products"
							className="w-full rounded-lg border border-line bg-paper py-2 pr-3 pl-9 text-sm outline-none focus:border-accent"
						/>
					</div>
					<div className="flex flex-col">
						{LINKS.map((link) => {
							return (
								<Link
									key={link.to}
									to={link.to}
									onClick={() => setMenuOpen(false)}
									className="rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-paper"
								>
									{link.label}
								</Link>
							);
						})}
					</div>
					<div className="mt-3 border-t border-line pt-3">
						<UserData />
					</div>
				</div>
			)}
		</header>
	);
}
