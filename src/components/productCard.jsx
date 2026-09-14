import { Link } from "react-router-dom";
import { formatPrice } from "../utils/format";

export default function ProductCard(props) {
	const product = props.product;
	const available = product.availableStock;
	const isOut = available <= 0;
	const isLow = available > 0 && available <= 3;

	return (
		<Link
			to={"/overview/" + product.productId}
			className="group flex flex-col rounded-xl border border-line bg-surface transition-colors hover:border-ink/30"
		>
			<div className="aspect-4/3 w-full overflow-hidden rounded-t-xl bg-paper">
				<img
					src={product.images[0]}
					alt={product.name}
					loading="lazy"
					onError={(e) => {
						e.currentTarget.src = "/placeholder.svg";
					}}
					className={
						"h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] " +
						(isOut ? "opacity-45 saturate-0" : "")
					}
				/>
			</div>

			<div className="flex flex-1 flex-col gap-3 p-4">
				<div>
					<p className="text-xs text-ink-soft">{product.category}</p>
					<h3 className="mt-1 text-base leading-snug font-semibold">{product.name}</h3>
				</div>

				<div className="mt-auto flex items-end justify-between gap-3">
					<div>
						{product.labeledPrice > product.price && (
							<p className="text-xs text-ink-soft line-through tnum">
								{formatPrice(product.labeledPrice)}
							</p>
						)}
						<p className="text-lg font-semibold tnum">{formatPrice(product.price)}</p>
					</div>

					<p
						className={
							"text-xs font-semibold " +
							(isOut ? "text-ink-soft" : isLow ? "text-hold" : "text-good")
						}
					>
						{isOut
							? "Sold out"
							: isLow
							? "Only " + available + " left"
							: available + " in stock"}
					</p>
				</div>
			</div>
		</Link>
	);
}
