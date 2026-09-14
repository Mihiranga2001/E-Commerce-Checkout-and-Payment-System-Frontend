import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LuChevronDown } from "react-icons/lu";
import api, { isLoggedIn, getErrorMessage } from "../utils/api";
import { formatPrice, formatDate } from "../utils/format";
import StatusBadge from "../components/statusBadge";
import Loader from "../components/loader";
import EmptyState from "../components/emptyState";

const FILTERS = ["all", "Reserved", "Paid", "Refunded", "Failed", "Cancelled", "Expired"];

export default function OrdersPage() {
	const navigate = useNavigate();
	const [orders, setOrders] = useState([]);
	const [loaded, setLoaded] = useState(false);
	const [filter, setFilter] = useState("all");
	const [openId, setOpenId] = useState(null);
	const [busyId, setBusyId] = useState(null);

	// State is only set inside the promise callbacks, never in the effect body,
	// so the effect cannot trigger a cascading render.
	useEffect(() => {
		if (!isLoggedIn()) {
			navigate("/login?next=/orders");
			return;
		}

		let active = true;

		api
			.get("/orders")
			.then((res) => {
				if (active) {
					setOrders(res.data);
				}
			})
			.catch((error) => {
				if (active) {
					toast.error(getErrorMessage(error, "Could not load your orders"));
				}
			})
			.finally(() => {
				if (active) {
					setLoaded(true);
				}
			});

		return () => {
			active = false;
		};
	}, [navigate]);

	async function refreshOrders() {
		try {
			const res = await api.get("/orders");
			setOrders(res.data);
		} catch (error) {
			toast.error(getErrorMessage(error, "Could not refresh your orders"));
		}
	}

	async function cancelOrder(order) {
		const isPaid = order.status === "Paid";

		setBusyId(order.orderId);

		try {
			const res = await api.post("/orders/" + order.orderId + "/cancel");
			toast.success(
				isPaid ? "Order cancelled and refunded" : "Order cancelled, stock released"
			);
			setOrders((current) => {
				return current.map((item) => {
					return item.orderId === order.orderId ? res.data.order : item;
				});
			});
		} catch (error) {
			toast.error(getErrorMessage(error, "Could not cancel this order"));
			await refreshOrders();
		}

		setBusyId(null);
	}

	async function refundOrder(order) {
		setBusyId(order.orderId);

		try {
			const res = await api.post("/orders/" + order.orderId + "/refund");
			toast.success("Refund processed");
			setOrders((current) => {
				return current.map((item) => {
					return item.orderId === order.orderId ? res.data.order : item;
				});
			});
		} catch (error) {
			toast.error(getErrorMessage(error, "Could not refund this order"));
		}

		setBusyId(null);
	}

	if (!loaded) {
		return <Loader />;
	}

	const visible =
		filter === "all"
			? orders
			: orders.filter((order) => {
					return order.status === filter;
			  });

	return (
		<div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
			<h1 className="text-3xl">Your orders</h1>
			<p className="mt-1 text-ink-soft">
				Every attempt is kept, including the ones that failed or timed out.
			</p>

			<div className="mt-6 flex flex-wrap gap-2">
				{FILTERS.map((item) => {
					return (
						<button
							key={item}
							onClick={() => setFilter(item)}
							className={
								"rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors " +
								(filter === item
									? "border-ink bg-ink text-white"
									: "border-line bg-surface hover:border-ink/30")
							}
						>
							{item === "all" ? "All" : item}
						</button>
					);
				})}
			</div>

			{visible.length === 0 ? (
				<div className="mt-8">
					<EmptyState
						title={filter === "all" ? "No orders yet" : "Nothing with that status"}
						message={
							filter === "all"
								? "Once you complete a checkout, the order and its payment history land here."
								: "Try a different status filter to see the rest of your orders."
						}
						actionLabel="Browse products"
						actionTo="/products"
					/>
				</div>
			) : (
				<div className="mt-6 flex flex-col gap-3">
					{visible.map((order) => {
						const isOpen = openId === order.orderId;
						const isBusy = busyId === order.orderId;

						return (
							<div
								key={order.orderId}
								className="overflow-hidden rounded-2xl border border-line bg-surface"
							>
								<div className="flex flex-wrap items-center gap-4 p-5">
									<div className="min-w-0 flex-1">
										<div className="flex flex-wrap items-center gap-3">
											<span className="font-mono text-sm font-semibold">
												{order.orderId}
											</span>
											<StatusBadge status={order.status} />
										</div>
										<p className="mt-1 text-sm text-ink-soft">
											{formatDate(order.createdAt)}, {order.items.length} item
											{order.items.length === 1 ? "" : "s"}
										</p>
									</div>

									<p className="text-lg font-semibold tnum">{formatPrice(order.total)}</p>

									<button
										onClick={() => setOpenId(isOpen ? null : order.orderId)}
										className="flex items-center gap-1 rounded-lg border border-line px-3 py-2 text-sm font-semibold hover:border-ink/30"
									>
										Details
										<LuChevronDown className={isOpen ? "rotate-180" : ""} />
									</button>
								</div>

								{isOpen && (
									<div className="border-t border-line bg-paper/60 p-5">
										<div className="grid gap-6 sm:grid-cols-2">
											<div>
												<h3 className="text-sm font-semibold">Items</h3>
												<div className="mt-3 flex flex-col gap-3">
													{order.items.map((item) => {
														return (
															<div key={item.productId} className="flex items-center gap-3">
																<div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-surface">
																	{item.image != null && (
																		<img
																			src={item.image}
																			alt=""
																			className="h-full w-full object-cover"
																		/>
																	)}
																</div>
																<div className="min-w-0 flex-1">
																	<Link
																		to={"/overview/" + item.productId}
																		className="block truncate text-sm font-semibold hover:text-accent"
																	>
																		{item.name}
																	</Link>
																	<p className="font-mono text-xs text-ink-soft">
																		{item.quantity} x {formatPrice(item.price)}
																	</p>
																</div>
															</div>
														);
													})}
												</div>
											</div>

											<div>
												<h3 className="text-sm font-semibold">Payment</h3>
												<dl className="mt-3 flex flex-col gap-2 text-sm">
													<div className="flex justify-between gap-4">
														<dt className="text-ink-soft">Gateway result</dt>
														<dd className="font-semibold">{order.payment.status}</dd>
													</div>
													{order.payment.transactionId != null && (
														<div className="flex justify-between gap-4">
															<dt className="text-ink-soft">Transaction</dt>
															<dd className="font-mono text-xs break-all">
																{order.payment.transactionId}
															</dd>
														</div>
													)}
													<div className="flex justify-between gap-4">
														<dt className="text-ink-soft">Attempts</dt>
														<dd className="tnum">{order.payment.attempts}</dd>
													</div>
													{order.refund.isRefunded && (
														<>
															<div className="flex justify-between gap-4">
																<dt className="text-ink-soft">Refund</dt>
																<dd className="font-mono text-xs break-all">
																	{order.refund.refundId}
																</dd>
															</div>
															<div className="flex justify-between gap-4">
																<dt className="text-ink-soft">Refunded</dt>
																<dd className="tnum">{formatPrice(order.refund.amount)}</dd>
															</div>
														</>
													)}
												</dl>
											</div>
										</div>

										<div className="mt-6">
											<h3 className="text-sm font-semibold">History</h3>
											<ol className="mt-3 flex flex-col gap-2 border-l border-line pl-4">
												{order.statusHistory.map((entry, index) => {
													return (
														<li key={index} className="relative text-sm">
															<span className="absolute top-1.5 -left-5.25 h-2 w-2 rounded-full bg-ink-soft" />
															<span className="font-semibold">{entry.status}</span>
															<span className="text-ink-soft"> {formatDate(entry.at)}</span>
															{entry.note !== "" && (
																<p className="text-ink-soft">{entry.note}</p>
															)}
														</li>
													);
												})}
											</ol>
										</div>

										<div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-5">
											{order.status === "Reserved" && (
												<Link
													to={"/checkout?orderId=" + order.orderId}
													className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
												>
													Finish paying
												</Link>
											)}

											{(order.status === "Reserved" || order.status === "Failed") && (
												<button
													onClick={() => cancelOrder(order)}
													disabled={isBusy}
													className="rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:border-bad hover:text-bad disabled:opacity-40"
												>
													Cancel order
												</button>
											)}

											{order.status === "Paid" && (
												<>
													<button
														onClick={() => cancelOrder(order)}
														disabled={isBusy}
														className="rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:border-bad hover:text-bad disabled:opacity-40"
													>
														Cancel and refund
													</button>
													<button
														onClick={() => refundOrder(order)}
														disabled={isBusy}
														className="rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:border-ink/30 disabled:opacity-40"
													>
														Refund only
													</button>
												</>
											)}

											{order.status === "Expired" && (
												<Link
													to="/products"
													className="rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:border-ink/30"
												>
													Shop these items again
												</Link>
											)}
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
