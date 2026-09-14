import { Route, Routes } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import Home from "./homeContent";
import ProductPage from "./productPage";
import ProductOverview from "./productOverview";
import CartPage from "./cart";
import CheckoutPage from "./checkOut";
import OrdersPage from "./ordersPage";
import EmptyState from "../components/emptyState";

export default function HomePage() {
	return (
		<div className="flex min-h-screen flex-col">
			<Header />
			<main className="flex-1">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/products" element={<ProductPage />} />
					<Route path="/overview/:productId" element={<ProductOverview />} />
					<Route path="/cart" element={<CartPage />} />
					<Route path="/checkout" element={<CheckoutPage />} />
					<Route path="/orders" element={<OrdersPage />} />
					<Route
						path="/*"
						element={
							<div className="mx-auto max-w-3xl px-4 py-20 lg:px-8">
								<EmptyState
									title="That page doesn't exist"
									message="The link may be old or mistyped. The shop is a good place to restart."
									actionLabel="Browse products"
									actionTo="/products"
								/>
							</div>
						}
					/>
				</Routes>
			</main>
			<Footer />
		</div>
	);
}
