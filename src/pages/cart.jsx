import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LuMinus, LuPlus, LuTrash2 } from "react-icons/lu";
import { fetchCart, updateCartItem, removeFromCart, clearCart } from "../utils/cart";
import { isLoggedIn, getErrorMessage } from "../utils/api";
import { formatPrice } from "../utils/format";
import Loader from "../components/loader";
import EmptyState from "../components/emptyState";

export default function CartPage() {
	const navigate = useNavigate();
	const [cart, setCart] = useState(null);
	const [loaded, setLoaded] = useState(false);
	const [busyId, setBusyId] = useState(null);

	useEffect(() => {
		if (!isLoggedIn()) {
			navigate("/login?next=/cart");
			return;
		}

		fetchCart()
			.then((data) => {
				setCart(data);
				setLoaded(true);
			})
			.catch((error) => {
				toast.error(getErrorMessage(error, "Could not load your cart"));
				setLoaded(true);
			});
	}, [navigate]);

	async function changeQuantity(productId, quantity) {
		setBusyId(productId);

		try {
			const updated = await updateCartItem(productId, quantity);
			setCart(updated);
		} catch (error) {
			toast.error(getErrorMessage(error, "Could not update that item"));
		}

		setBusyId(null);
	}

	async function removeItem(productId) {
		setBusyId(productId);

		try {
			const updated = await removeFromCart(productId);
			setCart(updated);
			toast.success("Item removed");
		} catch (error) {
			toast.error(getErrorMessage(error, "Could not remove that item"));
		}

		setBusyId(null);
	}

	async function emptyCart() {
		try {
			const updated = await clearCart();
			setCart(updated);
			toast.success("Cart cleared");
		} catch (error) {
			toast.error(getErrorMessage(error, "Could not clear the cart"));
		}
	}

	if (!loaded) {
		return <Loader />;
	}

	if (cart == null || cart.items.length === 0) {
		return (
			<div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
				<h1 className="mb-6 text-3xl">Your cart</h1>
				<EmptyState
					title="Your cart is empty"
					message="Add a few components and they'll show up here, ready to check out."
					actionLabel="Browse products"
					actionTo="/products"
				/>
			</div>
		);
	}

	const hasUnavailable = cart.items.some((item) => {
		return item.available === false;
	});

	return (
		<div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
			<div className="flex items-end justify-between gap-4">
				<h1 className="text-3xl">Your cart</h1>
				<button
					onClick={emptyCart}
					className="text-sm font-semibold text-ink-soft hover:text-bad"
				>
					Clear cart
				</button>
			</div>

			<div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
				<div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
					{cart.items.map((item) => {
						return (
							<div
								key={item.productId}
								className={
									"flex gap-4 p-4 sm:p-5 " + (busyId === item.productId ? "opacity-50" : "")
								}
							>
								<div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-paper">
									{item.image != null && (
										<img src={item.image} alt="" className="h-full w-full object-cover" />
									)}
								</div>

								<div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
									<div className="flex items-start justify-between gap-4">
										<div className="min-w-0">
											<Link
												to={"/overview/" + item.productId}
												className="block truncate font-semibold hover:text-accent"
											>
												{item.name == null ? item.productId : item.name}
											</Link>
											<p className="mt-0.5 font-mono text-xs text-ink-soft">
												{item.productId}
											</p>
											{item.available === false && (
												<p className="mt-1 text-sm text-bad">
													{item.message == null
														? "Only " + item.availableStock + " left, lower the quantity"
														: item.message}
												</p>
											)}
										</div>
										<p className="shrink-0 font-semibold tnum">
											{formatPrice(item.lineTotal)}
										</p>
									</div>

									<div className="flex items-center justify-between gap-4">
										<div className="flex items-center rounded-lg border border-line">
											<button
												onClick={() => changeQuantity(item.productId, item.quantity - 1)}
												disabled={item.quantity <= 1}
												aria-label="Decrease quantity"
												className="p-2 text-ink-soft hover:text-ink disabled:opacity-40"
											>
												<LuMinus />
											</button>
											<span className="w-9 text-center font-mono text-sm font-semibold tnum">
												{item.quantity}
											</span>
											<button
												onClick={() => changeQuantity(item.productId, item.quantity + 1)}
												aria-label="Increase quantity"
												className="p-2 text-ink-soft hover:text-ink"
											>
												<LuPlus />
											</button>
										</div>

										<button
											onClick={() => removeItem(item.productId)}
											className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-bad"
										>
											<LuTrash2 /> Remove
										</button>
									</div>
								</div>
							</div>
						);
					})}
				</div>

				<div className="h-fit rounded-2xl border border-line bg-surface p-6 lg:sticky lg:top-24">
					<h2 className="text-lg">Summary</h2>

					<div className="mt-4 flex justify-between text-sm">
						<span className="text-ink-soft">Items</span>
						<span className="tnum">{cart.itemCount}</span>
					</div>
					<div className="mt-2 flex justify-between text-sm">
						<span className="text-ink-soft">Delivery</span>
						<span>Calculated after payment</span>
					</div>

					<div className="mt-4 flex items-end justify-between border-t border-line pt-4">
						<span className="font-semibold">Total</span>
						<span className="text-2xl font-semibold tnum">{formatPrice(cart.total)}</span>
					</div>

					<button
						onClick={() => navigate("/checkout")}
						disabled={hasUnavailable}
						className="mt-6 w-full rounded-lg bg-accent py-3 font-semibold text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-ink-soft"
					>
						Checkout and hold stock
					</button>

					{hasUnavailable ? (
						<p className="mt-3 text-sm text-bad">
							Fix the flagged items above before checking out.
						</p>
					) : (
						<p className="mt-3 text-sm text-ink-soft">
							Checkout reserves these items for five minutes while you pay.
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
