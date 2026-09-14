import api from "./api";

/*
 * The cart lives on the server (one cart per user), not in localStorage,
 * because checkout reserves real stock against it.
 * Every mutation fires a "cart-updated" event so the header badge stays in sync.
 */

function announceChange() {
	window.dispatchEvent(new Event("cart-updated"));
}

export async function fetchCart() {
	const res = await api.get("/cart");
	return res.data;
}

export async function addToCart(productId, quantity) {
	const res = await api.post("/cart", {
		productId: productId,
		quantity: quantity,
	});
	announceChange();
	return res.data.cart;
}

export async function updateCartItem(productId, quantity) {
	const res = await api.put("/cart/" + productId, { quantity: quantity });
	announceChange();
	return res.data.cart;
}

export async function removeFromCart(productId) {
	const res = await api.delete("/cart/" + productId);
	announceChange();
	return res.data.cart;
}

export async function clearCart() {
	const res = await api.delete("/cart/clear");
	announceChange();
	return res.data.cart;
}
