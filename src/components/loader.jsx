export default function Loader() {
	return (
		<div className="w-full py-24 flex justify-center items-center">
			<div className="w-10 h-10 rounded-full border-2 border-line border-t-accent animate-spin" />
		</div>
	);
}

export function Spinner(props) {
	const size = props.size == null ? "w-4 h-4" : props.size;

	return (
		<span
			className={
				size +
				" inline-block rounded-full border-2 border-white/40 border-t-white animate-spin align-[-2px]"
			}
		/>
	);
}
