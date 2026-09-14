import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { LuMinus, LuPlus, LuChevronLeft } from "react-icons/lu";
import api, { isLoggedIn, getErrorMessage } from "../utils/api";
import { addToCart } from "../utils/cart";
import { formatPrice } from "../utils/format";
import Loader, { Spinner } from "../components/loader";
import EmptyState from "../components/emptyState";

export default function ProductOverview() {
	const params = useParams();
	const navigate = useNavigate();

	// One piece of state holds the product and the id it belongs to, so the
	// loading state is derived rather than set at the top of the effect.
	const [data, setData] = useState(null);
	const [activeImage, setActiveImage] = useState(0);
	const [quantity, setQuantity] = useState(1);
	const [adding, setAdding] = useState(false);

	useEffect(() => {
		let active = true;

		api
			.get("/products/" + params.productId)
			.then((res) => {
				if (!active) {
					return;
				}
				setData({ productId: params.productId, product: res.data });
				setActiveImage(0);
				setQuantity(1);
			})
			.catch(() => {
				if (active) {
					setData({ productId: params.productId, product: null });
				}
			});

		return () => {
			active = false;
		};
	}, [params.productId]);

	const isLoading = data == null || data.productId !== params.productId;
	const product = isLoading ? null : data.product;

	async function handleAddToCart() {
		if (!isLoggedIn()) {
			toast("Sign in to start a cart");
			navigate("/login?next=/overview/" + params.productId);
			return;
		}

		setAdding(true);

		try {
			await addToCart(product.productId, quantity);
			toast.success(product.name + " added to your cart");
		} catch (error) {
			toast.error(getErrorMessage(error, "Could not add this to your cart"));
		}

		setAdding(false);
	}

	if (isLoading) {
		return <Loader />;
	}

	if (product == null) {
		return (
			<div className="mx-auto max-w-3xl px-4 py-20 lg:px-8">
				<EmptyState
					title="This product is no longer listed"
					message="It may have been removed from the shop. Everything else is still available."
					actionLabel="Back to the shop"
					actionTo="/products"
				/>
			</div>
		);
	}

	const available = product.availableStock;
	const isOut = available <= 0;

	return (
		<div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
			<Link
				to="/products"
				className="inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink"
			>
				<LuChevronLeft /> All products
			</Link>

			<div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
				<div>
					<div className="aspect-4/3 w-full overflow-hidden rounded-2xl border border-line bg-surface">
						<img
							src={product.images[activeImage]}
							alt={product.name}
							onError={(e) => {
								e.currentTarget.src = "/placeholder.svg";
							}}
							className="h-full w-full object-cover"
						/>
					</div>

					{product.images.length > 1 && (
						<div className="mt-3 flex gap-3">
							{product.images.map((image, index) => {
								return (
									<button
										key={image}
										onClick={() => setActiveImage(index)}
										className={
											"h-20 w-20 overflow-hidden rounded-lg border-2 " +
											(index === activeImage ? "border-accent" : "border-line")
										}
									>
										<img src={image} alt="" className="h-full w-full object-cover" />
									</button>
								);
							})}
						</div>
					)}
				</div>

				<div className="lg:pt-2">
					<p className="text-sm text-ink-soft capitalize">{product.category}</p>
					<h1 className="mt-1 text-3xl leading-tight">{product.name}</h1>

					<div className="mt-5 flex items-end gap-3">
						<span className="text-3xl font-semibold tnum">
							{formatPrice(product.price)}
						</span>
						{product.labeledPrice > product.price && (
							<span className="pb-1 text-ink-soft line-through tnum">
								{formatPrice(product.labeledPrice)}
							</span>
						)}
					</div>

					<p className="mt-5 leading-relaxed text-ink-soft">{product.description}</p>

					<div className="mt-6 rounded-xl border border-line bg-surface p-4">
						<div className="flex items-center justify-between">
							<span className="text-sm font-semibold">
								{isOut ? "Sold out" : available + " available right now"}
							</span>
							<span className="font-mono text-xs text-ink-soft">
								{product.productId}
							</span>
						</div>
						{product.reservedStock > 0 && (
							<p className="mt-2 text-sm text-hold">
								{product.reservedStock} unit
								{product.reservedStock === 1 ? " is" : "s are"} held in someone else's
								checkout. They come back on sale if that payment doesn't complete.
							</p>
						)}
					</div>

					<div className="mt-6 flex flex-wrap items-center gap-3">
						<div className="flex items-center rounded-lg border border-line bg-surface">
							<button
								onClick={() => setQuantity(Math.max(1, quantity - 1))}
								disabled={isOut}
								aria-label="Decrease quantity"
								className="p-3 text-ink-soft hover:text-ink disabled:opacity-40"
							>
								<LuMinus />
							</button>
							<span className="w-10 text-center font-mono font-semibold tnum">
								{quantity}
							</span>
							<button
								onClick={() => setQuantity(Math.min(available, quantity + 1))}
								disabled={isOut || quantity >= available}
								aria-label="Increase quantity"
								className="p-3 text-ink-soft hover:text-ink disabled:opacity-40"
							>
								<LuPlus />
							</button>
						</div>

						<button
							onClick={handleAddToCart}
							disabled={isOut || adding}
							className="flex-1 rounded-lg bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-ink-soft"
						>
							{adding ? <Spinner /> : isOut ? "Sold out" : "Add to cart"}
						</button>
					</div>

					<p className="mt-4 text-sm text-ink-soft">
						Nothing is held until you start checkout. From that point you get five
						minutes to pay.
					</p>
				</div>
			</div>
		</div>
	);
}
