import { Link } from "react-router-dom";

export default function EmptyState(props) {
	return (
		<div className="w-full rounded-2xl border border-line bg-surface px-8 py-16 text-center">
			<h2 className="text-xl">{props.title}</h2>
			<p className="mx-auto mt-2 max-w-md text-ink-soft">{props.message}</p>
			{props.actionLabel != null && (
				<Link
					to={props.actionTo}
					className="mt-6 inline-flex rounded-lg bg-accent px-5 py-2.5 font-semibold text-white transition-colors hover:bg-accent-dark"
				>
					{props.actionLabel}
				</Link>
			)}
		</div>
	);
}
