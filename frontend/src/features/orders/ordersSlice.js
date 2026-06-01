import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../lib/api";

export const createOrder = createAsyncThunk("orders/create", async (payload) => {
  const { data } = await api.post("/api/orders", payload);
  return data;
});

export const fetchMyOrders = createAsyncThunk("orders/mine", async () => {
  const { data } = await api.get("/api/orders/mine");
  return data;
});

export const fetchOrder = createAsyncThunk("orders/get", async (orderId) => {
  const { data } = await api.get(`/api/orders/${orderId}`);
  return data;
});

const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    current: null,
    mine: [],
    status: "idle",
    error: null
  },
  reducers: {
    clearOrder(state) {
      state.current = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload.order;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error?.message || "Erreur création commande";
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.mine = action.payload.orders;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.current = action.payload.order;
      });
  }
});

export const { clearOrder } = ordersSlice.actions;
export default ordersSlice.reducer;

