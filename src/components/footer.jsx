import { Link } from "react-router-dom";

export default function Footer() {
	return (
		<footer className="mt-20 border-t border-line bg-surface">
			<div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8">
				<div>
					<div className="flex items-center gap-2">
						<span className="font-bold text-2xl">Buyora</span>
					</div>
					<p className="mt-2 max-w-sm text-sm text-ink-soft">
						Stock counts here are live. Whatever is in your cart is only yours once
						checkout holds it.
					</p>
				</div>

				<div className="flex gap-8 text-sm">
					<div className="flex flex-col gap-2">
						<Link to="/products" className="text-ink-soft hover:text-ink">
							Shop
						</Link>
						<Link to="/cart" className="text-ink-soft hover:text-ink">
							Cart
						</Link>
					</div>
					<div className="flex flex-col gap-2">
						<Link to="/orders" className="text-ink-soft hover:text-ink">
							Orders
						</Link>
						<Link to="/login" className="text-ink-soft hover:text-ink">
							Sign in
						</Link>
					</div>
				</div>
			</div>
			<div className="border-t border-line">
				<p className="mx-auto max-w-7xl px-4 py-4 text-xs text-ink-soft lg:px-8">
					© {new Date().getFullYear()} Buyora. All rights reserved.
				</p>
			</div>
		</footer>
	);
}
