import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LuSearch, LuSlidersHorizontal } from "react-icons/lu";
import api from "../utils/api";
import ProductCard from "../components/productCard";
import Loader from "../components/loader";
import EmptyState from "../components/emptyState";

const SORTS = [
	{ value: "newest", label: "Newest" },
	{ value: "price-asc", label: "Price, low to high" },
	{ value: "price-desc", label: "Price, high to low" },
	{ value: "name", label: "Name A to Z" },
];

const AVAILABILITY = [
	{ value: "", label: "Everything" },
	{ value: "in-stock", label: "In stock" },
	{ value: "out-of-stock", label: "Sold out" },
];

const EMPTY_PAGINATION = { page: 1, totalPages: 1, total: 0 };

export default function ProductPage() {
	const [searchParams, setSearchParams] = useSearchParams();

	const [result, setResult] = useState(null);
	const [categories, setCategories] = useState([]);
	const [filtersOpen, setFiltersOpen] = useState(false);

	// The URL is the single source of truth, so filters survive a refresh and can be shared
	const search = searchParams.get("search") == null ? "" : searchParams.get("search");
	const category = searchParams.get("category") == null ? "" : searchParams.get("category");
	const minPrice = searchParams.get("minPrice") == null ? "" : searchParams.get("minPrice");
	const maxPrice = searchParams.get("maxPrice") == null ? "" : searchParams.get("maxPrice");
	const availability =
		searchParams.get("availability") == null ? "" : searchParams.get("availability");
	const sort = searchParams.get("sort") == null ? "newest" : searchParams.get("sort");
	const page = searchParams.get("page") == null ? "1" : searchParams.get("page");

	const query = new URLSearchParams();
	query.set("limit", "8");
	query.set("page", page);
	query.set("sort", sort);

	if (search !== "") {
		query.set("search", search);
	}
	if (category !== "") {
		query.set("category", category);
	}
	if (minPrice !== "") {
		query.set("minPrice", minPrice);
	}
	if (maxPrice !== "") {
		query.set("maxPrice", maxPrice);
	}
	if (availability !== "") {
		query.set("availability", availability);
	}

	const queryString = query.toString();

	useEffect(() => {
		let active = true;

		api
			.get("/products/categories")
			.then((res) => {
				if (active) {
					setCategories(Array.isArray(res.data) ? res.data : []);
				}
			})
			.catch(() => {
				if (active) {
					setCategories([]);
				}
			});

		return () => {
			active = false;
		};
	}, []);

	// The response is tagged with the query it answered, so "loading" is derived
	// instead of being set at the top of the effect.
	useEffect(() => {
		let active = true;

		api
			.get("/products?" + queryString)
			.then((res) => {
				if (active) {
					setResult({
						key: queryString,
						products: Array.isArray(res.data.products) ? res.data.products : [],
						pagination:
							res.data.pagination == null ? EMPTY_PAGINATION : res.data.pagination,
					});
				}
			})
			.catch(() => {
				if (active) {
					setResult({ key: queryString, products: [], pagination: EMPTY_PAGINATION });
				}
			});

		return () => {
			active = false;
		};
	}, [queryString]);

	const loaded = result != null && result.key === queryString;
	const products = loaded ? result.products : [];
	const pagination = loaded ? result.pagination : EMPTY_PAGINATION;

	function setFilter(key, value) {
		const next = new URLSearchParams(searchParams);

		if (value === "" || value == null) {
			next.delete(key);
		} else {
			next.set(key, value);
		}

		if (key !== "page") {
			next.delete("page");
		}

		setSearchParams(next);
	}

	function clearFilters() {
		setSearchParams(new URLSearchParams());
	}

	const hasFilters =
		search !== "" ||
		category !== "" ||
		minPrice !== "" ||
		maxPrice !== "" ||
		availability !== "";

	const filterPanel = (
		<div className="flex flex-col gap-7">
			<div>
				<h3 className="text-sm font-semibold">Category</h3>
				<div className="mt-3 flex flex-col gap-1">
					<button
						onClick={() => setFilter("category", "")}
						className={
							"rounded-lg px-3 py-2 text-left text-sm transition-colors " +
							(category === "" ? "bg-ink text-white" : "hover:bg-paper")
						}
					>
						All categories
					</button>
					{categories.map((item) => {
						return (
							<button
								key={item}
								onClick={() => setFilter("category", item)}
								className={
									"rounded-lg px-3 py-2 text-left text-sm capitalize transition-colors " +
									(category === item ? "bg-ink text-white" : "hover:bg-paper")
								}
							>
								{item}
							</button>
						);
					})}
				</div>
			</div>

			<div>
				<h3 className="text-sm font-semibold">Price range</h3>
				<div className="mt-3 flex items-center gap-2">
					<input
						type="number"
						min="0"
						value={minPrice}
						onChange={(e) => setFilter("minPrice", e.target.value)}
						placeholder="Min"
						className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
					/>
					<span className="text-ink-soft">to</span>
					<input
						type="number"
						min="0"
						value={maxPrice}
						onChange={(e) => setFilter("maxPrice", e.target.value)}
						placeholder="Max"
						className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
					/>
				</div>
			</div>

			<div>
				<h3 className="text-sm font-semibold">Availability</h3>
				<div className="mt-3 flex flex-col gap-1">
					{AVAILABILITY.map((option) => {
						return (
							<button
								key={option.value}
								onClick={() => setFilter("availability", option.value)}
								className={
									"rounded-lg px-3 py-2 text-left text-sm transition-colors " +
									(availability === option.value ? "bg-ink text-white" : "hover:bg-paper")
								}
							>
								{option.label}
							</button>
						);
					})}
				</div>
			</div>

			{hasFilters && (
				<button
					onClick={clearFilters}
					className="self-start text-sm font-semibold text-accent hover:underline"
				>
					Clear all filters
				</button>
			)}
		</div>
	);

	return (
		<div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
			<div className="flex flex-col gap-4 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<h1 className="text-3xl">Shop</h1>
					<p className="mt-1 text-ink-soft">
						{loaded
							? pagination.total + " product" + (pagination.total === 1 ? "" : "s")
							: "Loading products"}
						{search !== "" ? " matching “" + search + "”" : ""}
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<div className="relative flex-1 md:w-72 md:flex-none">
						<LuSearch className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-soft" />
						{/* Uncontrolled + keyed on the URL value: no effect needed to resync */}
						<input
							key={search}
							defaultValue={search}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									setFilter("search", e.currentTarget.value.trim());
								}
							}}
							placeholder="Search this shop"
							className="w-full rounded-lg border border-line bg-surface py-2.5 pr-3 pl-9 text-sm outline-none focus:border-accent"
						/>
					</div>

					<select
						value={sort}
						onChange={(e) => setFilter("sort", e.target.value)}
						className="rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
					>
						{SORTS.map((option) => {
							return (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							);
						})}
					</select>

					<button
						onClick={() => setFiltersOpen(!filtersOpen)}
						className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm font-semibold lg:hidden"
					>
						<LuSlidersHorizontal /> Filters
					</button>
				</div>
			</div>

			<div className="grid gap-8 pt-8 lg:grid-cols-[220px_1fr]">
				<aside className="hidden lg:block">{filterPanel}</aside>

				{filtersOpen && (
					<div className="rounded-xl border border-line bg-surface p-5 lg:hidden">
						{filterPanel}
					</div>
				)}

				<div>
					{!loaded ? (
						<Loader />
					) : products.length === 0 ? (
						<EmptyState
							title="Nothing matches those filters"
							message="Try a broader price range, a different category, or clear the search box."
							actionLabel="Clear filters"
							actionTo="/products"
						/>
					) : (
						<>
							<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
								{products.map((product) => {
									return <ProductCard key={product.productId} product={product} />;
								})}
							</div>

							{pagination.totalPages > 1 && (
								<div className="mt-10 flex items-center justify-center gap-2">
									<button
										disabled={pagination.page <= 1}
										onClick={() => setFilter("page", String(pagination.page - 1))}
										className="rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold disabled:opacity-40"
									>
										Previous
									</button>
									<span className="px-3 font-mono text-sm text-ink-soft">
										{pagination.page} / {pagination.totalPages}
									</span>
									<button
										disabled={pagination.page >= pagination.totalPages}
										onClick={() => setFilter("page", String(pagination.page + 1))}
										className="rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold disabled:opacity-40"
									>
										Next
									</button>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}
