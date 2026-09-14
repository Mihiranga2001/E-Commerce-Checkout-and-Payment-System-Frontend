import { useEffect, useRef, useState } from "react";
import { formatCountdown } from "../utils/format";

const HOLD_LENGTH_MS = 5 * 60 * 1000;

/*
 * Shows how long the 5 minute stock hold has left and calls onExpire once.
 * Only "now" is kept in state and it is only written from the interval
 * callback, so nothing is set synchronously while the effect runs and the ref
 * is never touched during render.
 */
export default function ReservationTimer(props) {
	const expiresAt = props.expiresAt;
	const onExpire = props.onExpire;

	const [now, setNow] = useState(() => Date.now());

	// Remembers which deadline we already reported, so onExpire fires once per hold
	const firedForRef = useRef(null);

	useEffect(() => {
		const target = new Date(expiresAt).getTime();

		const interval = setInterval(() => {
			const current = Date.now();
			setNow(current);

			if (target - current <= 0 && firedForRef.current !== expiresAt) {
				firedForRef.current = expiresAt;

				if (onExpire != null) {
					onExpire();
				}
			}
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	}, [expiresAt, onExpire]);

	const remaining = new Date(expiresAt).getTime() - now;
	const ratio = Math.max(0, Math.min(1, remaining / HOLD_LENGTH_MS));
	const isUrgent = remaining <= 60 * 1000;

	return (
		<div>
			<div className="flex items-baseline justify-between gap-4">
				<p className="text-sm text-ink-soft">
					{remaining > 0
						? "Your items are held until payment or the clock runs out."
						: "The hold has ended and the stock went back on sale."}
				</p>
				<span
					className={
						"font-mono text-2xl font-semibold tnum " +
						(isUrgent ? "text-bad" : "text-hold")
					}
				>
					{formatCountdown(remaining)}
				</span>
			</div>
			<div className="mt-3 h-1.5 w-full rounded-full bg-line overflow-hidden">
				<div
					className={
						"h-full rounded-full transition-[width] duration-1000 ease-linear " +
						(isUrgent ? "bg-bad" : "bg-hold")
					}
					style={{ width: ratio * 100 + "%" }}
				/>
			</div>
		</div>
	);
}
