import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { LuCheck, LuTriangleAlert, LuClock, LuCopy } from "react-icons/lu";
import api, { isLoggedIn, getErrorMessage } from "../utils/api";
import { formatPrice, generateKey } from "../utils/format";
import ReservationTimer from "../components/reservationTimer";
import Loader, { Spinner } from "../components/loader";
import EmptyState from "../components/emptyState";

export default function CheckoutPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const [order, setOrder] = useState(null);
	const [phase, setPhase] = useState("creating");
	const outcome = "success";
	const [result, setResult] = useState(null);
	const [problem, setProblem] = useState(null);
	const requestRef = useRef(null);

	// One key per order. Reusing it is what makes a repeat click harmless.
	function getIdempotencyKey(orderId) {
		const storageKey = "payment-key:" + orderId;
		let key = localStorage.getItem(storageKey);

		if (key == null) {
			key = generateKey("PAY");
			localStorage.setItem(storageKey, key);
		}

		return key;
	}

	// Returns a description of what happened instead of setting state itself,
	// so every setState below happens inside a promise callback.
	const loadCheckout = useCallback(async () => {
		const existingOrderId = searchParams.get("orderId");

		try {
			if (existingOrderId != null) {
				const res = await api.get("/orders/" + existingOrderId);

				return {
					order: res.data,
					phase: res.data.status === "Reserved" ? "holding" : "result",
				};
			}

			// The same session id is reused on refresh, so one checkout can never
			// become two orders holding two sets of stock.
			let sessionId = localStorage.getItem("checkoutSessionId");

			if (sessionId == null) {
				sessionId = generateKey("CHK");
				localStorage.setItem("checkoutSessionId", sessionId);
			}

			const res = await api.post("/orders/checkout", { checkoutSessionId: sessionId });

			return {
				order: res.data.order,
				phase: "holding",
				notice: res.data.duplicate ? "Reusing the checkout you already started" : null,
			};
		} catch (error) {
			return { error: getErrorMessage(error, "Checkout could not be started") };
		}
	}, [searchParams]);

	useEffect(() => {
		if (!isLoggedIn()) {
			navigate("/login?next=/checkout");
			return;
		}

		let active = true;

		// The request is started once and kept in a ref. StrictMode remounts the
		// effect in development, and on that second run we re-attach to the same
		// promise instead of firing a second checkout or dropping the result.
		if (requestRef.current == null) {
			requestRef.current = loadCheckout();
		}

		requestRef.current.then((outcome) => {
			if (!active) {
				return;
			}

			if (outcome.error != null) {
				setProblem(outcome.error);
				setPhase("error");
				return;
			}

			setOrder(outcome.order);
			setPhase(outcome.phase);

			if (outcome.phase === "result") {
				setResult({ type: outcome.order.status.toLowerCase(), message: "" });
			}

			if (outcome.notice != null) {
				toast(outcome.notice);
			}
		});

		return () => {
			active = false;
		};
	}, [navigate, loadCheckout]);

	function applyOutcome(data, paymentStatus) {
		if (data != null && data.order != null) {
			setOrder(data.order);
		}

		if (paymentStatus === "SUCCESS") {
			localStorage.removeItem("checkoutSessionId");
			setResult({ type: "paid", message: data.message });
		} else if (paymentStatus === "FAILED") {
			localStorage.removeItem("checkoutSessionId");
			setResult({ type: "failed", message: data.message });
		} else if (paymentStatus === "TIMEOUT") {
			localStorage.removeItem("checkoutSessionId");
			setResult({ type: "timeout", message: data.message });
		} else if (paymentStatus === "DUPLICATE") {
			setResult({ type: "duplicate", message: data.message });
		} else {
			setResult({ type: "expired", message: data.message });
		}

		setPhase("result");
	}

	async function pay() {
		setPhase("paying");

		try {
			const res = await api.post("/orders/" + order.orderId + "/pay", {
				outcome: outcome,
				idempotencyKey: getIdempotencyKey(order.orderId),
			});

			if (res.data.duplicate) {
				applyOutcome(res.data, "DUPLICATE");
				return;
			}

			applyOutcome(res.data, "SUCCESS");
			toast.success("Payment approved");
		} catch (error) {
			const status = error.response == null ? 0 : error.response.status;
			const data = error.response == null ? {} : error.response.data;

			if (status === 402) {
				applyOutcome(data, "FAILED");
			} else if (status === 504) {
				applyOutcome(data, "TIMEOUT");
			} else if (status === 409) {
				applyOutcome(data, "DUPLICATE");
			} else if (status === 410) {
				applyOutcome(data, "EXPIRED");
			} else {
				setProblem(getErrorMessage(error, "The payment could not be sent"));
				setPhase("holding");
			}
		}
	}

	// Fires two identical payments at the same instant, the way a double click would.
	async function payTwiceAtOnce() {
		setPhase("paying");

		const key = getIdempotencyKey(order.orderId);
		const request = () => {
			return api.post("/orders/" + order.orderId + "/pay", {
				outcome: outcome,
				idempotencyKey: key,
			});
		};

		const results = await Promise.allSettled([request(), request()]);

		const accepted = results.filter((item) => {
			return item.status === "fulfilled" && !item.value.data.duplicate;
		});

		toast.success(
			accepted.length === 1
				? "Two requests sent, one charge taken. The duplicate was rejected."
				: "Two requests sent, no double charge was created."
		);

		try {
			const res = await api.get("/orders/" + order.orderId);
			setOrder(res.data);
			setResult({
				type: res.data.status === "Paid" ? "paid" : res.data.status.toLowerCase(),
				message: "Only one of the two requests reached the gateway.",
			});
			setPhase("result");
		} catch {
			setPhase("holding");
		}
	}

	async function cancelHold() {
		try {
			const res = await api.post("/orders/" + order.orderId + "/cancel");
			localStorage.removeItem("checkoutSessionId");
			setOrder(res.data.order);
			setResult({ type: "cancelled", message: res.data.message });
			setPhase("result");
			toast.success("Checkout cancelled, stock released");
		} catch (error) {
			toast.error(getErrorMessage(error, "Could not cancel this checkout"));
		}
	}

	const handleExpiry = useCallback(() => {
		localStorage.removeItem("checkoutSessionId");
		setResult({
			type: "expired",
			message: "The five minute hold ended, so your items went back on sale.",
		});
		setPhase("result");
	}, []);

	if (phase === "creating") {
		return <Loader />;
	}

	if (phase === "error") {
		return (
			<div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
				<h1 className="mb-6 text-3xl">Checkout</h1>
				<EmptyState
					title="Checkout didn't start"
					message={problem}
					actionLabel="Back to cart"
					actionTo="/cart"
				/>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
			<h1 className="text-3xl">Checkout</h1>
			<p className="mt-1 font-mono text-sm text-ink-soft">{order.orderId}</p>

			<div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
				<div className="flex flex-col gap-6">
					{phase !== "result" && (
						<section className="rounded-2xl border border-hold/30 bg-hold-tint p-6">
							<div className="mb-4 flex items-center gap-2 text-hold">
								<LuClock />
								<h2 className="text-base text-hold">Stock is held for you</h2>
							</div>
							<ReservationTimer
								expiresAt={order.reservationExpiresAt}
								onExpire={handleExpiry}
							/>
						</section>
					)}

					{phase === "result" && <ResultPanel result={result} order={order} />}

					{phase !== "result" && (
						<section className="rounded-2xl border border-line bg-surface p-6">
							<h2 className="text-base">Pay with MockPay</h2>
							<p className="mt-1 text-sm text-ink-soft">
								No real card is charged. Pick how you want the gateway to behave so every
								path can be tested.
							</p>

							<button
								onClick={pay}
								disabled={phase === "paying"}
								className="mt-5 w-full rounded-lg bg-accent py-3 font-semibold text-white transition-colors hover:bg-accent-dark disabled:bg-ink-soft"
							>
								{phase === "paying" ? (
									<span className="flex items-center justify-center gap-2">
										<Spinner /> Contacting the gateway
									</span>
								) : (
									"Pay " + formatPrice(order.total)
								)}
							</button>

							<div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
								<div>
									<button
										onClick={payTwiceAtOnce}
										disabled={phase === "paying"}
										className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink disabled:opacity-40"
									>
										<LuCopy /> Send the payment twice at once
									</button>
									<p className="mt-1 text-xs text-ink-soft">
										Simulates a double click. One charge goes through, the other is
										rejected.
									</p>
								</div>
								<button
									onClick={cancelHold}
									disabled={phase === "paying"}
									className="text-sm font-semibold text-ink-soft hover:text-bad disabled:opacity-40"
								>
									Cancel and release stock
								</button>
							</div>
						</section>
					)}
				</div>

				<aside className="h-fit rounded-2xl border border-line bg-surface p-6 lg:sticky lg:top-24">
					<h2 className="text-base">Order summary</h2>

					<div className="mt-4 flex flex-col gap-4">
						{order.items.map((item) => {
							return (
								<div key={item.productId} className="flex gap-3">
									<div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-paper">
										{item.image != null && (
											<img src={item.image} alt="" className="h-full w-full object-cover" />
										)}
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-semibold">{item.name}</p>
										<p className="font-mono text-xs text-ink-soft">
											{item.quantity} x {formatPrice(item.price)}
										</p>
									</div>
									<p className="text-sm font-semibold tnum">
										{formatPrice(item.price * item.quantity)}
									</p>
								</div>
							);
						})}
					</div>

					<div className="mt-5 flex items-end justify-between border-t border-line pt-4">
						<span className="font-semibold">Total</span>
						<span className="text-xl font-semibold tnum">{formatPrice(order.total)}</span>
					</div>

					{order.payment != null && order.payment.transactionId != null && (
						<p className="mt-4 font-mono text-xs break-all text-ink-soft">
							{order.payment.transactionId}
						</p>
					)}
				</aside>
			</div>
		</div>
	);
}

