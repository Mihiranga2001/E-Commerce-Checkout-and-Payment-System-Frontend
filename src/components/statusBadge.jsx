const STYLES = {
	Pending: "bg-paper text-ink-soft border-line",
	Reserved: "bg-hold-tint text-hold border-hold/30",
	Paid: "bg-good-tint text-good border-good/30",
	Refunded: "bg-surface text-accent border-accent/30",
	Cancelled: "bg-paper text-ink-soft border-line",
	Expired: "bg-paper text-ink-soft border-line",
	Failed: "bg-bad-tint text-bad border-bad/30",
};

export default function StatusBadge(props) {
	const status = props.status;
	const style = STYLES[status] == null ? STYLES.Pending : STYLES[status];

	return (
		<span
			className={
				"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold " +
				style
			}
		>
			<span className="w-1.5 h-1.5 rounded-full bg-current" />
			{status}
		</span>
	);
}
