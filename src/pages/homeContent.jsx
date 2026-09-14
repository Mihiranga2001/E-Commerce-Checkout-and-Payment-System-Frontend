import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import ProductCard from "../components/productCard";
import Loader from "../components/loader";

const STEPS = [
	{
		title: "Add what you need",
		body: "Stock counts update as other people shop, so the number you see is the number that is really on the shelf.",
	},
	{
		title: "Checkout holds it for 5 minutes",
		body: "Your items come off sale the moment you start checkout. Nobody can buy them out from under you while you pay.",
	},
	{
		title: "Pay, or the hold lapses",
		body: "A successful payment confirms the order. A failure, a timeout or a lapsed clock puts the stock straight back on sale.",
	},
];

export default function Home() {
	const [products, setProducts] = useState([]);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		let active = true;

		api
			.get("/products?limit=4&sort=newest")
			.then((res) => {
				if (active) {
					// Guard against a misconfigured VITE_BACKEND_URL answering with something else
					setProducts(Array.isArray(res.data.products) ? res.data.products : []);
					setLoaded(true);
				}
			})
			.catch(() => {
				if (active) {
					setLoaded(true);
				}
			});

		return () => {
			active = false;
		};
	}, []);

	return (
		<div>
			<section className="border-b border-line bg-surface">
				<div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
					<div className="max-w-xl">
						<h1 className="text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
							Components that are actually in stock.
						</h1>
						<p className="mt-5 text-lg text-ink-soft">
							Every product page shows live availability, and checkout puts a five minute
							hold on your items so a slow card payment never costs you the last one.
						</p>
						<div className="mt-8 flex flex-wrap gap-3">
							<Link
								to="/products"
								className="rounded-lg bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-dark"
							>
								Browse the shop
							</Link>
							<Link
								to="/orders"
								className="rounded-lg border border-line px-6 py-3 font-semibold transition-colors hover:border-ink/30"
							>
								Track an order
							</Link>
						</div>
					</div>

					<ol className="flex flex-col justify-center gap-6 border-l border-line pl-8">
						{STEPS.map((step, index) => {
							return (
								<li key={step.title} className="relative">
									<span className="absolute top-0.5 -left-10.25 grid h-6 w-6 place-items-center rounded-full bg-ink font-mono text-[11px] font-semibold text-white">
										{index + 1}
									</span>
									<h2 className="text-base">{step.title}</h2>
									<p className="mt-1 text-sm text-ink-soft">{step.body}</p>
								</li>
							);
						})}
					</ol>
				</div>
			</section>

			<section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
				<div className="flex items-end justify-between gap-4">
					<h2 className="text-2xl">Just landed</h2>
					<Link to="/products" className="text-sm font-semibold text-accent hover:underline">
						See everything
					</Link>
				</div>

				{!loaded ? (
					<Loader />
				) : (
					<div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
						{products.map((product) => {
							return <ProductCard key={product.productId} product={product} />;
						})}
					</div>
				)}
			</section>
		</div>
	);
}
