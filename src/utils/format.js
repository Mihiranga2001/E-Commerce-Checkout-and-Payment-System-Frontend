const currencyFormatter = new Intl.NumberFormat("en-LK", {
	style: "currency",
	currency: "LKR",
	minimumFractionDigits: 2,
});

export function formatPrice(value) {
	if (value == null || isNaN(value)) {
		return currencyFormatter.format(0);
	}
	return currencyFormatter.format(value);
}

export function formatDate(value) {
	if (value == null) {
		return "";
	}

	return new Date(value).toLocaleString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

// milliseconds -> "04:37"
export function formatCountdown(milliseconds) {
	const safe = milliseconds > 0 ? milliseconds : 0;
	const totalSeconds = Math.floor(safe / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	return (
		String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0")
	);
}

export function generateKey(prefix) {
	return (
		prefix +
		"-" +
		Date.now().toString(36).toUpperCase() +
		"-" +
		Math.random().toString(36).slice(2, 8).toUpperCase()
	);
}
