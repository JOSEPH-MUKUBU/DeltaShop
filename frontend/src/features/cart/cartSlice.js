import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "delta_cart";

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [], shippingAddress: null, paymentMethod: "cash" };
    const parsed = JSON.parse(raw);
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      shippingAddress: parsed.shippingAddress || null,
      paymentMethod: parsed.paymentMethod || "cash"
    };
  } catch {
    return { items: [], shippingAddress: null, paymentMethod: "cash" };
  }
}

function saveCart(state) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      items: state.items,
      shippingAddress: state.shippingAddress,
      paymentMethod: state.paymentMethod
    })
  );
}

const initial = loadCart();

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: initial.items,
    shippingAddress: initial.shippingAddress,
    paymentMethod: initial.paymentMethod
  },
  reducers: {
    addToCart(state, action) {
      const item = action.payload;
      const idx = state.items.findIndex((x) => x.productId === item.productId);
      if (idx >= 0) state.items[idx] = { ...state.items[idx], qty: state.items[idx].qty + item.qty };
      else state.items.push(item);
      saveCart(state);
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((x) => x.productId !== action.payload);
      saveCart(state);
    },
    setQty(state, action) {
      const { productId, qty } = action.payload;
      const it = state.items.find((x) => x.productId === productId);
      if (it) it.qty = Math.max(1, Number(qty));
      saveCart(state);
    },
    clearCart(state) {
      state.items = [];
      saveCart(state);
    },
    setShippingAddress(state, action) {
      state.shippingAddress = action.payload;
      saveCart(state);
    },
    setPaymentMethod(state, action) {
      state.paymentMethod = action.payload;
      saveCart(state);
    }
  }
});

export const { addToCart, removeFromCart, setQty, clearCart, setShippingAddress, setPaymentMethod } =
  cartSlice.actions;
export default cartSlice.reducer;