function ResultPanel(props) {
	const result = props.result;
	const order = props.order;

	const VIEWS = {
		paid: {
			tone: "border-good/30 bg-good-tint text-good",
			icon: <LuCheck />,
			title: "Payment approved",
			body: "Your order is confirmed and the stock has left our inventory.",
			primary: { to: "/orders", label: "View your orders" },
		},
		failed: {
			tone: "border-bad/30 bg-bad-tint text-bad",
			icon: <LuTriangleAlert />,
			title: "Payment declined",
			body: "Nothing was charged and your items went straight back on sale. You can start a new checkout and try again.",
			primary: { to: "/cart", label: "Back to cart" },
		},
		timeout: {
			tone: "border-hold/30 bg-hold-tint text-hold",
			icon: <LuClock />,
			title: "The gateway never answered",
			body: "We released the hold rather than leave your items locked. No charge was made, so you can safely retry.",
			primary: { to: "/cart", label: "Try checkout again" },
		},
		expired: {
			tone: "border-line bg-paper text-ink",
			icon: <LuClock />,
			title: "The hold ran out",
			body: "Five minutes passed without a payment, so your items returned to the shop.",
			primary: { to: "/cart", label: "Start over" },
		},
		cancelled: {
			tone: "border-line bg-paper text-ink",
			icon: <LuCheck />,
			title: "Checkout cancelled",
			body: "Your reserved items are back on sale. Nothing was charged.",
			primary: { to: "/products", label: "Keep shopping" },
		},
		duplicate: {
			tone: "border-accent/30 bg-accent/5 text-accent",
			icon: <LuCopy />,
			title: "Duplicate payment rejected",
			body: "This order already had a payment attempt, so the repeat request was ignored instead of charging again.",
			primary: { to: "/orders", label: "View your orders" },
		},
	};

	const view = VIEWS[result.type] == null ? VIEWS.expired : VIEWS[result.type];

	return (
		<section className={"rounded-2xl border p-8 " + view.tone}>
			<div className="flex items-center gap-2 text-xl">{view.icon}</div>
			<h2 className="mt-3 text-2xl text-current">{view.title}</h2>
			<p className="mt-2 max-w-lg text-ink">{result.message ? result.message : view.body}</p>

			<div className="mt-6 flex flex-wrap items-center gap-3">
				<Link
					to={view.primary.to}
					className="rounded-lg bg-ink px-5 py-2.5 font-semibold text-white transition-colors hover:bg-accent"
				>
					{view.primary.label}
				</Link>
				<Link
					to="/products"
					className="rounded-lg border border-ink/15 px-5 py-2.5 font-semibold text-ink"
				>
					Keep shopping
				</Link>
			</div>

			<dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-xs">
				<div>
					<dt className="text-ink-soft">Order</dt>
					<dd className="font-mono">{order.orderId}</dd>
				</div>
				<div>
					<dt className="text-ink-soft">Status</dt>
					<dd className="font-mono">{order.status}</dd>
				</div>
				{order.payment != null && order.payment.transactionId != null && (
					<div>
						<dt className="text-ink-soft">Transaction</dt>
						<dd className="font-mono break-all">{order.payment.transactionId}</dd>
					</div>
				)}
			</dl>
		</section>
	);
}
